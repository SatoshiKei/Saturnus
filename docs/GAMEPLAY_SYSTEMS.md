# Gameplay systems (SATURNUS)

Hub principal: mesa do delegado (`src/scene/Scene.tsx`). Objetos com `hubTarget` abrem a interface correspondente.
A parte visual (cena, tokens, painéis) está descrita em [`docs/UI_VISUAL_SYSTEM.md`](UI_VISUAL_SYSTEM.md).

### Layout da sala

- Cena fixa 16:9 (1920×1080) com letterbox; composição em `src/data/sceneComposition.ts`.
- Fundo: `public/assets/scene/hub-office-bg.jpg` (foto filtrada, original preservado em `assets/backgrounds/raw/police/`).
- Objetos: PNGs transparentes em `public/assets/scene/hub/`. Smartphones são desenhados em CSS (`PhoneObject`).
- **Pendências**: bloco de notas de Augusto (`CaseNotepad`), aba pequena no canto e folha lateral ao abrir. Não há texto permanente de instrução nem título de local.
- Mapeamento objeto → sistema (nunca reutilizar a interface errada):

| Objeto | `hubTarget` | Interface |
|---|---|---|
| Celular de Mariana | `mariana-phone` | `PhoneShell` (aparelho `mariana`) |
| Celular de Augusto | `augusto-phone` | `PhoneShell` (aparelho `augusto`) |
| Telefone fixo | `landline` | `PoliceLandline` (chamadas, ramais, registro — não é smartphone) |
| Monitor | `computer` | `PoliceComputer` |
| Caderno | `casebook` | `InvestigationNotebook` |
| Pasta | `case-files` | `CaseFiles` |
| Bancada de áudio | `audio-lab` | `AudioWorkbench` |
| Mapa na parede | `map` | `LocationsMap` (locais desconhecidos não aparecem) |

## Store

- Estado global: `src/game/state/investigationStore.ts`
- Tipos: `src/game/types/index.ts`
- Persistência: `localStorage` chave `saturnus-investigation-v1`
- Menu: tela de título com Continuar / Novo jogo (`MainMenuOverlay`)
- Estado só de interface (menu aberto, dicas já vistas): `src/app/uiStore.ts`, fora do save

## Story engine

- Triggers declarativos: `src/data/game/seedStory.ts`
- Avaliação: `src/game/story/engine.ts`
- Ações: `src/game/story/actions.ts`

Progresso via flags, evidências e relações — evite `storyStep` em componentes.

## Telefones

- **Mariana:** aparelho apreendido (`hubTarget: mariana-phone`)
- **Augusto:** celular profissional (`hubTarget: augusto-phone`, objeto próprio `augusto-phone`)
- **Telefone fixo:** objeto `landline`, interface própria (`PoliceLandline`)
- Apps visíveis: `src/lib/phoneApps.ts` + `assets/manifest` de apps em `seedApps.ts`

Ver `docs/PHONE_SYSTEM.md`.

## Dados mock

Substituível em `src/data/game/*` e mocks existentes (`mockChats`, etc.).
