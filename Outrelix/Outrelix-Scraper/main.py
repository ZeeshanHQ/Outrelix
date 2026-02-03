import argparse
import logging

from src.utils.config import load_config_from_env_and_args
from src.utils.logging_setup import create_run_context, setup_logging


def parse_args():
    parser = argparse.ArgumentParser(description="Outrelix Lead Engine")
    parser.add_argument("--queries", type=str, required=False, help="Comma-separated query terms")
    parser.add_argument("--geo", type=str, required=False, help="Geographic filter")
    parser.add_argument("--category", type=str, required=False, help="Category/Niche")
    parser.add_argument("--limit", type=int, required=False, help="Max leads per run")
    parser.add_argument("--enable_overpass", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--enable_yelp", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--enable_yellowpages", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--enable_clearbit", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--push_to_gsheets", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--dry_run", type=lambda v: v.lower() == "true", required=False)
    parser.add_argument("--free_mode", type=lambda v: v.lower() == "true", required=False, help="Force free-mode (skip paid APIs, use local/mocks)")
    parser.add_argument("--enable_embed_scoring", type=lambda v: v.lower() == "true", required=False, help="Enable embedding-based relevance scoring (CPU, optional)")
    parser.add_argument("--enable_embed_dedupe", type=lambda v: v.lower() == "true", required=False, help="Enable embedding-based fuzzy dedupe (CPU, optional)")
    return parser.parse_args()


def validate_inputs(config) -> None:
    if not config.queries:
        raise SystemExit("--queries is required (comma-separated)")
    if not config.geo:
        raise SystemExit("--geo is required")
    if config.limit is None or config.limit <= 0:
        raise SystemExit("--limit must be a positive integer")


def main():
    args = parse_args()
    config = load_config_from_env_and_args(args)

    run_dir, ts = create_run_context(dry_run=config.dry_run)
    setup_logging(run_dir=run_dir, dry_run=config.dry_run)

    logger = logging.getLogger(__name__)

    logger.info("Precedence: CLI > .env > defaults")

    validate_inputs(config)

    logger.info("Run directory: %s", run_dir)
    logger.info("Queries: %s | Geo: %s | Category: %s | Limit: %s", config.queries, config.geo, config.category, config.limit)
    logger.info("Flags: enable_overpass=%s enable_yelp=%s enable_yellowpages=%s enable_clearbit=%s push_to_gsheets=%s dry_run=%s free_mode=%s enable_embed_scoring=%s enable_embed_dedupe=%s",
                config.enable_overpass, config.enable_yelp, config.enable_yellowpages, config.enable_clearbit, config.push_to_gsheets, config.dry_run, config.free_mode, config.enable_embed_scoring, config.enable_embed_dedupe)

    if config.dry_run:
        logger.info("DRY_RUN active: no external API calls or Google Sheets push will be executed.")
    if config.free_mode:
        logger.info("FREE_MODE active: paid/external APIs will be skipped or mocked; using free/local fallbacks only.")

    # Import and run the pipeline
    from src.core.pipeline import Pipeline
    import asyncio
    
    try:
        pipeline = Pipeline(config, run_dir)
        companies, summary = asyncio.run(pipeline.run(ts))
        
        logger.info("Pipeline completed successfully!")
        logger.info("Summary: %s companies processed, %s emails found", 
                   summary.get("totals", {}).get("companies", 0),
                   summary.get("totals", {}).get("emails_found", 0))
        
    except Exception as e:
        logger.error("Pipeline failed: %s", e)
        raise


if __name__ == "__main__":
    main()

