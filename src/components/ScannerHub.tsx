import React, { useState, useRef, useEffect } from "react";
import { 
  Camera, 
  Upload, 
  Mic, 
  Search, 
  Sparkles, 
  Scan, 
  RefreshCw, 
  X, 
  CheckCircle2, 
  Flame,
  Layers,
  Terminal,
  ArrowRight,
  ShieldCheck,
  Zap,
  Grid,
  List,
  LayoutGrid,
  ShoppingBag,
  TrendingDown,
  Database,
  BarChart3,
  Clock,
  Store,
  Bot
} from "lucide-react";
import { SAMPLE_PRESETS, SamplePreset } from "../utils/sampleData";
import { ProductScanResult } from "../types";
import { convertAndFormatPrice, getRegionConfig } from "../utils/regionUtils";
import { deduplicateProductList } from "../utils/productDeduplicator";
import { TrendingMarketRanking } from "./TrendingMarketRanking";

interface ScannerHubProps {
  onStartAnalysis: (params: {
    imageBase64?: string;
    textQuery?: string;
    audioTranscription?: string;
  }) => void;
  isLoading: boolean;
  savedProducts?: ProductScanResult[];
  onSelectProduct?: (product: ProductScanResult) => void;
  onViewLog?: (product: ProductScanResult) => void;
  onQuickRevalidate?: (product: ProductScanResult) => void;
  onOpenDaemonModal?: (product: ProductScanResult) => void;
  selectedRegion?: string;
}

export const ScannerHub: React.FC<ScannerHubProps> = ({
  onStartAnalysis,
  isLoading,
  savedProducts = [],
  onSelectProduct,
  onViewLog,
  onQuickRevalidate,
  onOpenDaemonModal,
  selectedRegion = "GLOBAL",
}) => {
  const [activeTab, setActiveTab] = useState<"camera" | "upload" | "voice" | "text">("camera");
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraFacing, setCameraFacing] = useState<"environment" | "user">("environment");
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  
  // View mode for photographic memory section: "grid" | "list" | "icons" | "ranking"
  const [memoryViewMode, setMemoryViewMode] = useState<"grid" | "list" | "icons" | "ranking">("grid");
  const [memoryCategoryFilter, setMemoryCategoryFilter] = useState<string>("ALL");
  const [memorySearchQuery, setMemorySearchQuery] = useState<string>("");

  // Deduplicate products in real-time
  const sanitizedSavedProducts = deduplicateProductList(savedProducts);

  // Helper for relative timestamps
  const formatTimeAgo = (timestamp?: number) => {
    if (!timestamp) return "Recién registrado";
    const diffMs = Date.now() - timestamp;
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return "Hace un momento";
    if (diffMin < 60) return `Hace ${diffMin}m`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;
    const diffDays = Math.floor(diffHours / 24);
    return `Hace ${diffDays}d`;
  };

  // Voice Recording state
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [voiceText, setVoiceText] = useState<string>("");
  const recognitionRef = useRef<any>(null);

  // Text input state
  const [textInput, setTextInput] = useState<string>("");
  const [isDragOver, setIsDragOver] = useState<boolean>(false);

  // Video element references
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const regionConfig = getRegionConfig(selectedRegion);

  // Start / stop camera stream
  const startCamera = async () => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: cameraFacing, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err) {
      console.warn("Camera access denied or unavailable:", err);
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (activeTab === "camera" && !capturedImage) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, cameraFacing, capturedImage]);

  // Capture frame from camera
  const captureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64 = canvas.toDataURL("image/jpeg", 0.85);
    setCapturedImage(base64);
    stopCamera();
  };

  // Switch camera front/back
  const toggleCameraFacing = () => {
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
  };

  // Handle Image File Upload
  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setCapturedImage(base64);
      setActiveTab("camera"); // show preview
    };
    reader.readAsDataURL(file);
  };

  // Setup Web Speech API for voice recording
  const toggleVoiceRecording = () => {
    if (isRecordingVoice) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecordingVoice(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Tu navegador no soporta SpeechRecognition nativo. Puedes escribir tu consulta en texto.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = "es-ES";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecordingVoice(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join("");
        setVoiceText(transcript);
        setTextInput(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        setIsRecordingVoice(false);
      };

      recognition.onend = () => {
        setIsRecordingVoice(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error("Failed to start voice recognition:", err);
      setIsRecordingVoice(false);
    }
  };

  // Launch analysis
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!capturedImage && !textInput.trim() && !voiceText.trim()) return;

    onStartAnalysis({
      imageBase64: capturedImage || undefined,
      textQuery: textInput.trim() || undefined,
      audioTranscription: voiceText.trim() || undefined,
    });
  };

  const handleSelectPreset = (preset: SamplePreset) => {
    setTextInput(preset.query);
    onStartAnalysis({
      textQuery: preset.query,
    });
  };

  // Filter products for photographic memory using deduplicated list
  const filteredMemoryProducts = sanitizedSavedProducts.filter((p) => {
    const matchesSearch = 
      p.title.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(memorySearchQuery.toLowerCase()) ||
      (p.aliases && p.aliases.some(a => a.toLowerCase().includes(memorySearchQuery.toLowerCase())));

    if (!matchesSearch) return false;
    if (memoryCategoryFilter === "ALL") return true;
    if (memoryCategoryFilter === "TOP_DEALS") return (p.bestDeal?.savingsPercentage || 0) >= 20;
    if (memoryCategoryFilter === "HARDWARE") return p.category.toLowerCase().includes("bater") || p.category.toLowerCase().includes("component") || p.category.toLowerCase().includes("laptop");
    if (memoryCategoryFilter === "AUDIO_MOBILE") return p.category.toLowerCase().includes("audio") || p.category.toLowerCase().includes("smart") || p.category.toLowerCase().includes("phone");
    return true;
  });

  return (
    <div className="space-y-6">
      
      {/* 1. PRIMARY SECTION: PHOTOGRAPHIC MEMORY & VALIDATED PRODUCTS HUB */}
      <section className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-1/4 w-96 h-32 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Section Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
              <Database className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-white">
                  Memoria Fotográfica & Validador de Mercado
                </h2>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {sanitizedSavedProducts.length} EN BÓVEDA
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  Anti-Duplicados Activo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Acceso consolidado a productos cotejados, telemetría de precios y registros de navegación <code className="text-cyan-300 font-mono">.log</code>.
              </p>
            </div>
          </div>

          {/* View Mode Switcher & Search Bar */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <div className="relative flex-1 sm:w-56">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
              <input
                type="text"
                value={memorySearchQuery}
                onChange={(e) => setMemorySearchQuery(e.target.value)}
                placeholder="Filtrar por nombre o marca..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
              />
              {memorySearchQuery && (
                <button
                  onClick={() => setMemorySearchQuery("")}
                  className="absolute right-2 top-2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0">
              <button
                onClick={() => setMemoryViewMode("grid")}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  memoryViewMode === "grid"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Vista de Tarjetas con Veredicto"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMemoryViewMode("list")}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  memoryViewMode === "list"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Vista de Listado Inteligente"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMemoryViewMode("icons")}
                className={`p-1.5 rounded-md text-xs transition-all ${
                  memoryViewMode === "icons"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
                title="Vista de Iconos / Matriz Rápida"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setMemoryViewMode("ranking")}
                className={`px-2 py-1 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${
                  memoryViewMode === "ranking"
                    ? "bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20"
                    : "text-amber-400 hover:text-amber-300 bg-amber-950/40"
                }`}
                title="Ranking General & Más Buscados"
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Ranking</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Category Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-4 scrollbar-none text-xs">
          <button
            onClick={() => {
              setMemoryCategoryFilter("ALL");
              if (memoryViewMode === "ranking") setMemoryViewMode("grid");
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              memoryCategoryFilter === "ALL" && memoryViewMode !== "ranking"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            Todos ({sanitizedSavedProducts.length})
          </button>
          <button
            onClick={() => setMemoryViewMode("ranking")}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
              memoryViewMode === "ranking"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold"
                : "bg-slate-950/60 text-amber-400/80 border border-slate-800 hover:text-amber-300"
            }`}
          >
            <Flame className="w-3 h-3 text-amber-400" />
            <span>Ranking de Más Buscados & Precios</span>
          </button>
          <button
            onClick={() => {
              setMemoryCategoryFilter("TOP_DEALS");
              if (memoryViewMode === "ranking") setMemoryViewMode("grid");
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all flex items-center gap-1 ${
              memoryCategoryFilter === "TOP_DEALS" && memoryViewMode !== "ranking"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            <TrendingDown className="w-3 h-3 text-emerald-400" />
            <span>Mayor Ahorro</span>
          </button>
          <button
            onClick={() => {
              setMemoryCategoryFilter("HARDWARE");
              if (memoryViewMode === "ranking") setMemoryViewMode("grid");
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              memoryCategoryFilter === "HARDWARE" && memoryViewMode !== "ranking"
                ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/30"
                : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            Componentes & Baterías
          </button>
          <button
            onClick={() => {
              setMemoryCategoryFilter("AUDIO_MOBILE");
              if (memoryViewMode === "ranking") setMemoryViewMode("grid");
            }}
            className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition-all ${
              memoryCategoryFilter === "AUDIO_MOBILE" && memoryViewMode !== "ranking"
                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/30"
                : "bg-slate-950/60 text-slate-400 border border-slate-800 hover:text-slate-200"
            }`}
          >
            Audio & Smartphones
          </button>
        </div>

        {/* PRODUCTS RENDERING BY SELECTED VIEW MODE */}
        {memoryViewMode === "ranking" ? (
          <TrendingMarketRanking
            products={sanitizedSavedProducts}
            selectedRegion={selectedRegion}
            onSelectProduct={(p) => onSelectProduct && onSelectProduct(p)}
            onViewLog={(p) => onViewLog && onViewLog(p)}
            onQuickRevalidate={onQuickRevalidate}
            onOpenDaemonModal={onOpenDaemonModal}
          />
        ) : filteredMemoryProducts.length === 0 ? (
          <div className="py-8 text-center bg-slate-950/60 rounded-xl border border-slate-800">
            <p className="text-xs text-slate-400">No se encontraron productos coincidentes en memoria.</p>
          </div>
        ) : (
          <>
            {/* 1. GRID CARDS VIEW */}
            {memoryViewMode === "grid" && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5">
                {filteredMemoryProducts.map((p) => {
                  const bestDeal = p.bestDeal;
                  const formattedBest = bestDeal
                    ? convertAndFormatPrice(bestDeal.price, bestDeal.currency, selectedRegion)
                    : null;
                  const searchCount = p.searchCount || 1;
                  const totalPurchases = p.totalMarketPurchasesText || (p.totalMarketPurchases ? `+${(p.totalMarketPurchases >= 1000 ? (p.totalMarketPurchases / 1000).toFixed(1) + 'K' : p.totalMarketPurchases)} comprados` : "+1.2K comprados");

                  return (
                    <div
                      key={p.id}
                      id={`card-memory-${p.id}`}
                      className="bg-slate-950/90 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between gap-3 shadow-lg hover:shadow-cyan-500/5 transition-all group relative"
                    >
                      {/* Top Badges */}
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-950/80 border border-emerald-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          {p.authenticityScore}% AUTÉNTICO
                        </span>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-md flex items-center gap-1">
                            <Terminal className="w-3 h-3" />
                            {p.trajectoryLog?.steps.length || 8} Nodos .log
                          </span>
                        </div>
                      </div>

                      {/* Image & Main Info */}
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center p-1">
                          {p.productImageUrl || p.imageScannedUrl ? (
                            <img
                              src={p.productImageUrl || p.imageScannedUrl}
                              alt={p.title}
                              className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <ShoppingBag className="w-6 h-6 text-slate-600" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3
                            onClick={() => onSelectProduct && onSelectProduct(p)}
                            className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer line-clamp-2 leading-snug"
                          >
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                            <span className="text-[10px] text-slate-400 font-mono">
                              {p.brand} • {p.model}
                            </span>
                            {p.aliases && p.aliases.length > 1 && (
                              <span className="text-[9px] bg-slate-900 text-cyan-300 border border-cyan-800/50 px-1.5 py-0.2 rounded font-mono" title={`Búsquedas unificadas: ${p.aliases.join(', ')}`}>
                                1 unificado ({p.aliases.length})
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Intelligent Telemetry Strip (Searches, Retail Purchases, Last Update Date) */}
                      <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-900/60 rounded-lg border border-slate-850 text-center font-mono text-[10px]">
                        <div className="p-1 bg-slate-950/70 rounded border border-slate-800">
                          <span className="text-slate-500 text-[8px] block uppercase">Búsquedas</span>
                          <span className="font-bold text-amber-400 flex items-center justify-center gap-0.5">
                            <Flame className="w-2.5 h-2.5" />
                            {searchCount}
                          </span>
                        </div>
                        <div className="p-1 bg-slate-950/70 rounded border border-slate-800">
                          <span className="text-slate-500 text-[8px] block uppercase">Comprados</span>
                          <span className="font-bold text-emerald-400 truncate block" title={totalPurchases}>
                            {totalPurchases.replace(" comprados en comercios oficiales", "").replace(" comprados", "")}
                          </span>
                        </div>
                        <div className="p-1 bg-slate-950/70 rounded border border-slate-800">
                          <span className="text-slate-500 text-[8px] block uppercase">Actualizado</span>
                          <span className="font-bold text-cyan-300 block">
                            {formatTimeAgo(p.lastUpdated || p.timestamp)}
                          </span>
                        </div>
                      </div>

                      {/* Best Price Strip */}
                      {bestDeal && formattedBest && (
                        <div className="p-2.5 bg-slate-900/90 rounded-lg border border-slate-800/80 flex items-center justify-between gap-2 font-mono">
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase block">Mejor Oferta Validada</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {formattedBest.symbol}{formattedBest.formattedAmount} {formattedBest.currency}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-semibold text-slate-200 block truncate max-w-[120px]">
                              {bestDeal.storeName}
                            </span>
                            {bestDeal.savingsPercentage > 0 && (
                              <span className="text-[9px] text-emerald-400 font-bold">
                                -{bestDeal.savingsPercentage}% Ahorro
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="grid grid-cols-4 gap-1.5 pt-1 border-t border-slate-800/80">
                        <button
                          id={`btn-open-verdict-${p.id}`}
                          type="button"
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          className="col-span-1 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] rounded-lg transition-all text-center"
                        >
                          Veredicto
                        </button>

                        <button
                          id={`btn-view-log-${p.id}`}
                          type="button"
                          onClick={() => onViewLog && onViewLog(p)}
                          className="py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 font-semibold text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-all"
                          title="Ver enramado y archivo .log"
                        >
                          <Terminal className="w-3 h-3" />
                          <span>.log</span>
                        </button>

                        <button
                          id={`btn-reval-${p.id}`}
                          type="button"
                          onClick={() => onQuickRevalidate ? onQuickRevalidate(p) : onStartAnalysis({ textQuery: p.title })}
                          className="py-1.5 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-[11px] rounded-lg border border-slate-700 flex items-center justify-center gap-1 transition-all"
                          title="Revalidar precio en vivo de forma acelerada"
                        >
                          <Zap className="w-3 h-3" />
                          <span>Revalidar</span>
                        </button>

                        <button
                          id={`btn-daemon-${p.id}`}
                          type="button"
                          onClick={() => onOpenDaemonModal && onOpenDaemonModal(p)}
                          className="py-1.5 bg-gradient-to-r from-cyan-900/60 to-indigo-900/60 hover:from-cyan-800 hover:to-indigo-800 text-cyan-300 font-semibold text-[11px] rounded-lg border border-cyan-700/50 flex items-center justify-center gap-1 transition-all"
                          title="Validar entrega / compra con Demonio"
                        >
                          <Bot className="w-3 h-3" />
                          <span>Demonio</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 2. COMPACT LIST VIEW */}
            {memoryViewMode === "list" && (
              <div className="space-y-2">
                {filteredMemoryProducts.map((p) => {
                  const bestDeal = p.bestDeal;
                  const formattedBest = bestDeal
                    ? convertAndFormatPrice(bestDeal.price, bestDeal.currency, selectedRegion)
                    : null;

                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/80 hover:bg-slate-950 border border-slate-800 hover:border-cyan-500/40 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 shrink-0 overflow-hidden flex items-center justify-center">
                          {p.productImageUrl || p.imageScannedUrl ? (
                            <img src={p.productImageUrl || p.imageScannedUrl} alt={p.title} className="w-full h-full object-cover" />
                          ) : (
                            <ShoppingBag className="w-4 h-4 text-slate-600" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h3
                            onClick={() => onSelectProduct && onSelectProduct(p)}
                            className="text-xs font-bold text-white hover:text-cyan-400 cursor-pointer truncate max-w-sm sm:max-w-md"
                          >
                            {p.title}
                          </h3>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span className="text-emerald-400 font-bold">{p.authenticityScore}% Auténtico</span>
                            <span>•</span>
                            <span>{p.bestDeal?.storeName}</span>
                            <span>•</span>
                            <span className="text-cyan-400 font-bold">
                              {formattedBest?.symbol}{formattedBest?.formattedAmount} {formattedBest?.currency}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <button
                          onClick={() => onViewLog && onViewLog(p)}
                          className="px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 text-xs font-mono font-semibold rounded-lg flex items-center gap-1"
                        >
                          <Terminal className="w-3 h-3" />
                          <span>.log</span>
                        </button>
                        <button
                          onClick={() => onSelectProduct && onSelectProduct(p)}
                          className="px-3 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg"
                        >
                          Abrir
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. ICON MATRIX VIEW */}
            {memoryViewMode === "icons" && (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
                {filteredMemoryProducts.map((p) => {
                  const bestDeal = p.bestDeal;
                  const formattedBest = bestDeal
                    ? convertAndFormatPrice(bestDeal.price, bestDeal.currency, selectedRegion)
                    : null;

                  return (
                    <button
                      key={p.id}
                      onClick={() => onSelectProduct && onSelectProduct(p)}
                      className="p-2.5 bg-slate-950 border border-slate-800 hover:border-cyan-400 rounded-xl flex flex-col items-center text-center group transition-all"
                    >
                      <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden flex items-center justify-center mb-1.5">
                        {p.productImageUrl || p.imageScannedUrl ? (
                          <img src={p.productImageUrl || p.imageScannedUrl} alt={p.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        ) : (
                          <ShoppingBag className="w-5 h-5 text-slate-600" />
                        )}
                      </div>
                      <p className="text-[11px] font-bold text-slate-200 group-hover:text-cyan-400 truncate w-full">
                        {p.title}
                      </p>
                      <span className="text-[10px] font-mono text-emerald-400 font-bold mt-0.5">
                        {formattedBest?.symbol}{formattedBest?.formattedAmount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </>
        )}
      </section>

      {/* 2. MULTIMODAL NEW CAPTURE / SEARCH AGENT LAUNCHER */}
      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        {/* Mode selection tabs */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-1.5 p-1 bg-slate-950/70 border border-slate-800 rounded-xl">
            <button
              id="tab-camera"
              type="button"
              onClick={() => {
                setActiveTab("camera");
                if (!capturedImage) startCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "camera"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Escáner Visual</span>
            </button>

            <button
              id="tab-upload"
              type="button"
              onClick={() => {
                setActiveTab("upload");
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "upload"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Subir Foto</span>
            </button>

            <button
              id="tab-voice"
              type="button"
              onClick={() => {
                setActiveTab("voice");
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "voice"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Voz Activa</span>
            </button>

            <button
              id="tab-text"
              type="button"
              onClick={() => {
                setActiveTab("text");
                stopCamera();
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "text"
                  ? "bg-cyan-500 text-slate-950 font-semibold shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Texto / Modelo</span>
            </button>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="font-mono text-[11px]">AURA ENGINE ONLINE</span>
          </div>
        </div>

        {/* Input Zones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          <div className="lg:col-span-7">
            {activeTab === "camera" && (
              <div className="aspect-video sm:aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 relative overflow-hidden flex items-center justify-center group">
                {capturedImage ? (
                  <div className="relative w-full h-full">
                    <img
                      src={capturedImage}
                      alt="Captured Product"
                      className="w-full h-full object-contain bg-slate-950"
                    />
                    <button
                      id="btn-clear-snapshot"
                      type="button"
                      onClick={() => {
                        setCapturedImage(null);
                        startCamera();
                      }}
                      className="absolute top-3 right-3 p-2 bg-slate-900/90 text-slate-300 hover:text-white rounded-full border border-slate-700 backdrop-blur-md transition-all shadow-lg"
                      title="Volver a Capturar"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="absolute bottom-3 left-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-xs font-mono text-cyan-300 backdrop-blur-md">
                      Imagen lista para validación
                    </div>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative w-full h-full bg-black">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-8 sm:inset-14 border border-cyan-400/40 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                      <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                        <span>AURA VISION</span>
                        <span>AUTO-FOCUS</span>
                      </div>
                      <div className="text-center text-[10px] font-mono text-cyan-300/80 bg-slate-950/60 py-1 px-2 rounded backdrop-blur-sm self-center">
                        Enfoca el producto, empaque o código
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-mono text-cyan-400">
                        <span>P/N • SKU • QR</span>
                        <span>60 FPS</span>
                      </div>
                    </div>

                    <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-4 z-10">
                      <button
                        id="btn-toggle-camera-facing"
                        type="button"
                        onClick={toggleCameraFacing}
                        className="p-2.5 rounded-full bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md hover:bg-slate-800 transition-all"
                        title="Voltear Cámara"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>

                      <button
                        id="btn-capture-snapshot"
                        type="button"
                        onClick={captureSnapshot}
                        className="px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-500/30 transition-transform active:scale-95"
                      >
                        <Camera className="w-4 h-4 text-slate-950" />
                        Capturar y Analizar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 flex flex-col items-center">
                    <Camera className="w-10 h-10 text-slate-600 mb-3" />
                    <p className="text-sm text-slate-300 font-medium">Cámara no activada</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-xs">
                      Permite el acceso a la cámara o sube una fotografía del producto.
                    </p>
                    <button
                      id="btn-start-camera"
                      type="button"
                      onClick={startCamera}
                      className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 text-xs font-semibold rounded-lg border border-slate-700 transition-all"
                    >
                      Activar Cámara
                    </button>
                  </div>
                )}
                <canvas ref={canvasRef} className="hidden" />
              </div>
            )}

            {activeTab === "upload" && (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragOver(true);
                }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragOver(false);
                  if (e.dataTransfer.files?.[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`aspect-video sm:aspect-[4/3] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${
                  isDragOver
                    ? "border-cyan-400 bg-cyan-950/20"
                    : "border-slate-800 hover:border-slate-700 bg-slate-950/50"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />
                <div className="w-12 h-12 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mb-3 shadow-inner">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  Arrastra una foto del producto o haz clic para subir
                </p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs">
                  Soporta fotos de empaques, etiquetas con código de barras o capturas de pantalla.
                </p>
              </div>
            )}

            {activeTab === "voice" && (
              <div className="aspect-video sm:aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center">
                <button
                  id="btn-toggle-voice-record"
                  type="button"
                  onClick={toggleVoiceRecording}
                  className={`w-20 h-20 rounded-full flex items-center justify-center shadow-xl transition-all ${
                    isRecordingVoice
                      ? "bg-rose-500 text-white animate-pulse ring-8 ring-rose-500/20"
                      : "bg-gradient-to-tr from-cyan-500 to-indigo-600 text-white hover:scale-105"
                  }`}
                >
                  <Mic className="w-8 h-8" />
                </button>

                <h3 className="text-sm font-semibold text-slate-200 mt-4">
                  {isRecordingVoice ? "Escuchando en vivo..." : "Toca el micrófono para hablar"}
                </h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm">
                  Ejemplo: "AURA, búscame el mejor precio del Sony WH-1000XM5 en tiendas oficiales"
                </p>

                {voiceText && (
                  <div className="mt-4 p-3 bg-slate-900 border border-slate-800 rounded-lg text-xs text-cyan-300 font-mono max-w-md w-full text-left">
                    <span className="text-slate-500">Comando: </span>"{voiceText}"
                  </div>
                )}
              </div>
            )}

            {activeTab === "text" && (
              <div className="aspect-video sm:aspect-[4/3] rounded-xl bg-slate-950 border border-slate-800 flex flex-col justify-center p-6">
                <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-slate-400">
                  <Search className="w-4 h-4 text-cyan-400" />
                  <span>Búsqueda directa por modelo o SKU</span>
                </div>
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Ingresa nombre del producto, SKU, modelo o enlace (ej. Apple MacBook Air M3 16GB 512GB)..."
                  className="w-full h-28 bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60 transition-colors resize-none"
                />
              </div>
            )}
          </div>

          {/* Analysis Options & Action Launch Panel */}
          <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Especificaciones / Notas Adicionales
                </label>
                <div className="relative">
                  <input
                    id="input-product-query"
                    type="text"
                    value={textInput}
                    onChange={(e) => setTextInput(e.target.value)}
                    placeholder="Ej: Versión 256GB, color titanio, garantía oficial..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/60"
                  />
                  {textInput && (
                    <button
                      type="button"
                      onClick={() => setTextInput("")}
                      className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Quick Demo Sample Presets */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Probar con Productos Populares
                  </span>
                  <span className="text-[10px] text-slate-500">1-Clic para escanear</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {SAMPLE_PRESETS.map((preset) => (
                    <button
                      key={preset.id}
                      id={`btn-preset-${preset.id}`}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      disabled={isLoading}
                      className="flex items-center gap-2 p-2 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl text-left transition-all group disabled:opacity-50"
                    >
                      <img
                        src={preset.imageUrl}
                        alt={preset.name}
                        className="w-9 h-9 rounded-lg object-cover bg-slate-900 border border-slate-800 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="text-[11px] font-medium text-slate-200 truncate group-hover:text-cyan-400">
                          {preset.name}
                        </p>
                        <span className="text-[9px] text-slate-500 truncate block">
                          {preset.category}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Big Launch Button */}
            <div className="pt-2">
              <button
                id="btn-execute-agent-search"
                type="button"
                onClick={() => handleSubmit()}
                disabled={isLoading || (!capturedImage && !textInput.trim() && !voiceText.trim())}
                className="w-full py-3.5 px-4 bg-gradient-to-r from-cyan-500 via-indigo-600 to-indigo-700 hover:from-cyan-400 hover:via-indigo-500 hover:to-indigo-600 text-slate-950 hover:text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed group active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>AURA Navegando y Validando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-slate-950 group-hover:text-white transition-colors" />
                    <span>Activar Agente Autónomo</span>
                  </>
                )}
              </button>
              <p className="text-[11px] text-center text-slate-500 mt-2">
                Búsqueda en tiempo real • Tiendas de riesgo bloqueadas • Creación de enramado .log
              </p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
