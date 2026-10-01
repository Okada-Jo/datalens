from types import SimpleNamespace
import os

import pandas as pd
from django.test import SimpleTestCase

from datasets.services.chart import build_chart_data


class ChartTests(SimpleTestCase):
    def setUp(self):
        self.file_path = "test-chart.csv"

        pd.DataFrame(
            {
                "country": [
                    "Germany",
                    "Germany",
                    "Japan",
                    "Japan",
                    "Japan",
                ],
                "revenue": [
                    10,
                    20,
                    5,
                    15,
                    30,
                ],
            }
        ).to_csv(
            self.file_path,
            index=False,
        )

    def tearDown(self):
        if os.path.exists(self.file_path):
            os.remove(self.file_path)

    def transformation(
        self,
        type_,
        config,
    ):
        return SimpleNamespace(
            type=type_,
            config=config,
        )

    def test_sum_aggregation(self):
        result = build_chart_data(
            self.file_path,
            [],
            "country",
            "revenue",
            "sum",
        )

        values = {
            point["x"]: point["y"]
            for point in result["data"]
        }

        self.assertEqual(
            values["Germany"],
            30,
        )

        self.assertEqual(
            values["Japan"],
            50,
        )

    def test_average_aggregation(self):
        result = build_chart_data(
            self.file_path,
            [],
            "country",
            "revenue",
            "average",
        )

        values = {
            point["x"]: point["y"]
            for point in result["data"]
        }

        self.assertEqual(
            values["Germany"],
            15,
        )

        self.assertEqual(
            values["Japan"],
            50 / 3,
        )

    def test_count_aggregation(self):
        result = build_chart_data(
            self.file_path,
            [],
            "country",
            None,
            "count",
        )

        values = {
            point["x"]: point["y"]
            for point in result["data"]
        }

        self.assertEqual(
            values,
            {
                "Germany": 2,
                "Japan": 3,
            },
        )

    def test_applies_transformations_before_charting(self):
        transformations = [
            self.transformation(
                "rename_column",
                {
                    "column": "revenue",
                    "new_name": "sales",
                },
            )
        ]

        result = build_chart_data(
            self.file_path,
            transformations,
            "country",
            "sales",
            "sum",
        )

        self.assertEqual(
            result["y"],
            "sales",
        )

        values = {
            point["x"]: point["y"]
            for point in result["data"]
        }

        self.assertEqual(
            values["Germany"],
            30,
        )

    def test_invalid_x_column_raises_error(self):
        with self.assertRaises(ValueError):
            build_chart_data(
                self.file_path,
                [],
                "does_not_exist",
                "revenue",
                "sum",
            )

    def test_invalid_y_column_raises_error(self):
        with self.assertRaises(ValueError):
            build_chart_data(
                self.file_path,
                [],
                "country",
                "does_not_exist",
                "sum",
            )

    def test_invalid_aggregation_raises_error(self):
        with self.assertRaises(ValueError):
            build_chart_data(
                self.file_path,
                [],
                "country",
                "revenue",
                "banana",
            )

    def test_non_numeric_y_raises_error(self):
        pd.DataFrame(
            {
                "country": [
                    "Germany",
                    "Japan",
                ],
                "product": [
                    "Mouse",
                    "Keyboard",
                ],
            }
        ).to_csv(
            self.file_path,
            index=False,
        )

        with self.assertRaises(ValueError):
            build_chart_data(
                self.file_path,
                [],
                "country",
                "product",
                "sum",
            )