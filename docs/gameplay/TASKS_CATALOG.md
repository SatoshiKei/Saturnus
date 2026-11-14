# Catálogo de pendências (`task_*`)

Documento gerado por `node scripts/generate-task-catalog.mjs`. **Referência de implementação** — a fonte da verdade é o código (`addTask`, `replaceTasks`, `completeTask`, triggers em `seedStory.ts`).

## Como o sistema funciona

| Mecanismo | Efeito |
|-----------|--------|
| `seedTasks` (`seedStory.ts`) | Três pendências iniciais no novo jogo |
| `block01_end_block` | `replaceTasks` → lista `block01EndTasks` (fim do Bloco 1) |
| `addTask` | Inclui uma pendência (mantém as outras) |
| `replaceTasks` | **Substitui** toda a lista (marcos de bloco) |
| `completeTask` | Marca `completed: true` (não remove da lista) |
| Trigger `block01_complete_phone_task` | Completa `task_mariana_phone` (Júlia + Camila no celular) |
| `documentConsultHooks.onDocumentConsulted` | Completos automáticos em alguns documentos |
| `onOpen` em `seedDocuments` | Alguns documentos completam ou criam pendências |

**Nota:** Pendências antigas podem permanecer `completed: false` se um `replaceTasks` posterior as removeu da UI sem apagá-las do save legado. O que importa para o jogador é o que está na lista **ativa**.

## Índice por bloco (heurística)

### B1

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_listen_emergency` | Ouvir a chamada das 08:03 | src/data/game/seedStory.ts | src/game/story/block01DevCheckpoints.ts, src/game/story/block01Handlers.ts |
| `task_mariana_phone` | Examinar o celular apreendido (+1 var.) | src/data/game/seedStory.ts, src/game/story/block01Handlers.ts | src/data/game/seedStory.ts, src/game/story/block01DevCheckpoints.ts |
| `task_review_bo` | Revisar a ocorrência de Mariana Silva | src/data/game/seedStory.ts | src/game/story/block01DevCheckpoints.ts, src/game/story/block01Handlers.ts |
| `task_trace_emergency_call` | Verificar a divergência entre a central e o histórico do aparelho | src/data/game/seedStory.ts, src/game/story/block01Handlers.ts | src/game/story/block01Handlers.ts, src/game/story/documentConsultHooks.ts |

### B1 pós-hospital

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_get_club_from_rafael` | — | — | src/game/story/block02Handlers.ts |
| `task_rafael_recording` | Encontrar a gravação perdida | src/data/game/seedStory.ts, src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts |
| `task_rafael_venue_staff` | Descobrir a origem da gravação | src/data/game/seedStory.ts | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts |

### B2

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_match_vertice_set` | Examinar a gravação recuperada | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts |
| `task_talk_nico` | Falar com Nico | src/data/game/seedDocuments.ts, src/game/story/block02DevCheckpoints.ts, src/game/story/block03DevCheckpoints.ts | src/game/state/investigationStore.ts, src/game/story/block03DevCheckpoints.ts, src/game/story/block03Handlers.ts, src/game/story/documentConsultHooks.ts |
| `task_vertice_cross_reference` | Voltar ao Vértice com a gravação analisada | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts |
| `task_vertice_dj` | Ir ao Vértice e falar com a equipe | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts | src/game/story/block02DevCheckpoints.ts, src/game/story/block02Handlers.ts |

### B3

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_identify_morsa` | Descobrir quem era Morsa | src/game/story/block07DevCheckpoints.ts, src/game/story/block08DevCheckpoints.ts | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts, src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts |
| `task_janus_sync` | Comparar a captura ambiente com o feed da mesa (bancada forense) | src/game/story/block03DevCheckpoints.ts, src/game/story/block03Handlers.ts | src/game/story/block03Handlers.ts |
| `task_review_mariana_call_log` | Rever o histórico de chamadas de Mariana | src/game/story/block03DevCheckpoints.ts, src/game/story/block03Handlers.ts | src/game/story/block03DevCheckpoints.ts, src/game/story/block03PhoneHooks.ts |
| `task_saturnalia` | Reconstruir a transmissão radiofônica (bancada de áudio) (+1 var.) | src/game/story/block03DevCheckpoints.ts, src/game/story/block03Handlers.ts | src/game/story/block03Handlers.ts |
| `task_talk_livia` | Ir à redação da Rádio Costeira | src/game/state/investigationStore.ts, src/game/story/block03PhoneHooks.ts | src/game/state/investigationStore.ts, src/game/story/block03Handlers.ts, src/game/story/block03PhoneHooks.ts, src/game/story/documentConsultHooks.ts |

### B4

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_analyze_unknown` | Analisar a gravação do contato desconhecido | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/game/story/block04Handlers.ts |
| `task_check_andre_chronology` | Cruzar o registro do número sem nome com as ligações autorizadas na unidade | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/data/game/seedStory.ts, src/game/story/block04DevCheckpoints.ts, src/game/story/documentConsultHooks.ts |
| `task_hexagon` | Analisar os seis áudios anônimos (bancada) | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts |
| `task_interview_andre` | Visitar André na unidade | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts |
| `task_open_recovered_diary` | Abrir o aplicativo recuperado no celular de Mariana | src/data/game/seedDocuments.ts, src/game/story/block04DevCheckpoints.ts | src/apps/device/HiddenDiaryApp.tsx, src/game/story/block04DevCheckpoints.ts, src/game/story/canonicalStoryManifest.ts |
| `task_phone_forensics` | Pedir à Perícia uma análise do aparelho de Mariana | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/data/game/seedDocuments.ts, src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts |
| `task_press_nico` | Questionar Nico sobre Elisa | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts, src/game/story/block05DevCheckpoints.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_read_diary` | Ler o diário recuperado | src/game/state/investigationStore.ts | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts |
| `task_unknown_recording` | Localizar a gravação citada no diário (+1 var.) | src/game/story/block04DevCheckpoints.ts, src/game/story/block04Handlers.ts | src/game/story/block04Handlers.ts |
| `task_unlock_diary` | Desbloquear o diário com o código recuperado no Hexágono | src/apps/device/HiddenDiaryApp.tsx, src/game/story/canonicalStoryManifest.ts | src/game/state/investigationStore.ts, src/game/story/block04DevCheckpoints.ts |

### B5

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_compare_phone_files` | Comparar a cronologia com os arquivos deixados no celular (+1 var.) | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_locate_jana` | Localizar Jana nos autos do caso Elisa (+1 var.) | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/data/game/seedDocuments.ts, src/game/story/block05DevCheckpoints.ts |
| `task_mariana_contact_chronology` | Organizar cronologia dos contatos recentes de Mariana (+1 var.) | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_review_elisa_autos` | Revisar as peças que sustentaram a condenação de André (+1 var.) | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/data/game/seedStory.ts, src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_revisit_emergency_entry` | Reabrir a chamada de emergência e a entrada no apartamento (+1 var.) | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_talk_jana` | Ir ao endereço de Jana Ribeiro | src/data/game/seedDocuments.ts, src/game/story/block05DevCheckpoints.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |
| `task_weigh_maralto_line` | Entender o que Mariana investigava além de Elisa (+1 var.) | src/data/game/seedStory.ts, src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts |

### B6

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_interview_miro` | Interrogar Miro na detenção — Noite X | src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts | src/game/story/block06Handlers.ts |
| `task_investigate_valter` | Investigar Válter e a estrutura criminosa ligada a ele | src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts | src/data/game/seedStory.ts, src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts |
| `task_pastor_crossref` | Cruzar G17N com a tabela logística apreendida | src/game/story/block06Handlers.ts | src/game/story/block06Handlers.ts |
| `task_pastor_moons` | Analisar as interceptações de rádio (bancada) — localizar a entrega | src/data/game/seedStory.ts, src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts | src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts |
| `task_press_jana_again` | Voltar a falar com Jana — jaqueta e condição de Elisa | src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts | src/game/story/block06Handlers.ts |
| `task_press_miro_further` | — | — | src/game/story/block06Handlers.ts, src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts |
| `task_press_miro_third` | Pressionar Miro — André tinha álibi; o que aconteceu na queda? | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_reexamine_elisa_from_scratch` | Reconstruir o caso Elisa do zero — começar por Geraldo | src/game/story/block05DevCheckpoints.ts, src/game/story/block05Handlers.ts, src/game/story/block06DevCheckpoints.ts | src/data/game/seedDocuments.ts, src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts |
| `task_talk_geraldo` | Ir ao endereço de Geraldo Mota | src/data/game/seedDocuments.ts, src/game/story/block06DevCheckpoints.ts | src/game/story/block06Handlers.ts |
| `task_valter_operation` | Deflagrar operação no Galpão 17 — Pátio Norte | src/game/story/block06DevCheckpoints.ts | src/game/story/block06Handlers.ts |

### B7

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_anon_audio_enceladus` | Analisar o áudio anônimo recebido (bancada) (+1 var.) | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts |
| `task_aster_henrique` | Confirmar o vínculo entre hvalenca e Aster Sistemas | src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_cassini_puzzle` | Reconstruir a captura RTP de Henrique (bancada) | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_check_julia_camila_onset` | Esclarecer quando começaram os lapsos de Mariana | src/game/story/block07Handlers.ts | src/data/calls.ts, src/game/story/block07Handlers.ts |
| `task_compare_henrique_mariana_system` | Determinar se o sistema de Henrique é o mesmo que falava com Mariana (+1 var.) | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/data/game/seedStory.ts, src/game/story/block08Handlers.ts |
| `task_confirm_ricardo_identity` | Confirmar a identidade de Ricardo Freitas | src/game/story/block07DevCheckpoints.ts | src/data/game/seedDocuments.ts, src/game/story/block07Handlers.ts |
| `task_crosscheck_ricardo_mariana` | — | — | src/data/game/seedDocuments.ts, src/game/story/block07Handlers.ts |
| `task_forum_hvalenca` | Buscar o nickname hvalenca em arquivo de fórum técnico | src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_henrique_digital` | Localizar a captura de rede do incidente de Henrique (consulta no computador) | src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_hospital_deposit` | Voltar ao hospital — depósito de pertences de Ricardo | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_hospital_ricardo_chart` | Solicitar o prontuário de Ricardo no arquivo do hospital | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_investigate_henrique` | Investigar Henrique Valença | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/data/game/seedStory.ts, src/game/story/block07Handlers.ts |
| `task_julia_ricardo_audio` | Mostrar o fragmento recuperado a Júlia | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts |
| `task_locate_sandra` | Quem Sandra viu voltando da região da queda? (+1 var.) | src/game/story/block06DevCheckpoints.ts, src/game/story/block06Handlers.ts, src/game/story/block07DevCheckpoints.ts | src/data/game/seedDocuments.ts, src/game/story/block07DevCheckpoints.ts |
| `task_memory_onset_chronology` | Revisar quando começaram os lapsos de Mariana (Timeline do caderno) | src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_review_morsa_duration` | Reavaliar a duração da atividade de Morsa nos arquivos dos protestos (+1 var.) | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts |
| `task_revisit_mariana_ricardo_clue` | — | — | src/game/story/block07Handlers.ts |
| `task_talk_cecilia` | Falar com Cecília Prado sobre Henrique | src/data/game/seedStory.ts, src/game/story/block07DevCheckpoints.ts, src/game/story/block07Handlers.ts | src/game/story/block07Handlers.ts |
| `task_talk_sandra` | Ouvir Sandra Almeida — testemunha da região da queda | src/data/game/seedDocuments.ts, src/game/story/block07DevCheckpoints.ts | src/game/story/block07Handlers.ts |
| `task_verify_hvalenca_identifier` | Verificar o identificador encontrado nos registros (hvalenca) | src/game/story/block07Handlers.ts | src/data/game/seedDocuments.ts, src/game/story/block07Handlers.ts |

### B8

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_confront_andre_morsa` | Confrontar André com a reconstrução de Morsa | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_detran_jaguar_fleet` | Solicitar ao DETRAN levantamento histórico de Jaguar XJ6 verde (X300) | src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_find_jaguar_workshop` | Localizar oficina para Jaguar antigo (+1 var.) | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_lookup_callsign_scale` | — | — | src/data/game/seedDocuments.ts, src/game/story/block08Handlers.ts |
| `task_reexamine_guardrail` | Solicitar à Perícia (telefone fixo) análise do guardrail (+1 var.) | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_rings_dvr` | Inspecionar o arquivo CFTV da passagem de serviço | src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_rings_puzzle` | Reconstruir a timeline dos protestos (bancada) — fontes dessincronizadas (+1 var.) | src/data/game/seedStory.ts, src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts |
| `task_rotation_puzzle` | Cruzar passagem ferroviária, CAD e rádios da abordagem (bancada) | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts |
| `task_talk_bia` | Falar com Bia sobre o Jaguar do Mauro | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_talk_denis` | Ir à oficina de Dênis — memória do Jaguar verde | src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_talk_mauro` | Falar com Mauro sobre o Jaguar XJ6 | src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |
| `task_talk_rui` | Falar com Rui | src/game/story/block08Handlers.ts | src/game/story/block08Handlers.ts |

### B9

| ID | Texto (rótulo) | Onde entra | Onde completa |
|----|----------------|------------|---------------|
| `task_augusto_anomalies` | Verificar as anomalias recentes no WhatsApp | src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_compare_omitido_system` | Comparar os registros de Henrique com o material encontrado no caso Mariana | src/data/game/seedStory.ts, src/game/story/block08DevCheckpoints.ts, src/game/story/block08Handlers.ts | src/game/story/block09Handlers.ts |
| `task_follow_trail_location` | Seguir a trilha até o local indicado pelos registros | src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_memory_puzzle` | Analisar a gravação recente atribuída a Mariana (bancada) | src/game/story/block09DevCheckpoints.ts, src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_message_after_death` | — | — | src/game/story/block09Handlers.ts |
| `task_omitido_assistance` | Reabrir as fontes técnicas ligadas a O Omitido | src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_other_disappearances` | Pesquisar ocorrências semelhantes ligadas a O Omitido (+1 var.) | src/game/story/block09DevCheckpoints.ts, src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_read_mariana_messages` | Examinar as novas mensagens atribuídas a Mariana | src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_reconstruct_physical_trail` | Reconstruir os últimos deslocamentos físicos de Mariana (câmeras e transporte) | src/game/story/block09DevCheckpoints.ts, src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_reexamine_roberto` | Consultar os documentos do afastamento de Roberto Siqueira | src/game/story/block09DevCheckpoints.ts, src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |
| `task_reread_diary_omitido` | Reler o diário com o contexto de O Omitido | src/game/story/block09Handlers.ts | src/game/story/block09Handlers.ts |

## Condições jogáveis (canon — resumo manual)

Estas linhas descrevem **o que o jogador faz**, não só o arquivo que chama `completeTask`. Mantidas à mão; alinhar ao regenerar se a progressão mudar.

### Bloco 1

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| `task_review_bo` | Início do jogo | Registra o BO (`registerInitialPoliceReport`) |
| `task_listen_emergency` | Início | Análise provisória P01 da chamada 08:03 |
| `task_mariana_phone` | Início (ou re-rotulada após P01) | Trigger: chats Júlia **e** Camila no celular de Mariana |
| `task_trace_emergency_call` | Após P01 | Abre `doc-central-chamada` com P01 feito; ou junto do P01 se o doc já estava lido |
| `task_rafael_recording` | Fim B1 (`block01EndTasks`) | Áudio da balada de Rafael no WhatsApp de Augusto, ou P2 Iapetus (auto se já tinha áudio) |
| `task_rafael_venue_staff` | Fim B1 | 1ª visita Vértice — tópico arquivo histórico |
| `task_get_club_from_rafael` | Legado (checkpoints B2) | Mesmo que gravação de Rafael recebida |

### Bloco 2

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| `task_vertice_dj` | Após P02 Iapetus | 1ª visita ao Vértice concluída |
| `task_match_vertice_set` | Rafael envia gravação da balada | P03 Anéis na bancada |
| `task_vertice_cross_reference` | Após P03 | 2ª visita Vértice — cruzamento institucional (Nico) |
| `task_talk_nico` | Convergência B2 / cruzamento Vértice | 1ª entrevista Nico (`finishNicoInterview`) |

### Bloco 3

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| `task_janus_sync` | Pós-entrevista Nico | Puzzle Janus (Epimetheus) |
| `task_review_mariana_call_log` | Após Janus | Entrada Rádio Costeira no histórico (P04) |
| `task_talk_livia` | Ligação rádio → visita redação | 1ª entrevista Lívia (`finishLiviaInterview`) |
| `task_saturnalia` | Arquivo rádio de Lívia | Puzzle Saturnália (P05) |
| `task_identify_morsa` | Após Saturnália (`replaceTasks`) | Entrevista Samuel (`finishSamuelInterview`) |

### Bloco 4

| Pendência | Aparece | Conclui quando |
|-----------|---------|----------------|
| `task_interview_andre` | Pós-Samuel / DEV | 1ª entrevista André (`finishAndreInterview`) |
| `task_hexagon` | Seis UNK preservados | Inspeção espectrogramas Hexágono |
| `task_phone_forensics` | Pós-hex ou pacote diário | Laudo perícia celular |
| `task_open_recovered_diary` | Laudo perícia | Abre app diário no celular |
| `task_unlock_diary` | PIN correto | PIN 481526 aceito |
| `task_read_diary` | Diário aberto | Primeira leitura de entrada |
| `task_unknown_recording` | Entrada diário “desconhecido” | CHK_UNK localizado no aparelho |
| `task_analyze_unknown` | UNK na bancada | Análise concluída |
| `task_press_nico` | Fim B4 (`replaceTasks`) | Reentrevista Nico — Elisa (`finishNicoFollowup`) |

### Blocos 5–9

Para o detalhe arquivo-a-arquivo, use as tabelas geradas acima. Handlers principais:

- **B5:** `block05Handlers.ts` (Jana, autos Elisa, linha Maralto, timeline, celular, reabertura 08:03)
- **B6:** `block06Handlers.ts` (Geraldo, Jana 2, Válter, Pastor Luas, operação, Miro)
- **B7:** `block07Handlers.ts` (Sandra, Morsa duração, lapsos, Júlia/Camila, áudio anônimo, Enceladus, Ricardo, hvalenca, Henrique, Cecília, Cassini divisão)
- **B8:** `block08Handlers.ts` (Anéis timeline, André/Morsa, Miro 3, guard-rail, Jaguar/Bia/Rui, rotação, escala)
- **B9:** `block09Handlers.ts` (Omitido, Roberto, mensagens, trilha, morte, outros casos, anomalias Augusto, memória final)

---

*86 ids `task_*` indexados em `2026-11-14`.*
