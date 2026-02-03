import unittest
import os
import json
import pandas as pd

from src.utils.selection import choose_primary_email


class TestSelectionAndExports(unittest.TestCase):
    def test_choose_primary_email_prefers_valid_personal(self):
        emails = [
            {"email": "info@example.com", "source": "contact_page_extractor", "validation": {"is_valid": True, "deliverability": "medium"}},
            {"email": "jane.doe@example.com", "source": "hunter", "validation": {"is_valid": True, "deliverability": "medium"}},
            {"email": "sales@example.com", "source": "hunter", "validation": {"is_valid": True, "deliverability": "high"}},
        ]
        best = choose_primary_email(emails)
        # personal (jane.doe) should beat role even with same deliverability source tie-breakers
        self.assertEqual(best, "jane.doe@example.com")

    def test_choose_primary_email_prefers_contact_extractor(self):
        emails = [
            {"email": "info@example.com", "source": "contact_page_extractor", "validation": {"is_valid": True, "deliverability": "high"}},
            {"email": "jane.doe@example.com", "source": "hunter", "validation": {"is_valid": True, "deliverability": "medium"}},
        ]
        best = choose_primary_email(emails)
        self.assertEqual(best, "info@example.com")


if __name__ == "__main__":
    unittest.main()
