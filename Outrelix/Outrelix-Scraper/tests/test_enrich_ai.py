import asyncio
import unittest

from src.engine.enrich import enrich_rows, classify_role


class TestEnrichAI(unittest.TestCase):
    def test_linkedin_snippet_extraction(self):
        snippet = "John Doe – CEO at Acme Corp"
        rows = [{"name": "John Doe", "company": "Acme Corp", "email": "", "phone": "", "website": "", "source": "test", "role_text": "CEO at Acme Corp"}]
        out = asyncio.run(enrich_rows(rows))
        self.assertEqual(len(out), 1)
        self.assertIn("confidence", out[0])
        # role should resolve to CEO via heuristics/HF
        self.assertTrue(out[0]["role"].lower().startswith("ceo") or "ceo" in out[0]["role"].lower())

    def test_noise_classification(self):
        rows = [{"name": "", "company": "", "email": "", "phone": "", "website": "", "source": "test"}]
        out = asyncio.run(enrich_rows(rows))
        self.assertEqual(len(out), 1)
        self.assertLessEqual(out[0]["confidence"], 0.6)


if __name__ == "__main__":
    unittest.main()



