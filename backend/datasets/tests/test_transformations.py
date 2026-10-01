from types import SimpleNamespace

import pandas as pd
from django.test import SimpleTestCase

from datasets.services.transformations import (
    apply_transformations,
)


class TransformationTests(SimpleTestCase):
    def setUp(self):
        self.df = pd.DataFrame(
            {
                "name": [
                    "Alice",
                    "Bob",
                    "Charlie",
                ],
                "country": [
                    "Germany",
                    None,
                    "Japan",
                ],
                "score": [
                    10,
                    20,
                    30,
                ],
            }
        )

    def transformation(
        self,
        type_,
        config,
    ):
        return SimpleNamespace(
            type=type_,
            config=config,
        )

    def test_fill_missing(self):
        transformations = [
            self.transformation(
                "fill_missing",
                {
                    "column": "country",
                    "value": "Unknown",
                },
            )
        ]

        result = apply_transformations(
            self.df,
            transformations,
        )

        self.assertEqual(
            result["country"].tolist(),
            [
                "Germany",
                "Unknown",
                "Japan",
            ],
        )

    def test_rename_column(self):
        transformations = [
            self.transformation(
                "rename_column",
                {
                    "column": "score",
                    "new_name": "points",
                },
            )
        ]

        result = apply_transformations(
            self.df,
            transformations,
        )

        self.assertIn(
            "points",
            result.columns,
        )

        self.assertNotIn(
            "score",
            result.columns,
        )

    def test_replace_value(self):
        transformations = [
            self.transformation(
                "replace_value",
                {
                    "column": "country",
                    "old_value": "Germany",
                    "new_value": "DE",
                },
            )
        ]

        result = apply_transformations(
            self.df,
            transformations,
        )

        self.assertEqual(
            result["country"].iloc[0],
            "DE",
        )

    def test_delete_column(self):
        transformations = [
            self.transformation(
                "delete_column",
                {
                    "column": "score",
                },
            )
        ]

        result = apply_transformations(
            self.df,
            transformations,
        )

        self.assertNotIn(
            "score",
            result.columns,
        )

    def test_transformations_are_applied_in_order(self):
        transformations = [
            self.transformation(
                "rename_column",
                {
                    "column": "score",
                    "new_name": "points",
                },
            ),
            self.transformation(
                "replace_value",
                {
                    "column": "points",
                    "old_value": 20,
                    "new_value": 99,
                },
            ),
        ]

        result = apply_transformations(
            self.df,
            transformations,
        )

        self.assertEqual(
            result["points"].tolist(),
            [
                10,
                99,
                30,
            ],
        )

    def test_original_dataframe_is_not_modified(self):
        transformations = [
            self.transformation(
                "delete_column",
                {
                    "column": "score",
                },
            )
        ]

        apply_transformations(
            self.df,
            transformations,
        )

        self.assertIn(
            "score",
            self.df.columns,
        )