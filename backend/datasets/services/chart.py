import pandas as pd

from .transformations import apply_transformations


SUPPORTED_AGGREGATIONS = {
    "sum",
    "average",
    "count",
}


def build_chart_data(
    file_path: str,
    transformations,
    x_column: str,
    y_column: str | None,
    aggregation: str,
) -> dict:
    df = pd.read_csv(file_path)

    df = apply_transformations(
        df,
        transformations,
    )

    validate_columns(
        df,
        x_column,
        y_column,
        aggregation,
    )

    if aggregation not in SUPPORTED_AGGREGATIONS:
        raise ValueError(
            f"Unsupported aggregation: {aggregation}"
        )

    if aggregation == "count":
        grouped = (
            df.groupby(
                x_column,
                dropna=False,
            )
            .size()
            .reset_index(name="value")
        )

    else:
        numeric_values = pd.to_numeric(
            df[y_column],
            errors="coerce",
        )
        if numeric_values.notna().sum() == 0:
          raise ValueError(
              f"Column '{y_column}' does not contain numeric values."
          )

        working_df = df.copy()
        working_df["_chart_value"] = numeric_values

        grouped_data = working_df.groupby(
            x_column,
            dropna=False,
        )["_chart_value"]

        if aggregation == "sum":
            grouped = (
                grouped_data
                .sum()
                .reset_index(name="value")
            )
        else:
            grouped = (
                grouped_data
                .mean()
                .reset_index(name="value")
            )

    data = [
        {
            "x": serialize_value(row[x_column]),
            "y": serialize_value(row["value"]),
        }
        for _, row in grouped.iterrows()
    ]

    return {
        "x": x_column,
        "y": y_column,
        "aggregation": aggregation,
        "data": data,
    }


def validate_columns(
    df: pd.DataFrame,
    x_column: str,
    y_column: str | None,
    aggregation: str,
) -> None:
    if x_column not in df.columns:
        raise ValueError(
            f"Column '{x_column}' does not exist."
        )

    if aggregation != "count":
        if not y_column:
            raise ValueError(
                "Y column is required for this aggregation."
            )

        if y_column not in df.columns:
            raise ValueError(
                f"Column '{y_column}' does not exist."
            )


def serialize_value(value):
    if pd.isna(value):
        return None

    if hasattr(value, "item"):
        return value.item()

    return value