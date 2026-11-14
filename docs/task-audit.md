# Auditoria de metas investigativas (`task_*`)

Revisão global B1–B9 (critérios: motivo imediato, sem telefone óbvio, sem spoiler, conclusão semântica, sem reintrodução por checkpoint).

**Gerado:** `2026-11-14` — `node scripts/generate-task-audit.mjs`

| ID | Bloco | Decisão | Momento de entrada | Momento de conclusão | Observação |
|----|-------|---------|-------------------|----------------------|------------|
| `task_analyze_unknown` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_andre_visits` | — | REMOVE | — | — | Antecipava consulta sem contradição. |
| `task_anon_audio_enceladus` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_aster_henrique` | B7 | REWRITE | Pós-reflexão hvalenca | onAsterHenriqueNamed | Investigativa, não “contatar/ligar”. |
| `task_augusto_anomalies` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_call_renata` | — | REMOVE | — | — | Chamada fixa liberada após Júlia; sem meta telefônica. |
| `task_cassini_puzzle` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_check_andre_chronology` | — | REMOVE | — | — | Meta burocrática sem ganho investigativo imediato. |
| `task_check_julia_camila_onset` | B7 | REWRITE | Janela lapsos B7 | Chamadas Júlia/Camila | Pergunta investigativa, não instrução de ligação. |
| `task_compare_henrique_mariana_system` | B7 | REWRITE | Fim B7 onTechReflectionDone | block08_start trigger | Texto neutro (comparar registros), sem spoiler de “mesmo sistema”. |
| `task_compare_omitido_system` | B9 | KEEP | Fim B8 / block09_start | compareHenriqueMarianaSystem | Substitui task_how_mariana_knew no painel. |
| `task_compare_phone_files` | B5 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_confirm_ricardo_identity` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_confront_andre_morsa` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_contact_radio_costeira` | — | REMOVE | — | — | P04 + histórico liberam contato; sem meta de ligação. |
| `task_crosscheck_ricardo_mariana` | B7 | REMOVE | — | onRicardoIdentityDeadEnd | Sem rótulo; fluxo absorvido por outras metas. |
| `task_detran_jaguar_fleet` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_find_jaguar_workshop` | B8 | KEEP | Trilha Jaguar B8 | onWorkshopLocated (ou equivalente) | Investigação DETRAN/oficinas antes de Dênis. |
| `task_follow_trail_location` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_forum_hvalenca` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_get_club_from_rafael` | B1 pós-hospital | REMOVE | — | — | Legado; mesma função que task_rafael_recording. |
| `task_henrique_digital` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_hexagon` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_hospital_deposit` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_hospital_ricardo_chart` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_how_mariana_knew` | — | REMOVE | — | — | Pergunta temática; B9 abre com task_compare_omitido_system. |
| `task_identify_morsa` | B3 | KEEP | Pós-Saturnália | finishSamuelInterview | Só ativa após pista radiofônica; não antes. |
| `task_interview_andre` | B4 | FIX_COMPLETION | Pós-Samuel | 1ª visita André | Sem metas de registros pós-visita. |
| `task_interview_miro` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_investigate_henrique` | B7 | KEEP | Identidade Henrique confirmada | onHenriqueTrailComplete (3 evidências) | Meta-pai fecha antes de task_talk_cecilia. |
| `task_investigate_valter` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_janus_sync` | B3 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_julia_ricardo_audio` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_listen_emergency` | B1 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_locate_jana` | B5 | KEEP | Pós-Nico2 | Consulta autos Jana (documento) | Par válido: descoberta nos autos → visita task_talk_jana. |
| `task_locate_livia` | — | REMOVE | — | — | Sem etapa de localização separada. |
| `task_locate_nico` | — | REMOVE | — | — | Fundido em task_talk_nico (B2 convergência). |
| `task_locate_sandra` | B7 | KEEP | Pós-Miro / B7 | Consulta cadastro Sandra | Pergunta concreta no rótulo; completa ao achar testemunha. |
| `task_lookup_callsign_scale` | B8 | REMOVE | — | Consulta doc-escala | Sem addTask; completa por consulta. |
| `task_mariana_contact_chronology` | B5 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_mariana_phone` | B1 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_match_vertice_set` | B2 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_memory_onset_chronology` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_memory_puzzle` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_message_after_death` | B9 | REMOVE | — | onPostDeathMessageRead | Legado sem entrada ativa. |
| `task_omitido_assistance` | B9 | REWRITE | Pós-relê diário Omitido | mapOmitidoAssistance (docs técnicos) | Ação concreta em vez de pergunta aberta. |
| `task_open_recovered_diary` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_other_disappearances` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_pastor_crossref` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_pastor_moons` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_phone_forensics` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_press_jana_again` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_press_miro_further` | B6 | REMOVE | — | completeTask legado em B7 | Sem addTask ativo; só conclusão residual. |
| `task_press_miro_third` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_press_nico` | B4 | REWRITE | Fim B4 replaceTasks | finishNicoFollowup | Texto: Questionar Nico sobre Elisa. |
| `task_rafael_recording` | B1 pós-hospital | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_rafael_venue_staff` | B1 pós-hospital | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_read_diary` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_read_mariana_messages` | B9 | MERGE | Pós-Roberto | weighMarianaMessageImpossibilities | Rótulo neutro; absorve onda 2. |
| `task_reconstruct_physical_trail` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_reexamine_elisa_from_scratch` | B6 | KEEP | Fim B5 | onElisaReconstructionStarted | Geraldo é primeira ação concreta. |
| `task_reexamine_guardrail` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_reexamine_roberto` | B9 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_reread_diary_omitido` | B9 | REWRITE | Pós-nomear Omitido | rereadDiaryOmitido | Relê diário com novo contexto. |
| `task_research_maralto` | — | REMOVE | — | — | completeTask morto no onOpen do documento. |
| `task_review_bo` | B1 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_review_elisa_autos` | B5 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_review_mariana_call_log` | B3 | KEEP | Pós-JanUs | Seleção Rádio Costeira (block03PhoneHooks) | Conclusão sem meta de contactar rádio. |
| `task_review_morsa_duration` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_revisit_emergency_entry` | B5 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_revisit_mariana_ricardo_clue` | B7 | KEEP | Nota parcial hvalenca | onMarianaPartialIdRevisited | Sem texto em catálogo — mantida só como conclusão interna. |
| `task_rings_dvr` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_rings_puzzle` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_rotation_puzzle` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_saturnalia` | B3 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_talk_bia` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_talk_cecilia` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_talk_denis` | B8 | KEEP | Oficina localizada | finishDenisInterview | Visita após trabalho de localização. |
| `task_talk_geraldo` | B6 | KEEP | Doc / flag reconstrução Elisa | finishGeraldoInterview | Par com reconstrução — há trabalho entre cadastro e visita. |
| `task_talk_jana` | B5 | KEEP | Após localizar nos autos | finishJanaInterview | Unidade separada da pesquisa documental. |
| `task_talk_livia` | B3 | FIX_COMPLETION | Após ligação / visita redação | finishLiviaInterview | Conclui na 1ª entrevista completa. |
| `task_talk_mauro` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_talk_nico` | B2 | FIX_COMPLETION | B2 convergência / cruzamento Vértice | finishNicoInterview (1ª conversa) | Não antecipa reentrevistas. |
| `task_talk_rui` | B8 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_talk_sandra` | B7 | KEEP | Sandra localizada | finishSandraInterview | Depoimento único conclui meta. |
| `task_trace_emergency_call` | B1 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_unknown_recording` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_unlock_diary` | B4 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_valter_operation` | B6 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_verify_hvalenca_identifier` | B7 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_vertice_cross_reference` | B2 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_vertice_dj` | B2 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_weigh_maralto_line` | B5 | KEEP | Ver TASKS_CATALOG (entra) | Ver TASKS_CATALOG (completa) |  |
| `task_weigh_mariana_messages` | — | MERGE | — | — | Fundida em task_read_mariana_messages (onda 2). |

## Resumo das mudanças de runtime

- **Removidas do fluxo ativo:** `task_contact_radio_costeira`, `task_locate_livia`, `task_andre_visits`, `task_check_andre_chronology`, `task_call_renata`, `task_locate_nico`, `task_how_mariana_knew`, legados sem add (`task_research_maralto`, `task_get_club_from_rafael`, etc.).
- **Migração de saves:** `personRegistryGates.ts` → `REMOVED_TASK_IDS`.
- **B3:** histórico de chamadas conclui ao destacar Rádio Costeira; ligação sem meta.
- **B4:** só `task_interview_andre` na 1ª visita; `task_press_nico` renomeada (Elisa).
- **B7–B9:** textos neutros (Henrique×Mariana, Aster, mensagens); fusão leitura/peso Mariana.
