---
slug: '/time-formats'
title: 'Time formats'
menuTitle: Time formats
description: Configure timestamp parsing and time formats for the Infinity data source columns.
aliases:
  - /time-formats
keywords:
  - infinity
  - time format
  - timestamp
  - date parsing
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 210
---

# Time formats

When working with time-based data, you need to tell the Infinity data source how to parse timestamp values from your data. The parsing method depends on which parser you're using.

## Column types for time data

When defining columns, you can choose from three time-related types:

| Column type | Description | Use when |
|-------------|-------------|----------|
| Time | Standard date/time parsing | Your data uses readable date formats (ISO 8601, RFC formats) |
| Time (UNIX ms) | Unix epoch in milliseconds | Your data uses millisecond timestamps (e.g., `1262304000000`) |
| Time (UNIX s) | Unix epoch in seconds | Your data uses second timestamps (e.g., `1262304000`) |

## Frontend parser time formats

When using the Frontend parser, timestamp fields are parsed using JavaScript's built-in `Date` constructor. The following formats are automatically recognized:

```text
2017
2017-02
2017-03
2017/04
2017/05/23
2017-06-25T12:10:00Z
July 12, 2017 03:24:00
2017/08/23 10:30
2017/09/23 10:30:20
2017-10-23 10:30:20
Thu Nov 23 2017 10:30:20 GMT+0000 (Greenwich Mean Time)
Sat, 23 Dec 2017 10:30:20 GMT
01/29/2018
```

For more details on supported formats, refer to the [MDN Date documentation](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/Date).

## Backend parser time formats

When using the Backend parser (JSONata or JQ), you can specify a custom time format using Go's time layout syntax. Select from predefined formats or enter a custom format.

### Predefined formats

The following formats are available in the Time Format drop-down:

| Label | Format pattern |
|-------|----------------|
| Auto | (automatic detection) |
| Default ISO | `2006-01-02T15:04:05Z07:00` |
| YYYY-MM-DD | `2006-01-02` |
| YYYY/MM/DD | `2006/01/02` |
| YYYY / MM / DD | `2006 / 01 / 02` |
| YYYYMMDD | `20060102` |
| YYYY-MM | `2006-01` |
| YYYY/MM | `2006/01` |
| YYYYMM | `200601` |
| YYYY | `2006` |
| YYYY/MM/DD HH:mm | `2006/01/02 15:04` |
| YYYY/MM/DD HH:mm:ss | `2006/01/02 15:04:05` |
| ANSIC | `Mon Jan _2 15:04:05 2006` |
| UnixDate | `Mon Jan _2 15:04:05 MST 2006` |
| RubyDate | `Mon Jan 02 15:04:05 -0700 2006` |
| RFC822 | `02 Jan 06 15:04 MST` |
| RFC822Z | `02 Jan 06 15:04 -0700` |
| RFC850 | `Monday, 02-Jan-06 15:04:05 MST` |
| RFC1123 | `Mon, 02 Jan 2006 15:04:05 MST` |
| RFC1123Z | `Mon, 02 Jan 2006 15:04:05 -0700` |
| RFC3339 | `2006-01-02T15:04:05Z07:00` |
| RFC3339Nano | `2006-01-02T15:04:05.999999999Z07:00` |
| Kitchen | `3:04PM` |
| Stamp | `Jan _2 15:04:05` |

### Custom formats

You can enter a custom format pattern using Go's reference time layout. The reference time is:

```text
Mon Jan 2 15:04:05 MST 2006
```

Each component maps to a specific value:

| Component | Reference value | Description |
|-----------|-----------------|-------------|
| Year | `2006` | Four-digit year |
| Month | `01` or `Jan` | Numeric or abbreviated |
| Day | `02` or `_2` | Zero-padded or space-padded |
| Hour (24h) | `15` | 24-hour format |
| Hour (12h) | `03` | 12-hour format |
| Minute | `04` | Minutes |
| Second | `05` | Seconds |
| AM/PM | `PM` | AM/PM indicator |
| Timezone | `MST` or `-0700` | Timezone abbreviation or offset |

**Example custom formats:**

- `02/01/2006` — DD/MM/YYYY (European format)
- `01-02-2006 03:04 PM` — MM-DD-YYYY with 12-hour time
- `2006.01.02` — YYYY.MM.DD with dots

## Unix epoch timestamps

For data that uses Unix epoch timestamps, select the appropriate column type:

### Milliseconds (UNIX ms)

For timestamps in milliseconds since January 1, 1970:

```csv
timestamp,value
1262304000000,200
1293840000000,201
```

Select **Time (UNIX ms)** as the column type.

### Seconds (UNIX s)

For timestamps in seconds since January 1, 1970:

```csv
timestamp,value
1262304000,200
1293840000,201
```

Select **Time (UNIX s)** as the column type.

## Troubleshoot time parsing

If your timestamps aren't parsing correctly:

1. **Check the column type** — Ensure you've selected the correct type (Time, UNIX ms, or UNIX s)
2. **Verify the format** — For backend parser, ensure your format pattern matches your data exactly
3. **Test with Auto** — Try the Auto format option first to see if automatic detection works
4. **Check for quotes** — Some CSV data may have quoted date strings that need special handling
5. **Timezone issues** — If times appear shifted, check that your format includes timezone information
