# Bloco 5 — O percurso deixado

## Estado de entrada

Após o fim real do Bloco 4 (`block04_complete`):

- Mariana investigava Elisa e protestos/Maralto
- Nico testemunhou; Morsa existiu (não identificado)
- Mariana procurou Samuel e André; André provavelmente não é o interlocutor
- Diário oculto: medo genuíno + contradições sobre Júlia
- Interlocutor desconhecido; hipótese de interferência na memória em aberto

Trigger `block05_start`: `block05_started` + Titã `visitAvailable` (segunda conversa com Nico). Objetivo: `task_press_nico`.

## Cenas

| Cena | Acesso | Conteúdo |
|------|--------|----------|
| Nico (2ª) | Mapa → Titã (reaberto) | Jaqueta: Nico **acredita** que era de Jana |
| Jana | Autos → endereço → mapa `jana-casa` | Confirma jaqueta; explicação de empréstimo; sem Válter/Miro |
| Reflexão André | Após revisão dos autos | Condenação ainda plausível; hipótese sobre Mariana e o irmão |
| Reflexão Maralto | Após ação “Reavaliar linha Maralto” no PC | Linhas sem ligação; possível distração |
| Reflexão coincidência | Após comparar arquivos | Pode ser eco da mesma trilha; timestamps incomodam |
| Reflexão 50% | Após reabrir chamada/entrada | Percurso deliberado; quem construiu permanece aberto |

## Documentos

- `doc-elisa-jana` — nome completo, relação, noite, endereço (mapa)
- `doc-elisa-argumento` / `doc-elisa-alibi` / `doc-elisa-testemunha-queda` — peças da condenação
- `doc-mariana-contact-chronology` — lista consultável dos contatos que Mariana já havia procurado
- `doc-phone-file-dependencies` — dependências de interpretação + nota de possível coincidência
- `doc-emergency-reassessment` + reabertura de `doc-central-chamada` / `doc-entrada-apartamento` / `doc-apreensao-celular`
- `doc-elisa-geraldo-depoimento` — liberado no fim (entrada Bloco 6)

## Evidências novas

- `nico_believes_jacket_jana`
- `jana_current_record`, `jana_confirms_jacket`, `jana_loan_explanation`
- `elisa_argument_jealousy`, `elisa_weak_alibi`, `elisa_lookalike_near_fall`
- `mariana_sought_people_before`
- `phone_files_depend_on_order`
- `call_enabled_apartment_entry`, `phone_seized_after_call`

## Hipóteses

| Id | Texto | Notas |
|----|-------|-------|
| `hyp_mariana_needed_brother` | Falhas tratadas como conspiração por necessidade do irmão | Hipótese |
| `hyp_one_line_distraction` | Uma das duas linhas pode ser distração | Hipótese |
| `hyp_call_to_seize_phone` | Chamada como mecanismo de apreensão | Hipótese |
| `hyp_deliberate_path` | Percurso investigativo deliberado | Fortemente sustentada no marco 50% |
| `hyp_kidnapping` | Enfraquecida na forma “celular deixado por acaso” | Não encerrada |

## Triggers / flags principais

- `block05_start` → início
- `block05_nico_followup_done` → libera busca Jana
- `block05_jana_search_unlocked` + consulta “jana”
- `block05_elisa_review_unlocked` → peças + trigger `block05_elisa_review`
- Ações no PC (Caso): Maralto, cronologia (abre nota), comparação (abre nota → reflexão coincidência), reabrir emergência (peças iniciais + releitura)
- `block05_complete` + `block06_entry_ready`

## Estado final

- Nico (jaqueta/Jana); Jana localizada pelos autos; jaqueta confirmada (versão banal)
- André ainda parece culpado pelo conjunto original; Maralto sem explicar o desaparecimento
- Cronologia + dependências dos arquivos; chamada reinterpretada (hipótese)
- Hipótese do percurso deliberado; método muda: reconstruir Elisa do zero
- Objetivo: **Reconstruir o caso Elisa do zero — começar por Geraldo**

## Entrada do Bloco 6

`task_reexamine_elisa_from_scratch` + `doc-elisa-geraldo-depoimento`. Sem confissão de Geraldo neste bloco.
