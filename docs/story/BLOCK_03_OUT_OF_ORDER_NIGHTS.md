# Bloco 3 — Noites fora de ordem

Implementação jogável a partir do estado final real do Bloco 2 (`docs/story/BLOCK_02_TWO_PATHS.md`).

## Entrada e saída

| | |
|---|---|
| **Entrada** | `block02_complete`, pendência `task_locate_nico`, Nico `identified` (não localizado), convergência Vértice/Paula–Lucas, Mariana reconstruía o caso Elisa. |
| **Saída** | `block03_complete`, pendência **`task_identify_morsa`**, Morsa como apelido sem identidade, Samuel `identified` (pista), duas linhas (Elisa × Maralto) sem vínculo documental. |

## Cenas

| Cena | Componente | Background |
|------|------------|------------|
| Entrevista Nico | `NicoInterviewScene.tsx` | `nightclub-01-lights-haze.jpg` (reuso) |
| Arquivo Lívia | `LiviaInterviewScene.tsx` | `university-03-classroom-empty.jpg` (reuso) |

Abertura: **Sistema de consulta → Pessoas → Entrevistar** (Nico / Lívia), após localização via busca.

## Personagens

- **Nico** — localizado por cruzamento cadastro × arquivos do Vértice; defensivo; entrega duas gravações.
- **Lívia Serrano** — jornalista; fonte documental; não soluciona a trama.
- **Morsa** — apelido / mascarado; só após Puzzle 5.
- **Samuel** — identificado como pista; **sem entrevista** neste bloco.

## Pesquisas (`seedSearchRules`)

| Regra | Flag | Termos | Evidências |
|-------|------|--------|------------|
| `block03_nico_cadastro` | `block03_nico_search_unlocked` | `nico` | `nico_current_record` |
| `block03_maralto_public` | `block03_maralto_search_unlocked` | `maralto` | `maralto_public_record`, `livia_sought_by_mariana` |
| `block03_maralto_elisa_cross` | `block03_maralto_researched` | `maralto` + `elisa` | `maralto_no_elisa_link` |
| `block03_livia_contact` | `block03_livia_search_unlocked` | `livia` | `livia_contact_record` |

## Evidências (ids)

`nico_current_record`, `nico_mariana_visit`, `mariana_night_x_focus`, `nico_recording_booth`, `nico_recording_portable`, `vertice_clocks_unsynced`, `vertice_timeline_inconsistent`, `mariana_revising_elisa_chronology`, `mariana_maralto_recording`, `mariana_investigating_protests`, `maralto_public_record`, `maralto_no_elisa_link`, `livia_sought_by_mariana`, `livia_contact_record`, `livia_radio_archive_raw`, `protest_records_incomplete`, `protest_masked_core`, `morsa_unidentified`, `samuel_protest_lead`

## Hipóteses

| ID | Estado ao fim |
|----|---------------|
| `hyp_kidnapping` | ativa |
| `hyp_memory` | sem resolução (incerta desde B1) |
| `hyp_manipulation` | ativa, pouco sustentada |
| `hyp_own_investigation` | confirmada (B2) + reforçada |
| `hyp_voluntary_disappearance` | ativa, mais complicada pela linha Maralto |
| `hyp_andre_imprecise_chronology` | nova, limitada (não inocenta) |
| `hyp_maralto_disappearance` | nova, plausível não comprovada |
| `hyp_elisa_maralto_open` | pergunta em aberto |

## Triggers

| ID | Condição | Efeito |
|----|----------|--------|
| `block03_start` | `block02_complete` | `block03_started`, `block03_nico_search_unlocked` |

Handlers: `src/game/story/block03Handlers.ts`.

## Dependências

1. Busca Nico ← fim Bloco 2 + identificação no Vértice.
2. Entrevista Nico ← localizado/contactable.
3. Janus ← entrevista (duas gravações).
4. Reanálise celular Mariana ← Puzzle 4.
5. Maralto ← gravação `REC_1102.m4a`.
6. Lívia ← pesquisa Maralto.
7. Saturnalia ← material de Lívia.
8. Morsa / Samuel ← Puzzle 5.

## Puzzle 4 — Janus / Epimetheus

- **Conceito:** duas sequências trocam a posição temporal aparente até alinhamento por âncoras acústicas.
- **Futuro:** waveform, cross-correlation, offset.
- **Placeholder:** `data-testid="janus-provisional-panel"` + `janus-provisional-sync` → `runProvisionalJanusSync`.
- **Resultado:** `vertice_timeline_inconsistent` (inconsistência ≠ inocência).

## Puzzle 5 — Saturnalia

- **Conceito:** ordem invertida dentro de batches de um buffer circular.
- **Futuro:** agrupar batches, inverter internos, concatenar.
- **Placeholder:** `saturnalia-provisional-panel` + `saturnalia-provisional-rebuild` → `runProvisionalSaturnaliaReconstruct`.
- **Resultado:** núcleo mascarado + apelido Morsa + pista Samuel.

## Mídia

Gerada por `npm run audio:generate`:

- `nico-booth-night-x.wav`, `nico-portable-night-x.wav`, `nico-sync-session-note.wav`
- `mariana-maralto-clip.wav`
- `livia-radio-archive-raw.wav`, `livia-radio-reconstructed.wav`

## Checkpoints DEV

`block03DevCheckpoints.ts` — `dev-b03-start` … `dev-b03-end`.

## Bloco 4 — ponto de entrada

Save com `block03_complete`, objetivo **descobrir quem era Morsa e por que Mariana investigava os protestos**; Samuel como primeira pista concreta — **sem** entrevista resolutiva neste bloco.

## Divergências técnicas

- Fundos de Nico/Lívia reutilizam backgrounds já processados (sem novos crops).
- Cruzamento Maralto×Elisa é opcional via busca; se o jogador não cruzar, o Puzzle 5 ainda registra `maralto_no_elisa_link` para garantir o estado final obrigatório.
- Reanálise Maralto: arquivo só aparece em Arquivos (Mariana) após Janus — não era listado antes (evita spoiler); justificado como filtro de “gravações recentes” pós-contradição.
- Ação `markTriggersFired` evita que checkpoints DEV disparem `block01_end_block` e sobrescrevam `task_locate_nico`.
