import asyncio
import unittest
from unittest.mock import patch, AsyncMock

from src.engine.enrich import enrich_rows, compute_confidence


class TestPipelineEmailValidation(unittest.TestCase):
    """Test email validation integration in the enrichment pipeline."""

    def setUp(self):
        """Set up test data."""
        self.test_rows = [
            {
                "name": "John Doe",
                "company": "Acme Corp",
                "email": "john@acme.com",
                "phone": "+1234567890",
                "website": "https://acme.com",
                "source": "gmaps"
            },
            {
                "name": "Jane Smith",
                "company": "Test Inc",
                "email": "jane@gmail.com",
                "phone": "+1987654321",
                "website": "https://test.com",
                "source": "yelp"
            },
            {
                "name": "Bob Wilson",
                "company": "Disposable Corp",
                "email": "bob@10minutemail.com",
                "phone": "+1555555555",
                "website": "https://disposable.com",
                "source": "ai_web"
            },
            {
                "name": "Invalid User",
                "company": "Bad Corp",
                "email": "invalid-email",
                "phone": "invalid-phone",
                "website": "https://bad.com",
                "source": "test"
            }
        ]

    @patch('src.engine.enrich.validate_batch')
    @patch('src.engine.enrich.load_config_from_env_and_args')
    def test_email_validation_enabled(self, mock_config, mock_validate_batch):
        """Test that emails are validated when EMAIL_VALIDATOR_ENABLED=true."""
        # Mock config to enable email validation
        mock_cfg = type('Config', (), {
            'email_validator_enabled': True,
            'email_validator_network': True
        })()
        mock_config.return_value = mock_cfg
        
        # Mock validation results
        mock_validate_batch.return_value = [
            {
                "email": "john@acme.com",
                "is_valid": True,
                "score": 0.9,
                "reason": "mx_ok,smtp_ok"
            },
            {
                "email": "jane@gmail.com", 
                "is_valid": True,
                "score": 0.7,
                "reason": "mx_ok,smtp_ok,free"
            },
            {
                "email": "bob@10minutemail.com",
                "is_valid": False,
                "score": 0.2,
                "reason": "disposable"
            }
        ]
        
        # Run enrichment
        result = asyncio.run(enrich_rows(self.test_rows))
        
        # Verify validation was called
        mock_validate_batch.assert_called_once()
        
        # Verify results
        self.assertEqual(len(result), 4)
        
        # Check first email (valid business email)
        john_row = next(r for r in result if r["email"] == "john@acme.com")
        self.assertTrue(john_row["email_valid"])
        self.assertEqual(john_row["email_score"], 0.9)
        self.assertEqual(john_row["email_reason"], "mx_ok,smtp_ok")
        
        # Check second email (valid but free provider)
        jane_row = next(r for r in result if r["email"] == "jane@gmail.com")
        self.assertTrue(jane_row["email_valid"])
        self.assertEqual(jane_row["email_score"], 0.7)
        self.assertEqual(jane_row["email_reason"], "mx_ok,smtp_ok,free")
        
        # Check third email (disposable - invalid)
        bob_row = next(r for r in result if r["email"] == "bob@10minutemail.com")
        self.assertFalse(bob_row["email_valid"])
        self.assertEqual(bob_row["email_score"], 0.2)
        self.assertEqual(bob_row["email_reason"], "disposable")
        
        # Check fourth email (invalid syntax - not validated)
        invalid_row = next(r for r in result if r["email"] == "invalid-email")
        self.assertNotIn("email_valid", invalid_row)
        self.assertNotIn("email_score", invalid_row)
        self.assertNotIn("email_reason", invalid_row)

    @patch('src.engine.enrich.validate_batch')
    @patch('src.engine.enrich.load_config_from_env_and_args')
    def test_email_validation_disabled(self, mock_config, mock_validate_batch):
        """Test that emails are not validated when EMAIL_VALIDATOR_ENABLED=false."""
        # Mock config to disable email validation
        mock_cfg = type('Config', (), {
            'email_validator_enabled': False,
            'email_validator_network': True
        })()
        mock_config.return_value = mock_cfg
        
        # Run enrichment
        result = asyncio.run(enrich_rows(self.test_rows))
        
        # Verify validation was not called
        mock_validate_batch.assert_not_called()
        
        # Verify no validation fields were added
        for row in result:
            self.assertNotIn("email_valid", row)
            self.assertNotIn("email_score", row)
            self.assertNotIn("email_reason", row)

    @patch('src.engine.enrich.validate_batch')
    @patch('src.engine.enrich.load_config_from_env_and_args')
    def test_validation_failure_graceful_handling(self, mock_config, mock_validate_batch):
        """Test that validation failures are handled gracefully."""
        # Mock config to enable email validation
        mock_cfg = type('Config', (), {
            'email_validator_enabled': True,
            'email_validator_network': True
        })()
        mock_config.return_value = mock_cfg
        
        # Mock validation to raise exception
        mock_validate_batch.side_effect = Exception("Validation service down")
        
        # Run enrichment - should not crash
        result = asyncio.run(enrich_rows(self.test_rows))
        
        # Verify enrichment completed without validation fields
        self.assertEqual(len(result), 4)
        for row in result:
            self.assertNotIn("email_valid", row)
            self.assertNotIn("email_score", row)
            self.assertNotIn("email_reason", row)

    def test_confidence_scoring_with_email_validation(self):
        """Test that confidence scoring includes email validation scores."""
        # Test row with email validation results
        row_with_validation = {
            "name": "John Doe",
            "company": "Acme Corp", 
            "email": "john@acme.com",
            "phone": "+1234567890",
            "role": "CEO",
            "source": "gmaps",
            "email_valid": True,
            "email_score": 0.9,
            "email_reason": "mx_ok,smtp_ok"
        }
        
        # Test row without email validation
        row_without_validation = {
            "name": "Jane Smith",
            "company": "Test Inc",
            "email": "jane@test.com", 
            "phone": "+1987654321",
            "role": "Manager",
            "source": "yelp"
        }
        
        # Compute confidence scores
        conf_with_validation = compute_confidence(row_with_validation)
        conf_without_validation = compute_confidence(row_without_validation)
        
        # Row with validation should have higher confidence
        self.assertGreater(conf_with_validation, conf_without_validation)
        
        # Both should be reasonable scores (0-1)
        self.assertGreaterEqual(conf_with_validation, 0.0)
        self.assertLessEqual(conf_with_validation, 1.0)
        self.assertGreaterEqual(conf_without_validation, 0.0)
        self.assertLessEqual(conf_without_validation, 1.0)

    def test_confidence_scoring_with_low_email_score(self):
        """Test confidence scoring with low email validation score."""
        # Test row with low email validation score
        row_low_score = {
            "name": "Bob Wilson",
            "company": "Disposable Corp",
            "email": "bob@10minutemail.com",
            "phone": "+1555555555", 
            "role": "Founder",
            "source": "ai_web",
            "email_valid": False,
            "email_score": 0.2,
            "email_reason": "disposable"
        }
        
        # Test row with high email validation score
        row_high_score = {
            "name": "Alice Johnson",
            "company": "Premium Corp",
            "email": "alice@premium.com",
            "phone": "+1555555556",
            "role": "Founder", 
            "source": "ai_web",
            "email_valid": True,
            "email_score": 0.95,
            "email_reason": "mx_ok,smtp_ok"
        }
        
        # Compute confidence scores
        conf_low_score = compute_confidence(row_low_score)
        conf_high_score = compute_confidence(row_high_score)
        
        # Row with high email score should have higher confidence
        self.assertGreater(conf_high_score, conf_low_score)
        
        # Both should be reasonable scores
        self.assertGreaterEqual(conf_low_score, 0.0)
        self.assertLessEqual(conf_low_score, 1.0)
        self.assertGreaterEqual(conf_high_score, 0.0)
        self.assertLessEqual(conf_high_score, 1.0)

    @patch('src.engine.enrich.validate_batch')
    @patch('src.engine.enrich.load_config_from_env_and_args')
    def test_batch_validation_concurrency(self, mock_config, mock_validate_batch):
        """Test that batch validation respects concurrency limits."""
        # Mock config to enable email validation
        mock_cfg = type('Config', (), {
            'email_validator_enabled': True,
            'email_validator_network': True
        })()
        mock_config.return_value = mock_cfg
        
        # Mock validation results
        mock_validate_batch.return_value = []
        
        # Run enrichment
        result = asyncio.run(enrich_rows(self.test_rows))
        
        # Verify validate_batch was called with correct concurrency
        mock_validate_batch.assert_called_once()
        call_args = mock_validate_batch.call_args
        self.assertEqual(call_args[1]['concurrency'], 10)  # Default concurrency


if __name__ == "__main__":
    unittest.main()
