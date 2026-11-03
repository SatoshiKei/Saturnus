# Sistema visual de SATURNUS

Direção: jogo narrativo de investigação (point-and-click / visual novel), interface **diegética**: o jogador clica
em objetos da mesa e eles abrem a sua própria interface. Nada de modais brancos centralizados.

## Cena

- `src/scene/Scene.tsx`: quadro fixo 1920×1080 escalado por `computeSceneScale` (letterbox em outras proporções).
  `--u` (escala do quadro) fica disponível em CSS; HUD e painéis vivem **dentro** do quadro.
- Câmera: objetos com `focusZoom` aproximam a câmera (~280 ms) antes de abrir o painel.
- Fundo: foto real filtrada (`scripts/build-hub-bg.mjs`: dessaturação, contraste, leve perda de nitidez, grain, vinheta,
  temperatura fria). Original em `assets/backgrounds/raw/police/police-05-chief-office.jpg`.
- Luz e integração: luz de teto, sombras para baixo-direita, objetos “deitados” levemente achatados (~55°),
  camada comum de grain + vinheta por cima de fundo e objetos (`.scene-stage::after`).
- Objetos: `scripts/build-hub-objects.mjs` (PNG com transparência real, sombra de contato assada).
  Para trocar por recortes fotográficos, mantenha nome e dimensões.
- Hover: sem contorno retangular — brilho leve + sombra âmbar no próprio objeto, cursor e legenda pequena.
  Dicas de primeira vez: legendas por ~7 s na primeira partida (`uiStore`), nunca texto fixo na tela.

## Tokens (`src/styles/tokens.css`)

Carvão, preto azulado, cinza institucional, marrom, papel envelhecido, âmbar discreto e azul-petróleo.
Sem branco puro, sem azul padrão e sem verde de dashboard. Animações de 100–250 ms.

## Componentes

| Componente | Arquivo | Observações |
|---|---|---|
| `GamePanel` | `src/components/ui/GamePanel.tsx` | Base de todos os painéis. Variantes: `paper`, `terminal`, `workbench`, `console`, `map`. Fecha com ESC, véu ou botão. |
| `PoliceComputer` | `panels/PoliceComputerPanel.tsx` | Terminal com barra superior e menu CASO / PESSOAS / VEÍCULOS / ARQUIVOS / BUSCA. |
| `InvestigationNotebook` | `panels/CasebookPanel.tsx` | Abas Pessoas / Evidências / Locais / Timeline / Hipóteses / Contradições; rótulos em português (`src/lib/labels.ts`). |
| `CaseFiles` | `panels/CaseFilesPanel.tsx` | Pasta manila com fichas de documentos e folha de leitura. |
| `AudioWorkbench` | `panels/AudioLabPanel.tsx` | Arquivos, forma de onda, play, módulos de análise (`seedAnalysisModules`). |
| `PoliceLandline` | `panels/PoliceLandlinePanel.tsx` | Telefone fixo institucional. |
| `LocationsMap` | `panels/LocationsPanel.tsx` | Mapa com pinos; card com VISITAR e pessoas relacionadas. |
| `CaseNotepad` | `components/investigation/CaseNotepad.tsx` | Pendências de Augusto: aba pequena / folha lateral “CASO MARIANA SILVA”. |
| `PhoneShell` / `PhoneObject` | `src/phone/` | Smartphone fino, sem logotipo; dois aparelhos distintos (`data-device`). |

CSS: `tokens.css`, `scene.css`, `game-ui.css`, `phone.css`, `device-apps.css`, `investigation.css` (título, aviso, ferramentas dev).

## Testes e capturas

- `npm test` (unitários), `npm run build`, `npm run test:e2e` (fluxo + `visual.spec.ts`).
- `tests/e2e/visual.spec.ts`: 1920×1080, 1600×900 e 1366×768; confere que objetos e painéis ficam dentro do quadro e salva
  capturas em `artifacts/ui/<resolução>/`.
- `node scripts/capture-ui.mjs [url] [saída] [resoluções]`: capturas mais ricas (dev server), usadas em `docs/assets/ui-refactor/`.
- `node scripts/audit-assets.mjs`: regenera `docs/assets/ui-asset-audit.md`.
- Antes/depois: `docs/assets/ui-refactor/before-*.png` e `docs/assets/ui-refactor/<resolução>/`.

## Limitações atuais

- Objetos da mesa são ilustrações vetoriais (placeholders honestos), não recortes fotográficos.
- O fundo é um escritório institucional genérico, não uma delegacia brasileira identificável.
- Visitas a locais ainda não abrem cenas (o botão informa a indisponibilidade).
