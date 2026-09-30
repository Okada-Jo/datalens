import pandas as pd

from ..models import Transformation


def apply_transformations(
    df: pd.DataFrame,
    transformations,
) -> pd.DataFrame:
    result = df.copy()

    for transformation in transformations:
        result = apply_transformation(
            result,
            transformation,
        )

    return result


def apply_transformation(
    df: pd.DataFrame,
    transformation: Transformation,
) -> pd.DataFrame:
    transformation_type = transformation.type
    config = transformation.config

    if transformation_type == Transformation.Type.FILL_MISSING:
        return fill_missing(df, config)

    if transformation_type == Transformation.Type.RENAME_COLUMN:
        return rename_column(df, config)

    if transformation_type == Transformation.Type.REPLACE_VALUE:
        return replace_value(df, config)

    if transformation_type == Transformation.Type.DELETE_COLUMN:
        return delete_column(df, config)

    raise ValueError(
        f"Unknown transformation type: {transformation_type}"
    )

def fill_missing(
    df: pd.DataFrame,
    config: dict,
) -> pd.DataFrame:
    column = config["column"]
    value = config["value"]

    require_column(df, column)

    result = df.copy()
    result[column] = result[column].fillna(value)

    return result

def rename_column(
    df: pd.DataFrame,
    config: dict,
) -> pd.DataFrame:
    column = config["column"]
    new_name = config["new_name"]

    require_column(df, column)

    if new_name in df.columns:
        raise ValueError(
            f"Column '{new_name}' already exists."
        )

    return df.rename(
        columns={column: new_name},
    )

def replace_value(
    df: pd.DataFrame,
    config: dict,
) -> pd.DataFrame:
    column = config["column"]
    old_value = config["old_value"]
    new_value = config["new_value"]

    require_column(df, column)

    result = df.copy()

    result[column] = result[column].replace(
        old_value,
        new_value,
    )

    return result

def delete_column(
    df: pd.DataFrame,
    config: dict,
) -> pd.DataFrame:
    column = config["column"]

    require_column(df, column)

    return df.drop(columns=[column])

def require_column(
    df: pd.DataFrame,
    column: str,
) -> None:
    if column not in df.columns:
        raise ValueError(
            f"Unknown column: {column}"
        )