import pandas as pd

from .transformations import apply_transformations


def build_export_dataframe(
    file_path: str,
    transformations,
) -> pd.DataFrame:
    df = pd.read_csv(file_path)

    return apply_transformations(
        df,
        transformations,
    )