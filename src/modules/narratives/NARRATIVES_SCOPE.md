# Narratives Module — Scope Definition

## Purpose

The **Narratives** module manages the multi-channel content distribution layer of Silexar Pulse.
It orchestrates how campaign content (cunas, mentions, sponsorships) is packaged and distributed
across channels: FM broadcast, digital streams, podcasts, and social media clips.

## Status: Phase 2 — Not yet implemented

This module is **intentionally deferred** to Phase 2 of the product roadmap (Silexar Pulse
Exchange — SPX). The core FM broadcast flow (Phases 1) does not require it.

## Planned Domain Entities

| Entity | Responsibility |
|--------|---------------|
| `Narrativa` | A structured content unit with channel routing rules |
| `CanalDistribucion` | Represents a target channel (FM, stream, podcast, social) |
| `ReglaDistribucion` | Business logic for when/where a narrative is pushed |
| `PaqueteContenido` | A bundle of cunas/assets ready for multi-channel export |

## Planned Integration Points

- **Campanas** → triggers narrative creation when campaign is approved
- **Cortex Flow** → orchestrates narrative routing via workflow engine
- **Cortex Creative** → generates social media clip variants from cuna audio
- **Cloudflare R2** → stores packaged content for distribution
- **Digital Analytics** → tracks cross-channel performance metrics

## When to implement

Implement when:
1. First pilot client requires multi-channel (beyond FM) distribution
2. Cortex Creative engine (currently stub) is activated
3. SPX marketplace phase begins

## File structure (future)

```
modules/narratives/
├── domain/
│   ├── entities/Narrativa.ts
│   ├── entities/CanalDistribucion.ts
│   ├── value-objects/EstadoNarrativa.ts
│   └── repositories/INarrativaRepository.ts
├── application/
│   ├── commands/CrearNarrativaCommand.ts
│   └── handlers/NarrativaCommandHandler.ts
├── infrastructure/
│   └── repositories/NarrativaDrizzleRepository.ts
└── presentation/
    └── controllers/NarrativaController.ts
```

---
*Scope defined: 2026-03-24*
*Implementation target: Phase 2 (post-pilot)*
