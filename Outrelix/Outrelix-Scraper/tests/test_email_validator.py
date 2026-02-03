import asyncio
import unittest

from src.engine.email_validator import validate_email


class TestEmailValidator(unittest.TestCase):
    def test_invalid_syntax(self):
        res = asyncio.run(validate_email("bad@@domain"))
        self.assertFalse(res["is_valid"])  # syntax should fail

    def test_disposable(self):
        res = asyncio.run(validate_email("user@mailinator.com"))
        self.assertIn("disposable", res["reason"])  # flagged

    def test_free_provider(self):
        res = asyncio.run(validate_email("user@gmail.com"))
        self.assertIn("free", res["reason"])  # flagged but still may be valid

    def test_business_email_mx_only(self):
        # Force network disabled to avoid real SMTP in CI
        import os
        os.environ["EMAIL_VALIDATOR_NETWORK"] = "false"
        res = asyncio.run(validate_email("info@example.com"))
        # MX for example.com may not exist; allow either path but ensure output has fields
        self.assertIn("email", res)
        self.assertIn("is_valid", res)
        self.assertIn("score", res)


if __name__ == "__main__":
    unittest.main()



