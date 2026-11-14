# SATURNUS — auditoria semântica (canon vs runtime)

Data original: 2026-11-13.  
Atualização (rodada de correção): 2026-11-13 / 2026-11-14.  
Princípio: **o canon / intenção aprovada é a régua**.  
Referência histórica: `docs/audits/SATURNUS_FULL_GAME_AUDIT.md` (não apagada).

## Status desta rodada

| Código | Item | Status |
|---|---|---|
| D-P02-LABEL | Nomenclatura P02 (não fluxo) | **FIXED** |
| D-P03-LABEL | Proveniência P03 (Vértice→Augusto) | **FIXED** |
| D-P03-DESIGN | Mecânica multimídia vs 4 candidatos | **PENDING ASSET** (`P03_SECOND_TRACK_REQUIRED`) |
| D-P04-NIGHTX | Dataset temporal Noite X | **FIXED** (dataset + testes; UI P04 não virou timeline) |
| D-LUCAS | Evidence Lucas testemunho vs interpretação | **FIXED** |
| D-B5-REFL | `onPathReflectionDone` auto-done | **FIXED** |
| D-P08-SPEECH | Residual antes de Recovered Speech | **FIXED** |
| D-P09-P12 | Artifact runtime obrigatório região D | **FIXED** |
| D-P11-ID | Rename `police_clock_drift_logs` | **FIXED** → `rui_police_approach_records` |
| D-JULIA | Pasta Júlia em docs canônicos | **FIXED** (legado marcado) |
| P02_SEG_CABINE_OPTIONAL | seg_cabine opcional | **PENDING** (LOW — comportamento mantido) |
| P01 / P10 / P12 play | Percepção / visual | **PENDING PLAYTHROUGH** |

---

## Classificação global (pós-correção)

| Status | Puzzles (aprox.) |
|---|---|
| ALIGNED / FIXED | P01*, P02 labels, P03 provenance, P04 dataset, P05–P07, P08 chain, P09→P12 artifact, P10*, P11 ID, P12* |
| PENDING ASSET | P03 design (arquitetura OK; falta Faixa B distinta) |
| PENDING PLAYTHROUGH | P01 acústico; P10/P12 visual |

\*Ressalvas de playthrough.

---

## Matriz semântica dos 12 puzzles (atualizada)

| Puzzle | Material | Original owner | Delivered by | Channel | Why analyzes | Player action | Technical result | Narrative result | Next lead | Runtime aligned? |
|---|---|---|---|---|---|---|---|---|---|---|
| 01 Cassini | EMG_0803 | Central / caso | BO / pasta do caso | case-file → bancada | Ligação no BO | Process/notch/noise/listen → 5 fragments | Speech recovered | Lapsos / medo | Celular / contradição | ALIGNED* |
| 02 Iapetus | Rafael falando | Rafael | Rafael | WhatsApp Augusto | Áudio de Rafael (análise prévia) | Rebuild Ogg + recovered speech | “gravado no Vértice” | Ir ao Vértice | Vértice | **FIXED** (rótulos) |
| 03 Anéis | REC_VTX_OLD_01 | Arquivo Vértice | Staff / arquivo no local | visita → evidence | Material novo no local | Fingerprint A/B → archive A→B → abrir set | Sessão → Nico | Nico identificado | Buscar Nico | Proveniência FIXED; design **PENDING ASSET** |
| 04 Janus | Phone + desk Noite X | Nico / casa | Nico entrevista | bancada | Inconsistência horária | Align +450s → 01:23:30 | Clocks unsynced | Sandra ≠ Elisa 1º avist. | Reabrir cronologia | Dataset **FIXED**; playthrough TBD |
| 05 Saturnalia | Logger Lívia | Lívia / Maralto | Lívia | visita → áudio | Arquivo radio | Reordenar 10 slots | Reportagem + Morsa | Protestos / Morsa | Ocorrência → Samuel | ALIGNED |
| 06 Hexágono | 6 UNK | Anônimo | Ligação fixo | bancada + diário | Áudios anônimos | Spec → romanos → PIN diário | PIN 481526 | Diário | Diário / desconhecido | ALIGNED |
| 07 Luas Pastoras | RF intercept | Polícia / Válter | Caso / Miro trail | bancada | Interceptação | Waterfall → Extract B | G17N + 23:40 | Galpão 17 | Operação → Miro | ALIGNED |
| 08 Enceladus | AUD_0008 | Anônimo | WhatsApp → import | bancada | Burst hospitalar | Cycles → Difference → ouvir residual | Residual → “Ricardo” | Nome Ricardo | Júlia → Renata | **FIXED** |
| 09 Cassini-Huygens | PCAP Henrique | TI / ticket | Cecília → dump | bancada | Captura RTP | Filter SSRC → Reconstruct | Streams A/B + artifact | Omitido / sistema | Bloco 8 / P12 | ALIGNED |
| 10 Ordem Anéis | Bundle protestos | Lívia + CFTV | Caso | bancada (RingsSession) | Percurso Morsa | Fingerprint → DVR → CAM11 | André revelado | morsa_was_andre | Confrontar André | ALIGNED* |
| 11 Rotação | Bundle institucional | CAD/AVL/trem | Caso pós-Rui | bancada (RotationSession) | Abordagem / colisão | Train fingerprint → VTR-14 | Callsign | Escala Augusto | Augusto ligado | **FIXED** (ID) |
| 12 Memória | Final message | Composição | Claim recente | bancada (MemorySession) | Mensagem “Mariana” | Search Case Media | 4 proveniências | MEMÓRIA | Fim | **FIXED** (artifact) |

---

## P02 — status FIXED (nomenclatura)

- ID: `rafael_voice_to_augusto` (alias save: `rafael_forward_from_mariana`)
- Título/descrição: áudio de Rafael para Augusto — análise prévia; não encaminhamento da balada
- Asset / WhatsApp / lead Vértice: inalterados
- `P02_SEG_CABINE_OPTIONAL` — LOW; completion não depende de `seg_cabine`

---

## P03 — proveniência FIXED

Canon: Rafael aponta Vértice → Augusto no Vértice → **novo** arquivo histórico → Bancada → P03 → Nico.

- `rec_vtx_old_01`: `sourceType: location-archive`; cadeia Vértice → Augusto
- Metadata sessão / tutorial / walkthroughs: sem Rafael/WhatsApp
- Aquisição: `finishVerticeArchive`
- Teste: `tests/unit/semanticProvenanceP02P03.audit.test.ts`

---

## P03 — DESIGN = PENDING ASSET (2026-11-14)

Arquitetura Fingerprint Search + arquivo A→B: **preservada**.  
Conteúdo musical A≠B: **não cumprido** → `P03_SECOND_TRACK_REQUIRED`.

**NÃO FIXED** enquanto A e B forem a mesma fonte / stretch / BPM variants.

| Campo | Valor |
|---|---|
| Source A | `src/assets/audios/p3/Give-Me-Everything-Tonight-Hardtekk-The-Dark-Triad-Song.mp3` |
| Source B | **null** — ausente |
| Inventário p3/ | só essa música + `DJ - Vértice.mp3` + `club-crowd.mp3` |
| Master atual | `public/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3` (ainda 1 música) |

**Proibido:** sintetizar, remixar, stretch da mesma faixa, escolher Capangas/Valter ou outra cena por gosto.

Quando B aprovado existir: rebuild do master com A→MIC→B reais; fingerprints distintos; então `D-P03-DESIGN = FIXED`.

Módulo: `src/forensic/puzzles/puzzle03Fingerprint.ts` (`PUZZLE03_MUSIC_SOURCES`)  
Testes: `tests/unit/puzzle03Anels.test.ts` (`puzzle03TracksMustUseDistinctSources`)

---

## P04 — timeline FIXED (dataset)

Fonte única: `src/data/block03/noiteXChronology.ts`

- Âncoras: Vertice `01:16:00` ≡ real `01:23:30` (+450 s)
- Sandra ~01:16 real ≠ saída Elisa 01:23:30
- Eventos sem número canônico: `UNSPECIFIED` / `interval`
- UI do P04 **não** foi transformada em timeline automática
- Testes: `tests/unit/noiteXChronology.test.ts`

---

## Demais FIXED nesta rodada

- **Lucas:** `mariana_andre_innocence` → título/descrição testemunho vs interpretação
- **B5 reflections:** path done não grava maralto/coincidence done
- **P08:** Difference cria residual sem speech; speech attach após play; Recovered Speech após listen
- **P09→P12:** região D exige `forensicDerivedArtifacts['cassini-stream-b']`; sem fallback narrativo de `puzzle12Meta.json`
- **P11:** `rui_police_approach_records` (+ migrate alias)
- **Julia folder:** docs ativos limpos; transcripts/screenplay marcados LEGACY/OUTDATED

---

## Pendências remanescentes

| ID | Severidade | Notas |
|---|---|---|
| `P03_SECOND_TRACK_REQUIRED` | HIGH | Faixa B aprovada ausente; D-P03-DESIGN = PENDING ASSET |
| `P02_SEG_CABINE_OPTIONAL` | LOW | Manter opcional até decisão |
| P01 / P10 / P12 play | — | PENDING PLAYTHROUGH |

---

## Histórico

Esta atualização **não apaga** os achados da auditoria de 2026-11-13; marca o que foi corrigido na rodada de decisões humanas. Detalhe histórico continua em `SATURNUS_FULL_GAME_AUDIT.md` + secção de follow-up abaixo nesse arquivo.
