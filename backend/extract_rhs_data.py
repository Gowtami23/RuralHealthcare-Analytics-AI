"""
Extract table data from Rural Health Statistics (RHS) PDF reports
published by the Ministry of Health & Family Welfare, Government of India.

HOW TO USE:
1. Download one or more RHS PDF reports (different years) into a folder,
   e.g. /home/claude/rhs_pdfs/RHS_2021-22.pdf, RHS_2019-20.pdf, etc.
2. Update the PDF_FOLDER path below.
3. Run this script. It will:
   - Scan every page of every PDF
   - Extract all tables it can find
   - Save each table as a separate CSV inside /home/claude/extracted_tables/
   - Print a summary so you can identify which tables are the ones you need
     (state-wise SC/PHC/CHC counts, district-wise counts, etc.)

NOTE: Government PDFs are messy. This script casts a wide net and extracts
EVERY table it finds — you will need to open the output CSVs and manually
pick out the ones relevant to your project (e.g. "State/UT-wise number of
Sub-Centres, PHCs, CHCs"). Some tables may need manual cleanup (merged
header rows, footnotes, etc.) — this is normal for real government data.
"""

import pdfplumber
import pandas as pd
import os
import re

# ---- CONFIG: update these paths ----
PDF_FOLDER =  r"C:\Users\Kattunga Gowtami\Downloads\RuralHealthcare"        # folder where you put downloaded PDFs
OUTPUT_FOLDER =  r"C:\Users\Kattunga Gowtami\Downloads\RuralHealthcare\extracted_tables" # where CSVs will be saved

# Only process PDFs whose filename contains one of these keywords.
# Set to None to process ALL PDFs in the folder instead.
ONLY_FILES_CONTAINING = ["Rural_Health_Statistics"]
# -------------------------------------

os.makedirs(OUTPUT_FOLDER, exist_ok=True)


def clean_filename(text, max_len=60):
    """Make a safe filename from a string."""
    text = re.sub(r"[^a-zA-Z0-9_\-]", "_", text)
    return text[:max_len]


def extract_tables_from_pdf(pdf_path):
    """Extract all tables from a single PDF and save each as a CSV."""
    pdf_name = os.path.splitext(os.path.basename(pdf_path))[0]
    print(f"\n{'='*70}")
    print(f"Processing: {pdf_name}")
    print(f"{'='*70}")

    table_count = 0

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")

        for page_num, page in enumerate(pdf.pages, start=1):
            try:
                tables = page.extract_tables()
            except Exception as e:
                print(f"  Page {page_num}: SKIPPED (extraction error: "
                      f"{type(e).__name__})")
                continue

            if not tables:
                continue

            for t_idx, table in enumerate(tables):
                if not table or len(table) < 2:
                    continue  # skip empty/near-empty tables

                try:
                    df = pd.DataFrame(table[1:], columns=table[0])
                except Exception:
                    # fallback if header row is malformed
                    df = pd.DataFrame(table)

                # Skip tiny junk tables (e.g. 1x1 stray boxes)
                if df.shape[0] < 2 or df.shape[1] < 2:
                    continue

                table_count += 1
                out_name = f"{clean_filename(pdf_name)}_page{page_num}_table{t_idx+1}.csv"
                out_path = os.path.join(OUTPUT_FOLDER, out_name)
                df.to_csv(out_path, index=False)

                print(f"  Page {page_num}, Table {t_idx+1}: "
                      f"{df.shape[0]} rows x {df.shape[1]} cols -> {out_name}")

    print(f"\nExtracted {table_count} tables from {pdf_name}")
    return table_count


def main():
    if not os.path.exists(PDF_FOLDER):
        print(f"ERROR: {PDF_FOLDER} does not exist. "
              f"Create it and put your downloaded RHS PDFs inside.")
        return

    pdf_files = [f for f in os.listdir(PDF_FOLDER) if f.lower().endswith(".pdf")]

    if ONLY_FILES_CONTAINING:
        pdf_files = [
            f for f in pdf_files
            if any(keyword in f for keyword in ONLY_FILES_CONTAINING)
        ]

    if not pdf_files:
        print(f"No matching PDF files found in {PDF_FOLDER}. "
              f"Check ONLY_FILES_CONTAINING or add PDFs.")
        return

    print(f"Found {len(pdf_files)} PDF(s) to process: {pdf_files}")

    total_tables = 0
    for pdf_file in pdf_files:
        pdf_path = os.path.join(PDF_FOLDER, pdf_file)
        try:
            total_tables += extract_tables_from_pdf(pdf_path)
        except Exception as e:
            print(f"\n!! FAILED on {pdf_file}: {type(e).__name__}: {e}")
            print("Skipping to next PDF.\n")
            continue

    print(f"\n\nDONE. Extracted {total_tables} total tables into: {OUTPUT_FOLDER}")
    print("Next step: open the CSVs and identify the ones matching tables like:")
    print("  - 'State/UT-wise number of Sub-Centres, PHCs, CHCs'")
    print("  - 'District-wise availability of health centres'")
    print("Then combine the relevant ones (one per year) into a single")
    print("clean CSV with columns: State, Year, SCs, PHCs, CHCs, Hospitals")


if __name__ == "__main__":
    main()
