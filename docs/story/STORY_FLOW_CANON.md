# Fluxo narrativo canônico (Blocos 1–9)

> Extraído para `docs/STORY_MASTER.md`. Regenerar o master com `npm run dump:story-master`.  
> Este texto descreve **o que acontece**, **o que libera o quê** e **como se resolve cada puzzle**.  
> Detalhe técnico extra: `docs/puzzles/puzzleXX_tutorial.txt`.

---

## Como ler este fluxo

Cada bloco: **objetivo → passos em ordem lógica → puzzles (Pn) → o que fecha o bloco**.  
“Libera” = o jogador passa a ter contato, local, áudio, documento ou pendência nova.  
Cenas VN e WhatsApp completos ficam nas Partes II e III do `STORY_MASTER.md`.

---

## Bloco 1 — O desaparecimento

**Objetivo:** Augusto assume o caso; monta o básico; sai do hospital com próximo passo.  
**Fecha com:** `block01_complete` → Rafael no WhatsApp **do Augusto** (conversa ainda vazia).

### Abertura (Mari)

1. Cartão de data → VN no gabinete: Augusto pensa na transferência após **Roberto Siqueira**; pasta de **Mariana Silva**.
2. **Mari** entra, se apresenta, aponta pasta / ligação / celular lacrado.
3. Hub: beat curto da Mari (pasta amarela, fixo, “chama se precisar”) → `mari_hub_welcome_seen`.

### Passos

1. **Pasta** → ler BO → registrar ocorrência (`block01_bo_registered`) → evidências iniciais + pendências.
2. **Bancada** → ligação de emergência → **P01 Divisão de Cassini** (ou análise provisória, conforme build).
3. **Celular Mariana** → WhatsApp **Júlia** (abrir) + **Rafael** (ouvir áudio já no aparelho dela).
4. Contradição automática dos “lapsos” (quando as duas provas de memória coexistem) → **Hospital** no mapa.
5. **Mapa** → Hospital → esgotar assuntos (última vez, comportamento, memória, Camila a sós).
6. Fim da visita → Bloco 1 completo → contato Rafael no Augusto.

### P01 — Divisão de Cassini (ligação de emergência)

- **Entrada:** `emergency_call_raw` / EMG na bancada (após BO).
- **O que é:** áudio degradado; recuperar fala inteligível com filtros (Center ~1700 Hz, Width, Noise Profile, Spectral).
- **Resolução (resumo):** progressive recovery até “desde aquela noite” → achievement / finding de emergência.
- **Libera:** entendimento da ligação + progresso B1 (e evidência restaurada conforme handler).

---

## Bloco 2 — Duas trilhas

**Objetivo:** Trilha do som (Rafael → Vértice → gravação da balada) **e** trilha enfermeira (nota → Paula → Lucas → Elisa). As duas precisam fechar.  
**Fecha com:** Mariana remontando o caso Elisa + pendência **localizar Nico**.

### Trilha do Vértice

1. Augusto → WhatsApp **Rafael** → ouvir / tratar o áudio que Mariana tinha (não é a balada).
2. **Bancada** → **P02 Iapetus** → libera **Vértice** no mapa (+ tag de gravação ausente no celular dela).
3. **1ª visita Vértice** — Mariana / arquivos existem; **sem** Nico; **sem** P03.
4. Augusto → Rafael → pedir a gravação original que ela lhe mandou → Rafael envia a **balada**.
5. **Bancada** → **P03 Anéis** (A→B técnico) → conquista ANÉIS; ainda sem Nico.
6. **2ª visita Vértice** → cruzamento → caminho até **Nico**.

### Trilha Paula → Lucas → Elisa

1. Mariana → **Notas** → anotação da **quarta** → libera **Paula** no Augusto.
2. Augusto → WhatsApp **Paula** (conversa vazia; jogador escreve ~9 trocas) → sobrenome **Moreira** / coisa antiga da família.
3. **Monitor** → **Lucas** → cadastro + endereço → mapa **Universidade** → entrevista completa → reflexão.
4. **Monitor** → **Elisa Duarte** → abrir **resumo** + **testemunhas**.

### Quando as duas trilhas fecham

Com Nico identificado no Vértice + fio Paula/Lucas + Elisa/testemunhas → prova de que Mariana remontava Elisa + tarefa **localizar Nico**.

### P02 — Iapetus (áudio Rafael no celular dela)

- **Entrada:** áudio no WhatsApp de Mariana (`rafael_audio_reply`).
- **Problema:** container Ogg corta ~22,26 s; o final (Vértice) existe mas está quebrado.
- **Resolução:** FILE → STRUCTURE (rebuild página) → ouvir final “…gravado no Vértice…”.
- **Libera:** local **Vértice**; **não** entrega Nico nem a balada (P03).

### P03 — Anéis (gravação da balada)

- **Entrada:** após 1ª visita Vértice, Rafael manda `rec_vtx_old_01` no WhatsApp do Augusto.
- **Problema:** isolar transição musical A → B (DJ no meio).
- **Resolução:** selecionar janelas A e B limpas / fingerprint → chave A→B.
- **Libera:** progresso técnico; Nico só na **2ª** visita ao Vértice.

---

## Bloco 3 — Noites fora de ordem

**Objetivo:** Entrevistar Nico, corrigir a Noite X, entrar em Maralto/protestos, ouvir **Morsa**.  
**Fecha com:** `block03_complete` → pendência **Descobrir quem era Morsa**.

### Passos

1. **Monitor** → nome completo de Nico → telefone → ligar (Augusto) → **Titã** no mapa.
2. **Mapa** → Titã → entrevista Nico (Elisa, Noite X, Mariana, gravações) → reflexão.
3. **Bancada** → duas gravações Noite X → **P04 Janus** → cronologia real da Noite X.
4. Ramo **Maralto / protestos** (gatilho narrativo em revisão — não amarrado só ao fim do P04).
5. **Monitor** → Maralto / reportagem → caminho até **Lívia** (ligar → Rádio no mapa).
6. Entrevista Lívia → arquivo bruto na bancada → **P05 Saturnalia** → apelido **Morsa** + pista **Samuel**.
7. Extra útil: fixo **204 Cartório** → cronologia Elisa; ler em Autos → contradição relógio Vértice × autos.

### P04 — Janus e Epimetheus

- **Entrada:** gravações pós-entrevista Nico (phone + desk feed).
- **Problema:** relógio da casa vs tempo real; offset canônico **+450 s (+07:30)**.
- **Resolução:** Compare (duas faixas) → Clock align (Δ &lt; 0,2 s) → salvar → Timing “Aplicar offset” → 01:16:00 local → **01:23:30** real.
- **Libera:** finding da cronologia Noite X (Sandra ~01:16 local **não** é a saída de Elisa).

### P05 — Saturnalia

- **Entrada:** master/fragmentos da transmissão de Lívia (10 slots).
- **Problema:** ordem cronológica ≠ ordem física dos arquivos.
- **Resolução:** remontar segmentos na ordem canônica (slots 06→07→…→05 conforme tutorial) até a sequência válida.
- **Libera:** Morsa (apelido) + lead Samuel / fim do arco Maralto deste bloco.

---

## Bloco 4 — Memórias emprestadas

**Objetivo:** Samuel + André; descobrir diário oculto; contato desconhecido.  
**Fecha com:** `block04_complete` → **voltar a falar com Nico**.

### Samuel

Monitor → Maralto/protesto → ocorrência + detidos → **Samuel** + endereço → mapa → entrevista.

### André

Monitor → André → visitas (telefone presídio) → ligar → mapa → presídio → entrevista.

### Hexágono → diário

1. Documentos de ligações de André + log do **número sem nome** → contradição de horários.
2. **Fixo toca** → atender (silêncio + um áudio) → reflexão → **6 UNK** na bancada.
3. **P06 Hexágono** → padrões no espectrograma → PIN **481526** (só depois).
4. Fixo **212 Perícia** → laudo → módulo Perícia → PIN → **diário** (não está no launcher do celular).
5. Ler diário → gravação do desconhecido → analisar → fecha Bloco 4.

### P06 — Hexágono

- **Entrada:** seis áudios anônimos UNK_01…06 após a cena do fixo.
- **Problema:** cada arquivo esconde um algarismo romano no **espectrograma** (motivos I/V acústicos).
- **Resolução:** abrir Spectrogram em cada um → ler **IV VIII I V II VI** → dígitos **4 8 1 5 2 6**.
- **Libera:** evidência de padrões espectrais + caminho à Perícia; PIN **`481526`** no diário (não escrito na bancada).

---

## Bloco 5 — O percurso deixado

**Objetivo:** Nico de novo (Jana/jaqueta); Jana; releitura Elisa; Caso → percurso deliberado.  
**Fecha com:** `block05_complete` → reexaminar Elisa via **Geraldo**.

### Passos

1. Mapa Titã → **Nico 2ª** (jaqueta / Jana).
2. Monitor → Jana (autos) → mapa → entrevista (e/ou visita precoce conforme gates).
3. Monitor → peças Elisa (argumento, álibi, testemunha da queda) → reflexão André.
4. Aba **Caso** (conforme libera): Maralto → cronologia de contatos → comparar com celular → reabrir emergência/entrada/apreensão → reflexão **percurso deliberado**.

*(Sem puzzle de bancada numerado neste bloco.)*

---

## Bloco 6 — A pessoa errada

**Objetivo:** Geraldo → Jana 2ª → Válter/Miro → Galpão 17 → Miro preso.  
**Fecha com:** `block06_complete` → pressionar Miro de novo.

### Passos

1. Geraldo (autos + ficha + comanda Vértice) → mapa → entrevista → reflexão.
2. Jana 2ª → medo do grupo do **Válter**.
3. Consultas Válter/Miro → interceptação de rádio.
4. **P07 Luas Pastoras** → token **G17N** → **Galpão 17**.
5. Mapa → operação → entrevista Miro → reflexão.

### P07 — Luas Pastoras

- **Entrada:** captura RF / interceptações do grupo.
- **Problema:** canais A e C altos; canal oculto **B** fraco (entrega).
- **Resolução:** waterfall → isolar B (462.575 MHz) → ouvir → **G / 1-7 / Norte** → **G17N** (+ horário). Notificar/usar G17N **após escuta** do canal oculto.
- **Libera:** local Galpão 17 / operação.

---

## Bloco 7 — O homem que não era Ricardo

**Objetivo:** Miro 2ª → Sandra → lapsos → Enceladus → Ricardo falso = Henrique → Cecília → Cassini.  
**Fecha com:** `block07_complete`.

### Passos

1. Miro 2ª (queda / bolsa de Jana).
2. Sandra → entrevista → lookalike.
3. Caso: duração de Morsa; início dos lapsos; checagem Júlia/Camila.
4. Áudio anônimo hospitalar (WhatsApp Augusto “Sem nome” → play → bancada) → **P08 Enceladus**.
5. Hospital/consulta Ricardo → cruzamento → **Henrique Valença**.
6. Henrique → Cecília → entrevista; dump digital → **P09 Cassini-Huygens**.

### P08 — Enceladus

- **Entrada:** AUD_0008 após play no WhatsApp.
- **Problema:** 8 ciclos; ciclo anômalo esconde voz (“Ricardo…”).
- **Resolução:** correlacionar ciclos / Difference → residual + Recovered Speech.
- **Libera:** pista hospitalar / nome Ricardo no áudio → cadeia de identidade.

### P09 — Cassini-Huygens

- **Entrada:** captura RTP/pcap de Henrique.
- **Problema:** dois SSRC intercalados (A legítimo, B anômalo) com jitter.
- **Resolução:** separar streams / reordenar → duas sessões (colega vs interlocutor anômalo).
- **Libera:** material sobre acessos / Omitido em construção; fecha arco técnico B7.

---

## Bloco 8 — Não houve assassinato naquela noite

**Objetivo:** Morsa = André; queda acidental; cadeia guardrail → Rui; Augusto na causalidade.  
**Fecha com:** `block08_complete` → **como Mariana descobriu tudo?**

### Passos

1. **P10 Ordem dos Anéis** → timeline protestos → **Morsa = André** (palavra “André” fora da UI do puzzle; depois Reflection).
2. Presídio → confrontar André.
3. Miro 3ª com álibi de André → acidente, não empurrão.
4. Caso → guardrail → câmera → Mauro → oficina → Bia → Rui (consultas conforme docs).
5. **P11 Rotação de Saturno** → **VTR-14** → escala → reflexão Augusto.

### P10 — Ordem dos Anéis

- **Entrada:** fontes dessincronizadas dos protestos (áudio Lívia, vídeos, DVR).
- **Resolução (resumo):** fingerprint sirene → flicker → mapa do trecho → CAM 03/07/11 → gap no DVR → segmento unindexed → cutscene continuidade → Morsa desmascarado = André.
- **Libera:** identidade de Morsa + confronto.

### P11 — Rotação de Saturno

- **Entrada:** logs rádio/CAD + depoimento de Rui (trem, abordagem, carro em chamas).
- **Resolução:** cruzar passagem ferroviária × CAD × janelas de rádio das VTRs → isolante **VTR-14**.
- **Libera:** consulta escala → Augusto na cadeia daquela noite.

---

## Bloco 9 — MEMÓRIA

**Objetivo:** O Omitido; morte; mensagens falsas; palavra final.  
**Fecha com:** overlay **MEMÓRIA** + `saturnus_complete`.

### Passos

1. Caso → cruzar Henrique × Mariana → **O Omitido** nomeado.
2. Releitura do diário → assistência técnica no plano.
3. Consulta Delegado Siqueira / Roberto Siqueira → denúncia anônima → Augusto colocado no caso.
4. WhatsApp Augusto → mensagens “Mariana” (ondas 1→2→3).
5. Caso → trilha física → mapa → local final → morte → reflexão.
6. Pós-morte / outros desaparecimentos / anomalias Augusto.
7. **P12 MEMÓRIA** → palavra revelada → reflexão final → fim.

### P12 — MEMÓRIA

- **Entrada:** gravação “recente” atribuída a Mariana **após** confirmação da morte.
- **Problema:** mensagem composta a partir de regiões/fontes anteriores do caso.
- **Resolução:** análise na bancada até revelar a palavra **MEMÓRIA**.
- **Libera:** overlay final + desfecho.

---

## Tabela rápida Pn

| Pn | Nome | Bloco | Entra quando | Sai com |
|----|------|-------|--------------|---------|
| P01 | Divisão de Cassini | 1 | Ligação emergência | Fala recuperada / B1 |
| P02 | Iapetus | 2 | Áudio Rafael (Mariana) | Vértice |
| P03 | Anéis | 2 | Balada via Rafael | A→B; 2ª visita → Nico |
| P04 | Janus | 3 | Gravações Nico | 01:23:30 real |
| P05 | Saturnalia | 3 | Áudio Lívia | Morsa + Samuel |
| P06 | Hexágono | 4 | 6 UNK pós-fixo | PIN 481526 / diário |
| P07 | Luas Pastoras | 6 | RF Válter | G17N / Galpão 17 |
| P08 | Enceladus | 7 | Áudio hospitalar anônimo | Ricardo / hospital |
| P09 | Cassini-Huygens | 7 | PCAP Henrique | Sessões A/B |
| P10 | Ordem dos Anéis | 8 | Fontes protestos | Morsa = André |
| P11 | Rotação de Saturno | 8 | Rádios/CAD pós-Rui | VTR-14 |
| P12 | MEMÓRIA | 9 | Pós-morte | Palavra MEMÓRIA |
