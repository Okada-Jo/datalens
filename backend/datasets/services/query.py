import math

import pandas as pd


TEXT_OPERATORS = {"contains", "equals"}
NUMBER_OPERATORS = {
    "equals",
    "gt",
    "gte",
    "lt",
    "lte",
}


def query_dataset(
    file_path: str,
    *,
    page: int,
    page_size: int,
    sort_column: str | None,
    sort_direction: str,
    filters: list[dict],
    search: str | None,
) -> dict:
    df = pd.read_csv(file_path)

    df = apply_search(df, search)
    df = apply_filters(df, filters)
    df = apply_sort(
        df,
        sort_column,
        sort_direction,
    )

    return paginate_dataframe(
        df,
        page,
        page_size,
    )

def apply_search(
    df: pd.DataFrame,
    search: str | None,
) -> pd.DataFrame:
    if search is None:
        return df

    search = search.strip()

    if not search:
        return df

    mask = pd.Series(
        False,
        index=df.index,
    )

    for column in df.columns:
        series = df[column]

        # Global search is intended primarily for
        # textual/categorical data.
        if pd.api.types.is_numeric_dtype(series):
            continue

        column_mask = (
            series.astype("string")
            .str.contains(
                search,
                case=False,
                regex=False,
                na=False,
            )
        )

        mask = mask | column_mask

    return df[mask]


def apply_filters(
    df: pd.DataFrame,
    filters: list[dict],
) -> pd.DataFrame:
    for filter_data in filters:
        if not isinstance(filter_data, dict):
            raise ValueError(
                "Each filter must be an object."
            )

        try:
            column = filter_data["column"]
            operator = filter_data["operator"]
        except KeyError as exc:
            raise ValueError(
                f"Missing filter field: {exc.args[0]}"
            ) from exc

        value = filter_data.get("value")

        df = apply_filter(
            df,
            column,
            operator,
            value,
        )

    return df


def apply_filter(
    df: pd.DataFrame,
    column: str,
    operator: str,
    value: str | None,
) -> pd.DataFrame:
    if column not in df.columns:
        raise ValueError(
            f"Unknown filter column: {column}"
        )

    series = df[column]

    if operator == "is_missing":
        return df[series.isna()]

    if operator == "is_not_missing":
        return df[series.notna()]

    if value is None:
        raise ValueError(
            f"Operator '{operator}' requires a value."
        )

    if pd.api.types.is_numeric_dtype(series):
        return apply_numeric_filter(
            df,
            series,
            operator,
            value,
        )

    return apply_text_filter(
        df,
        series,
        operator,
        value,
    )


def apply_numeric_filter(
    df: pd.DataFrame,
    series: pd.Series,
    operator: str,
    value: str,
) -> pd.DataFrame:
    if operator not in NUMBER_OPERATORS:
        raise ValueError(
            f"Unsupported operator '{operator}' "
            "for numeric column."
        )

    try:
        numeric_value = float(value)
    except ValueError as exc:
        raise ValueError(
            "Numeric filters require a valid number."
        ) from exc

    if operator == "equals":
        mask = series == numeric_value
    elif operator == "gt":
        mask = series > numeric_value
    elif operator == "gte":
        mask = series >= numeric_value
    elif operator == "lt":
        mask = series < numeric_value
    else:
        mask = series <= numeric_value

    return df[mask]


def apply_text_filter(
    df: pd.DataFrame,
    series: pd.Series,
    operator: str,
    value: str,
) -> pd.DataFrame:
    if operator not in TEXT_OPERATORS:
        raise ValueError(
            f"Unsupported operator '{operator}' "
            "for text column."
        )

    text_series = series.astype("string")

    if operator == "equals":
        mask = (
            text_series.str.casefold()
            == value.casefold()
        )
    else:
        mask = text_series.str.contains(
            value,
            case=False,
            regex=False,
            na=False,
        )

    return df[mask.fillna(False)]


def apply_sort(
    df: pd.DataFrame,
    column: str | None,
    direction: str,
) -> pd.DataFrame:
    if column is None:
        return df

    if column not in df.columns:
        raise ValueError(
            f"Unknown sort column: {column}"
        )

    return df.sort_values(
        by=column,
        ascending=direction == "asc",
        na_position="last",
    )


def paginate_dataframe(
    df: pd.DataFrame,
    page: int,
    page_size: int,
) -> dict:
    total_rows = len(df)

    total_pages = max(
        math.ceil(total_rows / page_size),
        1,
    )

    start = (page - 1) * page_size
    end = start + page_size

    page_df = df.iloc[start:end]

    page_df = page_df.astype(object).where(
        pd.notna(page_df),
        None,
    )

    rows = page_df.to_dict(
        orient="records",
    )

    return {
        "page": page,
        "pageSize": page_size,
        "totalRows": total_rows,
        "totalPages": total_pages,
        "columns": [
            str(column)
            for column in df.columns
        ],
        "rows": rows,
    }