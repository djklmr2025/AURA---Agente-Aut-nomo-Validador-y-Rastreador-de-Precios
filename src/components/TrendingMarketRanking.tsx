import React, { useState } from "react";
import { 
  TrendingUp, 
  Flame, 
  Clock, 
  ShoppingBag, 
  Search, 
  ShieldCheck, 
  Zap, 
  Terminal, 
  ArrowUpRight, 
  ArrowDownRight, 
  BarChart3, 
  Store, 
  CheckCircle2, 
  Tag, 
  Layers,
  Sparkles,
  Bot,
  RefreshCw
} from "lucide-react";
import { ProductScanResult, StorePriceOffer } from "../types";
import { convertAndFormatPrice } from "../utils/currencyConverter";

interface TrendingMarketRankingProps {
  products: ProductScanResult[];
  selectedRegion: string;
  onSelectProduct: (product: ProductScanResult) => void;
  onViewLog: (product: ProductScanResult) => void;
  onQuickRevalidate?: (product: ProductScanResult) => void;
  onOpenDaemonModal?: (product: ProductScanResult) => void;
}

type RankingSortMode = "most_searched" | "latest_updates" | "sales_volume" | "best_discount";

export const TrendingMarketRanking: React.FC<TrendingMarketRankingProps> = ({
  products,
  selectedRegion,
  onSelectProduct,
  onViewLog,
  onQuickRevalidate,
  onOpenDaemonModal,
}) => {
  const [sortMode, setSortMode] = useState<RankingSortMode>("most_searched");
  const [searchFilter, setSearchFilter] = useState<string>("");
  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);

  // Filter products by search text
  const filtered = products.filter((p) => {
    if (!searchFilter.trim()) return true;
    const q = searchFilter.toLowerCase();
    const matchesTitle = p.title.toLowerCase().includes(q);
    const matchesBrand = (p.brand || "").toLowerCase().includes(q);
    const matchesModel = (p.model || "").toLowerCase().includes(q);
    const matchesAliases = (p.aliases || []).some(a => a.toLowerCase().includes(q));
    return matchesTitle || matchesBrand || matchesModel || matchesAliases;
  });

  // Sort products according to selected mode
  const sorted = [...filtered].sort((a, b) => {
    if (sortMode === "most_searched") {
      return (b.searchCount || 1) - (a.searchCount || 1);
    }
    if (sortMode === "latest_updates") {
      const timeA = a.lastUpdated || a.timestamp || 0;
      const timeB = b.lastUpdated || b.timestamp || 0;
      return timeB - timeA;
    }
    if (sortMode === "sales_volume") {
      const salesA = a.totalMarketPurchases || 0;
      const salesB = b.totalMarketPurchases || 0;
      return salesB - salesA;
    }
    if (sortMode === "best_discount") {
      const discA = a.bestDeal?.savingsPercentage || 0;
      const discB = b.bestDeal?.savingsPercentage || 0;
      return discB - discA;
    }
    return 0;
  });

  // Format relative timestamp
  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "Recién registrado";
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Hace unos segundos";
    if (diffMin < 60) return `Hace ${diffMin} min`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours}h ${diffMin % 60}m`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays} días`;
  };

  const formatExactDate = (timestamp?: number) => {
    if (!timestamp) return "Hoy";
    return new Date(timestamp).toLocaleString("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Header Banner with Telemetry Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-gradient-to-tr from-amber-500/20 via-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/30 rounded-xl shrink-0">
              <BarChart3 className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Ranking General & Telemetría de Mercado
                </h2>
                <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/80 px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1">
                  <Flame className="w-3 h-3 text-amber-400" />
                  Tendencias en Vivo
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                  Validador Anti-Duplicados Activo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Monitoreo consolidado de productos más buscados, frecuencia de actualización de precios y volumen de compras por tienda.
              </p>
            </div>
          </div>

          {/* Search Box in Header */}
          <div className="relative w-full lg:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar en el ranking o modelo..."
              className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
            />
            {searchFilter && (
              <button
                onClick={() => setSearchFilter("")}
                className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 text-xs"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* 2. Mode Filter Navigation Pills */}
        <div className="flex items-center gap-2 pt-4 overflow-x-auto scrollbar-none text-xs">
          <button
            onClick={() => setSortMode("most_searched")}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              sortMode === "most_searched"
                ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                : "bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Flame className="w-4 h-4" />
            <span>Más Buscados ({sorted.length})</span>
          </button>

          <button
            onClick={() => setSortMode("latest_updates")}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              sortMode === "latest_updates"
                ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20"
                : "bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Última Actualización de Precios</span>
          </button>

          <button
            onClick={() => setSortMode("sales_volume")}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              sortMode === "sales_volume"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Nivel de Artículos Comprados en Tiendas</span>
          </button>

          <button
            onClick={() => setSortMode("best_discount")}
            className={`px-3.5 py-2 rounded-xl font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              sortMode === "best_discount"
                ? "bg-indigo-500 text-white shadow-md shadow-indigo-500/20"
                : "bg-slate-950/80 text-slate-400 border border-slate-800 hover:text-white"
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Mayor Porcentaje de Ahorro</span>
          </button>
        </div>
      </div>

      {/* 3. Ranking List */}
      <div className="space-y-3.5">
        {sorted.length === 0 ? (
          <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-2xl">
            <p className="text-xs text-slate-400">No se encontraron productos coincidentes en el ranking.</p>
          </div>
        ) : (
          sorted.map((p, idx) => {
            const bestDeal = p.bestDeal;
            const formattedBest = bestDeal
              ? convertAndFormatPrice(bestDeal.price, bestDeal.currency, selectedRegion)
              : null;

            const isExpanded = expandedProductId === p.id;
            const searchCount = p.searchCount || 1;
            const lastUpdatedTime = p.lastUpdated || p.timestamp || Date.now();
            const totalSold = p.totalMarketPurchases || (
              p.offers?.reduce((sum, o) => sum + (o.unitsSoldTotal || 0), 0) || 1200
            );

            // Medals for top 3
            const rankNumber = idx + 1;
            let rankBadgeBg = "bg-slate-800 text-slate-300 border-slate-700";
            if (rankNumber === 1) rankBadgeBg = "bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold";
            if (rankNumber === 2) rankBadgeBg = "bg-slate-300/20 text-slate-200 border-slate-400/40 font-bold";
            if (rankNumber === 3) rankBadgeBg = "bg-amber-700/20 text-amber-400 border-amber-700/40 font-bold";

            return (
              <div
                key={p.id}
                id={`ranking-item-${p.id}`}
                className="bg-slate-900/95 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 rounded-2xl p-4 sm:p-5 transition-all shadow-lg"
              >
                {/* Main Summary Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  
                  {/* Left Block: Rank + Image + Product Title & Metadata */}
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                    
                    {/* Rank Badge */}
                    <div className={`w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-mono shrink-0 shadow-sm ${rankBadgeBg}`}>
                      {rankNumber === 1 ? "🥇 #1" : rankNumber === 2 ? "🥈 #2" : rankNumber === 3 ? "🥉 #3" : `#${rankNumber}`}
                    </div>

                    {/* Product Photo */}
                    <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                      {p.productImageUrl || p.imageScannedUrl ? (
                        <img
                          src={p.productImageUrl || p.imageScannedUrl}
                          alt={p.title}
                          className="w-full h-full object-contain hover:scale-110 transition-transform"
                        />
                      ) : (
                        <ShoppingBag className="w-6 h-6 text-slate-600" />
                      )}
                    </div>

                    {/* Titles, Category & Intelligent Aliases */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.2 rounded font-bold">
                          {p.brand}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.2 rounded">
                          {p.authenticityScore}% AUTÉNTICO
                        </span>
                        {p.category && (
                          <span className="text-[10px] text-slate-500 hidden sm:inline-block">
                            • {p.category}
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => onSelectProduct(p)}
                        className="text-xs sm:text-sm font-bold text-white hover:text-cyan-300 cursor-pointer line-clamp-1 mt-1 leading-snug"
                        title={p.title}
                      >
                        {p.title}
                      </h3>

                      {/* Associated search queries / aliases */}
                      {p.aliases && p.aliases.length > 1 && (
                        <div className="flex items-center gap-1.5 mt-1 overflow-x-auto scrollbar-none">
                          <span className="text-[9px] text-slate-500 font-mono">Búsquedas unificadas:</span>
                          {p.aliases.slice(0, 3).map((alias, aIdx) => (
                            <span
                              key={aIdx}
                              className="text-[9px] bg-slate-950 text-slate-400 border border-slate-800 px-1.5 py-0.5 rounded font-mono truncate max-w-[140px]"
                              title={alias}
                            >
                              {alias}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Center/Right Block: Telemetry Pills (Searches, Last Update, Market Purchases) */}
                  <div className="flex items-center gap-3 sm:gap-4 flex-wrap lg:flex-nowrap shrink-0 border-t lg:border-t-0 border-slate-800 pt-3 lg:pt-0">
                    
                    {/* 1. Search Count Badge */}
                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-center min-w-[95px]">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Búsquedas</span>
                      <span className="text-xs font-bold text-amber-400 flex items-center justify-center gap-1">
                        <Flame className="w-3 h-3" />
                        {searchCount} {searchCount === 1 ? "consulta" : "consultas"}
                      </span>
                    </div>

                    {/* 2. Total Market Sold Level */}
                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-center min-w-[110px]">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Comprados</span>
                      <span className="text-xs font-bold text-emerald-400 flex items-center justify-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {totalSold >= 1000 ? `+${(totalSold / 1000).toFixed(1)}K` : `+${totalSold}`} unid.
                      </span>
                    </div>

                    {/* 3. Date / Time of Last Price Update */}
                    <div className="bg-slate-950 border border-slate-800 px-3 py-2 rounded-xl text-right min-w-[125px]">
                      <span className="text-[9px] text-slate-500 uppercase font-mono block">Último Precio</span>
                      <span className="text-xs font-bold text-cyan-300 block">
                        {formatTimeAgo(lastUpdatedTime)}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block">
                        {formatExactDate(lastUpdatedTime)}
                      </span>
                    </div>

                    {/* 4. Best Price Callout */}
                    {bestDeal && formattedBest && (
                      <div className="bg-slate-950 border border-emerald-500/30 px-3 py-2 rounded-xl text-right min-w-[115px]">
                        <span className="text-[9px] text-slate-500 uppercase font-mono block truncate max-w-[100px]">
                          {bestDeal.storeName}
                        </span>
                        <span className="text-sm font-bold text-emerald-400 font-mono">
                          {formattedBest.symbol}{formattedBest.formattedAmount}
                        </span>
                        {bestDeal.savingsPercentage > 0 && (
                          <span className="text-[9px] text-emerald-400 font-bold block">
                            -{bestDeal.savingsPercentage}% ahorro
                          </span>
                        )}
                      </div>
                    )}

                    {/* Action Dropdown Toggle & Direct Buttons */}
                    <div className="flex items-center gap-1.5 ml-auto lg:ml-0">
                      <button
                        id={`btn-expand-ranking-${p.id}`}
                        onClick={() => setExpandedProductId(isExpanded ? null : p.id)}
                        className={`px-3 py-2 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 ${
                          isExpanded
                            ? "bg-cyan-500 text-slate-950 border-cyan-400"
                            : "bg-slate-950 text-slate-300 border-slate-800 hover:text-white hover:border-slate-700"
                        }`}
                        title="Ver desglose por tienda y evolución de precios"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>{isExpanded ? "Ocultar" : "Detalles"}</span>
                      </button>

                      <button
                        onClick={() => onSelectProduct(p)}
                        className="px-3.5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-md transition-all"
                      >
                        Abrir
                      </button>
                    </div>
                  </div>
                </div>

                {/* EXPANDED ACCORDION: Granular Store-by-Store Sales & Price History */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-4 animate-fadeIn">
                    
                    {/* Store by Store Real Purchase Level */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Store className="w-3.5 h-3.5 text-cyan-400" />
                          Nivel de Compras y Actividad por Tienda Validada
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Fecha de actualización en vivo: {formatExactDate(lastUpdatedTime)}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                        {p.offers?.map((offer) => {
                          const converted = convertAndFormatPrice(offer.price, offer.currency, selectedRegion);
                          const units = offer.unitsSoldTotal || (offer.sellerReviewsCount ? offer.sellerReviewsCount * 2 : 500);

                          return (
                            <div
                              key={offer.id}
                              className="p-3 bg-slate-950 border border-slate-800/90 rounded-xl flex flex-col justify-between gap-2"
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-xs font-bold text-white block">
                                    {offer.storeName}
                                  </span>
                                  {offer.certificationBadge && (
                                    <span className="text-[9px] text-cyan-400 font-mono flex items-center gap-1 mt-0.5">
                                      <CheckCircle2 className="w-2.5 h-2.5" />
                                      {offer.certificationBadge}
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-bold text-emerald-400 font-mono">
                                  {converted.symbol}{converted.formattedAmount} {converted.currency}
                                </span>
                              </div>

                              {/* Sales Metric in this Store */}
                              <div className="space-y-1 pt-1 border-t border-slate-900 font-mono text-[10px]">
                                <div className="flex items-center justify-between text-slate-300">
                                  <span className="text-slate-500">Volumen Vendido:</span>
                                  <span className="font-bold text-amber-400">
                                    {offer.unitsSoldText || `+${units} unidades vendidas`}
                                  </span>
                                </div>
                                
                                {offer.recentSalesText && (
                                  <div className="flex items-center justify-between text-slate-300">
                                    <span className="text-slate-500">Ritmo de Compra:</span>
                                    <span className="font-bold text-cyan-300">
                                      {offer.recentSalesText}
                                    </span>
                                  </div>
                                )}

                                <div className="flex items-center justify-between text-slate-400">
                                  <span className="text-slate-500">Reputación / Stock:</span>
                                  <span>★ {offer.sellerRating} • {offer.stockCountText || "En almacén"}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Historical Price Update Timeline */}
                    {p.priceUpdateHistory && p.priceUpdateHistory.length > 0 && (
                      <div className="bg-slate-950/90 p-3.5 rounded-xl border border-slate-800">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            Historial de Actualizaciones de Precios
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {p.priceUpdateHistory.length} registros cronológicos
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {p.priceUpdateHistory.map((rec, rIdx) => {
                            const formatted = convertAndFormatPrice(rec.price, rec.currency, selectedRegion);
                            return (
                              <div
                                key={rIdx}
                                className="flex items-center justify-between gap-2 p-2 bg-slate-900/80 rounded-lg text-xs font-mono"
                              >
                                <div className="flex items-center gap-2">
                                  {rec.changeType === "drop" ? (
                                    <ArrowDownRight className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                  ) : rec.changeType === "increase" ? (
                                    <ArrowUpRight className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                                  ) : (
                                    <span className="w-3.5 h-3.5 flex items-center justify-center text-slate-500">•</span>
                                  )}
                                  <span className="text-slate-300">{rec.storeName}</span>
                                  <span className="text-[10px] text-slate-500">
                                    {formatExactDate(rec.timestamp)} ({formatTimeAgo(rec.timestamp)})
                                  </span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white">
                                    {formatted.symbol}{formatted.formattedAmount} {formatted.currency}
                                  </span>
                                  {rec.savingsPercentage && rec.savingsPercentage > 0 && (
                                    <span className="text-[10px] text-emerald-400 font-bold bg-emerald-950/80 px-1.5 py-0.5 rounded">
                                      -{rec.savingsPercentage}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Quick Action Buttons */}
                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-850">
                      <button
                        onClick={() => onViewLog(p)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-cyan-300 border border-slate-800 rounded-lg text-xs font-mono font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Ver Enramado .log</span>
                      </button>

                      {onQuickRevalidate && (
                        <button
                          onClick={() => onQuickRevalidate(p)}
                          className="px-3 py-1.5 bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all"
                        >
                          <Zap className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Revalidar Precio en Vivo</span>
                        </button>
                      )}

                      {onOpenDaemonModal && (
                        <button
                          onClick={() => onOpenDaemonModal(p)}
                          className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1.5 transition-all"
                        >
                          <Bot className="w-3.5 h-3.5" />
                          <span>Demonio / Agente de Validación</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
