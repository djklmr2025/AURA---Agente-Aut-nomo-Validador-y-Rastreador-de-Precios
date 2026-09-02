// Utility to play audio from base64 (either 24kHz raw PCM or data URI) or Web Speech API fallback

export async function playAgentAudio(base64Audio?: string, fallbackText?: string): Promise<void> {
  if (base64Audio) {
    try {
      // Decode base64 to binary
      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Check if it's PCM 16-bit 24kHz (Gemini TTS default)
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: 24000,
      });

      const int16Array = new Int16Array(bytes.buffer);
      const float32Array = new Float32Array(int16Array.length);
      for (let i = 0; i < int16Array.length; i++) {
        float32Array[i] = int16Array[i] / 32768.0;
      }

      const audioBuffer = audioCtx.createBuffer(1, float32Array.length, 24000);
      audioBuffer.copyToChannel(float32Array, 0);

      const source = audioCtx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioCtx.destination);
      source.start();
      return;
    } catch (err) {
      console.warn("Could not play raw PCM buffer, falling back to Web Speech API:", err);
    }
  }

  // Web Speech API fallback
  if (fallbackText && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(fallbackText);
    utterance.lang = "es-ES";
    utterance.rate = 1.05;
    utterance.pitch = 1.0;
    
    // Pick an expressive Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find((v) => v.lang.startsWith("es"));
    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }
    
    window.speechSynthesis.speak(utterance);
  }
}

export function stopAgentAudio(): void {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}
