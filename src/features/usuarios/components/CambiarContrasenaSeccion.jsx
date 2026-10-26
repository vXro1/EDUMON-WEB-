import { useState } from "react";
import { KeyRound, RotateCcw, Eye, EyeOff, Loader2 } from "lucide-react";
import { useConfirm } from "@/components";
import { usersCambiarContrasena } from "@/services/usersService";
import { humanizeError } from "@/utils/humanizeError";

const MIN = 6;

/**
 * Sección "Contraseña" del modal de edición de usuarios (administrador).
 * Va aparte de "Guardar cambios": cambiar la contraseña cierra las sesiones
 * abiertas del usuario, así que se confirma y se ejecuta por separado.
 * No toca tareas, entregas ni cursos: solo la contraseña.
 */
export default function CambiarContrasenaSeccion({ usuario, notify }) {
  const confirm = useConfirm();
  const [nueva, setNueva] = useState("");
  const [ver, setVer] = useState(false);
  const [enviando, setEnviando] = useState(null); // "nueva" | "cedula"
  const nombre = `${usuario?.nombre ?? ""} ${usuario?.apellido ?? ""}`.trim();

  const ejecutar = async (tipo) => {
    const restablecer = tipo === "cedula";
    const ok = await confirm({
      title: restablecer ? "Restablecer contraseña" : "Cambiar contraseña",
      message: restablecer
        ? `La contraseña de ${nombre} volverá a ser su cédula (${usuario?.cedula ?? "—"}) y se le pedirá cambiarla al entrar. Se cerrarán sus sesiones abiertas.`
        : `${nombre} tendrá que entrar con la contraseña nueva. Se cerrarán sus sesiones abiertas.`,
      confirmLabel: restablecer ? "Restablecer" : "Cambiar contraseña",
    });
    if (!ok) return;

    setEnviando(tipo);
    try {
      await usersCambiarContrasena(usuario._id, restablecer ? { restablecer: true } : { contraseña: nueva });
      notify(restablecer ? `Contraseña restablecida: ahora es la cédula ${usuario?.cedula ?? ""}` : "Contraseña actualizada");
      setNueva("");
    } catch (err) {
      notify(humanizeError(err, "No se pudo cambiar la contraseña"), "error");
    } finally {
      setEnviando(null);
    }
  };

  const valida = nueva.length >= MIN;

  return (
    <section aria-labelledby="titulo-contrasena" style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--color-border)" }}>
      <h3 id="titulo-contrasena" style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 700, margin: "0 0 4px", color: "var(--color-text)" }}>
        <KeyRound style={{ width: 16, height: 16 }} aria-hidden="true" /> Contraseña
      </h3>
      <p style={{ margin: "0 0 10px", fontSize: 12.5, color: "var(--color-text-muted)" }}>
        Solo cambia la contraseña: sus tareas, entregas y cursos no se tocan.
      </p>

      <label htmlFor="nueva-contrasena" style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 6, color: "var(--color-text)" }}>
        Nueva contraseña (mínimo {MIN} caracteres)
      </label>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: "1 1 200px" }}>
          <input
            id="nueva-contrasena"
            type={ver ? "text" : "password"}
            value={nueva}
            onChange={(e) => setNueva(e.target.value)}
            autoComplete="new-password"
            maxLength={100}
            className="input"
            style={{ width: "100%", paddingRight: 40 }}
          />
          <button
            type="button"
            onClick={() => setVer((v) => !v)}
            aria-label={ver ? "Ocultar contraseña" : "Mostrar contraseña"}
            style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: 0, cursor: "pointer", color: "var(--color-text-muted)", padding: 4 }}
          >
            {ver ? <EyeOff style={{ width: 16, height: 16 }} /> : <Eye style={{ width: 16, height: 16 }} />}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-sm"
          disabled={!valida || enviando !== null}
          onClick={() => ejecutar("nueva")}
        >
          {enviando === "nueva" ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <KeyRound style={{ width: 14, height: 14 }} />}
          Cambiar contraseña
        </button>
      </div>
      {nueva && !valida && (
        <p role="alert" style={{ margin: "6px 0 0", fontSize: 12, color: "var(--color-error-hover)" }}>Debe tener al menos {MIN} caracteres.</p>
      )}

      <button
        type="button"
        className="btn btn-outline btn-sm"
        style={{ marginTop: 10 }}
        disabled={enviando !== null || !usuario?.cedula}
        onClick={() => ejecutar("cedula")}
      >
        {enviando === "cedula" ? <Loader2 style={{ width: 14, height: 14 }} className="animate-spin" /> : <RotateCcw style={{ width: 14, height: 14 }} />}
        Restablecer a la cédula
      </button>
    </section>
  );
}
