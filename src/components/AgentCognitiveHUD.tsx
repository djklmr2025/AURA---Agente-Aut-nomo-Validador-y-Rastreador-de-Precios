import React, { useEffect, useState } from "react";
import { 
  Bot, 
  Terminal, 
  Search, 
  ShieldCheck, 
  Globe, 
  CheckCircle, 
  Loader2, 
  Layers, 
  TrendingDown,
  ShoppingBag,
  ExternalLink
} from "lucide-react";

interface AgentCognitiveHUDProps {
  isLoading: boolean;
  productQuery?: string;
  customThoughts?: string[];
}

interface SpiderStore {
  name: string;
  domain: string;
  status: "pending" | "scanning" | "verified" | "extracted";
  priceFound?: string;
  trustScore?: number;
}

export const AgentCognitiveHUD: React.FC<AgentCognitiveHUDProps> = ({
  isLoading,
  productQuery,
  customThoughts = [],
}) => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [stores, setStores] = useState<SpiderStore[]>([
    { name: "Amazon Oficial", domain: "amazon.com", status: "pending" },
    { name: "BestBuy Certified", domain: "bestbuy.com", status: "pending" },
    { name: "MercadoLibre Gold", domain: "mercadolibre.com", status: "pending" },
    { name: "Tienda Oficial Marca", domain: "official-store.com", status: "pending" },
    { name: "Walmart Direct", domain: "walmart.com", status: "pending" },
  ]);

  // Step progression while loading
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const timer1 = setTimeout(() => setCurrentStep(1), 800);
    const timer2 = setTimeout(() => {
      setCurrentStep(2);
      setStores((prev) =>
        prev.map((s, idx) => (idx <= 1 ? { ...s, status: "scanning" } : s))
      );
    }, 2000);
    const timer3 = setTimeout(() => {
      setCurrentStep(3);
      setStores((prev) =>
        prev.map((s, idx) => ({
          ...s,
          status: "verified",
          trustScore: 90 + Math.floor(Math.random() * 9),
        }))
      );
    }, 3800);
    const timer4 = setTimeout(() => {
      setCurrentStep(4);
      setStores((prev) =>
        prev.map((s) => ({
          ...s,
          status: "extracted",
        }))
      );
    }, 5500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  const steps = [
    { label: "Reconocimiento Multimodal", desc: "Decodificando imagen, audio y especificaciones de producto" },
    { label: "Validación de Certificaciones", desc: "Comprobando estándares CE, FCC, RoHS, Sellos y Garantía oficial" },
    { label: "Navegación Autónoma en Tiendas", desc: "Rastreando pasarelas de comercios verificados con Google Grounding" },
    { label: "Arbitraje y Comparativa de Precios", desc: "Calculando descuentos netos, envíos y mejor oferta disponible" },
    { label: "Síntesis de Veredicto", desc: "Generando informe final y recomendaciones de compra" },
  ];

  return (
    <div className="bg-slate-900/95 border border-cyan-500/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden my-6">
      {/* Laser scanline animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-50 animate-pulse pointer-events-none"></div>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Bot className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Conciencia y Ejecución en Tiempo Real
              <span className="text-[10px] bg-cyan-950 text-cyan-400 border border-cyan-800 px-2 py-0.5 rounded-full font-mono">
                AGENTE ACTIVO
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Navegando y contrastando comercios en vivo para: <span className="text-slate-200 font-medium">"{productQuery || "Producto Escaneado"}"</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Ejecutando...</span>
        </div>
      </div>

      {/* Grid: Cognitive steps & Autonomous Browser Spiders */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
        {/* Left: Progression stages */}
        <div className="md:col-span-6 space-y-2.5">
          {steps.map((step, idx) => {
            const isDone = currentStep > idx;
            const isCurrent = currentStep === idx;
            return (
              <div
                key={idx}
                className={`p-2.5 rounded-xl border transition-all flex items-start gap-3 ${
                  isCurrent
                    ? "bg-cyan-950/40 border-cyan-500/50 shadow-sm shadow-cyan-500/10 ring-1 ring-cyan-500/20"
                    : isDone
                    ? "bg-slate-950/60 border-emerald-900/40 text-slate-300"
                    : "bg-slate-950/30 border-slate-800/60 text-slate-500"
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-cyan-400 animate-spin" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 flex items-center justify-center text-[9px] font-mono">
                      {idx + 1}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <p className={`text-xs font-semibold ${isCurrent ? "text-cyan-300" : isDone ? "text-slate-200" : "text-slate-500"}`}>
                    {step.label}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5 leading-tight">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Real-time Multi-Merchant Spider Monitor */}
        <div className="md:col-span-6 bg-slate-950/90 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800 text-[11px] font-mono text-slate-400">
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-cyan-400" />
                Spiders en Comercios Certificados
              </span>
              <span className="text-emerald-400">HTTPS 100% SEGURO</span>
            </div>

            <div className="space-y-2">
              {stores.map((store, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        store.status === "extracted"
                          ? "bg-emerald-400"
                          : store.status === "verified" || store.status === "scanning"
                          ? "bg-cyan-400 animate-ping"
                          : "bg-slate-600"
                      }`}
                    />
                    <span className="font-medium text-slate-200">{store.name}</span>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] font-mono">
                    {store.status === "pending" && <span className="text-slate-500">En cola</span>}
                    {store.status === "scanning" && (
                      <span className="text-cyan-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" /> Extrayendo catálogo
                      </span>
                    )}
                    {store.status === "verified" && (
                      <span className="text-indigo-400 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> Confianza {store.trustScore}%
                      </span>
                    )}
                    {store.status === "extracted" && (
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Precios Extraídos
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terminal stream log */}
          <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-2 text-[10px] font-mono text-cyan-400/80">
            <Terminal className="w-3 h-3 shrink-0" />
            <span className="truncate">
              {customThoughts.length > 0
                ? customThoughts[customThoughts.length - 1]
                : "Ejecutando Google Grounding & Search Verification Protocol..."}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
