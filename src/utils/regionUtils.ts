export interface RegionConfig {
  id: string;
  name: string;
  countryName: string;
  flag: string;
  currency: string;
  symbol: string;
  exchangeRateToUSD: number; // Rate vs 1 USD
  amazonDomain: string;
  mercadolibreDomain?: string;
  walmartDomain?: string;
}

export const REGIONS: Record<string, RegionConfig> = {
  MEXICO: {
    id: "MEXICO",
    name: "México",
    countryName: "México",
    flag: "🇲🇽",
    currency: "MXN",
    symbol: "$",
    exchangeRateToUSD: 18.5,
    amazonDomain: "amazon.com.mx",
    mercadolibreDomain: "mercadolibre.com.mx",
    walmartDomain: "walmart.com.mx",
  },
  USA: {
    id: "USA",
    name: "Estados Unidos",
    countryName: "Estados Unidos",
    flag: "🇺🇸",
    currency: "USD",
    symbol: "$",
    exchangeRateToUSD: 1.0,
    amazonDomain: "amazon.com",
    walmartDomain: "walmart.com",
  },
  ESPANA: {
    id: "ESPANA",
    name: "España",
    countryName: "España",
    flag: "🇪🇸",
    currency: "EUR",
    symbol: "€",
    exchangeRateToUSD: 0.92,
    amazonDomain: "amazon.es",
  },
  COLOMBIA: {
    id: "COLOMBIA",
    name: "Colombia",
    countryName: "Colombia",
    flag: "🇨🇴",
    currency: "COP",
    symbol: "$",
    exchangeRateToUSD: 4150,
    mercadolibreDomain: "mercadolibre.com.co",
    amazonDomain: "amazon.com",
  },
  ARGENTINA: {
    id: "ARGENTINA",
    name: "Argentina",
    countryName: "Argentina",
    flag: "🇦🇷",
    currency: "ARS",
    symbol: "$",
    exchangeRateToUSD: 1050,
    mercadolibreDomain: "mercadolibre.com.ar",
    amazonDomain: "amazon.com",
  },
  CHILE: {
    id: "CHILE",
    name: "Chile",
    countryName: "Chile",
    flag: "🇨🇱",
    currency: "CLP",
    symbol: "$",
    exchangeRateToUSD: 940,
    mercadolibreDomain: "mercadolibre.cl",
    amazonDomain: "amazon.com",
  },
  GLOBAL: {
    id: "GLOBAL",
    name: "Mercado Global",
    countryName: "Global",
    flag: "🌐",
    currency: "USD",
    symbol: "$",
    exchangeRateToUSD: 1.0,
    amazonDomain: "amazon.com",
    walmartDomain: "walmart.com",
  },
};

/**
 * Normalizes region string to a valid key in REGIONS
 */
export function getRegionConfig(regionKey = "GLOBAL"): RegionConfig {
  const normalized = (regionKey || "GLOBAL").toUpperCase().replace(/[ÁÉÍÓÚ]/g, (m) => {
    switch (m) {
      case "Á": return "A";
      case "É": return "E";
      case "Í": return "I";
      case "Ó": return "O";
      case "Ú": return "U";
      default: return m;
    }
  });

  if (normalized.includes("MEX")) return REGIONS.MEXICO;
  if (normalized.includes("ESP")) return REGIONS.ESPANA;
  if (normalized.includes("COL")) return REGIONS.COLOMBIA;
  if (normalized.includes("ARG")) return REGIONS.ARGENTINA;
  if (normalized.includes("CHIL")) return REGIONS.CHILE;
  if (normalized.includes("USA") || normalized.includes("ESTADOS")) return REGIONS.USA;

  return REGIONS[normalized] || REGIONS.GLOBAL;
}

/**
 * Converts and formats a price according to the active region
 */
export function convertAndFormatPrice(
  amount: number,
  fromCurrency = "USD",
  targetRegionKey = "GLOBAL"
): {
  formattedAmount: string;
  currency: string;
  symbol: string;
  fullDisplay: string;
  numericValue: number;
} {
  const targetConfig = getRegionConfig(targetRegionKey);
  const fromCurr = (fromCurrency || "USD").toUpperCase();
  const toCurr = targetConfig.currency;

  let valueInUSD = amount;
  
  // Convert from source currency to USD first if needed
  if (fromCurr === "MXN") valueInUSD = amount / 18.5;
  else if (fromCurr === "EUR") valueInUSD = amount / 0.92;
  else if (fromCurr === "COP") valueInUSD = amount / 4150;
  else if (fromCurr === "ARS") valueInUSD = amount / 1050;
  else if (fromCurr === "CLP") valueInUSD = amount / 940;
  else valueInUSD = amount; // Assume USD

  // Convert USD to target currency
  const converted = valueInUSD * targetConfig.exchangeRateToUSD;

  let formattedAmount = "";
  if (toCurr === "COP" || toCurr === "CLP" || toCurr === "ARS") {
    formattedAmount = Math.round(converted).toLocaleString("es");
  } else {
    formattedAmount = converted.toLocaleString("es", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return {
    formattedAmount,
    currency: toCurr,
    symbol: targetConfig.symbol,
    fullDisplay: `${targetConfig.symbol}${formattedAmount} ${toCurr}`,
    numericValue: converted,
  };
}
