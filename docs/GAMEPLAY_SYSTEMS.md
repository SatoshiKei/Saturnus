# Gameplay systems (SATURNUS)

Hub principal: mesa do delegado (`src/scene/Scene.tsx`). Objetos com `hubTarget` abrem ferramentas ou telefones.

### Layout da sala

- Composição: `src/data/sceneComposition.ts` (1920×1080).
- Fundo: `public/assets/scene/hub-delegacia-bg.jpg` (tom institucional `police-02`, **não** o corredor corporativo antigo).
- Props interativos: fotos em `public/assets/scene/props/` (pastas, caderno, papéis, etc.).
- **Pendências** (canto inferior esquerdo): lista de tarefas de Augusto (`ObjectivesStrip`), não é um quadro na parede.
- Título no topo: contexto “Delegacia — sala de Augusto”.

## Store

- Estado global: `src/game/state/investigationStore.ts`
- Tipos: `src/game/types/index.ts`
- Persistência: `localStorage` chave `saturnus-investigation-v1`
- Menu: Novo jogo / Continuar (`MainMenuOverlay`)

## Story engine

- Triggers declarativos: `src/data/game/seedStory.ts`
- Avaliação: `src/game/story/engine.ts`
- Ações: `src/game/story/actions.ts`

Progresso via flags, evidências e relações — evite `storyStep` em componentes.

## Telefones

- **Mariana:** aparelho apreendido (`hubTarget: mariana-phone`)
- **Augusto:** celular profissional (`hubTarget: augusto-phone` no objeto `landline`)
- Apps visíveis: `src/lib/phoneApps.ts` + `assets/manifest` de apps em `seedApps.ts`

Ver `docs/PHONE_SYSTEM.md`.

## Dados mock

Substituível em `src/data/game/*` e mocks existentes (`mockChats`, etc.).
