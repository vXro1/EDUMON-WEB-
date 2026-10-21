const codigoDe = (err) => err?.data?.code;
const estadoDe = (err) => err?.status ?? err?.response?.status;
const mensajeServidor = (err) => {
  const m = err?.data?.message;
  return typeof m === "string" && m.trim() && m.length < 240 ? m.trim() : "";
};

const esTiempoAgotado = (err) =>
  err?.name === "TimeoutError" || /tard[oó] demasiado|timeout|timed out/i.test(err?.message ?? "");

const esFalloDeRed = (err) =>
  err?.name === "TypeError" || /failed to fetch|networkerror|network error|load failed/i.test(err?.message ?? "");

export function clasificarErrorChat(err, { enLinea = true } = {}) {
  const estado = estadoDe(err);
  const codigo = codigoDe(err);

  if (codigo === "LIMITE_IA" || estado === 429) {
    const espera = Number(err?.data?.retryAfter) || 60;
    return {
      tipo: "limite",
      titulo: "Edumon necesita una pausa corta",
      texto: mensajeServidor(err) || `Recibí muchos mensajes seguidos. Podrás intentarlo de nuevo en ${espera} segundos.`,
      reintentable: true,
      esperaSegundos: espera,
      expresion: "pensando",
    };
  }

  if (estado === 402) {
    return {
      tipo: "servicio_restringido",
      titulo: "Edumon no está disponible por ahora",
      texto: mensajeServidor(err)
        || "El servicio de inteligencia artificial no aceptó la solicitud por una restricción de uso. No es un problema de tu conexión. Avísale a tu colegio si sigue pasando.",
      reintentable: false,
      expresion: "no",
    };
  }

  if (!enLinea) {
    return {
      tipo: "sin_conexion",
      titulo: "Parece que no hay conexión",
      texto: "Tu dispositivo está sin internet. Revisa el wifi o los datos móviles y vuelve a intentarlo: tu mensaje sigue aquí.",
      reintentable: true,
      expresion: "alerta",
    };
  }

  if (esTiempoAgotado(err)) {
    return {
      tipo: "tiempo_agotado",
      titulo: "La respuesta tardó demasiado",
      texto: "Edumon no alcanzó a responder a tiempo. Puede ser un problema temporal del servicio o de la conexión. Inténtalo de nuevo en unos segundos.",
      reintentable: true,
      expresion: "pensando",
    };
  }

  if (!estado && esFalloDeRed(err)) {
    return {
      tipo: "red",
      titulo: "No pude comunicarme con Edumon",
      texto: "El mensaje no llegó al servidor. Revisa tu conexión a internet y vuelve a intentarlo.",
      reintentable: true,
      expresion: "alerta",
    };
  }

  if (estado >= 500) {
    return {
      tipo: "temporal",
      titulo: "¡Ups! No pude responderte en este momento",
      texto: "Ocurrió un problema temporal en el servicio. Inténtalo de nuevo en unos segundos y seguimos conversando.",
      reintentable: true,
      expresion: "no",
    };
  }

  return {
    tipo: "desconocido",
    titulo: "No pude responder este mensaje",
    texto: mensajeServidor(err) || "Algo salió mal al enviar tu mensaje. Puedes intentarlo de nuevo.",
    reintentable: estado !== 400 && estado !== 403 && estado !== 404,
    expresion: "no",
  };
}
