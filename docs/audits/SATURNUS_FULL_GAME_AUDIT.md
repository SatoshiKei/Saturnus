# SATURNUS — auditoria integrada do runtime

Data: 2026-11-13.  
Referência: código e testes atuais, não a documentação antiga.  
Quando um doc discorda do runtime, o runtime vence e a divergência fica registrada.

## Classificação

**NOT READY**

O caminho canônico chega ao final (`saturnus_complete`, puzzle MEMÓRIA, as doze conquistas no estado DEV de fim de jogo). Não há softlock que impeça o encerramento nesse pipeline. Há dois problemas HIGH que comprometem a semântica do caso e da bancada.

| Severidade | Quantidade |
|---|---|
| BLOCKER | 0 |
| HIGH | 2 |
| MEDIUM | 14 |
| LOW | 10 |

---

## 1. Resumo executivo

O jogo implementa os nove blocos e os doze puzzles no runtime. A progressão real está nos handlers (`src/game/story/block01Handlers.ts` … `block09Handlers.ts`) e nos checkpoints DEV, não só nos 14 triggers de `seedStory.ts`. Save persiste flags, evidências, documentos, tarefas, pessoas, locais, contatos, hipóteses, `forensicRecoveredSpeech`, `forensicContainerState` e conquistas. UI transitória (descobertas, toasts, playhead, aba aberta) não entra no save.

O que impede **READY**:

1. A subtrama da pasta da Júlia foi removida do desenho, mas continua na cara do jogador: diálogo, evidência e tarefa que nunca fecha.
2. A Bancada Forense não é um instrumento único. Puzzles 1–9 compartilham o shell; 10–12 são telas próprias. Em três puzzles o resultado técnico já escreve a frase narrativa.

Correções desta rodada foram só técnicas: parar o áudio ao trocar a fonte, alinhar flags que o snapshot DEV perdia, incluir a aba Spectrum na lista permanente, e corrigir testes que ainda descreviam o contrato antigo (Samuel após Saturnalia, Nico no arquivo do Vértice, hospital antes de Renata, SSRC `A1`/`B7`).

Não houve playthrough manual no browser nesta auditoria. Áudio, sprites e viewports 1366/1920/2560 não foram exercitados visualmente. O que foi executado: typecheck, build de produção, lint, suíte unitária e um scanner de paths `/assets/`.

---

## 2. Fluxo geral

Caminho que o código realmente sustenta:

desaparecimento / BO → chamada de emergência (P01) → celular (Júlia, Rafael) → hospital → Rafael encaminha o arquivo (P02) → Vértice → arquivo + gravação (P03) → Nico → Janus (P04) → Maralto → Lívia → Saturnalia (P05) → Samuel pela ocorrência, não pelo puzzle → André (nega Maralto) → hexágono (P06) → diário → Nico de novo → Jana → revisão de Elisa → Geraldo → Jana de novo → Válter → Luas Pastoras (P07) → operação → Miro (crimes atuais) → Sandra → duração de Morsa → Enceladus (P08) → Júlia reconhece Renata → Renata → prontuário → Ricardo Freitas → depósito → lenço H.V. → fórum → Henrique → Cecília → Cassini-Huygens (P09) → Ordem dos Anéis (P10) → cutscene “André.” → `morsa_was_andre` → confronto → guardrail → Dênis → Mauro → Bia → Rui → Rotação (P11) → escala → “Eu parei o Rui.” → O Omitido → trilha → morte de Mariana → MEMÓRIA (P12).

Lucas está no bloco 2, entre o arquivo do Vértice e a convergência com Elisa. Não é um passo depois de Nico.

Docs antigos (`SATURNUS_SPEC_WALKTHROUGH.md`, `WALKTHROUGH_GUIA.md`) ainda descrevem o hexágono por metadados e os puzzles 07–09 pelos painéis placeholder. Esses painéis não são montados.

---

## 3. Matriz dos 12 puzzles

| # | Puzzle | Origem do material | O que o jogador faz | Conclusão | Próximo lead | Implementado | Testado | Semântico OK | Problemas |
|---|---|---|---|---|---|---|---|---|---|
| 01 | Divisão de Cassini | BO / `emergency_call_raw` | Notch + perfil de ruído + redução; cinco trechos ao ouvir | Cinco fragmentos; sem input de texto | Rastrear a ligação | Sim | Sim | Sim, com ressalva | Dois arquivos de emergência; parâmetros calibrados |
| 02 | Iapetus | WhatsApp de Rafael | Corrigir sequence da página e Rebuild | Tag Vértice | Ir ao Vértice | Sim | Sim | Parcial | Completa no trecho `seg_vertice`; CRC é simulado |
| 03 | Anéis | Arquivo do Vértice | Tempo da seleção + ligar ao set log | Nico, sem a palavra de graça no P02 | Nico / registros | Sim | Sim | Sim | Quatro candidatos; força bruta curta |
| 04 | Janus e Epimetheus | Gravação da cabine do Nico | Offset ~+450 s e formalizar | Saída real 01:23:30; Sandra ~01:16 não é Elisa | Releitura Maralto | Sim | Sim | Parcial | O botão escreve `01:23:30`; a noite Jana/Miro não é simulada na bancada |
| 05 | Saturnalia | Lívia entrega o bruto | Reordenar 10 slots pelo logger | `06→07→08→09→00→01→02→03→04→05` | Morsa sem identidade; Samuel não nasce aqui | Sim | Sim | Sim | O nome Samuel pode aparecer no caderno (status `mentioned`) |
| 06 | Hexágono | Seis UNK após a ligação | Abrir o espectrograma real de cada arquivo | Padrões; PIN `481526` só no diário | Diário oculto | Sim | Sim | Parcial | Ver o gráfico completa a bancada; ler o romano é outra etapa |
| 07 | Luas Pastoras | Interceptação após Válter | Waterfall + Extract Channel | G17N, 23:40 → Galpão 17, Pátio Norte | Operação; Miro por crime atual | Sim | Sim | Sim, com ressalva | Centro 462.575 MHz é o gesto decisivo |
| 08 | Enceladus | WhatsApp anônimo, depois encaminhado | Find Similar, padrão comum, Difference | Só “Ricardo” | Júlia → Renata → hospital | Sim | Sim | Sim | Índices de ciclo estão no dataset |
| 09 | Cassini-Huygens | PCAP via Cecília | Separar dois SSRC e ordenar sequence | Duas sessões; sem terceiro stream | Bloco 8 / Morsa | Sim | Sim | Parcial | Hash do derivado é meta estática, não registro da sessão |
| 10 | Ordem dos Anéis | Mídias dos protestos | Fingerprint, flicker, rota, DVR, segmento 1279 | Cutscene; Augusto diz “André.” | Confronto com André | Sim | Sim | Sim | UI própria, não a bancada de áudio |
| 11 | Rotação de Saturno | Relatos + registros após Rui | Passagem, CAD, fingerprint, AVL | VTR-14; Augusto só na escala | Bloco 9 | Sim | Sim | Sim | Evidência ainda se chama `rui_police_approach_records` |
| 12 | MEMÓRIA | Gravação reivindicada no bloco 9 | Janelas, Search Case Media, quatro proveniências | Palavra MEMÓRIA; D é o derivado do P09 | Final | Sim | Sim | Sim | Região D depende do meta estático do P09 |

### Notas por puzzle

**01.** Sessão `puzzle-01-cassini`. Conclusão quando os cinco `speechSegments` entram em `recoveredSpeech`. Notch sozinho não libera o trecho da noite. Perfil de ruído em cima da voz é recusado. Ganho de voz limpa tem teto. Handler: `runProvisionalEmergencyAnalysis`. Conquista `ach-cassini-division`.

**02.** Arquivo `rafael_1610_2147_full.mp3`, nome de UI `.ogg`. O jogador edita a sequence e reconstrói o container. Não é um botão “Reparar”. A conclusão exige `seg_vertice`, não `seg_cabine`.

**03.** Asset `rec_vtx_old_01_final.mp3`. O set certo é o que o dataset marca; logs errados falham com mensagem genérica. Nico é descoberto em `runProvisionalRingsAnalysis`, não ao abrir o arquivo.

**04.** Relógio do Vértice 01:16:00 no log; telefone real no evento 01:23:30; offset canônico +450 s (+07:30). Sandra em ~01:16 não pode ser a saída de Elisa. Isso é uma mudança de cronologia, não um ajuste de minutos. O texto do finding não nomeia Jana nem Miro e não inocenta André. A sequência jaqueta / desvio / Miro seguindo a pessoa errada está no roteiro das entrevistas e no tutorial, não num relógio único dentro da bancada.

**05.** Ordem física `00→09`. Ordem cronológica `06→05` como acima. A reportagem montada não revela quem é Morsa. `runSaturnaliaReconstruct` não chama `discoverPerson` para Samuel. O teste antigo que exigia `samuel.status === 'identified'` estava errado e foi corrigido.

**06.** STFT real em `forensicAudio.ts`. Mapa UNK_01→IV … UNK_06→VI, dígitos `481526` em `hexagonPuzzle.ts`. A conquista `ach-hexagon` exige o puzzle e o diário. `HexagonSession.tsx` não é importado.

**07.** Canais conhecidos nas pontas, canal fraco no meio. Extract é ferramenta genérica com qualidade mínima. O puzzle não cita Elisa. Galpão 17 sai da tabela logística, não de uma string mágica no áudio.

**08.** O áudio chega pelo WhatsApp antes de existir na bancada (`deliverAnonWhatsApp` / `receiveAnonHospitalAudio`). Oito ciclos. O residual confiável é “Ricardo”. Não há busca policial por esse nome: o passo seguinte é mostrar o fragmento a Júlia.

**09.** SSRC `48A21C30` e `91F47B12`. Ordenar pela captura falha; ordenar por sequence passa. Não há terceiro stream. O Omitido não é nomeado no finding. O SHA-256 usado pelo puzzle 12 está em `puzzle12Meta.json` / `memoryPuzzle.ts`, calculado no build, não gravado quando Augusto aperta reconstruir.

**10.** BG-03 não é referenciado. Assets obrigatórios estão em `public/assets/block08/rings/p10/` e em `src/assets/audios/p10/`. A cutscene termina com a fala `André.` (`morsaCctvBeats.ts`). `onMorsaContinuityConfirmed` só roda no `onComplete` da cutscene e aí grava `morsa_was_andre`. Antes disso, `onRingsTimelineSolved` não grava a identidade. Transparência, escala e “rosto colado” não foram vistos renderizados.

**11.** Sem ENF, sem drift como ferramenta, sem offset manual. VTR-14 sai do cruzamento. Augusto sai de `doc-escala-vtr14`, não do áudio.

**12.** Portadora sem TTS novo (`noTts` no meta). Ordem A→B→C→D. D pontua no artefato derivado e não no PCAP em ordem de captura. A conclusão na UI é acesso a um produto da investigação, não só “áudio editado”.

---

## 4. Matriz de progressão

Persistência: sim, salvo onde a coluna diz o contrário. Disparo duplo: handlers são idempotentes por flag.

| Evento | Prerequisites | Actions | Flags | Unlocks | Softlock? | Save-safe? |
|---|---|---|---|---|---|---|
| Início | — | estado inicial | `block01_started` | BO, celular, chamada bruta | Não | Sim |
| BO aberto | jogador abre o doc | `registerInitialPoliceReport` | `block01_bo_registered` | docs e pessoas iniciais | Não | Sim |
| P01 | chamada bruta na bancada | `runProvisionalEmergencyAnalysis` | `block01_emergency_provisional` | tarefa de origem da ligação | Não | Sim |
| Celular Júlia + Rafael | chats | handlers do bloco 1 | memórias | contradição; hospital | Se nenhum dos dois áudios for ouvido, o hospital não abre | Sim |
| Fim bloco 1 | hospital feito | trigger | `block01_complete` | Rafael, tarefas de fim | Não | Sim |
| P02 | áudio encaminhado | `runProvisionalRafaelForwardAnalysis` | `block02_rafael_forward_provisional` | Vértice | Não | Sim |
| Arquivo Vértice | visita | `finishVerticeArchive` | `block02_vertice_archive` | gravação do P03 | Não | Sim |
| P03 | `rec_vtx_old_01` | `runProvisionalRingsAnalysis` | `block02_rings_provisional` | Nico identificado | Não | Sim |
| Lucas | Paula + universidade | `finishLucasInterview` | entrevista | termo Elisa | Não | Sim |
| Fim bloco 2 | quatro evidências | trigger `block02_convergence` | `block02_complete` | busca de Nico | Sim, se faltar uma das quatro | Sim |
| Nico | contato / doc | `finishNicoInterview` | entrevista | cabine para o P04 | Não | Sim |
| P04 | `nico_recording_booth` | `runJanusEpimetheusAnalysis` | `block03_janus_done` | releitura Maralto | Não | Sim |
| Lívia | pesquisa Maralto | `finishLiviaInterview` | arquivo bruto | P05 | Não | Sim |
| P05 | arquivo da Lívia | `runSaturnaliaReconstruct` | `block03_saturnalia_done`, `block03_complete` | Morsa; tarefa de identidade | Não | Sim |
| Samuel | ocorrência / detidos / ficha | bloco 4 | `block04_samuel_search_unlocked` | entrevista | Não, se o jogador seguir os docs | Sim |
| André 1 | ficha / presídio | `finishAndreInterview` | nega Maralto se Saturnalia já ocorreu | — | Não | Sim |
| P06 | ligações preservadas | ver seis espectrogramas | `block04_hexagon_done` | acesso forense / diário | Não | Sim |
| Diário | PIN `481526` | `tryDiaryPin` | `block04_diary_opened` | conquista do hexágono | Não | Sim |
| Fim bloco 4 | gravação desconhecida analisada | handler | `block04_complete` | bloco 5 | Não | Sim |
| Jana / revisão Elisa | Nico 2 | handlers bloco 5 | revisão | Maralto, cronologia | Não | Sim |
| Fim bloco 5 | reflexão do percurso | `onPathReflectionDone` | `block05_complete` | Geraldo | Não | Sim |
| Válter → P07 | trilha | `runShepherdMoonsExtract` + cruzamento | `block06_pastor_done` | Galpão 17 | Não | Sim |
| Operação / Miro | local | `finishPoliceOperation`, `finishMiroInterview` | `block06_complete` | bloco 7; Miro por crime atual | Não | Sim |
| Sandra | busca | entrevista | visão incompleta | duração de Morsa | Não | Sim |
| P08 | WhatsApp anônimo | `onEnceladusSolved` | `block07_enceladus_done` | áudio para Júlia | Não | Sim |
| Júlia → Renata → hospital | fragmento | `onJuliaRicardoAudioDone` depois `onRenataCallDone` | arquivo hospitalar | Ricardo Freitas | Não | Sim |
| Depósito → Henrique | reflexão + depósito | lenço, fórum, Aster | `block07_henrique_identified` | Cecília | Não | Sim |
| P09 | dump da Cecília | `onCassiniSolved` | `block07_cassini_done`, `block07_complete` | bloco 8 | Não | Sim |
| P10 timeline | mídias | `onRingsTimelineSolved` | timeline | DVR; ainda sem André | Não | Sim |
| Cutscene | segmento 1279 | `onMorsaContinuityConfirmed` | `morsa_was_andre` | reflexão | Não | Sim |
| Confronto André | reflexão | `finishAndreFollowup` | admite Morsa | reinterpretação de Elisa | Não | Sim |
| Guardrail | Miro 3 | perícia, Dênis, DETRAN, Mauro, Bia, Rui | dano anterior, Jaguar, contradição | P11 | Não | Sim |
| P11 | caso da abordagem | `onRotationSolved` | VTR-14 | escala | Não | Sim |
| Escala | doc da viatura | `onScaleLinksAugusto` | `block08_augusto_linked`, `block08_complete` | bloco 9 | Não | Sim |
| Morte | trilha física | `finishTrailDiscovery` | `mariana_confirmed_dead` | padrão / Augusto observado | Não | Sim |
| P12 | gravação disponível | `onMemoryPuzzleSolved` | `block09_memory_done` | reflexão final | Não | Sim |
| Final | reflexão | `onSaturnusFinalReflectionDone` | `block09_complete`, `saturnus_complete` | — | Não | Sim |

Cedo demais: a cutscene do P10 é o primeiro momento em que `morsa_was_andre` entra no caderno. Isso coincide com o pedido (“só depois da fala André.”). O comentário antigo do handler dizia o contrário e foi corrigido.

Nunca: `task_julia_folder` e `task_trace_emergency_call` não têm `completeTask` em lugar nenhum. Não travam o bloco, porque um `replaceTasks` posterior substitui a lista. Ficam abertas até lá.

Duas vezes: triggers `once` gravam `triggersFired`. Handlers voltam cedo se a flag já existe.

---

## 5. Progressão narrativa — checagens pedidas

### Pasta da Júlia — HIGH, player-facing

Ainda existe, e o jogador vê:

- Tópico `julia_folder` em `src/data/block01/hospitalInterview.ts`. Júlia diz que era uma pasta, que não sabe o conteúdo e que ainda está na casa dela.
- Evidência `julia_kept_folder`: “Depoimento — pasta guardada por Júlia” / “Conteúdo desconhecido.” (`seedEvidence.ts`).
- Tarefa `task_julia_folder`: “Recolher pasta deixada com Júlia”, em `HospitalInterviewScene.tsx` e em `block01EndTasks`.

`completeTask('task_julia_folder')` não existe. Não foi removido nesta auditoria: apagar diálogo, evidência ou tarefa é decisão editorial.

### Lucas

A entrevista atual (`src/data/block02/lucasInterview.ts`) separa o que ele viu, o que Elisa dizia e o que ele concluiu. Ele não ajuda a “salvar” André. A evidência `mariana_andre_innocence` resume isso como “provar a inocência”, um pouco mais largo do que a fala. LOW, sem reescrita.

### Ricardo → Henrique

O runtime segue a cadeia pedida: Enceladus → Júlia reconhece Renata → Renata → prontuário → Ricardo Freitas (identidade fraca) → depósito (notebook ausente, lenço H.V.) → fórum `hvalenca` → Aster → Henrique → Cecília → PCAP. Não há atalho jogável “busca civil → Henrique”. `onRicardoIdentityBroken` existe para save antigo / DEV.

`seedPeople.ts` guarda em Henrique a nota “Identidade real por trás do registro Ricardo Freitas”. O caderno só mostra a pessoa com `block07_henrique_identified`. Se alguma tela listar o seed cru, vaza. LOW enquanto o gate segurar.

### Guarda-corpo

Miro descreve a mecânica → reflexão → reexame → tinta / Jaguar XJ6 → Dênis sem placa, sem nome e sem ordem completa → DETRAN → Mauro → Bia diz que estava sozinha → contradição → Rui → abordagem → P11. Dênis não recebe a placa por mágica.

### André / Morsa

Primeira visita nega Maralto. Identidade só depois da cutscene. Documentos anteriores não devem ser lidos como “Morsa = André”; o teste de spoilers cobre o checkpoint `b08-rings-timeline`.

### Noite X

Horários que o puzzle 4 fixa:

| Marco | Tempo |
|---|---|
| Início do arquivo do telefone (real) | 01:22:18 |
| Evento do DJ no telefone (real) | 01:23:30 |
| Início da mesa (relógio do Vértice) | 01:14:48 |
| Evento do DJ na mesa e no set log | 01:16:00 |
| Offset | +450 s |
| Sandra | ~01:16 real |

Não há, no código, uma tabela que marque minuto a minuto “Jana sai / Miro segue / Elisa fica / Sandra volta”. Esses beats estão em entrevistas. Sem um relógio único, esta auditoria não declara uma impossibilidade temporal além do par 01:16 × 01:23:30, que o puzzle trata de propósito.

### Notificações

Um `dispatchActions` ainda pode soltar evidência, documento, pessoa, tarefa e card juntos. Exemplos: abrir o BO, resolver Janus, resolver Saturnalia, terminar Miro, nomear o Omitido. O engine colapsa descobertas do mesmo lote para um aviso de maior prioridade, mas o caderno ainda recebe vários itens de uma ação. Não foi editado: reduzir o lote muda o que o jogador recebe.

---

## 6. Bancada Forense

Um shell (`ForensicWorkbench`) para os puzzles 1–9. Abas sempre desenhadas: Process, Analysis, File, Structure, Packets, Timing, Spectrum, Compare, Notes. O miolo de cada aba só faz sentido se a fonte tiver o dataset (páginas Ogg, pacotes, RF, ciclos, relógio, clips).

Puzzles 10, 11 e 12 abrem `RingsSession`, `RotationSession` e `MemorySession` dentro do mesmo laboratório. Não são a bancada de áudio.

Não há botão de produção chamado Solve, Auto Solve, Clean Voice ou Reveal Message. Há decisões que a ferramenta toma pelo jogador:

- Apply clock correction grava `01:23:30`.
- Difference, quando o ciclo certo é isolado, escreve o texto “Ricardo”.
- Reconstruct do stream B injeta o parágrafo do finding.

Calcular correlação é ferramenta. Entregar a frase do caso é conclusão. HIGH de produto, junto com as três UIs separadas.

Controles Reverse, Normalize e Fade aparecem e não entram em `forensicAudio.ts`. MEDIUM: o controle mente.

`AudioLabPanel` ainda tem “Recuperar trecho inicial” e “Registrar leitura forense” no caminho sem sessão forense.

Painéis não montados, com botão de solve antigo: `HexagonSession.tsx`, `ShepherdMoonsSession.tsx`, `EnceladusSession.tsx`, `CassiniSession.tsx`. MEDIUM de repositório, não de jogador.

DEV (`import.meta.env.DEV`) mostra PIN, ordem, SSRC e ciclo. Some no build de produção.

Reset de transporte limpa o processamento e mantém fragmentos e container. Reset DEV de puzzle só desfaz as conquistas e flags dos puzzles 1–5. MEDIUM.

Áudio: `loadAsset` agora chama `stop()` antes de decodificar a fonte nova. Antes, trocar o arquivo deixava o grafo anterior tocando.

Nomenclatura: waveform e spectrogram estão nomeados como o que são. O analisador de frequência da aba Analysis lê o espectro do dataset, não um FFT ao vivo; o espectrograma da timeline é STFT quando o stem decodifica.

---

## 7. Assets

Scanner em `tests/unit/canonicalProgression.test.ts`: todo path `/assets/...ext` citado entre aspas em `src/forensic`, `src/data`, `src/components/investigation` e `src/components/story` existe em `public/`. Slots `RC_SLOT_00`–`09` e os PNG do puzzle 10 (prefixo `P10_ASSETS`) também. BG-03 não aparece em `ringsPuzzle.ts` nem em `MorsaCctvReveal.tsx`.

| Asset | Used by | Exists | Loaded | Runtime verified | Problem |
|---|---|---|---|---|---|
| `public/assets/audio/forensic/puzzle01/p01_corrupted_base.wav` + clips | P01 bancada | Sim | Pela sessão | Não ouvido nesta auditoria | Catálogo ainda aponta `emergency-call-0803.wav` |
| `puzzle02/rafael_1610_2147_full.mp3` | P02 | Sim | Sim | Não | UI diz `.ogg` |
| `puzzle03` mp3 final | P03 | Sim | Sim | Não | `rec_vtx_old_01.wav` órfão |
| `puzzle04` phone wav + desk mp3 | P04 | Sim | Sim | Não | wav da mesa também existe e não é o path da sessão |
| `puzzle05` master + 10 slots | P05 | Sim | Sim | Não | Master de origem tem o typo “Reporatgem”; o runtime usa `livia_maralto_master.mp3` |
| `UNK_01`–`06.wav` | P06 | Sim | Sim | Não | — |
| `puzzle07` captura RF + derivados | P07 | Sim | Sim | Não | — |
| `AUD_0008.wav` / `p08_enceladus_final.wav` | P08 | Sim | Sim | Não | — |
| PCAP + streams A/B | P09 | Sim | Sim | Não | MP3 humanos são fonte de build em `src/assets/audios/p9/` |
| PNG BG/SP do p10 + wavs | P10 | Sim | Pela UI da cutscene | Não renderizado | Primeiro `existsSync` do PNG fonte levou ~31 s (disco/antivírus); o arquivo existe |
| `puzzle11` train/vtr wavs | P11 | Sim | Sim | Não | `Train Sounds.mp3` é fonte em `src/assets/audios/p11/` |
| `puzzle12/memory_final_message.wav` e derivados | P12 | Sim | Sim | Não | `region_*_window.wav` existem e nenhum `src/` os cita |

Não renomeei arquivos.

Áudio no código: um `AudioContext` por montagem da bancada, `dispose()` fecha, rAF do playhead e da clareza têm cleanup. Seek para e recomeça. Save não guarda “está tocando”. Não foi medido vazamento em sessão longa de browser.

---

## 8. Estados, flags, save, DEV

Save: `createGameSaveSnapshot` guarda o estado de investigação e tira `discoveries` e `toastQueue`.

DEV: `loadDevCheckpoint` → `buildStateFromActions` → `createInitialState` + ações cumulativas + `runStoryEngine`. Voltar um checkpoint reconstrói do zero, não faz delta em cima do save atual. O mesmo `restore` do save. Checkpoints tardios incluem evidência de fim de bloco de propósito; não vazam `morsa_was_andre` antes de `b08-rings-done`, nem a escala antes de `b08-end`, nem a morte antes de `b09-death`, nem MEMÓRIA antes de `b09-end`. Teste: `tests/unit/canonicalProgression.test.ts`.

Buraco que foi fechado: o snapshot “fim do bloco 2 / 6 / 8” omitia flags que o jogo ao vivo já teria gravado (`block01_emergency_provisional`, `block02_rings_provisional`, `block06_pastor_extracted`, `block08_morsa_continuity_confirmed`, `block08_morsa_reveal_played`). Sem elas, um salto DEV até o final não marcava quatro conquistas. As flags foram acrescentadas aos entry actions. Nenhum trigger de história depende delas.

Produção: o painel DEV não entra no bundle (`import.meta.env.DEV`).

---

## 9. Achievements

As doze existem em `seedAchievements.ts`:

| id | Título | Dispara quando |
|---|---|---|
| ach-cassini-division | DIVISÃO DE CASSINI | `block01_emergency_provisional` |
| ach-iapetus | IAPETUS | `block02_rafael_forward_provisional` |
| ach-rings | ANÉIS | `block02_rings_provisional` |
| ach-janus-epimetheus | JANUS E EPIMETHEUS | `block03_janus_done` |
| ach-saturnalia | SATURNALIA | `block03_saturnalia_done` |
| ach-hexagon | HEXÁGONO | puzzle e diário |
| ach-shepherd-moons | LUAS PASTORAS | extraído e concluído |
| ach-enceladus | ENCELADUS | flag ou evidência `anon_audio_ricardo_name` |
| ach-cassini-huygens | CASSINI-HUYGENS | `block07_cassini_done` |
| ach-ordem-aneis | ORDEM DOS ANÉIS | cutscene confirmada |
| ach-rotacao-saturno | ROTAÇÃO DE SATURNO | escala ligada a Augusto |
| ach-memoria | MEMÓRIA | `block09_memory_done` |

Títulos de bloco 5–9 são spoiler e ficam ocultos até desbloquear. Descrições dos doze puzzles não dizem Morsa=André, VTR-14=Augusto nem a palavra final antes da hora. Unlock é grudento. O teste do estado `b09-end` exige as doze `unlocked`.

Enceladus também olha a evidência. Essa evidência só é adicionada no solve. Não há disparo antecipado no fluxo normal.

---

## 10. Testes, build, o que não foi visto

| Verificação | Resultado |
|---|---|
| `npm run build` (`tsc -b` + Vite) | Passou. Aviso de chunk > 500 kB |
| `npx oxlint` | Exit 0. Só warnings já existentes (hooks, fast refresh) |
| `npx vitest run` | 242 testes passaram. Duas suítes (`linkBoard`, `phoneAppRouter`) falharam ao carregar com `file:///src/assets/sprites/bia.png` sem path absoluto. Reexecutadas sozinhas: 3 testes passaram. Flake de resolução de asset sob carga, LOW |
| `tools/test-full-story-progression.mjs` | Roda o teste canônico + bloco 3 |
| Playwright / e2e | Não executado. `tests/e2e/block03.spec.ts` ainda exige `nico_recording_portable` e clica `janus-provisional-panel` / `janus-provisional-sync`, ids que não existem no runtime |
| Browser 1920, 1366, 2560 | Não verificado |
| Cutscene (texto cortado, último clique, fade) | Não verificado na tela |
| Vazamento de WebAudio em sessão longa | Não medido |

Contrato novo coberto por teste: blocos 1–9 alcançáveis, doze conquistas no final, Saturnalia não identifica Samuel, spoilers ausentes antes do marco, assets citados existem, BG-03 ausente.

---

## 11. Problemas

### HIGH

1. **Pasta da Júlia ainda é objetivo do jogador.**  
   Arquivos: `src/data/block01/hospitalInterview.ts`, `src/components/story/HospitalInterviewScene.tsx`, `src/data/game/seedStory.ts` (`task_julia_folder`), `src/data/game/seedEvidence.ts` (`julia_kept_folder`).  
   Conflito: a subtrama foi retirada; o hospital ainda pede para recolher uma pasta de conteúdo desconhecido, e a tarefa não tem conclusão.  
   Decisão humana: apagar o tópico, a evidência e a tarefa, ou reescrever o que Júlia guarda. Não escolhi.

2. **A bancada não é um instrumento estável, e às vezes conclui.**  
   Arquivos: `AudioLabPanel.tsx` (sessões 10–12), `ForensicWorkbench.tsx` (clock correction, Difference, Reconstruct B), `Inspector.tsx` (Reverse/Normalize/Fade).  
   Conflito: puzzles 10–12 são outros programas; três ações escrevem a frase do caso.  
   Decisão humana: o quanto a UI pode dizer depois de um gesto técnico, e se 10–12 devem permanecer fora do shell. Não redesenhei.

### MEDIUM

1. `personRegistryGates.ts`: Samuel Teixeira fica visível com `block03_saturnalia_done`, status continua `mentioned`. O handler não promove a pessoa. Decidir se “nome citado” já pode aparecer ou só depois da ficha.
2. `task_trace_emergency_call` é criada e nunca completada (`block01Handlers.ts`, `block01EndTasks`).
3. `onMaraltoLineWeighed` chama `onMaraltoReflectionDone` na hora. `comparePhoneFilesSequence` chama `onCoincidenceReflectionDone` na hora (`block05Handlers.ts`). A cena de reflexão não precisa ter sido vista.
4. `block02_complete` só sai do trigger com quatro evidências (`nico_dj_identified`, `paula_leads_lucas`, `elisa_case_summary`, `nico_elisa_witness`). Pular o doc de testemunhas segura o bloco 3.
5. Puzzle 02 completa sem o segundo trecho (`seg_cabine`).
6. Puzzle 04 grava `01:23:30` no botão, em vez de o jogador ler o tempo alinhado.
7. Puzzle 06: a bancada termina quando os seis espectrogramas foram abertos. O PIN continua no diário, sem ser mostrado na bancada. A leitura do algarismo romano não é verificada.
8. Puzzle 09: proveniência do P12 usa hash/timestamp de `puzzle12Meta.json`, não um artefato criado na sessão de reconstrução.
9. Quatro painéis antigos com solve permanecem no repositório e não são montados.
10. Reverse, Normalize e Fade não alteram o grafo.
11. `resetForensicSpeechProgress` só limpa narrativa dos puzzles 1–5.
12. Vários handlers empilham evidência, pessoa, tarefa e card no mesmo gesto (BO, Janus, Saturnalia, Miro, Omitido).
13. E2E do bloco 3 ainda dirige o painel provisório do Janus.
14. Puzzle 07 (462.575 MHz, qualidade ≥ 0.62) e puzzle 08 (ciclo 5, correlação 0.68) dependem de número de folha além do conceito.

### LOW

1. Dois playbacks da emergência: catálogo `emergency-call-0803.wav` e stems `puzzle01/`.
2. `puzzleMeta.puzzleId` `puzzle-01-emergency-call` versus sessão `puzzle-01-cassini`.
3. `region_A`–`D_window.wav` do puzzle 12 sem referência em `src/`. Wavs duplicados de puzzle 03 e 04 não usados pela sessão.
4. Painel DEV mostra respostas esperadas.
5. Walkthroughs ainda descrevem hexágono por metadados e puzzles 07–09 pelos painéis velhos.
6. `nico_recording_portable` continua no catálogo; a entrevista não entrega mais.
7. Evidência do puzzle 11 ainda se chama `rui_police_approach_records`.
8. Build avisa chunk único acima de 500 kB.
9. Vitest, sob carga, às vezes resolve sprite como `file:///src/assets/sprites/bia.png`.
10. Título `mariana_andre_innocence` é mais largo que a fala do Lucas.

---

## 12. Correções técnicas aplicadas

| Arquivo | Problema | Correção | Impacto |
|---|---|---|---|
| `src/forensic/forensicAudio.ts` | Trocar a fonte não parava o grafo anterior | `loadAsset` chama `stop()` antes de decodificar | Um arquivo não continua sob o seguinte |
| `src/forensic/forensicEngine.ts` | `alwaysAvailableTabs` omitia Spectrum, que já estava em `INSPECTOR_TABS` | A lista passa a ser a das abas | A aba permanente coincide com a UI |
| `src/game/story/block03DevCheckpoints.ts` | Fim de bloco 2 não carregava as flags dos puzzles 1 e 3 | `block01_emergency_provisional`, `block02_rings_provisional` | Salto DEV mantém as conquistas |
| `src/game/story/block07DevCheckpoints.ts` | Fim de bloco 6 tinha `pastor_done` sem `pastor_extracted` | Flag acrescentada | Conquista Luas Pastoras no snapshot |
| `src/game/story/block09DevCheckpoints.ts` | Fim de bloco 8 tinha a evidência Morsa sem as flags da cutscene | `block08_morsa_continuity_confirmed`, `block08_morsa_reveal_played` | Conquista Ordem dos Anéis no snapshot |
| `src/game/story/block08Handlers.ts` | Comentário dizia que `morsa_was_andre` só nascia na reflexão | Comentário alinhado ao `onComplete` da cutscene | Nenhum comportamento mudou |
| `tests/unit/block03Story.test.ts` | Exigia Samuel identificado e o áudio portátil do Nico | Assert do contrato atual | Teste deixa de pedir o lead mágico |
| `tests/unit/block02Story.test.ts` | Arquivo do Vértice “identificava” Nico | Nico só depois de `runProvisionalRingsAnalysis` | Teste segue o puzzle 3 |
| `tests/unit/block07Story.test.ts` | Ordem Júlia → hospital → Renata e SSRC `A1`/`B7` | Ordem Júlia → Renata → hospital; SSRC reais | Teste segue o handler vivo |
| `tests/unit/puzzle03Anels.test.ts` | Lista de abas sem Spectrum | Spectrum incluído; continua proibido rótulo de puzzle | — |
| `tests/unit/puzzle05Saturnalia.workbench.test.tsx` | 24 cliques estouravam 5 s sob carga | Timeout 20 s | — |
| `tests/unit/puzzle10Rings.test.ts` | Primeiro stat do PNG fonte leva ~31 s | Timeout 60 s | O arquivo existe |
| `tests/unit/canonicalProgression.test.ts` | Não havia checagem do caminho inteiro | Novo | Blocos, conquistas, spoilers, assets |
| `tools/test-full-story-progression.mjs` | Pedido de script | Encaminha para o teste acima | Não é um engine novo |

---

## 13. Pendências editoriais / semânticas

Não foram alteradas:

- O que fazer com a pasta da Júlia (apagar ou substituir o que ela guarda).
- Se Samuel pode aparecer como “mencionado” no instante em que Saturnalia termina.
- Se as reflexões do bloco 5 devem tocar mesmo quando o handler já gravou a flag.
- Se o botão de correção de relógio pode escrever 01:23:30.
- Se Difference e Reconstruct podem escrever “Ricardo” e o parágrafo do stream B.
- Se puzzles 10–12 devem continuar fora do shell da bancada.
- Se a conclusão do hexágono é “abri os seis gráficos” ou “li os romanos”.
- Se o hash do puzzle 12 precisa nascer na sessão do puzzle 9, em vez do meta de build.
- Texto da evidência de Lucas (“inocência”).
- Lotes de notificação (BO, Janus, Saturnalia, Miro, Omitido).
- Reescrever qualquer diálogo, nome de pista ou solução.

Pontos que precisariam de decisão, sem escolha desta auditoria:

1. Manter, cortar ou repor `julia_folder` / `task_julia_folder` / `julia_kept_folder`.
2. Gate de Samuel: `block03_saturnalia_done` ou só `block04_samuel_search_unlocked`.
3. Reflexão do bloco 5: obrigatória na tela, ou a flag sozinha basta.
4. Quanto texto a bancada pode emitir depois de um cálculo.
5. Proveniência do puzzle 12: meta estático é aceitável, ou o solve do puzzle 9 tem de persistir hash e timestamp da sessão.

---

## 14. Cadeia que a auditoria usou como régua

Para cada puzzle a pergunta foi: por que Augusto tem o material, por que analisa, o que se descobre, por que isso muda o caso, qual é o passo seguinte.

| Puzzle | A cadeia fecha? |
|---|---|
| 01–03, 05, 07, 08, 10, 11, 12 | Sim no runtime |
| 04 | O salto de relógio fecha. A noite completa de Jana/Miro/Sandra não está no puzzle, está nas cenas |
| 06 | O material e o diário fecham. A bancada não exige que o romano tenha sido lido |
| 09 | A separação fecha. O elo com o puzzle 12 é um meta de build, não um arquivo que a sessão acabou de criar |
| 02 | Fecha até o Vértice; o segundo trecho não é necessário |

Nenhum puzzle está implementado como minigame solto sem lead de entrada e sem flag de saída. O furo semântico maior não é um puzzle isolado: é a pasta da Júlia, que ainda pede um objeto que a investigação não usa, e a bancada, que em três gestos escreve a conclusão no lugar do jogador.

---

## 15. Follow-up — rodada de correção semântica (2026-11-14)

Histórico acima **preservado**. Decisões humanas aplicadas; ver também `docs/audits/SATURNUS_SEMANTIC_AUDIT.md`.

| Item | Status |
|---|---|
| P02 nomenclatura (não fluxo) | FIXED — `rafael_voice_to_augusto` |
| P03 proveniência Mariana→Rafael→Augusto | FIXED (revertido Vértice→Augusto) |
| P03 design multimídia | PENDING ASSET — arquitetura OK; `P03_SECOND_TRACK_REQUIRED` |
| P02→P3→Nico→P4 gating | FIXED — 1ª visita ≠ Nico; P3 técnico ≠ Nico; 2ª visita = Nico |
| P04 dataset Noite X | FIXED — `src/data/block03/noiteXChronology.ts` |
| Lucas evidence | FIXED |
| B5 reflections lifecycle | FIXED |
| P08 residual → speech | FIXED |
| P09→P12 artifact runtime | FIXED |
| P11 ID clock-drift | FIXED → `rui_police_approach_records` |
| Pasta Júlia (docs canônicos) | FIXED / LEGACY marked |
| `P02_SEG_CABINE_OPTIONAL` | PENDING (LOW) |
| Playthrough P01/P10/P12 | PENDING PLAYTHROUGH |
