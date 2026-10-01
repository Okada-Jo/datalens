from pathlib import Path

import json

from django.http import HttpResponse
from django.core.files import File
from .services.samples import SAMPLE_ROOT, sample_catalog

from rest_framework.decorators import action

from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, JSONParser, MultiPartParser
from rest_framework.response import Response

from .models import Dataset, Transformation
from .services.retention import delete_expired_datasets
from django.utils import timezone
from datetime import timedelta
from .serializers import DatasetSerializer, TransformationSerializer
from .services.analysis import analyze_csv
from .services.query import query_dataset
from .services.export import build_export_dataframe
from .services.chart import build_chart_data


MAX_FILE_SIZE = 25 * 1024 * 1024

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser]

    def initial(self, request, *args, **kwargs):
        super().initial(request, *args, **kwargs)
        delete_expired_datasets()

    def get_queryset(self):
        return Dataset.objects.filter(created_at__gt=timezone.now() - timedelta(hours=24))

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        
        if uploaded_file is None:
            return Response(
                {"detail": "No file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if uploaded_file.size > MAX_FILE_SIZE:
            return Response(
                {"detail": "The file must be smaller than 25 MB."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        if uploaded_file.size == 0:
            return Response(
                {"detail": "The file is empty."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".csv"):
            return Response(
                {"detail": "Only CSV files are supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return self.create_from_file(uploaded_file)

    def create_from_file(self, uploaded_file, name=None):
        dataset = Dataset.objects.create(
            name=name or Path(uploaded_file.name).stem,
            original_filename=uploaded_file.name,
            file=uploaded_file,
            file_size=uploaded_file.size,
            status=Dataset.Status.PROCESSING,
        )

        try:
            analysis = analyze_csv(Path(dataset.file.path))

            dataset.row_count = analysis["row_count"]
            dataset.column_count = analysis["column_count"]
            dataset.analysis = analysis
            dataset.status = Dataset.Status.READY
            dataset.save()

        except Exception as exc:
            dataset.status = Dataset.Status.FAILED
            dataset.error_message = str(exc)
            dataset.save()

            return Response(
                {
                    "detail": "The CSV could not be analyzed.",
                    "datasetId": dataset.id,
                },
                status=status.HTTP_422_UNPROCESSABLE_ENTITY,
            )

        serializer = self.get_serializer(dataset)

        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
        )

    @action(detail=False, methods=["get"], url_path="samples")
    def samples(self, request):
        return Response(sample_catalog())

    @action(detail=False, methods=["post"], url_path=r"samples/(?P<sample_id>[^/.]+)/use")
    def use_sample(self, request, sample_id=None):
        sample = next((item for item in sample_catalog() if item["id"] == sample_id), None)
        if sample is None:
            return Response({"detail": "Sample dataset not found."}, status=status.HTTP_404_NOT_FOUND)
        # Only catalog IDs are allowed; the bundled template is never stored as the upload.
        filename = f"{sample['id']}.csv"
        with (SAMPLE_ROOT / filename).open("rb") as handle:
            return self.create_from_file(File(handle, name=filename), name=sample["name"])

    @action(
        detail=True,
        methods=["get", "post"],
        url_path="transformations",
    )
    def transformations(self, request, pk=None):
        dataset = self.get_object()

        if request.method == "GET":
            transformations = (
                dataset.transformations
                .all()
                .order_by("position")
            )

            serializer = TransformationSerializer(
                transformations,
                many=True,
            )

            return Response(serializer.data)

        serializer = TransformationSerializer(
            data=request.data,
        )

        serializer.is_valid(
            raise_exception=True,
        )

        last_transformation = (
            dataset.transformations
            .order_by("-position")
            .first()
        )

        next_position = (
            last_transformation.position + 1
            if last_transformation
            else 1
        )

        transformation = serializer.save(
            dataset=dataset,
            position=next_position,
        )

        return Response(
            TransformationSerializer(
                transformation,
            ).data,
            status=status.HTTP_201_CREATED,
        )

    @action(
        detail=True,
        methods=["delete"],
        url_path=r"transformations/(?P<transformation_id>[^/.]+)",
    )
    def delete_transformation(
        self,
        request,
        pk=None,
        transformation_id=None,
    ):
        dataset = self.get_object()

        try:
            transformation = (
                dataset.transformations
                .get(id=transformation_id)
            )
        except Transformation.DoesNotExist:
            return Response(
                {
                    "detail": (
                        "Transformation not found."
                    )
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        dataset.transformations.filter(
            position__gte=transformation.position
        ).delete()

        return Response(
            status=status.HTTP_204_NO_CONTENT,
        )
    
    @action(detail=True, methods=["get"])
    def rows(self, request, pk=None):
        dataset = self.get_object()

        try:
            page = max(
                int(request.query_params.get("page", 1)),
                1,
            )

            page_size = int(
                request.query_params.get(
                    "page_size",
                    50,
                )
            )

            page_size = min(
                max(page_size, 1),
                100,
            )
        except ValueError:
            return Response(
                {
                    "detail": (
                        "Invalid pagination parameters."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        search = request.query_params.get("search")

        sort_column = request.query_params.get(
            "sort"
        )

        sort_direction = request.query_params.get(
            "direction",
            "asc",
        )

        if sort_direction not in {"asc", "desc"}:
            return Response(
                {
                    "detail": (
                        "Sort direction must be "
                        "'asc' or 'desc'."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        raw_filters = request.query_params.get(
            "filters",
            "[]",
        )

        try:
            filters = json.loads(raw_filters)
        except json.JSONDecodeError:
            return Response(
                {"detail": "Invalid filters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not isinstance(filters, list):
            return Response(
                {"detail": "Filters must be a list."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            transformations = (
                dataset.transformations
                .all()
                .order_by("position")
            )
            result = query_dataset(
                dataset.file.path,
                page=page,
                page_size=page_size,
                sort_column=sort_column,
                sort_direction=sort_direction,
                filters=filters,
                search=search,
                transformations=transformations,
            )

            return Response(result)

        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as exc:
            return Response(
                {
                    "detail": (
                        "The dataset rows "
                        "could not be loaded."
                    ),
                    "error": str(exc),
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @action(
        detail=True,
        methods=["get"],
        url_path="export",
    )
    def export_dataset(self, request, pk=None):
        dataset = self.get_object()

        export_format = request.query_params.get(
            "type",
            "csv",
        ).lower()

        if export_format not in {"csv", "json"}:
            return Response(
                {
                    "detail": (
                        "Unsupported export format. "
                        "Use csv or json."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transformations = (
            dataset.transformations
            .all()
            .order_by("position")
        )

        df = build_export_dataframe(
            dataset.file.path,
            transformations,
        )

        filename = dataset.name

        if export_format == "csv":
            response = HttpResponse(
                df.to_csv(index=False),
                content_type="text/csv",
            )

            response["Content-Disposition"] = (
                f'attachment; filename="{filename}.csv"'
            )

            return response

        response = HttpResponse(
            df.to_json(
                orient="records",
                date_format="iso",
                indent=2,
            ),
            content_type="application/json",
        )

        response["Content-Disposition"] = (
            f'attachment; filename="{filename}.json"'
        )

        return response

    @action(
        detail=True,
        methods=["get"],
        url_path="chart",
    )
    def chart(self, request, pk=None):
        dataset = self.get_object()

        x_column = request.query_params.get("x")
        y_column = request.query_params.get("y")
        aggregation = request.query_params.get(
            "aggregation",
            "sum",
        )

        if not x_column:
            return Response(
                {
                    "detail": (
                        "The x query parameter is required."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if aggregation != "count" and not y_column:
            return Response(
                {
                    "detail": (
                        "The y query parameter is required "
                        "for sum and average."
                    )
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        transformations = (
            dataset.transformations
            .all()
            .order_by("position")
        )

        try:
            result = build_chart_data(
                dataset.file.path,
                transformations,
                x_column,
                y_column,
                aggregation,
            )
        except ValueError as exc:
            return Response(
                {"detail": str(exc)},
                status=status.HTTP_400_BAD_REQUEST,
            )

        return Response(result)