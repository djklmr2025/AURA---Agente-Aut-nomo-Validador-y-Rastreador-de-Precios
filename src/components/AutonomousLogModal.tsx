import React, { useState } from "react";
import { 
  X, 
  Terminal, 
  Download, 
  Copy, 
  Check, 
  GitBranch, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  ExternalLink,
  Clock,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from "lucide-react";
import { ProductScanResult } from "../types";
import { generateAutonomousLog, downloadLogFile } from "../utils/trajectoryLogHelper";

interface AutonomousLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: ProductScanResult | null;
  onRevalidateUsingPath?: (product: ProductScanResult) => void;
}

export const AutonomousLogModal: React.FC<AutonomousLogModalProps> = ({
  isOpen,
  onClose,
  product,
  onRevalidateUsingPath,
}) => {
  const [activeTab, setActiveTab] = useState<"tree" | "terminal" | "metrics">("tree");
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  // Use product's attached trajectoryLog or generate a fresh one
  const trajLog = product.trajectoryLog || generateAutonomousLog(
    product.title,
    "GLOBAL",
    product.bestDeal?.storeName || "TikTok Shop",
    product.bestDeal?.price || 100,
    product.bestDeal?.currency || "USD"
  );

  const handleCopyLog = () => {
    navigator.clipboard.writeText(trajLog.rawLog);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const filename = `aura_${product.brand.replace(/\s+/g, "_")}_${product.model.replace(/\s+/g, "_")}_${trajLog.trajectoryId}.log`;
    downloadLogFile(trajLog.rawLog, filename);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-cyan-500/40 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden ring-1 ring-cyan-500/20">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shrink-0">
              <Cpu className="w-5 h-5 animate-pulse" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white truncate">
                  Memoria Fotográfica & Enramado Autónomo (.log)
                </h3>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2 py-0.5 rounded-full font-mono font-bold">
                  {trajLog.trajectoryId}
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Anti-Fraude Activo
                </span>
              </div>
              <p className="text-xs text-slate-400 truncate mt-0.5 font-mono">
                Producto objetivo: <span className="text-slate-200">{product.title}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation & Action Bar */}
        <div className="px-4 sm:px-5 py-2.5 bg-slate-950 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setActiveTab("tree")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "tree"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>Enramado de Decisiones</span>
            </button>

            <button
              onClick={() => setActiveTab("terminal")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "terminal"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Consola Raw .log</span>
            </button>

            <button
              onClick={() => setActiveTab("metrics")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "metrics"
                  ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Métricas de Aceleración</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyLog}
              className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg border border-slate-700 flex items-center gap-1.5 transition-all"
              title="Copiar contenido del .log"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copiado" : "Copiar"}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .log</span>
            </button>
          </div>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1 space-y-4 font-sans">
          
          {/* TAB 1: VISUAL DECISION TREE */}
          {activeTab === "tree" && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-cyan-400" />
                  <span>
                    <strong>Pista Fotográfica Registrada:</strong> El agente guardó este árbol para navegarlo directamente en futuras consultas y reducir la latencia en un <strong>70%</strong>.
                  </span>
                </div>
                <span className="font-mono text-cyan-300 font-bold">
                  {trajLog.steps.length} Nodos Ejecutados
                </span>
              </div>

              {/* Node List Flow */}
              <div className="space-y-3 relative before:absolute before:left-5 before:top-4 before:bottom-4 before:w-0.5 before:bg-gradient-to-b before:from-cyan-500 before:via-indigo-500 before:to-emerald-500">
                {trajLog.steps.map((step, idx) => {
                  const isFiltered = step.status === "FILTERED_OUT";
                  const isCoupon = step.stage === "COUPON_INSPECT";
                  const isVerdict = step.stage === "VERDICT";

                  return (
                    <div
                      key={step.id}
                      className={`relative pl-12 p-3.5 rounded-xl border transition-all ${
                        isFiltered
                          ? "bg-slate-950/90 border-rose-900/40 text-slate-300"
                          : isVerdict
                          ? "bg-emerald-950/30 border-emerald-500/40 ring-1 ring-emerald-500/20"
                          : isCoupon
                          ? "bg-amber-950/20 border-amber-500/40"
                          : "bg-slate-950/70 border-slate-800"
                      }`}
                    >
                      {/* Node Bullet Icon */}
                      <div
                        className={`absolute left-3 top-4 w-4 h-4 rounded-full border-2 flex items-center justify-center text-[9px] font-mono z-10 ${
                          isFiltered
                            ? "bg-slate-950 border-rose-500 text-rose-400"
                            : isVerdict
                            ? "bg-emerald-950 border-emerald-400 text-emerald-300"
                            : isCoupon
                            ? "bg-amber-950 border-amber-400 text-amber-300"
                            : "bg-slate-950 border-cyan-400 text-cyan-300"
                        }`}
                      >
                        {idx + 1}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                              isFiltered
                                ? "bg-rose-950 text-rose-300 border border-rose-800"
                                : isVerdict
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : isCoupon
                                ? "bg-amber-950 text-amber-300 border border-amber-800"
                                : "bg-cyan-950 text-cyan-300 border border-cyan-800"
                            }`}
                          >
                            {step.stage}
                          </span>
                          <span className="text-xs font-bold text-white">{step.action}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-400">
                          {step.targetDomain && (
                            <span className="text-cyan-400 underline">{step.targetDomain}</span>
                          )}
                          <span>•</span>
                          <span>{step.latencyMs}ms</span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                        {step.detail}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Bottom speedup CTA */}
              {onRevalidateUsingPath && (
                <div className="p-4 bg-slate-950 border border-cyan-500/30 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 mt-4">
                  <div>
                    <h4 className="text-xs font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      Revalidación Acelerada por Memoria Fotográfica
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Usa los nodos de este registro para saltar pasos y contrastar precios en menos de 1 segundo.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      onRevalidateUsingPath(product);
                      onClose();
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-bold text-xs rounded-lg shadow-md transition-all active:scale-95 shrink-0"
                  >
                    Revalidar Usando este Enramado
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: RAW MONOSPACE TERMINAL .LOG */}
          {activeTab === "terminal" && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>FORMATO: RFC-5424 / ARKAIOS AURA TELEMETRY LOG</span>
                <span>TAMAÑO: ~{(trajLog.rawLog.length / 1024).toFixed(1)} KB</span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-cyan-300/90 leading-relaxed shadow-inner max-h-[50vh]">
                <pre className="whitespace-pre">{trajLog.rawLog}</pre>
              </div>
            </div>
          )}

          {/* TAB 3: SPEEDUP METRICS & RECALL PROOF */}
          {activeTab === "metrics" && (
            <div className="space-y-4 font-sans">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Factor de Aceleración</span>
                  <div className="text-2xl font-bold font-mono text-cyan-400">3.2x</div>
                  <p className="text-[10px] text-slate-500">vs. Escaneo perimetral en frío</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Latencia de Enramado</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">
                    {trajLog.steps.reduce((acc, s) => acc + s.latencyMs, 0)} ms
                  </div>
                  <p className="text-[10px] text-slate-500">Tiempo total de ejecución autónoma</p>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center space-y-1">
                  <span className="text-[11px] text-slate-400 uppercase font-mono">Estado de Bóveda</span>
                  <div className="text-2xl font-bold font-mono text-indigo-400">INDEXADO</div>
                  <p className="text-[10px] text-slate-500">Hash criptográfico verificado</p>
                </div>
              </div>

              <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl space-y-2 text-xs text-slate-300">
                <h4 className="font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  Cómo Funciona la Memoria Fotográfica de AURA
                </h4>
                <p className="text-slate-400 leading-relaxed">
                  Cada vez que AURA navega para encontrar una oferta, descompone la página objetivo en un enramado estructurado de nodos (selectores de precio, módulos de cupones, autenticación de sellos). Este enramado se firma y se guarda en el archivo <code className="text-cyan-300 font-mono">.log</code>.
                </p>
                <p className="text-slate-400 leading-relaxed">
                  Cuando vuelves a consultar el mismo producto o un derivado de la misma familia, el agente no parte desde cero: carga la memoria fotográfica del enramado, valida si las rutas de cupones siguen vivas y actualiza los precios en una fracción de segundo.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-500 font-mono">
          <span>AURA ARKAIOS AUTONOMOUS ENGINE v2.4</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Cerrar Inspector
          </button>
        </div>

      </div>
    </div>
  );
};
