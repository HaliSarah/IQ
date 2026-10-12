# =============================================================================
# Title:       NOAA Storm Events Data Downloader & Merger
# Author:      Hali Sarah Parsons
# Date:        2026-09-22
# Modified By: Claude (portable output path, corrected download comment)
# Description: Downloads NOAA Storm Events detail CSV files for 2020-2026
#              directly from NCEI, decompresses them, and merges into one
#              clean dataset for use in DSC 450 Project 1 extreme weather
#              severity prediction model.
# =============================================================================

import os
import gzip
import requests
import pandas as pd
from io import BytesIO

# Output directory: the user's own Downloads folder. Built from the home
# directory so the script runs on any machine, not just the author's.
OUTPUT_DIR = os.path.join(os.path.expanduser("~"), "Downloads")
OUTPUT_FILE = os.path.join(OUTPUT_DIR, "noaa_storm_events_2020_2026.csv")

# Base URL for NOAA NCEI Storm Events bulk CSV files
BASE_URL = "https://www.ncei.noaa.gov/pub/data/swdi/stormevents/csvfiles/"

# File names for each year — pulled directly from the NOAA directory listing
# Format: StormEvents_details-ftp_v1.0_d{YEAR}_c{COMPILED_DATE}.csv.gz
FILES = {
    2020: "StormEvents_details-ftp_v1.0_d2020_c20260323.csv.gz",
    2021: "StormEvents_details-ftp_v1.0_d2021_c20260323.csv.gz",
    2022: "StormEvents_details-ftp_v1.0_d2022_c20260625.csv.gz",
    2023: "StormEvents_details-ftp_v1.0_d2023_c20260323.csv.gz",
    2024: "StormEvents_details-ftp_v1.0_d2024_c20260728.csv.gz",
    2025: "StormEvents_details-ftp_v1.0_d2025_c20260819.csv.gz",
    2026: "StormEvents_details-ftp_v1.0_d2026_c20260918.csv.gz",
}

def download_and_read(year, filename):
    """
    Downloads a gzipped CSV from NOAA, decompresses it in memory,
    and returns it as a DataFrame. Avoids saving intermediate files
    to disk — only the final merged CSV is saved.
    """
    url = BASE_URL + filename
    print(f"  Downloading {year}... ", end="", flush=True)

    try:
        # Each year's file is downloaded whole into memory; the 60-second
        # timeout keeps a stalled connection from hanging the whole run.
        response = requests.get(url, timeout=60)
        response.raise_for_status()

        # Decompress gzip in memory and read directly into pandas
        with gzip.open(BytesIO(response.content)) as f:
            df = pd.read_csv(f, low_memory=False)

        print(f"{len(df):,} records")
        return df

    except requests.exceptions.RequestException as e:
        # If a year fails, skip it and continue — don't abort the whole run
        print(f"FAILED ({e})")
        return None

def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    all_frames = []

    print("Downloading NOAA Storm Events data (2020-2026)...\n")

    for year, filename in FILES.items():
        df = download_and_read(year, filename)
        if df is not None:
            # Tag each row with its source year for traceability
            df["SOURCE_YEAR"] = year
            all_frames.append(df)

    if not all_frames:
        print("\nNo data downloaded. Check your internet connection.")
        return

    # Merge all years into one DataFrame
    print("\nMerging all years...")
    merged = pd.concat(all_frames, ignore_index=True)
    print(f"Total records: {len(merged):,}")
    print(f"Columns: {list(merged.columns)}")

    # Save merged CSV to Downloads
    merged.to_csv(OUTPUT_FILE, index=False)
    print(f"\nSaved to: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
