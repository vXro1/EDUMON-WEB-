import { createContext, useCallback, useContext, useId, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import AppModal from "@/components/ui/AppModal";
import Button from "@/components/ui/Button";

const ConfirmContext = createContext(null);

const DEFAULTS = {
  title: "¿Confirmas esta acción?",
  message: "",
  confirmLabel: "Confirmar",
  cancelLabel: "Cancelar",
  danger: true,
};

export function ConfirmProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const resolverRef = useRef(null);
  const titleId = useId();
  const messageId = useId();

  const confirm = useCallback((options = {}) => {
    const opts = typeof options === "string" ? { message: options } : options;
    resolverRef.current?.(false);
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialog({ ...DEFAULTS, ...opts });
    });
  }, []);

  const close = useCallback((value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setDialog(null);
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AppModal
        isOpen={!!dialog}
        onClose={() => close(false)}
        size="sm"
        labelledBy={titleId}
        describedBy={dialog?.message ? messageId : undefined}
      >
        {dialog && (
          <>
            <AppModal.Header
              titleId={titleId}
              title={
                <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
                  {dialog.danger && (
                    <AlertTriangle size={20} aria-hidden="true" style={{ color: "var(--color-error-text)", flexShrink: 0 }} />
                  )}
                  {dialog.title}
                </span>
              }
            />
            {dialog.message && (
              <AppModal.Body>
                <p id={messageId} style={{ margin: 0, color: "var(--color-text-muted)", lineHeight: 1.6 }}>
                  {dialog.message}
                </p>
              </AppModal.Body>
            )}
            <AppModal.Footer>
              <Button variant="outline-neutral" onClick={() => close(false)}>
                {dialog.cancelLabel}
              </Button>
              <Button variant={dialog.danger ? "danger" : "primary"} onClick={() => close(true)}>
                {dialog.confirmLabel}
              </Button>
            </AppModal.Footer>
          </>
        )}
      </AppModal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error("useConfirm debe usarse dentro de <ConfirmProvider>");
  return ctx;
}
