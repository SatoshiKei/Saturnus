# Bloco 2 — Duas trilhas

Fonte narrativa: `docs/assets/screenplay/section 2.md`.

## Entrada e saída

| | |
|---|---|
| **Entrada** | Estado final do Bloco 1: `block01_complete`, Rafael no WhatsApp de Augusto (`chat-rafael-augusto`), pendências `block01EndTasks`. |
| **Saída** | `block02_complete`, pendência **`task_locate_nico`**, hipótese própria **confirmada**, hipótese voluntária **ativa** (conflito com emergência). Desaparecimento e memória **sem resolução**. |

## Cenas

| Cena | Componente | Background |
|------|------------|------------|
| Vértice (Iara, Sandro, Caio, arquivo) | `VerticeInterviewScene.tsx` | `nightclub-01-lights-haze.jpg` |
| Entrevista Lucas | `LucasInterviewScene.tsx` | `university-03-classroom-empty.jpg` |

Mapa: visita Vértice via `LocationsMap` → `openLocationScene('vertice')`. Lucas via **Sistema de consulta → Pessoas → Entrevistar**.

## Personagens (Bloco 2)

- **Rafael** — encaminha áudio; não sabe Elisa/André/Nico.
- **Iara, Sandro, Caio** — Vértice; Nico só via arquivo.
- **Paula** — contato no celular de Mariana; indica Lucas.
- **Lucas** — Elisa, André, visita de Mariana.
- **Nico** — `identified` após arquivo; **não** `contactable`.
- **Elisa / André** — aparecem após busca policial pós-Lucas.

## Evidências

| ID | Origem |
|----|--------|
| `rafael_forward_from_mariana` | Reproduzir áudio no WhatsApp (Augusto × Rafael) |
| `rafael_recording_vertice_tag` | Análise provisória na bancada (`puzzle-03-rafael-forward` **placeholder**) |
| `mariana_vertice_visit` / `mariana_repeated_questions` | Tópico Iara (Vértice) |
| `nico_dj_identified` | Tópico arquivo (Vértice) |
| `paula_leads_lucas` | Abrir chat Paula (Augusto) |
| `lucas_knew_elisa` / `mariana_andre_innocence` | Fim entrevista Lucas |
| `elisa_case_summary` / `nico_elisa_witness` | Busca “Elisa” no terminal (após Lucas) |
| `mariana_rebuilding_elisa_case` | Convergência automática |

## Hipóteses (fim do bloco)

- **Sequestro** — ativa.
- **Memória** — incerta / enfraquecida (Bloco 1).
- **Manipulação externa** — ativa, pouco sustentada.
- **Investigação própria** — **fortemente sustentada** (`confirmed`).
- **Desaparecimento voluntário para provar inocência de André** — nova, plausível, conflito com chamada 190.

Sem percentuais na UI.

## Triggers (`seedStory.ts`)

| Trigger | Condição | Efeito |
|---------|----------|--------|
| `block02_start` | `block01_complete` | `block02_started` |
| `block02_unlock_paula` | `block01_complete` + `block01_note_quarta_read` | Contato/chat Paula no Augusto |

Handlers: `src/game/story/block02Handlers.ts`.

## Locais

- **`vertice`**: `unknown` → `visitAvailable` (análise áudio) → `visited` (sair da cena).

## Mídia

- `/assets/audio/rafael-forward-block02.wav` (degradado)
- `/assets/audio/rafael-forward-block02-restored.wav` (derivado pós-análise provisória)
- Gerados por `npm run audio:generate` — **substituir quando o puzzle definitivo existir**.

## Puzzle placeholder

Evidência `rafael_forward_from_mariana` com `puzzleMeta.implementation: 'placeholder'`. UI: `data-testid="rafael-forward-provisional-panel"`. Não implementa DSP avançado.

## Dependências lógicas

1. Vértice ← análise provisória do encaminhamento de Rafael.
2. Arquivo / Nico ← Iara + Sandro + Caio.
3. Paula ← nota “quarta” lida + Bloco 1 completo.
4. Lucas ← conversa Paula.
5. Busca Elisa ← entrevista Lucas concluída.
6. Convergência ← `nico_dj_identified` + `paula_leads_lucas` + hits Elisa/Nico.

Ordem parcial livre entre trilhas Rafael/Vértice e Paula quando pré-requisitos permitem.

## Checkpoints DEV

`src/game/story/block02DevCheckpoints.ts` — `dev-b02-start`, `dev-b02-after-rafael-audio`, `dev-b02-vertice-unlocked`, `dev-b02-nico-identified`, `dev-b02-after-paula`, `dev-b02-after-lucas`, `dev-b02-convergence`, `dev-b02-end`.

## Bloco 3 — ponto de entrada

Save com `block02_complete`, Nico **identificado mas não localizado**, perguntas abertas sobre o que Nico sabe e por que Mariana passou a defender André anos depois. Objetivo: **localizar Nico (testemunha Elisa)**.

## Divergências técnicas

Nenhuma alteração intencional ao roteiro em `section 2.md`. Retratos Vértice usam `iara.png`, `sandro.png` e `caio.png`.
