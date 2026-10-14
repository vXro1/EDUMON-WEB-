import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { AppModal, Button } from "@/components";
import EdumonMascota from "./EdumonMascota";

// Texto v3 del consentimiento. Si cambia, subir VERSION_CONSENTIMIENTO en el
// backend (src/config/edumonIA.js): los padres tendrán que aceptarlo de nuevo.
const PUNTOS = [
  ["Qué es", "Edumon es una herramienta de inteligencia artificial que ofrece orientación general a las familias sobre crianza, emociones, organización en casa, alimentación y vida escolar, a partir de contenidos de UNICEF, ICBF, OMS y el Ministerio de Educación. No hace tareas académicas. No reemplaza a psicólogos, médicos, orientadores ni servicios de emergencia."],
  ["Qué datos tratamos", "Los mensajes que escribas y la edad de tu hijo o hija que menciones. Podrían incluir datos sensibles y de menores de edad (Ley 1581 de 2012). Entregarlos es voluntario."],
  ["Para qué", "Solo para darte orientación y mejorar la escuela de padres de tu institución."],
  ["Privacidad", "Tus conversaciones son privadas: ni docentes ni directivos pueden leerlas. Se eliminan automáticamente a los 30 días sin actividad."],
  ["Procesamiento externo", "Los mensajes se procesan mediante un proveedor de inteligencia artificial (Groq) para generar las respuestas."],
  ["Tus derechos", "Puedes conocer, actualizar o borrar tus datos y retirar esta autorización cuando quieras desde la página de Edumon."],
];

export default function ConsentimientoModal({ isOpen, version, onAceptar, onCancelar }) {
  const [leido, setLeido] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const aceptar = async () => {
    setEnviando(true);
    try {
      await onAceptar();
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AppModal isOpen={isOpen} onClose={onCancelar} size="lg" closeOnOverlay={false}>
      <AppModal.Header
        title="Autorización para usar Edumon"
        description="Tu acompañante de crianza. Léelo con calma antes de empezar."
        onClose={onCancelar}
      />
      <AppModal.Body>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
          <EdumonMascota size={84} expresion="saludo" animacion="flotar" />
          <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5 }}>
            ¡Hola! Antes de conversar quiero contarte cómo cuido tu información. Son seis puntos cortos.
          </p>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10 }}>
          {PUNTOS.map(([titulo, texto]) => (
            <li key={titulo} style={{ fontSize: 13.5, lineHeight: 1.55 }}>
              <strong>{titulo}:</strong> {texto}
            </li>
          ))}
        </ol>

        <div style={{
          marginTop: 16, padding: "12px 14px", borderRadius: 12,
          background: "var(--color-warning-bg, rgba(245,158,11,0.10))",
          border: "1px solid var(--color-warning, #F59E0B)",
          fontSize: 13.5, lineHeight: 1.55,
        }}>
          <strong>¿Cuándo avisa Edumon al colegio?</strong>
          <ul style={{ margin: "6px 0 0", paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
            <li><strong>Casi nunca.</strong> En la mayoría de conversaciones (dudas, cansancio, conflictos del día a día) no se avisa a nadie.</li>
            <li><strong>Solo si tú lo pides.</strong> Si cuentas algo difícil en casa (por ejemplo, castigos físicos o problemas con tu pareja), Edumon te ofrecerá que orientación escolar y tu docente te contacten. Solo les avisa si aceptas.</li>
            <li><strong>Siempre, en casos graves.</strong> Si hay indicios de abuso sexual, golpes con lesiones, riesgo de suicidio o peligro inmediato para un niño o para ti, Edumon avisará al responsable de convivencia y a los docentes de los cursos de tus hijos, porque la ley obliga a proteger al menor (Ley 1098 de 2006, Ley 1146 de 2007 y Ley 1620 de 2013). Te lo dirá en ese momento.</li>
          </ul>
          <div style={{ marginTop: 6 }}>En ningún caso verán tu conversación: solo el tipo de situación y el mensaje que la originó.</div>
        </div>

        <label style={{ display: "flex", gap: 10, alignItems: "flex-start", marginTop: 16, fontSize: 13.5, cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={leido}
            onChange={(e) => setLeido(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <span>He leído y autorizo el tratamiento de mis datos en los términos anteriores. <em>(versión {version})</em></span>
        </label>
      </AppModal.Body>
      <AppModal.Footer>
        <Button variant="ghost" onClick={onCancelar}>Ahora no</Button>
        <Button onClick={aceptar} disabled={!leido} loading={enviando} leftIcon={<ShieldCheck size={16} />}>
          Aceptar y empezar
        </Button>
      </AppModal.Footer>
    </AppModal>
  );
}
