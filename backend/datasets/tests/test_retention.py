from datetime import timedelta
from pathlib import Path
from tempfile import TemporaryDirectory
from unittest.mock import patch

from django.core.files.uploadedfile import SimpleUploadedFile
from django.core.management import call_command
from django.test import TestCase, override_settings
from django.db import transaction
from django.utils import timezone
from rest_framework.test import APIClient

from datasets.models import Dataset, Transformation
from datasets.services.retention import delete_expired_datasets


class RetentionTests(TestCase):
    def setUp(self):
        self.directory = TemporaryDirectory()
        self.addCleanup(self.directory.cleanup)
        settings = override_settings(MEDIA_ROOT=self.directory.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.dataset = Dataset.objects.create(
            name="sample", original_filename="sample.csv",
            file=SimpleUploadedFile("sample.csv", b"a,b\n1,2\n"), file_size=8,
        )
        self.path = Path(self.dataset.file.path)
        self.now = timezone.now()

    def age(self, delta):
        Dataset.objects.filter(pk=self.dataset.pk).update(created_at=self.now - delta)

    def test_exact_boundary_deletes_file_metadata_and_transformations(self):
        self.age(timedelta(hours=24))
        Transformation.objects.create(dataset=self.dataset, type="delete_column", config={"column": "a"}, position=1)
        with patch("datasets.services.retention.timezone.now", return_value=self.now):
            self.assertEqual(delete_expired_datasets(), 1)
        self.assertFalse(self.path.exists())
        self.assertFalse(Dataset.objects.exists())
        self.assertFalse(Transformation.objects.exists())
        self.assertEqual(delete_expired_datasets(), 0)

    def test_unexpired_upload_is_preserved(self):
        self.age(timedelta(hours=24) - timedelta(seconds=1))
        with patch("datasets.services.retention.timezone.now", return_value=self.now):
            self.assertEqual(delete_expired_datasets(), 0)
        self.assertTrue(self.path.exists())

    def test_api_blocks_expired_dataset_actions(self):
        self.age(timedelta(hours=25))
        client = APIClient()
        for suffix in ["", "rows/", "export/", "chart/", "transformations/"]:
            self.assertEqual(client.get(f"/api/datasets/{self.dataset.pk}/{suffix}").status_code, 404)
        self.assertEqual(client.get("/api/datasets/").json(), [])
        self.assertFalse(self.path.exists())

    def test_expiry_serialized_and_not_extended_by_edits(self):
        client = APIClient()
        first = client.get(f"/api/datasets/{self.dataset.pk}/").json()["expiresAt"]
        client.patch(f"/api/datasets/{self.dataset.pk}/", {"name": "renamed"}, format="json")
        self.assertEqual(client.get(f"/api/datasets/{self.dataset.pk}/").json()["expiresAt"], first)

    def test_explicit_delete_removes_file(self):
        self.dataset.delete()
        self.assertFalse(self.path.exists())

    def test_command_cleans_failed_uploads(self):
        self.age(timedelta(hours=25))
        Dataset.objects.filter(pk=self.dataset.pk).update(status="failed")
        call_command("cleanup_datasets")
        self.assertFalse(self.path.exists())

    def test_storage_failure_keeps_record_for_retry(self):
        self.age(timedelta(hours=25))
        with patch("django.core.files.storage.FileSystemStorage.delete", side_effect=OSError("offline")):
            with self.assertRaises(OSError), transaction.atomic():
                delete_expired_datasets()
        self.assertTrue(Dataset.objects.filter(pk=self.dataset.pk).exists())
