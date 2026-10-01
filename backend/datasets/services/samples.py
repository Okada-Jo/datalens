import json
from pathlib import Path

SAMPLE_ROOT = Path(__file__).resolve().parent.parent / "sample_data"


def sample_catalog():
    return json.loads((SAMPLE_ROOT / "catalog.json").read_text(encoding="utf-8"))
