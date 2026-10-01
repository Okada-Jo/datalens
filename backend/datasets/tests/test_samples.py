from datetime import timedelta
from hashlib import sha256
from pathlib import Path
from tempfile import TemporaryDirectory

from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from datasets.models import Dataset
from datasets.services.retention import delete_expired_datasets
from datasets.services.samples import SAMPLE_ROOT, sample_catalog


class SampleDatasetTests(TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        settings = override_settings(MEDIA_ROOT=directory.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.client = APIClient()

    def open_sample(self, slug):
        response = self.client.post(f"/api/datasets/samples/{slug}/use/")
        self.assertEqual(response.status_code, 201, response.content)
        return response.json()

    def test_catalog_is_read_only_and_matches_bundled_files(self):
        response = self.client.get("/api/datasets/samples/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 5)
        self.assertFalse(Dataset.objects.exists())
        for sample in response.json():
            self.assertEqual((SAMPLE_ROOT / f"{sample['id']}.csv").stat().st_size, sample["fileSize"])
            self.assertGreaterEqual(sample["rowCount"], 12000)

    def test_every_sample_supports_analysis_rows_charts_and_export(self):
        for sample in sample_catalog():
            with self.subTest(sample=sample["id"]):
                dataset = self.open_sample(sample["id"])
                self.assertEqual(dataset["status"], "ready")
                self.assertEqual(dataset["name"], sample["name"])
                self.assertEqual(dataset["rowCount"], sample["rowCount"])
                self.assertEqual(dataset["columnCount"], sample["columnCount"])
                self.assertTrue(any(c["missing_count"] > 0 for c in dataset["analysis"]["columns"]))
                record = Dataset.objects.get(pk=dataset["id"])
                self.assertEqual(record.expires_at - record.created_at, timedelta(hours=24))
                base = f"/api/datasets/{dataset['id']}/"
                self.assertEqual(self.client.get(base + "rows/").status_code, 200)
                category = dataset["analysis"]["columns"][2]["name"]
                self.assertEqual(self.client.get(base + "chart/", {"x": category, "aggregation": "count"}).status_code, 200)
                self.assertEqual(self.client.get(base + "export/").status_code, 200)

    def test_edits_and_expiry_do_not_change_templates_or_other_copies(self):
        template = SAMPLE_ROOT / "retail.csv"
        digest = sha256(template.read_bytes()).digest()
        first, second = self.open_sample("retail"), self.open_sample("retail")
        self.assertNotEqual(first["id"], second["id"])
        first_record = Dataset.objects.get(pk=first["id"])
        second_record = Dataset.objects.get(pk=second["id"])
        self.assertNotEqual(first_record.file.name, second_record.file.name)
        response = self.client.post(f"/api/datasets/{first['id']}/transformations/", {
            "type": "rename_column", "config": {"column": "country", "new_name": "market"},
        }, format="json")
        self.assertEqual(response.status_code, 201)
        exported = self.client.get(f"/api/datasets/{first['id']}/export/").content.decode().splitlines()[0]
        self.assertIn("market", exported)
        self.assertNotIn("country", exported)
        self.assertFalse(second_record.transformations.exists())
        Dataset.objects.filter(pk=first["id"]).update(created_at=timezone.now() - timedelta(hours=25))
        delete_expired_datasets()
        self.assertFalse(Path(first_record.file.path).exists())
        self.assertTrue(Path(second_record.file.path).exists())
        self.assertEqual(sha256(template.read_bytes()).digest(), digest)
        self.assertEqual(self.open_sample("retail")["status"], "ready")

    def test_unknown_sample_is_rejected_without_creating_dataset(self):
        self.assertEqual(self.client.post("/api/datasets/samples/unknown/use/").status_code, 404)
        self.assertFalse(Dataset.objects.exists())

    def test_get_cannot_create_sample(self):
        self.assertEqual(self.client.get("/api/datasets/samples/retail/use/").status_code, 405)
        self.assertFalse(Dataset.objects.exists())
