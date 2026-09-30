from rest_framework import serializers

from .models import Dataset


class DatasetSerializer(serializers.ModelSerializer):
    originalFilename = serializers.CharField(
        source="original_filename",
        read_only=True,
    )
    fileSize = serializers.IntegerField(
        source="file_size",
        read_only=True,
    )
    rowCount = serializers.IntegerField(
        source="row_count",
        read_only=True,
    )
    columnCount = serializers.IntegerField(
        source="column_count",
        read_only=True,
    )
    createdAt = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    class Meta:
        model = Dataset
        fields = [
            "id",
            "name",
            "originalFilename",
            "fileSize",
            "rowCount",
            "columnCount",
            "status",
            "analysis",
            "createdAt",
        ]