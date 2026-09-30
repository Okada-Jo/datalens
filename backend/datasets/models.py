import uuid

from django.db import models


class Dataset(models.Model):
    class Status(models.TextChoices):
        UPLOADED = "uploaded", "Uploaded"
        PROCESSING = "processing", "Processing"
        READY = "ready", "Ready"
        FAILED = "failed", "Failed"

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    name = models.CharField(max_length=255)
    original_filename = models.CharField(max_length=255)

    file = models.FileField(
        upload_to="datasets/",
    )

    file_size = models.PositiveBigIntegerField()

    row_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    column_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.UPLOADED,
    )

    analysis = models.JSONField(
        default=dict,
        blank=True,
    )

    error_message = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return self.name

class Transformation(models.Model):
    class Type(models.TextChoices):
        FILL_MISSING = (
            "fill_missing",
            "Fill missing values",
        )
        RENAME_COLUMN = (
            "rename_column",
            "Rename column",
        )
        REPLACE_VALUE = (
            "replace_value",
            "Replace value",
        )
        DELETE_COLUMN = (
            "delete_column",
            "Delete column",
        )

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    dataset = models.ForeignKey(
        Dataset,
        on_delete=models.CASCADE,
        related_name="transformations",
    )

    type = models.CharField(
        max_length=30,
        choices=Type.choices,
    )

    config = models.JSONField()

    position = models.PositiveIntegerField()

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    class Meta:
        ordering = ["position"]

    def __str__(self):
        return f"{self.dataset.name}: {self.type}"