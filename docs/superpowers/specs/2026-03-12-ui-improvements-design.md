# MAC Randomizer UI Improvements — Design Spec

**Date:** 2026-03-12

## Overview

Improve the Refresh MAC Tool with a larger input, batch URL generation, one-click copy, and a polished aesthetic. No build tooling introduced — stays as a static HTML/JS app.

## Layout

Single card, stacked sections separated by small uppercase gray divider labels.

```
┌─────────────────────────────────┐
│       Refresh MAC Tool          │
├─ Input ─────────────────────────┤
│  [large textarea, ~6 rows]      │
├─ Options ───────────────────────┤
│  Param:  ◉ device_mac           │
│          ○ client_mac           │
│  Count:  [1] (number input)     │
│  [Regenerate MAC]               │
├─ Output ────────────────────────┤
│  [Copy All]                     │
│  http://... [⎘]                 │
│  http://... [⎘]                 │
└─────────────────────────────────┘
```

## Sections

### Input
- Textarea, ~6 rows tall, full width within card
- Placeholder: "Enter your captive portal URL here..."
- On input change: parse URL, detect MAC params, populate Options section

### Options
- **Param selector**: radio buttons for each detected MAC param (existing logic, excludes `ap_mac`/`apmac`)
- **Count**: number input, label "Number of URLs", default 1, min 1, max 10
- **Regenerate MAC** button: primary action, full width or wide, at bottom of this section
- Options section (param radios + count + button) hidden until a valid URL with MAC params is detected

### Output
- Hidden until first generation
- **Copy All** button at top: copies all generated URLs as newline-separated text to clipboard
- Each URL row:
  - Monospace font, truncated with ellipsis if too long
  - Clicking the URL text opens it in a new tab
  - Copy icon button (⎘) on the right copies that single URL to clipboard
- Copy feedback: button briefly changes to a checkmark/green on success

## Aesthetic

- Tailwind slate color palette (slate-800 heading, slate-500 section labels, slate-100 background)
- Card: white background, rounded-xl, subtle shadow
- Section dividers: `border-t border-slate-100` with small `text-xs uppercase tracking-wide text-slate-400` label
- Textarea and inputs: `border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500`
- Regenerate button: solid blue, rounded-lg, full width
- Copy All: outlined secondary style
- Per-row copy button: ghost/icon style, slate-400, turns green briefly on copy

## Behavior Notes

- Generated URLs preserve the existing randomization logic (last 3 octets randomized, first 3 kept)
- Output URLs display with `%3A` encoding (correct — this is valid URL format)
- Count input generates N independent randomizations on each click of Regenerate
- Regenerating replaces the previous output list entirely
