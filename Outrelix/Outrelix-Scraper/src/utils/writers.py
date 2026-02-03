import logging
import os
from typing import List

import pandas as pd

logger = logging.getLogger(__name__)


def ensure_dir(path: str) -> None:
    os.makedirs(path, exist_ok=True)


def write_csv(df: pd.DataFrame, path: str, dry_run: bool = False) -> None:
    if dry_run:
        logger.info("DRY_RUN: writing sample CSV to %s", path)
        sample = df.head(5).copy()
        sample["DRY_RUN"] = True
        ensure_dir(os.path.dirname(path))
        sample.to_csv(path, index=False)
        return
    ensure_dir(os.path.dirname(path))
    df.to_csv(path, index=False)


def write_excel(sheets: dict, path: str, dry_run: bool = False) -> None:
    if dry_run:
        logger.info("DRY_RUN: writing sample Excel to %s", path)
    ensure_dir(os.path.dirname(path))
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        for name, df in sheets.items():
            out = df.head(5).copy() if dry_run else df
            if dry_run:
                out["DRY_RUN"] = True
            out.to_excel(writer, sheet_name=name, index=False)


def idempotent_append_csv(new_rows: pd.DataFrame, path: str, key_cols: List[str], dry_run: bool = False) -> None:
    ensure_dir(os.path.dirname(path))
    if os.path.exists(path):
        try:
            existing = pd.read_csv(path)
        except Exception:
            existing = pd.DataFrame(columns=new_rows.columns)
    else:
        existing = pd.DataFrame(columns=new_rows.columns)

    if not set(key_cols).issubset(new_rows.columns):
        logger.warning("Key columns %s not fully present; writing overwrite.", key_cols)
        write_csv(new_rows, path, dry_run=dry_run)
        return

    merged = pd.concat([existing, new_rows], ignore_index=True)
    merged.drop_duplicates(subset=key_cols, keep="first", inplace=True)

    if dry_run:
        logger.info("DRY_RUN: idempotent append preview for %s rows -> %s unique", len(new_rows), len(merged))
        preview_path = path.replace(".csv", "_dry_run_preview.csv")
        merged.head(10).assign(DRY_RUN=True).to_csv(preview_path, index=False)
        return

    merged.to_csv(path, index=False)
