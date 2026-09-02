export interface ProductSpecification {
  name: string;
  value: string;
}

export interface StorePriceOffer {
  id: string;
  storeName: string;
  storeLogo?: string;
  storeDomain: string;
  isCertifiedMerchant: boolean;
  certificationBadge?: string;
  price: number;
  originalPrice?: number;
  currency: string;
  discountPercentage?: number;
  shippingCost: string;
  deliveryEstimate: string;
  inStock: boolean;
  stockCountText?: string;
  sellerRating: number; // e.g. 4.8 / 5
  sellerReviewsCount?: number;
  productUrl: string;
  warrantyInfo: string;
  isBestPrice: boolean;
  dealHighlights?: string[];
  isTikTokShop?: boolean;
  // Live Retail Telemetry & Sales Velocity
  unitsSoldTotal?: number; // e.g. 4820
  unitsSoldText?: string; // e.g. "+4.8K vendidos"
  recentSalesCount?: number; // e.g. 38 en 24h
  recentSalesText?: string; // e.g. "38 comprados en las últimas 24h"
  lastPriceUpdateTimestamp?: number;
}

export interface GenericAlternative {
  title: string;
  brand: string;
  modelOrPart: string;
  price: number;
  currency: string;
  savingsAmount: number;
  savingsPercentage: number;
  storeName: string;
  storeDomain: string;
  productUrl: string;
  compatibilityScore: number; // 0-100
  compatibilityNotes: string;
  warrantyInfo: string;
  deliveryEstimate: string;
  pros: string[];
  cons: string[];
  isAvailable: boolean;
}

export interface WebVisitorStep {
  id: string;
  site: string;
  action: string;
  status: 'inspecting' | 'verified' | 'extracted' | 'coupon_applied';
  detail: string;
  latencyMs: number;
  extractedPrice?: number;
  currency?: string;
}

export interface ProductCertification {
  name: string; // e.g., "CE Mark", "FCC", "UL Listed", "Official Brand Warranty"
  status: 'verified' | 'unverified' | 'warning';
  details: string;
  authority?: string;
}

export interface TrajectoryStep {
  id: string;
  stage: 'OBSERVE' | 'IDENTIFY' | 'SECURITY_FILTER' | 'NAVIGATE' | 'COUPON_INSPECT' | 'ARBITRAGE' | 'VERDICT';
  action: string;
  targetDomain?: string;
  status: 'SUCCESS' | 'FILTERED_OUT' | 'APPLIED' | 'EXTRACTED';
  detail: string;
  latencyMs: number;
  timestamp: string;
}

export interface AutonomousTrajectoryLog {
  trajectoryId: string;
  queryHash: string;
  createdAt: number;
  productTitle: string;
  targetRegion: string;
  steps: TrajectoryStep[];
  decisionBranches: string[];
  rawLog: string;
  speedupMultiplier?: number;
}

export interface ProductScanResult {
  id: string;
  timestamp: number; // Last query or update timestamp
  lastUpdated?: number; // Exact timestamp of latest price/telemetry update
  firstSeenTimestamp?: number; // First recorded discovery timestamp
  searchCount?: number; // Number of times this product has been searched/queried
  totalMarketPurchases?: number; // Sum of units sold across retailers
  totalMarketPurchasesText?: string; // e.g. "+15.2K comprados en tiendas oficiales"
  title: string;
  brand: string;
  model: string;
  sku?: string;
  barcode?: string; // UPC / EAN / GTIN / QR
  sbin?: string; // SBin / Hardware Asset Serial
  partNumber?: string;
  category: string;
  summary: string;
  imageScannedUrl?: string;
  productImageUrl?: string;
  authenticityScore: number; // 0 - 100
  authenticityVerdict: 'AUTÉNTICO Y CERTIFICADO' | 'REQUIERE PRECAUCIÓN' | 'POSIBLE NO OFICIAL';
  authenticityReasons: string[];
  certifications: ProductCertification[];
  specs: ProductSpecification[];
  offers: StorePriceOffer[];
  bestDeal: {
    storeName: string;
    price: number;
    currency: string;
    savingsAmount: number;
    savingsPercentage: number;
    productUrl: string;
  };
  genericAlternative?: GenericAlternative;
  webVisitorTelemetry?: WebVisitorStep[];
  trajectoryLog?: AutonomousTrajectoryLog;
  priceTrend: {
    status: 'low' | 'average' | 'high';
    historicalLow: number;
    historicalHigh: number;
    recommendation: 'COMPRAR AHORA' | 'ESPERAR OFERTA' | 'PRECIO REGULAR';
    analysis: string;
  };
  priceUpdateHistory?: Array<{
    timestamp: number;
    price: number;
    storeName: string;
    currency: string;
    savingsPercentage?: number;
    changeType?: 'drop' | 'increase' | 'stable';
  }>;
  searchHistory?: Array<{
    timestamp: number;
    query: string;
    bestPrice: number;
    currency: string;
  }>;
  normalizedKey?: string; // Normalized semantic deduplication hash/key
  aliases?: string[]; // Alternative query names or spellings used
  groundingSources?: Array<{ title: string; url: string }>;
  agentThoughts: string[];
}

export interface AgentLogStep {
  id: string;
  timestamp: number;
  type: 'observe' | 'identify' | 'verify' | 'crawl' | 'compare' | 'verdict' | 'error';
  message: string;
  target?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: any;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent';
  timestamp: number;
  text: string;
  audioBase64?: string;
  relatedProductId?: string;
}

export interface PriceAlert {
  id: string;
  productId: string;
  productTitle: string;
  targetPrice: number;
  currentBestPrice: number;
  currency: string;
  createdAt: number;
  triggered: boolean;
}

export interface DaemonHandshakeStep {
  stepId: string;
  stage: 'INITIALIZING' | 'CHECKING_PERMISSIONS' | 'CONNECTING_MERCHANT_AGENT' | 'ORDER_LOOKUP' | 'LOGISTICS_VERIFICATION' | 'DELIVERY_POD' | 'COMPLETED' | 'FAILED';
  agentName: string;
  message: string;
  timestamp: string;
  latencyMs: number;
  status: 'pending' | 'running' | 'success' | 'warning' | 'error';
  payload?: any;
}

export interface DaemonConsent {
  signed: boolean;
  signerUid: string;
  signerEmail: string;
  signedAt: string;
  consentScope: string[]; // e.g. ["order.query", "fulfillment.verify", "delivery.confirm"]
  protocolVersion: string;
  digitalSignatureHash: string;
}

export interface VerifiedPurchase {
  id: string;
  userId: string;
  productId?: string;
  productTitle: string;
  brand?: string;
  model?: string;
  storeName: string;
  storeDomain?: string;
  orderId?: string;
  trackingNumber?: string;
  carrier?: string;
  verificationMode: 'AUTONOMOUS_DAEMON' | 'MANUAL_TICKET_OCR';
  verifiedAt: number;
  purchaseDate?: string;
  deliveryDate?: string;
  paidPrice: number;
  quotedMarketPrice: number;
  savingsRealized: number;
  currency: string;
  isDeliveredSatisfactorily: boolean;
  fulfillmentScore: number; // 0 - 100
  ticketNumber?: string;
  ticketImageUrl?: string;
  productReceivedImageUrl?: string;
  deliveryProofType?: 'CARRIER_POD' | 'AGENT_HANDSHAKE' | 'RECEIPT_OCR';
  certificateHash: string;
  verificationVerdict: string;
  notes?: string;
}
