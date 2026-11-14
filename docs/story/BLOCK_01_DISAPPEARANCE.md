# Bloco 1 — O desaparecimento

Implementação jogável conforme `docs/assets/screenplay/section 1.md`.

## Início / fim

| | Condição |
|---|---|
| **Início** | Novo jogo → abertura `3 de novembro de 2026 — 08:42` → sala de Augusto, pendências iniciais, evidências `emergency_call_raw` + `mariana_phone` já no caso. |
| **Fim** | Flag `block01_hospital_done` → trigger `block01_end_block`: Rafael `identified`, `contact-rafael` + chat `chat-rafael-augusto` no celular de Augusto, `block01_complete`, pendências pós-bloco. |
| **Bloco 2** | Jogador na delegacia; pode abrir WhatsApp de Augusto e contatar Rafael (conversa vazia — não auto-iniciar). |

## Cenas / sistemas

- Abertura: `Block01Opening`
- Pasta / BO: `CaseFiles` → `doc-bo-inicial`, registro em `b5` → `registerInitialPoliceReport`
- Áudio: `AudioWorkbench` → `emergency_call_raw`, análise **ANÁLISE PROVISÓRIA**
- Celular Mariana: WhatsApp (Júlia, Camila, Rafael, …), Notas, Telefone (sem 08:03)
- Contradição: `contra_selective_memory` registrada **automaticamente** no caderno quando as duas evidências existem (aviso “CONTRADIÇÃO REGISTRADA”; sem formulário)
- Evidências chegam por cartão de papel persistente (`DiscoveryHost`); eventos de descoberta: `docs/gameplay/INVESTIGATION_FLOW.md`
- Hospital: mapa → `HospitalInterviewScene` (VN)
- Celular Augusto: Rafael desbloqueado ao fim

## Triggers (`seedStory.ts`)

| ID | Condição | Efeito |
|---|---|---|
| `block01_unlock_hospital` | `block01_contradiction_memory` | Hospital `visitAvailable` |
| `block01_complete_phone_task` | `block01_julia_memory` + `block01_rafael_memory` | Completa `task_mariana_phone` |
| `block01_end_block` | `block01_hospital_done` | Rafael, tarefas finais, `block01_complete` |

## Evidências (ids)

`initial_police_report`, `mariana_phone`, `emergency_call_raw`, `emergency_call_restored`, `call_history_gap`, `mariana_memory_lapses`, `rafael_call_memory`, `rafael_audio_reply`, `camila_witness_note`

(`julia_kept_folder` — LEGACY / OUTDATED; pasta da Júlia removida do canon atual.)

## Hipóteses

- `hyp_kidnapping` — BO / chamada / aparelho
- `hyp_memory` — Júlia / notas (pode ir a **Incerta** via contradição)
- `hyp_manipulation` — contradição de lapsos seletivos
- `hyp_own_investigation` — conversa Rafael

## Placeholders de puzzle

| Evidência | `puzzleMeta.puzzleId` | `implementation` |
|---|---|---|
| `emergency_call_raw` | `puzzle-01-emergency-call` | `placeholder` |
| `rafael_audio_reply` (catálogo) | `puzzle-02-rafael-reply` | `placeholder` |

Áudio gerado: `npm run audio:generate` → `public/assets/audio/*.wav`

## Personagens (bloco)

Augusto, Mariana, Júlia, Camila, Rafael, Paula, Fernanda, Diego — sem Nico/Elisa/etc. na UI.

## Locais

- `delegacia` — hub
- `hospital` — desbloqueado após contradição; background `public/assets/backgrounds/processed/hospital/hospital-02-corridor-chairs.jpg` (copiado de `assets/backgrounds/processed/…`)

## Pendências pós-bloco

Ver `block01EndTasks` em `seedStory.ts` (origem da chamada, gravação Rafael, etc.).

## Divergências técnicas

- Entrevista hospital condensada em tópicos VN (mesmo conteúdo do roteiro, menos linhas soltas).
- Sprites Júlia/Camila: paths previstos; se ausentes em `public/assets/sprites/`, retrato omitido (placeholder neutro).
- Rafael no fim: thread WhatsApp vazia em Augusto (contato disponível; Bloco 2 inicia a conversa).

## DEV

`DevStoryPanel` → checkpoints `dev-b01-*` via `block01DevCheckpoints.ts`.
