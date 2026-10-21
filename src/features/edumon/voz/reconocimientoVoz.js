const Clase = () => (typeof window !== "undefined" ? window.SpeechRecognition || window.webkitSpeechRecognition : undefined);

export const reconocimientoSoportado = () => Boolean(Clase());

const MENSAJES = {
  "not-allowed": "No tengo permiso para usar el micrófono. Actívalo en la configuración del navegador o escribe tu mensaje.",
  "service-not-allowed": "Tu navegador no permite el reconocimiento de voz aquí. Puedes escribir tu mensaje.",
  "audio-capture": "No encontré un micrófono en este dispositivo.",
  network: "El reconocimiento de voz necesita internet y no pudo conectarse.",
  "no-speech": "No escuché nada. Toca el micrófono e inténtalo otra vez.",
  "language-not-supported": "El reconocimiento de voz no está disponible en español en este navegador.",
};

export const mensajeErrorVoz = (codigo) => MENSAJES[codigo] ?? "No pude entender el audio. Inténtalo de nuevo o escribe tu mensaje.";

export function escucharFrase({ lang = "es-CO", onParcial } = {}) {
  const Reconocedor = Clase();
  if (!Reconocedor) {
    return { promesa: Promise.reject(Object.assign(new Error("no_soportado"), { codigo: "service-not-allowed" })), cancelar: () => {} };
  }

  const rec = new Reconocedor();
  rec.lang = lang;
  rec.interimResults = true;
  rec.continuous = false;
  rec.maxAlternatives = 1;

  let final = "";
  let parcial = "";
  let cancelado = false;

  const promesa = new Promise((resolve, reject) => {
    rec.onresult = (e) => {
      parcial = "";
      for (let i = e.resultIndex; i < e.results.length; i += 1) {
        const r = e.results[i];
        if (r.isFinal) final += r[0].transcript;
        else parcial += r[0].transcript;
      }
      onParcial?.(`${final}${parcial}`.trim());
    };
    rec.onerror = (e) => {
      if (cancelado || e.error === "aborted") return;
      reject(Object.assign(new Error(e.error), { codigo: e.error }));
    };
    rec.onend = () => {
      if (cancelado) { resolve(""); return; }
      const texto = `${final}${parcial}`.trim();
      if (texto) resolve(texto);
      else reject(Object.assign(new Error("no-speech"), { codigo: "no-speech" }));
    };
  });

  try {
    rec.start();
  } catch (err) {
    return { promesa: Promise.reject(Object.assign(err, { codigo: "service-not-allowed" })), cancelar: () => {} };
  }

  return {
    promesa,
    cancelar: () => {
      cancelado = true;
      try { rec.abort(); } catch { return; }
    },
    terminar: () => {
      try { rec.stop(); } catch { return; }
    },
  };
}
