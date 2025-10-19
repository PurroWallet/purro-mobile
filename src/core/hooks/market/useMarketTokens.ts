import { useEffect, useState, useCallback } from 'react';

export interface MarketTokenItem {
  id: string;
  symbol: string;
  name: string;
  priceUsd: number | null;
  change24h: number | null; // percent
  logo?: string | null;
}

const GECKO_TERMINAL = 'https://api.geckoterminal.com/api/v2';
const COINGECKO = 'https://api.coingecko.com/api/v3';

async function fetchFromGeckoTerminal(): Promise<MarketTokenItem[]> {
  // Try a pairs endpoint; if shape changes or 404, throw to trigger fallback
  const resp = await fetch(`${GECKO_TERMINAL}/chains/1/pairs?include=token`, {
    headers: { Accept: 'application/json' },
  });
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`GeckoTerminal ${resp.status}: ${text.slice(0, 160)}`);
  }
  const contentType = resp.headers.get?.('content-type') || '';
  if (!contentType.includes('application/json')) {
    const txt = await resp.text();
    throw new Error(`GeckoTerminal non-JSON: ${txt.slice(0, 160)}`);
  }
  const json = await resp.json();
  const results: Array<any> = (json && json.data) || [];
  const mapped = results.map((item: any) => {
    const token =
      item?.attributes?.token ||
      item?.attributes?.base_token ||
      item?.attributes?.token0 ||
      null;
    return {
      id:
        item?.id ||
        item?.attributes?.address ||
        Math.random().toString(36).slice(2),
      symbol: token?.symbol || item?.attributes?.symbol || 'N/A',
      name: token?.name || item?.attributes?.name || token?.symbol || 'Unknown',
      priceUsd: item?.attributes?.price_usd ?? null,
      change24h: null,
      logo: token?.logo || token?.logo_url || null,
    } as MarketTokenItem;
  });

  // Deduplicate by symbol
  const seen = new Set<string>();
  const deduped: MarketTokenItem[] = [];
  for (const t of mapped) {
    const key = (t.symbol || '').toUpperCase();
    if (!seen.has(key)) {
      seen.add(key);
      deduped.push(t);
    }
  }
  if (deduped.length === 0) throw new Error('Empty data from GeckoTerminal');
  return deduped.slice(0, 40);
}

async function fetchFromCoinGecko(): Promise<MarketTokenItem[]> {
  const url = `${COINGECKO}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=40&page=1&sparkline=false&price_change_percentage=24h`;
  const resp = await fetch(url);
  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`CoinGecko ${resp.status}: ${text.slice(0, 160)}`);
  }
  const list = await resp.json();
  return (list || []).map((t: any) => ({
    id: String(t.id || t.symbol || Math.random()),
    symbol: String(t.symbol || '').toUpperCase(),
    name: t.name || t.symbol || 'Unknown',
    priceUsd: typeof t.current_price === 'number' ? t.current_price : null,
    change24h:
      typeof t.price_change_percentage_24h === 'number'
        ? t.price_change_percentage_24h
        : null,
    logo: t.image || null,
  }));
}

export function useMarketTokens() {
  const [tokens, setTokens] = useState<MarketTokenItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      try {
        const fromGt = await fetchFromGeckoTerminal();
        setTokens(fromGt);
      } catch (e) {
        try {
          const fromCg = await fetchFromCoinGecko();
          setTokens(fromCg);
        } catch (e2) {
          // As a last resort, provide a small mock list so UI still renders
          setTokens([
            {
              id: 'btc',
              symbol: 'BTC',
              name: 'Bitcoin',
              priceUsd: 68000,
              change24h: 1.23,
              logo: null,
            },
            {
              id: 'eth',
              symbol: 'ETH',
              name: 'Ethereum',
              priceUsd: 2400,
              change24h: -0.85,
              logo: null,
            },
          ]);
          setError(
            'Service temporarily unavailable (503). Showing sample data.',
          );
        }
      }
    } catch (e: any) {
      setError(String(e?.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { tokens, loading, error, reload };
}
