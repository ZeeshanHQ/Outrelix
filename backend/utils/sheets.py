"""Google Sheets integration utilities for the Outrelix Lead Engine."""

import json
import logging
from typing import Any, Dict, List, Optional

import gspread
import pandas as pd
from gspread_dataframe import set_with_dataframe
from oauth2client.service_account import ServiceAccountCredentials

logger = logging.getLogger(__name__)


class GoogleSheetsWriter:
    """Handles writing data to Google Sheets with authentication and tab management."""
    
    def __init__(self, service_account_json: str, spreadsheet_url: str, dry_run: bool = False):
        """Initialize the Google Sheets writer.
        
        Args:
            service_account_json: JSON string containing service account credentials
            spreadsheet_url: URL of the target Google Sheet
            dry_run: If True, mock all operations
        """
        self.service_account_json = service_account_json
        self.spreadsheet_url = spreadsheet_url
        self.dry_run = dry_run
        
        if dry_run:
            logger.info("DRY_RUN: Google Sheets operations will be mocked")
            self.client = None
            self.spreadsheet = None
        else:
            self.client = self._authenticate()
            self.spreadsheet = self._get_spreadsheet()
    
    def _authenticate(self) -> gspread.Client:
        """Authenticate with Google Sheets API using service account."""
        try:
            # Parse the JSON string
            creds_dict = json.loads(self.service_account_json)
            
            # Define the scope
            scope = [
                'https://spreadsheets.google.com/feeds',
                'https://www.googleapis.com/auth/drive'
            ]
            
            # Create credentials
            credentials = ServiceAccountCredentials.from_json_keyfile_dict(creds_dict, scope)
            
            # Create client
            client = gspread.authorize(credentials)
            logger.info("Successfully authenticated with Google Sheets API")
            return client
            
        except Exception as e:
            logger.error(f"Failed to authenticate with Google Sheets: {e}")
            raise
    
    def _get_spreadsheet(self) -> gspread.Spreadsheet:
        """Get the target spreadsheet by URL."""
        try:
            # Extract spreadsheet ID from URL
            if '/d/' in self.spreadsheet_url:
                spreadsheet_id = self.spreadsheet_url.split('/d/')[1].split('/')[0]
            else:
                raise ValueError("Invalid Google Sheets URL format")
            
            spreadsheet = self.client.open_by_key(spreadsheet_id)
            logger.info(f"Successfully opened spreadsheet: {spreadsheet.title}")
            return spreadsheet
            
        except Exception as e:
            logger.error(f"Failed to open spreadsheet: {e}")
            raise
    
    def _get_or_create_worksheet(self, tab_name: str) -> gspread.Worksheet:
        """Get existing worksheet or create new one."""
        try:
            # Try to get existing worksheet
            worksheet = self.spreadsheet.worksheet(tab_name)
            logger.info(f"Using existing worksheet: {tab_name}")
            return worksheet
        except gspread.WorksheetNotFound:
            # Create new worksheet
            worksheet = self.spreadsheet.add_worksheet(title=tab_name, rows=1000, cols=50)
            logger.info(f"Created new worksheet: {tab_name}")
            return worksheet
    
    def write_dataframe(self, df: pd.DataFrame, tab_name: str, clear_existing: bool = True) -> bool:
        """Write a DataFrame to a specific tab in Google Sheets.
        
        Args:
            df: DataFrame to write
            tab_name: Name of the worksheet tab
            clear_existing: Whether to clear existing data before writing
            
        Returns:
            True if successful, False otherwise
        """
        if self.dry_run:
            logger.info(f"DRY_RUN: Would write {len(df)} rows to Google Sheets tab '{tab_name}'")
            return True
        
        try:
            # Get or create the worksheet
            worksheet = self._get_or_create_worksheet(tab_name)
            
            # Clear existing data if requested
            if clear_existing:
                worksheet.clear()
                logger.info(f"Cleared existing data in tab '{tab_name}'")
            
            # Write the DataFrame
            set_with_dataframe(worksheet, df, include_index=False, resize=True)
            logger.info(f"Successfully wrote {len(df)} rows to tab '{tab_name}'")
            
            return True
            
        except Exception as e:
            logger.error(f"Failed to write DataFrame to tab '{tab_name}': {e}")
            return False
    
    def write_multiple_tabs(self, data_dict: Dict[str, pd.DataFrame]) -> Dict[str, bool]:
        """Write multiple DataFrames to different tabs.
        
        Args:
            data_dict: Dictionary mapping tab names to DataFrames
            
        Returns:
            Dictionary mapping tab names to success status
        """
        if self.dry_run:
            logger.info(f"DRY_RUN: Would write {len(data_dict)} tabs to Google Sheets")
            return {tab: True for tab in data_dict.keys()}
        
        results = {}
        for tab_name, df in data_dict.items():
            logger.info(f"Writing tab '{tab_name}' with {len(df)} rows...")
            success = self.write_dataframe(df, tab_name)
            results[tab_name] = success
            
            if not success:
                logger.error(f"Failed to write tab '{tab_name}', stopping")
                break
        
        return results
    
    def test_connection(self) -> bool:
        """Test the connection to Google Sheets."""
        if self.dry_run:
            logger.info("DRY_RUN: Connection test would succeed")
            return True
        
        try:
            # Try to access the spreadsheet
            title = self.spreadsheet.title
            logger.info(f"Connection test successful. Spreadsheet: {title}")
            return True
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return False


def create_sheets_writer(config: Any, dry_run: bool = False) -> Optional[GoogleSheetsWriter]:
    """Create a Google Sheets writer instance from config.
    
    Args:
        config: Configuration object with sheets settings
        dry_run: Whether to run in dry-run mode
        
    Returns:
        GoogleSheetsWriter instance or None if not configured
    """
    try:
        # Check if sheets integration is enabled
        if not hasattr(config, 'push_to_gsheets') or not config.push_to_gsheets:
            logger.info("Google Sheets integration not enabled")
            return None
        
        # Check if required config is present
        if not hasattr(config, 'google_service_account_json') or not config.google_service_account_json:
            logger.warning("Google Sheets enabled but service account JSON not configured")
            return None
        
        if not hasattr(config, 'gsheets_spreadsheet_url') or not config.gsheets_spreadsheet_url:
            logger.warning("Google Sheets enabled but spreadsheet URL not configured")
            return None
        
        # Create writer
        writer = GoogleSheetsWriter(
            service_account_json=config.google_service_account_json,
            spreadsheet_url=config.gsheets_spreadsheet_url,
            dry_run=dry_run
        )
        
        logger.info("Google Sheets writer created successfully")
        return writer
        
    except Exception as e:
        logger.error(f"Failed to create Google Sheets writer: {e}")
        return None
