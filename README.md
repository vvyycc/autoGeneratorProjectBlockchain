# sale-factory-studio

Monorepo con pnpm workspaces para web, API, Hardhat y paquetes compartidos.

## Estructura

```
apps/
  web/        # Next.js + Tailwind
  api/        # Node.js + Express
  hardhat/    # Hardhat + TS
packages/
  shared/     # Tipos + esquemas Zod
/data         # Storage local
```

## Comandos

```bash
pnpm install

# Desarrollo (web + api)
pnpm dev

# Lint y build en todos los paquetes
pnpm lint
pnpm build
```

## Notas

- Alias de TS: `@sale-factory/shared` está configurado en `tsconfig.base.json` y consumido en `apps/web` y `apps/api`.
- API expone `/health` en `http://localhost:4000/health`.
