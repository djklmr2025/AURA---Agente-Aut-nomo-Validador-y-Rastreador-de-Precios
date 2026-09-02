/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from "react";
import { Header } from "./components/Header";
import { ScannerHub } from "./components/ScannerHub";
import { AgentCognitiveHUD } from "./components/AgentCognitiveHUD";
import { ProductVerdictView } from "./components/ProductVerdictView";
import { StoreInspectorModal } from "./components/StoreInspectorModal";
import { MemoryVault } from "./components/MemoryVault";
import { AgentChatDrawer } from "./components/AgentChatDrawer";
import { AutonomousLogModal } from "./components/AutonomousLogModal";
import { GoogleLoginGateway } from "./components/GoogleLoginGateway";
import { DaemonHubModal } from "./components/DaemonHubModal";
import { TrendingMarketRanking } from "./components/TrendingMarketRanking";
import { ProductScanResult, StorePriceOffer, PriceAlert, VerifiedPurchase } from "./types";
import { playAgentAudio, stopAgentAudio } from "./utils/audioUtils";
import { 
  DEFAULT_PREVALIDATED_PRODUCTS, 
  generateAutonomousLog 
} from "./utils/trajectoryLogHelper";
import { 
  mergeProductData, 
  deduplicateProductList 
} from "./utils/productDeduplicator";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { 
  Bot, 
  ShieldCheck, 
  AlertCircle, 
  Terminal,
  Zap,
  X,
  Flame,
  BarChart3
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL || "";

function MainAppContent({
  onProductsLoadedRef,
  onAlertsLoadedRef,
  onPurchasesLoadedRef,
}: {
  onProductsLoadedRef: React.MutableRefObject<((products: ProductScanResult[]) => void) | null>;
  onAlertsLoadedRef: React.MutableRefObject<((alerts: PriceAlert[]) => void) | null>;
  onPurchasesLoadedRef: React.MutableRefObject<((purchases: VerifiedPurchase[]) => void) | null>;
}) {
  const { 
    currentUser, 
    userProfile, 
    verifiedPurchases,
    saveProductToCloud, 
    deleteProductFromCloud, 
    savePriceAlertToCloud, 
    deletePriceAlertFromCloud,
    updateUserPreferences 
  } = useAuth();

  const [activeProduct, setActiveProduct] = useState<ProductScanResult | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentQueryText, setCurrentQueryText] = useState<string>("");
  const [agentThoughts, setAgentThoughts] = useState<string[]>([]);

  // Preferences & Modals
  const [voiceEnabled, setVoiceEnabled] = useState<boolean>(true);
  const [selectedRegion, setSelectedRegion] = useState<string>("GLOBAL");
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = useState<boolean>(false);
  const [inspectedStoreOffer, setInspectedStoreOffer] = useState<StorePriceOffer | null>(null);
  
  // Demonio & Ticket Verification Modal
  const [isDaemonModalOpen, setIsDaemonModalOpen] = useState<boolean>(false);
  const [daemonTargetProduct, setDaemonTargetProduct] = useState<ProductScanResult | null>(null);

  // Market Trends & Ranking Modal
  const [isRankingOpen, setIsRankingOpen] = useState<boolean>(false);

  // Photographic Memory .log Modal
  const [selectedLogProduct, setSelectedLogProduct] = useState<ProductScanResult | null>(null);

  // Persistence (LocalStorage + Cloud Firestore)
  const [savedProducts, setSavedProducts] = useState<ProductScanResult[]>(() => {
    try {
      const stored = localStorage.getItem("aura_saved_products");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return deduplicateProductList(parsed);
        }
      }
      return deduplicateProductList(DEFAULT_PREVALIDATED_PRODUCTS);
    } catch {
      return deduplicateProductList(DEFAULT_PREVALIDATED_PRODUCTS);
    }
  });

  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>(() => {
    try {
      const stored = localStorage.getItem("aura_price_alerts");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Sync user profile preferences from Cloud if available
  useEffect(() => {
    if (userProfile?.selectedRegion) {
      setSelectedRegion(userProfile.selectedRegion);
    }
    if (typeof userProfile?.voiceEnabled === "boolean") {
      setVoiceEnabled(userProfile.voiceEnabled);
    }
  }, [userProfile]);

  // Handle incoming products from Cloud Firestore
  const handleCloudProducts = useCallback((cloudProducts: ProductScanResult[]) => {
    if (cloudProducts && cloudProducts.length > 0) {
      setSavedProducts((prev) => {
        const existingIds = new Set(cloudProducts.map((p) => p.id));
        const merged = [
          ...cloudProducts,
          ...prev.filter((p) => !existingIds.has(p.id)),
        ];
        return merged.slice(0, 50);
      });
    }
  }, []);

  // Handle incoming alerts from Cloud Firestore
  const handleCloudAlerts = useCallback((cloudAlerts: PriceAlert[]) => {
    if (cloudAlerts && cloudAlerts.length > 0) {
      setPriceAlerts(cloudAlerts);
    }
  }, []);

  useEffect(() => {
    onProductsLoadedRef.current = handleCloudProducts;
    onAlertsLoadedRef.current = handleCloudAlerts;
  }, [handleCloudProducts, handleCloudAlerts, onProductsLoadedRef, onAlertsLoadedRef]);

  useEffect(() => {
    localStorage.setItem("aura_saved_products", JSON.stringify(savedProducts));
  }, [savedProducts]);

  useEffect(() => {
    localStorage.setItem("aura_price_alerts", JSON.stringify(priceAlerts));
  }, [priceAlerts]);

  // Launch multimodal analysis and real-time market search
  const handleStartAnalysis = async (params: {
    imageBase64?: string;
    textQuery?: string;
    audioTranscription?: string;
  }) => {
    setIsLoading(true);
    setErrorMessage(null);
    setAgentThoughts([
      "Activando sensores multimodales y procesando entrada...",
      "Identificando producto, modelo y certificaciones industriales...",
      "Filtrando tiendas fraudulentas (AliExpress/Temu bloqueados)...",
      "Lanzando spiders autónomos en comercios certificados (TikTok Shop, Amazon, Walmart)...",
      "Generando enramado de decisión y trazabilidad .log para memoria fotográfica...",
    ]);

    const queryDisplay = params.textQuery || params.audioTranscription || "Producto Escaneado";
    setCurrentQueryText(queryDisplay);

    try {
      const response = await fetch(`${API_URL}/api/agent/validate-and-search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...params,
          country: selectedRegion,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Error del servidor (${response.status})`);
      }

      const result: ProductScanResult = await response.json();
      
      // Attach a trajectory log if none was provided by backend
      if (!result.trajectoryLog) {
        result.trajectoryLog = generateAutonomousLog(
          result.title,
          selectedRegion,
          result.bestDeal?.storeName || "TikTok Shop",
          result.bestDeal?.price || 100,
          result.bestDeal?.currency || "USD"
        );
      }

      setActiveProduct(result);

      // Save to memory with intelligent deduplication (updates date, searchCount, price history instead of duplicating)
      setSavedProducts((prev) => {
        const merged = mergeProductData(prev, result);
        return merged.slice(0, 40);
      });

      if (currentUser) {
        saveProductToCloud(result).catch((e) => console.warn("Firestore save failed:", e));
      }

      // Voice read-out if enabled
      if (voiceEnabled && result.summary) {
        const voiceScript = `He validado el producto ${result.title}. Veredicto: ${result.authenticityVerdict}. La mejor oferta encontrada en tiempo real está en ${result.bestDeal?.storeName} por $${result.bestDeal?.price.toFixed(2)} ${result.bestDeal?.currency}. El registro de navegación ha sido guardado en memoria fotográfica.`;
        
        fetch(`${API_URL}/api/agent/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: voiceScript }),
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.audioBase64) {
              playAgentAudio(data.audioBase64, voiceScript);
            } else {
              playAgentAudio(undefined, voiceScript);
            }
          })
          .catch(() => {
            playAgentAudio(undefined, voiceScript);
          });
      }
    } catch (err: any) {
      console.error("Analysis execution error:", err);
      setErrorMessage(err.message || "No se pudo completar la validación. Por favor verifica los datos o intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  // Revalidate using photographic memory trail
  const handleQuickRevalidate = (product: ProductScanResult) => {
    handleStartAnalysis({ textQuery: `${product.brand} ${product.model || product.title}` });
  };

  // Save product to Memory Vault manually
  const handleSaveProduct = (product: ProductScanResult) => {
    const exists = savedProducts.some((p) => p.id === product.id);
    if (exists) {
      setSavedProducts((prev) => prev.filter((p) => p.id !== product.id));
      if (currentUser) {
        deleteProductFromCloud(product.id).catch((e) => console.warn("Firestore delete failed:", e));
      }
    } else {
      setSavedProducts((prev) => [product, ...prev]);
      if (currentUser) {
        saveProductToCloud(product).catch((e) => console.warn("Firestore save failed:", e));
      }
    }
  };

  // Set a price alert
  const handleSetPriceAlert = (product: ProductScanResult) => {
    const target = prompt(
      `Ingresa el precio objetivo para "${product.title}" (${product.bestDeal?.currency || "USD"}):`,
      product.bestDeal ? String((product.bestDeal.price * 0.9).toFixed(2)) : "50"
    );
    if (!target) return;

    const num = parseFloat(target);
    if (isNaN(num) || num <= 0) {
      alert("Por favor ingresa un precio válido");
      return;
    }

    const newAlert: PriceAlert = {
      id: "alert-" + Date.now(),
      productId: product.id,
      productTitle: product.title,
      targetPrice: num,
      currentBestPrice: product.bestDeal?.price || num,
      currency: product.bestDeal?.currency || "USD",
      createdAt: Date.now(),
      triggered: false,
    };

    setPriceAlerts((prev) => [newAlert, ...prev]);
    if (currentUser) {
      savePriceAlertToCloud(newAlert).catch((e) => console.warn("Firestore alert save failed:", e));
    }
    alert(`Alerta activada para ${product.title} a $${num} ${newAlert.currency}. El agente te notificará.`);
  };

  const handlePlayVoice = (text: string) => {
    fetch(`${API_URL}/api/agent/tts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.audioBase64) {
          playAgentAudio(data.audioBase64, text);
        } else {
          playAgentAudio(undefined, text);
        }
      })
      .catch(() => {
        playAgentAudio(undefined, text);
      });
  };

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    if (currentUser) {
      updateUserPreferences({ selectedRegion: newRegion }).catch((e) => console.warn("Firestore pref update:", e));
    }
  };

  const handleVoiceToggle = () => {
    const nextVoice = !voiceEnabled;
    if (voiceEnabled) stopAgentAudio();
    setVoiceEnabled(nextVoice);
    if (currentUser) {
      updateUserPreferences({ voiceEnabled: nextVoice }).catch((e) => console.warn("Firestore pref update:", e));
    }
  };

  const isCurrentProductSaved = activeProduct
    ? savedProducts.some((p) => p.id === activeProduct.id)
    : false;

  return (
    <div className="min-h-full flex flex-col bg-slate-950 text-slate-100 selection:bg-cyan-500 selection:text-slate-950 font-sans">
      {/* 1. TOP BAR */}
      <Header
        isLiveActive={!isLoading}
        voiceEnabled={voiceEnabled}
        onToggleVoice={handleVoiceToggle}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
        onOpenDaemon={() => {
          setDaemonTargetProduct(activeProduct);
          setIsDaemonModalOpen(true);
        }}
        onOpenRanking={() => setIsRankingOpen(true)}
        historyCount={savedProducts.length}
        selectedRegion={selectedRegion}
        onChangeRegion={handleRegionChange}
      />

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="p-4 bg-rose-950/80 border border-rose-800 rounded-xl text-xs sm:text-sm text-rose-200 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block">Error durante la ejecución del agente</strong>
                <p>{errorMessage}</p>
              </div>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-xs text-rose-300 hover:text-white font-mono"
            >
              Cerrar
            </button>
          </div>
        )}

        {/* 2.1 GOOGLE LOGIN GATEWAY & CLOUD MEMORY STATUS */}
        <GoogleLoginGateway
          onOpenDaemonModal={() => {
            setDaemonTargetProduct(activeProduct);
            setIsDaemonModalOpen(true);
          }}
          onOpenVault={() => setIsHistoryOpen(true)}
          savedProductsCount={savedProducts.length}
          activeAlertsCount={priceAlerts.length}
        />

        {/* 3. MULTIMODAL SCANNER HUB & PHOTOGRAPHIC MEMORY DISPLAY */}
        <ScannerHub
          onStartAnalysis={handleStartAnalysis}
          isLoading={isLoading}
          savedProducts={savedProducts}
          onSelectProduct={(p) => setActiveProduct(p)}
          onViewLog={(p) => setSelectedLogProduct(p)}
          onQuickRevalidate={handleQuickRevalidate}
          onOpenDaemonModal={(p) => {
            setDaemonTargetProduct(p);
            setIsDaemonModalOpen(true);
          }}
          selectedRegion={selectedRegion}
        />

        {/* 4. REAL-TIME COGNITIVE HUD & AUTONOMOUS SPIDERS */}
        <AgentCognitiveHUD
          isLoading={isLoading}
          productQuery={currentQueryText}
          customThoughts={agentThoughts}
        />

        {/* 5. PRODUCT VERDICT, CERTIFICATIONS & PRICE COMPARISON */}
        {activeProduct && !isLoading && (
          <ProductVerdictView
            product={activeProduct}
            selectedRegion={selectedRegion}
            onPlayVoice={handlePlayVoice}
            onInspectStore={(offer) => setInspectedStoreOffer(offer)}
            onSaveProduct={handleSaveProduct}
            onSetPriceAlert={handleSetPriceAlert}
            onOpenDaemon={(prod) => {
              setDaemonTargetProduct(prod);
              setIsDaemonModalOpen(true);
            }}
            onViewLog={(p) => setSelectedLogProduct(p)}
            isSaved={isCurrentProductSaved}
          />
        )}

        {/* 6. EMPTY STATE / CAPABILITIES INTRO */}
        {!activeProduct && !isLoading && (
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 sm:p-8 text-center max-w-3xl mx-auto space-y-6 my-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-xl">
              <Bot className="w-7 h-7" />
            </div>

            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white">
                Agente Autónomo con Memoria Fotográfica & Enramado .log
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto leading-relaxed">
                AURA inspecciona productos por cámara, empaque o código, genera pistas de trazabilidad y sincroniza en la nube Firebase Firestore para responder con velocidad ultra rápida y cotizaciones al mejor precio.
              </p>
            </div>

            {/* Feature pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left pt-2">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                  <Terminal className="w-4 h-4" />
                  <span>Memoria .log en Firestore</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Sincronización persistente de cada árbol de decisión, nodos de inspección y latencias en tu cuenta segura.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-semibold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Filtro de Seguridad Activo</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Censura y bloquea tiendas de alto riesgo y estafas, enfocándose en TikTok Shop y distribuidores autorizados.
                </p>
              </div>

              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs">
                  <Zap className="w-4 h-4" />
                  <span>Revalidación Rápida</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-normal">
                  Rastrea precios reales al instante y recalcula ahorros netos con garantía de autenticidad.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* 7. MODALS AND DRAWERS */}
      {/* AURA Daemon & Post-Purchase Verification Modal */}
      <DaemonHubModal
        isOpen={isDaemonModalOpen}
        onClose={() => setIsDaemonModalOpen(false)}
        initialProduct={daemonTargetProduct || activeProduct}
        savedProducts={savedProducts}
      />

      {/* Store Inspector Modal */}
      <StoreInspectorModal
        isOpen={!!inspectedStoreOffer}
        onClose={() => setInspectedStoreOffer(null)}
        offer={inspectedStoreOffer}
        productTitle={activeProduct?.title || "Producto"}
        selectedRegion={selectedRegion}
        productModel={activeProduct?.model}
        productBrand={activeProduct?.brand}
      />

      {/* Memory Vault Modal */}
      <MemoryVault
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        savedProducts={savedProducts}
        selectedRegion={selectedRegion}
        onSelectProduct={(p) => setActiveProduct(p)}
        onDeleteProduct={(id) => {
          setSavedProducts((prev) => prev.filter((p) => p.id !== id));
          if (currentUser) {
            deleteProductFromCloud(id).catch((e) => console.warn("Firestore delete:", e));
          }
        }}
        onClearHistory={() => setSavedProducts([])}
        priceAlerts={priceAlerts}
        onRemoveAlert={(id) => {
          setPriceAlerts((prev) => prev.filter((a) => a.id !== id));
          if (currentUser) {
            deletePriceAlertFromCloud(id).catch((e) => console.warn("Firestore alert delete:", e));
          }
        }}
        onViewLog={(p) => setSelectedLogProduct(p)}
      />

      {/* Autonomous .log & Decision Tree Inspector Modal */}
      <AutonomousLogModal
        isOpen={!!selectedLogProduct}
        onClose={() => setSelectedLogProduct(null)}
        product={selectedLogProduct}
        onRevalidate={(prod) => {
          setSelectedLogProduct(null);
          handleQuickRevalidate(prod);
        }}
      />

      {/* Interactive Chat Drawer */}
      <AgentChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        activeProduct={activeProduct}
        onPlayVoice={handlePlayVoice}
      />
    </div>
  );
}

export default function App() {
  const onProductsLoadedRef = React.useRef<((products: ProductScanResult[]) => void) | null>(null);
  const onAlertsLoadedRef = React.useRef<((alerts: PriceAlert[]) => void) | null>(null);
  const onPurchasesLoadedRef = React.useRef<((purchases: VerifiedPurchase[]) => void) | null>(null);

  return (
    <AuthProvider
      onCloudProductsLoaded={(products) => {
        if (onProductsLoadedRef.current) {
          onProductsLoadedRef.current(products);
        }
      }}
      onCloudAlertsLoaded={(alerts) => {
        if (onAlertsLoadedRef.current) {
          onAlertsLoadedRef.current(alerts);
        }
      }}
      onCloudPurchasesLoaded={(purchases) => {
        if (onPurchasesLoadedRef.current) {
          onPurchasesLoadedRef.current(purchases);
        }
      }}
    >
      <MainAppContent 
        onProductsLoadedRef={onProductsLoadedRef}
        onAlertsLoadedRef={onAlertsLoadedRef}
        onPurchasesLoadedRef={onPurchasesLoadedRef}
      />
    </AuthProvider>
  );
}
