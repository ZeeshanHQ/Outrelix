import unittest
import os
import asyncio
from typing import Dict, Any

from types import SimpleNamespace

from src.utils.config import load_config_from_env_and_args
from src.utils.logging_setup import create_run_context, setup_logging
from src.core.pipeline import Pipeline


class TestSmokeExportsAndDeterminism(unittest.TestCase):
    def test_dry_run_reproducibility(self):
        args = SimpleNamespace(
            queries="SaaS,CRM",
            geo="USA",
            category="B2B SaaS",
            limit=15,
            enable_yelp=True,
            enable_yellowpages=True,
            enable_clearbit=True,
            push_to_gsheets=False,
            dry_run=True,
        )
        cfg = load_config_from_env_and_args(args)
        run_dir1, ts1 = create_run_context(dry_run=True)
        setup_logging(run_dir1, dry_run=True)
        pipeline1 = Pipeline(cfg, run_dir1)
        companies1, summary1 = asyncio.get_event_loop().run_until_complete(pipeline1.run(ts1))

        run_dir2, ts2 = create_run_context(dry_run=True)
        setup_logging(run_dir2, dry_run=True)
        pipeline2 = Pipeline(cfg, run_dir2)
        companies2, summary2 = asyncio.get_event_loop().run_until_complete(pipeline2.run(ts2))

        totals1: Dict[str, Any] = summary1.get("totals", {})  # type: ignore[assignment]
        totals2: Dict[str, Any] = summary2.get("totals", {})  # type: ignore[assignment]
        self.assertEqual(totals1["companies"], totals2["companies"])
        self.assertEqual(totals1["emails_found"], totals2["emails_found"])

    def test_exports_exist(self):
        args = SimpleNamespace(
            queries="SaaS",
            geo="USA",
            category="B2B SaaS",
            limit=10,
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
        for fname in ["raw_businesses.csv", "raw_contacts.csv", "validated_emails.csv", "verified_leads_dryrun.xlsx", "summary.json"]:
            self.assertTrue(os.path.exists(os.path.join(run_dir, fname)))


if __name__ == "__main__":
    unittest.main()
