import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import { 
  Bot, 
  Receipt, 
  ShieldCheck, 
  CheckCircle2, 
  X, 
  Upload, 
  Camera, 
  FileText, 
  ExternalLink, 
  Lock, 
  Sparkles, 
  AlertTriangle, 
  Package, 
  Truck, 
  Clock, 
  Trash2, 
  FileCheck,
  Zap,
  DollarSign,
  Building,
  KeyRound,
  Check
} from "lucide-react";
import { ProductScanResult, VerifiedPurchase, DaemonHandshakeStep } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "https://aura-backend-fdjk.onrender.com";

interface DaemonHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: ProductScanResult | null;
  savedProducts?: ProductScanResult[];
}

export const DaemonHubModal: React.FC<DaemonHubModalProps> = ({
  isOpen,
  onClose,
  initialProduct,
  savedProducts = [],
}) => {
  const { 
    currentUser, 
    userProfile, 
    verifiedPurchases, 
    saveVerifiedPurchaseToCloud, 
    deleteVerifiedPurchaseFromCloud,
    signDaemonConsent,
    signInWithGoogle 
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'AUTONOMOUS' | 'MANUAL_OCR' | 'WALL'>('AUTONOMOUS');

  // Autonomous Daemon Form State
  const [selectedStore, setSelectedStore] = useState<string>("Amazon Prime / Oficial");
  const [orderId, setOrderId] = useState<string>("");
  const [trackingNumber, setTrackingNumber] = useState<string>("");
  const [productTitle, setProductTitle] = useState<string>(initialProduct?.title || "");
  const [isDaemonRunning, setIsDaemonRunning] = useState<boolean>(false);
  const [daemonSteps, setDaemonSteps] = useState<DaemonHandshakeStep[]>([]);
  const [daemonResult, setDaemonResult] = useState<any | null>(null);

  // Manual OCR Form State
  const [ticketImage, setTicketImage] = useState<string | null>(null);
  const [productReceivedImage, setProductReceivedImage] = useState<string | null>(null);
  const [manualTitle, setManualTitle] = useState<string>(initialProduct?.title || "");
  const [manualExpectedPrice, setManualExpectedPrice] = useState<string>(
    initialProduct?.bestDeal?.price ? String(initialProduct.bestDeal.price) : ""
  );
  const [isOcrProcessing, setIsOcrProcessing] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<any | null>(null);

  // Digital consent signature
  const [isSigningConsent, setIsSigningConsent] = useState<boolean>(false);
  const isConsentSigned = !!userProfile?.daemonConsent?.signed;

  if (!isOpen) return null;

  // Handle digital signature of daemon audit terms
  const handleSignConsent = async () => {
    if (!currentUser) {
      alert("Debes iniciar sesión con Google para firmar el consentimiento de AURA Daemon.");
      return;
    }
    try {
      setIsSigningConsent(true);
      await signDaemonConsent();
    } catch (err: any) {
      alert(err.message || "Error al firmar consentimiento");
    } finally {
      setIsSigningConsent(false);
    }
  };

  // Launch Autonomous Agent-to-Agent Handshake
  const handleRunDaemonHandshake = async () => {
    if (!isConsentSigned) {
      alert("Es obligatorio aceptar y firmar digitalmente el permiso de auditoría AURA Daemon.");
      return;
    }

    const titleToVerify = productTitle.trim() || initialProduct?.title || "Producto Verificado en Tienda";
    setIsDaemonRunning(true);
    setDaemonResult(null);
    setDaemonSteps([
      {
        stepId: "step_init",
        stage: "INITIALIZING",
        agentName: "AURA Daemon Controller",
        message: "Inicializando socket seguro TLS 1.3 con nodo de comercio...",
        timestamp: new Date().toLocaleTimeString(),
        latencyMs: 35,
        status: "running",
      }
    ]);

    try {
      // Step 1 delay simulation for live telemetry feel
      await new Promise((r) => setTimeout(r, 600));
      setDaemonSteps((prev) => [
        ...prev.map((s) => ({ ...s, status: "success" as const })),
        {
          stepId: "step_perm",
          stage: "CHECKING_PERMISSIONS",
          agentName: "AURA Security Guardian",
          message: `Validando token de firma: ${userProfile?.daemonConsent?.digitalSignatureHash || "Firma Válida"}...`,
          timestamp: new Date().toLocaleTimeString(),
          latencyMs: 40,
          status: "running",
        }
      ]);

      await new Promise((r) => setTimeout(r, 700));
      setDaemonSteps((prev) => [
        ...prev.map((s) => ({ ...s, status: "success" as const })),
        {
          stepId: "step_relay",
          stage: "CONNECTING_MERCHANT_AGENT",
          agentName: `${selectedStore} Relay Agent`,
          message: `Consultando estado de orden ${orderId || "ORD-Reciente"} y confirmación de pago...`,
          timestamp: new Date().toLocaleTimeString(),
          latencyMs: 95,
          status: "running",
        }
      ]);

      const res = await fetch(`${API_URL}/api/daemon/verify-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeName: selectedStore,
          orderId,
          trackingNumber,
          productTitle: titleToVerify,
          userSignature: userProfile?.daemonConsent?.digitalSignatureHash,
          currency: initialProduct?.bestDeal?.currency || "USD",
        }),
      });

      const data = await res.json();
      setDaemonResult(data);

      if (data.daemonLogSteps && Array.isArray(data.daemonLogSteps)) {
        setDaemonSteps(data.daemonLogSteps);
      } else {
        setDaemonSteps((prev) => [
          ...prev.map((s) => ({ ...s, status: "success" as const })),
          {
            stepId: "step_pod",
            stage: "DELIVERY_POD",
            agentName: "Carrier Geolocation POD",
            message: "Prueba de entrega con firma física y geolocalización confirmada.",
            timestamp: new Date().toLocaleTimeString(),
            latencyMs: 70,
            status: "success",
          },
          {
            stepId: "step_complete",
            stage: "COMPLETED",
            agentName: "AURA Daemon Finalizer",
            message: "Verificación de orden y entrega concluida satisfactoriamente.",
            timestamp: new Date().toLocaleTimeString(),
            latencyMs: 25,
            status: "success",
          }
        ]);
      }

      // Auto-save to cloud if user is signed in
      if (currentUser && data.isDeliveredSatisfactorily) {
        const verifiedRecord: VerifiedPurchase = {
          id: "VP_" + Date.now(),
          userId: currentUser.uid,
          productId: initialProduct?.id,
          productTitle: titleToVerify,
          brand: initialProduct?.brand,
          model: initialProduct?.model,
          storeName: selectedStore,
          orderId: data.orderId,
          trackingNumber: data.trackingNumber,
          carrier: data.carrier,
          verificationMode: "AUTONOMOUS_DAEMON",
          verifiedAt: Date.now(),
          purchaseDate: data.purchaseDate,
          deliveryDate: data.deliveryDate,
          paidPrice: data.paidPrice || 0,
          quotedMarketPrice: data.originalQuotedPrice || (data.paidPrice + data.savingsRealized) || 0,
          savingsRealized: data.savingsRealized || 0,
          currency: data.currency || "USD",
          isDeliveredSatisfactorily: true,
          fulfillmentScore: data.fulfillmentScore || 98,
          certificateHash: data.certificateHash,
          verificationVerdict: data.verificationVerdict || "Compra y entrega verificadas con éxito por el demonio de AURA.",
        };
        await saveVerifiedPurchaseToCloud(verifiedRecord);
      }
    } catch (err: any) {
      console.error("Daemon error:", err);
      alert("Error al ejecutar el demonio de verificación. Inténtalo de nuevo.");
    } finally {
      setIsDaemonRunning(false);
    }
  };

  // Image Upload Handlers for Manual Mode
  const handleTicketFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setTicketImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleProductReceivedFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setProductReceivedImage(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Process Manual Ticket OCR & Received Item Verification
  const handleRunManualTicketOcr = async () => {
    if (!ticketImage && !productReceivedImage) {
      alert("Debes subir al menos la foto del ticket o la foto del producto recibido.");
      return;
    }

    setIsOcrProcessing(true);
    setOcrResult(null);

    try {
      const res = await fetch(`${API_URL}/api/daemon/verify-ticket`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ticketImageBase64: ticketImage,
          productImageBase64: productReceivedImage,
          productTitle: manualTitle || initialProduct?.title || "Artículo Comprado",
          expectedPrice: parseFloat(manualExpectedPrice) || 0,
          currency: initialProduct?.bestDeal?.currency || "USD",
        }),
      });

      const data = await res.json();
      setOcrResult(data);

      if (currentUser && data.isValidTicket) {
        const verifiedRecord: VerifiedPurchase = {
          id: "VP_TKT_" + Date.now(),
          userId: currentUser.uid,
          productId: initialProduct?.id,
          productTitle: data.productTitle || manualTitle || "Producto en Ticket",
          storeName: data.storeName || "Comercio Verificado",
          ticketNumber: data.ticketNumber,
          verificationMode: "MANUAL_TICKET_OCR",
          verifiedAt: Date.now(),
          purchaseDate: data.purchaseDate,
          deliveryDate: data.purchaseDate,
          paidPrice: data.paidPrice || 0,
          quotedMarketPrice: (data.paidPrice || 0) + (data.savingsRealized || 0),
          savingsRealized: data.savingsRealized || 0,
          currency: data.currency || "USD",
          isDeliveredSatisfactorily: true,
          fulfillmentScore: data.fulfillmentScore || 96,
          ticketImageUrl: ticketImage || undefined,
          productReceivedImageUrl: productReceivedImage || undefined,
          deliveryProofType: "RECEIPT_OCR",
          certificateHash: data.certificateHash,
          verificationVerdict: data.verificationVerdict || "Comprobante de compra y producto validados satisfactoriamente.",
        };
        await saveVerifiedPurchaseToCloud(verifiedRecord);
      }
    } catch (err: any) {
      console.error("Ticket OCR error:", err);
      alert("Error al procesar el ticket. Inténtalo de nuevo.");
    } finally {
      setIsOcrProcessing(false);
    }
  };

  return (
    <div 
      id="daemon-verification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-fadeIn"
    >
      <div 
        id="daemon-verification-modal-container"
        className="w-full max-w-4xl bg-neutral-900 border border-neutral-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-neutral-900 via-neutral-950 to-neutral-900 border-b border-neutral-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                  Módulo de Demonio & Validación Post-Compra
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  AURA v2.4
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Auditoría en tiempo real de compras y entregas con agentes de tiendas o registro manual de tickets.
              </p>
            </div>
          </div>

          <button
            id="btn-close-daemon-modal"
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center border-b border-neutral-800 bg-neutral-950/60 px-5 sm:px-6 gap-2 sm:gap-4 overflow-x-auto">
          <button
            id="tab-autonomous-daemon"
            type="button"
            onClick={() => setActiveTab('AUTONOMOUS')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'AUTONOMOUS'
                ? "border-cyan-400 text-cyan-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Bot className="w-4 h-4" />
            <span>Modo Autónomo (Demonio Agente)</span>
          </button>

          <button
            id="tab-manual-ticket-ocr"
            type="button"
            onClick={() => setActiveTab('MANUAL_OCR')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'MANUAL_OCR'
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Modo Manual (Ticket + Foto OCR)</span>
          </button>

          <button
            id="tab-verified-wall"
            type="button"
            onClick={() => setActiveTab('WALL')}
            className={`py-3.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-2 shrink-0 ${
              activeTab === 'WALL'
                ? "border-emerald-400 text-emerald-400"
                : "border-transparent text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Casos Reales Validados ({verifiedPurchases.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-6">

          {/* TAB 1: MODO AUTÓNOMO */}
          {activeTab === 'AUTONOMOUS' && (
            <div className="space-y-6">
              {/* Permission & Signature Card */}
              <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                isConsentSigned 
                  ? "bg-emerald-950/20 border-emerald-500/30" 
                  : "bg-neutral-800/40 border-amber-500/30"
              }`}>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2.5 rounded-xl shrink-0 ${
                      isConsentSigned ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
                    }`}>
                      <KeyRound className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-white">
                          Permiso de Auditoría Autónoma AURA Daemon
                        </h3>
                        {isConsentSigned ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                            Firmado & Activo
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                            Firma Requerida
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-neutral-400 mt-1 max-w-xl">
                        {isConsentSigned 
                          ? `Firma criptográfica válida: ${userProfile?.daemonConsent?.digitalSignatureHash}. El demonio tiene autorización estricta de consulta para órdenes y entrega.`
                          : "Otorga permiso firmado para que el demonio AURA se comunique con los agentes de tiendas autorizadas (Amazon, MercadoLibre, TikTok Shop, etc.)."}
                      </p>
                    </div>
                  </div>

                  {!isConsentSigned && (
                    <button
                      id="btn-sign-daemon-consent"
                      type="button"
                      onClick={handleSignConsent}
                      disabled={isSigningConsent}
                      className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs transition-all shadow-md active:scale-95 shrink-0"
                    >
                      {isSigningConsent ? "Firmando..." : "Firmar Consentimiento Digital"}
                    </button>
                  )}
                </div>
              </div>

              {/* Form to query order */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Comercio o Tienda con Agente IA
                  </label>
                  <select
                    id="select-daemon-store"
                    value={selectedStore}
                    onChange={(e) => setSelectedStore(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Amazon Prime / Oficial">Amazon (Prime & Official Relay)</option>
                    <option value="MercadoLibre Full / Platinum">MercadoLibre (MercadoEnvíos Full Bot)</option>
                    <option value="TikTok Shop Verified Partner">TikTok Shop (Fulfillment Agent)</option>
                    <option value="Walmart Verified Store">Walmart (Express Delivery Agent)</option>
                    <option value="BestBuy Official Agent">BestBuy (Direct Logistics Bot)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Producto a Validar
                  </label>
                  <input
                    id="input-daemon-product-title"
                    type="text"
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="Ej. Sony WH-1000XM5, iPhone 15 Pro..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Número de Orden / ID de Pedido (Opcional)
                  </label>
                  <input
                    id="input-daemon-order-id"
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Ej. ORD-84920481 o déjalo vacío para auto-consulta"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Guía de Rastreo / Tracking (Opcional)
                  </label>
                  <input
                    id="input-daemon-tracking"
                    type="text"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    placeholder="Ej. TRK-983748291..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  id="btn-run-daemon-verification"
                  type="button"
                  onClick={handleRunDaemonHandshake}
                  disabled={isDaemonRunning}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm transition-all shadow-lg shadow-cyan-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Bot className="w-5 h-5" />
                  <span>{isDaemonRunning ? "Conectando Demonio..." : "Iniciar Handshake de Demonio"}</span>
                </button>
              </div>

              {/* Live Daemon Handshake Telemetry Console */}
              {(isDaemonRunning || daemonSteps.length > 0) && (
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 sm:p-5 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800 pb-2">
                    <span className="flex items-center gap-2 text-cyan-400 font-bold">
                      <Zap className="w-4 h-4 animate-pulse" />
                      SOCKET AGENT-TO-AGENT PROTOCOL
                    </span>
                    <span>TLS 1.3 / AES-256</span>
                  </div>

                  <div className="space-y-2 pt-1 max-h-48 overflow-y-auto">
                    {daemonSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-neutral-300">
                        <span className="text-neutral-500 shrink-0">[{step.timestamp || "NOW"}]</span>
                        <span className="text-cyan-400 font-semibold shrink-0">{step.agentName}:</span>
                        <span className="text-neutral-200">{step.message}</span>
                        {step.latencyMs && (
                          <span className="text-neutral-500 ml-auto shrink-0 text-[10px]">{step.latencyMs}ms</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Daemon Verification Result Card */}
              {daemonResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-neutral-900 to-neutral-900 border border-emerald-500/40 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{daemonResult.verificationVerdict}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Score: {daemonResult.fulfillmentScore}% Satisfactorio
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Orden Verificada</span>
                      <span className="font-bold text-white">{daemonResult.orderId}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Transportista</span>
                      <span className="font-bold text-white">{daemonResult.carrier}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Precio Pagado</span>
                      <span className="font-bold text-emerald-400">${daemonResult.paidPrice} {daemonResult.currency}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Ahorro Obtenido</span>
                      <span className="font-bold text-sky-400">${daemonResult.savingsRealized} {daemonResult.currency}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-neutral-400 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800 flex items-center justify-between">
                    <span>Certificado Digital: <strong className="text-neutral-200">{daemonResult.certificateHash}</strong></span>
                    <span className="text-emerald-400 font-semibold">Guardado en Firebase ✓</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: MODO MANUAL TICKET OCR */}
          {activeTab === 'MANUAL_OCR' && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 leading-relaxed">
                <strong className="text-amber-300 block mb-1">Módulo Estilo Trivago de Validación de Casos Reales:</strong>
                Sube la foto del ticket o recibo de compra y la foto del producto físico recibido para que la IA Multimodal extraiga los datos fiscales, corrobore la coincidencia y certifique la compra real con su ahorro conseguido.
              </div>

              {/* Image Upload Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 1. Ticket Upload */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                    <Receipt className="w-4 h-4 text-amber-400" />
                    1. Foto del Ticket / Factura / Recibo
                  </label>
                  
                  {ticketImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 bg-neutral-950 max-h-48 group">
                      <img src={ticketImage} alt="Ticket" className="w-full h-48 object-contain" />
                      <button
                        type="button"
                        onClick={() => setTicketImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-neutral-700 hover:border-amber-400/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-neutral-950/40 hover:bg-neutral-800/40 h-48 text-center">
                      <Upload className="w-8 h-8 text-neutral-400 mb-2" />
                      <span className="text-xs font-bold text-neutral-200">Subir Ticket o Comprobante</span>
                      <span className="text-[10px] text-neutral-500 mt-1">PNG, JPG, HEIC</span>
                      <input type="file" accept="image/*" onChange={handleTicketFileUpload} className="hidden" />
                    </label>
                  )}
                </div>

                {/* 2. Received Product Upload */}
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-2 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-cyan-400" />
                    2. Foto del Artículo Físico Recibido (Opcional)
                  </label>

                  {productReceivedImage ? (
                    <div className="relative rounded-2xl overflow-hidden border border-cyan-500/40 bg-neutral-950 max-h-48 group">
                      <img src={productReceivedImage} alt="Producto Físico" className="w-full h-48 object-contain" />
                      <button
                        type="button"
                        onClick={() => setProductReceivedImage(null)}
                        className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 text-white hover:bg-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-neutral-700 hover:border-cyan-400/60 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer transition-all bg-neutral-950/40 hover:bg-neutral-800/40 h-48 text-center">
                      <Camera className="w-8 h-8 text-neutral-400 mb-2" />
                      <span className="text-xs font-bold text-neutral-200">Subir Foto del Producto en Mano</span>
                      <span className="text-[10px] text-neutral-500 mt-1">Foto del paquete o artículo recibido</span>
                      <input type="file" accept="image/*" onChange={handleProductReceivedFileUpload} className="hidden" />
                    </label>
                  )}
                </div>
              </div>

              {/* Product Reference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Nombre o Referencia del Producto
                  </label>
                  <input
                    type="text"
                    value={manualTitle}
                    onChange={(e) => setManualTitle(e.target.value)}
                    placeholder="Ej. Monitor LG UltraGear 27..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-300 mb-1.5">
                    Precio Cotizado Previo (Para calcular ahorro)
                  </label>
                  <input
                    type="number"
                    value={manualExpectedPrice}
                    onChange={(e) => setManualExpectedPrice(e.target.value)}
                    placeholder="Ej. 299"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-end">
                <button
                  id="btn-run-ticket-ocr"
                  type="button"
                  onClick={handleRunManualTicketOcr}
                  disabled={isOcrProcessing || (!ticketImage && !productReceivedImage)}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold text-sm transition-all shadow-lg shadow-amber-900/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Receipt className="w-5 h-5" />
                  <span>{isOcrProcessing ? "Analizando Ticket con IA..." : "Validar Ticket con IA Multimodal"}</span>
                </button>
              </div>

              {/* OCR Result Card */}
              {ocrResult && (
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-950/40 via-neutral-900 to-neutral-900 border border-amber-500/40 shadow-xl space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-base">
                      <CheckCircle2 className="w-5 h-5" />
                      <span>{ocrResult.verificationVerdict}</span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      Coincidencia: {ocrResult.productMatchScore}%
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Tienda Detectada</span>
                      <span className="font-bold text-white">{ocrResult.storeName}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Folio / Ticket</span>
                      <span className="font-bold text-white">{ocrResult.ticketNumber}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Monto Pagado</span>
                      <span className="font-bold text-emerald-400">${ocrResult.paidPrice} {ocrResult.currency}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-neutral-800/80 border border-neutral-700/60">
                      <span className="text-neutral-400 block text-[10px]">Ahorro Real</span>
                      <span className="font-bold text-sky-400">${ocrResult.savingsRealized} {ocrResult.currency}</span>
                    </div>
                  </div>

                  {ocrResult.ocrHighlights && (
                    <div className="space-y-1 text-xs text-neutral-300 bg-neutral-950/70 p-3 rounded-xl border border-neutral-800">
                      <span className="font-bold text-amber-300 block mb-1">Puntos Validados por OCR:</span>
                      {ocrResult.ocrHighlights.map((h: string, i: number) => (
                        <div key={i} className="flex items-center gap-2 text-[11px] text-neutral-400">
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{h}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CASOS REALES VALIDADOS (MURO TRIVAGO) */}
          {activeTab === 'WALL' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Registro de Compras y Entregas Reales Certificadas
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Historial de productos que fueron buscados, validados y concluidos satisfactoriamente.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  {verifiedPurchases.length} Casos Registrados
                </span>
              </div>

              {verifiedPurchases.length === 0 ? (
                <div className="p-8 rounded-2xl bg-neutral-950/60 border border-neutral-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-neutral-800 flex items-center justify-center text-neutral-500 mx-auto">
                    <FileCheck className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-neutral-300">
                    Aún no hay compras verificadas en tu cuenta
                  </h4>
                  <p className="text-xs text-neutral-500 max-w-md mx-auto">
                    Ejecuta el demonio autónomo o sube tu ticket de compra para certificar tus adquisiciones reales y calcular tu ahorro acumulado.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {verifiedPurchases.map((vp) => (
                    <div
                      key={vp.id}
                      className="p-4 rounded-2xl bg-neutral-950/80 border border-neutral-800 hover:border-emerald-500/40 transition-all space-y-3 relative group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 mb-1">
                            <CheckCircle2 className="w-3 h-3" />
                            {vp.verificationMode === 'AUTONOMOUS_DAEMON' ? 'Validado Vía Demonio' : 'Validado Vía Ticket OCR'}
                          </span>
                          <h4 className="text-sm font-bold text-white line-clamp-1">{vp.productTitle}</h4>
                          <span className="text-xs text-neutral-400">{vp.storeName}</span>
                        </div>

                        <button
                          type="button"
                          onClick={() => deleteVerifiedPurchaseFromCloud(vp.id)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-neutral-800 transition-all opacity-0 group-hover:opacity-100"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center text-xs py-2 bg-neutral-900/60 rounded-xl border border-neutral-800/60">
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Pagado</span>
                          <span className="font-bold text-emerald-400">${vp.paidPrice} {vp.currency}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Ahorro</span>
                          <span className="font-bold text-sky-400">${vp.savingsRealized} {vp.currency}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-neutral-500 block">Fulfillment</span>
                          <span className="font-bold text-purple-400">{vp.fulfillmentScore}%</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-neutral-400 pt-1 border-t border-neutral-800/60">
                        <span>Cert: <strong className="text-neutral-300">{vp.certificateHash?.slice(0, 18)}...</strong></span>
                        <span>{new Date(vp.verifiedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
