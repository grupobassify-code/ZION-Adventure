import { useState, useEffect } from 'react';

export const ADSENSE_CLIENT_ID = 'ca-pub-9363587326808424';
const LOCAL_STORAGE_EXCLUDE_KEY = 'zion_adsense_exclude_ip_pref';

// Configured creator IP / Router IP from environment or router specification
const envObj = (import.meta as unknown as { env?: Record<string, string | undefined> })?.env;
export const CONFIGURED_CREATOR_IP = envObj?.VITE_CREATOR_EXCLUDED_IP || '192.168.68.1';

export function isCreatorIpMatch(ip: string | undefined): boolean {
  if (!ip) return false;
  const cleanIp = ip.trim().replace(/^::ffff:/, '');
  const cleanTarget = CONFIGURED_CREATOR_IP.trim().replace(/^::ffff:/, '');
  
  // Exact match with router IP or env var
  if (cleanIp === cleanTarget) return true;
  // Local development host
  if (cleanIp === '127.0.0.1' || cleanIp === '::1' || cleanIp === 'localhost') return true;
  // Router subnet match (e.g. 192.168.68.* or same gateway)
  if (cleanTarget.startsWith('192.168.') && cleanIp.startsWith('192.168.')) {
    const targetSubnet = cleanTarget.split('.').slice(0, 3).join('.');
    const ipSubnet = cleanIp.split('.').slice(0, 3).join('.');
    if (targetSubnet === ipSubnet) return true;
  }
  return false;
}

export interface AdConfigState {
  clientIp: string;
  isExcluded: boolean;
  excludedIps: string[];
  publisherId: string;
  adsEnabled: boolean;
  loading: boolean;
}

let cachedAdConfig: AdConfigState = {
  clientIp: '',
  isExcluded: false,
  excludedIps: [],
  publisherId: ADSENSE_CLIENT_ID,
  adsEnabled: false,
  loading: true,
};

const listeners = new Set<(state: AdConfigState) => void>();

function notifyListeners() {
  listeners.forEach((listener) => {
    try {
      listener({ ...cachedAdConfig });
    } catch (e) {
      console.error('Error notifying adConfig listener:', e);
    }
  });
}

// Dynamically inject the AdSense script ONLY when user is NOT excluded
let scriptInjected = false;

export function injectAdSenseScript(): void {
  if (typeof window === 'undefined') return;
  if (scriptInjected) return;
  if (cachedAdConfig.isExcluded) {
    return;
  }

  // Check if script already exists in DOM
  const existing = document.querySelector(`script[src*="ca-pub-9363587326808424"]`);
  if (existing) {
    scriptInjected = true;
    return;
  }

  try {
    const script = document.createElement('script');
    script.async = true;
    script.crossOrigin = 'anonymous';
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`;
    document.head.appendChild(script);
    scriptInjected = true;
  } catch (err) {
    console.warn('Could not inject AdSense script:', err);
  }
}

export async function fetchAdConfig(): Promise<AdConfigState> {
  try {
    const res = await fetch('/api/ad-config');
    if (res.ok) {
      const data = await res.json();
      const localPref = localStorage.getItem(LOCAL_STORAGE_EXCLUDE_KEY);
      
      // If user locally marked themselves as creator/excluded, or matches configured creator IP, prioritize exclusion
      const isCreatorIp = isCreatorIpMatch(data.clientIp);
      const isExcluded = Boolean(data.isExcluded || isCreatorIp || localPref === 'true');

      cachedAdConfig = {
        clientIp: data.clientIp || '127.0.0.1',
        isExcluded,
        excludedIps: data.excludedIps || [],
        publisherId: data.publisherId || ADSENSE_CLIENT_ID,
        adsEnabled: !isExcluded,
        loading: false,
      };

      if (!isExcluded) {
        injectAdSenseScript();
      }

      notifyListeners();
      return cachedAdConfig;
    }
  } catch (err) {
    console.warn('Failed to fetch ad config from server, checking local fallback:', err);
  }

  const localPref = typeof window !== 'undefined' ? localStorage.getItem(LOCAL_STORAGE_EXCLUDE_KEY) === 'true' : false;
  cachedAdConfig = {
    clientIp: 'Detectando...',
    isExcluded: localPref,
    excludedIps: [],
    publisherId: ADSENSE_CLIENT_ID,
    adsEnabled: !localPref,
    loading: false,
  };

  if (!localPref) {
    injectAdSenseScript();
  }

  notifyListeners();
  return cachedAdConfig;
}

export async function excludeCurrentIp(customIp?: string): Promise<boolean> {
  try {
    localStorage.setItem(LOCAL_STORAGE_EXCLUDE_KEY, 'true');
    const ipToExclude = customIp || cachedAdConfig.clientIp;
    const res = await fetch('/api/ad-config/exclude-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: ipToExclude }),
    });

    if (res.ok) {
      const data = await res.json();
      cachedAdConfig = {
        ...cachedAdConfig,
        clientIp: data.clientIp,
        isExcluded: true,
        excludedIps: data.excludedIps,
        adsEnabled: false,
        loading: false,
      };
      notifyListeners();
      return true;
    }
  } catch (e) {
    console.error('Error excluding IP:', e);
  }

  cachedAdConfig = {
    ...cachedAdConfig,
    isExcluded: true,
    adsEnabled: false,
    loading: false,
  };
  notifyListeners();
  return true;
}

export async function includeCurrentIp(customIp?: string): Promise<boolean> {
  try {
    localStorage.removeItem(LOCAL_STORAGE_EXCLUDE_KEY);
    const ipToInclude = customIp || cachedAdConfig.clientIp;
    const res = await fetch('/api/ad-config/include-ip', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip: ipToInclude }),
    });

    if (res.ok) {
      const data = await res.json();
      cachedAdConfig = {
        ...cachedAdConfig,
        clientIp: data.clientIp,
        isExcluded: data.isExcluded,
        excludedIps: data.excludedIps,
        adsEnabled: !data.isExcluded,
        loading: false,
      };

      if (!data.isExcluded) {
        injectAdSenseScript();
      }

      notifyListeners();
      return true;
    }
  } catch (e) {
    console.error('Error including IP:', e);
  }

  cachedAdConfig = {
    ...cachedAdConfig,
    isExcluded: false,
    adsEnabled: true,
    loading: false,
  };
  injectAdSenseScript();
  notifyListeners();
  return true;
}

export function useAdConfig() {
  const [state, setState] = useState<AdConfigState>(() => cachedAdConfig);

  useEffect(() => {
    fetchAdConfig();

    const handleUpdate = (updated: AdConfigState) => {
      setState(updated);
    };

    listeners.add(handleUpdate);
    return () => {
      listeners.delete(handleUpdate);
    };
  }, []);

  return {
    ...state,
    excludeCurrentIp,
    includeCurrentIp,
    refreshAdConfig: fetchAdConfig,
  };
}
