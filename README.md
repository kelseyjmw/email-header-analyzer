# Email Header Analyzer
- **Developed By:** Kelsey White
- **Last Updated:** June 29, 2025

## Overview
Simple Chrome extension tool that parses a raw email header string and extracts SPF, DKIM, and DMARC authentication results from the `Authentication-Results` section.

This tool should not be used as the only means for a user to detect spoofing. Please use your judgement when opening suspicious emails.

## Features
- Parses raw email headers to find authentication results
- Supports multi-line `Authentication-Results` blocks
- Simple user interface
- Displays the overall result
- Displays SPF, DKIM, and DMARC status clearly
- Error handling for empty fields

## How It Works
1. Find the message source of an existing email.
2. Paste the raw email header string into the text area of the tool.
3. The tools finds the `Authentication-Results` block from the header.
4. It extracts the SPF, DKIM, and DMARC results using regular expressions.
5. The results are then rendered dynamically in the UI.
