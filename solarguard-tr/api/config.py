"""
SolarGuard-TR API Configuration
================================
Centralized configuration management
"""
from datetime import timedelta

class Config:
    """Application configuration"""
    
    # API Keys
    NASA_API_KEY = "imOU58mnc7apZc1HtuFRxbWdC40A9ujWVj2KI132"
    
    # API Endpoints
    DONKI_BASE = "https://api.nasa.gov/DONKI"
    NOAA_BASE = "https://services.swpc.noaa.gov"
    CELESTRAK_BASE = "https://celestrak.org/NORAD/elements"
    
    # Cache Settings
    NOAA_CACHE_TTL = timedelta(minutes=5)
    NASA_CACHE_TTL = timedelta(minutes=10)
    TLE_CACHE_TTL = timedelta(hours=12)
    
    # Request Settings
    REQUEST_TIMEOUT = 15.0
    MAX_RETRIES = 3
    RETRY_DELAY = 2.0
    
    # Data Processing
    KP_HISTORY_HOURS = 48
    FORECAST_HOURS = 96
    FLARE_HISTORY_DAYS = 30
    STORM_HISTORY_DAYS = 30
    
    # Risk Thresholds
    KP_STORM_THRESHOLD = 4.0
    KP_SEVERE_STORM_THRESHOLD = 5.0
    
    # Telemetry Defaults
    DEFAULT_SOLAR_WIND = 400.0
    DEFAULT_DENSITY = 5.0
    DEFAULT_BZ = 0.0

config = Config()