import React, { useState } from "react";
import { 
  ShieldCheck, 
  ExternalLink, 
  Bookmark, 
  Bell, 
  Volume2, 
  Sparkles, 
  Truck, 
  Clock, 
  Award, 
  Layers, 
  BarChart3, 
  BadgeCheck, 
  Search, 
  ShoppingCart, 
  Store, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  CheckCircle2,
  AlertTriangle,
  Globe2,
  Zap,
  ArrowRight,
  Terminal,
  GitBranch
} from "lucide-react";
import confetti from "canvas-confetti";
import { ProductScanResult, StorePriceOffer } from "../types";
import { buildDirectStoreUrl } from "../utils/urlHelper";
import { convertAndFormatPrice, getRegionConfig } from "../utils/regionUtils";
import { Bot } from "lucide-react";

interface ProductVerdictViewProps {
  product: ProductScanResult;
  selectedRegion?: string;
  onPlayVoice: (summary: string) => void;
  onInspectStore: (offer: StorePriceOffer) => void;
  onSaveProduct: (product: ProductScanResult) => void;
  onSetPriceAlert: (product: ProductScanResult) => void;
  onOpenDaemon?: (product: ProductScanResult) => void;
  onViewLog?: (product: ProductScanResult) => void;
  isSaved?: boolean;
}

export const ProductVerdictView: React.FC<ProductVerdictViewProps> = ({
  product,
  selectedRegion = "GLOBAL",
  onPlayVoice,
  onInspectStore,
  onSaveProduct,
  onSetPriceAlert,
  onOpenDaemon,
  onViewLog,
  isSaved = false,
}) => {
  const [showAllSpecs, setShowAllSpecs] = useState<boolean>(false);
  const [showTelemetry, setShowTelemetry] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "delivery">("price");

  const regionConfig = getRegionConfig(selectedRegion);

  // Trigger celebratory confetti if high savings
  const handleChampionClick = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.7 },
      colors: ["#06b6d4", "#6366f1", "#10b981"],
    });
  };

  // Find best offer and sort offers
  const offers = product.offers || [];
  const bestOffer = offers.find((o) => o.isBestPrice) || offers[0];

  const sortedOffers = [...offers].sort((a, b) => {
    if (sortBy === "price") {
      const priceA = convertAndFormatPrice(a.price, a.currency, selectedRegion).numericValue;
      const priceB = convertAndFormatPrice(b.price, b.currency, selectedRegion).numericValue;
      return priceA - priceB;
    }
    if (sortBy === "rating") return b.sellerRating - a.sellerRating;
    return a.deliveryDays - b.deliveryDays;
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
      {/* 1. PRODUCT IDENTIFICATION & AUTHENTICITY SCORECARD */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-7 shadow-xl">
        <div className="flex flex-col md:flex-row items-start gap-6">
          {/* Product Image / Visual Badge */}
          <div className="w-full md:w-52 shrink-0 flex flex-col items-center">
            <div className="w-full aspect-square max-w-[220px] rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center p-3 relative overflow-hidden shadow-inner group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.title}
                  className="w-full h-full object-contain rounded-xl group-hover:scale-105 transition-transform duration-300"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-4">
                  <BadgeCheck className="w-12 h-12 text-cyan-400/60 mx-auto mb-2" />
                  <span className="text-xs font-mono text-slate-500">
                    {product.brand || "Hardware Tech"}
                  </span>
                </div>
              )}
              
              {/* Authenticity Badge Pill */}
              <div className="absolute top-2 left-2">
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider uppercase border shadow-md ${
                  product.authenticityScore >= 85
                    ? "bg-emerald-950/90 border-emerald-600 text-emerald-300"
                    : product.authenticityScore >= 60
                    ? "bg-amber-950/90 border-amber-600 text-amber-300"
                    : "bg-rose-950/90 border-rose-600 text-rose-300"
                }`}>
                  {product.authenticityScore}% {product.authenticityScore >= 85 ? "ORIGINAL" : "REVISAR"}
                </span>
              </div>
            </div>

            {/* Quick Actions for Product */}
            <div className="flex items-center gap-1.5 mt-3 w-full">
              <button
                id="btn-save-vault"
                onClick={() => onSaveProduct(product)}
                className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1.5 transition-all ${
                  isSaved
                    ? "bg-indigo-950/60 border-indigo-700 text-indigo-300"
                    : "bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300 hover:text-white"
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-indigo-400" />
                <span>{isSaved ? "Guardado" : "Guardar"}</span>
              </button>

              <button
                id="btn-price-alert"
                onClick={() => onSetPriceAlert(product)}
                className="flex-1 py-1.5 px-2 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-all"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span>Alerta</span>
              </button>

              {onOpenDaemon && (
                <button
                  id="btn-product-open-daemon"
                  onClick={() => onOpenDaemon(product)}
                  className="py-1.5 px-2 rounded-lg text-xs font-medium bg-cyan-950/70 hover:bg-cyan-900/80 border border-cyan-800 text-cyan-300 hover:text-white flex items-center justify-center gap-1 transition-all"
                  title="Auditar compra y entrega con Demonio AURA"
                >
                  <Bot className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden sm:inline">Validar</span>
                </button>
              )}

              {onViewLog && (
                <button
                  id="btn-view-product-log"
                  onClick={() => onViewLog(product)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-cyan-300 transition-all"
                  title="Ver Memoria Fotográfica y Registro .log"
                >
                  <Terminal className="w-4 h-4" />
                </button>
              )}

              <button
                id="btn-read-summary-audio"
                onClick={() => onPlayVoice(product.summary)}
                className="p-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-800 text-cyan-400 transition-all"
                title="Escuchar veredicto del agente"
              >
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Product Details & Authenticity Score */}
          <div className="flex-1 min-w-0 space-y-4">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-medium text-slate-300">
                  {product.category}
                </span>
                {product.model && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-cyan-400">
                    Mod: {product.model}
                  </span>
                )}
                {product.partNumber && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-indigo-400">
                    P/N: {product.partNumber}
                  </span>
                )}
                {product.sbin && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-emerald-400">
                    {product.sbin}
                  </span>
                )}
                {product.barcode && (
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] font-mono text-slate-400">
                    EAN: {product.barcode}
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {product.title}
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {product.summary}
              </p>
            </div>

            {/* Authenticity Scorecard */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
              product.authenticityScore >= 85
                ? "bg-emerald-950/30 border-emerald-800/60"
                : product.authenticityScore >= 60
                ? "bg-amber-950/30 border-amber-800/60"
                : "bg-rose-950/30 border-rose-800/60"
            }`}>
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${
                  product.authenticityScore >= 85
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : product.authenticityScore >= 60
                    ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                }`}>
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">
                      Veredicto de Autenticidad
                    </span>
                    <span className="text-xs font-mono font-bold text-cyan-400">
                      ({product.authenticityScore}/100)
                    </span>
                  </div>
                  <p className="text-sm font-bold text-white mt-0.5">
                    {product.authenticityVerdict}
                  </p>
                </div>
              </div>

              {/* Certifications badges list */}
              <div className="flex flex-wrap gap-1.5">
                {product.certifications?.map((cert, idx) => (
                  <span
                    key={idx}
                    title={cert.details}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-900/90 border border-slate-700/80 text-[11px] font-medium text-slate-200"
                  >
                    <BadgeCheck className="w-3.5 h-3.5 text-cyan-400" />
                    {cert.name}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AUTONOMOUS WEB VISITOR LIVE TELEMETRY BAR */}
      {product.webVisitorTelemetry && product.webVisitorTelemetry.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-cyan-400 animate-pulse" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Telemetría del Agente Autónomo (Navegación Web Guiada en Vivo)
              </h3>
            </div>
            <button
              onClick={() => setShowTelemetry(!showTelemetry)}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>{showTelemetry ? "Minimizar" : "Ver traza"}</span>
              {showTelemetry ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {showTelemetry && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
              {product.webVisitorTelemetry.map((step, idx) => {
                const stepPrice = step.extractedPrice 
                  ? convertAndFormatPrice(step.extractedPrice, step.currency || "USD", selectedRegion)
                  : null;
                return (
                  <div
                    key={step.id || idx}
                    className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-between gap-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white font-mono truncate">
                        {step.site}
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono uppercase font-semibold ${
                        step.status === "coupon_applied"
                          ? "bg-purple-950 text-purple-300 border border-purple-800"
                          : step.status === "verified"
                          ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                          : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                      }`}>
                        {step.status === "coupon_applied" ? "Cupón Aplicado" : "Verificado"}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-tight">
                      {step.detail || step.action}
                    </p>

                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-900">
                      <span>{step.latencyMs}ms</span>
                      {stepPrice && (
                        <span className="text-cyan-400 font-bold">
                          {stepPrice.symbol}{stepPrice.formattedAmount} {stepPrice.currency}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. BEST PRICE CHAMPION CARD */}
      {bestOffer && (() => {
        const convertedBest = convertAndFormatPrice(bestOffer.price, bestOffer.currency, selectedRegion);
        const convertedOriginal = bestOffer.originalPrice 
          ? convertAndFormatPrice(bestOffer.originalPrice, bestOffer.currency, selectedRegion)
          : null;

        const directLink = buildDirectStoreUrl(
          product.title,
          bestOffer.storeName,
          bestOffer.storeDomain,
          selectedRegion,
          product.model,
          product.brand
        );

        return (
          <div className="relative bg-gradient-to-r from-emerald-950/60 via-slate-900 to-indigo-950/60 border-2 border-emerald-500/50 rounded-2xl p-5 sm:p-7 shadow-2xl overflow-hidden">
            {/* Glow badge */}
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 font-black text-xs px-4 py-1.5 rounded-bl-xl tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              Mejor Oferta en {regionConfig.name} ({regionConfig.currency})
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <Store className="w-4 h-4" />
                  <span className="text-sm font-bold text-white">{bestOffer.storeName}</span>
                  {bestOffer.isCertifiedMerchant && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      Comercio 100% Certificado
                    </span>
                  )}
                  {bestOffer.isTikTokShop && (
                    <span className="bg-rose-950 text-rose-300 border border-rose-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      TikTok Shop
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl sm:text-4xl font-black text-white font-mono">
                    {convertedBest.symbol}{convertedBest.formattedAmount}
                  </span>
                  <span className="text-xs font-mono text-cyan-400 font-bold uppercase">
                    {convertedBest.currency}
                  </span>
                  {convertedOriginal && convertedOriginal.numericValue > convertedBest.numericValue && (
                    <span className="text-sm text-slate-500 line-through font-mono">
                      {convertedOriginal.symbol}{convertedOriginal.formattedAmount}
                    </span>
                  )}
                  {bestOffer.discountPercentage && bestOffer.discountPercentage > 0 && (
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/80">
                      -{bestOffer.discountPercentage}% OFF
                    </span>
                  )}
                </div>

                {/* Delivery and stock notes */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                  <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
                    <Truck className="w-3.5 h-3.5" />
                    {bestOffer.shippingCost}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {bestOffer.deliveryEstimate}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Award className="w-3.5 h-3.5 text-indigo-400" />
                    {bestOffer.warrantyInfo}
                  </span>
                </div>
              </div>

              {/* Direct Link Action */}
              <div className="md:col-span-5 flex flex-col items-stretch sm:items-end gap-2.5">
                <a
                  id="btn-buy-best-deal"
                  href={directLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleChampionClick}
                  className="w-full sm:w-auto px-6 py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
                >
                  <ShoppingCart className="w-4 h-4 text-slate-950" />
                  <span>Ir a la Oferta Directa ({bestOffer.storeName})</span>
                  <ExternalLink className="w-4 h-4 text-slate-950" />
                </a>

                <button
                  id="btn-inspect-best-deal"
                  onClick={() => onInspectStore(bestOffer)}
                  className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline flex items-center gap-1 justify-center sm:justify-end"
                >
                  <Search className="w-3 h-3" />
                  <span>Pedir a AURA inspección profunda de este comercio</span>
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 4. GENERIC / OEM ALTERNATIVE MATRIX (MÁXIMO AHORRO) */}
      {product.genericAlternative && (() => {
        const alt = product.genericAlternative;
        const convertedAltPrice = convertAndFormatPrice(alt.price, alt.currency, selectedRegion);
        const altUrl = alt.productUrl || buildDirectStoreUrl(
          alt.title,
          alt.storeName,
          alt.storeDomain,
          selectedRegion,
          alt.modelOrPart,
          alt.brand
        );

        return (
          <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-800/60 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 tracking-wider uppercase">
                      Alternativa Genérica / OEM Recomendada
                    </span>
                    <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] px-2 py-0.5 rounded-full font-mono">
                      {alt.compatibilityScore}% Compatible
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-0.5">
                    {alt.title}
                  </h3>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <div className="text-xl font-bold font-mono text-cyan-300">
                  {convertedAltPrice.symbol}{convertedAltPrice.formattedAmount} <span className="text-xs text-slate-400">{convertedAltPrice.currency}</span>
                </div>
                <div className="text-xs font-bold text-emerald-400 font-mono">
                  Ahorras {alt.savingsPercentage}% vs Original
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              <span className="font-semibold text-cyan-400">Nota de compatibilidad: </span>
              {alt.compatibilityNotes}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Ventajas
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-1">
                  {alt.pros.map((p, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-emerald-400">•</span>
                      <span>{p}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Consideraciones
                </span>
                <ul className="text-xs text-slate-300 space-y-1 pl-1">
                  {alt.cons.map((c, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-4 text-xs text-slate-400">
                <span>Tienda: <strong className="text-slate-200">{alt.storeName}</strong></span>
                <span>Garantía: <strong className="text-slate-200">{alt.warrantyInfo}</strong></span>
                <span>Entrega: <strong className="text-slate-200">{alt.deliveryEstimate}</strong></span>
              </div>

              <a
                href={altUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <span>Ver Alternativa Genérica</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        );
      })()}

      {/* 5. MULTI-STORE PRICE COMPARISON TABLE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        {/* Anti-Fraud Banner */}
        <div className="p-3 bg-slate-950/90 border border-emerald-900/60 rounded-xl flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              <strong>Filtro Anti-Fraude Activo:</strong> Plataformas no seguras (AliExpress, Temu, Wish, DHGate) han sido censuradas y bloqueadas. Solo se comparan comercios con protección al comprador garantizada y TikTok Shop.
            </span>
          </div>
          <span className="shrink-0 bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-full font-mono uppercase font-bold">
            100% Seguro
          </span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-cyan-400" />
              Comparativa Multi-Tienda ({regionConfig.name} • {regionConfig.currency})
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Resultados contrastados entre distribuidores oficiales, TikTok Shop, Amazon y comercios locales con garantía.
            </p>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Ordenar por:</span>
            <button
              onClick={() => setSortBy("price")}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                sortBy === "price"
                  ? "bg-cyan-950 border-cyan-700 text-cyan-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Menor Precio
            </button>
            <button
              onClick={() => setSortBy("rating")}
              className={`px-2.5 py-1 rounded-lg border font-medium transition-all ${
                sortBy === "rating"
                  ? "bg-cyan-950 border-cyan-700 text-cyan-300"
                  : "bg-slate-800 border-slate-700 text-slate-400 hover:text-white"
              }`}
            >
              Mejor Calificación
            </button>
          </div>
        </div>

        {/* Store Offer Cards */}
        <div className="space-y-3">
          {sortedOffers.map((offer) => {
            const convertedPrice = convertAndFormatPrice(offer.price, offer.currency, selectedRegion);
            const storeUrl = buildDirectStoreUrl(
              product.title,
              offer.storeName,
              offer.storeDomain,
              selectedRegion,
              product.model,
              product.brand
            );

            return (
              <div
                key={offer.id}
                className={`p-4 rounded-xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                  offer.isBestPrice
                    ? "bg-emerald-950/20 border-emerald-800/80 ring-1 ring-emerald-500/20"
                    : "bg-slate-950/60 border-slate-800 hover:border-slate-700"
                }`}
              >
                {/* Store identity */}
                <div className="flex items-center gap-3 min-w-[200px]">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-300 font-bold text-xs shrink-0">
                    {offer.storeName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-semibold text-white">{offer.storeName}</span>
                      {offer.isBestPrice && (
                        <span className="text-[10px] font-bold bg-emerald-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                          MEJOR PRECIO
                        </span>
                      )}
                      {offer.isTikTokShop && (
                        <span className="text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded font-mono">
                          TikTok Shop
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                      <span className="text-amber-400">★ {offer.sellerRating.toFixed(1)}</span>
                      <span>•</span>
                      <span className="text-[11px] text-slate-500">{offer.warrantyInfo}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping & Delivery details */}
                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Truck className="w-3.5 h-3.5 text-slate-500" />
                    {offer.shippingCost}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {offer.deliveryEstimate}
                  </span>
                  <span className={`text-[11px] px-2 py-0.5 rounded font-mono ${offer.inStock ? "text-emerald-400 bg-emerald-950/50" : "text-rose-400 bg-rose-950/50"}`}>
                    {offer.stockCountText || (offer.inStock ? "En Stock" : "Agotado")}
                  </span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                  <div className="text-left md:text-right">
                    <div className="text-lg sm:text-xl font-bold font-mono text-white">
                      {convertedPrice.symbol}{convertedPrice.formattedAmount} <span className="text-xs text-slate-400 font-sans">{convertedPrice.currency}</span>
                    </div>
                    {offer.discountPercentage && offer.discountPercentage > 0 && (
                      <div className="text-[11px] text-emerald-400 font-mono">
                        -{offer.discountPercentage}% descuento
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onInspectStore(offer)}
                      className="p-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-all text-xs"
                      title="Inspección detallada con AURA"
                    >
                      <Search className="w-3.5 h-3.5 text-cyan-400" />
                    </button>

                    <a
                      href={storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <span>Ver Tienda</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 6. PRICE TREND & RECOMMENDATION */}
      {product.priceTrend && (() => {
        const histLow = convertAndFormatPrice(product.priceTrend.historicalLow, "USD", selectedRegion);
        const currentBest = bestOffer 
          ? convertAndFormatPrice(bestOffer.price, bestOffer.currency, selectedRegion)
          : histLow;
        const histHigh = convertAndFormatPrice(product.priceTrend.historicalHigh, "USD", selectedRegion);

        return (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-indigo-400" />
                Tendencia Histórica y Veredicto de Compra
              </h3>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold font-mono ${
                product.priceTrend.recommendation === "COMPRAR AHORA"
                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                  : "bg-amber-950 text-amber-300 border border-amber-800"
              }`}>
                {product.priceTrend.recommendation}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 block">Mínimo Histórico Registrado</span>
                <span className="text-lg font-bold font-mono text-emerald-400">
                  {histLow.symbol}{histLow.formattedAmount} <span className="text-xs">{histLow.currency}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 block">Precio Actual en Mejor Tienda</span>
                <span className="text-lg font-bold font-mono text-cyan-400">
                  {currentBest.symbol}{currentBest.formattedAmount} <span className="text-xs">{currentBest.currency}</span>
                </span>
              </div>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-center">
                <span className="text-[11px] text-slate-500 block">Máximo Histórico de Referencia</span>
                <span className="text-lg font-bold font-mono text-slate-400">
                  {histHigh.symbol}{histHigh.formattedAmount} <span className="text-xs">{histHigh.currency}</span>
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-400 bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
              <span className="font-semibold text-slate-200">Análisis del Agente: </span>
              {product.priceTrend.analysis}
            </p>
          </div>
        );
      })()}

      {/* 7. TECHNICAL SPECIFICATIONS & GROUNDING SOURCES ACCORDION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Specs */}
        {product.specs && product.specs.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                Ficha Técnica Verificada
              </h4>
              <button
                onClick={() => setShowAllSpecs(!showAllSpecs)}
                className="text-[11px] text-cyan-400 hover:underline flex items-center gap-0.5"
              >
                <span>{showAllSpecs ? "Ver menos" : "Ver todo"}</span>
                {showAllSpecs ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>

            <div className="space-y-1.5">
              {(showAllSpecs ? product.specs : product.specs.slice(0, 5)).map((spec, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between text-xs py-1.5 border-b border-slate-800/60 font-mono"
                >
                  <span className="text-slate-400">{spec.name}</span>
                  <span className="text-slate-200 font-medium text-right">{spec.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Verification sources from Google Grounding */}
        {product.groundingSources && product.groundingSources.length > 0 && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Search className="w-3.5 h-3.5 text-emerald-400" />
                Fuentes y Rastreo en Tiempo Real
              </h4>
              <span className="text-[10px] text-slate-500 font-mono">Verificado</span>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {product.groundingSources.map((src, i) => (
                <a
                  key={i}
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-slate-950 hover:bg-slate-850 border border-slate-800 flex items-center justify-between text-xs text-slate-300 hover:text-cyan-300 transition-colors group"
                >
                  <span className="truncate pr-2">{src.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 text-slate-500 group-hover:text-cyan-400" />
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
