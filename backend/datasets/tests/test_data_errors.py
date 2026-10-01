import json
from pathlib import Path
from tempfile import TemporaryDirectory

import pandas as pd
from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, override_settings
from rest_framework.test import APIClient

from datasets.models import Dataset, Transformation
from datasets.services.query import apply_sort


class DataErrorTests(TestCase):
    def setUp(self):
        directory = TemporaryDirectory()
        self.addCleanup(directory.cleanup)
        settings = override_settings(MEDIA_ROOT=directory.name)
        settings.enable()
        self.addCleanup(settings.disable)
        self.client = APIClient()
        self.dataset = Dataset.objects.create(
            name="mixed", original_filename="mixed.csv",
            file=SimpleUploadedFile("mixed.csv", b"country,amount,score\nGermany,10,2\nFrance,unknown,3\nSpain,20,\n"),
            file_size=68,
        )
        self.base = f"/api/datasets/{self.dataset.pk}/"

    def test_chart_reports_non_numeric_column_and_recovery(self):
        for aggregation in ["sum", "average"]:
            response = self.client.get(self.base + "chart/", {"x": "country", "y": "amount", "aggregation": aggregation})
            self.assertEqual(response.status_code, 400)
            self.assertIn("amount", response.json()["detail"])
            self.assertIn("1 non-numeric", response.json()["detail"])
            self.assertIn("Count", response.json()["detail"])
        self.assertEqual(self.client.get(self.base + "chart/", {"x": "country", "aggregation": "count"}).status_code, 200)

    def test_text_comparison_identifies_column_and_fix(self):
        response = self.client.get(self.base + "rows/", {"filters": json.dumps([{"column": "amount", "operator": "gt", "value": "10"}])})
        self.assertEqual(response.status_code, 400)
        self.assertIn("amount", response.json()["detail"])
        self.assertIn("mixed data types", response.json()["detail"])
        self.assertIn("contains or equals", response.json()["detail"])

    def test_invalid_numeric_filter_identifies_column(self):
        for value in ["hello", "Infinity", "NaN"]:
            response = self.client.get(self.base + "rows/", {"filters": json.dumps([{"column": "score", "operator": "gt", "value": value}])})
            self.assertEqual(response.status_code, 400)
            self.assertIn("score", response.json()["detail"])
            self.assertIn("number", response.json()["detail"])

    def test_mixed_type_sort_reports_column_and_fix(self):
        with self.assertRaisesMessage(ValueError, "Cannot sort column 'amount'"):
            apply_sort(pd.DataFrame({"amount": [2, "unknown", 1]}), "amount", "asc")

    def test_broken_transformation_explains_how_to_recover(self):
        Transformation.objects.create(dataset=self.dataset, type="rename_column", config={"column": "absent", "new_name": "new"}, position=1)
        for endpoint in ["rows/", "chart/?x=country&aggregation=count"]:
            response = self.client.get(self.base + endpoint)
            self.assertEqual(response.status_code, 400)
            self.assertIn("absent", response.json()["detail"])
            self.assertIn("undo this step in Clean", response.json()["detail"])

    def test_empty_numeric_chart_explains_alternative(self):
        Path(self.dataset.file.path).write_text("country,amount\nGermany,\nFrance,\n")
        response = self.client.get(self.base + "chart/", {"x": "country", "y": "amount", "aggregation": "sum"})
        self.assertEqual(response.status_code, 400)
        self.assertIn("no numeric values", response.json()["detail"])
        self.assertIn("Count", response.json()["detail"])
