/**
 * CURRENCY EXCHANGE SERVICE
 * 
 * Handles multi-currency support for the Digital Currency system.
 * Provides real-time exchange rates and currency conversion functionality.
 * 
 * Supported Currencies: USD, SGD, AUD, MYR, CNY
 * Exchange Rate Provider: ExchangeRate-API (free tier)
 * 
 * Version: 1.0.0 - Multi-Currency Support
 * Last Updated: September 22, 2025
 */

// Supported currencies configuration
export const SUPPORTED_CURRENCIES = {
  USD: { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸' },
  SGD: { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar', flag: '🇸🇬' },
  AUD: { code: 'AUD', symbol: 'A$', name: 'Australian Dollar', flag: '🇦🇺' },
  MYR: { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit', flag: '🇲🇾' },
  CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', flag: '🇨🇳' }
} as const;

export type SupportedCurrency = keyof typeof SUPPORTED_CURRENCIES;

interface ExchangeRateResponse {
  result: string;
  base_code: string;
  conversion_rates: Record<string, number>;
  time_last_update_unix: number;
}

interface ConversionResult {
  fromAmount: number;
  fromCurrency: SupportedCurrency;
  toAmount: number;
  toCurrency: SupportedCurrency;
  rate: number;
  timestamp: Date;
}

class CurrencyService {
  private rateCache: Map<string, { rate: number; timestamp: Date }> = new Map();
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds
  private readonly BASE_API_URL = 'https://api.exchangerate-api.com/v4/latest';

  /**
   * Get real-time exchange rate between two currencies
   */
  async getExchangeRate(from: SupportedCurrency, to: SupportedCurrency): Promise<number> {
    if (from === to) return 1;

    const cacheKey = `${from}-${to}`;
    const cached = this.rateCache.get(cacheKey);

    // Return cached rate if still valid
    if (cached && Date.now() - cached.timestamp.getTime() < this.CACHE_DURATION) {
      return cached.rate;
    }

    try {
      const response = await fetch(`${this.BASE_API_URL}/${from}`);
      if (!response.ok) {
        throw new Error(`Exchange rate API error: ${response.status}`);
      }

      const data: ExchangeRateResponse = await response.json();
      const rate = data.conversion_rates[to];

      if (!rate) {
        throw new Error(`Exchange rate not found for ${from} to ${to}`);
      }

      // Cache the rate
      this.rateCache.set(cacheKey, { rate, timestamp: new Date() });

      console.log(`[CURRENCY] Fetched exchange rate: 1 ${from} = ${rate} ${to}`);
      return rate;
    } catch (error) {
      console.error(`[CURRENCY] Failed to fetch exchange rate from ${from} to ${to}:`, error);
      
      // Fallback to approximate rates if API fails
      const fallbackRates = this.getFallbackRates(from, to);
      if (fallbackRates) {
        console.log(`[CURRENCY] Using fallback rate: 1 ${from} = ${fallbackRates} ${to}`);
        return fallbackRates;
      }
      
      throw new Error(`Unable to get exchange rate from ${from} to ${to}`);
    }
  }

  /**
   * Convert amount from one currency to another
   */
  async convertCurrency(
    amount: number,
    from: SupportedCurrency,
    to: SupportedCurrency
  ): Promise<ConversionResult> {
    const rate = await this.getExchangeRate(from, to);
    const convertedAmount = Math.round(amount * rate);

    return {
      fromAmount: amount,
      fromCurrency: from,
      toAmount: convertedAmount,
      toCurrency: to,
      rate,
      timestamp: new Date()
    };
  }

  /**
   * Convert amount to USD cents (internal storage format)
   */
  async convertToUSDCents(amount: number, fromCurrency: SupportedCurrency): Promise<number> {
    if (fromCurrency === 'USD') {
      return Math.round(amount * 100); // Convert dollars to cents
    }

    const conversion = await this.convertCurrency(amount, fromCurrency, 'USD');
    return Math.round(conversion.toAmount * 100); // Convert to cents
  }

  /**
   * Convert USD cents to display currency
   */
  async convertFromUSDCents(cents: number, toCurrency: SupportedCurrency): Promise<number> {
    const usdAmount = cents / 100; // Convert cents to dollars
    
    if (toCurrency === 'USD') {
      return usdAmount;
    }

    const conversion = await this.convertCurrency(usdAmount, 'USD', toCurrency);
    return conversion.toAmount;
  }

  /**
   * Format currency amount for display
   */
  formatCurrency(amount: number, currency: SupportedCurrency): string {
    const currencyInfo = SUPPORTED_CURRENCIES[currency];
    
    // Different formatting for different currencies
    const options: Intl.NumberFormatOptions = {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    };

    // Some currencies don't use decimals in common usage
    if (currency === 'CNY' || currency === 'MYR') {
      options.minimumFractionDigits = 0;
      options.maximumFractionDigits = 2;
    }

    const formatted = new Intl.NumberFormat('en-US', options).format(amount);
    return `${currencyInfo.symbol}${formatted}`;
  }

  /**
   * Get all supported currencies with current rates relative to USD
   */
  async getAllRates(): Promise<Record<SupportedCurrency, number>> {
    const rates: Partial<Record<SupportedCurrency, number>> = {};
    
    for (const currency of Object.keys(SUPPORTED_CURRENCIES) as SupportedCurrency[]) {
      try {
        rates[currency] = await this.getExchangeRate('USD', currency);
      } catch (error) {
        console.error(`[CURRENCY] Failed to get rate for ${currency}:`, error);
        rates[currency] = 1; // Fallback
      }
    }
    
    return rates as Record<SupportedCurrency, number>;
  }

  /**
   * Fallback exchange rates (approximate, for when API is unavailable)
   */
  private getFallbackRates(from: SupportedCurrency, to: SupportedCurrency): number | null {
    // These are approximate rates as of late 2025 - only for emergencies
    const fallbackMatrix: Record<SupportedCurrency, Record<SupportedCurrency, number>> = {
      USD: { USD: 1, SGD: 1.35, AUD: 1.55, MYR: 4.70, CNY: 7.25 },
      SGD: { USD: 0.74, SGD: 1, AUD: 1.15, MYR: 3.48, CNY: 5.37 },
      AUD: { USD: 0.65, SGD: 0.87, AUD: 1, MYR: 3.03, CNY: 4.68 },
      MYR: { USD: 0.21, SGD: 0.29, AUD: 0.33, MYR: 1, CNY: 1.54 },
      CNY: { USD: 0.14, SGD: 0.19, AUD: 0.21, MYR: 0.65, CNY: 1 }
    };

    return fallbackMatrix[from]?.[to] || null;
  }

  /**
   * Clear exchange rate cache (useful for testing or manual refresh)
   */
  clearCache(): void {
    this.rateCache.clear();
    console.log('[CURRENCY] Exchange rate cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; entries: Array<{ pair: string; rate: number; age: number }> } {
    const entries = Array.from(this.rateCache.entries()).map(([pair, data]) => ({
      pair,
      rate: data.rate,
      age: Date.now() - data.timestamp.getTime()
    }));

    return {
      size: this.rateCache.size,
      entries
    };
  }
}

// Export singleton instance
export const currencyService = new CurrencyService();

// Export types for use in other modules
export type { ConversionResult };