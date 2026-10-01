from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase

from datasets.models import (
    Dataset,
    Transformation,
)


class TransformationModelTests(TestCase):
    def setUp(self):
        self.dataset = Dataset.objects.create(
            name="Test Dataset",
            original_filename="test.csv",
            file=SimpleUploadedFile(
                "test.csv",
                b"name,score\nAlice,10\n",
                content_type="text/csv",
            ),
            file_size=20,
        )

    def create_transformation(
        self,
        type_,
        config,
        position,
    ):
        return Transformation.objects.create(
            dataset=self.dataset,
            type=type_,
            config=config,
            position=position,
        )

    def test_transformations_are_ordered_by_position(self):
        self.create_transformation(
            "delete_column",
            {
                "column": "unused",
            },
            3,
        )

        self.create_transformation(
            "rename_column",
            {
                "column": "score",
                "new_name": "points",
            },
            1,
        )

        self.create_transformation(
            "fill_missing",
            {
                "column": "score",
                "value": "0",
            },
            2,
        )

        positions = list(
            self.dataset.transformations
            .values_list(
                "position",
                flat=True,
            )
        )

        self.assertEqual(
            positions,
            [
                1,
                2,
                3,
            ],
        )

    def test_dataset_deletion_removes_transformations(self):
        self.create_transformation(
            "rename_column",
            {
                "column": "score",
                "new_name": "points",
            },
            1,
        )

        self.dataset.delete()

        self.assertEqual(
            Transformation.objects.count(),
            0,
        )