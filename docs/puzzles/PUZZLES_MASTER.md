# Puzzles forenses — tutoriais completos (P01–P12)

**Documento único de desenvolvimento** — substitui `puzzle01_tutorial.txt` … `puzzle12_tutorial.txt`. Não aparece ao jogador.

**Fonte de verdade técnica (conclusão QA):** `src/forensic/canonicalPuzzleCompletion.ts`  
**Sessões:** `src/forensic/puzzles/puzzle*.ts` · UI especial: P10 `RingsSession`.

Legenda narrativa: P07 = Bloco 6 · P08–P09 = Bloco 7 · P10–P11 = Bloco 8 · P12 = Bloco 9.

**Manutenção:** alterou handler, `doneFlag` ou `completion.kind` → atualizar a tabela abaixo **e** o tutorial da seção correspondente neste arquivo. Os `.txt` individuais são legado espelhado; preferir só este Master.

---

## Índice canônico (referência rápida)

| ID | Título | sessionId | Evidência (abre bancada) | doneFlag | UI |
|----|--------|-----------|---------------------------|----------|-----|
| P01 | Divisão de Cassini | puzzle-01-cassini | emergency_call_raw | block01_emergency_provisional | Workbench |
| P02 | Iapetus | puzzle-02-iapetus | rafael_audio_reply (+ alias legado) | block02_rafael_forward_provisional | Workbench |
| P03 | Anéis | puzzle-03-anels | rec_vtx_old_01 | block02_rings_provisional | Workbench |
| P04 | Janus e Epimetheus | puzzle-04-janus-epimetheus | nico_recording_booth | block03_janus_done | Workbench |
| P05 | Saturnalia | puzzle-05-saturnalia | livia_radio_archive_raw | block03_saturnalia_done | Workbench |
| P06 | Hexágono | puzzle-06-hexagon | hex_audio_unk_01…06 | block04_hex_spectrograms_inspected* | Workbench |
| P07 | Luas pastoras | puzzle-07-shepherd-moons | valter_group_active_intercepts | block06_pastor_extracted | Workbench |
| P08 | Enceladus | puzzle-08-enceladus | anon_hospital_burst_audio | block07_enceladus_done | Workbench |
| P09 | Cassini-Huygens | puzzle-09-cassini-huygens | henrique_rtp_capture | block07_cassini_done | Workbench |
| P10 | Ordem dos anéis | puzzle-10-rings | protest_heterogeneous_sources | block08_rings_timeline_solved | RingsSession |
| P11 | Rotação de Saturno | puzzle-11-saturn-rotation | rui_police_approach_records | block08_rotation_done | Workbench |
| P12 | MEMÓRIA | puzzle-12-memory | mariana_recent_recording_claim | block09_memory_done | Workbench |

\*P06: survey na bancada; **`block04_hexagon_done`** só após PIN **481526** no diário (`onHexagonSolved`). Conquista HEXÁGONO exige diário.

### Índice de seções

1. [P01 — Divisão de Cassini](#p01--divisão-de-cassini)
2. [P02 — Iapetus](#p02--iapetus)
3. [P03 — Anéis](#p03--anéis)
4. [P04 — Janus e Epimetheus](#p04--janus-e-epimetheus)
5. [P05 — Saturnalia](#p05--saturnalia)
6. [P06 — Hexágono](#p06--hexágono)
7. [P07 — Luas pastoras](#p07--luas-pastoras)
8. [P08 — Enceladus](#p08--enceladus)
9. [P09 — Cassini-Huygens](#p09--cassini-huygens)
10. [P10 — Ordem dos anéis](#p10--ordem-dos-anéis)
11. [P11 — Rotação de Saturno](#p11--rotação-de-saturno)
12. [P12 — MEMÓRIA](#p12--memória)

---

<a id="p01--divisão-de-cassini"></a>
## P01 — Divisão de Cassini

Bancada Forense / `emergency_call_raw` / EMG_0803.wav  
Calibração progressiva: Center → Depth → Width → Noise Profile + Spectral.

### Estado inicial

- **Arquivo:** EMG_0803.wav (`evidenceId: emergency_call_raw`)
- **Audível:** material degradado (CORRUPTED_BASE = puzzle01_final.wav). Indícios de voz; nenhuma frase confiavelmente inteligível.
- **Recovered Speech:** "No intelligible speech recovered."

Layers internos (só MASTER na UI):

| Layer | Mix | Notas |
|-------|-----|-------|
| CORRUPTED_BASE | 1.00 | |
| VOICE (clips) | 1.00 | presença por clip via score do segmento |
| BACKGROUND_NOISE | 0.78 | envelope elevado em ~12.0–14.8 s |
| TONE_1700 | 0.12 | forte em escute/medo/confusa/lembro; ~0 em noite |
| VOCAL_DEBRIS | 0.62 | cluster em torno de "desde aquela noite" |
| CLICKS | 0.38 | |

### Progressão (caminho normal)

| Etapa | Ajuste | Frase liberada |
|-------|--------|----------------|
| Center ~1700 Hz | | "eu não lembro" |
| Reduction ~−10 a −14 dB | com Center | "eu estava com medo" |
| Reduction ~−16 a −18 dB | com Center | "eu estava confusa" |
| Width ~180 Hz + Reduction ~−20 a −24 dB | | "escute isso até o fim" |
| Noise Profile 00:00.30–00:01.80 + Spectral ~72/55/30 | | "desde aquela noite" → achievement DIVISÃO DE CASSINI |

### Passo 1 — Análise

Analysis / Spectrogram → localizar pico ~**1700 Hz**.

### Passo 2 — Notch Center

- **Ideal:** Center 1700 Hz
- **Tolerâncias (centerAccuracy):** 1650–1750 → muito alta · 1600–1800 → boa · 1500–1900 → parcial · fora → baixa
- Apenas Center (Reduction ainda 0) desbloqueia **00:38.5** "eu não lembro"
- Pesos: center 0.80 \| depth 0.15 \| width 0.05 \| noise 0.00 · threshold 0.70

### Passo 3 — Notch Reduction (profundidade)

- **Ideal final:** Reduction −24 dB (`fullReductionDb = 24`)
- **~−12 dB** (depth ≈ 0.50) com Center: + **00:22.0** "eu estava com medo" (center 0.45 \| depth 0.45 \| width 0.10 \| noise 0 · threshold 0.68)
- **~−17 dB** (depth ≈ 0.71) com Center: + **00:29.5** "eu estava confusa" (center 0.30 \| depth 0.55 \| width 0.15 \| noise 0 · threshold 0.78)

### Passo 4 — Notch Width

- **Ideal:** Width 180 Hz
- Faixa boa: ~120–260 Hz (`widthQuality ≈ 1`) · aceitável: ~70–400 Hz
- Muito estreito (&lt;~40 Hz) ou largo (&gt;~800–900 Hz): qualidade baixa
- Center 1700 + Reduction ~−22/−24 + Width boa: + **00:04.0** "escute isso até o fim" (center 0.25 \| depth 0.45 \| width 0.30 \| noise 0 · threshold 0.90)
- Width ruim (ex. 20 Hz) → fragmento LOCKED mesmo com −24 dB

### Passo 5 — Noise Profile + Spectral (último fragmento)

**Obrigatório** para "desde aquela noite". Notch completo sozinho **não** desbloqueia (máx. 4 fragments).

- Região óbvia (sem fala): **00:00.30 – 00:01.80** → Capture profile
- Qualquer intervalo limpo (~0.5–2.5 s sem voice segments) também pode funcionar
- Spectral ideal: Reduction **72%** · Sensitivity **55%** · Smoothing **30%**
- Pesos: center 0.05 \| depth 0.05 \| width 0.05 \| noise 0.85 · threshold 0.78
- Mascaramento: BACKGROUND_NOISE + VOCAL_DEBRIS

**Perfil contaminado**

- `voiceContamination (0..1)` = overlap temporal da seleção com os 5 clips
- `noiseProfileQuality ≈ (1 − contamination) * durationQuality` (duração boa: ~0.5–2.5 s)
- Perfil limpo → noise↓↓ voz preservada · muito contaminado → voz↓↓↓

**Testes negativos**

- **Select All** (00:00 → 00:44) + Capture + Spectral 72/55/30 → "desde aquela noite" LOCKED
- Selecionar a própria fala (ex. 12.2–14.2) → região piora após redução

### Áudio final (solução completa)

- `CLEAN_VOICE_MAX_GAIN = 0.62` · residual CORRUPTED_BASE ≈ 0.44 no máximo
- `clarityScore` controla ganho do clip limpo; Recovered Speech só no threshold

### Passo 6 — Conclusão

- Cinco segmentos em `forensicRecoveredSpeech[emergency_call_raw]` → `runProvisionalEmergencyAnalysis`
- `block01_emergency_provisional` · `emergency_call_restored` · `ach-cassini-division`
- Hold de unlock: ~**0.70 s** (ou ~75% do clip) com **playhead dentro do trecho** e áudio tocando
- Só sliders **sem** ouvir **não** registra Recovered Speech
- Reset processing **não** apaga fragments

### Calibração manual / métrica

1. Bruto → 0 fragments  
2. Center 1700 → eu não lembro  
3. Center + −12 dB → + eu estava com medo  
4. Center + −17 dB → + eu estava confusa  
5. Center + −24 + Width 180 → + escute isso até o fim (sem noite)  
6. + Profile limpo + Spectral → + desde aquela noite + achievement  

NEG A: Notch completo sem profile → ≤4; noite LOCKED  
NEG B: Center 800 + profile + spectral → não completa  
NEG C: Select All como profile → noite LOCKED  
NEG D: fala como profile → noite LOCKED  

### Debug / DEV

- Métricas: center / depth / widthQ / profileQ / voiceContam / nre / voiceDmg / corrupted / cleanBus
- Por segmento: contributions · clarity / threshold / LOCKED\|UNLOCKED
- `resetForensicSpeechProgress('emergency_call_raw')`
- Dataset: `src/forensic/puzzles/puzzle01Cassini.ts`

---

<a id="p02--iapetus"></a>
## P02 — Iapetus

- **Arquivo:** rafael_1610_2147.ogg / PTT-Rafael-01.11.ogg
- **Evidência canónica:** `rafael_audio_reply` (celular apreendido de Mariana)
- **Legado:** `rafael_voice_to_augusto` (mesmo asset; **não** reenviar por Rafael)
- **Asset:** rafael_1610_2147_full.mp3  
- **Runtime:** `public/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3`

### Canon

- Áudio A = Rafael falando com Mariana (já no aparelho dela)
- Função: Vértice + existência de gravação original que ela enviou (`mariana_club_recording_missing`)
- **Não** é gravação da balada (P3) · **não** é reenviado por Rafael a Augusto

### O que está errado

O áudio para em ~**22.26 s** (depois de “Já trabalhei com ele.”). O final (Vértice) existe no arquivo, mas o container Ogg está quebrado.

### Como resolver

1. FILE — container &gt; decoded
2. STRUCTURE — Page 5 sequence 12 → 5; Rebuild
3. Play após ~22.3 s: “…isso aí foi gravado no Vértice…”
4. Recovered Speech → conclui

### Resultado

- **ONDE?** → Vértice (não revela Nico / Elisa; não entrega P3)
- **Story:** `block02_rafael_forward_provisional`, `rafael_recording_vertice_tag`, `mariana_club_recording_missing`, unlock vertice, `ach-iapetus`
- **Próximo:** 1ª visita ao Vértice → pedir balada a Rafael

---

<a id="p03--anéis"></a>
## P03 — Anéis

- **Sessão:** `puzzle-03-anels` · evidência: `rec_vtx_old_01`
- **Completion:** `speech-recovery` (voz masculina incidental na balada)

### O que o jogador está resolvendo

Gravação da balada (REC_VTX_OLD_01). Entre música e DJ há gritaria de plantonista — voz masculina embutida na mixagem. Resultado na Bancada: trecho isolado + conquista ANÉIS. Nico **não** é identificado aqui — só na 2ª visita ao Vértice.

(Doc legado fingerprint A→B substituído pelo isolamento de voz; `puzzle03Fingerprint.ts` arquivado para futura Faixa B.)

### Como chegar ao arquivo

1. P2 → aponta Vértice  
2. 1ª visita Vértice → **não** entrega REC_VTX_OLD_01; **não** Nico  
3. WhatsApp Augusto → Rafael → pedir gravação que Mariana enviou  
4. Rafael envia → `rec_vtx_old_01` na Bancada  

Proveniência: Mariana → Rafael → Augusto. **Não** arquivo do Vértice. **Não** é o áudio do P2.

### Timing (`puzzle03VoiceMeta.json`)

- Duração: **180 s**
- Voz alvo (`seg_club_male`): **~94.0 – 100.7 s**
- Janela perfil de ruído (sem fala): **~12.0 – 58.0 s**
- Stems: `stem_club_background` / `stem_club_voice_buried`
- Master: `public/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3`

### Passo a passo na Bancada

1. Abrir REC_VTX_OLD_01 — música + DJ + fala masculina quase inaudível  
2. Perfil de ruído em trecho limpo + redução espectral (família P01, escopo menor)  
3. **Play** com playhead no trecho — obrigatório para Recovered Speech  
4. Conclusão: `block02_rings_provisional` · `club_voice_isolated` · `ach-rings` · `task_vertice_cross_reference` · 2ª visita Vértice  

**Não** há fingerprint A→B na sessão atual.

### Depois do puzzle (não é a Bancada)

2ª visita Vértice com trecho isolado → Nicolas “Nico” Prado Reis → `block02_vertice_set_crossref` · `nico_dj_identified` → P4

### Asset / design (dev)

- **PENDING ASSET** — `P03_SECOND_TRACK_REQUIRED`
- Build voz: `tools/audio` + `puzzle03VoiceMeta.json`

### Flags (canônico)

| Marco | Flags / evidência |
|-------|-------------------|
| Entrega | `block02_rafael_club_received` + `rec_vtx_old_01` |
| P3 técnico | `block02_rings_provisional` + `club_voice_isolated` |
| Nico | `block02_vertice_set_crossref` + `nico_dj_identified` (2ª visita) |

Handler: `runProvisionalRingsAnalysis` · Session: `puzzle03AnelsSession`

---

<a id="p04--janus-e-epimetheus"></a>
## P04 — Janus e Epimetheus

- `evidenceId: nico_recording_booth`
- `sessionId: puzzle-04-janus-epimetheus`
- Runtime desk: `public/assets/audio/forensic/puzzle04/puzzle04_desk_source.mp3`
- Runtime phone: `public/assets/audio/forensic/puzzle04/puzzle04_phone_source.wav`

### Canon técnico (não mudar offsets)

- Phone file start REAL **01:22:18** · DJ marker t=72s → **01:23:30** REAL
- Desk file start local **01:14:48** · DJ marker t=72s → **01:16:00** local
- **Offset formal +450s (+07:30)**
- Set log: 01:14:xx Levels · 01:16:00 transição (relógio local da casa)
- Após apply: 01:16:00 local + offset → 01:23:30 referência externa

### UI — mesmo Forensic Workbench

Sem wizard, sem etapas numeradas, sem telas exclusivas.

Arquivos na sessão:

- REC_VTX_PHONE_NX.m4a — áudio
- VTX_DESK_FEED_NX.wav — áudio
- SET_LOG / INFRA — `.txt` (sem waveform)

### Fluxo tutorial (overlays sobre UI real)

1. Abrir o primeiro áudio — waveform única (como P1–P3)
2. Arrastar o segundo da gaveta Files — **Compare** (duas faixas)
3. **Clock align** — Δ colocação **&lt; 0,2 s**
4. **Salvar** (disquete) quando Δ válido
5. **Timing** — «Aplicar offset de referência» para ancorar o set log

Ferramentas globais: Compare, Clock align, Timing, Files.

### Finding técnico (handler / caderno)

```
Offset de relógio formalizado: referência externa adiantada +00:07:30 em relação ao relógio local da cabine.
```

(`puzzle04FindingText` em `puzzle04Janus.ts` — investigação recebe finding após handler; conclusão Sandra/Elisa vem das entrevistas.)

---

<a id="p05--saturnalia"></a>
## P05 — Saturnalia

### Asset master

- `src/assets/audios/p5/Lívia - Maralto Reporatgem Full Audio.mp3`
- Cópia: `public/assets/audio/forensic/puzzle05/livia_maralto_master.mp3`
- Duração: **324.519 s** — nunca alterar o master no lugar

### Fragments (10)

Script: `tools/audio/build_puzzle05_saturnalia.py`  
Pasta: `public/assets/audio/forensic/puzzle05/RC_SLOT_00.mp3` … `RC_SLOT_09.mp3`

| Slot | Duração ~ |
|------|-----------|
| 00 | 32.407 s |
| 01 | 32.346 s |
| 02 | 32.312 s |
| 03 | 32.677 s |
| 04 | 32.552 s |
| 05 | 32.212 s |
| 06 | 32.482 s |
| 07 | 32.387 s |
| 08 | 32.577 s |
| 09 | 32.567 s |

### Mapping cronológico → slot

| Seg. | Slot |
|------|------|
| 1 | 06 |
| 2 | 07 |
| 3 | 08 |
| 4 | 09 |
| 5 | 00 |
| 6 | 01 |
| 7 | 02 |
| 8 | 03 |
| 9 | 04 |
| 10 | 05 |

- **Ordem física (exportação):** 00 → 01 → … → 09  
- **Ordem cronológica (solução):** **06 → 07 → 08 → 09 → 00 → 01 → 02 → 03 → 04 → 05**

### NEXT WRITE SLOT

Log `RC_LOGGER_BUFFER.txt`:

```
LOGGER BUFFER
MODE: CIRCULAR
SLOTS: 10
NEXT WRITE SLOT: 06
EXPORT MODE: PHYSICAL SLOT ORDER
```

Buffer circular cheio → NEXT WRITE aponta para o conteúdo mais antigo → reconstrução começa em **06**.

### Como resolver

1. Abrir `livia_radio_archive_raw`
2. Ouvir slots / ler `RC_LOGGER_BUFFER.txt`
3. Structure → Sequence: reordenar ↑↓
4. Assemble sequence
5. Ordem correta → Continuity check passed

### Findings

- Cobertura dos protestos — núcleo mascarado (`protest_masked_core`)
- “Morsa” — apelido recorrente (`morsa_unidentified`) — **sem** identidade

### Achievement

`ach-saturnalia` · SATURNALIA — “Reconstruiu a cobertura bruta dos protestos da Maralto.”

### Story / flags (`runSaturnaliaReconstruct`)

`block03_saturnalia_done` · `protest_masked_core` · `morsa_unidentified` · discoverPerson morsa · discoverSearchTerm morsa, protesto · `task_saturnalia` complete · `block03_complete` · `task_identify_morsa` · `ach-saturnalia`

**Não** discover Samuel / **não** `samuel_protest_lead`.

### Caminho até Samuel

Saturnalia → Morsa / protestos → pesquisar Maralto ou protesto → `doc-protesto-ocorrencia` → `doc-protesto-detidos` → `doc-samuel-ficha` → visita Samuel

### Lívia (entrega)

Mariana pediu material antigo dos protestos; Lívia entrega bruto; Mariana não explicou o objetivo — só queria o bruto, não a matéria editada.

### DEV

`expectedOrder`, `currentOrder`, `nextWriteSlot`, `sequenceValid`, `puzzleComplete`

---

<a id="p06--hexágono"></a>
## P06 — Hexágono

### Origem narrativa

Seis arquivos anônimos pelo canal desconhecido. Ordem UNK_01 … UNK_06. Sem dicas textuais na UI.

### Assets

| Arquivo | ~s | textura | símbolo | dígito |
|---------|-----|---------|---------|--------|
| UNK_01.wav | 6.8 | electrical | IV | 4 |
| UNK_02.wav | 8.4 | metallic | VIII | 8 |
| UNK_03.wav | 5.1 | airy | I | 1 |
| UNK_04.wav | 7.3 | pulsing | V | 5 |
| UNK_05.wav | 5.9 | granular | II | 2 |
| UNK_06.wav | 7.8 | unstable | VI | 6 |

Build: `python tools/audio/build_puzzle06_hexagon.py`  
DEBUG: `tools/audio/out/puzzle06_debug/UNK_0N_spectrogram.png` (não na UI)

### Acústica dos símbolos

- **I** — transiente banda larga (linha vertical no STFT)
- **V** — chirp 4400 → 1900 → 4400 Hz (forma V no espectrograma)
- Banda preferencial ~**1.6–4.8 kHz**

### Solução

**IV VIII I V II VI** → **481526**

### Como jogar na Bancada

1. Abrir UNK (sessão com seis sources)
2. Ouvir + Timeline → **Spectrogram**
3. Ler algarismo romano em cada arquivo
4. **Sem** botão DECODE / PIN na Bancada

### Integração (duas fases)

**Fase A — Survey na Bancada**

`runHexagonSpectrogramSurvey` → `block04_hex_spectrograms_inspected` · `hex_spectral_patterns` · `block04_forensics_unlocked` · `task_phone_forensics` (se aplicável)  
(**Não** registra 481526 na bancada)

**Fase B — Diário no celular** (após laudo / `block04_forensics_access`)

`tryDiaryPin('481526')` → `onHexagonSolved` → `block04_hexagon_done` · `diaryUnlocked` · `hidden_diary_recovered`  
Achievement HEXÁGONO: `block04_hexagon_done` + diário

### Story actions

- `onHexCallsPreserved` → `hex_audio_unk_01…06`, `block04_hexagon_available`
- Survey → `block04_hex_spectrograms_inspected`
- PIN → `block04_hexagon_done`

### DEV

`expectedPin 481526` · `surveyComplete` · por UNK `expectedSymbol`

### Notas

- Numerais só no WAV, não na UI
- Puzzles 01–05 intactos

---

<a id="p07--luas-pastoras"></a>
## P07 — Luas pastoras

### Lore

Jana / grupo do velho · interceptação Válter/Miro · objetivo: próxima entrega → flagrante · Miro preso por crimes atuais.

### Assets

- `src/assets/audios/p7/Capangas do Valter - Track A.mp3` — Canal A
- `… Secret Track B.mp3` — Canal B oculto
- `… Track C.mp3` — Canal C

Build: `python tools/audio/build_puzzle07_shepherd_moons.py`  
Runtime: `public/assets/audio/forensic/puzzle07/`

### Captura

**INTERCEPT_0511_RF_CAPTURE** · 240 s  
Faixa **462.480–462.670 MHz**

| Canal | MHz | Notas |
|-------|-----|-------|
| A | 462.525 | potência alta |
| B (oculto) | 462.575 | bursts fracos |
| C | 462.625 | potência alta |

Captura bruta = A+C misturados (B quase inaudível). Waterfall do dataset (não I/Q real).

### Papel dos canais

- **A** — dívida, chefe (sem G17N)
- **C** — depósito, geladeira (sem G17N)
- **B** — G / 1-7 / Norte / **23:40** → G17N + horário

### Como jogar

1. Abrir `valter_group_active_intercepts`
2. Inspector → Spectrum / waterfall
3. Banda ~**462.575** + bandwidth ~**22 kHz**
4. Extract Channel (A · B · C) — um de cada vez → Files
5. Canal B: ouvir G17N / 23:40
6. `doc-tabela-logistica-g17n` → Galpão 17 — Pátio Norte → Operação / Miro

### Tolerâncias (extract)

- center ± **0.018 MHz** de 462.575
- bandwidth ideal **0.022 MHz** (min 0.012 · max 0.045)

### Flags / actions

- `runShepherdMoonsExtract` → `block06_pastor_extracted`, `pastor_token_g17n`, `pastor_delivery_time_2340`
- `onPastorLogisticsCrossRef` → `block06_pastor_done`, `galpao17_operational_site`, `block06_operation_ready`, unlock galpão-17
- Achievement `ach-shepherd-moons`: extracted + `pastor_done`

### DEV

`knownChannelA` / `hiddenChannelB` / `knownChannelC` · `selectedFrequency` / `selectedBandwidth` · `hiddenChannelOverlap` / `extractionQuality` · G17N recovered / 23:40 recovered · `locationCrossreferenced` (documento) · `puzzleComplete`

### Notas

- Sem botão FIND HIDDEN CHANNEL
- Sem Notch/Noise Profile como solução
- Frequências não codificam G17N

---

<a id="p08--enceladus"></a>
## P08 — Enceladus

### Lore / origem

Número desconhecido → WhatsApp → AUD_0008.wav. Augusto ouve no chat; `receiveAnonHospitalAudio` coloca na bancada. Proveniência aberta.

### Asset de voz

`src/assets/audios/p8/Renata - Ricardo.mp3` — “Ricardo, espera um pouco. Eu já volto aqui, tá?”

### Build

`python tools/audio/build_puzzle08_enceladus.py`

Runtime: `p08_enceladus_final.wav`, `AUD_0008.wav`, `p08_residual_preview.wav`, `puzzle08Meta.json`

### Áudio

- **48 s** · 8 ciclos × **6 s**
- **Ciclo anômalo: 6** (index 5) — fala Renata
- Ciclos 1–5,7–8: padrão hospitalar (bip + mecânico)
- Play bruto: “Ricardo” não claro (~−32 dB LP) · após Difference: residual com voz limpa

### Ferramentas genéricas

1. Selecionar ~1 ciclo (**4.2–7.5 s**)
2. Find Similar Regions (~8 regiões)
3. Stack / Overlay — observar outlier
4. Build Common Pattern — média dos normais (excluir anômalo)
5. Difference / Subtract Reference — alvo = ciclo anômalo

Sem botões “isolar voz” / “solve Enceladus”.

### Thresholds (`puzzle08Meta`)

- findSimilar: min 4.2s · max 7.5s · correlation **0.68**
- commonPattern: min **5** normais · `anomalyPenalty` true
- difference: minQuality **0.55** · ricardoClarity **0.62**

### Completion

- kind: `cycle-difference` → `onEnceladusSolved`
- Recovered Speech: só **"Ricardo"** (`enceladus-ricardo`)

### Flags / story

| Marco | Efeito |
|-------|--------|
| `deliverAnonWhatsApp` | `block07_anon_message_received` |
| `receiveAnonHospitalAudio` | `anon_hospital_burst_audio`, `block07_enceladus_available` |
| `onEnceladusSolved` | `block07_enceladus_done`, `anon_audio_ricardo_name`, task Júlia |
| Júlia → Renata → hospital | `ricardo_old_patient_mariana_shift`, arquivo Freitas |

Cadeia: Enceladus → Ricardo → Júlia → Renata → Henrique (depois pertences / H.V.)

### Achievement

`ach-enceladus` — “Isolou a informação oculta entre os ciclos repetidos.”

### DEV panel

`expectedCycleDuration` · `detectedRegions` · `selectedReferenceCycles` · `anomalyCycle` · `commonPatternQuality` · `differenceQuality` · `ricardoClarity` · `recovered` · `puzzleComplete`

DEBUG: `tools/audio/out/puzzle08_debug/` (cycles, common_pattern, residual_ideal, stack_overlay, master_waveform)

Dataset: `puzzle08Enceladus.ts` · UI: **AUD_0008.wav**

---

<a id="p09--cassini-huygens"></a>
## P09 — Cassini-Huygens

### Lore / origem

Cadeia Ricardo → pertences → H.V. → Henrique → Cecília. TI capturou tráfego; `henrique_rtp_capture` via consulta. Cecília **não** conhece conteúdo das chamadas.

### Assets

- `H.V - Chamado.mp3` → Stream A (Henrique × colega)
- `H.V - O Omitido.mp3` → Stream B (interlocutor anômalo)

Build: `python tools/audio/build_puzzle09_cassini_huygens.py`

### Captura

`hv_session_capture.pcap` · G.711 PCMU 8 kHz · ~2704 pacotes

| SSRC | Papel |
|------|-------|
| 48A21C30 | legítimo (jitter leve) |
| 91F47B12 | anômalo (sequence fora de ordem) |

### Como jogar

1. Abrir `henrique_rtp_capture` → Packets
2. Filter SSRC A → Create Stream → Reconstruct → prova o método
3. Filter SSRC B → Reconstruct (ordem captura) → voz quebrada
4. **Sort by Sequence** → Reconstruct de novo → B inteligível
5. Finding técnico + achievement

### Completion

- kind: `rtp-stream-separation` → `onCassiniSolved`
- Requer streamA + streamB (B order quality **≥ 0.9**)

### Findings

- `henrique_two_rtp_sessions`
- `henrique_talked_to_contextual_system` — conhecimento só no PC de Henrique

**Não** nomear “O Omitido” nesta etapa.

### Achievement

`ach-cassini-huygens` · `block07_cassini_done`

Artefato derivado stream B relevante para **P12**.

### DEV

`packetCount` · streamA/streamB SSRC · `selectedSSRC` · `streamAOrderQuality` · `streamBOrderQuality` · `sequenceErrors` · `reconstructionQuality` · `streamARecovered` · `streamBRecovered` · `puzzleComplete`

DEBUG: `tools/audio/out/puzzle09_debug/` (`stream_a_correct.wav`, `stream_b_correct.wav`, `stream_b_capture_order.wav`, `packet_dump.tsv`, pcap)

Dataset: `puzzle09CassiniHuygens.ts` · `puzzle09Meta.json`

---

<a id="p10--ordem-dos-anéis"></a>
## P10 — Ordem dos anéis

**UI:** `RingsSession` (não waveform clássica)

### Motivação

Augusto reconstrói percurso de Morsa (Mariana investigava). **Não** suspeitar Morsa = André antes da CAM 11.

### Materiais

- A — `livia_protest_clip.wav` (sirene)
- B — Samuel: `samuel_phone_clip.wav` + BG-01 + sprite mascarado
- C — vídeo secundário: BG-02 + flicker
- D — DVR catálogo + storage (sem André no thumb)

Assets: `src/assets/audios/p10/` → `public/assets/block08/rings/p10/`  
**Não** usar BG-03.

Sirene: `police-siren.mp3` em Lívia + Samuel  
Build: `python tools/audio/build_puzzle10_rings.py`

### Fluxo

1. Audio Fingerprint Compare: Lívia + Samuel → sirene long-short-short-long
2. Compare Frame Pattern: Samuel + secundário → flicker compartilhado
3. Mapa: eliminar oeste/leste → passagem de serviço (BG-01→02→04→05)
4. CFTV: CAM 03 / 07 / 11 cobrem o trecho
5. DVR: CAM11_SEG_1278 e _1280 (**1279 ausente**)
6. Inspect Media Structure → ~60 s gap
7. Storage search CAM11 / 1279 → UNINDEXED → cutscene
8. CAM03 21:14:08 mascarado → CAM07 21:14:31 → CAM11 21:15:02 sem máscara
9. Augusto: “André.”
10. `block08_morsa_reveal_played` + `morsa_was_andre`
11. Reflection → confronto André

### Flags

- `block08_rings_timeline_solved` (passagem deduzida)
- `block08_morsa_continuity_confirmed` / `block08_morsa_reveal_played`
- `block08_rings_done` (após reflection)

### Achievement

`ach-ordem-aneis` — “Reconstruiu o percurso oculto de Morsa.”

### DEV

`liviaSamuelFingerprint` · `videoFramePatternMatch` · `knownMorsaPositions` · `routeCandidates` · `selectedRoute` · `servicePassageInferred` · `cameraCoverageUnlocked` · `missingSegmentExpected` · `rawSegmentFound` · `revealPlayed` · `morsaWasAndre`

---

<a id="p11--rotação-de-saturno"></a>
## P11 — Rotação de Saturno

### Motivação

Rui: parado alcoolizado, liberado apesar da bebida, viatura no sentido contrário, minutos depois guardrail. **Não** começar sabendo **VTR-14**.

### Depoimento de Rui

Atrasado → trem na passagem → acelera → parado → rádio carro em chamas → liberado → retrovisor viatura contrária → guardrail. **Não** perguntar códigos CAD / “lembra trem?” · Rui **não** identifica Augusto.

### Asset

`src/assets/audios/p11/Train Sounds.mp3` (obrigatório)  
Derivados: `train_reference_clean.wav`, `train_distant_radio_reference.wav`, `vtr08/14/21_radio_window.wav`

Build: `python tools/audio/build_puzzle11_saturn_rotation.py` (seed **4111111**)

### Passagem correta

**PN-NORTE-03** — Passagem Norte  
Janela trem: ocupação **01:12** · liberação **01:18** · composição **4412**

### Ocorrência CAD

**CAD-1847** · 01:21 · veículo em chamas — possível ocupante  
Unidades genéricas — **não** “VTR-14 abandonou Rui”

### Candidatos

| VTR | Por que eliminar / manter |
|-----|---------------------------|
| VTR-08 | setor sul; rota incompatível |
| VTR-21 | longe passagem norte |
| **VTR-14** | passagem + trem + CAD-1847 + AVL (**solução**) |

### Fingerprint

Compare: referência ferroviária × rádio viatura — match forte só **vtr14 (≥ 0.72)**

### AVL

VTR-14: PN-NORTE-03 → sentido contrário → acostamento CAD-1847

### Completion

Passagem + CAD-1847 + fingerprint VTR-14 + AVL VTR-14 + VTR-08/21 incompatíveis → finding abordagem não registrada (**ainda não** revela Augusto).

### Escala

`doc-escala-vtr14` — condutor **Augusto Nogueira** · “Eu parei o Rui.” → `block08_augusto_linked`

### Achievement

ROTAÇÃO DE SATURNO — após `block08_augusto_linked`

### UI / fluxo jogador

Bancada · `rui_police_approach_records`  
Fontes: `rail_crossing_ops.ndjson`, `cad_dispatch_tape.log`, `avl_vtr-*.csv`, WAVs de trem/rádio

1. Structure → consultar passagem + composição; CAD-1847
2. Abrir exports AVL (consulta ao selecionar)
3. Compare fingerprints (duas fontes áudio)
4. Packets AVL → arquivar trajetória incompatível VTR-08 e VTR-21
5. Conclusão automática (`rotationPuzzle`)

Sem painel “Puzzle 11”; DEV snapshot no rodapé.

### Flags / DEV

`block08_rotation_available` · `block08_rotation_done` · `block08_scale_search_unlocked` · `block08_augusto_linked` / `block08_augusto_revealed`

DEV (`import.meta.env.DEV`): `trainCrossingCandidate`, `trainWindow`, `cadIncidentSelected`, `candidateVehicles`, `trainFingerprintByVehicle`, `vehicleRouteCompatibility`, `vtr14Score`, `vtr14Confirmed`, `rosterOpened`, `augustoRevealed`, `puzzleComplete`

### NÃO

offset/ENF/sliders · VTR-14 no CAD · voz Augusto no rádio · achievement antes da escala

Dataset: `rotationPuzzle.ts` · `puzzle11ApproachReconstruction.ts` · `puzzle11SaturnRotation.ts` · `puzzle11Meta.json`

---

<a id="p12--memória"></a>
## P12 — MEMÓRIA

### Momento

Após morte de Mariana no galpão. Gravação “recente” na bancada. **Não** antecipar antes da morte.

### Carrier vocal

Sem TTS · sem asset humano novo. Clips Mariana do **P01** (`src/assets/audios/p1/*.mp3`). Concatenação seed **4121212** → ~**9.2 s**.

Build: `python tools/audio/build_puzzle12_memory.py`

Output runtime:

- `public/assets/audio/forensic/puzzle12/memory_final_message.wav`
- `apartment_room_reference.wav`, `emergency_fingerprint_reference.wav`, `enceladus_pattern_reference.wav`, `cassini_derived_artifact_reference.wav`, `cassini_capture_order_contrast.wav`, `memory_carrier_clean.wav`, `region_*_window.wav`, `capture_meta.json`, `puzzle12Meta.json`

DEBUG: `tools/audio/out/puzzle12_debug/` (`final_message`, `isolated_region_A..D`, `residual_region_*`, `source_comparison_*`, `provenance_report.json`)

### Regiões canônicas

| Região | Janela | Fonte |
|--------|--------|-------|
| A | 0.4–2.1 s | apartamento (room tone chamada apto) |
| B | 3.0–3.8 s | emergência / P01 (`p01_mariana_01_escute`) |
| C | 5.2–6.5 s | Enceladus (padrão ~1 kHz / 6 s) |
| D | 7.0–8.4 s | Cassini **DERIVED** (stream_b_reconstructed − capture_order) |

### Por que D é impossível

Fingerprint aponta para **output da bancada P09**, não PCAP nem `stream_b_capture_order`. Meta sha256 + `createdAt`. Mensagem só pode existir **depois** da reconstrução Cassini.

### Search Case Media

Selecionar janela curta na mensagem · busca no acervo (`memoryPuzzle.ts`). Janela larga (&gt;2.6 s) → hits fracos · janela certa → confirmar proveniência.

### Provenance graph

Centro: FINAL MESSAGE → apartamento · emergência · Enceladus · Cassini derived (cada ligação após confirmação).

### Conclusão narrativa

Não “deepfake” genérico — acesso operacional aos materiais **e** aos resultados da investigação. Palavra: **MEMÓRIA**.

### Achievement

MEMÓRIA — `block09_memory_done`

### Flags / DEV

`block09_memory_available` · `block09_memory_done` · `block09_memory_word_shown`

DEV: `regionA_source`…`regionD_source`, `fingerprintMatches`, `confirmedProvenance`, `cassiniDerivedCreatedAt`, `finalMessageCreatedAt`, `impossibleTemporalDependency`, `memoryComplete`

### Requisitos canônicos

`requiresDerivedArtifacts`: artefato stream B no save (`CASSINI_STREAM_B_ARTIFACT_ID`).

### NÃO

sliders / SSRC / quatro caixas A–D no início · TTS · popup SUCCESS · onisciência / Mariana-IA

Dataset: `memoryPuzzle.ts` · `puzzle12Memory.ts` · `puzzle12Meta.json`

---

## Espelhos legados

Os arquivos `docs/puzzles/puzzleNN_tutorial.txt` podem permanecer como cópias estáticas, mas **este documento é a referência autoritativa**. Ao editar tutoriais, editar **apenas** `PUZZLES_MASTER.md` (e regenerar ou alinhar os `.txt` se o time ainda os usar em scripts).