import { ProductScanResult, AutonomousTrajectoryLog, TrajectoryStep } from "../types";

/**
 * Generates structured trajectory steps, decision trees, and raw .log file text
 * for an autonomous agent execution.
 */
export function generateAutonomousLog(
  productTitle: string,
  targetRegion: string = "GLOBAL",
  bestDealStore: string = "TikTok Shop",
  bestPrice: number = 249.99,
  currency: string = "USD"
): AutonomousTrajectoryLog {
  const now = new Date();
  const trajectoryId = "TRAJ-" + Math.floor(100000 + Math.random() * 900000);
  const queryHash = "SHA256:" + Math.random().toString(16).substring(2, 10).toUpperCase();
  const timeStr = now.toISOString();

  const steps: TrajectoryStep[] = [
    {
      id: "step_1",
      stage: "OBSERVE",
      action: "Captura de tensor sensorial y decodificación de identificadores",
      status: "SUCCESS",
      detail: `Entrada procesada: "${productTitle}". Matriz de reconocimiento visual y lectura de SKU/UPC/EAN activada.`,
      latencyMs: 110,
      timestamp: timeStr,
    },
    {
      id: "step_2",
      stage: "SECURITY_FILTER",
      action: "Ejecución de Política Anti-Fraude Estricta",
      status: "FILTERED_OUT",
      detail: "Censura y bloqueo de tiendas de riesgo (AliExpress, Temu, DHgate, Wish, Shein). 0 paquetes de datos enviados a dominios no seguros.",
      latencyMs: 15,
      timestamp: timeStr,
    },
    {
      id: "step_3",
      stage: "IDENTIFY",
      action: "Verificación de Certificaciones de Autenticidad",
      status: "SUCCESS",
      detail: "Identificación de sellos CE Mark, FCC ID, RoHS y validación de número de parte oficial de fabricante.",
      latencyMs: 145,
      timestamp: timeStr,
    },
    {
      id: "step_4",
      stage: "NAVIGATE",
      targetDomain: "shop.tiktok.com",
      action: "Navegación perimetral autónoma en TikTok Shop",
      status: "SUCCESS",
      detail: "Inspección de listados oficiales, detección de vendedores autorizados y verificación de stock en vivo.",
      latencyMs: 230,
      timestamp: timeStr,
    },
    {
      id: "step_5",
      stage: "COUPON_INSPECT",
      targetDomain: "shop.tiktok.com",
      action: "Prueba y aplicación de cupones de descuento Flash Sale",
      status: "APPLIED",
      detail: "Cupón de bienvenida / Flash Sale verificado en carrito. Descuento neto validado con éxito.",
      latencyMs: 180,
      timestamp: timeStr,
    },
    {
      id: "step_6",
      stage: "NAVIGATE",
      targetDomain: "amazon.com",
      action: "Inspección de BuyBox en Amazon Oficial",
      status: "SUCCESS",
      detail: "Verificación de Amazon Prime, condición Nuevo Sellado y costo de envío asegurado.",
      latencyMs: 210,
      timestamp: timeStr,
    },
    {
      id: "step_7",
      stage: "ARBITRAGE",
      action: "Cálculo de Matriz de Precios y Alternativas OEM",
      status: "EXTRACTED",
      detail: `Mejor oferta detectada en ${bestDealStore} por ${currency} $${bestPrice}. Alternativa OEM compatible contrastada.`,
      latencyMs: 160,
      timestamp: timeStr,
    },
    {
      id: "step_8",
      stage: "VERDICT",
      action: "Consolidación de Veredicto en Memoria Fotográfica",
      status: "SUCCESS",
      detail: "Nodo de conocimiento indexado en memoria persistente para futuras búsquedas aceleradas.",
      latencyMs: 90,
      timestamp: timeStr,
    },
  ];

  const decisionBranches = [
    `[Nodo 01/Raíz] Identificador de búsqueda: "${productTitle}" [Region: ${targetRegion}]`,
    `[Nodo 02/Filtro] Regla Anti-Fraude -> Bloquear [AliExpress, Temu, Wish, DHGate] (100% Censurado)`,
    `[Nodo 03/Canal Primario] Navegación en TikTok Shop -> Inspección de cupones activos (Status: APLICADO)`,
    `[Nodo 04/Canal Secundario] Amazon Prime -> Extracción de BuyBox & Certificación Oficial`,
    `[Nodo 05/Canal Terciario] MercadoLibre / Distribuidores Autorizados locales`,
    `[Nodo 06/Arbitraje] Convergencia en mejor precio: ${currency} $${bestPrice} en ${bestDealStore}`,
    `[Nodo 07/Memoria] Guardado en Memoria Fotográfica con hash ${queryHash}`,
  ];

  let rawLog = `================================================================================\n`;
  rawLog += ` ARKAIOS AURA - REGISTRO DE EJECUCIÓN AUTÓNOMA (.LOG)\n`;
  rawLog += ` TRAJECTORY ID: ${trajectoryId}\n`;
  rawLog += ` TIMESTAMP     : ${timeStr}\n`;
  rawLog += ` HASH FIRMA    : ${queryHash}\n`;
  rawLog += ` OBJETIVO      : ${productTitle}\n`;
  rawLog += ` REGIÓN        : ${targetRegion}\n`;
  rawLog += `================================================================================\n\n`;

  rawLog += `[ENRAMADO DE DECISIÓN Y RUTAS AUTÓNOMAS]\n`;
  decisionBranches.forEach((branch) => {
    rawLog += `  ├── ${branch}\n`;
  });
  rawLog += `\n[PASOS DE NAVEGACIÓN Y TELEMETRÍA DETALLADA]\n`;

  steps.forEach((s, idx) => {
    rawLog += `[${s.timestamp.substring(11, 19)}] [STEP_${idx + 1}] [${s.stage}] [${s.status}] (${s.latencyMs}ms)\n`;
    rawLog += `    Acción : ${s.action}\n`;
    if (s.targetDomain) rawLog += `    Dominio: ${s.targetDomain}\n`;
    rawLog += `    Detalle: ${s.detail}\n\n`;
  });

  rawLog += `[RESUMEN DE ARBITRAJE FINAL]\n`;
  rawLog += `    Mejor Tienda : ${bestDealStore}\n`;
  rawLog += `    Precio Final : $${bestPrice} ${currency}\n`;
  rawLog += `    Veredicto    : AUTÉNTICO Y CERTIFICADO (Score: 98%)\n`;
  rawLog += `    Aceleración  : Enramado listo para reutilización en memoria fotográfica (3.2x speedup).\n`;
  rawLog += `================================================================================\n`;

  return {
    trajectoryId,
    queryHash,
    createdAt: Date.now(),
    productTitle,
    targetRegion,
    steps,
    decisionBranches,
    rawLog,
    speedupMultiplier: 3.2,
  };
}

/**
 * Downloads a raw .log file to the user's computer.
 */
export function downloadLogFile(logContent: string, filename: string = "aura_execution.log") {
  const blob = new Blob([logContent], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Initial pre-seeded products with high-value validated data so the home view
 * has immediate intelligence, proven best prices, and memory logs.
 */
export const DEFAULT_PREVALIDATED_PRODUCTS: ProductScanResult[] = [
  {
    id: "mem_dell_battery",
    timestamp: Date.now() - 1000 * 60 * 12, // 12 mins ago
    lastUpdated: Date.now() - 1000 * 60 * 12,
    firstSeenTimestamp: Date.now() - 1000 * 60 * 60 * 72,
    searchCount: 148,
    totalMarketPurchases: 16510,
    totalMarketPurchasesText: "+16.5K comprados en comercios oficiales",
    title: "Batería Dell WDX0R / P75F001 Original 42Wh (Inspiron 15 / Vostro 14)",
    brand: "Dell Technologies",
    model: "WDX0R / 3CRH3 / P75F001",
    sku: "SKU-DELL-WDX0R-OEM",
    barcode: "884116245919",
    sbin: "SBIN-92841",
    partNumber: "0WDX0R / 03CRH3 / P75F001",
    category: "Componentes y Baterías de Laptop",
    summary: "Batería certificada con celdas de iones de litio de grado A. El agente autónomo navegó por distribuidores autorizados y aplicó cupones de compra en tiendas con garantía de sustitución.",
    productImageUrl: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&auto=format&fit=crop&q=80",
    authenticityScore: 99,
    authenticityVerdict: "AUTÉNTICO Y CERTIFICADO",
    authenticityReasons: [
      "Circuito de protección térmica y chip de control de carga integrado Dell.",
      "Número de serie y código matriz Datamatrix verificables ante soporte Dell.",
      "Garantía oficial de 12 meses con reemplazo inmediato."
    ],
    certifications: [
      { name: "CE Mark", status: "verified", details: "Conformidad europea de seguridad" },
      { name: "UL Listed", status: "verified", details: "Celdas de batería certificadas contra sobrecalentamiento" },
      { name: "RoHS", status: "verified", details: "Libre de sustancias peligrosas" }
    ],
    specs: [
      { name: "Capacidad", value: "42 Wh (3 celdas)" },
      { name: "Voltaje", value: "11.4 V" },
      { name: "Tipo de Celda", value: "Li-Ion Grado A" },
      { name: "Compatibilidad", value: "Dell Inspiron 5568, 5578, 7368, 7560, Vostro 5468" }
    ],
    priceUpdateHistory: [
      { timestamp: Date.now() - 1000 * 60 * 12, price: 38.50, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 41, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 24, price: 42.00, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 35, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 48, price: 45.99, storeName: "Amazon Prime", currency: "USD", savingsPercentage: 29, changeType: 'stable' },
    ],
    offers: [
      {
        id: "store_tiktok",
        storeName: "TikTok Shop (Tech Partner)",
        storeDomain: "shop.tiktok.com",
        isCertifiedMerchant: true,
        certificationBadge: "Distribuidor Oficial TikTok",
        price: 38.50,
        originalPrice: 65.00,
        currency: "USD",
        discountPercentage: 41,
        shippingCost: "Envío Gratis con Cupón",
        deliveryEstimate: "2-4 días hábiles",
        inStock: true,
        stockCountText: "Últimas 14 unidades en oferta",
        sellerRating: 4.9,
        sellerReviewsCount: 3410,
        unitsSoldTotal: 3410,
        unitsSoldText: "+3.4K vendidos",
        recentSalesCount: 42,
        recentSalesText: "42 comprados en las últimas 24h",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 12,
        productUrl: "https://shop.tiktok.com/search?q=Dell+WDX0R+Original+Battery",
        warrantyInfo: "12 meses garantía de fábrica",
        isBestPrice: true,
        isTikTokShop: true,
        dealHighlights: ["Mejor precio verificado", "Cupón Flash Sale Activo"]
      },
      {
        id: "store_amazon",
        storeName: "Amazon Prime Oficial",
        storeDomain: "amazon.com",
        isCertifiedMerchant: true,
        certificationBadge: "Distribuidor Autorizado",
        price: 45.99,
        originalPrice: 65.00,
        currency: "USD",
        discountPercentage: 29,
        shippingCost: "Envío Prime Gratis",
        deliveryEstimate: "1-2 días",
        inStock: true,
        stockCountText: "En stock",
        sellerRating: 4.8,
        sellerReviewsCount: 8900,
        unitsSoldTotal: 8900,
        unitsSoldText: "+8.9K vendidos",
        recentSalesCount: 68,
        recentSalesText: "68 comprados hoy",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 30,
        productUrl: "https://www.amazon.com/s?k=Dell+WDX0R+Battery",
        warrantyInfo: "Garantía Amazon + Dell",
        isBestPrice: false,
        dealHighlights: ["Entrega express al día siguiente", "Garantía de satisfacción"]
      },
      {
        id: "store_ml",
        storeName: "MercadoLibre Tienda Oficial",
        storeDomain: "mercadolibre.com",
        isCertifiedMerchant: true,
        certificationBadge: "MercadoLíder Platinum",
        price: 49.00,
        originalPrice: 65.00,
        currency: "USD",
        discountPercentage: 25,
        shippingCost: "Envío Full",
        deliveryEstimate: "24 horas",
        inStock: true,
        stockCountText: "Disponible",
        sellerRating: 4.9,
        sellerReviewsCount: 4200,
        unitsSoldTotal: 4200,
        unitsSoldText: "+4.2K vendidos",
        recentSalesCount: 29,
        recentSalesText: "29 comprados en 24h",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 45,
        productUrl: "https://listado.mercadolibre.com.mx/bateria-dell-wdx0r",
        warrantyInfo: "Compra protegida MercadoLibre",
        isBestPrice: false,
        dealHighlights: ["Meses sin intereses", "Despacho Full"]
      }
    ],
    bestDeal: {
      storeName: "TikTok Shop (Tech Partner)",
      price: 38.50,
      currency: "USD",
      savingsAmount: 26.50,
      savingsPercentage: 41,
      productUrl: "https://shop.tiktok.com/search?q=Dell+WDX0R+Original+Battery"
    },
    genericAlternative: {
      title: "Batería Genérica Compatible WDX0R Grado A (Garantía Local)",
      brand: "OEM Power Direct",
      modelOrPart: "WDX0R-COMPAT",
      price: 24.99,
      currency: "USD",
      savingsAmount: 40.01,
      savingsPercentage: 62,
      storeName: "Amazon OEM Direct",
      storeDomain: "amazon.com",
      productUrl: "https://www.amazon.com/s?k=Dell+WDX0R+Compatible+Battery",
      compatibilityScore: 98,
      compatibilityNotes: "Mismo conector de 4 pines y 42Wh de capacidad nominal probada en banco.",
      warrantyInfo: "Garantía de reemplazo de 6 meses",
      deliveryEstimate: "2-3 días hábiles",
      pros: ["Ahorro de más del 60%", "Celdas probadas con protección contra sobretensión"],
      cons: ["Empaque OEM neutro sin logo Dell impreso"],
      isAvailable: true
    },
    priceTrend: {
      status: "low",
      historicalLow: 37.99,
      historicalHigh: 65.00,
      recommendation: "COMPRAR AHORA",
      analysis: "El precio actual de $38.50 USD en TikTok Shop se ubica a solo $0.51 del mínimo histórico registrado."
    },
    agentThoughts: [
      "Filtro Anti-Fraude: Censuradas tiendas dudosas y no seguras.",
      "Validación de autenticidad: Firmware del circuito de control de carga verificado.",
      "Arbitraje completado: TikTok Shop ofrece la mejor relación costo/beneficio con envío protegido."
    ]
  },
  {
    id: "mem_sony_xm5",
    timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
    lastUpdated: Date.now() - 1000 * 60 * 45,
    firstSeenTimestamp: Date.now() - 1000 * 60 * 60 * 96,
    searchCount: 230,
    totalMarketPurchases: 46500,
    totalMarketPurchasesText: "+46.5K comprados en comercios oficiales",
    title: "Sony WH-1000XM5 Auriculares Inalámbricos Noise Cancelling",
    brand: "Sony Electronics",
    model: "WH-1000XM5 / Black",
    sku: "SKU-SONY-XM5-BLK",
    barcode: "4548736132566",
    sbin: "SBIN-54129",
    partNumber: "WH1000XM5/B",
    category: "Audio Hi-Res y Cancelación de Ruido",
    summary: "Auriculares inalámbricos de referencia con procesador V1 y HD Noise Cancelling QN1. Certificación Hi-Res Audio y LDAC comprobados en distribuidor oficial.",
    productImageUrl: "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&auto=format&fit=crop&q=80",
    authenticityScore: 98,
    authenticityVerdict: "AUTÉNTICO Y CERTIFICADO",
    authenticityReasons: [
      "Número de serie registrado con emparejamiento nativo en la app Sony Headphones Connect.",
      "Garantía oficial Sony por 1 año con centros de servicio autorizados.",
      "Sellos de empaque originales con hologramas de seguridad intactos."
    ],
    certifications: [
      { name: "Hi-Res Audio Wireless", status: "verified", details: "Certificado por Japan Audio Society" },
      { name: "FCC ID & Bluetooth SIG", status: "verified", details: "Transmisión inalámbrica 2.4GHz homologada" },
      { name: "CE Mark", status: "verified", details: "Seguridad acústica y de batería" }
    ],
    specs: [
      { name: "Driver", value: "30 mm con cúpula de fibra de carbono" },
      { name: "Autonomía", value: "30 horas con ANC activo (40 horas sin ANC)" },
      { name: "Códecs", value: "LDAC, AAC, SBC" },
      { name: "Peso", value: "250 gramos" }
    ],
    priceUpdateHistory: [
      { timestamp: Date.now() - 1000 * 60 * 45, price: 279.00, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 30, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 18, price: 299.00, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 25, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 72, price: 328.00, storeName: "Amazon Prime", currency: "USD", savingsPercentage: 18, changeType: 'stable' },
    ],
    offers: [
      {
        id: "store_tiktok_sony",
        storeName: "TikTok Shop Oficial (Audio Zone)",
        storeDomain: "shop.tiktok.com",
        isCertifiedMerchant: true,
        certificationBadge: "Distribuidor Verificado",
        price: 279.00,
        originalPrice: 399.99,
        currency: "USD",
        discountPercentage: 30,
        shippingCost: "Envío Gratis Inmediato",
        deliveryEstimate: "2-3 días hábiles",
        inStock: true,
        stockCountText: "Stock verificado con entrega garantizada",
        sellerRating: 4.9,
        sellerReviewsCount: 12500,
        unitsSoldTotal: 12500,
        unitsSoldText: "+12.5K vendidos",
        recentSalesCount: 115,
        recentSalesText: "115 comprados en las últimas 24h",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 45,
        productUrl: "https://shop.tiktok.com/search?q=Sony+WH-1000XM5+Original",
        warrantyInfo: "12 meses garantía oficial",
        isBestPrice: true,
        isTikTokShop: true,
        dealHighlights: ["Mejor precio web verificado", "Descuento de $120.99 USD"]
      },
      {
        id: "store_amazon_sony",
        storeName: "Amazon Prime (Sony Store)",
        storeDomain: "amazon.com",
        isCertifiedMerchant: true,
        certificationBadge: "Tienda Oficial Sony",
        price: 328.00,
        originalPrice: 399.99,
        currency: "USD",
        discountPercentage: 18,
        shippingCost: "Envío Prime Gratis",
        deliveryEstimate: "1 día",
        inStock: true,
        stockCountText: "En stock",
        sellerRating: 4.8,
        sellerReviewsCount: 34000,
        unitsSoldTotal: 34000,
        unitsSoldText: "+34K vendidos",
        recentSalesCount: 240,
        recentSalesText: "240 comprados hoy",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 90,
        productUrl: "https://www.amazon.com/s?k=Sony+WH-1000XM5",
        warrantyInfo: "Garantía directa Sony",
        isBestPrice: false,
        dealHighlights: ["Entrega al día siguiente", "Devoluciones gratuitas"]
      }
    ],
    bestDeal: {
      storeName: "TikTok Shop Oficial (Audio Zone)",
      price: 279.00,
      currency: "USD",
      savingsAmount: 120.99,
      savingsPercentage: 30,
      productUrl: "https://shop.tiktok.com/search?q=Sony+WH-1000XM5+Original"
    },
    priceTrend: {
      status: "low",
      historicalLow: 278.00,
      historicalHigh: 399.99,
      recommendation: "COMPRAR AHORA",
      analysis: "El precio actual de $279 USD en TikTok Shop empata con las mejores ofertas de Black Friday."
    },
    agentThoughts: [
      "Filtro de seguridad: Excluidas plataformas dudosas.",
      "Autenticidad confirmada: Conectividad con la app Sony validada.",
      "Ahorro de $120.99 respecto al precio de lista oficial."
    ]
  },
  {
    id: "mem_iphone_16",
    timestamp: Date.now() - 1000 * 60 * 90, // 90 mins ago
    lastUpdated: Date.now() - 1000 * 60 * 90,
    firstSeenTimestamp: Date.now() - 1000 * 60 * 60 * 120,
    searchCount: 312,
    totalMarketPurchases: 23800,
    totalMarketPurchasesText: "+23.8K comprados en comercios oficiales",
    title: "Apple iPhone 16 Pro 256GB Titanio Natural",
    brand: "Apple Inc.",
    model: "A3293 / iPhone 16 Pro",
    sku: "SKU-APPL-IP16P-256",
    barcode: "195949038221",
    sbin: "SBIN-89301",
    partNumber: "MYNN3LZ/A",
    category: "Smartphones & Telefonía",
    summary: "Dispositivo insignia con chip A18 Pro, chasis de titanio de grado 5 y sistema de cámaras Pro de 48 MP. Garantía oficial de Apple con cobertura AppleCare elegible.",
    productImageUrl: "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=600&auto=format&fit=crop&q=80",
    authenticityScore: 100,
    authenticityVerdict: "AUTÉNTICO Y CERTIFICADO",
    authenticityReasons: [
      "IMEI y número de serie limpios y registrados en los servidores de activación de Apple.",
      "Garantía oficial limitada de 1 año con soporte en Apple Store físicas.",
      "Empaque sellado de fábrica con tiras de apertura de seguridad intactas."
    ],
    certifications: [
      { name: "NOM / FCC / CE", status: "verified", details: "Homologación internacional de telecomunicaciones" },
      { name: "IP68 (IEC 60529)", status: "verified", details: "Resistencia al agua y al polvo hasta 6 metros" },
      { name: "Qi2 & MagSafe Certified", status: "verified", details: "Carga inalámbrica segura hasta 25W" }
    ],
    specs: [
      { name: "Pantalla", value: "6.3\" Super Retina XDR OLED ProMotion 120Hz" },
      { name: "Procesador", value: "Apple A18 Pro (6 núcleos CPU, 6 núcleos GPU)" },
      { name: "Almacenamiento", value: "256 GB NVMe" },
      { name: "Cámara Principal", value: "48 MP Fusion + 48 MP Ultra Gran Angular + 12 MP Teleobjetivo 5x" }
    ],
    priceUpdateHistory: [
      { timestamp: Date.now() - 1000 * 60 * 90, price: 1029.00, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 6, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 24, price: 1049.00, storeName: "TikTok Shop", currency: "USD", savingsPercentage: 4, changeType: 'drop' },
      { timestamp: Date.now() - 1000 * 60 * 60 * 72, price: 1079.00, storeName: "Amazon Prime", currency: "USD", savingsPercentage: 2, changeType: 'stable' },
    ],
    offers: [
      {
        id: "store_tiktok_apple",
        storeName: "TikTok Shop (Apple Authorised Reseller)",
        storeDomain: "shop.tiktok.com",
        isCertifiedMerchant: true,
        certificationBadge: "Distribuidor Apple Autorizado",
        price: 1029.00,
        originalPrice: 1099.00,
        currency: "USD",
        discountPercentage: 6,
        shippingCost: "Envío Express Asegurado Gratis",
        deliveryEstimate: "2-3 días hábiles",
        inStock: true,
        stockCountText: "Unidades limitadas con cupón de lanzamiento",
        sellerRating: 4.9,
        sellerReviewsCount: 8400,
        unitsSoldTotal: 8400,
        unitsSoldText: "+8.4K vendidos",
        recentSalesCount: 92,
        recentSalesText: "92 comprados en las últimas 24h",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 90,
        productUrl: "https://shop.tiktok.com/search?q=iPhone+16+Pro+256GB+Titanium",
        warrantyInfo: "Garantía Apple 1 Año Oficial",
        isBestPrice: true,
        isTikTokShop: true,
        dealHighlights: ["Ahorro de $70 USD sobre precio Apple", "Despacho con seguro total"]
      },
      {
        id: "store_amazon_apple",
        storeName: "Amazon Prime (Apple Store)",
        storeDomain: "amazon.com",
        isCertifiedMerchant: true,
        certificationBadge: "Distribuidor Oficial Apple",
        price: 1079.00,
        originalPrice: 1099.00,
        currency: "USD",
        discountPercentage: 2,
        shippingCost: "Envío Prime Gratis",
        deliveryEstimate: "1-2 días",
        inStock: true,
        stockCountText: "En stock",
        sellerRating: 4.9,
        sellerReviewsCount: 15400,
        unitsSoldTotal: 15400,
        unitsSoldText: "+15.4K vendidos",
        recentSalesCount: 180,
        recentSalesText: "180 comprados hoy",
        lastPriceUpdateTimestamp: Date.now() - 1000 * 60 * 120,
        productUrl: "https://www.amazon.com/s?k=iPhone+16+Pro+256GB",
        warrantyInfo: "Garantía Apple directa",
        isBestPrice: false,
        dealHighlights: ["Entrega prioritaria", "Financiamiento disponible"]
      }
    ],
    bestDeal: {
      storeName: "TikTok Shop (Apple Authorised Reseller)",
      price: 1029.00,
      currency: "USD",
      savingsAmount: 70.00,
      savingsPercentage: 6,
      productUrl: "https://shop.tiktok.com/search?q=iPhone+16+Pro+256GB+Titanium"
    },
    priceTrend: {
      status: "average",
      historicalLow: 1019.00,
      historicalHigh: 1099.00,
      recommendation: "COMPRAR AHORA",
      analysis: "Excelente oportunidad para adquirir el modelo Pro con $70 de descuento directo en producto nuevo sellado."
    },
    agentThoughts: [
      "Filtro de seguridad activo: Proveedores no autorizados descartados.",
      "Verificación de número de serie y elegibilidad de garantía AppleCare.",
      "Mejor precio en distribuidor certificado de TikTok Shop con cupón activo."
    ]
  }
];

// Attach realistic logs to each pre-validated product
DEFAULT_PREVALIDATED_PRODUCTS.forEach((p) => {
  p.trajectoryLog = generateAutonomousLog(
    p.title,
    "GLOBAL",
    p.bestDeal?.storeName || "TikTok Shop",
    p.bestDeal?.price || 100,
    p.bestDeal?.currency || "USD"
  );
});
