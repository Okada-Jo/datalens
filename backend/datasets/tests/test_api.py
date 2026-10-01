from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase
from rest_framework.test import APIClient

from datasets.models import (
    Dataset,
    Transformation,
)


class DatasetApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.dataset = Dataset.objects.create(
            name="sales",
            original_filename="sales.csv",
            file=SimpleUploadedFile(
                "sales.csv",
                (
                    b"country,revenue\n"
                    b"Germany,10\n"
                    b"Germany,20\n"
                    b"Japan,30\n"
                ),
                content_type="text/csv",
            ),
            file_size=54,
            status=Dataset.Status.READY,
        )

    def test_csv_export(self):
        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/export/",
            {
                "type": "csv",
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response["Content-Type"],
            "text/csv",
        )

        self.assertIn(
            'filename="sales.csv"',
            response["Content-Disposition"],
        )

    def test_json_export(self):
        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/export/",
            {
                "type": "json",
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        self.assertEqual(
            response["Content-Type"],
            "application/json",
        )

    def test_chart_endpoint(self):
        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/chart/",
            {
                "x": "country",
                "y": "revenue",
                "aggregation": "sum",
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

        body = response.json()

        self.assertEqual(
            body["aggregation"],
            "sum",
        )

        values = {
            point["x"]: point["y"]
            for point in body["data"]
        }

        self.assertEqual(
            values["Germany"],
            30,
        )

        self.assertEqual(
            values["Japan"],
            30,
        )

    def test_chart_count_does_not_require_y(self):
        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/chart/",
            {
                "x": "country",
                "aggregation": "count",
            },
        )

        self.assertEqual(
            response.status_code,
            200,
        )

    def test_chart_requires_x(self):
        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/chart/",
            {
                "y": "revenue",
                "aggregation": "sum",
            },
        )

        self.assertEqual(
            response.status_code,
            400,
        )

    def test_export_contains_transformed_columns(self):
        Transformation.objects.create(
            dataset=self.dataset,
            type="rename_column",
            config={
                "column": "revenue",
                "new_name": "sales",
            },
            position=1,
        )

        response = self.client.get(
            f"/api/datasets/{self.dataset.id}/export/",
            {
                "type": "csv",
            },
        )

        content = response.content.decode(
            "utf-8",
        )

        header = content.splitlines()[0]

        self.assertEqual(
            header,
            "country,sales",
        )