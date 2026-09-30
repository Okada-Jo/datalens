from pathlib import Path

import math

import pandas as pd
from rest_framework.decorators import action

from rest_framework import status, viewsets
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.response import Response

from .models import Dataset
from .serializers import DatasetSerializer
from .services.analysis import analyze_csv

MAX_FILE_SIZE = 25 * 1024 * 1024

class DatasetViewSet(viewsets.ModelViewSet):
    queryset = Dataset.objects.all()
    serializer_class = DatasetSerializer
    parser_classes = [MultiPartParser, FormParser]

    def create(self, request, *args, **kwargs):
        uploaded_file = request.FILES.get("file")
        
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
    
    @action(detail=True, methods=["get"])
    def rows(self, request, pk=None):
        dataset = self.get_object()

        try:
            page = max(int(request.query_params.get("page", 1)), 1)
            page_size = int(request.query_params.get("page_size", 50))
            page_size = min(max(page_size, 1), 100)
        except ValueError:
            return Response(
                {"detail": "Invalid pagination parameters."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            df = pd.read_csv(dataset.file.path)

            total_rows = len(df)
            total_pages = max(math.ceil(total_rows / page_size), 1)

            start = (page - 1) * page_size
            end = start + page_size

            page_df = df.iloc[start:end]

            # JSON cannot safely represent Pandas NaN values.
            page_df = page_df.astype(object).where(
                pd.notna(page_df),
                None,
            )

            rows = page_df.to_dict(orient="records")

            return Response(
                {
                    "page": page,
                    "pageSize": page_size,
                    "totalRows": total_rows,
                    "totalPages": total_pages,
                    "columns": [str(column) for column in df.columns],
                    "rows": rows,
                }
            )

        except Exception:
            return Response(
                {"detail": "The dataset rows could not be loaded."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )