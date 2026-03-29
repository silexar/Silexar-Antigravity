---
name: Testing
description: Guía completa para generar y ejecutar tests en Silexar Pulse — Vitest, React Testing Library, patrones DDD por capa
---

# 🧪 Testing Skill

Guía completa para generar, ejecutar y mantener tests de alta calidad en Silexar Pulse Antygravity.

## Stack de Testing

| Herramienta                     | Uso                              |
| ------------------------------- | -------------------------------- |
| **Vitest**                      | Test runner principal            |
| **@testing-library/react**      | Testing de componentes React     |
| **@testing-library/user-event** | Simulación de eventos de usuario |
| **jsdom**                       | Entorno DOM virtual              |
| **@vitest/coverage-v8**         | Cobertura de código              |
| **@vitest/ui**                  | UI interactiva de tests          |

## Comandos

```bash
# Ejecutar todos los tests
npm test

# Tests en modo watch
npm run test:watch

# Tests con cobertura
npm run test:coverage

# Tests con UI interactiva
npm run test:ui
```

## Convenciones del Proyecto

### Ubicación de Tests

- Tests se ubican en carpetas `__tests__/` junto al código que testean
- Archivos de test usan sufijo `.test.ts` o `.test.tsx`
- Ejemplo: `src/components/ui/__tests__/button.test.tsx`

### Naming

- Archivos: `nombre-componente.test.tsx` (kebab-case)
- Describe: nombre del componente/función
- It/test: descripción en español o inglés del comportamiento esperado

## Umbrales de Cobertura (vitest.config.ts)

| Scope                  | Branches | Functions | Lines | Statements |
| ---------------------- | -------- | --------- | ----- | ---------- |
| **Global**             | 80%      | 80%       | 80%   | 80%        |
| **src/components/ui/** | 90%      | 90%       | 90%   | 90%        |
| **src/hooks/**         | 95%      | 95%       | 95%   | 95%        |
| **src/lib/**           | 85%      | 85%       | 85%   | 85%        |

## Templates por Capa DDD

### Domain Entity Test

```typescript
// src/modules/<module>/domain/entities/__tests__/<Entity>.test.ts
import { describe, it, expect } from "vitest";
import { MiEntidad } from "../MiEntidad";

describe("MiEntidad", () => {
  const datosValidos = {
    id: "uuid-valido",
    nombre: "Test Entity",
    // ... propiedades requeridas
  };

  describe("create", () => {
    it("debe crear una entidad válida con datos correctos", () => {
      const entidad = MiEntidad.create(datosValidos);
      expect(entidad).toBeDefined();
      expect(entidad.id).toBe(datosValidos.id);
    });

    it("debe lanzar error con datos inválidos", () => {
      expect(() => MiEntidad.create({ ...datosValidos, nombre: "" })).toThrow();
    });
  });

  describe("business rules", () => {
    it("debe validar la regla de negocio X", () => {
      const entidad = MiEntidad.create(datosValidos);
      const resultado = entidad.ejecutarRegla();
      expect(resultado).toBe(true);
    });
  });
});
```

### Value Object Test

```typescript
// src/modules/<module>/domain/value-objects/__tests__/<VO>.test.ts
import { describe, it, expect } from "vitest";
import { MiValueObject } from "../MiValueObject";

describe("MiValueObject", () => {
  it("debe ser inmutable", () => {
    const vo1 = new MiValueObject("valor");
    const vo2 = new MiValueObject("valor");
    expect(vo1.equals(vo2)).toBe(true);
  });

  it("debe rechazar valores inválidos", () => {
    expect(() => new MiValueObject("")).toThrow();
  });
});
```

### Application Command/Query Test

```typescript
// src/modules/<module>/application/commands/__tests__/<Command>.test.ts
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MiCommand } from "../MiCommand";

describe("MiCommand", () => {
  let mockRepo: ReturnType<typeof crearMockRepo>;

  const crearMockRepo = () => ({
    save: vi.fn(),
    findById: vi.fn(),
    delete: vi.fn(),
  });

  beforeEach(() => {
    mockRepo = crearMockRepo();
    vi.clearAllMocks();
  });

  it("debe ejecutar el comando correctamente", async () => {
    mockRepo.findById.mockResolvedValue({ id: "1", nombre: "Test" });

    const handler = new MiCommand(mockRepo);
    const result = await handler.execute({ id: "1" });

    expect(result).toBeDefined();
    expect(mockRepo.findById).toHaveBeenCalledWith("1");
  });

  it("debe lanzar error si el recurso no existe", async () => {
    mockRepo.findById.mockResolvedValue(null);

    const handler = new MiCommand(mockRepo);
    await expect(handler.execute({ id: "inexistente" })).rejects.toThrow();
  });
});
```

### React Component Test

```typescript
// src/components/__tests__/<Component>.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MiComponente } from '../MiComponente';

describe('MiComponente', () => {
  it('debe renderizar correctamente', () => {
    render(<MiComponente titulo="Hola" />);
    expect(screen.getByText('Hola')).toBeInTheDocument();
  });

  it('debe manejar click correctamente', async () => {
    const user = userEvent.setup();
    const onClickMock = vi.fn();

    render(<MiComponente onClick={onClickMock} />);
    await user.click(screen.getByRole('button'));

    expect(onClickMock).toHaveBeenCalledOnce();
  });

  it('debe mostrar estado de carga', () => {
    render(<MiComponente isLoading />);
    expect(screen.getByText(/cargando/i)).toBeInTheDocument();
  });

  it('debe mostrar estado de error', () => {
    render(<MiComponente error="Error de red" />);
    expect(screen.getByText(/error de red/i)).toBeInTheDocument();
  });
});
```

### Hook Test

```typescript
// src/hooks/__tests__/<hook>.test.ts
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useMiHook } from "../useMiHook";

describe("useMiHook", () => {
  it("debe retornar valor inicial", () => {
    const { result } = renderHook(() => useMiHook());
    expect(result.current.valor).toBe(valorInicial);
  });

  it("debe actualizar estado correctamente", () => {
    const { result } = renderHook(() => useMiHook());

    act(() => {
      result.current.actualizar("nuevo valor");
    });

    expect(result.current.valor).toBe("nuevo valor");
  });
});
```

## Mocking Patterns

### Mock de localStorage

```typescript
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });
```

### Mock de fetch/API

```typescript
globalThis.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: () => Promise.resolve({ data: "mock" }),
});
```

### Mock de Zustand Store

```typescript
vi.mock("@/stores/miStore", () => ({
  useMiStore: () => ({
    items: [],
    addItem: vi.fn(),
    removeItem: vi.fn(),
  }),
}));
```

## Reglas

1. **Cada nuevo archivo de código DEBE tener su archivo de test correspondiente**
2. **Tests deben ser independientes** — no depender del orden de ejecución
3. **Usar factories** para datos de test — evitar datos hardcodeados repetidos
4. **Testear edge cases**: null, undefined, strings vacíos, arrays vacíos, números negativos
5. **Testear error paths**: qué pasa cuando falla la red, cuando el dato no existe, etc.
6. **No testear implementación interna** — testear el comportamiento público
