import unittest
import os
import asyncio
from typing import Dict, Any

from types import SimpleNamespace

from src.utils.config import load_config_from_env_and_args
from src.utils.logging_setup import create_run_context, setup_logging
from src.core.pipeline import Pipeline


class TestPipeline(unittest.TestCase):
    def test_pipeline_dry_run_produces_excel(self):
        args = SimpleNamespace(
            queries="SaaS,CRM",
            geo="USA",
            category="B2B SaaS",
            limit=20,
            enable_yelp=True,
            enable_yellowpages=True,
            enable_clearbit=True,
            push_to_gsheets=False,
            dry_run=True,
        )
        cfg = load_config_from_env_and_args(args)
        run_dir, ts = create_run_context(dry_run=True)
        setup_logging(run_dir, dry_run=True)
        pipeline = Pipeline(cfg, run_dir)
        companies, summary = asyncio.get_event_loop().run_until_complete(pipeline.run(ts))
        self.assertGreater(len(companies), 0)
        totals: Dict[str, Any] = summary.get("totals", {})  # type: ignore[assignment]
        self.assertIn("companies", totals)
        path = os.path.join(run_dir, "verified_leads_dryrun.xlsx")
        self.assertTrue(os.path.exists(path))


if __name__ == "__main__":
    unittest.main()
