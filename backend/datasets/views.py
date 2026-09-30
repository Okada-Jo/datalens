from pathlib import Path

from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Dataset
from .serializers import DatasetSerializer
from .services.analysis import analyze_csv


class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")

        if uploaded_file is None:
            return Response(
                {"detail": "No file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.lower().endswith(".csv"):
            return Response(
                {"detail": "Only CSV files are supported."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        dataset = Dataset.objects.create(
            name=Path(uploaded_file.name).stem,
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