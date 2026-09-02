import React, { useState, useRef, useEffect } from "react";
import { 
  X, 
  Send, 
  Bot, 
  User, 
  Volume2, 
  Sparkles, 
  Loader2, 
  HelpCircle,
  ShoppingBag
} from "lucide-react";
import { ChatMessage, ProductScanResult } from "../types";
import ReactMarkdown from "react-markdown";

const API_URL = import.meta.env.VITE_API_URL || "https://aura-backend-fdjk.onrender.com";

interface AgentChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeProduct: ProductScanResult | null;
  onPlayVoice: (text: string) => void;
}

export const AgentChatDrawer: React.FC<AgentChatDrawerProps> = ({
  isOpen,
  onClose,
  activeProduct,
  onPlayVoice,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg_welcome",
      sender: "agent",
      timestamp: Date.now(),
      text: "¡Hola! Soy AURA, tu agente vivo de validación y mejores ofertas. Puedo responder dudas sobre autenticidad, garantías, comparación de tiendas o conveniencia de compra en tiempo real.",
    },
  ]);
  const [inputText, setInputText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  const quickPrompts = [
    "¿Qué precauciones debo tener con este producto?",
    "¿Es el mejor momento para comprar o espero rebaja?",
    "¿Qué diferencia hay entre distribuidores autorizados y revendedores?",
    "¿Ofrece garantía internacional del fabricante?",
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: "msg_" + Date.now(),
      sender: "user",
      timestamp: Date.now(),
      text,
      relatedProductId: activeProduct?.id,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/agent/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          productContext: activeProduct,
          history: messages.slice(-6),
        }),
      });

      const data = await res.json();
      const agentMsg: ChatMessage = {
        id: "msg_" + Date.now() + 1,
        sender: "agent",
        timestamp: Date.now(),
        text: data.reply || "He procesado tu consulta.",
      };

      setMessages((prev) => [...prev, agentMsg]);
    } catch (err: any) {
      console.error("Chat error:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: "msg_err_" + Date.now(),
          sender: "agent",
          timestamp: Date.now(),
          text: "Hubo una interrupción en el canal neural del agente. Por favor intenta de nuevo.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-md">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              AURA Asistente
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            </h3>
            <p className="text-[10px] text-slate-400">Memoria contextual activa</p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-all"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Active Product context badge */}
      {activeProduct && (
        <div className="p-2.5 bg-indigo-950/40 border-b border-indigo-900/40 flex items-center gap-2 text-xs">
          <ShoppingBag className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span className="text-slate-300 truncate">
            Contexto: <strong className="text-white">{activeProduct.title}</strong>
          </span>
        </div>
      )}

      {/* Message List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-2.5 ${
              msg.sender === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg shrink-0 flex items-center justify-center text-xs ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-cyan-950 text-cyan-400 border border-cyan-800"
              }`}
            >
              {msg.sender === "user" ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
            </div>

            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                msg.sender === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tl-none shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>
              {msg.sender === "agent" && (
                <button
                  onClick={() => onPlayVoice(msg.text)}
                  className="mt-1.5 text-[10px] text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono"
                >
                  <Volume2 className="w-3 h-3" />
                  <span>Escuchar</span>
                </button>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-cyan-400 font-mono pl-9">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            <span>AURA consultando fuentes en tiempo real...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Prompts */}
      <div className="px-4 py-2 bg-slate-950/40 border-t border-slate-800/80 overflow-x-auto whitespace-nowrap flex gap-1.5 no-scrollbar">
        {quickPrompts.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            className="px-2.5 py-1 bg-slate-800/70 hover:bg-slate-800 border border-slate-700/60 rounded-full text-[11px] text-slate-300 hover:text-cyan-300 shrink-0 transition-colors"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="p-3 border-t border-slate-800 bg-slate-950 flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Pregunta a AURA sobre precios o autenticidad..."
          className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/60"
        />
        <button
          type="submit"
          disabled={isLoading || !inputText.trim()}
          className="p-2 bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 text-slate-950 rounded-xl transition-all font-bold"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
