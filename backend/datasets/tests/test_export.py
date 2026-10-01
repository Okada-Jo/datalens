from types import SimpleNamespace
import os

import pandas as pd
from django.test import SimpleTestCase

from datasets.services.export import build_export_dataframe


class ExportTests(SimpleTestCase):
    def setUp(self):
        self.file_path = "test-export.csv"

        pd.DataFrame(
            {
                "product": [
                    "Mouse",
                    "Keyboard",
                ],
                "price": [
                    20,
                    50,
                ],
                "country": [
                    "Germany",
                    "Japan",
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

    def test_builds_dataframe_from_csv(self):
        result = build_export_dataframe(
            self.file_path,
            [],
        )

        self.assertEqual(
            len(result),
            2,
        )

        self.assertEqual(
            result.columns.tolist(),
            [
                "product",
                "price",
                "country",
            ],
        )

    def test_applies_transformations(self):
        transformations = [
            self.transformation(
                "rename_column",
                {
                    "column": "price",
                    "new_name": "revenue",
                },
            ),
            self.transformation(
                "delete_column",
                {
                    "column": "country",
                },
            ),
        ]

        result = build_export_dataframe(
            self.file_path,
            transformations,
        )

        self.assertEqual(
            result.columns.tolist(),
            [
                "product",
                "revenue",
            ],
        )

        self.assertEqual(
            result["revenue"].tolist(),
            [
                20,
                50,
            ],
        )

    def test_does_not_modify_source_csv(self):
        transformations = [
            self.transformation(
                "delete_column",
                {
                    "column": "price",
                },
            )
        ]

        build_export_dataframe(
            self.file_path,
            transformations,
        )

        original = pd.read_csv(
            self.file_path,
        )

        self.assertIn(
            "price",
            original.columns,
        )