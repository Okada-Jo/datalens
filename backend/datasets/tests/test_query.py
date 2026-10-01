from types import SimpleNamespace

import pandas as pd
from django.test import SimpleTestCase

from datasets.services.query import query_dataset


class QueryDatasetTests(SimpleTestCase):
    def setUp(self):
        self.df = pd.DataFrame(
            {
                "name": [
                    "Alice",
                    "Bob",
                    "Charlie",
                    "David",
                ],
                "country": [
                    "Germany",
                    "Japan",
                    "Germany",
                    "France",
                ],
                "score": [
                    30,
                    10,
                    40,
                    20,
                ],
            }
        )

        self.file_path = "test-query.csv"
        self.df.to_csv(
            self.file_path,
            index=False,
        )

    def tearDown(self):
        import os

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

    def query(self, **overrides):
        params = {
            "file_path": self.file_path,
            "page": 1,
            "page_size": 10,
            "search": "",
            "filters": [],
            "sort_column": None,
            "sort_direction": None,
            "transformations": [],
        }

        params.update(overrides)

        return query_dataset(**params)

    def test_returns_rows(self):
        result = self.query()

        self.assertEqual(
            result["totalRows"],
            4,
        )

        self.assertEqual(
            len(result["rows"]),
            4,
        )

    def test_returns_columns(self):
        result = self.query()

        self.assertEqual(
            result["columns"],
            [
                "name",
                "country",
                "score",
            ],
        )

    def test_paginates_rows(self):
        result = self.query(
            page=2,
            page_size=2,
        )

        self.assertEqual(
            result["page"],
            2,
        )

        self.assertEqual(
            result["pageSize"],
            2,
        )

        self.assertEqual(
            result["totalPages"],
            2,
        )

        self.assertEqual(
            len(result["rows"]),
            2,
        )

    def test_sorts_rows(self):
        result = self.query(
            sort_column="score",
            sort_direction="asc",
        )

        scores = [
            row["score"]
            for row in result["rows"]
        ]

        self.assertEqual(
            scores,
            [
                10,
                20,
                30,
                40,
            ],
        )

    def test_transformation_happens_before_query_result(self):
        transformations = [
            self.transformation(
                "rename_column",
                {
                    "column": "score",
                    "new_name": "points",
                },
            )
        ]

        result = self.query(
            transformations=transformations,
            sort_column="points",
            sort_direction="desc",
        )

        self.assertIn(
            "points",
            result["columns"],
        )

        self.assertNotIn(
            "score",
            result["columns"],
        )

        points = [
            row["points"]
            for row in result["rows"]
        ]

        self.assertEqual(
            points,
            [
                40,
                30,
                20,
                10,
            ],
        )