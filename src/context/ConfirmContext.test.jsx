import { describe, it, expect, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup, act, waitFor } from "@testing-library/react";
import { ConfirmProvider, useConfirm } from "./ConfirmContext";

let confirmRef;

function Probe() {
  confirmRef = useConfirm();
  return null;
}

function setup() {
  render(
    <ConfirmProvider>
      <Probe />
    </ConfirmProvider>
  );
}

afterEach(cleanup);

describe("useConfirm", () => {
  it("muestra título, mensaje y botones personalizados", async () => {
    setup();
    act(() => { confirmRef({ title: "¿Cerrar este reto?", message: "No se aceptarán más entregas.", confirmLabel: "Cerrar reto" }); });
    const dialog = await screen.findByRole("dialog");
    expect(dialog.getAttribute("aria-labelledby")).toBeTruthy();
    expect(screen.getByText("¿Cerrar este reto?")).toBeTruthy();
    expect(screen.getByText("No se aceptarán más entregas.")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Cerrar reto" })).toBeTruthy();
  });

  it("resuelve true al confirmar", async () => {
    setup();
    let promesa;
    act(() => { promesa = confirmRef({ confirmLabel: "Eliminar" }); });
    fireEvent.click(await screen.findByRole("button", { name: "Eliminar" }));
    await expect(promesa).resolves.toBe(true);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("resuelve false al cancelar", async () => {
    setup();
    let promesa;
    act(() => { promesa = confirmRef("¿Seguro?"); });
    fireEvent.click(await screen.findByRole("button", { name: "Cancelar" }));
    await expect(promesa).resolves.toBe(false);
  });

  it("resuelve false con la tecla Escape", async () => {
    setup();
    let promesa;
    act(() => { promesa = confirmRef("¿Seguro?"); });
    await screen.findByRole("dialog");
    fireEvent.keyDown(document, { key: "Escape" });
    await expect(promesa).resolves.toBe(false);
  });

  it("pone el foco inicial en Cancelar", async () => {
    setup();
    act(() => { confirmRef("¿Seguro?"); });
    const cancelar = await screen.findByRole("button", { name: "Cancelar" });
    await waitFor(() => expect(document.activeElement).toBe(cancelar));
  });
});
