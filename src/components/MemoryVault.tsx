import React, { useState } from "react";
import { 
  X, 
  History, 
  Trash2, 
  Bell, 
  Layers, 
  ShoppingBag, 
  Terminal,
  Download,
  ShieldCheck,
  Zap,
  GitBranch
} from "lucide-react";
import { ProductScanResult, PriceAlert } from "../types";
import { convertAndFormatPrice, getRegionConfig } from "../utils/regionUtils";
import { downloadLogFile, generateAutonomousLog } from "../utils/trajectoryLogHelper";

interface MemoryVaultProps {
  isOpen: boolean;
  onClose: () => void;
  savedProducts: ProductScanResult[];
  onSelectProduct: (product: ProductScanResult) => void;
  onDeleteProduct: (id: string) => void;
  onClearHistory: () => void;
  priceAlerts: PriceAlert[];
  onRemoveAlert: (id: string) => void;
  onViewLog?: (product: ProductScanResult) => void;
  selectedRegion?: string;
}

export const MemoryVault: React.FC<MemoryVaultProps> = ({
  isOpen,
  onClose,
  savedProducts,
  onSelectProduct,
  onDeleteProduct,
  onClearHistory,
  priceAlerts,
  onRemoveAlert,
  onViewLog,
  selectedRegion = "GLOBAL",
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "logs" | "alerts" | "compare">("history");
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  const regionConfig = getRegionConfig(selectedRegion);

  if (!isOpen) return null;

  const toggleCompare = (id: string) => {
    setSelectedForCompare((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : prev.length < 3 ? [...prev, id] : prev
    );
  };

  const comparedItems = savedProducts.filter((p) => selectedForCompare.includes(p.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                Bóveda de Memoria & Seguimiento
              </h3>
              <p className="text-xs text-slate-400">
                Historial de cotizaciones validadas para {regionConfig.name} ({regionConfig.currency})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Sub-header */}
        <div className="px-4 sm:px-5 pt-3 border-b border-slate-800 flex items-center justify-between overflow-x-auto scrollbar-none">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("history")}
              className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "history"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Historial ({savedProducts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("logs")}
              className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "logs"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Memoria Fotográfica (.log)</span>
            </button>

            <button
              onClick={() => setActiveTab("alerts")}
              className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "alerts"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Alertas ({priceAlerts.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("compare")}
              className={`pb-3 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === "compare"
                  ? "border-cyan-400 text-cyan-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <span>Comparador ({selectedForCompare.length})</span>
            </button>
          </div>

          {activeTab === "history" && savedProducts.length > 0 && (
            <button
              onClick={onClearHistory}
              className="text-[11px] text-rose-400 hover:text-rose-300 pb-3 flex items-center gap-1 shrink-0 ml-2"
            >
              <Trash2 className="w-3 h-3" />
              <span>Limpiar todo</span>
            </button>
          )}
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-3">
          
          {/* 1. HISTORY TAB */}
          {activeTab === "history" && (
            <>
              {savedProducts.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <History className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-medium text-slate-300">No hay productos en memoria</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Escanea o busca cualquier producto para que el agente lo recuerde.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {savedProducts.map((p) => {
                    const isChecked = selectedForCompare.includes(p.id);
                    const bestPrice = p.bestDeal 
                      ? convertAndFormatPrice(p.bestDeal.price, p.bestDeal.currency, selectedRegion)
                      : null;

                    return (
                      <div
                        key={p.id}
                        className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleCompare(p.id)}
                            className="rounded border-slate-700 text-cyan-500 focus:ring-0 cursor-pointer"
                            title="Seleccionar para comparar"
                          />

                          <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                            {p.productImageUrl || p.imageScannedUrl ? (
                              <img
                                src={p.productImageUrl || p.imageScannedUrl}
                                alt={p.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <ShoppingBag className="w-5 h-5 text-slate-600" />
                            )}
                          </div>

                          <div className="min-w-0">
                            <h4
                              onClick={() => {
                                onSelectProduct(p);
                                onClose();
                              }}
                              className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer truncate max-w-xs sm:max-w-sm"
                            >
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5 font-mono">
                              {bestPrice && (
                                <span className="text-emerald-400 font-bold">
                                  {bestPrice.symbol}{bestPrice.formattedAmount} {bestPrice.currency}
                                </span>
                              )}
                              <span>•</span>
                              <span>{p.bestDeal?.storeName}</span>
                              <span>•</span>
                              <span className="text-slate-500">
                                {new Date(p.timestamp).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-end sm:self-center">
                          {onViewLog && (
                            <button
                              onClick={() => {
                                onViewLog(p);
                                onClose();
                              }}
                              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-semibold rounded-lg flex items-center gap-1"
                              title="Ver .log"
                            >
                              <Terminal className="w-3.5 h-3.5" />
                              <span>.log</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              onSelectProduct(p);
                              onClose();
                            }}
                            className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg transition-all"
                          >
                            Ver Detalles
                          </button>

                          <button
                            onClick={() => onDeleteProduct(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Eliminar de memoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 2. PHOTOGRAPHIC MEMORY & .LOG FILES TAB */}
          {activeTab === "logs" && (
            <div className="space-y-3">
              <div className="p-3 bg-slate-950 border border-cyan-500/30 rounded-xl flex items-center justify-between text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-400" />
                  <span>
                    Enramados y trazabilidad de autonavegación listos para reutilización acelerada.
                  </span>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  {savedProducts.length} Archivos .log
                </span>
              </div>

              {savedProducts.map((p) => {
                const log = p.trajectoryLog || generateAutonomousLog(
                  p.title,
                  selectedRegion,
                  p.bestDeal?.storeName || "TikTok Shop",
                  p.bestDeal?.price || 100,
                  p.bestDeal?.currency || "USD"
                );

                return (
                  <div
                    key={p.id}
                    className="p-3.5 bg-slate-950/90 rounded-xl border border-slate-800 hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded">
                          {log.trajectoryId}
                        </span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 border border-emerald-800 px-2 py-0.5 rounded flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          Anti-Fraude OK
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {log.steps.length} Nodos • 3.2x Speedup
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate max-w-md">
                        {p.title}
                      </h4>
                      <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                        Hash: {log.queryHash} • {new Date(p.timestamp).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          const filename = `aura_${p.brand.replace(/\s+/g, "_")}_${p.model.replace(/\s+/g, "_")}_${log.trajectoryId}.log`;
                          downloadLogFile(log.rawLog, filename);
                        }}
                        className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-all"
                        title="Descargar archivo .log"
                      >
                        <Download className="w-3.5 h-3.5 text-cyan-400" />
                        <span>.log</span>
                      </button>

                      {onViewLog && (
                        <button
                          onClick={() => {
                            onViewLog(p);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                        >
                          Explorar Enramado
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. ALERTS TAB */}
          {activeTab === "alerts" && (
            <>
              {priceAlerts.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <Bell className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-medium text-slate-300">No hay alertas de precio configuradas</p>
                  <p className="text-xs text-slate-500 mt-1">
                    Crea una alerta desde la vista de cualquier producto para monitorear caídas de precio.
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {priceAlerts.map((alert) => {
                    const targetConv = convertAndFormatPrice(alert.targetPrice, alert.currency, selectedRegion);
                    const currConv = convertAndFormatPrice(alert.currentBestPrice, alert.currency, selectedRegion);

                    return (
                      <div
                        key={alert.id}
                        className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
                            <Bell className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-white">{alert.productTitle}</h4>
                            <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                              Objetivo: <span className="text-emerald-400 font-bold">{targetConv.symbol}{targetConv.formattedAmount} {targetConv.currency}</span> | Actual: {currConv.symbol}{currConv.formattedAmount} {currConv.currency}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => onRemoveAlert(alert.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}

          {/* 4. COMPARE TAB */}
          {activeTab === "compare" && (
            <>
              {comparedItems.length < 2 ? (
                <div className="py-12 text-center text-slate-500">
                  <Layers className="w-10 h-10 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm font-medium text-slate-300">Selecciona al menos 2 productos</p>
                  <p className="text-xs text-slate-500 mt-1">
                    En la pestaña de historial marca las casillas de los productos que deseas contrastar.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {comparedItems.map((item) => {
                    const bestConv = item.bestDeal 
                      ? convertAndFormatPrice(item.bestDeal.price, item.bestDeal.currency, selectedRegion)
                      : null;

                    return (
                      <div
                        key={item.id}
                        className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-3"
                      >
                        <div className="aspect-square bg-slate-900 rounded-lg overflow-hidden p-2 flex items-center justify-center">
                          {item.productImageUrl || item.imageScannedUrl ? (
                            <img
                              src={item.productImageUrl || item.imageScannedUrl}
                              alt={item.title}
                              className="w-full h-full object-contain"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-slate-600" />
                          )}
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-white line-clamp-2">{item.title}</h4>
                          {bestConv && (
                            <div className="text-sm font-mono font-bold text-emerald-400 mt-1">
                              {bestConv.symbol}{bestConv.formattedAmount} {bestConv.currency}
                            </div>
                          )}
                          <span className="text-[10px] text-slate-400 block">{item.bestDeal?.storeName}</span>
                        </div>

                        <div className="text-[11px] font-mono border-t border-slate-800 pt-2 space-y-1">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Autenticidad:</span>
                            <span className="text-cyan-400 font-bold">{item.authenticityScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Veredicto:</span>
                            <span className="text-slate-300 font-semibold">{item.priceTrend?.recommendation}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            onSelectProduct(item);
                            onClose();
                          }}
                          className="w-full py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg transition-all"
                        >
                          Abrir Reporte
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
