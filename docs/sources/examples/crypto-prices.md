---
slug: '/examples/crypto-prices'
title: Crypto prices
menuTitle: Crypto prices
description: Visualize cryptocurrency prices from the CoinPaprika API using the Infinity data source.
keywords:
  - infinity
  - CoinPaprika
  - cryptocurrency
  - crypto prices
  - JSON API
labels:
  products:
    - oss
    - enterprise
    - cloud
weight: 220
---

# Crypto prices

Build a cryptocurrency prices dashboard using the [CoinPaprika API](https://docs.coinpaprika.com/). The market data endpoints used in this guide require no API key, so there are no secrets to manage in your data source configuration. This makes the API a convenient choice for demo dashboards and for learning Infinity query features.

## Before you begin

- No account or API key is required for the endpoints in this guide.
- The API covers 12,000+ active cryptocurrencies and returns JSON.

## Configure the data source

1. In Grafana, navigate to **Connections** > **Data sources**.
1. Click **Add new data source** and select **Infinity**.
1. In **Allowed hosts**, enter `https://api.coinpaprika.com`.
1. Click **Save & test**.

## Query examples

### Top 20 coins in a table panel

Query the tickers endpoint to list the top coins by market cap rank.

**Configuration:**

| Setting | Value |
|---------|-------|
| **Type** | JSON |
| **Source** | URL |
| **URL** | `https://api.coinpaprika.com/v1/tickers?limit=20` |
| **Parser** | Backend |
| **Root selector** | Leave empty. The response is an array at the root level. |

**Columns:**

| Selector | Alias | Type |
|----------|-------|------|
| `symbol` | Symbol | String |
| `name` | Name | String |
| `quotes.USD.price` | Price (USD) | Number |
| `quotes.USD.percent_change_24h` | Change 24h (%) | Number |
| `quotes.USD.market_cap` | Market cap (USD) | Number |
| `quotes.USD.volume_24h` | Volume 24h (USD) | Number |

Add the query to a **Table** panel. The `limit` parameter controls how many coins the API returns, ordered by rank.

To improve readability, use field overrides to set the **Unit** to **Currency > Dollars ($)** for the price and market cap columns, and **Misc > Percent (0-100)** for the change column.

### Single coin in a stat panel

To track one coin, query its ticker directly.

**Configuration:**

| Setting | Value |
|---------|-------|
| **Type** | JSON |
| **Source** | URL |
| **URL** | `https://api.coinpaprika.com/v1/tickers/btc-bitcoin` |
| **Parser** | Backend |
| **Root selector** | Leave empty |

**Columns:**

| Selector | Alias | Type |
|----------|-------|------|
| `quotes.USD.price` | Price (USD) | Number |
| `quotes.USD.percent_change_24h` | Change 24h (%) | Number |

Add the query to a **Stat** panel and set the unit to **Currency > Dollars ($)**.

Coin IDs follow the `{symbol}-{name}` pattern, for example `btc-bitcoin`, `eth-ethereum`, or `sol-solana`. To find other IDs, query the [coins list](https://api.coinpaprika.com/v1/coins). To switch coins from a dashboard dropdown, create a dashboard variable and use it in the URL: `https://api.coinpaprika.com/v1/tickers/${coin}`.

### Response structure reference

The tickers endpoint returns an array of objects with the quote data nested under `quotes.USD`:

```json
[
  {
    "id": "btc-bitcoin",
    "name": "Bitcoin",
    "symbol": "BTC",
    "rank": 1,
    "quotes": {
      "USD": {
        "price": 63021.65,
        "volume_24h": 21364530718.71,
        "market_cap": 1264055075354,
        "percent_change_24h": -1.72
      }
    }
  }
]
```

Some fields are omitted for brevity. Each quote object also includes fields such as `percent_change_1h`, `percent_change_7d`, and `ath_price`.

## Troubleshoot

| Issue | Cause | Solution |
|-------|-------|----------|
| Empty response | Root selector set | Leave the root selector empty. The tickers endpoint returns an array at the root level. |
| 404 Not Found | Unknown coin ID | Coin IDs use the `{symbol}-{name}` format, such as `btc-bitcoin`. Query `/v1/coins` for the full list. |
| 429 Too Many Requests | Dashboard refresh interval too aggressive | Increase the refresh interval. Prices on the free endpoints update every few minutes. |
| Price columns show long decimals | Default number formatting | Set a currency unit or a decimals limit in the panel field options. |

## Additional resources

- [CoinPaprika API documentation](https://docs.coinpaprika.com/)
- [List of coin IDs](https://api.coinpaprika.com/v1/coins)
