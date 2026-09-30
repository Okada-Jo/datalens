from pathlib import Path

import pandas as pd
from pandas.api.types import (
    is_bool_dtype,
    is_numeric_dtype,
)


def analyze_csv(file_path: Path) -> dict:
    df = pd.read_csv(file_path)

    columns = [
        analyze_column(df[column_name])
        for column_name in df.columns
    ]

    return {
        "row_count": len(df),
        "column_count": len(df.columns),
        "columns": columns,
    }


def analyze_column(series: pd.Series) -> dict:
    column_type = infer_column_type(series)

    missing_count = int(series.isna().sum())
    row_count = len(series)

    result = {
        "name": str(series.name),
        "type": column_type,
        "missing_count": missing_count,
        "missing_percentage": round(
            (missing_count / row_count) * 100, 2
        ) if row_count else 0,
        "unique_count": int(series.nunique()),
    }

    if column_type == "number":
        result["statistics"] = numeric_statistics(series)

    elif column_type == "date":
        result["statistics"] = date_statistics(series)

    elif column_type == "category":
        result["statistics"] = categorical_statistics(series)

    return result


def infer_column_type(series: pd.Series) -> str:
    non_null = series.dropna()

    if non_null.empty:
        return "text"

    if is_bool_dtype(series):
        return "boolean"

    if is_numeric_dtype(series):
        return "number"

    # Try date detection for string-like columns.
    if is_likely_date(non_null):
        return "date"

    unique_count = non_null.nunique()
    unique_ratio = unique_count / len(non_null)

    # Treat low-cardinality strings as categories.
    if unique_count <= 20 or unique_ratio <= 0.2:
        return "category"

    return "text"


def is_likely_date(series: pd.Series) -> bool:
    try:
        parsed = pd.to_datetime(series, errors="coerce")
    except (ValueError, TypeError):
        return False

    success_ratio = parsed.notna().mean()

    return success_ratio >= 0.9


def numeric_statistics(series: pd.Series) -> dict:
    clean = series.dropna()

    if clean.empty:
        return {}

    return {
        "min": float(clean.min()),
        "max": float(clean.max()),
        "mean": round(float(clean.mean()), 2),
        "median": round(float(clean.median()), 2),
        "std": round(float(clean.std()), 2)
        if len(clean) > 1
        else None,
    }


def date_statistics(series: pd.Series) -> dict:
    parsed = pd.to_datetime(series, errors="coerce").dropna()

    if parsed.empty:
        return {}

    return {
        "min": parsed.min().isoformat(),
        "max": parsed.max().isoformat(),
    }


def categorical_statistics(series: pd.Series) -> dict:
    counts = series.dropna().value_counts().head(10)

    return {
        "top_values": [
            {
                "value": str(value),
                "count": int(count),
            }
            for value, count in counts.items()
        ]
    }