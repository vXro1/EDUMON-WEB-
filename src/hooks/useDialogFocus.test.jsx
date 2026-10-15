import { describe, it, expect, vi, afterEach } from "vitest";
import { useRef, useState } from "react";
import { render, screen, fireEvent, cleanup, waitFor } from "@testing-library/react";
import useDialogFocus from "./useDialogFocus";

function Dialogo({ onClose }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const cerrar = () => { onClose(); setOpen(false); };
  useDialogFocus(ref, open, cerrar);
  return (
    <>
      <button onClick={() => setOpen(true)}>Abrir</button>
      {open && (
        <div ref={ref} role="dialog">
          <button>Primero</button>
          <button>Último</button>
        </div>
      )}
    </>
  );
}

afterEach(cleanup);

describe("useDialogFocus", () => {
  it("lleva el foco al primer control y lo devuelve al cerrar con Escape", async () => {
    const onClose = vi.fn();
    render(<Dialogo onClose={onClose} />);
    const abrir = screen.getByText("Abrir");
    abrir.focus();
    fireEvent.click(abrir);
    await waitFor(() => expect(document.activeElement).toBe(screen.getByText("Primero")));
    fireEvent.keyDown(document, { key: "Escape" });
    expect(onClose).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.activeElement).toBe(abrir));
  });

  it("mantiene el foco dentro del diálogo con Tab y Shift+Tab", async () => {
    render(<Dialogo onClose={() => {}} />);
    fireEvent.click(screen.getByText("Abrir"));
    const primero = await screen.findByText("Primero");
    const ultimo = screen.getByText("Último");
    ultimo.focus();
    fireEvent.keyDown(document, { key: "Tab" });
    expect(document.activeElement).toBe(primero);
    fireEvent.keyDown(document, { key: "Tab", shiftKey: true });
    expect(document.activeElement).toBe(ultimo);
  });
});
