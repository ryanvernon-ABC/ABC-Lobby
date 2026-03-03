# ABC Lobby Kiosk App

A simple kiosk-style web app designed for iPad or touch devices with two options:

1. **Basic Needs Assistance**
2. **Visitor Sign In**

## Features

- Main menu with two large touch-friendly buttons.
- **Basic Needs Assistance** route that loads:
  - `https://apricot.socialsolutions.com/document/edit/id/new/form_id/497`
- **Visitor Sign In** form with:
  - Name
  - Reason for Visit
- On submit:
  - Stores entries in an Excel workbook (`data/visitor-checkins.xlsx`)
  - Captures **Check-In Time** based on submit timestamp
  - Generates a printable name-tag file
  - Attempts to send the name tag to a wireless printer queue via `lp` (when configured)
- On non-home pages:
  - Back button to return to main selection screen
  - Auto-return to main selection screen after **30 seconds** of inactivity

## Run locally

```bash
npm install
npm start
```

Then open `http://localhost:3000`.

## Printer configuration

Set a CUPS printer queue name in environment variable `TAG_PRINTER_NAME`.

```bash
TAG_PRINTER_NAME="YourWirelessPrinterQueue" npm start
```

If no printer is configured, the app still creates a name-tag text file in `tmp/labels/`.

## Notes

- The external Apricot form may block iframe embedding depending on its security headers. A direct link is included on the Basic Needs page as fallback.
- For kiosk use on iPad, configure Guided Access / kiosk mode in device settings.
