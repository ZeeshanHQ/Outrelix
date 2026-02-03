import logging
import os
from datetime import datetime
from typing import Tuple


def create_run_context(base_output_dir: str = "output", dry_run: bool = False) -> Tuple[str, str]:
    timestamp = datetime.utcnow().strftime("%Y%m%d_%H%M%S")
    run_dir = os.path.join(base_output_dir, f"run_{timestamp}")
    if not dry_run:
        os.makedirs(run_dir, exist_ok=True)
    else:
        # In dry_run, still create the directory to mimic outputs but log it.
        try:
            os.makedirs(run_dir, exist_ok=True)
        except Exception:
            pass
    return run_dir, timestamp


def setup_logging(run_dir: str, dry_run: bool = False) -> None:
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Clear existing handlers to avoid duplicates on reruns
    for h in list(logger.handlers):
        logger.removeHandler(h)

    console_handler = logging.StreamHandler()
    console_format = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
    console_handler.setFormatter(console_format)
    logger.addHandler(console_handler)

    file_path = os.path.join(run_dir, "_dry_run.log" if dry_run else "run.log")
    try:
        file_handler = logging.FileHandler(file_path, mode="a", encoding="utf-8")
        file_format = logging.Formatter("%(asctime)s | %(levelname)s | %(name)s | %(message)s")
        file_handler.setFormatter(file_format)
        logger.addHandler(file_handler)
    except Exception:
        # Fall back to console-only logging if file cannot be opened (e.g., permissions)
        logger.warning("Unable to open log file; continuing with console logging only.")

    if dry_run:
        logger.info("DRY_RUN active: external API calls and irreversible writes are disabled.")

