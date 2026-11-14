# UX + DEV Stabilization — 2026-11-14

Rodada de UX e infraestrutura de playtest. **Sem alteração de roteiro, diálogos, ordem narrativa, soluções de puzzles ou assets narrativos novos.**

---

## Componentes alterados (resumo)

| Área | Principais arquivos |
|---|---|
| Bancada | `ForensicWorkbench.tsx`, `Transport.tsx`, `SegmentMonitor.tsx`, `opaqueSegmentId.ts`, `forensic-workbench.css`, `puzzle01Cassini.ts`, `build_puzzle01.py` |
| Caderno | `CasebookPanel.tsx`, `CasebookFilterBar.tsx`, `personPortraits.ts`, `game-ui.css` |
| Celular | `AppIcon.tsx`, `UiGlyph.tsx`, `PhotosApp.tsx`, `phoneMedia.ts`, `phone.css`, `device-apps.css` |
| Quadro | `LinkBoard.tsx`, `LinkBoardCanvas.tsx`, `LinkBoardThumbnail.tsx`, `boardTransform.ts`, `boardLayout.ts`, `SceneObject.tsx` |
| Scroll Up | `vnSceneHistory.tsx`, `VNSceneShell.tsx`, `VisualNovelDialog.tsx` |
| DEV | `canonicalPuzzleCompletion.ts`, `DevPuzzleToolbar.tsx`, `canonicalStoryManifest.ts`, `DevStoryPanel.tsx` |

---

## P01 behavior

### Segment IDs
- Internos preservados (`seg_lembro`, …) para save/compat.
- Player-facing: `opaqueSegmentLabel(id)` → `SEG_XXXX-XXXXX` determinístico.
- Monitor / DEV clarity **nunca** mostram texto da fala.

### Notch ~1700 Hz
- Pode tornar a região **intelligible** (feedback `x/y` → `✓`).
- **Não** adiciona `EU NÃO LEMBRO` a Recovered Speech.
- Recovered Speech exige: inteligível → playback/listen (hold) → `recoveredSpeech`.

### Fases internas
`signal_candidate` → `processable` → `intelligible` → `heard` → `recoveredSpeech`

### Áudio “eu não lembro”
- Runtime: `gainDb` do clip ↓, tom/debris ↑ sob ~38.5 s.
- `tools/audio/build_puzzle01.py` atualizado (target dBFS, tone, noise, bursts, junk).
- **Rebuild WAV não executado nesta máquina** (clips fonte `src/assets/audios/p1/` ausentes no path esperado). Pendência: regenerar `p01_corrupted_base` quando os masters estiverem disponíveis.

---

## Bancada layout

- Timeline permanece foco (`.fw-main` flex).
- Transporte associado à timeline: Play grande (`fw-icon-btn--play`), Stop, tempo, seek, rate.
- `SegmentMonitor` / analysis log scrollável sob o transporte (não rouba altura da timeline além do bloco fixo).
- Inspector com scroll interno e Recovered Speech mais legível.

---

## Caderno

- Evidências / Pessoas / Locais / Contradições → grid de cards (padrão Hipóteses).
- Timeline permanece timeline.
- Filtros Tudo/Fontes/Fatos: **mantidos**, compactos no header, só quando há ambas as classes.

### MISSING_PERSON_PORTRAIT
`diego`, `fernanda`, `marcelo`, `morsa`, `valter`, `henrique`, `mauro`, `denis`, `omitido`, `roberto`  
(export em `src/lib/personPortraits.ts`)

---

## Celulares

- Ícones Telefone/Mapas em SVG limpo.
- Home: proporções, dock, safe areas, home indicator.
- Scroll estrutural (`min-height: 0`, overflow nos containers certos).
- Photos: grid 3 colunas, viewer `contain`, sem overlay de texto estranho.
- Catálogos separados; removido `MARIANA_EXTRA` que vazava hub-office para Mariana.

---

## Quadro

- Miniatura no hub: mesmo `buildLinkBoard(inv)` com `interactive=false` / `scale=thumbnail`.
- Zoom focal: `zoomAtPoint` em `boardTransform.ts` (pointer board-coord estável).
- Clusters nas âncoras pedidas (Maralto / Mariana / Elisa / Henrique / Guardrail / Augusto).
- Progressão via `showWhen`/`hideWhen` intacta.

---

## Scroll Up

- Buffer append-only por `VNSceneShell`.
- Contém todas as linhas já vistas da cena (speaker, texto, escolha).
- Abrir/fechar não avança diálogo.
- Nova cena → novo buffer.

---

## DEV puzzle skip

- Botão `DEV · COMPLETE PUZZLE` (P10: `SKIP CUTSCENE` + variantes reveal).
- `applyCanonicalPuzzleCompletion` / `devCompletePuzzle` — P01–P12.
- Prefere handlers reais; P03 com `devBypass` enquanto `P03_SECOND_TRACK_REQUIRED`.
- P09 gera `forensicDerivedArtifacts['cassini-stream-b']` canónico.

## DEV Story

- `canonicalStoryManifest.ts`: 89 checkpoints (IDs existentes).
- Rebuild from initial state → replay canonical actions → restore pipeline.
- Sem leakage futuro em jump back/forward.

---

## Testes (principais)

- `opaqueSegmentId.test.ts`, updates em `forensicWorkbench.test.tsx`
- `casebookCards.test.tsx`, `phonePhotos.test.tsx`
- `boardTransform.test.ts`, `linkBoardLayout.test.tsx`
- `vnSceneHistory.test.tsx`
- `devPuzzleCompletion.test.ts`, `canonicalStoryManifest.test.ts`

---

## Pendências

| ID | Notas |
|---|---|
| `P01_CORRUPTED_BASE_REBUILD` | Script atualizado; WAV baked não regenerado (fontes p1 ausentes no path) |
| `P03_SECOND_TRACK_REQUIRED` | Design PENDING ASSET; DEV complete usa `devBypass` |
| `MISSING_PERSON_PORTRAIT` | 10 ids sem sprite |
| Eyeball board miniature | Conferir escala/posição no cork no hub |
| Photo dates | Dataset sem datas; viewer mostra nome/folder |
