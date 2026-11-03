# Evidence model

Catálogo inicial: `src/data/game/seedEvidence.ts`. Posse do jogador: `evidenceOwned[]` na store.

Campos importantes:

- `sourceType` / `sourceId` — proveniência
- `originalOrDerived` — original vs derivada (ex.: WaveLab)
- `exportable` / `deviceLocked` / `requiredAppId` — mídia presa ao aparelho

Extrair de documentos: blocos em `seedDocuments.ts` com `extractAction` / `extractableEvidenceId`.
