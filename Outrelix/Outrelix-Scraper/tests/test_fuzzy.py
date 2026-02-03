import unittest

from src.utils.fuzzy import dedupe_companies, name_similarity


class TestFuzzy(unittest.TestCase):
    def test_name_similarity(self):
        self.assertGreaterEqual(name_similarity("Acme CRM LLC", "Acme CRM"), 85)
        self.assertLess(name_similarity("Acme CRM", "Beta Analytics"), 60)

    def test_deduplicate_with_domain(self):
        records = [
            {"company_name": "Acme", "domain": "acme.com", "phone_e164": "+15551234567", "source_tags": ["gmaps"]},
            {"company_name": "Acme Inc", "domain": "acme.com", "source_tags": ["yelp"]},
        ]
        merged, stats = dedupe_companies(records, dry_run=False)
        self.assertEqual(len(merged), 1)
        self.assertGreaterEqual(stats["merged"], 1)

    def test_dry_run_collision(self):
        records = [
            {"company_name": "Gamma Soft", "source_tags": ["gmaps"], "website_url": "http://gamma.com"},
            {"company_name": "Gamma Software", "source_tags": ["yelp"], "website_url": "http://gamma.com"},
        ]
        merged, stats = dedupe_companies(records, dry_run=True)
        self.assertEqual(len(merged), 1)
        self.assertGreaterEqual(stats["merged"], 1)


if __name__ == "__main__":
    unittest.main()
