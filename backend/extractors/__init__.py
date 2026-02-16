"""API clients for external data sources and validators.

All clients must accept a dry_run flag and log 'DRY_RUN active' when enabled.
"""

import logging

logger = logging.getLogger(__name__)

