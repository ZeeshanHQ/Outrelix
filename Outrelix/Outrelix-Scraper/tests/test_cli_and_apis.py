import unittest
from types import SimpleNamespace
import asyncio

from src.utils.config import load_config_from_env_and_args
from src.apis.google_maps_extractor import GoogleMapsExtractor
from src.apis.yelp import YelpClient
from src.apis.yellowpages import YellowPagesClient
from src.apis.email_validator_rapid import RapidEmailValidator


class TestCLIAndAPIs(unittest.TestCase):
    def test_cli_validation_and_merge(self):
        args = SimpleNamespace(
            queries="SaaS,CRM",
            geo="USA",
            category="B2B SaaS",
            limit=10,
            enable_yelp=True,
            enable_yellowpages=False,
            enable_clearbit=True,
            push_to_gsheets=False,
            dry_run=True,
        )
        cfg = load_config_from_env_and_args(args)
        self.assertEqual(cfg.queries, ["SaaS", "CRM"])
        self.assertTrue(cfg.dry_run)
        self.assertTrue(cfg.enable_yelp)
        self.assertFalse(cfg.enable_yellowpages)

    def test_google_maps_dry_run(self):
        client = GoogleMapsExtractor(host="", base_path="/search", rapidapi_key="", dry_run=True)
        results = asyncio.get_event_loop().run_until_complete(client.search(["SaaS"], "USA", 15))
        self.assertGreaterEqual(len(results), 10)
        self.assertLessEqual(len(results), 30)
        self.assertIn("gmaps", results[0].get("source_tags", []))

    def test_yelp_dry_run(self):
        client = YelpClient(api_key="", dry_run=True)
        results = asyncio.get_event_loop().run_until_complete(client.search(["SaaS"], "USA", 12))
        self.assertGreaterEqual(len(results), 5)
        self.assertLessEqual(len(results), 15)
        self.assertIn("yelp", results[0].get("source_tags", []))

    def test_yellowpages_dry_run(self):
        client = YellowPagesClient(host="", rapidapi_key="", dry_run=True)
        results = asyncio.get_event_loop().run_until_complete(client.search(["SaaS"], "USA", 10))
        # May be empty; when not empty, ensure tag present
        if results:
            self.assertIn("yellowpages", results[0].get("source_tags", []))

    def test_rapid_email_validator_dry_run(self):
        client = RapidEmailValidator(host="email-validator-api.p.rapidapi.com", base_url="https://email-validator-api.p.rapidapi.com", rapidapi_key="", dry_run=True)
        result = asyncio.get_event_loop().run_until_complete(client.validate("user@mail.com"))
        self.assertIn("is_valid", result)


if __name__ == "__main__":
    unittest.main()
