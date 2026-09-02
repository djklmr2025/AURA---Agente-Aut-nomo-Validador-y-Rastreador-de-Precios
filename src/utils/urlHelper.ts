import { getRegionConfig } from "./regionUtils";

/**
 * Extracts concise, highly specific search terms (Brand + Model Code + Category)
 * stripping boilerplate words like "Original", "para", "compatible con", "y", "o"
 * which confuse Amazon/MercadoLibre search engines.
 */
export function extractPreciseKeywords(
  title: string,
  model?: string,
  brand?: string
): string {
  if (!title) return "";

  // 1. If we have a dedicated model/part number like "WDX0R", prioritize Brand + Model
  if (model && model.trim().length > 1 && !model.includes("Oficial")) {
    const cleanModel = model.split("/")[0].trim();
    const cleanBrand = (brand || "").trim();
    // Check if title has a core category word (e.g., Batería, Auriculares, Laptop, Pantalla, Teclado)
    const categoryMatch = title.match(/(bater[íi]a|auricular\w*|aud[íi]fono\w*|pantalla|teclado|cargador|disco|memoria|laptop|mouse|monitor)/i);
    const categoryWord = categoryMatch ? categoryMatch[1] : "";
    
    const combined = `${categoryWord} ${cleanBrand} ${cleanModel}`.trim();
    if (combined.length > 3) {
      return combined;
    }
  }

  // 2. Otherwise, clean the title surgically
  let clean = title
    .replace(/["“”'‘’]/g, " ")
    .replace(/\b(original|genuino|nuevo|para|compatible|con|versi[óo]n|edition|de|del|los|las|un|una|and|or|y|o)\b/gi, " ")
    .replace(/\/[^ ]*/g, " ") // Remove secondary slash items like "/ P75F001"
    .replace(/\s+/g, " ")
    .trim();

  // Take the first 4-5 relevant words max
  const words = clean.split(" ").filter((w) => w.length > 1);
  return words.slice(0, 4).join(" ");
}

/**
 * Generates direct and localized marketplace search URLs based on user's active region
 */
export function buildDirectStoreUrl(
  productTitle: string,
  storeName: string,
  storeDomain?: string,
  regionKey = "GLOBAL",
  productModel?: string,
  productBrand?: string
): string {
  const query = extractPreciseKeywords(productTitle, productModel, productBrand);
  const encodedQuery = encodeURIComponent(query);
  const region = getRegionConfig(regionKey);

  const lowerStore = (storeName || "").toLowerCase();
  const lowerDomain = (storeDomain || "").toLowerCase();

  // 1. AMAZON LOCALIZED
  if (lowerStore.includes("amazon") || lowerDomain.includes("amazon")) {
    const domain = region.amazonDomain || "amazon.com";
    return `https://www.${domain}/s?k=${encodedQuery}`;
  }

  // 2. MERCADO LIBRE LOCALIZED
  if (
    lowerStore.includes("mercadolibre") ||
    lowerDomain.includes("mercadolibre") ||
    lowerStore.includes("mercado libre")
  ) {
    const domain = region.mercadolibreDomain || "mercadolibre.com";
    const slugQuery = encodeURIComponent(query.replace(/\s+/g, "-"));
    return `https://listado.${domain}/${slugQuery}`;
  }

  // 3. BEST BUY
  if (lowerStore.includes("bestbuy") || lowerDomain.includes("bestbuy") || lowerStore.includes("best buy")) {
    return `https://www.bestbuy.com/site/searchpage.jsp?st=${encodedQuery}`;
  }

  // 4. WALMART LOCALIZED
  if (lowerStore.includes("walmart") || lowerDomain.includes("walmart")) {
    const domain = region.walmartDomain || "walmart.com";
    return `https://www.${domain}/search?q=${encodedQuery}`;
  }

  // 5. EBAY
  if (lowerStore.includes("ebay") || lowerDomain.includes("ebay")) {
    return `https://www.ebay.com/sch/i.html?_nkw=${encodedQuery}`;
  }

  // 6. TIKTOK SHOP (Allowed exception)
  if (
    lowerStore.includes("tiktok") ||
    lowerDomain.includes("tiktok") ||
    lowerStore.includes("tik tok")
  ) {
    return `https://shop.tiktok.com/search?q=${encodedQuery}`;
  }

  // CENSOR & BLOCK: AliExpress, Temu, Shein, DHGate, Wish, Taobao
  if (
    lowerStore.includes("aliexpress") || lowerDomain.includes("aliexpress") ||
    lowerStore.includes("temu") || lowerDomain.includes("temu") ||
    lowerStore.includes("dhgate") || lowerDomain.includes("dhgate") ||
    lowerStore.includes("wish.com") || lowerDomain.includes("wish") ||
    lowerStore.includes("shein") || lowerDomain.includes("shein") ||
    lowerStore.includes("taobao") || lowerDomain.includes("taobao")
  ) {
    // Redirect to trusted Amazon search instead of blocked Chinese store
    const domain = region.amazonDomain || "amazon.com";
    return `https://www.${domain}/s?k=${encodedQuery}`;
  }

  // 7. GOOGLE SHOPPING LOCALIZED (Fallback for other recognized stores)
  return `https://www.google.com/search?q=${encodeURIComponent(`${query} ${storeName}`)}&tbm=shop`;
}
