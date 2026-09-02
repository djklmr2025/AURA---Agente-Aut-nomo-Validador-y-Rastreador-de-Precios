import React, { useEffect, useState } from 'react';

// Declaración global de la ventana para TypeScript
declare global {
  interface Window {
    ArkaiosPay?: {
      open: (options: {
        amount: number;
        item: string;
        merchant?: string;
        orderId?: string;
        onSuccess?: (receipt: any) => void;
        onCancel?: () => void;
      }) => void;
    };
  }
}

interface AmerioPayButtonProps {
  amount: number; // Monto en Amerio (1 AMR-IO = 1 MXN)
  itemTitle: string;
  orderId?: string;
  onPaymentSuccess?: (receipt: any) => void;
}

export const AmerioPayButton: React.FC<AmerioPayButtonProps> = ({
  amount,
  itemTitle,
  orderId,
  onPaymentSuccess
}) => {
  const [sdkReady, setSdkReady] = useState(false);

  useEffect(() => {
    // Carga dinámica del SDK de ARKAIOS Pay
    const scriptId = 'arkaios-pay-sdk';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://genimi44-by-wix-app44.web.app/sdk/arkaios-pay.js';
      script.async = true;
      script.onload = () => setSdkReady(true);
      script.onerror = () => {
        // Fallback al subdominio secundario dpdns si el primario falla
        console.warn("No se pudo cargar desde Firebase primario, usando fallback dpdns...");
        const fallbackScript = document.createElement('script');
        fallbackScript.src = 'https://arkaios.dpdns.org/sdk/arkaios-pay.js';
        fallbackScript.async = true;
        fallbackScript.onload = () => setSdkReady(true);
        document.body.appendChild(fallbackScript);
      };
      document.body.appendChild(script);
    } else {
      setSdkReady(true);
    }
  }, []);

  const handleCheckout = () => {
    if (!window.ArkaiosPay) {
      alert('El servicio de cobro Amerio se está iniciando...');
      return;
    }

    window.ArkaiosPay.open({
      amount: amount,
      item: itemTitle,
      orderId: orderId || `AURA-${Date.now().toString().slice(-6)}`,
      merchant: 'ARK-001002',
      onSuccess: (receipt) => {
        console.log('✅ Pago Aprobado con Amerio:', receipt);
        if (onPaymentSuccess) {
          onPaymentSuccess(receipt);
        }
      },
      onCancel: () => {
        console.log('Pago cancelado por el usuario.');
      }
    });
  };

  return (
    <button
      onClick={handleCheckout}
      className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center justify-center gap-2"
    >
      <span>Pagar con Amerio</span>
      <span className="font-mono bg-indigo-800/60 px-2 py-0.5 rounded text-xs">
        ${amount.toFixed(2)} AMR-IO
      </span>
    </button>
  );
};
