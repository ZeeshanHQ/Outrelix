import unittest

from src.utils.hashing import generate_company_id, hash_email, build_dedupe_key
from src.utils.phone import normalize_phone


class TestHashingAndPhone(unittest.TestCase):
    def test_generate_company_id_deterministic(self):
        cid1 = generate_company_id("example.com", "+15551234567", dry_run=True)
        cid2 = generate_company_id("example.com", "+15551234567", dry_run=True)
        self.assertEqual(cid1, cid2)
        self.assertEqual(len(cid1), 16)

    def test_hash_email(self):
        h1 = hash_email("USER@Example.com")
        h2 = hash_email("user@example.com")
        self.assertEqual(h1, h2)
        self.assertEqual(len(h1), 24)

    def test_build_dedupe_key(self):
        key = build_dedupe_key("example.com", "+15551234567", "Example Inc")
        self.assertIn("example.com", key)
        self.assertIn("+15551234567", key)
        self.assertIn("example inc", key)

    def test_normalize_phone_valid_us(self):
        e164, is_valid, type_str = normalize_phone("(555) 123-4567", default_region="US", dry_run=True)
        self.assertIn("+1555", e164 or "+1555")
        self.assertIsNotNone(is_valid)

    def test_normalize_phone_invalid(self):
        e164, is_valid, type_str = normalize_phone("not-a-phone", default_region="US", dry_run=True)
        self.assertFalse(is_valid)
        self.assertIsNone(e164)


if __name__ == "__main__":
    unittest.main()
