import unittest
import asyncio

from src.core.merge import merge_sources
from src.utils.mocks import generate_mock_companies
from src.apis.email_validator_arjos import ArjosEmailValidator


class TestMergeAndValidation(unittest.TestCase):
    def test_merge_metrics_dry_run(self):
        gmaps = generate_mock_companies(seed="gmaps-test", count=12, source_tag="gmaps")
        yelp = generate_mock_companies(seed="yelp-test", count=8, source_tag="yelp")
        yellow = generate_mock_companies(seed="yellow-test", count=5, source_tag="yellowpages")
        merged, metrics = merge_sources(gmaps, yelp, yellow, dry_run=True)
        self.assertGreater(metrics["input_total"], 0)
        self.assertGreater(metrics["merged_total"], 0)
        self.assertGreaterEqual(metrics["kept"], 1)

    def test_arjos_deterministic_buckets(self):
        validator = ArjosEmailValidator(host="", rapidapi_key="", dry_run=True)
        async def validate_all():
            emails = [
                "info@example.com",
                "sales@example.com",
                "hello@example.com",
                "jane.doe@example.com",
            ]
            results = []
            for e in emails:
                results.append(await validator.validate(e))
            return results
        results = asyncio.get_event_loop().run_until_complete(validate_all())
        self.assertEqual(len(results), 4)
        # Ensure fields exist
        for r in results:
            self.assertIn("is_valid", r)
            self.assertIn("deliverability", r)


if __name__ == "__main__":
    unittest.main()
