import { describe, it, expect } from "vitest";
import {
  ROLES,
  normalizeRole,
  getPermissionsForRole,
  tienePermiso,
  tieneTodosLosPermisos,
  tieneAlgunPermiso,
} from "./roleMatrix";
import { PERMISSIONS } from "./permissions";

describe("normalizeRole", () => {
  it.each([
    ["superadmin", ROLES.SUPERADMIN],
    ["Administrador", ROLES.ADMIN],
    ["admin", ROLES.ADMIN],
    [" docente ", ROLES.DOCENTE],
    ["padre/tutor", ROLES.PADRE],
    ["tutor", ROLES.PADRE],
  ])("convierte %s en %s", (input, esperado) => {
    expect(normalizeRole(input)).toBe(esperado);
  });

  it("devuelve null sin rol", () => {
    expect(normalizeRole(undefined)).toBeNull();
    expect(normalizeRole("")).toBeNull();
  });
});

describe("getPermissionsForRole", () => {
  it("superadmin tiene todos los permisos", () => {
    expect(getPermissionsForRole("superadmin")).toEqual(Object.values(PERMISSIONS));
  });

  it("administrador gestiona usuarios y, desde el panel del colegio, retos, módulos, foros y eventos", () => {
    const perms = getPermissionsForRole("administrador");
    expect(perms).toContain(PERMISSIONS.MANAGE_USERS);
    expect(perms).toContain(PERMISSIONS.VIEW_REPORTS);
    expect(perms).toContain(PERMISSIONS.MANAGE_TASKS);
    expect(perms).toContain(PERMISSIONS.MANAGE_MODULES);
    expect(perms).toContain(PERMISSIONS.CREATE_FORO);
    expect(perms).toContain(PERMISSIONS.CREATE_EVENTS);
    expect(perms).not.toContain(PERMISSIONS.MANAGE_FAMILY_PROFILES);
  });

  it("docente gestiona retos y califica entregas pero no gestiona usuarios", () => {
    const perms = getPermissionsForRole("docente");
    expect(perms).toContain(PERMISSIONS.MANAGE_TASKS);
    expect(perms).toContain(PERMISSIONS.GRADE_ENTREGAS);
    expect(perms).not.toContain(PERMISSIONS.MANAGE_USERS);
    expect(perms).not.toContain(PERMISSIONS.MANAGE_INSTITUTIONS);
  });

  it("padre entrega retos pero no crea cursos ni los califica", () => {
    const perms = getPermissionsForRole("padre/tutor");
    expect(perms).toContain(PERMISSIONS.VIEW_COURSES);
    expect(perms).toContain(PERMISSIONS.SUBMIT_ENTREGA);
    expect(perms).not.toContain(PERMISSIONS.CREATE_COURSES);
    expect(perms).not.toContain(PERMISSIONS.GRADE_ENTREGAS);
    expect(perms).not.toContain(PERMISSIONS.VIEW_COURSE_PARTICIPANTS);
  });

  it("un rol desconocido no tiene permisos", () => {
    expect(getPermissionsForRole("invitado")).toEqual([]);
  });
});

describe("helpers de permisos", () => {
  it("tienePermiso", () => {
    expect(tienePermiso("docente", PERMISSIONS.CREATE_COURSES)).toBe(true);
    expect(tienePermiso("padre", PERMISSIONS.CREATE_COURSES)).toBe(false);
  });

  it("tieneTodosLosPermisos y tieneAlgunPermiso", () => {
    const pedidos = [PERMISSIONS.VIEW_TASKS, PERMISSIONS.MANAGE_TASKS];
    expect(tieneTodosLosPermisos("docente", pedidos)).toBe(true);
    expect(tieneTodosLosPermisos("padre", pedidos)).toBe(false);
    expect(tieneAlgunPermiso("padre", pedidos)).toBe(true);
    expect(tieneAlgunPermiso("invitado", pedidos)).toBe(false);
  });
});
