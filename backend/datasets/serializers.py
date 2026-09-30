from rest_framework import serializers

from .models import Dataset, Transformation


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


class TransformationSerializer(serializers.ModelSerializer):
    createdAt = serializers.DateTimeField(
        source="created_at",
        read_only=True,
    )

    def validate(self, attrs):
        transformation_type = attrs.get("type")
        config = attrs.get("config", {})

        if transformation_type == Transformation.Type.FILL_MISSING:
            self.require_config_fields(
                config,
                ["column", "value"],
            )

        elif transformation_type == Transformation.Type.RENAME_COLUMN:
            self.require_config_fields(
                config,
                ["column", "new_name"],
            )

        elif transformation_type == Transformation.Type.REPLACE_VALUE:
            self.require_config_fields(
                config,
                [
                    "column",
                    "old_value",
                    "new_value",
                ],
            )

        elif transformation_type == Transformation.Type.DELETE_COLUMN:
            self.require_config_fields(
                config,
                ["column"],
            )

        return attrs

    def require_config_fields(
        self,
        config: dict,
        fields: list[str],
    ) -> None:
        missing = [
            field
            for field in fields
            if field not in config
        ]

        if missing:
            raise serializers.ValidationError({
                "config": (
                    "Missing required fields: "
                    + ", ".join(missing)
                )
            })

    class Meta:
        model = Transformation
        fields = [
            "id",
            "type",
            "config",
            "position",
            "createdAt",
        ]

        read_only_fields = [
            "id",
            "position",
            "createdAt",
        ]