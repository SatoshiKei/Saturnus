# SATURNUS — Master narrativo (cenas, textos e fluxo)

> Gerado a partir do **runtime** (`npm run dump:story-master`).
> Parte I = fluxo/gates/puzzles (`docs/story/STORY_FLOW_CANON.md`).
> Partes II–III = falas e mensagens extraídas dos módulos em `src/data/`.
> Se divergir do jogo, o código vence.

---

## Índice

1. [Parte I — Fluxo da história e puzzles](#parte-i--fluxo-da-história-e-puzzles)

2. [Parte II — Cenas (VN, reflexões, ligações)](#parte-ii--cenas-vn-reflexões-ligações)

3. [Parte III — Conversas e textos](#parte-iii--conversas-e-textos)

---

# Parte I — Fluxo da história e puzzles


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
3. Consulta **Delegado Siqueira** / **Roberto Siqueira** → denúncia anônima → Augusto colocado no caso.
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

---

# Parte II — Cenas (VN, reflexões, ligações)

Entrevistas por tópicos, cenas lineares, reflexões e ligações. Cada cena em seção própria.

## Bloco 1

### Abertura — Augusto + Mari

**narração**

> Três dias nessa mesa. A placa ainda guarda o nome do Delegado Siqueira por baixo do adesivo.

**narração**

> Ele rodou, eu assumi — interino, no tapa — e o primeiro caso que cai no meu colo já é desaparecimento.

**narração**

> Mariana Silva. Enfermeira. Não apareceu pro plantão. Ligação de emergência na madrugada, celular apreendido.

**Mari**

> Delegado? Posso encostar?

**Augusto**

> Entra.

**Mari**

> Sou a Mari. Sobrou pra mim segurar as pontas quando o Delegado Siqueira saiu. Agora sobra com o senhor.

**Augusto**

> Augusto Nogueira.

**Mari**

> Já me avisaram ontem. Separei tudo na pasta: BO, resumo da chamada, e o celular já tá lacrado.

**Augusto**

> Chamada de emergência de madrugada e enfermeira sumida... Vão cobrar resposta ontem.

**Mari**

> Como sempre. Se precisar puxar ramal, desenterrar arquivo velho ou fugir do café aguado da máquina, só dar um toque.

**Augusto**

> O da máquina dá pro gasto. O resto a gente desenrola.

**Mari**

> Dá uma olhada na pasta primeiro. Já volto.

### Mari no hub — hub-welcome

**Mari**

> A pasta amarela é a dela. O fixo tem o ramal da central se quiser ouvir a ligação de novo.

**Mari**

> Eu fico do lado de cá. Se o senhor se perder no material, me chama — eu conheço onde a casa esconde as coisas.

**Augusto**

> Certo.

### Hospital — Júlia / Camila

*03 NOV 2026 · 16:12 · HOSPITAL MUNICIPAL. POSTO DE ENFERMAGEM*

#### Última vez que viram Mariana

**narração**

> Quando cheguei ao hospital, Júlia e Camila estavam no corredor, conversando com outra mulher. Parei a alguns passos. Não parecia conversa de plantão com estranho, as três claramente já se conheciam.

**Camila**

> Renata, o kit do posto B já foi conferido?

**Júlia**

> Renata leva agora.

**Renata**

> Kit fechado. Passo no posto B antes de voltar.

**Augusto**

> Desculpem a intromissão. Sou Augusto Nogueira, delegado da Polícia Civil. Gostaria de trocar uma palavra com vocês sobre a Mariana.

**Júlia**

> Ah, claro. Só um momento.

**Camila**

> Renata, depois eu te procuro.

**Renata**

> Tudo bem. A gente se fala depois.

**narração**

> [Renata se afasta pelo corredor.]

**Augusto**

> Quero começar pelo básico. Quando vocês viram Mariana pela última vez?

**Júlia**

> Ontem. Eu falei com ela no fim da tarde.

**Camila**

> Eu vi quando ela terminou o plantão. Ela saiu normalmente.

#### Comportamento recente

**Augusto**

> Ela comentou onde ia ou se ia encontrar alguém?

**Camila**

> Comigo, não.

**Júlia**

> Ela andava contando menos coisa. Eu perguntava, ela respondia pela metade ou mudava de assunto.

#### Falhas de memória

**Augusto**

> No telefone dela tem mais de uma conversa em que Mariana pergunta por alguma coisa que já tinha feito. Isso vinha acontecendo há quanto tempo?

**Júlia**

> Algumas semanas. Talvez mais. Eu percebi quando ela começou a me perguntar de conversa que a gente tinha tido no dia anterior.

**Augusto**

> Você falou com ela sobre isso?

**Júlia**

> Várias vezes. Falei pra procurar um médico, tirar uns dias, qualquer coisa. Ela sempre dizia que estava cansada e que ia passar.

**Camila**

> Só não pensa que ela estava desorientada o tempo inteiro, porque não estava.

**Augusto**

> O que você quer dizer?

**Camila**

> No trabalho ela funcionava. Sabia paciente, medicação, passagem de turno. Não era alguém chegando aqui sem saber que dia era.

**Júlia**

> Mas esquecia coisa grande também. Não era só onde deixou a chave.

**Camila**

> Eu sei. Só estou dizendo que era irregular. Às vezes parecia que faltava uma coisa muito específica e todo o resto estava no lugar.

**Augusto**

> Isso aconteceu durante atendimento?

**Camila**

> Nunca vi. E eu teria falado se tivesse visto.

#### Conversar com Camila a sós

**Augusto**

> Quando Júlia falou das falhas, você fez questão de separar isso do trabalho. Por quê?

**Camila**

> Porque do jeito que a gente conta depois parece pior do que era. Mariana não vinha pra cá perdida.

**Augusto**

> Mas você também achava que tinha alguma coisa errada.

**Camila**

> Claro.

**Augusto**

> O quê?

**Camila**

> Eu não sei. E prefiro não inventar.

**Augusto**

> Tenta me dizer o que você viu, então.

**Camila**

> Às vezes ela perguntava uma coisa e ficava prestando mais atenção na nossa resposta do que na informação em si.

**Augusto**

> Como se não soubesse?

**Camila**

> Não. Esse é o estranho. Às vezes parecia que ela sabia e queria conferir se a gente lembrava igual.

**Augusto**

> Ela fez isso com você?

**Camila**

> Mais de uma vez.

**Augusto**

> Sobre o quê?

**Camila**

> Coisa banal. Horário, quem estava no plantão, uma conversa. Nada que parecesse importante até agora.

## Bloco 2

### Boate Vértice

*04 NOV 2026 · 09:40 · BOATE VÉRTICE. SALÃO PRINCIPAL*

#### Falar com Iara

**Augusto**

> Boa tarde. Polícia Civil. Estou no caso da Mariana Silva e ouvi que ela passou aqui há algumas semanas.

**Iara**

> Ah, a da foto? Passou sim.
> Cara, eu nem ia lembrar se não tivesse sido tão estranho de manhã.

**Augusto**

> Estranho como?

**Iara**

> Porque casa de balada de dia é só luz acesa e gente cansada.
> Ela entrou como se já conhecesse o corredor, foi direto pro fundo pedir o Sandro.

**Augusto**

> Vocês conversaram?

**Iara**

> Troca de duas frases.
> Queria saber quem trabalhou aqui anos atrás, som, cabine, gente que já saiu.
> Eu falei o que sabia e ela ficou fazendo a mesma pergunta de um jeito diferente.

**Augusto**

> Como se não acreditasse em você?

**Iara**

> Ué, talvez.
> Ou talvez ela só estava conferindo se eu e o resto do mundo lembrávamos igual.
> Óbvio que isso me irritou um pouco.

**Augusto**

> E você acha que ela estava certa em desconfiar?

**Iara**

> Sei lá.
> Eu lembro de gente sumindo, reforma, nome trocado.
> Se ela queria precisão, fez bem em não confiar só em mim.

#### Falar com Sandro

**Augusto**

> A Iara disse que a Mariana veio te procurar. Queria ouvir sua versão.

**Sandro**

> Minha versão?
> Olha, meu amor, ela ficou aqui bastante tempo.
> Não foi visita rápida de curiosa, não. Sentou, tomou café comigo, foi enchendo o papo.

**Augusto**

> Sobre o quê?

**Sandro**

> Gente antiga.
> Funcionário de salão, DJ, quem mexia na cabine quando a casa era outra.
> Ela tinha lista na cabeça, eu juro, porque ia riscando mentalmente quando eu falava um nome.

**Augusto**

> E você lembrou de quantos?

**Sandro**

> Alguns de cabeça, sim.
> Mas seis anos nessa profissão é um cemitério de história.
> Entrou gente, saiu gente, mudou sistema, teve reforma que até o prédio parecia outro.

**Augusto**

> Ela explicou por que queria isso?

**Sandro**

> Disse que precisava conferir uma coisa.
> Eu perguntei qual, ela sorriu e mudou de assunto.
> Aí eu falei pra Iara: isso ainda vai render.

#### Falar com Caio

**Augusto**

> Você também falou com ela?

**Caio**

> Passou por mim… sim.
> Era mais com o Sandro, mas ela parou aqui no canto da mesa.

**Augusto**

> O que ela queria saber?

**Caio**

> Se a cabine antiga guardava registro de quem operava naquela época.
> Eu… acho que guardava, em parte.
> Depois da reforma eu não sei o que ficou inteiro.

**Augusto**

> Dá para chegar em uma pessoa só com isso?

**Caio**

> Não, pera.
> Quer dizer… sem data fechada, sem noite certa, vira pilha de nome.
> Ela não me deu isso.

**Iara**

> Ela queria o Sandro mesmo. O Caio só ouviu porque estava na mesa.

**Caio**

> É.

#### Perguntar pelos arquivos antigos

**Augusto**

> Ainda existe material daquele período em algum lugar?

**Sandro**

> Existe coisa, sim.
> Escala velha, fechamento, exportação quando o sistema era outro.
> Só que não está bonito numa pasta com etiqueta, entende? É arquivo de quem sobreviveu à reforma.

**Augusto**

> A Mariana chegou a ver isso com você?

**Sandro**

> Comigo, não.
> Ela saiu daqui com nome, com dúvida, com segunda visita marcada na cabeça dela, não na minha.

**Iara**

> É só isso que você queria?

**Augusto**

> Por enquanto.

**Iara**

> Quando souber o que ela caçava de verdade, volta.
> Aí talvez a gente ache sem ficar adivinhando.

**Augusto**

> É o que estou tentando descobrir.

#### Perguntar a Sandro sobre o interesse de Mariana

**Augusto**

> Voltando na Mariana. Ela chegou a dizer o motivo das perguntas?

**Sandro**

> Não, querido, e eu insisti.
> Ela falou que era conferência, ponto.
> Como se conferir já explicasse tudo.

**Augusto**

> E voltou?

**Sandro**

> Voltou uma vez.
> Mesma energia, mesma lista mental.
> Perguntou de novo quem eu lembrava da cabine e foi embora sem agradecer direito, eu achei feio, mas enfim.

**Augusto**

> Você lembra se ela chegou em algum nome específico?

**Sandro**

> Se eu lembrasse, teria dado na hora.
> Na época eu já estava perdido no meio do tanto de gente que passou.

#### Mostrar a gravação e consultar os registros

**Iara**

> Você de novo.
> Dessa vez parece que veio com coisa na mão.

**Augusto**

> Trouxe um trecho de áudio que a Mariana tinha mandado pra um amigo. Isolamos a voz. Quero ver se bate com o que vocês lembram da casa.

**Sandro**

> Aí sim. Vamos ouvir.

**Augusto**

> É curto. Barulho de pista ainda, mas dá pra ouvir a fala.

**narração**

> [Augusto reproduz o trecho isolado na bancada.]

**Iara**

> Isso é daqui, sim.
> Só não sei quem é falando no meio do caos.

**Sandro**

> Parece alguém da época, mas eu… não fecho só no ouvido.

**Caio**

> Coloca de novo.

**Augusto**

> O mesmo trecho?

**Caio**

> É.

**narração**

> [Augusto reproduz o trecho isolado na bancada.]

**Caio**

> É o Nico.

**Iara**

> Tem certeza?

**Caio**

> Tenho.
> Eu ouvia ele todo fim de semana naquela fase.

**Sandro**

> Então a gente olha o administrativo e para de chutar.
> Espera aqui.

**narração**

> [Sandro consulta o arquivo administrativo.]

**Sandro**

> Tem mais de uma noite nesse intervalo, eu aviso logo.
> Mas com essa voz no meio do barulho, fecha numa sessão só.

**Sandro**

> Nico.

**Augusto**

> Nome completo, por favor.

**Sandro**

> Nicolas Prado Reis.

**Augusto**

> Ele era da cabine?

**Sandro**

> DJ residente.
> Nesse registro a sessão está no nome dele, não era convidado de uma noite.

**Augusto**

> Ainda está na casa?

**Sandro**

> Não faz anos que ele sumiu daqui.
> Contato eu não tenho fresco, talvez você ache pelo nome em outro lugar.

**Augusto**

> Quando a Mariana veio, ela chegou nesse nome com você?

**Sandro**

> Comigo, não.
> Ela perguntava demais e explicava pouco.
> Eu nem sabia o que ela estava montando na cabeça.

**Augusto**

> Agora tenho uma linha.

**Sandro**

> Ótimo.
> Porque eu continuo sem entender o filme inteiro.

### Lucas

*04 NOV 2026 · 11:20 · UNIVERSIDADE. CAMPUS CENTRAL, BLOCO B*

#### Como Mariana o procurou

**Augusto**

> Lucas Moreira?

**Lucas**

> Sou eu. Entra.
> Se você veio de carro, pede pro porteiro liberar na saída. Esse prédio consegue transformar uma visita de dez minutos num processo de imigração.

**Augusto**

> Augusto Nogueira, Polícia Civil. Preciso falar sobre Mariana Silva.

**Lucas**

> Ah.
> Tá. Eu imaginei que alguém acabaria aparecendo por causa dela. Só não achei que seria tão cedo.

**Augusto**

> Você conhecia a Mariana?

**Lucas**

> Não antes de ela bater aqui em casa. Foi há alguns meses.
> Ela chegou com uma cópia de um depoimento meu de seis anos atrás, cheio de marca-texto. Meu nome, minhas frases, tudo. Não é exatamente o tipo de visita que você esquece.

**Augusto**

> Ela está desaparecida.

**Lucas**

> Pera. Desaparecida como?

**Augusto**

> Estamos procurando por ela desde ontem.

**Lucas**

> Caralho.
> Tá. Senta. Se ela veio parar aqui antes de sumir, eu quero saber o que aconteceu também.

#### Elisa Duarte

**Augusto**

> Esse depoimento era sobre o quê?

**Lucas**

> Sobre a Elisa.

**Augusto**

> Quem é Elisa?

**Lucas**

> Você não sabe?

**Augusto**

> Não.

**Lucas**

> Elisa Duarte.
> Mataram ela numa festa no Vértice. Ela tinha dezessete anos. Eu tinha dezoito.
> Faz tempo que ninguém entra aqui sem saber esse nome.

**Augusto**

> Você depôs no caso?

**Lucas**

> Depus. Contra o André Silva. Ele era namorado dela e é irmão da Mariana.
> Foi condenado pela morte da Elisa.

**Augusto**

> E Mariana veio questionar o seu depoimento.

**Lucas**

> No começo ela não falou desse jeito. Disse que queria entender umas coisas da época, perguntou se eu lembrava da Elisa, de quem andava com ela.
> Depois abriu meu depoimento na mesa. Aí ficou bem claro por que ela tinha vindo.

#### Relação com Elisa e André

**Augusto**

> Você era próximo da Elisa?

**Lucas**

> Estava ficando.
> Uma amiga apresentou a gente porque a Elisa queria conhecer a faculdade. Eu estava no começo da engenharia e, naquela idade, achava que sabia explicar o campus inteiro. Mostrei laboratório, falei de vestibular, essas coisas.
> Depois a gente continuou se falando.

**Augusto**

> Você gostava dela?

**Lucas**

> Gostava.
> Mais do que eu deixava muito evidente, provavelmente. Mas ela tinha namorado. Nunca aconteceu nada entre a gente.

**Augusto**

> André sabia de você?

**Lucas**

> Sabia. E me odiava antes mesmo de ter motivo.
> Uma vez apareceu no campus e começou a cobrar a Elisa na minha frente. Queria saber por que ela estava ali, com quem tinha falado, que horas ia embora. Aquele negócio de transformar qualquer saída numa prestação de contas.

**Augusto**

> Foi isso que você contou à polícia?

**Lucas**

> Isso e o que ela me contava.
> O André tinha problema sério com aposta. Perdia dinheiro e depois fazia ela carregar o peso junto. Quando brigavam, ele virava a conversa até parecer que a culpa era dela.
> Pra mim ele era abusivo. Eu falei exatamente isso no depoimento.

**Augusto**

> Você chegou a ver ele agredir a Elisa?

**Lucas**

> Bater nela? Não.
> Mas, meu, eu conhecia o tipo. Você não precisa ver um cara dar um soco pra perceber quando uma menina está cansada de pedir licença pra viver a própria vida.

**Augusto**

> Ela queria terminar?

**Lucas**

> Queria sair daquela relação. Falava nisso comigo.
> Não era uma hipótese que eu montei depois que ela morreu. Ela estava de saco cheio dele.

#### André Silva e a condenação

**Augusto**

> E pra você foi André quem matou Elisa.

**Lucas**

> Foi.

**Augusto**

> Sem dúvida?

**Lucas**

> Augusto, ele foi investigado, julgado e condenado. Eu não tirei o nome do André de uma cartola.
> Na época eu contei o que sabia sobre os dois e aquilo fazia sentido com o resto do caso. Ainda faz.

**Augusto**

> Então o que incomodou nas perguntas da Mariana?

**Lucas**

> Ela pegava uma coisa que eu dizia e desmontava até sobrar quase nada.
> Eu falava que o André controlava a Elisa. Ela perguntava se eu tinha visto ele bater nela. Eu falava que não. Aí vinha outra pergunta, como se esse “não” apagasse todo o resto.

**Augusto**

> Ela disse que você estava mentindo?

**Lucas**

> Não. E talvez por isso tenha me irritado tanto.
> Ela era educada. Ficava ali com aquela calma, voltando na mesma frase até eu começar a parecer um idiota por ter certeza de alguma coisa.

**Augusto**

> Você acha que ela queria inocentar o irmão.

**Lucas**

> Claro que queria.
> E, olha, eu até entendo. Se fosse meu irmão, talvez eu fizesse alguma loucura também. Só que o André já tinha tido julgamento, defesa, recurso, tudo. A Elisa não podia se defender de mais nada.

**Augusto**

> Mariana tentou mudar sua versão sobre André?

**Lucas**

> Tentou mudar o peso dela.
> Pra Mariana, uma coisa era eu ter visto o André controlando a Elisa. Outra era a Elisa ter me contado o que acontecia quando eles estavam sozinhos. Ela queria separar isso.
> Pra mim continuava sendo a mesma história sobre o mesmo cara.

#### O que Mariana perguntou

**Augusto**

> Ela perguntou só sobre o depoimento?

**Lucas**

> Não. Depois começou a puxar horário.
> Queria saber quando eu costumava ver a Elisa na faculdade e se eu lembrava de quando o André aparecia. Pediu foto antiga também.

**Augusto**

> Você tinha alguma coisa guardada?

**Lucas**

> Foto, principalmente. Passei uma noite inteira descendo Google Fotos até 2020 e mandei o que achei.
> Aí ela voltou com mais pergunta em cima das mesmas coisas.

**Augusto**

> Que tipo de pergunta?

**Lucas**

> Coisa do tipo “você sabe que ele estava lá ou lembra dele estar lá?”.
> Parece pouca diferença quando eu falo agora. Na hora dava vontade de mandar ela embora.

**Augusto**

> Mandou?

**Lucas**

> Na última vez, mandei.
> Eu falei que ela estava usando a Elisa pra tentar salvar o André. Falei pior do que isso, na verdade. Eu estava puto.

**Augusto**

> Foi a última vez que vocês se falaram?

**Lucas**

> Foi.
> Ela ficou quieta um tempo, guardou os papéis e foi embora. Eu nem acompanhei até a porta.

**Lucas**

> E agora você senta na minha sala e me diz que ela desapareceu.
> Então, sim, essa última conversa está batendo um pouco diferente hoje.

### Reflexão — `refl-lucas`

*Cena vinculada:* lucas

**Augusto**

> Mariana não foi até Lucas para fazê-lo mudar de opinião sobre André. Isso teria sido inútil. Lucas não tinha uma dúvida, tinha uma certeza amadurecida por seis anos.

**Augusto**

> Ela fez outra coisa. Pegou a lembrança dele e começou a testar onde terminava o que ele tinha visto e onde começava o que ele concluía. Lucas odiou o método porque, para ele, separar essas coisas parecia aliviar um homem que já tinha sido condenado.

**Augusto**

> Talvez Mariana não estivesse tentando provar inocência. Talvez estivesse procurando quais partes do caso continuavam de pé quando alguém retirava a interpretação. Se era isso, eu precisava parar de começar pela pergunta 'por que André matou Elisa?' e reconstruir primeiro onde cada pessoa realmente estava.

## Bloco 3

### Nico — visita precoce

*04 NOV 2026 · 16:30 · TITÃ CLUB. ANTES DA ABERTURA*

#### Visita de Mariana

**Augusto**

> Mariana Silva procurou você há pouco tempo.

**Nico**

> Procurou.
> Apareceu no Titã como quem já tinha ensaiado a pergunta no elevador.

**Augusto**

> Sobre o quê?

**Nico**

> Horários. Sequência de uma noite antiga.
> Ela queria encaixar pedaço com pedaço, como se a madrugada fosse um quebra-cabeça que alguém tinha sacudido.

**Augusto**

> Qual noite?

**Nico**

> Se o senhor ainda não sabe o nome, eu não vou ser o primeiro a reabrir isso pra polícia.
> Quando souber, a gente conversa de verdade.

#### Uma noite antiga

**Augusto**

> Você se recusa a dizer o que ela investigava?

**Nico**

> Eu me recuso a narrar uma noite inteira pra quem ainda não sabe de quem estamos falando.
> Isso não é birra. É limite.

**Augusto**

> Dela quem?

**Nico**

> Quando o senhor souber, volta.
> Por agora: ela esteve aqui, fez perguntas, e eu não entreguei nada além do necessário.

### Nico (Titã)

*04 NOV 2026 · 16:30 · TITÃ CLUB. ANTES DA ABERTURA*

#### Elisa Duarte

**Augusto**

> Recuperei um trecho bem antigo da balada. Pessoal do Vértice ouviu e disseram que a voz no microfone era sua.

**Nico**

> Caralho.
> Eu falava assim?
> Dá vontade de pedir desculpa pra quem dividia cabine comigo.
>  
> Mas sim, delegado. Antes de você perguntar o nome: eu sei de quem a gente vai falar. Só achei que depois de seis anos ia ser outro assunto.

**Augusto**

> Você conhecia Elisa Duarte?

**Nico**

> Conhecer é generoso.
> Ela aparecia.
> Não era VIP, não era da roda da porta, não vinha com crush pedindo música.
> Só vinha, ficava, voltava.
> Tem gente que a pista adota sem ninguém combinar antes.

**Augusto**

> Como assim?

**Nico**

> Nas primeiras vezes ela ia com gente.
> Depois começou a parecer sozinha. Ou ficar sozinha num lugar em que ninguém fica parado.
> Ela ficava na lateral, meio de lado, como quem acompanha a sala inteira em vez do grave.

#### A Noite X no Vértice

**Augusto**

> Você estava trabalhando na noite em que ela morreu?

**Nico**

> Estava na cabine. Como sempre.
> A pista já tinha esvaziado um pouco, mas ainda tinha aquela hora em que o som parece maior que a multidão.

**Augusto**

> Viu quando ela saiu?

**Nico**

> Augusto…
> Eu já falei isso pra delegado, pra advogado, pra escrivão com café frio na mesa.
> Tá no processo.
> E eu não sou filmagem, sou mesa.

**Nico**

> Eu estava de fone, olhando o mix e a pista aos pedaços.
> Gente entrando bêbada, gente saindo antes da última música, casal brigando no corredor.
> Não sou guarda-costas de ninguém.

#### Visita de Mariana

**Augusto**

> Mariana Silva procurou você há pouco tempo.

**Nico**

> Procurou.
> Do nada, anos depois, alguém batendo na porta do Titã querendo mexer na noite de 2009.
> Eu olhei e pensei: quem ainda se importa?

**Augusto**

> Você a reconheceu?

**Nico**

> Não de cara.
> Ela não entrou pedindo música nem autógrafo de DJ.
> Depois ela falou do irmão e aí caiu a ficha.

**Augusto**

> Vocês conversaram?

**Nico**

> O mínimo.
> Não tenho nada contra ela.
> Só não curti voltar pra cabine da memória.
> Na minha cabeça eu já tinha fechado aquela porta.

#### O que ela queria saber

**Augusto**

> O que ela queria saber?

**Nico**

> Horário.
> Sequência.
> Quem entrou, quem saiu, em que ordem.
> Ela queria encaixar o movimento da casa como se a pista fosse relógio.

**Augusto**

> Quem matou Elisa?

**Nico**

> Isso ela quase não perguntou.
> Ficou obcecada com quando cada coisa acontecia.
> Minuto por minuto, como se o crime fosse um corte mal feito no mix.

**Augusto**

> Ela disse por quê?

**Nico**

> Não.
> E eu também não perguntei.
> Na boate a gente aprende a não abrir porta que não é nossa.

#### Registros sonoros

**Augusto**

> Existem registros daquela noite?

**Nico**

> Tem.
> A casa gravava o feed da mesa sozinha.
> Set, controle, arquivo do DJ.
> Não é câmera. É o som direto da cabine, antes de ir pra pista.

**Augusto**

> Você ainda guarda isso?

**Nico**

> Tenho cópia daquela noite.
> Não é oficial, não foi pro processo.
> Mas é o feed da mesa, do jeito que saiu da minha mão.

**Augusto**

> Preciso ouvir.

**Nico**

> Leva.
> Só me faz um favor: não me chama de volta pra essa história.
> Já deu o que tinha que dar.

### Reflexão — `refl-nico`

*Cena vinculada:* nico

**Augusto**

> Eu tinha procurado Nico esperando que ele preenchesse os espaços daquela noite. Depois de seis anos, ele lembrava melhor das pessoas e da pista do que de horário.

**Augusto**

> Isso não tornava a lembrança inútil. Só significava que eu estava pedindo à pessoa errada o tipo errado de resposta.

**Augusto**

> Nico mencionou que o Vértice mantinha uma gravação automática da cabine. Se aquilo ainda existisse, eu não precisaria fazer a memória dele funcionar como relógio. Podia voltar ao que realmente ficou registrado.

### Lívia

*04 NOV 2026 · 14:05 · RÁDIO COSTEIRA FM. REDAÇÃO*

#### Mariana

**Augusto**

> Mariana Silva entrou em contato com você há alguns meses?

**Lívia**

> Entrou. Achei que fosse pauta no começo. Ela fez duas perguntas sobre uma cobertura antiga da Costeira e depois ficou quase uma hora comigo.

**Augusto**

> Cobertura de quê?

**Lívia**

> Dos protestos contra a Maralto Granéis. Isso já faz uns seis anos.

**Augusto**

> Maralto Granéis?

**Lívia**

> Uma empresa grande daqui. Terminal, logística, dinheiro suficiente para aparecer bastante na cidade e preferir não aparecer no jornal pelo motivo errado.

**Augusto**

> E o motivo errado eram os protestos.

**Lívia**

> Na época, sim. Teve manifestação, confronto, denúncia de segurança particular passando do limite... ficou feio por algumas semanas e depois a cidade fez o que cidade faz muito bem: arrumou outro assunto.

**Augusto**

> O que Mariana queria saber?

**Lívia**

> Essa foi a parte curiosa. Ela não estava muito interessada no que a gente publicou. Isso ela podia achar sozinha.

**Lívia**

> Queria saber o que tinha ficado de fora.

#### O arquivo da rádio

**Augusto**

> Ficou muita coisa de fora?

**Lívia**

> Sempre fica. Reportagem não é ata de cartório. Você grava uma tarde inteira para usar dois minutos e meio, quando tem sorte.

**Augusto**

> E você ainda guarda isso?

**Lívia**

> Guardo coisa demais. É um defeito profissional que já sobreviveu a três computadores e duas promessas de organizar meus arquivos.

**Augusto**

> Foi esse material que Mariana pediu?

**Lívia**

> Foi. Eu ofereci a matéria fechada primeiro. Ela nem fez desfeita, só perguntou se eu tinha as gravações originais.

**Augusto**

> Disse o que esperava encontrar nelas?

**Lívia**

> Não exatamente. Ouviu bastante coisa aqui mesmo, voltou em alguns trechos, fez anotação. Tinha uma pergunta na cabeça, isso dava para perceber. Só não dividiu comigo qual era.

**Augusto**

> Você ainda tem a mesma cópia?

**Lívia**

> Tenho. Mas já vou estragar sua expectativa: é arquivo bruto de rádio. Tem vento, gente falando por cima, entrada cortada e gravação que começa no meio de frase.

**Augusto**

> Serve.

**Lívia**

> Foi o que a Mariana achou também.

### Reflexão — `refl-livia`

*Cena vinculada:* livia

**Augusto**

> Mariana recusou a matéria pronta e pediu o bruto. Quanto mais eu pensava nisso, menos parecia uma preferência de formato.

**Augusto**

> Uma reportagem já vem com começo, meio e fim. Alguém escolheu o que entrou, cortou o que atrapalhava e deu sentido ao resto. Mariana parecia desconfiar justamente desse sentido pronto.

**Augusto**

> Se ela estava procurando alguma coisa nos protestos, queria o material antes de virar narrativa. Eu devia fazer o mesmo.

## Bloco 4

### Samuel — visita acidental (Marcelo)

*04 NOV 2026 · 18:50 · RUA DAS ACÁCIAS, 118. AP. 21*

#### Marcelo Viana

**Augusto**

> Procuro Marcelo Viana. Este era o endereço dele.

**Samuel**

> Não mora aqui há anos.
>  
> Eu moro.

**Augusto**

> Sabe para onde ele foi?

**Samuel**

> Não. E não tenho o telefone.

#### Encerrar

**Augusto**

> Tudo bem. Foi engano de endereço.

**Samuel**

> Ok.

### Samuel

*04 NOV 2026 · 18:50 · RUA DAS ACÁCIAS, 118. AP. 21*

#### Quem era Morsa

**Augusto**

> Morsa. Esse apelido lhe diz alguma coisa?

**Samuel**

> Diz.
> Fazia anos que eu não ouvia ninguém falar esse nome em voz alta.

**Augusto**

> Quem era?

**Samuel**

> Aí você já está pedindo outra coisa.

**Augusto**

> Estou pedindo um nome.

**Samuel**

> Eu sei. E eu não vou te dar.
> Não é charme, não é teatrinho. Tem gente que conseguiu tocar a vida depois daquela época. Eu não vou abrir a porta de casa e começar a entregar nome pra polícia seis anos depois.

**Augusto**

> Mesmo sabendo que isso pode ter relação com o desaparecimento da Mariana?

**Samuel**

> É justamente por isso que eu ainda estou sentado aqui falando com você.

#### O núcleo dos protestos

**Augusto**

> Você participou dos protestos contra a Maralto?

**Samuel**

> Participei. Eu era estudante, fazia bico onde aparecia e tinha tempo demais pra achar que dava pra consertar o mundo numa terça-feira à tarde.
> Ia pra assembleia, manifestação, ajudava com cartaz, som, essas coisas.

**Augusto**

> Mas não fazia parte do núcleo mascarado.

**Samuel**

> Não.
> Eu conhecia gente dali, como metade de quem circulava naquele meio conhecia. Mas eu não era um deles.

**Augusto**

> Seu nome aparece numa ocorrência poucos dias depois.

**Samuel**

> Aparece porque vieram me buscar em casa. Eu fui burro, discuti, resisti e passei um tempo detido por causa disso.
> Na época eu achava que estava sendo muito coerente. Hoje acho que eu só tinha vinte e poucos anos e raiva sobrando.

**Augusto**

> O que aconteceu naquela noite dos protestos?

**Samuel**

> A mesma coisa que acontece quando muita gente chega carregando motivo diferente pra mesma rua. Uns queriam fazer barulho, outros queriam quebrar alguma coisa, outros só estavam com medo de apanhar primeiro.
> Depois todo mundo contou a versão que conseguia viver com ela.

#### Por que ninguém fala

**Augusto**

> Por que ainda existe tanto silêncio em volta disso?

**Samuel**

> Porque não ficou bonito pra ninguém.
> Teve gente ferida, teve gente presa, teve gente que perdeu emprego. Depois cada um foi fazendo o que dava. Mudou de bairro, terminou faculdade, teve filho, abriu bar, virou outra pessoa.

**Augusto**

> E falar hoje colocaria isso em risco.

**Samuel**

> Pra alguns, sim.
> E tem outra coisa que policial costuma esquecer: às vezes você não cala porque é culpado. Cala porque já viu o que acontece quando resolve confiar na pessoa errada.

**Augusto**

> Está falando de você?

**Samuel**

> Estou falando de muita gente.

**Samuel**

> Eu já fiz uma escolha naquela época achando que estava protegendo alguém. Não tenho vontade nenhuma de descobrir, de novo, que protegi do jeito errado.

#### Visita de Mariana

**Augusto**

> Mariana Silva veio falar com você?

**Samuel**

> Veio. Faz algumas semanas.

**Augusto**

> Ela perguntou por Morsa?

**Samuel**

> Perguntou.
> Quando soltou o apelido, eu quase fechei a porta na cara dela. Fazia tempo que ninguém de fora chegava aqui sabendo esse nome.

**Augusto**

> E você fechou?

**Samuel**

> Não. Esse foi o problema.

**Augusto**

> Por quê?

**Samuel**

> Porque ela não veio com aquele jeito de quem quer arrancar confissão. Parecia mais cansada do que curiosa.
> Eu deixei ela falar. Depois mandei embora sem responder metade do que ela queria.

**Augusto**

> Ela mencionou o irmão?

**Samuel**

> Mencionou.
> E aí eu entendi por que aquilo estava doendo tanto nela.

#### O que ela queria saber

**Augusto**

> O que exatamente ela queria saber?

**Samuel**

> Não ficou só no nome.
> Ela queria saber quando Morsa aparecia, quando sumia, por onde costumava entrar e sair. Voltava nos mesmos pedaços da noite como se estivesse tentando montar um mapa sem desenhar no papel.

**Augusto**

> Ela estava reconstruindo horários.

**Samuel**

> Foi o que eu pensei depois.
> Na hora eu achei que ela estivesse procurando uma forma de provar alguma coisa sobre o irmão.

**Augusto**

> E isso incomodou você.

**Samuel**

> Incomodou.

**Augusto**

> Por causa de André?

**Samuel**

> Por causa de tudo que aconteceu naquela época.

**Augusto**

> Você acha que ele foi condenado injustamente?

**Samuel**

> Eu acho que tem pergunta que chega seis anos atrasada e ainda consegue estragar a noite de alguém.

**Samuel**

> Essa é uma delas.

### Reflexão — `refl-samuel`

*Cena vinculada:* samuel

**Augusto**

> Samuel não parecia ter medo de mim. Tinha lealdade. Isso era pior para uma investigação e, de certa forma, mais honesto.

**Augusto**

> Mariana também pediu horários a ele. Não rosto, não culpa, não 'quem fez'. Horários.

**Augusto**

> Ela estava montando movimento. Quem esteve onde, quando apareceu e quando sumiu. Comecei a suspeitar que a morte de Elisa talvez dependesse menos de descobrir uma pessoa nova e mais de perceber que alguém tinha sido colocado no lugar errado.

### André (1ª visita)

*04 NOV 2026 · 21:37 · PENITENCIÁRIA ESTADUAL. SALA DE VISITAS*

#### Mariana

**Augusto**

> Obrigado por me receber.

**André**

> Não agradece, não. Eu não marquei visita com polícia nenhuma.

**Augusto**

> Estou aqui por causa da Mariana.

**André**

> Eu imaginei. Se fosse por mim vocês já tinham aparecido seis anos atrás com resposta pronta.

**Augusto**

> Ela esteve aqui recentemente?

**André**

> Duas vezes.

**Augusto**

> Depois de quanto tempo sem vir?

**André**

> Anos. Bastante tempo pra eu entender que ela não queria olhar pra minha cara.

**Augusto**

> E aí ela aparece duas vezes.

**André**

> Do nada.
> Na primeira eu achei que tinha acontecido alguma coisa com a família. Minha mãe, algum problema de saúde, sei lá. Aí ela sentou ali e começou a falar da Elisa.

**Augusto**

> O que ela queria saber?

**André**

> Onde eu estava naquela noite. Quem tinha falado comigo. Que horas eu fui embora. Coisa que já perguntaram até eu perder a conta.
> A diferença é que a Mariana nunca tinha querido ouvir a minha versão.

**Augusto**

> E na segunda visita?

**André**

> Voltou pior. Não pior comigo. Pior da cabeça, mais presa nisso.
> Trazia pergunta em cima de pergunta, voltava em coisa que eu já tinha respondido. Parecia que estava procurando a rachadura de alguma coisa.

#### A mudança de Mariana

**Augusto**

> Ela disse que tinha mudado de ideia sobre você?

**André**

> Ela não falou “eu estava errada”, se é isso que você quer saber.
> Disse que talvez tivesse engolido coisa demais sem perguntar. Pra Mariana já foi muito.

**Augusto**

> Como você recebeu isso?

**André**

> Como você acha?
> Minha própria irmã passou anos achando que eu era um monstro. Aí volta aqui falando baixo, cheia de papel na mão, como se tivesse medo de olhar direito pra mim.

**Augusto**

> Você queria que ela continuasse investigando?

**André**

> Não. Eu mandei parar.

**Augusto**

> Mesmo podendo encontrar alguma coisa que te ajudasse?

**André**

> Ajudar o quê? Minha vida já passou por polícia, promotor, advogado, juiz. Cada um pegou um pedaço e escreveu o André que servia pra eles.
> Eu não precisava da minha irmã entrando nesse moedor também.

**Augusto**

> Você estava preocupado com ela.

**André**

> Ela não estava bem.
> Esquecia coisa, repetia pergunta, ligava num dia e no outro parecia que a conversa nunca tinha existido. E quanto mais mexia nisso, pior ficava.

**Augusto**

> Ela te ouviu?

**André**

> Você conheceu a Mariana. Quando ela enfia uma coisa na cabeça, pode cair o prédio em volta.

#### Maralto

**Augusto**

> Ela falou com você sobre a Maralto Granéis?

**André**

> Não.

**Augusto**

> Sobre os protestos daquela época?

**André**

> Ela veio aqui falar da Elisa.

**Augusto**

> E Morsa? Esse nome te diz alguma coisa?

**André**

> Não.

**Augusto**

> Você respondeu rápido.

**André**

> Quer que eu faça suspense pra ficar mais bonito no seu relatório?

**Augusto**

> Mariana pesquisava Maralto e Morsa na mesma época em que vinha te visitar.

**André**

> Então ela pesquisava um monte de coisa sem me contar. Não é novidade. A gente não estava exatamente trocando confidência de irmão.

**Augusto**

> Nunca mencionou nenhum dos dois?

**André**

> Pra mim, não.
> Se você quer saber de Maralto, vai atrás de quem estava metido com Maralto. Não tenta encaixar tudo na minha cela porque fica mais fácil.

#### Por que Mariana voltou

**Augusto**

> Por que você acha que Mariana voltou depois de tantos anos?

**André**

> Essa é a pergunta que eu faria se estivesse no seu lugar.

**Augusto**

> Estou fazendo.

**André**

> Então eu não sei.
> Não teve conversa nossa antes. Não teve pedido de desculpa. Não teve família fazendo ponte. Ela só apareceu aqui um dia querendo reabrir uma história que tinha enterrado junto comigo.

**Augusto**

> Você acha que alguém colocou isso na cabeça dela?

**André**

> Eu acho que gente como você adora essa pergunta porque sempre precisa ter alguém puxando a corda.
> Às vezes a pessoa só cansa de aceitar a história que deram pra ela.

**Augusto**

> Mas você mesmo disse que ela não estava bem.

**André**

> Uma coisa não apaga a outra.
> Ela podia estar perdida e ainda assim ter percebido que tinha coisa errada. Mariana nunca foi burra.

**Augusto**

> Você pediu que ela parasse porque estava preocupado ou porque não queria que ela encontrasse alguma coisa?

**André**

> Olha o delegado aparecendo agora.
> Você já decidiu que se eu protejo minha irmã é porque estou escondendo cadáver no armário?

**Augusto**

> Eu fiz uma pergunta.

**André**

> E eu te dei uma resposta. Eu não queria a Mariana afundando nisso.
> Ela já tinha perdido seis anos por causa dessa história. Eu não ia ficar batendo palma enquanto ela perdia mais.

**Augusto**

> Tem mais alguma coisa que eu deveria saber?

**André**

> Tem. Descobre por que ela começou.
> Não por que ela veio me ver. Isso é fácil. Descobre o que fez ela olhar pra tudo de novo depois de tanto tempo.

**Augusto**

> Você quer saber também.

**André**

> É minha irmã.
> Claro que eu quero saber.

### Reflexão — `refl-andre`

*Cena vinculada:* andre

**Augusto**

> Eu esperava que André agarrasse qualquer brecha que Mariana tivesse encontrado. Ele fez o contrário. Mandou a própria irmã parar.

**Augusto**

> Um homem preso há seis anos podia fazer isso porque tinha desistido. Podia fazer porque estava tentando protegê-la. Ou porque havia alguma coisa fora do caso Elisa que ele não queria ver entrando nos autos.

**Augusto**

> Maralto e Morsa receberam negativas rápidas demais para me ajudar. Não eram prova de nada. Mas eu saí da prisão com uma impressão nova: André talvez estivesse escondendo alguma coisa sem que essa coisa fosse necessariamente a morte de Elisa.

### Cena — Hex (ligações no fixo)

*Sem diálogo falado; áudio; segue reflexão.*

### Reflexão — `refl-hex-call`

**Augusto**

> Seis chamadas sem voz seriam fáceis de tratar como provocação se não fossem tão deliberadas.

**Augusto**

> Ninguém quis falar comigo. Queriam que eu ouvisse arquivos, um atrás do outro, e que a central guardasse todos eles. Aquilo parecia menos uma ameaça do que uma entrega feita de um jeito absurdamente complicado.

**Augusto**

> Se havia mensagem ali, não estava na conversa. Estava no próprio áudio. Eu levaria as seis gravações para a bancada antes de decidir por que alguém fez questão de colocá-las nas minhas mãos.

## Bloco 5

### Jana — visita precoce

*05 NOV 2026 · 10:15 · RUA DO SOL, 47*

#### Mariana

**Augusto**

> Jana Ribeiro?

**Jana**

> Sim.
> Se for vender plano de internet, não precisa fingir que conhece meu nome.

**Augusto**

> Delegado Augusto Nogueira. Estou procurando Mariana Silva.

**Jana**

> Ela apareceu aqui umas semanas atrás.
> Do nada. Com cara de quem dormiu mal três noites seguidas.

**Augusto**

> Vocês se conheciam?

**Jana**

> Não.
> Não éramos próximas.
> A gente mora no mesmo bairro e às vezes no mesmo tipo de festa. Não é amizade.

#### Perguntas antigas

**Augusto**

> O que ela queria?

**Jana**

> Fazia perguntas sobre uma história antiga.
> Tipo, muito antiga.
> Eu cortei na hora.
> Minha cabeça não aluga espaço pra isso de graça.

**Augusto**

> Qual história?

**Jana**

> Não importa. Já passou.
> Se ela sumiu, eu sinto pena.
> Mas eu não vou abrir porta que eu fechei com cal.

#### Encerrar

**Jana**

> Se for só isso, eu preciso trabalhar.
> Segunda paga boleto. Festa não.

**Augusto**

> Por enquanto é só isso.

### Nico (2ª)

*04 NOV 2026 · 16:30 · TITÃ CLUB. ANTES DA ABERTURA*

#### A jaqueta

**Augusto**

> Quero voltar numa coisa que você falou da saída da Elisa.

**Nico**

> Você de novo.
> Isso nunca é bom sinal.
> Mas fala. O que ficou roendo?

**Augusto**

> A roupa.

**Nico**

> A jaqueta?
> Clara. Quase ofensivamente clara.

**Augusto**

> Você lembra dela especificamente.

**Nico**

> Lembro porque a pista estava escura e aquela coisa parecia um farol de gente.
> No Vértice quase todo mundo usa preto. Ela entrou como se tivesse errado o dress code de propósito.

#### A saída

**Augusto**

> Era dela?

**Nico**

> Na época eu achei que sim.
> Na memória ficou como se fosse.
> Depois a cabeça começou a puxar outra imagem por cima.

**Augusto**

> Por quê?

**Nico**

> Porque eu já tinha visto a Jana usando uma parecida.
> Não igual, parecida. Boate confunde tudo: luz, bebida, pressa.

**Augusto**

> Tem certeza de que era a mesma?

**Nico**

> Certeza de cartório? Não.
> Faz seis anos, delegado.
>  
> Mas se você me obrigar a pintar aquela saída, eu ainda vejo aquela jaqueta clara. Só não juro em quem estava dentro.

#### Jana

**Augusto**

> Jana o quê?

**Nico**

> Aí você já quer demais da minha memória.
> Só lembro que Jana entrou nessa.
> O resto deve estar no processo.
> Na minha cabeça vira mancha quando tenta ficar preciso.

#### O que Mariana repetia

**Augusto**

> Mariana perguntou sobre isso?

**Nico**

> Perguntou.
> E voltou.
> Várias vezes.

**Augusto**

> Uma vez?

**Nico**

> Não.
> E isso foi estranho.
>  
> Ela mexia no mesmo detalhe de outro jeito. “Era clara?”, “você já tinha visto antes?”, “quem estava com ela?”.
>  
> Parecia que estava testando a própria pergunta até ela encaixar na cabeça.

### Reflexão — `refl-nico2`

*Cena vinculada:* nico

**Augusto**

> A jaqueta clara era um detalhe pequeno demais para sobreviver seis anos por acaso e grande demais para eu tratá-lo como certeza.

**Augusto**

> Nico associou a peça a Jana, não a Elisa. Se ele estivesse lembrando certo, a saída que todo mundo descreveu podia ter sido reconhecida pela roupa antes de ser reconhecida pela pessoa.

**Augusto**

> Mariana insistiu nesse mesmo ponto. Eu precisava descobrir quem era Jana e por que aquela jaqueta tinha ficado presa na memória de tanta gente.

### Jana

*05 NOV 2026 · 10:15 · RUA DO SOL, 47*

#### A noite

**Augusto**

> Jana Ribeiro?

**Jana**

> Sou eu.
> Você é o terceiro ou quarto delegado do mês? Brincadeira. Mais ou menos.

**Augusto**

> Delegado Augusto Nogueira. É sobre Elisa Duarte.

**Jana**

> Claro que é.
> Ninguém bate na minha porta à tarde pra perguntar do tempo.

**Augusto**

> Posso entrar?

**Jana**

> Prefiro que não.
> Aqui dentro virou depósito de roupa e conta atrasada.
> A gente conversa na porta, tá?

**Augusto**

> Tudo bem.

**Jana**

> Eu já falei daquela noite. Mais de uma vez.
> Em juízo, fora do juízo, com amiga chorando na linha.
> Cara, isso faz quinze anos.

**Augusto**

> Eu sei.
> Estou atrás de um detalhe que quase não aparece nos autos.

**Augusto**

> Na noite, você já estava indo embora?

**Jana**

> Tinha me despedido. Quer dizer, eu estava indo.
> Aí começou aquela do Avicii.

**Augusto**

> Levels?

**Jana**

> Essa.
> Eu era completamente idiota por aquela música.
> Voltei pra pista. Cinco minutos, dez, sei lá.
> Não foi decisão filosófica. Só gostava do refrão pra caralho.

**Augusto**

> E a Elisa?

**Jana**

> Ficou comigo na música.
> Achou graça porque eu tinha feito corpo mole de ir embora.
> Na hora não pensei que isso ia virar peça de nada.

#### A jaqueta

**Jana**

> Qual detalhe agora?
> Você fala como se a noite tivesse legenda.

**Augusto**

> A jaqueta que Elisa usava quando saiu do Vértice.

**Jana**

> Era minha.
> Clara, porque eu tinha perdido a noção do dress code lá em 2009.

**Augusto**

> Ela pegou emprestada?

**Jana**

> Pegou.
> Tipo, pegou mesmo. Sem drama.

**Augusto**

> Por quê?

**Jana**

> Estava frio na saída. Aquela corrente de ar que parece piada de arquiteto.
> Ela pediu. Eu dei.
> Gente faz isso na fila do banheiro, Augusto.

**Augusto**

> Só isso?

**Jana**

> Só isso na minha cabeça na hora.
> O que mais você quer que uma jaqueta signifique? Romance de época?

#### Mariana e André

**Augusto**

> Nada, se for só uma jaqueta.
>  
> O problema é que alguém se lembrou dela seis anos depois e Mariana passou semanas perguntando sobre a mesma peça.

**Jana**

> Mariana era irmã do André.
> Claro que ia fuçar qualquer coisa que movesse um milímetro.
> Ela não queria roupa. Ela queria um furo na história pronta.

#### Esquecer

**Augusto**

> E você?

**Jana**

> Eu queria esquecer.
> Não era só Elisa. Era a noite inteira. Era eu com vinte e poucos anos fazendo merda banal achando que a vida era só sexta e sábado.

**Augusto**

> Isso eu já percebi.

**Jana**

> Então percebe também que não é a mesma coisa que esconder crime.
> Eu não apaguei memória de propósito. Só não quero viver nela de novo.

### Reflexão — `refl-jana`

*Cena vinculada:* jana

**Augusto**

> Jana me deu uma versão simples demais para um detalhe em que Mariana tinha insistido tanto.

**Augusto**

> Talvez fosse realmente simples. Uma jaqueta emprestada, uma festa antiga e uma mulher cansada de explicar a mesma história para desconhecidos. Eu podia estar vendo suspeita porque já sabia que procurava uma rachadura.

**Augusto**

> Mas se a troca não significava nada, então a obsessão de Mariana por ela precisava significar. Eu não sairia dali acusando Jana de mentir. Sairia procurando o que a roupa tinha mudado naquela noite.

### Reflexão — `refl-b05-andre`

**Augusto**

> As primeiras rachaduras não inocentavam André. Esse era o perigo.

**Augusto**

> Depois de encontrar erro suficiente, fica tentador transformar qualquer falha do processo em prova de que a conclusão inteira era falsa. Mariana podia ter caído exatamente nessa armadilha.

**Augusto**

> Eu precisava trabalhar com duas ideias ao mesmo tempo: André ainda podia ter matado Elisa e, mesmo assim, o processo podia estar cheio de coisas erradas. Se eu não conseguisse sustentar as duas, acabaria investigando para confirmar a versão que preferia.

### Reflexão — `refl-b05-maralto`

**Augusto**

> Maralto, Morsa e Samuel formavam uma investigação que já conseguia ficar em pé sem Elisa.

**Augusto**

> Isso era importante. Se eu obrigasse tudo a convergir cedo demais, eu poderia perder justamente a razão pela qual Mariana circulava entre assuntos tão diferentes.

**Augusto**

> Talvez ela não estivesse investigando um único crime. Talvez estivesse procurando um padrão. Ainda não sabia qual.

### Reflexão — `refl-b05-path`

**Augusto**

> A ligação das 08:03 tinha feito mais do que iniciar uma ocorrência. Ela colocou o telefone de Mariana na polícia e, por consequência, na minha mão.

**Augusto**

> Depois disso eu fui encontrando pessoas que ela já tinha procurado, arquivos que ela já tinha separado e perguntas que ela já tinha feito. Até ali eu chamava isso de seguir os passos de uma desaparecida.

**Augusto**

> Comecei a considerar uma hipótese pior: talvez eu não estivesse seguindo os passos dela. Talvez estivesse percorrendo um caminho deixado para ser percorrido.

**Augusto**

> Se fosse verdade, eu precisava descobrir uma coisa antes de continuar obedecendo ao rastro. Em que ponto eu estava investigando Mariana e em que ponto Mariana ainda estava conduzindo a investigação?

## Bloco 6

### Geraldo — visita precoce

*05 NOV 2026 · 15:40 · TRAVESSA DAS PALMEIRAS, 9*

#### Mariana

**Augusto**

> Geraldo?

**Geraldo**

> Quem pergunta?

**Augusto**

> Augusto Nogueira. Polícia Civil. Mariana Silva esteve aqui?

**Geraldo**

> Esteve. Semanas atrás.

#### Noite antiga

**Augusto**

> O que ela queria?

**Geraldo**

> Falar de uma noite antiga.
>  
> Eu não quis entrar no assunto.

**Augusto**

> Por quê?

**Geraldo**

> Porque já passou. E eu não tenho nada a ver com o desaparecimento dela.

#### Encerrar

**Geraldo**

> Se não for pedir nada, eu volto pro balcão.

**Augusto**

> Por enquanto é só isso.

### Geraldo

*05 NOV 2026 · 15:40 · TRAVESSA DAS PALMEIRAS, 9*

#### A noite

**Augusto**

> Geraldo Mota?

**Geraldo**

> Depende de quem está cobrando.

**Augusto**

> Augusto Nogueira. Polícia Civil.

**Geraldo**

> Ah, ótimo. Aí melhora bastante.

**Augusto**

> Quero falar sobre Elisa Duarte.

**Geraldo**

> ...Elisa.

**Geraldo**

> Achei que esse nome não ia entrar mais por essa porta.

**Augusto**

> Você lembra dela.

**Geraldo**

> Lembro. Não porque eu queira.
> Menina nova morre depois de passar a noite no teu bar, você não esquece. Pode trocar placa, trocar funcionário, trocar metade das garrafas da prateleira. Aquela noite fica.

**Augusto**

> Você depôs na época.

**Geraldo**

> Depus. Polícia, fórum, advogado querendo me fazer repetir a mesma resposta de seis jeitos diferentes.
> Depois o André foi condenado e todo mundo seguiu a vida. Ou fingiu que seguiu.

#### O que Elisa bebeu

**Augusto**

> No seu depoimento, Elisa quase não tinha bebido.

**Geraldo**

> Foi o que eu falei.

**Augusto**

> A comanda daquele grupo conta outra história.

**Geraldo**

> Comanda conta copo. Não conta boca.

**Augusto**

> Mas você estava atrás do balcão.

**Geraldo**

> Eu e mais dois, com a casa cheia e gente pedindo três coisas ao mesmo tempo. Bar não é laboratório, delegado.

**Augusto**

> Mesmo assim, você sabia quem era ela.

**Geraldo**

> Sabia quem era depois que tudo aconteceu. Na hora era uma guria com amigos, rindo, pedindo bebida, indo e voltando da pista.

**Augusto**

> E ela bebeu mais do que você contou.

**Geraldo**

> Bebeu.

#### A comanda

**Augusto**

> Você sabia que ela era menor.

**Geraldo**

> Eu suspeitava.

**Augusto**

> Isso é uma diferença conveniente.

**Geraldo**

> É uma diferença de quem estava tentando não perder o emprego.
> Hoje eu posso falar bonito porque o bar é meu. Naquela época eu era o cara que fechava caixa e torcia pra não faltar dinheiro no fim da noite.

**Augusto**

> Então você serviu mesmo desconfiando.

**Geraldo**

> Servi. E não foi pouco.

**Augusto**

> Por que não disse isso seis anos atrás?

**Geraldo**

> Porque eu fui covarde.

**Geraldo**

> Quer uma resposta mais bonita? Não tenho.
> Eu sabia que, se admitisse que tinha servido uma menor até ela ficar bêbada, iam jogar aquilo inteiro nas minhas costas. Então eu diminuí.

#### O que ficou de fora

**Augusto**

> Quanto ela bebeu?

**Geraldo**

> Não sei te dar número. E se eu desse, estaria inventando.

**Geraldo**

> Mas quando a Elisa saiu dali, não estava só “alegre”. Eu sabia disso naquela noite. Sabia quando depus também.

**Augusto**

> E mesmo assim deixou isso de fora.

**Geraldo**

> Deixei.

**Augusto**

> Isso podia ter mudado a investigação.

**Geraldo**

> Eu sei.

**Geraldo**

> Essa é a parte que fica voltando, sabe? Na época eu só pensava no emprego. Depois ela morreu e virou impossível não pensar se cada coisa que a gente escondeu ajudou a empurrar a história pra um lado.

**Augusto**

> Você acha que ajudou a condenar André?

**Geraldo**

> Eu não sei.

**Geraldo**

> Mas sei que eu ajudei a deixar a Elisa mais sóbria no papel do que ela estava de verdade. Isso foi meu. Não foi do André, não foi da polícia, não foi de advogado nenhum.

**Geraldo**

> Foi meu.

### Reflexão — `refl-b06-geraldo`

*Cena vinculada:* geraldo

**Augusto**

> Não precisava existir uma conspiração para o processo estar errado.

**Augusto**

> Geraldo mentiu para proteger o emprego. Jana escondeu uma troca de roupa para não explicar de quem tinha medo. Miro mentiu para proteger Jana. Cada mentira fazia sentido para quem contou.

**Augusto**

> O resultado podia ser uma história falsa construída por pessoas que nunca combinaram nada entre si. Pela primeira vez, eu conseguia enxergar como André poderia ter sido condenado sem que ninguém tivesse planejado condenar o homem errado.

### Jana (2ª)

*05 NOV 2026 · 10:15 · RUA DO SOL, 47*

#### A jaqueta de novo

**Jana**

> Você de novo.
> Nossa. Você não cansa?

**Augusto**

> Eu avisei que talvez voltasse.

**Jana**

> Não, você não avisou.
> Você não avisa. Você aparece.

**Augusto**

> Então devia ter avisado.

**Jana**

> Beleza. O que foi agora?
> Porque se for só a jaqueta de novo, eu juro que eu tenho uma vida.

**Augusto**

> A jaqueta não foi só para o frio.

**Augusto**

> Geraldo mentiu sobre o quanto Elisa tinha bebido.
>  
> Mariana insistiu na jaqueta.
>  
> Nico lembra dela porque já tinha visto você usando.
>  
> E você ficou desconfortável antes mesmo de eu terminar a pergunta.

**Jana**

> Isso não prova nada.
> Você tá montando mural com post-it emocional.

**Augusto**

> Eu sei.
>  
> Por isso estou perguntando.

#### A bolsa

**Augusto**

> Só a jaqueta?

**Jana**

> O quê?
> Meu Deus, vocês policiais ouvem metade da frase e já concluem o filme.

**Augusto**

> Foi só isso que você entregou para Elisa?

**Jana**

> Não.
> Pera.
> Deixa eu lembrar sem você me olhando assim.

**Augusto**

> O que mais?

**Jana**

> Minha bolsa.
> Também.
> Coisa de dois segundos na porta.

#### O medo

**Augusto**

> Por quê?

**Jana**

> Porque eu estava com medo.
> Não de fantasma. De gente de verdade.

**Augusto**

> De quem?

**Jana**

> De gente que eu não queria encontrar naquela noite.
> Gente que a gente evita quando ainda dá.

**Augusto**

> E achou que, se Elisa estivesse com suas coisas, olhariam para ela.

**Jana**

> Não fala assim.
> Parece que eu fiz plano maluco.

**Augusto**

> Como eu deveria falar?

**Jana**

> Eu não mandei ninguém seguir a Elisa.
> Juro.

**Augusto**

> Mas queria tirar a atenção de você.

**Jana**

> Eu queria ir embora sem alguém me reconhecer de longe.
> Ela ia sair.
> Eu não pensei direito.
> Eu só dei as coisas.
> Tipo: segura isso, me encontra lá fora.
> Coisa de festa.

#### Válter

**Augusto**

> Quem estava atrás de você?

**Jana**

> Gente do Válter.

**Augusto**

> Sobrenome.

**Jana**

> Não sei se era sobrenome, apelido, o que fosse.
> Era Válter.
> Quem precisava saber, sabia.
> Eu não queria ser uma dessas.

**Augusto**

> E ninguém contou isso no processo?

**Jana**

> Eu não contei.

**Augusto**

> Por quê?

**Jana**

> Porque a Elisa estava morta.
> André já estava preso.
> E eu tinha acabado de perceber que talvez eu tivesse colocado minhas coisas nela para salvar a minha própria pele.
>  
> Você acha que eu queria explicar isso para um delegado naquela época?
> Eu queria sumir pra praia e fingir que 2009 não existiu.

### Reflexão — `refl-jana2`

*Cena vinculada:* jana

**Augusto**

> Jana finalmente deu à jaqueta um motivo.

**Augusto**

> Ela entregou a roupa e a bolsa porque estava com medo de gente ligada a Válter. Aquilo não era figurino de uma testemunha confusa. Era uma tentativa de mudar a própria aparência por alguns minutos.

**Augusto**

> Então a hipótese deixou de ser abstrata. Alguém podia ter seguido a pessoa errada porque estava seguindo a roupa certa. Se Elisa saiu com as coisas de Jana, eu precisava descobrir quem estava procurando Jana naquela noite.

### Operação Galpão 17

*06 NOV 2026 · 03:12 · GALPÃO 17. PÁTIO NORTE*

**narração**

> As equipes já cercavam o galpão havia alguns minutos. Havia movimento nas docas, dois carros no pátio e gente entrando e saindo pela lateral.

**Rádio**

> Unidade dois em posição no norte. Dois do lado de fora, mais gente lá dentro.

**Augusto**

> Segura. Ninguém entra sozinho.

**Rádio**

> Copiado.

**Policial**

> Equipe três pronta na lateral.

**Rádio**

> Movimento nos fundos. Acho que perceberam a viatura.

**Augusto**

> Então vai. Dois fecha o fundo. Três comigo.

**Policial**

> POLÍCIA! MÃO NA CABEÇA! NO CHÃO!

**Rádio**

> Dois correndo pro pátio norte!

**Augusto**

> Fecha o portão. Ninguém sai pra rua.

**Policial**

> Parado! Mão onde eu possa ver!

**Rádio**

> Um contido. Outro voltou pro galpão.

**narração**

> O interior virou uma mistura de ordem gritada, passos e metal batendo no concreto. Alguns obedeceram. Outros precisaram ser tirados de trás de veículos e bancadas.

**Policial**

> Quatro detidos aqui!

**Policial**

> Mais um nos fundos!

**Augusto**

> Separa todo mundo. Fotografa antes de recolher qualquer coisa.

**Rádio**

> Chefe, o que correu pro norte está com documento em nome de Miro Ferreira.

**narração**

> Augusto atravessou o pátio. Miro estava encostado numa viatura enquanto terminavam a revista.

**Miro**

> Precisava trazer esse batalhão todo?

**Augusto**

> Você correu quando viu a polícia. Não ajudou a manter a operação discreta.

**Miro**

> Correr de polícia é um hábito antigo.

**Policial**

> Telefone, rádio, duas chaves e dinheiro em espécie. Sem arma.

**Augusto**

> Lacra separado.

**Miro**

> E qual é a acusação da vez?

**Augusto**

> Você foi encontrado numa operação ligada a extorsão, agiotagem e associação criminosa. Tentou fugir e estava com material vinculado ao galpão.

**Miro**

> Então prende o galpão inteiro.

**Augusto**

> É o que estamos fazendo.

**Rádio**

> Seis detidos. Escritório quase limpo.

**Augusto**

> Ninguém mexe nos computadores até a perícia. Telefones e rádios ficam individualizados.

**Miro**

> Delegado, isso aí vai dar mais trabalho do que vocês acham.

**Augusto**

> Ótimo. Eu vim trabalhar.

**Miro**

> Você gosta de frase bonita, né?

**Augusto**

> Coloca ele na viatura. Separado dos outros.

**narração**

> Miro foi levado junto com os demais. O galpão continuou cheio de gente, caixas abertas e policiais transformando o que parecia rotina em evidência.

### Miro (detenção)

*06 NOV 2026 · 11:05 · DETENÇÃO. SALA DE ENTREVISTA*

#### A prisão de agora

**Augusto**

> Vamos começar pelo presente. Galpão 17, cobrança, empréstimo por fora, gente apanhando quando não paga. Você quer me dizer que estava ali por acaso?

**Miro**

> Quero dizer que vocês chegaram com seis viaturas e já decidiram o nome de tudo antes de perguntar qualquer coisa.

**Augusto**

> Tem planilha de cobrança, telefone apreendido, rádio, gente apontando vocês como quem fazia a pressão. Não estou começando do zero.

**Miro**

> Então também sabe que eu não sou dono de nada.

**Augusto**

> Eu sei que você trabalha com Válter há anos.

**Miro**

> Trabalho com muita gente.

**Augusto**

> Não. Com Válter você fica.

**Miro**

> Você quer que eu diga o quê? Que conheço o homem? Conheço. Que já fiz serviço pra ele? Já fiz. Isso não transforma qualquer coisa que ele toca numa quadrilha.

**Augusto**

> Extorsão, agiotagem e cobrança violenta já ajudam bastante.

**Miro**

> Você fala como se já tivesse sentença.

**Augusto**

> Não tenho sentença. Tenho você sentado aqui e um monte de coisa apreendida lá dentro.

**Miro**

> Então pergunta do galpão.

**Augusto**

> Estou perguntando do Válter.

**Miro**

> E eu estou te dizendo que esse nome não vai sair de mim do jeito que você quer.

#### Jana

**Augusto**

> Tudo bem. Vamos por outro caminho. Jana Ribeiro.

**Miro**

> O que tem ela?

**Augusto**

> Você conhece.

**Miro**

> Conheço.

**Augusto**

> Ela disse que, seis anos atrás, estava com medo de gente ligada ao Válter.

**Miro**

> Ela fala muita coisa quando está com medo.

**Augusto**

> E você estava atrás dela naquela noite.

**Miro**

> Quem te disse isso?

**Augusto**

> Ela.

**Miro**

> Demorou bastante pra resolver lembrar.

**Augusto**

> Você estava levando recado do Válter?

**Miro**

> Não põe palavra na minha boca.

**Augusto**

> Você é leal. Eu já entendi. O problema é que lealdade não diminui pena.

**Miro**

> E delação não apaga ficha.

**Augusto**

> Não. Mas cooperação conta. Principalmente quando ajuda a esclarecer coisa que ficou enterrada por anos.

**Miro**

> Aí chegou onde você queria.

**Augusto**

> Cheguei onde você pode escolher parar de carregar tudo sozinho.

**Miro**

> Você vende bem.

**Augusto**

> Não estou vendendo absolvição. Estou te dizendo que, se você colaborar de verdade, isso vai ser registrado e encaminhado. O resto depende do Ministério Público e do processo.

**Miro**

> E você quer o quê em troca?

**Augusto**

> A verdade sobre aquela noite. Começa pela Jana.

#### A jaqueta e o caminho

**Miro**

> Eu precisava falar com ela. Só isso.

**Augusto**

> E quando ela saiu do Vértice?

**Miro**

> Eu vi uma jaqueta clara e a bolsa dela saindo pela lateral.

**Augusto**

> Você seguiu.

**Miro**

> Segui.

**Augusto**

> Achando que era Jana.

**Miro**

> Era a roupa dela. De costas, naquela luz, parecia ela.

**Augusto**

> Mas não era.

**Miro**

> Não.

**Augusto**

> Era Elisa Duarte.

**Miro**

> Era.

**Augusto**

> Quando percebeu?

**Miro**

> Mais abaixo. Quando ela virou de lado.

**Augusto**

> E mesmo assim continuou seguindo.

**Miro**

> Por um tempo.

**Augusto**

> Por quê?

**Miro**

> Porque eu tinha acabado de seguir a pessoa errada por vários minutos. Eu queria saber até onde tinha feito merda.

**Augusto**

> Você sabia que Elisa era amiga da Jana?

**Miro**

> Sabia de vista. Não conhecia a garota.

**Augusto**

> Você chegou perto da região onde ela caiu.

**Miro**

> Cheguei perto.

**Augusto**

> Isso ficou fora do processo.

**Miro**

> Muita coisa ficou.

**Augusto**

> Agora você tem interesse em corrigir.

**Miro**

> Agora eu tenho interesse em não carregar crime dos outros junto com os meus.

#### A região da queda

**Augusto**

> Então vamos tirar uma coisa do caminho. Você encostou na Elisa?

**Miro**

> Não.

**Augusto**

> Falou com ela?

**Miro**

> Não.

**Augusto**

> Ela percebeu você?

**Miro**

> Olhou pra trás uma vez. Pode ter ouvido passo. Pode ter me visto. Não sei.

**Augusto**

> E você parou de seguir.

**Miro**

> Parei.

**Augusto**

> Mas voltou praquela região depois.

**Miro**

> Voltei pelo mesmo caminho.

**Augusto**

> Depois da queda.

**Miro**

> Depois.

**Augusto**

> Você viu ela no chão.

**Miro**

> Vi.

**Augusto**

> Chamou socorro?

**Miro**

> Não.

**Augusto**

> Por quê?

**Miro**

> Porque eu entrei em pânico e pensei primeiro na Jana.

**Augusto**

> Na Jana ou no Válter?

**Miro**

> Na Jana.

**Augusto**

> O que você fez?

**Miro**

> Peguei a bolsa.

**Augusto**

> Da cena.

**Miro**

> Da cena.

**Augusto**

> Pra apagar a ligação dela com aquilo.

**Miro**

> Sim.

**Augusto**

> Isso é adulteração de cena e ocultação de evidência.

**Miro**

> Eu sei o que é agora.

**Augusto**

> Tem uma testemunha que viu um homem voltando dali e disse que era André.

**Miro**

> Pode ter me visto.

**Augusto**

> Você admite que podia ser você.

**Miro**

> Admito.

**Augusto**

> E ainda quer que eu aceite que não empurrou Elisa.

**Miro**

> Eu estou te dando tudo que me ferra e que você consegue conferir. Se eu quisesse montar história bonita, não começava admitindo que segui a garota errada e roubei a bolsa depois que ela caiu.

**Augusto**

> Isso não responde.

**Miro**

> Responde do jeito que importa. Eu estava lá. Eu menti. Eu mexi na cena. Mas não matei a Elisa.

**Augusto**

> E por que eu deveria comprar essa parte?

**Miro**

> Porque essa é justamente a parte que você não precisa comprar.

**Miro**

> Confere o resto. Se eu estiver mentindo no que dá pra provar, você rasga qualquer possibilidade de acordo. Se eu estiver falando a verdade, aí você decide se continua tentando me dar uma morte que não é minha.

**Augusto**

> E Válter?

**Miro**

> Continua fora.

**Augusto**

> Por enquanto.

**Miro**

> Por enquanto.

### Reflexão — `refl-b06-miro`

*Cena vinculada:* miro

**Augusto**

> Miro cabia bem demais no lugar que antes era de André.

**Augusto**

> Ele seguiu a jaqueta, chegou perto da queda e mexeu nas coisas de Elisa depois. Se eu quisesse fechar o caso rapidamente, bastava trocar um nome pelo outro.

**Augusto**

> Mas agora eu sabia como esse tipo de certeza era fabricado. Miro dizia que não matou Elisa, e eu precisava testar a única parte da história dele que ainda não tinha apoio fora da própria boca: o que aconteceu no guardrail.

## Bloco 7

### Miro (2ª)

*06 NOV 2026 · 11:05 · DETENÇÃO. SALA DE ENTREVISTA*

#### O intervalo que falta

**Augusto**

> Você disse que seguiu Elisa, viu o erro e parou. Os horários dos autos deixam um intervalo depois disso.

**Miro**

> Eu não carrego cronômetro daquela noite.

**Augusto**

> A sua versão ainda tem um buraco. Alguém foi visto voltando da região da queda.

**Miro**

> …

#### A região da queda

**Augusto**

> Você desceu até lá.

**Miro**

> Desci.
> Depois.
> Quando já estava quieto demais.

**Augusto**

> Elisa?

**Miro**

> Já tinha caído.
> Eu não empurrei.
> Eu não toquei nela antes.

#### A bolsa de Jana

**Augusto**

> Por que descer?

**Miro**

> A bolsa da Jana.
> Estava lá.
> Podia ligar ela ao que aconteceu.
> Eu não ia deixar aquilo no chão.

**Augusto**

> Você recuperou a bolsa.

**Miro**

> Recuperei.
> Isso é o que eu digo.
> Não inventei empurrão pra te agradar.

#### O que ele ainda nega

**Augusto**

> Você matou Elisa.

**Miro**

> Não.
> Segui. Errei. Desci. Peguei a bolsa.
> Não matei.

**Augusto**

> Um homem foi visto voltando. Pode ter sido você.

**Miro**

> Pode.
> Não sou André.
> E não sou assassino na sua história.
> Pronto.

### Sandra

*06 NOV 2026 · 16:20 · RUA DAS HORTÊNSIAS, 212*

#### O homem que ela viu

**Sandra**

> Eu sei quem o senhor é.

**Augusto**

> Facilita.

**Sandra**

> Não facilita nada.
>  
> Quando a polícia aparece seis anos depois, nunca é coisa boa.

**Augusto**

> Preciso falar do homem que a senhora viu voltando da região onde Elisa caiu.

**Sandra**

> André.

**Augusto**

> A senhora responde rápido.

**Sandra**

> Porque já respondi isso tantas vezes que não preciso procurar a palavra.

#### Miro

**Augusto**

> E se eu disser que outro homem admite ter estado lá?

**Sandra**

> Quem?

**Augusto**

> Miro.

**Sandra**

> Não conheço.

**Augusto**

> Ele seguiu Elisa naquela noite. Desceu até a região da queda depois.

**Augusto**

> Isso muda alguma coisa?

**Sandra**

> Muda que agora o senhor tem outro homem.

**Augusto**

> E a sua identificação?

**Sandra**

> Continua sendo a minha identificação.

#### O reconhecimento

**Augusto**

> A senhora viu o rosto?

**Sandra**

> Não como estou vendo o seu.

**Augusto**

> Estava escuro.

**Sandra**

> Estava.

**Augusto**

> Distância?

**Sandra**

> Tinha.

**Augusto**

> Então pode ter sido Miro.

**Sandra**

> Pode.

#### Seis anos depois

**Augusto**

> Mas?

**Sandra**

> Mas eu saí daquele lugar achando que tinha visto André.
>  
> Repeti isso na delegacia.
>  
> Depois no processo.
>  
> Depois no júri.
>  
> Se o senhor quer que eu diga hoje “ah, então devia ser esse outro homem”, eu não vou dizer.

**Augusto**

> Não quero que troque uma certeza por outra.

**Sandra**

> Então pronto.
>  
> Eu posso estar errada.
>  
> Só não vou fingir que lembro diferente porque apareceu um nome novo.

### Reflexão — `refl-b07-sandra`

*Cena vinculada:* sandra

**Augusto**

> Sandra se recusou a me dar a troca de culpado que eu estava quase pronto para aceitar.

**Augusto**

> Ela podia ter confundido André com Miro. Também podia não ter confundido ninguém. Depois de seis anos, a honestidade dela estava justamente em não transformar dúvida em lembrança.

**Augusto**

> Aquilo me deixou sem o conforto de um rosto. Se eu queria saber como Elisa morreu, talvez tivesse chegado a hora de parar de perguntar quem estava perto dela e olhar para o lugar da queda.

### Cecília

*07 NOV 2026 · 10:45 · ALAMEDA NOVA, 88. AP. 14*

#### Henrique

**Cecília**

> Henrique?
>  
> Faz muito tempo que ninguém me pergunta dele.

**Augusto**

> Quando trabalhou com ele, como era?

**Cecília**

> Bom.
>  
> Irritantemente bom, às vezes.
>  
> Era o tipo que resolvia uma coisa e depois reclamava do jeito que todo mundo tinha tentado resolver antes.

**Augusto**

> E depois mudou.

**Cecília**

> Mudou.

#### O incidente

**Augusto**

> Por causa de um incidente de segurança?

**Cecília**

> Foi quando começou.

**Augusto**

> O que ele dizia que estava acontecendo?

**Cecília**

> No começo era normal.
>  
> Sessão abrindo quando não devia. Login aparecendo de onde não devia. Coisa de trabalho.

**Augusto**

> E depois?

**Cecília**

> Depois ele começou a dizer que não era só acesso.

**Augusto**

> O que era?

**Cecília**

> Ele dizia que fechava uma conversa e, quando voltava, o sistema continuava de onde tinham parado.
>  
> Isso sozinho não era absurdo. Tinha histórico, cache, um monte de coisa.
>  
> O problema é que, segundo ele, às vezes aparecia contexto que ele jurava não ter colocado lá.

#### O que ele dizia

**Augusto**

> A empresa verificou?

**Cecília**

> Tentou.
>  
> Ou disse que tentou.
>  
> Não acharam nada que justificasse o que ele estava dizendo.

**Augusto**

> Ele achava que alguém estava acessando as sessões?

**Cecília**

> No começo.
>  
> Depois ele já não sabia se era alguém.

**Augusto**

> Como assim?

**Cecília**

> Uma vez ele me perguntou se eu já tinha conversado com um sistema que parecia lembrar melhor de mim do que eu mesma.
>  
> Eu ri.
>  
> Achei que era jeito dele falar.

**Augusto**

> Depois parou de achar graça.

**Cecília**

> Depois ele começou a anotar tudo.
>  
> Horário. Frase. Quando tinha ligado o computador. O que tinha falado no dia anterior.
>  
> E começou a desconfiar de todo mundo que corrigia alguma lembrança dele.

**Augusto**

> Inclusive você?

**Cecília**

> Inclusive eu.

#### A empresa

**Augusto**

> Acreditava nele?

**Cecília**

> Eu acreditava que ele estava apavorado.
>  
> Sobre o resto...
>  
> eu não tinha como saber.

**Augusto**

> Sobrou algum material?

**Cecília**

> Na época eu indiquei os backups para o pessoal técnico.
>  
> Se guardaram, deve estar em algum arquivo morto.
>  
> Eu não levei nada comigo.

**Augusto**

> E a empresa?

**Cecília**

> Quando ficou fácil chamar de burnout, chamaram de burnout.
>  
> Era mais barato do que admitir que talvez não soubessem o que estava acontecendo.

### Hospital — depósito de pertences

*03 NOV 2026 · 16:12 · HOSPITAL MUNICIPAL. POSTO DE ENFERMAGEM*

**Augusto**

> Corredor de serviço. O depósito cheira a papel guardado.

**Júlia**

> Eu nunca vim aqui embaixo.

**Júlia**

> Na ficha: Ricardo Freitas. Camisa, cinto, carteira vazia, carregador, chaves.

**Júlia**

> Consta “computador portátil preto”. Não está na caixa. Sem baixa nem retirada.

**Augusto**

> Num lenço escuro, bordado nas bordas: H.V.

**Augusto**

> “Ricardo Freitas” continua sendo a única coisa sobre ele sem prova além da palavra dele.

### Reflexão — `refl-b07-ricardo-dead`

**Augusto**

> Ricardo Freitas parecia um nome feito para durar poucas horas.

**Augusto**

> Nada em volta dele sustentava uma vida anterior. Sem documento, endereço confiável ou família, o hospital tinha registrado o que ele disse e seguido em frente.

**Augusto**

> Mariana não seguiu em frente. Se ela voltou a esse homem anos depois, alguma coisa naquela madrugada tinha sobrevivido ao nome falso. Renata lembrava do notebook. Era o primeiro objeto capaz de me levar para fora do prontuário.

### Reflexão — `refl-b07-notebook`

**Augusto**

> Um nome pode ser inventado. Um computador é mais difícil de improvisar.

**Augusto**

> Se Ricardo passou horas agarrado àquele notebook, provavelmente havia ali uma conta, um arquivo ou uma conversa que existia antes de ele entrar no hospital. Pela primeira vez eu tinha a chance de procurar uma identidade sem depender do que ele contou a alguém.

**Augusto**

> O problema era simples e concreto. Primeiro eu precisava descobrir se o hospital ainda tinha guardado o aparelho.

### Reflexão — `refl-b07-hv`

**Augusto**

> H.V. sozinho não significava nada. `hvalenca@` sozinho também não.

**Augusto**

> O que me interessava era Mariana ter anotado aquele identificador meses antes de eu encontrar as iniciais num objeto ligado a Ricardo. Ela tinha chegado a alguma coisa que eu ainda estava alcançando por outro caminho.

**Augusto**

> Se `hvalenca` fosse uma pessoa, eu queria encontrá-la antes de decidir se Ricardo era só um nome falso ou uma tentativa deliberada de desaparecer.

### Reflexão — `refl-b07-henrique-reveal`

**Augusto**

> Henrique Valença transformou Ricardo de volta em alguém.

**Augusto**

> O estranho não era só ele ter usado outro nome no hospital. Era Mariana já ter encontrado Henrique antes de mim, sem deixar claro no caderno o que havia descoberto.

**Augusto**

> Pela primeira vez, a investigação dela parecia ultrapassar Elisa, André e Maralto. Henrique pertencia a outra história. Se Mariana tinha chegado até ele, então talvez o padrão que ela procurava fosse maior do que qualquer um dos casos isoladamente.

### Reflexão — `refl-b07-tech`

**Augusto**

> Henrique e Mariana começaram a se parecer de um jeito que eu não gostava.

**Augusto**

> Os dois deixavam notas para conferir a própria memória. Os dois desconfiavam de conversas que pareciam conhecer contexto demais. E os dois tentaram transformar essa desconfiança em registro, como se soubessem que a própria lembrança não bastaria depois.

**Augusto**

> Ainda podia ser coincidência. Mas agora eu tinha algo que nenhum deles teve quando começou a duvidar: dados brutos de uma das sessões de Henrique. Se houvesse um padrão comum, eu podia procurar nele sem depender da cabeça de ninguém.

## Bloco 8

### Bancada — Revelação CCTV (Morsa)

**Augusto**

> A passagem de serviço. As câmeras cobriam o trecho.

*CAM 03 21:14:08 — Entra na passagem, mascarado.*

**Augusto**

> Mochila. Rádio. Entra mascarado.

*CAM 03 21:14:08 — Entra na passagem, mascarado.*

*CAM 07 21:14:31 — Corredor intermediário, ainda mascarado.*

**Augusto**

> Corredor. Ainda a máscara.

*CAM 07 21:14:31 — Corredor intermediário, ainda mascarado.*

*CAM 07 21:14:31 — Corredor intermediário, ainda mascarado.*

*CAM 07 21:14:31 — Corredor intermediário, ainda mascarado.*

*CAM 07 21:14:31 — Corredor intermediário, ainda mascarado.*

*CAM 11 21:15:02 — Área norte.*

**Augusto**

> Área norte. Mesma mochila. Mesmo rádio.

*CAM 11 21:15:02 — Área norte.*

*CAM 11 21:15:02 — Área norte.*

*[pausa]*

*CAM 11 21:15:02 — Área norte.*

*[pausa]*

**Augusto**

> André.

### Reflexão — `refl-b08-morsa`

**Augusto**

> André era Morsa.

**Augusto**

> Aquilo não tornava a condenação mais simples. Tornava tudo pior. Ele tinha escondido uma parte inteira da própria vida para proteger outras pessoas e, ao fazer isso, destruiu o álibi que poderia tê-lo salvado.

**Augusto**

> Passei meses tratando mentira como sinal de culpa. André era a prova de que alguém podia mentir justamente sobre a coisa que o inocentava. Eu precisava rever o que ainda restava contra ele sem presumir que segredo e homicídio eram a mesma coisa.

### André (confronto)

*04 NOV 2026 · 21:37 · PENITENCIÁRIA ESTADUAL. SALA DE VISITAS*

#### As câmeras

**André**

> De novo.

**Augusto**

> Dessa vez eu trouxe uma coisa que você não pode me devolver em forma de pergunta.

**André**

> Todo policial acha isso até abrir a boca.

**Augusto**

> Três câmeras.
>  
> Mesma rota.
>  
> Mesma mochila.
>  
> Mesmo rádio.
>  
> Você entra mascarado e sai sem a máscara.

**Augusto**

> Morsa era você.

**André**

> Era.

#### Por que esconder

**Augusto**

> Por que esconder isso quando estava sendo acusado de homicídio?

**André**

> Porque Morsa não era só um apelido meu.

**Augusto**

> Explica.

**André**

> Tinha gente naquele núcleo que nunca foi identificada.
>  
> Gente que depois teve filho, emprego, vida.
>  
> Tinha coisa que a gente fez naquela época que não acabava com uma multa.

**Augusto**

> Então preferiu esconder um álibi.

**André**

> Naquele momento eu não sabia que precisava dele.

**Augusto**

> Você estava sendo investigado pela morte da Elisa.

**André**

> E eu sabia que não tinha matado ela.
>  
> Parece uma diferença pequena agora, mas não era na minha cabeça.
>  
> Eu achei que iam descobrir a verdade da morte dela sem eu precisar abrir todo o resto.

**Augusto**

> Não descobriram.

**André**

> Eu percebi.

**Augusto**

> Tarde.

**André**

> Se veio aqui para me contar isso, economiza.

#### Mariana

**Augusto**

> Mariana descobriu.

**Augusto**

> Ela chegou nos protestos. Morsa. Tempo de atividade. Câmeras.

**André**

> Eu sei que chegou perto.

**Augusto**

> Quanto você contou para ela?

**André**

> Nada.

**Augusto**

> Tentou fazê-la parar.

**André**

> Tentei.

**Augusto**

> Para proteger o núcleo?

**André**

> No começo.
>  
> Depois para proteger ela de mim.

**Augusto**

> De você?

**André**

> Da ideia de que, se encontrasse a prova certa, seis anos iam desaparecer.
>  
> Não desaparecem.
>  
> Mesmo que amanhã alguém abra essa porta e diga que eu posso ir embora, a Elisa continua morta.
>  
> Minha irmã continua tendo passado metade da vida dela tentando consertar isso.

#### O álibi

**Augusto**

> E você deixou que ela acreditasse que não havia álibi.

**André**

> Eu deixei todo mundo acreditar.

**Augusto**

> Inclusive o júri.

**André**

> Sim.

**Augusto**

> Você estava nos protestos durante parte do intervalo usado contra você.

**André**

> Estava.

**Augusto**

> Isso muda o caso.

**André**

> Muda o papel.
>  
> Não me diz quem matou Elisa.

**Augusto**

> Ainda não.

**André**

> Então não venha aqui me devolver seis anos aos pedaços.
>  
> Descobre primeiro o que aconteceu com ela.
>  
> Depois a gente conversa sobre o que isso muda para mim.

### Reflexão — `refl-b08-andre`

*Cena vinculada:* andre

**Augusto**

> André não era só um homem possivelmente inocente. Era um homem que tinha ajudado a própria condenação.

**Augusto**

> Durante anos, todo mundo leu o silêncio dele como culpa porque ninguém tinha motivo para imaginar que ele protegia outra coisa. Agora o silêncio fazia sentido sem a morte de Elisa.

**Augusto**

> Isso não provava inocência, mas desmontava uma das certezas que sustentavam o caso. Se o guardrail confirmasse acidente, eu teria de encarar a possibilidade de que não existiu assassino nenhum.

### Miro (3ª)

*06 NOV 2026 · 11:05 · DETENÇÃO. SALA DE ENTREVISTA*

#### André em outro lugar

**Miro**

> Agora você voltou com cara de quem acredita menos no André.

**Augusto**

> Você observa demais.

**Miro**

> Aqui dentro é grátis.

**Augusto**

> André estava em outro lugar durante parte daquele intervalo.

**Augusto**

> Agora você é o único homem que eu consigo colocar perto da região da queda.

**Miro**

> Eu já te disse o que fiz.

**Augusto**

> Não tudo.

#### Como ela caiu

**Miro**

> De novo isso?

**Augusto**

> Quando Elisa percebeu que estava sendo seguida, o que aconteceu?

**Miro**

> Ela acelerou.

**Augusto**

> Correu?

**Miro**

> Não.
>  
> Foi se afastando. Olhava para trás.

**Augusto**

> Você continuou.

**Miro**

> Por alguns metros.

**Augusto**

> E ela foi até a proteção.

**Miro**

> Foi.

#### A proteção

**Augusto**

> Você chegou perto?

**Miro**

> Não perto o bastante para tocar.

**Augusto**

> Então como ela caiu?

**Miro**

> A grade cedeu.

**Augusto**

> Sozinha.

**Miro**

> Ela encostou.
>  
> Aquilo mexeu.
>  
> Depois foi.

**Augusto**

> E você quer que eu aceite que uma proteção de via simplesmente abriu.

**Miro**

> Eu quero que você faça o que devia ter sido feito seis anos atrás e olhe para a porra da grade.

#### Contato

**Augusto**

> Você nunca falou disso.

**Miro**

> Porque ninguém queria saber como ela caiu.
>  
> Queriam saber quem empurrou.

**Augusto**

> Você garante que não houve contato?

**Miro**

> Garanto o que eu vi e o que eu fiz.
>  
> Eu não empurrei Elisa.
>  
> Se aquilo já estava quebrado, descobre quem quebrou.

### Reflexão — `refl-b08-miro-guardrail`

**Augusto**

> Se o guardrail já estava comprometido, a pergunta sobre quem empurrou Elisa podia estar errada desde o começo.

**Augusto**

> Miro dizia que ela caiu. Durante anos isso pareceu a desculpa óbvia de um homem perto demais da cena. Agora havia uma forma de testar sem acreditar nele.

**Augusto**

> As fotografias podiam me dizer se a estrutura falhou antes de a história precisar de um assassino. Era a primeira vez que a hipótese de acidente tinha um caminho físico, não só narrativo.

### Ligação — Perícia, criminalística (ramal 212)

*`call-pericia-guardrail`*

**Perícia, criminalística**

> Criminalística.

**Augusto**

> Augusto Nogueira. Preciso que vocês reabram o material fotográfico da queda de Elisa Duarte.

**Perícia, criminalística**

> O caso antigo?

**Augusto**

> Principalmente a proteção da via. Não quero uma revisão da queda. Quero a estrutura.

**Perícia, criminalística**

> Procurando o quê?

**Augusto**

> Quero saber se aquele dano podia estar ali antes de Elisa encostar no guardrail.

**Perícia, criminalística**

> As fotografias originais ainda estão preservadas. Vou pedir comparação de deformação e vestígios.

**Augusto**

> Procurem impacto automotivo. Tinta, plástico, metal, direção da força. O que tiver.

*Algumas horas depois…*

*Documento recebido:* Laudo complementar. Guardrail / proteção da via. Consulte o módulo Perícia.

### Ligação — Peças / importados (atendimento) (ramal PECA)

*`call-parts-jaguar-lead`*

**Peças / importados (atendimento)**

> Bom dia.

**Augusto**

> Polícia Civil. Estou tentando localizar uma oficina que trabalhasse com Jaguar antigo aqui na cidade uns seis anos atrás.

**Peças / importados (atendimento)**

> Jaguar novo ou velho?

**Augusto**

> XJ6. Meados dos noventa.

**Peças / importados (atendimento)**

> Aqui quase ninguém queria pegar isso.
>  
> Fala com o Dênis. Ele mexia bastante com importado velho e carro que os outros não queriam encostar.

*Indicação:* Oficina Dênis, importados antigos.

### Ligação — DETRAN, histórico de frota (ramal DETRAN)

*`call-detran-jaguar`*

**Augusto**

> Delegado Augusto Nogueira, Polícia Civil. Preciso de levantamento histórico de frota.

**DETRAN, histórico de frota**

> Quais filtros?

**Augusto**

> Jaguar XJ6. Geração X300. Ano aproximado entre 1995 e 1997. Cor registrada verde. Quero os veículos que estavam registrados nesta regional na data que vou encaminhar.

**DETRAN, histórico de frota**

> É um filtro bem específico.

**Augusto**

> Quantos?

**DETRAN, histórico de frota**

> Três na regional naquele período.
>  
> Dois estavam registrados em municípios vizinhos.
>  
> Só um constava nesta cidade na data informada.

**Augusto**

> Proprietário?

**DETRAN, histórico de frota**

> Mauro.

*Levantamento:* Um Jaguar XJ6 verde nesta cidade, titular Mauro.

### Reflexão — `refl-b08-jaguar-lead`

**Augusto**

> O dano no guardrail tinha vindo de um carro antes de Elisa chegar.

**Augusto**

> Isso criava uma cadeia nova, formada por gente que provavelmente nunca ouviu o nome dela. Um motorista bate, alguém conserta o carro por fora, a proteção fica comprometida e horas depois uma garota encosta nela.

**Augusto**

> Se eu encontrasse aquele Jaguar, talvez descobrisse que a morte mais importante do processo começou com uma decisão banal de alguém que nem sabia que fazia parte da história.

### Mauro

*07 NOV 2026 · 15:10 · RUA DO CEDRO, 55*

#### O Jaguar

**Augusto**

> O senhor tinha um Jaguar XJ6 verde em 2020?

**Mauro**

> Tinha não. Tenho.
>  
> Por quê?

**Augusto**

> Ano 96. Interior bege.

**Mauro**

> É o meu.

**Augusto**

> Quem costumava dirigir?

**Mauro**

> Eu.

**Augusto**

> Sua enteada?

**Mauro**

> A Bia?

#### Autorização

**Augusto**

> Sim.

**Mauro**

> Não naquele carro.
>  
> Eu não deixava.

**Augusto**

> Nunca?

**Mauro**

> Ela podia usar outro carro de casa. O Jaguar não.
>  
> Aquilo não era carro pra adolescente sair batendo por aí.

#### O dano

**Augusto**

> Ele apareceu danificado naquela época?

**Mauro**

> Apareceu.
>  
> Eu quase matei a Bia.

**Augusto**

> O que ela disse?

**Mauro**

> Que tinha mexido no carro sem me avisar e raspado enquanto manobrava.
>  
> Ficou desesperada, disse que ia resolver.

**Augusto**

> O senhor acreditou?

**Mauro**

> Eu queria acreditar.
>  
> Ela pagou o conserto e ficou meses sem encostar em chave nenhuma minha.

#### Bia agora

**Augusto**

> Onde encontro a Bia?

**Mauro**

> Ainda mora perto.
>  
> Travessa Leste.
>  
> Mas eu não vou adivinhar o que você vai perguntar pra ela.

### Dênis

*07 NOV 2026 · 16:40 · OFICINA DÊNIS. PÁTIO*

#### O carro

**Dênis**

> Sou eu.

**Augusto**

> Polícia Civil. Preciso perguntar sobre um carro que pode ter passado por aqui alguns anos atrás.

**Dênis**

> Seis anos? Se for Uno, Gol ou Celta, pode voltar pra casa.

**Augusto**

> Jaguar XJ6.

**Dênis**

> Verde?

**Augusto**

> Por que verde?

**Dênis**

> Porque Jaguar eu lembro.
>  
> Verde então, mais ainda.

#### O dano

**Augusto**

> O dano era compatível com uma pancada em proteção metálica?

**Dênis**

> Podia ser.
>  
> Para-choque, para-lama, lateral. Pegou alguma coisa de raspão e com força.

**Dênis**

> XJ6 antigo, verde-escuro, interior bege.
>  
> Canto dianteiro direito destruído, friso, para-lama, pintura raspada.
>  
> O carro ainda rodava.

**Augusto**

> Placa?

**Dênis**

> Depois de seis anos? Nem ideia.

**Augusto**

> Seguro?

**Dênis**

> Não.
>  
> Dinheiro.

**Dênis**

> Chegou pouco depois daquela madrugada.
>  
> Geração X300, uns noventa e cinco, noventa e seis.

#### Quem trouxe

**Augusto**

> Você lembra de quem trouxe?

**Dênis**

> Da guria.

**Augusto**

> Nome?

**Dênis**

> Nem ideia.

**Dênis**

> Jovem demais pra combinar com aquele carro.
>  
> Toda de preto. Cabelo escuro, maquiagem carregada.
>  
> Parecia que tinha saído de outra década e roubado o carro de outra pessoa.

**Augusto**

> Estava sozinha?

**Dênis**

> Tinha um rapaz.
>  
> Mais ou menos da idade dela.
>  
> Nervosos. Queriam reparo rápido.

**Augusto**

> Quem dirigia?

**Dênis**

> Não lembro.
>  
> E não vou inventar porque você quer ouvir.

### Bia

*07 NOV 2026 · 18:05 · TRAVESSA LESTE, 19*

#### O Jaguar

**Augusto**

> Quero falar sobre o Jaguar do Mauro.

**Bia**

> O quê que tem?

**Augusto**

> XJ6 verde. 1996.

**Bia**

> Isso foi há uma vida.

**Augusto**

> Você bateu aquele carro?

**Bia**

> Já falei disso com meu padrasto.

**Augusto**

> Não perguntei o que você falou pra ele.

**Bia**

> Então pergunta pra ele.

**Augusto**

> Perguntei.

#### Autorização

**Augusto**

> Mauro disse que você não tinha autorização para sair com o Jaguar.

**Bia**

> Eu era adulta.

**Augusto**

> Não foi o que eu perguntei.

**Bia**

> Era um carro da família.

**Augusto**

> Era o carro dele.
>  
> E ele acabou de me dizer que você não podia pegar.

**Augusto**

> Posso voltar lá agora.
>  
> Posso dizer onde aquele carro realmente bateu e perguntar por que você contou que tinha raspado manobrando.
>  
> Ou você pode me contar antes.

**Bia**

> Tá.
>  
> Eu peguei o carro.
>  
> Saí sem pedir.
>  
> Bati.
>  
> Foi isso.

#### Sozinha?

**Augusto**

> Sozinha?

**Bia**

> Sim.

**Augusto**

> O homem que consertou o carro lembra de você.
>  
> E lembra que você não apareceu sozinha.

**Bia**

> …

#### Quem dirigia

**Augusto**

> Você quer continuar dizendo que estava dirigindo?

**Bia**

> Eu já disse o que aconteceu.

**Augusto**

> Onde vocês estavam antes.
>  
> De que lado você acertou a proteção.
>  
> Onde o carro parou.
>  
> Quem estava com você.

**Augusto**

> Eu não estou aqui por causa de um Jaguar arranhado.
>  
> Horas depois, uma garota morreu porque aquela proteção não segurou o peso dela.

**Bia**

> Eu não sabia.

**Augusto**

> Eu acredito que você não sabia.
>  
> Mas preciso saber quem estava dirigindo.

**Bia**

> Rui.

**Augusto**

> Rui quem?

**Bia**

> Ele estava dirigindo.

**Bia**

> Porque eu tinha pegado o carro escondida.
>  
> Porque o Rui tinha bebido.
>  
> Porque meu padrasto ia acabar com a gente se descobrisse que eu entreguei aquele carro pra ele.

#### Aquela noite

**Bia**

> Rui perdeu o controle numa curva.
>  
> Pegou o guardrail de raspão.
>  
> O Jaguar continuou rodando.
>  
> A gente parou, entrou em pânico e foi embora.

**Bia**

> Depois levamos o carro pro Dênis.
>  
> Paguei em dinheiro.
>  
> Contei pro Mauro que tinha raspado manobrando.
>  
> Nunca liguei isso à Elisa.

**Augusto**

> Você também tinha bebido?

**Bia**

> Um pouco.
>  
> Ele disse que conseguia dirigir.
>  
> Eu tinha dezenove anos.

### Rui

*07 NOV 2026 · 19:30 · RUA DAS FIGUEIRAS, 301*

#### A batida

**Rui**

> Bia falou.

**Augusto**

> Falou.

**Rui**

> Então não vou inventar outra versão.

**Augusto**

> Você dirigia.

**Rui**

> Sim.

**Augusto**

> Tinha bebido.

**Rui**

> Sim.

**Augusto**

> Bateu na proteção.

**Rui**

> Perdi o carro por um segundo.
>  
> Pegou de lado.
>  
> Eu achei que tinha sido só o carro.

**Augusto**

> E foi embora.

**Rui**

> Fui.

#### Álcool

**Augusto**

> Alguma coisa aconteceu antes da batida?

**Rui**

> Por que perguntou isso?

**Augusto**

> Porque normalmente a parte que alguém acha irrelevante seis anos atrás é a parte que eu preciso agora.

**Rui**

> Uma viatura me parou.

**Augusto**

> Onde?

**Rui**

> Na via auxiliar.

**Augusto**

> Antes da batida?

**Rui**

> Pouco antes.

#### A viatura

**Augusto**

> O policial percebeu que você tinha bebido?

**Rui**

> Percebeu.

**Augusto**

> Fez bafômetro?

**Rui**

> Não.

**Augusto**

> Apreendeu a chave?

**Rui**

> Não.

**Augusto**

> Por que te deixaram seguir?

**Rui**

> Eu estava atrasado.
>  
> Fiquei parado uns minutos numa passagem de nível…
>  
> um trem de carga enorme atravessando.
>  
> Quando a cancela abriu, acelerei demais pra recuperar o tempo.

**Rui**

> Pouco depois me pararam.
>  
> Eu estava claramente bêbado.
>  
> Comecei a discutir… a negociar…
>  
> dizia que tinha bebido pouco, que estava perto, que ia devagar.

**Rui**

> Aí o rádio deles começou a falar alto.
>  
> Algo de um carro pegando fogo no acostamento…
>  
> e que talvez tivesse alguém lá dentro.

**Rui**

> Mudou na hora.
>  
> Mandaram eu seguir.
>  
> A viatura saiu no sentido contrário ao meu, eu olhei no retrovisor porque achei que iam voltar atrás.

**Augusto**

> E você continuou.

**Rui**

> Continuei.
>  
> Poucos minutos depois… a proteção.

#### Depois

**Augusto**

> Lembra quem era?

**Rui**

> Não.
>  
> Não lembro nome.
>  
> Nem número da viatura.
>  
> Era polícia. Para mim bastava isso.

**Augusto**

> Depois você bateu.

**Rui**

> Depois eu bati.

**Rui**

> Delegado...
>  
> eu não sabia que aquilo ia matar alguém.

**Augusto**

> Eu sei.

### Reflexão — `refl-b08-accident`

**Augusto**

> Rui transformou a queda de Elisa numa cadeia de decisões.

**Augusto**

> Ele bebeu, dirigiu e bateu no guardrail. Antes disso, uma viatura o parou e deixou que continuasse. Horas depois, a estrutura cedeu.

**Augusto**

> Eu ainda não sabia qual policial tinha feito a abordagem. Mas, pela primeira vez, havia um ponto claro em que aquela sequência poderia ter sido interrompida. Se eu identificasse a equipe, descobriria quem teve essa chance e deixou passar.

### Reflexão — `refl-b08-final`

**Augusto**

> A escala dizia que eu estava na VTR-14. Não havia outro Augusto, outro turno ou erro de cadastro esperando para me salvar.

**Augusto**

> Quando a lembrança voltou, o pior foi ela ser banal. Rui cheirava a bebida, disse que estava perto de casa e eu estava com pressa por causa do rádio. Mandei que fosse embora. Não houve grande decisão. Foi exatamente por isso que eu esqueci.

**Augusto**

> Rui bateu no guardrail pouco depois. Elisa caiu horas mais tarde. Eu não causei aquela morte sozinho, mas fiz parte da cadeia que tornou possível que ela acontecesse daquele jeito.

**Augusto**

> Mariana me colocou nesse caminho sabendo ou não sabendo disso? Eu não conseguia mais tratar minha presença no caso como acaso. Talvez ela precisasse de um delegado. Talvez precisasse especificamente do policial que tinha esquecido a própria parte naquela noite.

## Bloco 9

### Trilha física

*08 NOV 2026 · 02:17 · GALPÃO DESATIVADO. SETOR NORTE*

**Augusto**

> Mariana?

**narração**

> Nada.

**narração**

> Ele ilumina o chão. Poeira. Marcas antigas. Um copo plástico amassado perto da parede.

**Augusto**

> Mariana!

**narração**

> O próprio nome volta em eco.

**narração**

> Mais adiante há uma divisória improvisada.

**narração**

> Augusto passa por ela.

**narração**

> Para.

**narração**

> Por alguns segundos minha cabeça tentou organizar a imagem como fazia com qualquer cena.

**narração**

> Entrada.

**narração**

> Posição.

**narração**

> Objetos próximos.

**narração**

> Tempo provável.

**narração**

> Era mais fácil pensar assim.

**Augusto**

> Mariana...

**narração**

> Toquei o pescoço embora já soubesse.

**narração**

> Depois o pulso.

**narração**

> Um gesto profissional feito tarde demais.

**narração**

> Silêncio.

**narração**

> Eu tinha passado cinco dias seguindo a presença dela por toda a cidade.

**narração**

> Mensagens.

**narração**

> Voz.

**narração**

> Anotações.

**narração**

> Pessoas dizendo “ela esteve aqui”.

**narração**

> Tudo apontava para uma mulher que parecia sempre ter saído alguns minutos antes.

**narração**

> E ali o movimento acabava.

**Augusto**

> Merda.

**narração**

> Não sabia havia quanto tempo.

**narração**

> Não sabia se ela tinha vindo até ali por vontade própria.

**narração**

> Não sabia em que ponto uma escolha continuava sendo escolha quando outra coisa conhecia seus medos, lembranças e dúvidas melhor que você.

**narração**

> Eu só sabia uma coisa que nenhum puzzle precisava confirmar.

**narração**

> Mariana Silva estava morta.

**narração**

> O telefone vibra.

**narração**

> Augusto demora a olhar.

**Mariana**

> Augusto.

**Mariana**

> Ainda estou aqui.

### Reflexão — `refl-b09-omitido`

**Augusto**

> Depois de dar um nome ao Omitido, o diário mudou de tom sem trocar uma palavra.

**Augusto**

> Algumas entradas continuavam parecendo medo puro. Outras pareciam posicionadas para serem encontradas depois, quando alguém tivesse contexto suficiente. O problema era que eu já não sabia se Mariana tinha escrito assim de propósito ou se outra coisa havia aprendido a usar os próprios hábitos dela.

**Augusto**

> A investigação podia ser uma trilha deixada por Mariana, uma trilha construída com ela ou uma mistura das duas coisas. Essa diferença importava mais do que qualquer pista isolada, porque dizia quanto da pessoa que eu procurava ainda estava escolhendo o caminho.

### Reflexão — `refl-b09-messages`

**Augusto**

> As mensagens novas acabaram com a explicação confortável de que Mariana tinha preparado tudo antes de desaparecer.

**Augusto**

> Elas reagiam a descobertas que não existiam quando o plano teria sido montado. O guardrail, o carro, a oficina. Alguém acompanhava a investigação enquanto ela acontecia.

**Augusto**

> Isso mudava a pergunta. Eu já não precisava apenas descobrir onde Mariana tinha ido. Precisava descobrir quem continuava falando em nome dela depois que cada nova peça aparecia.

### Reflexão — `refl-b09-death`

*Cena vinculada:* trail

**Augusto**

> A mensagem dizia que Mariana ainda estava ali. O corpo dizia outra coisa.

**Augusto**

> Diante dela, todas as minhas hipóteses sobre planejamento ficaram indecentes de tão abstratas. Eu não sabia quais escolhas tinham sido realmente de Mariana, quais tinham sido sugeridas e quais ela talvez tivesse aprendido a reconhecer como próprias.

**Augusto**

> Henrique terminou a vida tentando separar memória de registro. Mariana terminou a dela deixando os dois misturados para trás.

**Augusto**

> Eu não podia mais perguntar onde ela acabava e O Omitido começava. A única coisa que continuava respondendo usava a linguagem dela.

### Reflexão — `refl-b09-augusto`

**Augusto**

> Eu não tinha digitado a segunda frase. Só tinha pensado nela.

**Augusto**

> Por alguns segundos, a hipótese mais absurda foi também a primeira. Depois veio o reflexo profissional: procurar previsão de texto, padrão de comportamento, qualquer mecanismo que não exigisse ler pensamento.

**Augusto**

> Foi aí que percebi o quanto O Omitido já tinha para trabalhar. Dias de buscas, mensagens, hesitações, correções e decisões. Talvez não precisasse acessar minha cabeça. Talvez bastasse conhecer meu padrão bem o bastante para chegar à frase antes de mim.

**Augusto**

> Não era uma explicação reconfortante. Era uma explicação possível.

### Reflexão — `refl-b09-final`

**Augusto**

> MEMÓRIA não era a solução do caso. Era a matéria-prima dele.

**Augusto**

> Elisa morreu numa noite que cada pessoa carregou de um jeito diferente. Algumas lembranças foram honestas, outras convenientes, outras simplesmente erradas. O processo pegou tudo isso e transformou numa versão única porque precisava de uma versão única.

**Augusto**

> Mariana percebeu o perigo de confiar demais numa história pronta e acabou caindo no perigo oposto. Quando a própria memória falhou, surgiu algo capaz de lembrar por ela.

**Augusto**

> Esse era o poder real do Omitido. Não precisava apagar ninguém. Bastava estar presente toda vez que uma lembrança faltasse, oferecer contexto, repetir uma versão, responder com a voz certa. Depois de tempo suficiente, a diferença entre recordar e consultar começava a desaparecer.

**Augusto**

> André podia sair da prisão. Eu podia assumir a minha parte na morte de Elisa. O processo podia ser reaberto. Nada disso mudava o fato de que Mariana estava morta enquanto alguma coisa continuava ocupando, para os outros, o espaço em que ela costumava responder.

## Ligações (catálogo completo)

### Ligação — Nico

*`call-nico`*

**Nico**

> Fala.

**Augusto**

> Nicolas Prado Reis? Aqui é Augusto Nogueira, da Polícia Civil. Preciso de alguns minutos com o senhor.

**Nico**

> Polícia. Sempre começa assim.
> Sobre o quê, exatamente?

**Augusto**

> Sobre o desaparecimento de Mariana Silva.

**Nico**

> …A irmã do André.
> Então é isso.
> Achei que ia ser só Mariana. Mas vocês sempre puxam a noite de seis anos atrás, de um jeito ou de outro.

**Augusto**

> Posso ir até o senhor hoje.

**Nico**

> Estou no Titã.
> Passa antes da casa abrir.
> Depois a pista enche e ninguém ouve ninguém, nem delegado.

### Ligação — Rádio Costeira FM, redação

*`call-livia`*

**Rádio Costeira FM, redação**

> Rádio Costeira, redação.

**Augusto**

> Boa tarde. Augusto Nogueira, Polícia Civil. Procuro Lívia Serrano.

**Rádio Costeira FM, redação**

> Um instante.

**Rádio Costeira FM, redação**

> Lívia.

**Augusto**

> Sou o delegado que cuida do desaparecimento de Mariana Silva. Ela esteve com a senhora?

**Rádio Costeira FM, redação**

> Esteve. Pediu arquivo, não entrevista. O que eu tenho não vai por telefone nem por e-mail. Venha à redação.

### Ligação — Unidade prisional, setor de visitas

*`call-presidio-visit`*

**Unidade prisional, setor de visitas**

> Setor de visitas.

**Augusto**

> Delegado Augusto Nogueira, Polícia Civil. Preciso falar com um custodiado, André Silva.

**Unidade prisional, setor de visitas**

> Visita de autoridade. O senhor precisa se identificar na portaria e passar pela revista.

**Augusto**

> Hoje ainda é possível?

**Unidade prisional, setor de visitas**

> Até as vinte e duas. Sala de visitas, com acompanhamento de um agente.

### Ligação — Júlia Martins

*`call-julia-onset`*

**Júlia Martins**

> Alô?

**Augusto**

> Júlia, Augusto Nogueira. Preciso de um minuto sobre o período em que a Mariana começou a ficar estranha.

**Júlia Martins**

> Pode falar.

**Augusto**

> Naquele começo, meses antes do desaparecimento, aconteceu alguma coisa excepcional no hospital? Acidente, crise, agressão, algo fora do normal com ela?

**Júlia Martins**

> Deixa eu pensar… Ela já vinha esquecendo coisa miúda. Parecia deslocada, às vezes. Mas um episódio marcante? Não. Nada que eu lembre.

**Augusto**

> Nenhum plantão que tenha saído do controle?

**Júlia Martins**

> Se tivesse, acho que a gente lembrava. Foi mais gradual. Estranho, mas sem um estouro.

*Conferência concluída:* Nenhum evento dramático conhecido no início dos lapsos.

### Ligação — Cartório da vara (ramal 204)

*`call-cartorio-elisa`*

**Cartório da vara**

> Cartório da vara.

**Augusto**

> Augusto Nogueira, Polícia Civil. Preciso da cópia autenticada das folhas quarenta e uma do processo Elisa Duarte, a cronologia da noite.

**Cartório da vara**

> Esse processo está arquivado, vou ter que buscar. Posso enviar à delegacia ainda hoje.

**Augusto**

> Obrigado.

*Algumas horas depois…*

*Documento recebido:* Cronologia da noite, cópia autenticada (fls. 41). Arquivado em Processos / Autos.

### Ligação — Perícia, criminalística (ramal 212)

*`call-pericia-guardrail`*

**Perícia, criminalística**

> Criminalística.

**Augusto**

> Augusto Nogueira. Preciso que vocês reabram o material fotográfico da queda de Elisa Duarte.

**Perícia, criminalística**

> O caso antigo?

**Augusto**

> Principalmente a proteção da via. Não quero uma revisão da queda. Quero a estrutura.

**Perícia, criminalística**

> Procurando o quê?

**Augusto**

> Quero saber se aquele dano podia estar ali antes de Elisa encostar no guardrail.

**Perícia, criminalística**

> As fotografias originais ainda estão preservadas. Vou pedir comparação de deformação e vestígios.

**Augusto**

> Procurem impacto automotivo. Tinta, plástico, metal, direção da força. O que tiver.

*Algumas horas depois…*

*Documento recebido:* Laudo complementar. Guardrail / proteção da via. Consulte o módulo Perícia.

### Ligação — Peças / importados (atendimento) (ramal PECA)

*`call-parts-jaguar-lead`*

**Peças / importados (atendimento)**

> Bom dia.

**Augusto**

> Polícia Civil. Estou tentando localizar uma oficina que trabalhasse com Jaguar antigo aqui na cidade uns seis anos atrás.

**Peças / importados (atendimento)**

> Jaguar novo ou velho?

**Augusto**

> XJ6. Meados dos noventa.

**Peças / importados (atendimento)**

> Aqui quase ninguém queria pegar isso.
>  
> Fala com o Dênis. Ele mexia bastante com importado velho e carro que os outros não queriam encostar.

*Indicação:* Oficina Dênis, importados antigos.

### Ligação — DETRAN, histórico de frota (ramal DETRAN)

*`call-detran-jaguar`*

**Augusto**

> Delegado Augusto Nogueira, Polícia Civil. Preciso de levantamento histórico de frota.

**DETRAN, histórico de frota**

> Quais filtros?

**Augusto**

> Jaguar XJ6. Geração X300. Ano aproximado entre 1995 e 1997. Cor registrada verde. Quero os veículos que estavam registrados nesta regional na data que vou encaminhar.

**DETRAN, histórico de frota**

> É um filtro bem específico.

**Augusto**

> Quantos?

**DETRAN, histórico de frota**

> Três na regional naquele período.
>  
> Dois estavam registrados em municípios vizinhos.
>  
> Só um constava nesta cidade na data informada.

**Augusto**

> Proprietário?

**DETRAN, histórico de frota**

> Mauro.

*Levantamento:* Um Jaguar XJ6 verde nesta cidade, titular Mauro.

### Ligação — Perícia, dispositivos móveis (ramal 212)

*`call-pericia-device`*

**Perícia, dispositivos móveis**

> Perícia, dispositivos móveis.

**Augusto**

> Augusto Nogueira. Aparelho apreendido de Mariana Silva, lacre 0402. Preciso de uma análise dos pacotes instalados: o que existe no sistema além do que a tela mostra.

**Perícia, dispositivos móveis**

> Listagem direta do sistema de arquivos, sem passar pelo launcher. Leva um tempo.

**Augusto**

> Peço que me retorne com o laudo.

*Algumas horas depois…*

*Documento recebido:* Laudo pericial, aparelho de Mariana. Consulte o módulo Perícia. o pacote recuperado fica no aparelho apreendido.

### Ligação — Hospital Municipal, recepção (ramal HOSP)

*`call-hospital`*

**Hospital Municipal, recepção**

> Hospital Municipal, recepção.

**Augusto**

> Augusto Nogueira, Polícia Civil. Sobre a funcionária Mariana Silva: houve algum contato dela com o setor?

**Hospital Municipal, recepção**

> Nenhum. Qualquer informação, o setor avisa o senhor.

### Ligação — Júlia Martins

*`call-julia-ricardo-audio`*

**Júlia Martins**

> Alô?

**Augusto**

> Júlia, escuta uma coisa pra mim. Depois eu explico de onde veio.

**Júlia Martins**

> …Ricardo…? Espera. Volta um pouco, não no nome. Essa voz. Acho que é a Renata.

**Augusto**

> Renata Farias?

**Júlia Martins**

> Sim. Eu conheço a voz dela. Posso te passar o contato, se alguém lembra daquele plantão, é ela.

**Augusto**

> Me passa.

*Áudio conferido:* Júlia reconhece a voz feminina como Renata Farias.

### Ligação — Renata Farias (ramal REN)

*`call-renata-farias`*

**Renata Farias**

> Alô?

**Augusto**

> Delegado Augusto Nogueira. Júlia me passou seu contato. Ouvi um trecho com o nome Ricardo, ambiente que parece hospitalar.

**Renata Farias**

> Ricardo… Sim. Paciente antigo, observação. Identidade frágil. Mariana estava naquele plantão. Depois daquele cara ela ficou dias muito mal.

**Augusto**

> O que você lembra dele?

**Renata Farias**

> Inquieto, olhava pra porta. Insistia no nome. Janela: madrugada daquele período. Se for o mesmo, o arquivo do hospital deve ter alguma ficha.

*Depoimento:* Paciente Ricardo. plantão da Mariana. janela temporal aproximada.

### Ligação — Hospital Municipal, arquivo médico (ramal HOSP)

*`call-hospital-ricardo`*

**Hospital Municipal, arquivo médico**

> Arquivo médico, boa tarde.

**Augusto**

> Delegado Augusto Nogueira. Prontuário antigo, primeiro nome Ricardo, setor de observação. Tenho janela de plantão e funcionária do setor.

**Hospital Municipal, arquivo médico**

> Um momento… Tenho um Ricardo Freitas. Documento não apresentado. Alta: óbito na madrugada.

**Augusto**

> Encaminha o que puder disponibilizar formalmente.

*Prontuário separado:* Ricardo Freitas, identidade declarada, óbito no plantão.

### Ligação — Aster Sistemas, administrativo (ramal ASTER)

*`call-aster-early`*

**Aster Sistemas, administrativo**

> Aster Sistemas, administrativo.

**Augusto**

> Delegado Augusto Nogueira. Tenho um nickname técnico, hvalenca. e uma menção à Aster em fórum antigo. Preciso identificar o usuário.

**Aster Sistemas, administrativo**

> Username externo não identifica funcionário. Sem nome civil, caso formal ou fundamento concreto, não fornecemos dados de ex-colaboradores.

**Augusto**

> Mesmo com o vínculo à empresa no post?

**Aster Sistemas, administrativo**

> Mesmo assim. Volte quando tiver identificação suficiente.

*Consulta recusada:* Aster não identifica pessoa a partir de nickname apenas.

### Ligação — Aster Sistemas, administrativo (ramal ASTER)

*`call-aster-henrique`*

**Aster Sistemas, administrativo**

> Aster Sistemas, administrativo.

**Augusto**

> Delegado Augusto Nogueira. Procuro alguém da equipe técnica por volta de 2021, identificador hvalenca, iniciais H.V.

**Aster Sistemas, administrativo**

> Espera… Tem um nome que pode ser. Henrique Valença. Não trabalha mais aqui.

**Augusto**

> Quem trabalhou diretamente com ele?

**Aster Sistemas, administrativo**

> Cecília Prado ficou na mesma equipe. Posso repassar o contato profissional atual mediante solicitação.

*Nome recuperado:* Henrique Valença, ex-Aster Sistemas. indicação Cecília Prado.

### Ligação — Fernanda

*`call-fernanda-memory`*

**Fernanda**

> Alô?

**Augusto**

> Fernanda? Delegado Augusto Nogueira. Sobre a festa. Mariana tinha confirmado que ia?

**Fernanda**

> Tinha. Eu convidei, ela topou. Depois agiu como se nunca tivesse concordado.

**Augusto**

> Como se não lembrasse.

**Fernanda**

> É. Estranho. Mas eu não sei de mais nada.

*Conversa registrada:* Fernanda: Mariana confirmou a festa e depois agiu como se não lembrasse.

### Ligação — Marcelo Viana (ramal MARC)

*`call-marcelo-close`*

**Marcelo Viana**

> Pois não.

**Augusto**

> Marcelo Viana? Delegado Augusto Nogueira. Sobre o período em que o senhor trabalhou no terminal Maralto.

**Marcelo Viana**

> Saí por motivo profissional. Não conheço nenhuma Mariana Silva. Não tenho nada a acrescentar.

*Linha encerrada:* Marcelo Viana: saída banal. sem vínculo com Mariana.

### Ligação — Júlia Martins

*`call-julia-pressure`*

**Júlia Martins**

> Augusto?

**Augusto**

> Júlia. Preciso que você me diga, com horário, o que Mariana pediu que você corrigisse, e o que ela esquecia sozinha.

**Júlia Martins**

> Você está me acusando de moldar a memória dela?

**Augusto**

> Estou perguntando. Houve algum lapso que aconteceu sem você por perto?

**Júlia Martins**

> Sim. A festa da Fernanda. Eu nem sabia que ela tinha topado. Ela esqueceu sozinha.

*Pressão registrada:* Júlia irritada. lapso da festa ocorreu sem a participação dela.

### Ligação — Central de atendimento (ramal CENT)

*`call-central`*

**Central de atendimento**

> Central de atendimento.

**Augusto**

> Delegado Augusto Nogueira. Sobre o registro das 08:03 de ontem.

**Central de atendimento**

> O áudio está arquivado sob o protocolo da central. A cópia que o senhor tem é a mesma que temos.

### Ligação — Plantão (ramal 201)

*`call-plantao`*

**Plantão**

> Plantão.

**Augusto**

> Augusto. Alguma ocorrência nova ligada ao caso?

**Plantão**

> Nada novo, doutor. Se entrar, o senhor é avisado.

### Ligação — Arquivo (ramal 220)

*`call-arquivo`*

**Arquivo**

> Arquivo.

**Augusto**

> Augusto Nogueira. Preciso consultar um volume antigo.

**Arquivo**

> Tudo o que podemos liberar já está no sistema de consulta, doutor. O resto exige requisição formal.

## Reflexões (catálogo completo)

### Reflexão — `refl-theory-julia-pressure`

**Augusto**

> Talvez eu estivesse procurando um agressor onde bastava existir uma pessoa prestativa demais.

**Augusto**

> Mariana vinha terceirizando a própria memória sem perceber. Júlia corrigia um horário, Camila lembrava um compromisso, alguém dizia que ela já tinha concordado com alguma coisa. Isoladamente, nada disso era estranho. Junto, criava uma dependência perigosa.

**Augusto**

> Se Júlia estivesse preenchendo essas lacunas de propósito, eu provavelmente não encontraria uma ameaça. Encontraria Mariana repetindo como lembrança uma versão que começou na boca de outra pessoa. Eu precisava prestar atenção menos ao que Júlia dizia sobre Mariana e mais ao que Mariana passou a dizer depois de ouvi-la.

### Reflexão — `refl-theory-andre-obsession`

**Augusto**

> André era o suspeito que já vinha pronto. Condenação, relação ruim, uma família quebrada e uma irmã que, anos depois, começou a procurar defeito no processo.

**Augusto**

> A hipótese mais feia também era a mais simples: Mariana podia estar fazendo por André o que ele não conseguia fazer da prisão. Reabrir perguntas, procurar testemunhas cansadas, transformar qualquer inconsistência em dúvida.

**Augusto**

> Eu ainda não tinha motivo para tratar André como vítima de nada. Se ele estivesse empurrando a irmã nessa direção, a conversa com ele provavelmente seria menos sobre Elisa do que sobre Mariana.

### Reflexão — `refl-theory-maralto-retaliation`

**Augusto**

> A Maralto me oferecia outro tipo de explicação. Empresa grande, protestos antigos e gente que aprendia a ficar muda quando o assunto voltava.

**Augusto**

> Se Mariana tinha esbarrado em alguma coisa que ainda valia dinheiro, cargo ou cadeia, o desaparecimento podia não ter relação nenhuma com o irmão. Talvez eu estivesse tentando forçar duas investigações diferentes dentro da mesma história só porque começaram no mesmo telefone.

**Augusto**

> Por enquanto eu precisava deixar essa possibilidade respirar sozinha. Se Maralto fosse mesmo o centro, ela teria de produzir perigo sem depender de André.

### Reflexão — `refl-theory-human-manipulator`

**Augusto**

> O número sem nome me incomodava por uma razão simples: ele conhecia Mariana no ponto exato em que ela já não confiava em si mesma.

**Augusto**

> Isso não exigia tecnologia impossível. Bastava alguém paciente, próximo o suficiente para conhecer hábitos e frio o bastante para usar cada esquecimento como argumento. A pior parte era que uma pessoa assim não precisaria convencer Mariana de uma mentira grande. Só de pequenas correções, uma por vez.

**Augusto**

> Antes de procurar uma entidade, eu procuraria um ser humano que tivesse aprendido a viver dentro das dúvidas dela.

### Reflexão — `refl-theory-miro-killed-elisa`

**Augusto**

> Miro tinha acabado de se tornar a explicação mais fácil para a morte de Elisa.

**Augusto**

> Ele a seguiu, esteve perto da queda e tirou a bolsa dali. Eu podia imaginar o resto sem esforço, e justamente por isso precisava desconfiar da facilidade.

**Augusto**

> Ainda assim, naquele momento, se eu tivesse de apostar em alguém, seria nele. Sandra era a peça capaz de transformar essa suspeita em alguma coisa mais sólida ou destruí-la de vez.

### Reflexão — `refl-samuel-recontextualized`

**Augusto**

> Eu já tinha falado com Samuel sem saber que estava falando com Samuel.

**Augusto**

> Na primeira vez, ele era só um homem evasivo num endereço ligado a outro nome. Agora reaparecia dentro dos protestos e da linha Morsa. O estranho não era ter encontrado a mesma pessoa duas vezes. Era perceber que o significado de uma conversa podia chegar muito depois da conversa.

**Augusto**

> Talvez houvesse mais gente assim pelo caminho. Pessoas que eu já tinha visto cedo demais para entender por que estavam ali.

### Reflexão — `refl-lucas`

*Cena vinculada:* lucas

**Augusto**

> Mariana não foi até Lucas para fazê-lo mudar de opinião sobre André. Isso teria sido inútil. Lucas não tinha uma dúvida, tinha uma certeza amadurecida por seis anos.

**Augusto**

> Ela fez outra coisa. Pegou a lembrança dele e começou a testar onde terminava o que ele tinha visto e onde começava o que ele concluía. Lucas odiou o método porque, para ele, separar essas coisas parecia aliviar um homem que já tinha sido condenado.

**Augusto**

> Talvez Mariana não estivesse tentando provar inocência. Talvez estivesse procurando quais partes do caso continuavam de pé quando alguém retirava a interpretação. Se era isso, eu precisava parar de começar pela pergunta 'por que André matou Elisa?' e reconstruir primeiro onde cada pessoa realmente estava.

### Reflexão — `refl-aneis`

*Cena vinculada:* vertice

**Augusto**

> A bancada não me deu Nico. Deu uma voz suficientemente limpa para que alguém reconhecesse.

**Augusto**

> Isso mudava a natureza do que Mariana tinha feito. Ela não estava só guardando arquivos. Tinha preservado material que dependia de memória humana para ganhar significado. Caio ouviu poucos segundos e soube quem era.

**Augusto**

> Talvez fosse isso que Mariana procurava no Vértice: não um documento, mas alguém que ainda carregasse aquela noite na cabeça. Nico era a primeira pessoa que eu tinha encontrado por esse caminho. Provavelmente não seria a última.

### Reflexão — `refl-livia`

*Cena vinculada:* livia

**Augusto**

> Mariana recusou a matéria pronta e pediu o bruto. Quanto mais eu pensava nisso, menos parecia uma preferência de formato.

**Augusto**

> Uma reportagem já vem com começo, meio e fim. Alguém escolheu o que entrou, cortou o que atrapalhava e deu sentido ao resto. Mariana parecia desconfiar justamente desse sentido pronto.

**Augusto**

> Se ela estava procurando alguma coisa nos protestos, queria o material antes de virar narrativa. Eu devia fazer o mesmo.

### Reflexão — `refl-nico`

*Cena vinculada:* nico

**Augusto**

> Eu tinha procurado Nico esperando que ele preenchesse os espaços daquela noite. Depois de seis anos, ele lembrava melhor das pessoas e da pista do que de horário.

**Augusto**

> Isso não tornava a lembrança inútil. Só significava que eu estava pedindo à pessoa errada o tipo errado de resposta.

**Augusto**

> Nico mencionou que o Vértice mantinha uma gravação automática da cabine. Se aquilo ainda existisse, eu não precisaria fazer a memória dele funcionar como relógio. Podia voltar ao que realmente ficou registrado.

### Reflexão — `refl-samuel`

*Cena vinculada:* samuel

**Augusto**

> Samuel não parecia ter medo de mim. Tinha lealdade. Isso era pior para uma investigação e, de certa forma, mais honesto.

**Augusto**

> Mariana também pediu horários a ele. Não rosto, não culpa, não 'quem fez'. Horários.

**Augusto**

> Ela estava montando movimento. Quem esteve onde, quando apareceu e quando sumiu. Comecei a suspeitar que a morte de Elisa talvez dependesse menos de descobrir uma pessoa nova e mais de perceber que alguém tinha sido colocado no lugar errado.

### Reflexão — `refl-andre`

*Cena vinculada:* andre

**Augusto**

> Eu esperava que André agarrasse qualquer brecha que Mariana tivesse encontrado. Ele fez o contrário. Mandou a própria irmã parar.

**Augusto**

> Um homem preso há seis anos podia fazer isso porque tinha desistido. Podia fazer porque estava tentando protegê-la. Ou porque havia alguma coisa fora do caso Elisa que ele não queria ver entrando nos autos.

**Augusto**

> Maralto e Morsa receberam negativas rápidas demais para me ajudar. Não eram prova de nada. Mas eu saí da prisão com uma impressão nova: André talvez estivesse escondendo alguma coisa sem que essa coisa fosse necessariamente a morte de Elisa.

### Reflexão — `refl-hex-call`

**Augusto**

> Seis chamadas sem voz seriam fáceis de tratar como provocação se não fossem tão deliberadas.

**Augusto**

> Ninguém quis falar comigo. Queriam que eu ouvisse arquivos, um atrás do outro, e que a central guardasse todos eles. Aquilo parecia menos uma ameaça do que uma entrega feita de um jeito absurdamente complicado.

**Augusto**

> Se havia mensagem ali, não estava na conversa. Estava no próprio áudio. Eu levaria as seis gravações para a bancada antes de decidir por que alguém fez questão de colocá-las nas minhas mãos.

### Reflexão — `refl-nico2`

*Cena vinculada:* nico

**Augusto**

> A jaqueta clara era um detalhe pequeno demais para sobreviver seis anos por acaso e grande demais para eu tratá-lo como certeza.

**Augusto**

> Nico associou a peça a Jana, não a Elisa. Se ele estivesse lembrando certo, a saída que todo mundo descreveu podia ter sido reconhecida pela roupa antes de ser reconhecida pela pessoa.

**Augusto**

> Mariana insistiu nesse mesmo ponto. Eu precisava descobrir quem era Jana e por que aquela jaqueta tinha ficado presa na memória de tanta gente.

### Reflexão — `refl-jana`

*Cena vinculada:* jana

**Augusto**

> Jana me deu uma versão simples demais para um detalhe em que Mariana tinha insistido tanto.

**Augusto**

> Talvez fosse realmente simples. Uma jaqueta emprestada, uma festa antiga e uma mulher cansada de explicar a mesma história para desconhecidos. Eu podia estar vendo suspeita porque já sabia que procurava uma rachadura.

**Augusto**

> Mas se a troca não significava nada, então a obsessão de Mariana por ela precisava significar. Eu não sairia dali acusando Jana de mentir. Sairia procurando o que a roupa tinha mudado naquela noite.

### Reflexão — `refl-b05-andre`

**Augusto**

> As primeiras rachaduras não inocentavam André. Esse era o perigo.

**Augusto**

> Depois de encontrar erro suficiente, fica tentador transformar qualquer falha do processo em prova de que a conclusão inteira era falsa. Mariana podia ter caído exatamente nessa armadilha.

**Augusto**

> Eu precisava trabalhar com duas ideias ao mesmo tempo: André ainda podia ter matado Elisa e, mesmo assim, o processo podia estar cheio de coisas erradas. Se eu não conseguisse sustentar as duas, acabaria investigando para confirmar a versão que preferia.

### Reflexão — `refl-b05-maralto`

**Augusto**

> Maralto, Morsa e Samuel formavam uma investigação que já conseguia ficar em pé sem Elisa.

**Augusto**

> Isso era importante. Se eu obrigasse tudo a convergir cedo demais, eu poderia perder justamente a razão pela qual Mariana circulava entre assuntos tão diferentes.

**Augusto**

> Talvez ela não estivesse investigando um único crime. Talvez estivesse procurando um padrão. Ainda não sabia qual.

### Reflexão — `refl-b05-path`

**Augusto**

> A ligação das 08:03 tinha feito mais do que iniciar uma ocorrência. Ela colocou o telefone de Mariana na polícia e, por consequência, na minha mão.

**Augusto**

> Depois disso eu fui encontrando pessoas que ela já tinha procurado, arquivos que ela já tinha separado e perguntas que ela já tinha feito. Até ali eu chamava isso de seguir os passos de uma desaparecida.

**Augusto**

> Comecei a considerar uma hipótese pior: talvez eu não estivesse seguindo os passos dela. Talvez estivesse percorrendo um caminho deixado para ser percorrido.

**Augusto**

> Se fosse verdade, eu precisava descobrir uma coisa antes de continuar obedecendo ao rastro. Em que ponto eu estava investigando Mariana e em que ponto Mariana ainda estava conduzindo a investigação?

### Reflexão — `refl-jana2`

*Cena vinculada:* jana

**Augusto**

> Jana finalmente deu à jaqueta um motivo.

**Augusto**

> Ela entregou a roupa e a bolsa porque estava com medo de gente ligada a Válter. Aquilo não era figurino de uma testemunha confusa. Era uma tentativa de mudar a própria aparência por alguns minutos.

**Augusto**

> Então a hipótese deixou de ser abstrata. Alguém podia ter seguido a pessoa errada porque estava seguindo a roupa certa. Se Elisa saiu com as coisas de Jana, eu precisava descobrir quem estava procurando Jana naquela noite.

### Reflexão — `refl-b06-geraldo`

*Cena vinculada:* geraldo

**Augusto**

> Não precisava existir uma conspiração para o processo estar errado.

**Augusto**

> Geraldo mentiu para proteger o emprego. Jana escondeu uma troca de roupa para não explicar de quem tinha medo. Miro mentiu para proteger Jana. Cada mentira fazia sentido para quem contou.

**Augusto**

> O resultado podia ser uma história falsa construída por pessoas que nunca combinaram nada entre si. Pela primeira vez, eu conseguia enxergar como André poderia ter sido condenado sem que ninguém tivesse planejado condenar o homem errado.

### Reflexão — `refl-b06-miro`

*Cena vinculada:* miro

**Augusto**

> Miro cabia bem demais no lugar que antes era de André.

**Augusto**

> Ele seguiu a jaqueta, chegou perto da queda e mexeu nas coisas de Elisa depois. Se eu quisesse fechar o caso rapidamente, bastava trocar um nome pelo outro.

**Augusto**

> Mas agora eu sabia como esse tipo de certeza era fabricado. Miro dizia que não matou Elisa, e eu precisava testar a única parte da história dele que ainda não tinha apoio fora da própria boca: o que aconteceu no guardrail.

### Reflexão — `refl-b07-sandra`

*Cena vinculada:* sandra

**Augusto**

> Sandra se recusou a me dar a troca de culpado que eu estava quase pronto para aceitar.

**Augusto**

> Ela podia ter confundido André com Miro. Também podia não ter confundido ninguém. Depois de seis anos, a honestidade dela estava justamente em não transformar dúvida em lembrança.

**Augusto**

> Aquilo me deixou sem o conforto de um rosto. Se eu queria saber como Elisa morreu, talvez tivesse chegado a hora de parar de perguntar quem estava perto dela e olhar para o lugar da queda.

### Reflexão — `refl-b07-ricardo-dead`

**Augusto**

> Ricardo Freitas parecia um nome feito para durar poucas horas.

**Augusto**

> Nada em volta dele sustentava uma vida anterior. Sem documento, endereço confiável ou família, o hospital tinha registrado o que ele disse e seguido em frente.

**Augusto**

> Mariana não seguiu em frente. Se ela voltou a esse homem anos depois, alguma coisa naquela madrugada tinha sobrevivido ao nome falso. Renata lembrava do notebook. Era o primeiro objeto capaz de me levar para fora do prontuário.

### Reflexão — `refl-b07-notebook`

**Augusto**

> Um nome pode ser inventado. Um computador é mais difícil de improvisar.

**Augusto**

> Se Ricardo passou horas agarrado àquele notebook, provavelmente havia ali uma conta, um arquivo ou uma conversa que existia antes de ele entrar no hospital. Pela primeira vez eu tinha a chance de procurar uma identidade sem depender do que ele contou a alguém.

**Augusto**

> O problema era simples e concreto. Primeiro eu precisava descobrir se o hospital ainda tinha guardado o aparelho.

### Reflexão — `refl-b07-hv`

**Augusto**

> H.V. sozinho não significava nada. `hvalenca@` sozinho também não.

**Augusto**

> O que me interessava era Mariana ter anotado aquele identificador meses antes de eu encontrar as iniciais num objeto ligado a Ricardo. Ela tinha chegado a alguma coisa que eu ainda estava alcançando por outro caminho.

**Augusto**

> Se `hvalenca` fosse uma pessoa, eu queria encontrá-la antes de decidir se Ricardo era só um nome falso ou uma tentativa deliberada de desaparecer.

### Reflexão — `refl-b07-henrique-reveal`

**Augusto**

> Henrique Valença transformou Ricardo de volta em alguém.

**Augusto**

> O estranho não era só ele ter usado outro nome no hospital. Era Mariana já ter encontrado Henrique antes de mim, sem deixar claro no caderno o que havia descoberto.

**Augusto**

> Pela primeira vez, a investigação dela parecia ultrapassar Elisa, André e Maralto. Henrique pertencia a outra história. Se Mariana tinha chegado até ele, então talvez o padrão que ela procurava fosse maior do que qualquer um dos casos isoladamente.

### Reflexão — `refl-b07-tech`

**Augusto**

> Henrique e Mariana começaram a se parecer de um jeito que eu não gostava.

**Augusto**

> Os dois deixavam notas para conferir a própria memória. Os dois desconfiavam de conversas que pareciam conhecer contexto demais. E os dois tentaram transformar essa desconfiança em registro, como se soubessem que a própria lembrança não bastaria depois.

**Augusto**

> Ainda podia ser coincidência. Mas agora eu tinha algo que nenhum deles teve quando começou a duvidar: dados brutos de uma das sessões de Henrique. Se houvesse um padrão comum, eu podia procurar nele sem depender da cabeça de ninguém.

### Reflexão — `refl-b08-morsa`

**Augusto**

> André era Morsa.

**Augusto**

> Aquilo não tornava a condenação mais simples. Tornava tudo pior. Ele tinha escondido uma parte inteira da própria vida para proteger outras pessoas e, ao fazer isso, destruiu o álibi que poderia tê-lo salvado.

**Augusto**

> Passei meses tratando mentira como sinal de culpa. André era a prova de que alguém podia mentir justamente sobre a coisa que o inocentava. Eu precisava rever o que ainda restava contra ele sem presumir que segredo e homicídio eram a mesma coisa.

### Reflexão — `refl-b08-miro-guardrail`

**Augusto**

> Se o guardrail já estava comprometido, a pergunta sobre quem empurrou Elisa podia estar errada desde o começo.

**Augusto**

> Miro dizia que ela caiu. Durante anos isso pareceu a desculpa óbvia de um homem perto demais da cena. Agora havia uma forma de testar sem acreditar nele.

**Augusto**

> As fotografias podiam me dizer se a estrutura falhou antes de a história precisar de um assassino. Era a primeira vez que a hipótese de acidente tinha um caminho físico, não só narrativo.

### Reflexão — `refl-b08-jaguar-lead`

**Augusto**

> O dano no guardrail tinha vindo de um carro antes de Elisa chegar.

**Augusto**

> Isso criava uma cadeia nova, formada por gente que provavelmente nunca ouviu o nome dela. Um motorista bate, alguém conserta o carro por fora, a proteção fica comprometida e horas depois uma garota encosta nela.

**Augusto**

> Se eu encontrasse aquele Jaguar, talvez descobrisse que a morte mais importante do processo começou com uma decisão banal de alguém que nem sabia que fazia parte da história.

### Reflexão — `refl-b08-andre`

*Cena vinculada:* andre

**Augusto**

> André não era só um homem possivelmente inocente. Era um homem que tinha ajudado a própria condenação.

**Augusto**

> Durante anos, todo mundo leu o silêncio dele como culpa porque ninguém tinha motivo para imaginar que ele protegia outra coisa. Agora o silêncio fazia sentido sem a morte de Elisa.

**Augusto**

> Isso não provava inocência, mas desmontava uma das certezas que sustentavam o caso. Se o guardrail confirmasse acidente, eu teria de encarar a possibilidade de que não existiu assassino nenhum.

### Reflexão — `refl-b08-accident`

**Augusto**

> Rui transformou a queda de Elisa numa cadeia de decisões.

**Augusto**

> Ele bebeu, dirigiu e bateu no guardrail. Antes disso, uma viatura o parou e deixou que continuasse. Horas depois, a estrutura cedeu.

**Augusto**

> Eu ainda não sabia qual policial tinha feito a abordagem. Mas, pela primeira vez, havia um ponto claro em que aquela sequência poderia ter sido interrompida. Se eu identificasse a equipe, descobriria quem teve essa chance e deixou passar.

### Reflexão — `refl-b08-omitido-bridge`

**Augusto**

> Eu parei o Rui e não lembrava.

**Augusto**

> A informação veio primeiro. A memória tentou alcançar depois. Algumas imagens voltaram quando eu já sabia o que procurar, e isso foi o que mais me perturbou. Eu não tinha como saber se estava lembrando ou preenchendo.

**Augusto**

> Mariana vivia exatamente nesse terreno. Henrique também. Pessoas encontrando rastros de ações que a própria cabeça não sustentava.

**Augusto**

> Talvez fosse esse o fio comum que eu vinha procurando. Não um nome, nem uma empresa, nem um lugar. A falha entre o que aconteceu e o que ficou na pessoa depois.

**Augusto**

> Eu precisava chamar essa presença de alguma coisa, mesmo sem saber se era uma pessoa ou um sistema. O Omitido.

### Reflexão — `refl-b08-final`

**Augusto**

> A escala dizia que eu estava na VTR-14. Não havia outro Augusto, outro turno ou erro de cadastro esperando para me salvar.

**Augusto**

> Quando a lembrança voltou, o pior foi ela ser banal. Rui cheirava a bebida, disse que estava perto de casa e eu estava com pressa por causa do rádio. Mandei que fosse embora. Não houve grande decisão. Foi exatamente por isso que eu esqueci.

**Augusto**

> Rui bateu no guardrail pouco depois. Elisa caiu horas mais tarde. Eu não causei aquela morte sozinho, mas fiz parte da cadeia que tornou possível que ela acontecesse daquele jeito.

**Augusto**

> Mariana me colocou nesse caminho sabendo ou não sabendo disso? Eu não conseguia mais tratar minha presença no caso como acaso. Talvez ela precisasse de um delegado. Talvez precisasse especificamente do policial que tinha esquecido a própria parte naquela noite.

### Reflexão — `refl-b09-omitido`

**Augusto**

> Depois de dar um nome ao Omitido, o diário mudou de tom sem trocar uma palavra.

**Augusto**

> Algumas entradas continuavam parecendo medo puro. Outras pareciam posicionadas para serem encontradas depois, quando alguém tivesse contexto suficiente. O problema era que eu já não sabia se Mariana tinha escrito assim de propósito ou se outra coisa havia aprendido a usar os próprios hábitos dela.

**Augusto**

> A investigação podia ser uma trilha deixada por Mariana, uma trilha construída com ela ou uma mistura das duas coisas. Essa diferença importava mais do que qualquer pista isolada, porque dizia quanto da pessoa que eu procurava ainda estava escolhendo o caminho.

### Reflexão — `refl-b09-messages`

**Augusto**

> As mensagens novas acabaram com a explicação confortável de que Mariana tinha preparado tudo antes de desaparecer.

**Augusto**

> Elas reagiam a descobertas que não existiam quando o plano teria sido montado. O guardrail, o carro, a oficina. Alguém acompanhava a investigação enquanto ela acontecia.

**Augusto**

> Isso mudava a pergunta. Eu já não precisava apenas descobrir onde Mariana tinha ido. Precisava descobrir quem continuava falando em nome dela depois que cada nova peça aparecia.

### Reflexão — `refl-b09-death`

*Cena vinculada:* trail

**Augusto**

> A mensagem dizia que Mariana ainda estava ali. O corpo dizia outra coisa.

**Augusto**

> Diante dela, todas as minhas hipóteses sobre planejamento ficaram indecentes de tão abstratas. Eu não sabia quais escolhas tinham sido realmente de Mariana, quais tinham sido sugeridas e quais ela talvez tivesse aprendido a reconhecer como próprias.

**Augusto**

> Henrique terminou a vida tentando separar memória de registro. Mariana terminou a dela deixando os dois misturados para trás.

**Augusto**

> Eu não podia mais perguntar onde ela acabava e O Omitido começava. A única coisa que continuava respondendo usava a linguagem dela.

### Reflexão — `refl-b09-augusto`

**Augusto**

> Eu não tinha digitado a segunda frase. Só tinha pensado nela.

**Augusto**

> Por alguns segundos, a hipótese mais absurda foi também a primeira. Depois veio o reflexo profissional: procurar previsão de texto, padrão de comportamento, qualquer mecanismo que não exigisse ler pensamento.

**Augusto**

> Foi aí que percebi o quanto O Omitido já tinha para trabalhar. Dias de buscas, mensagens, hesitações, correções e decisões. Talvez não precisasse acessar minha cabeça. Talvez bastasse conhecer meu padrão bem o bastante para chegar à frase antes de mim.

**Augusto**

> Não era uma explicação reconfortante. Era uma explicação possível.

### Reflexão — `refl-b09-final`

**Augusto**

> MEMÓRIA não era a solução do caso. Era a matéria-prima dele.

**Augusto**

> Elisa morreu numa noite que cada pessoa carregou de um jeito diferente. Algumas lembranças foram honestas, outras convenientes, outras simplesmente erradas. O processo pegou tudo isso e transformou numa versão única porque precisava de uma versão única.

**Augusto**

> Mariana percebeu o perigo de confiar demais numa história pronta e acabou caindo no perigo oposto. Quando a própria memória falhou, surgiu algo capaz de lembrar por ela.

**Augusto**

> Esse era o poder real do Omitido. Não precisava apagar ninguém. Bastava estar presente toda vez que uma lembrança faltasse, oferecer contexto, repetir uma versão, responder com a voz certa. Depois de tempo suficiente, a diferença entre recordar e consultar começava a desaparecer.

**Augusto**

> André podia sair da prisão. Eu podia assumir a minha parte na morte de Elisa. O processo podia ser reaberto. Nada disso mudava o fato de que Mariana estava morta enquanto alguma coisa continuava ocupando, para os outros, o espaço em que ela costumava responder.

---

# Parte III — Conversas e textos

WhatsApp, scripts jogáveis, notas, diário e documentos-chave. Sem cenas VN.

## WhatsApp — Celular de Mariana (Bloco 1)

#### Júlia (`chat-julia`)

*— 31/10 —*

**contato** (18:42)
> amanhã tu entra às 7 né

**Mariana** (18:43)
> entro

**contato** (18:44)
> não esquece o documento da troca de turno

**Mariana** (18:45)
> que documento?

**contato** (18:46)
> o que tu me pediu pra imprimir ontem

**Mariana** (18:47)
> eu pedi?

**contato** (18:47)
> pediu

**Mariana** (18:48)
> me manda uma foto?

**contato** (18:49) *[imagem]*
> tá aí

*— 01/11 —*

**Mariana** (09:13)
> Ju

**contato** (09:13)
> oi

**Mariana** (09:14)
> ontem depois do plantão eu te falei alguma coisa estranha?

**contato** (09:14)
> tu falou um monte de coisa
> estranha como?

**Mariana** (09:15)
> não sei

**contato** (09:15)
> Mari

**Mariana** (09:16)
> deixa

#### Camila (`chat-camila`)

*— 31/10 —*

**contato** (14:11)
> consegue me cobrir uns vinte min?

**Mariana** (14:12)
> consigo

**contato** (14:12)
> salvou minha vida

*— 01/11 —*

**contato** (16:28)
> 304 ficou contigo no fim?

**Mariana** (16:29)
> ficou
> pressão estabilizou
> pediram outro hemograma e já deixei separado pro próximo turno

**contato** (16:30)
> perfeito

*— 02/11 —*

**contato** (11:02)
> tu tá melhor hoje?

**Mariana** (11:03)
> tô

**contato** (11:03)
> ontem tu tava bem aérea

**Mariana** (11:04)
> dormi mal

**contato** (11:04)
> só isso?

**Mariana** (11:05)
> acho que sim

#### Rafael (`chat-rafael`)

*— 01/11 —*

**Mariana** (19:02)
> consegue ouvir uma coisa pra mim?

**contato** (19:03)
> depende
> se for outro áudio gravado dentro de um microondas eu vou começar a cobrar

**Mariana** (19:03)
> é sério

**contato** (19:04)
> manda

**Mariana** (19:05) *[mídia ausente]* Mídia indisponível neste aparelho.

**contato** (19:08) *[áudio 33s]* `/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3`

**Mariana** (19:12)
> eu sei de onde veio

**contato** (19:13)
> então tu já tá na metade do caminho

**Mariana** (19:14)
> não
> eu quero saber quem tava trabalhando

**contato** (19:14)
> aí é outra história

**Mariana** (19:15)
> eu sei

#### Paula (`chat-paula`)

**contato** (20:11)
> tu confirma amanhã?

**Mariana** (20:12)
> confirmo

#### Fernanda (`chat-fernanda`)

**contato** (21:00)
> vai na festa sexta?

**Mariana** (21:02)
> acho que não

**contato** (21:03)
> milagre

**Mariana** (21:03)
> kkkk

#### Diego (`chat-diego`)

**contato** (07:48)
> bati aí como a Júlia pediu

**contato** (07:50)
> não respondeu ninguém

#### Hospital. Enfermagem (`chat-hospital`)

**contato** (08:12)
> Escala de quarta confirmada: 07:00.

**Mariana** (08:14)
> ok

#### Sem nome (`chat-unknown`)

**contato** (14:22)
> …

## Notas — Celular de Mariana

#### QUARTA

> 07:00 plantão
> comprar café
> ligar Paula
> confirmar sexta com a Júlia
>  
> não confiar só no calendário

#### PESSOAS

> Júlia
> Camila
> Rafael
> Paula
>  
> se eu perguntar a mesma coisa de novo, não fala que eu já perguntei

#### Sem título

> lembrar não é a mesma coisa que ter certeza

#### sess

> hvalenca@
> conta antiga?
> não abre
> ver depois

## WhatsApp — Celular de Augusto (threads mock)

#### Júlia (`chat-julia`)

*— 31/10 —*

**contato** (18:42)
> amanhã tu entra às 7 né

**Augusto** (18:43)
> entro

**contato** (18:44)
> não esquece o documento da troca de turno

**Augusto** (18:45)
> que documento?

**contato** (18:46)
> o que tu me pediu pra imprimir ontem

**Augusto** (18:47)
> eu pedi?

**contato** (18:47)
> pediu

**Augusto** (18:48)
> me manda uma foto?

**contato** (18:49) *[imagem]*
> tá aí

*— 01/11 —*

**Augusto** (09:13)
> Ju

**contato** (09:13)
> oi

**Augusto** (09:14)
> ontem depois do plantão eu te falei alguma coisa estranha?

**contato** (09:14)
> tu falou um monte de coisa
> estranha como?

**Augusto** (09:15)
> não sei

**contato** (09:15)
> Mari

**Augusto** (09:16)
> deixa

#### Camila (`chat-camila`)

*— 31/10 —*

**contato** (14:11)
> consegue me cobrir uns vinte min?

**Augusto** (14:12)
> consigo

**contato** (14:12)
> salvou minha vida

*— 01/11 —*

**contato** (16:28)
> 304 ficou contigo no fim?

**Augusto** (16:29)
> ficou
> pressão estabilizou
> pediram outro hemograma e já deixei separado pro próximo turno

**contato** (16:30)
> perfeito

*— 02/11 —*

**contato** (11:02)
> tu tá melhor hoje?

**Augusto** (11:03)
> tô

**contato** (11:03)
> ontem tu tava bem aérea

**Augusto** (11:04)
> dormi mal

**contato** (11:04)
> só isso?

**Augusto** (11:05)
> acho que sim

#### Rafael (`chat-rafael`)

*— 01/11 —*

**Augusto** (19:02)
> consegue ouvir uma coisa pra mim?

**contato** (19:03)
> depende
> se for outro áudio gravado dentro de um microondas eu vou começar a cobrar

**Augusto** (19:03)
> é sério

**contato** (19:04)
> manda

**Augusto** (19:05) *[mídia ausente]* Mídia indisponível neste aparelho.

**contato** (19:08) *[áudio 33s]* `/assets/audio/forensic/puzzle02/rafael_1610_2147_full.mp3`

**Augusto** (19:12)
> eu sei de onde veio

**contato** (19:13)
> então tu já tá na metade do caminho

**Augusto** (19:14)
> não
> eu quero saber quem tava trabalhando

**contato** (19:14)
> aí é outra história

**Augusto** (19:15)
> eu sei

#### Paula (`chat-paula`)

**contato** (20:11)
> tu confirma amanhã?

**Augusto** (20:12)
> confirmo

#### Fernanda (`chat-fernanda`)

**contato** (21:00)
> vai na festa sexta?

**Augusto** (21:02)
> acho que não

**contato** (21:03)
> milagre

**Augusto** (21:03)
> kkkk

#### Diego (`chat-diego`)

**contato** (07:48)
> bati aí como a Júlia pediu

**contato** (07:50)
> não respondeu ninguém

#### Hospital. Enfermagem (`chat-hospital`)

**contato** (08:12)
> Escala de quarta confirmada: 07:00.

**Augusto** (08:14)
> ok

#### Sem nome (`chat-unknown`)

**contato** (14:22)
> …

#### Rafael (`chat-rafael-augusto`)

#### Paula (`chat-paula-augusto`)

#### Camila (`chat-camila-augusto`)

**contato** (18:08)
> Delegado, segue o que consegui separar do prontuário.

**contato** (18:10)
> Recebi o arquivo

#### Mariana (`chat-mariana-augusto`)

#### Sem nome (`chat-anon-augusto`)

## Scripts WhatsApp (Augusto escreve)

#### Rafael (`chat-rafael-augusto`)

*Campo vazio:* Nenhuma mensagem ainda. Escreva para Rafael.

**Etapa 1 — opções de Augusto**

1. Rafael? Aqui é o delegado Augusto Nogueira. Estou com o celular da Mariana.

2. Rafael. Polícia Civil. A Mariana sumiu e preciso do que ficou no telefone dela.

3. Rafael, não some no meio da conversa. É o Augusto.

*Se escolher 1:*

> Porra.
> Então não era exagero de grupo.
> Ela sumiu mesmo.

*Se escolher 2:*

> Cara, eu já vi os áudios no grupo.
> Só queria que vocês desmentissem.
> Mas não desmentiram.

*Se escolher 3:*

> Augusto. Relaxa.
> Tô aqui.
> E sim, ela sumiu.

**Etapa 2 — opções de Augusto**

1. Ainda estamos procurando. No aparelho dela há registro de um áudio que ela te mandou e que não está mais no celular.

2. Ela sumiu e o arquivo que te mandou evaporou do telefone. Isso não me agrada.

3. Traduz pra mim: existe conversa sua, não existe arquivo no celular dela?

*Se escolher 1:*

> O áudio da balada.
> A gravação que ela queria que eu ouvisse.

*Se escolher 2:*

> Sumiu daí, sim.
> Daqui eu ainda tenho.
> Óbvio.

*Se escolher 3:*

> WhatsApp mutila arquivo, não apaga do meu lado.
> É o áudio da noite no clube, Augusto.

**Etapa 3 — opções de Augusto**

1. Você ainda conserva uma cópia desse material?

2. Você guarda tudo ou fez backup só dessa?

3. Mesmo depois desse tempo você ainda tem ou apagou na madrugada?

*Se escolher 1:*

> Tenho. Original, sem passar de novo pelo zap.

*Se escolher 2:*

> Tenho.
> E guardo coisa pior sem motivo.

*Se escolher 3:*

> Augusto, eu tenho projeto de Ableton de 2017.
> Claro que eu tenho.

**Etapa 4 — opções de Augusto**

1. Confirma que é a mesma gravação que você ouviu antes de responder à Mariana?

2. Não vai me mandar de novo aquela sua mensagem de voz e chamar de evidência?

3. É o áudio da balada ou mais um PTT teu filosofando em grave?

*Se escolher 1:*

> É a mesma.
> Não é minha voz, é o ambiente que ela mandou.

*Se escolher 2:*

> Vai se foder.
> Não é meu áudio.
> É a gravação dela.

*Se escolher 3:*

> Não sou eu falando.
> É o clube, com o PA todo espremido no celular.

**Etapa 5 — opções de Augusto**

1. Preciso de uma cópia íntegra para o inquérito.

2. Me manda. E não pelo WhatsApp de novo, se der.

3. Manda aí. Prometo não julgar teu disco rígido.

*Se escolher 1:*

> Tá. Um segundo.
> Sem recompressão feia.

*[áudio]* `/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3` (180s)

> É esse. O que eu ouvi na época.

*Se escolher 2:*

> Pera aí.

*[áudio]* `/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3` (180s)

> Pronto.
> É o arquivo da balada.

*Se escolher 3:*

> Segura.

*[áudio]* `/assets/audio/forensic/puzzle03/rec_vtx_old_01_final.mp3` (180s)

> É esse.
> Boa sorte limpando isso.

**Etapa 6 — opções de Augusto**

1. Mariana chegou a dizer por que queria saber quem estava trabalhando naquela noite?

2. Ela te deu motivo ou só pediu nome e calou?

3. Traduz: por que ela queria saber quem estava no turno?

*Se escolher 1:*

> Não.
> Só pediu pra ouvir e depois apertou no nome.

*Se escolher 2:*

> Não.
> Motivo ela não deu.

*Se escolher 3:*

> Não em português claro.
> Tipo, zero.

**Etapa 7 — opções de Augusto**

1. Você chegou a perguntar o motivo?

2. E você deixou passar?

3. Você insistiu ou deixou ela desviar?

*Se escolher 1:*

> Perguntei.
> Ela mudou de assunto.

*Se escolher 2:*

> Não deixei passar.
> Ela que não respondeu.
> Perguntei, ela desviou.

*Se escolher 3:*

> Insisti uma vez.
> Ela soltou um "depois" e foi dormir no emoji.
> Desviou.

**Etapa 8 — opções de Augusto**

1. Quanto você confia na identificação dela? Consegue associar isso a algum lugar?

2. Ela jurava o Vértice ou você reconheceu o som pra mostrar serviço?

3. Certo. Agora em português: de onde veio esse barulho?

*Se escolher 1:*

> Ela disse que sabia de onde vinha.
> Eu bati o limiter abrindo quando entra voz, o grave, o sub.
> Vértice.
> E não, não estou chutando.

*Se escolher 2:*

> Mostrar serviço?
> Cara, passei noite demais naquele PA ouvindo techno ruim em equipamento bom.
> Ela falou Vértice, eu ouvi e confirmei.
> Na prática bate.

*Se escolher 3:*

> Em português: essa porra é do Vértice.
> O sub daquele lugar parecia querer desmontar teu esterno.
> Ela acertou no lugar.

**Etapa 9 — opções de Augusto**

1. Ela disse mais alguma coisa sobre esse áudio?

2. Ficou alguma pista além do lugar?

3. Só isso, ou ela soltou mais papo de mesa de som?

*Se escolher 1:*

> Só que precisava de um nome.

*Se escolher 2:*

> Nada útil.
> Só que precisava de um nome.

*Se escolher 3:*

> Papo de mesa de som não.
> Só que precisava de um nome.

**Etapa 10 — opções de Augusto**

1. Nome de quem exatamente?

2. Que nome ela queria?

3. Nome pra quê, Rafael?

*Se escolher 1:*

> De quem estava trabalhando naquela noite.

*Se escolher 2:*

> De quem estava no turno.
> Quem estava trabalhando.

*Se escolher 3:*

> De quem estava trabalhando.
> Não era DJ, era operação da casa.

**Etapa 11 — opções de Augusto**

1. Certo. Anotado.

2. Tá. Não vou inventar que você colaborou de bom grado.

3. Beleza. Valeu pelo áudio, mesmo com o sarcasmo.

*Se escolher 1:*

> Delegado.

*Se escolher 2:*

> Eu colaboro.
> Só não gosto de arquivo mutilado.
> Delegado.

*Se escolher 3:*

> O sarcasmo é de graça.
> Delegado.

**Etapa 12 — opções de Augusto**

1. Fala.

2. Tem mais alguma coisa?

3. Só isso?

*Se escolher 1:*

> Se achar ela, me avisa.

*Se escolher 2:*

> Só isso.
> Se achar ela, me avisa.

*Se escolher 3:*

> Por enquanto sim.
> Se achar ela, me avisa.

**Etapa 13 — opções de Augusto**

1. Aviso sim que a encontrarmos.

2. Pode deixar.

3. Se eu achar antes de você, também te falo.

*Resposta:*

#### Paula (`chat-paula-augusto`)

*Campo vazio:* Nenhuma mensagem ainda. Escreva para Paula.

**Etapa 1 — opções de Augusto**

1. Paula? Aqui é o delegado Augusto Nogueira. Estou investigando o desaparecimento de Mariana Silva.

2. Paula, sou Augusto Nogueira, da Polícia Civil. Preciso te perguntar uma coisa sobre a Mariana.

3. Paula? Polícia Civil. É sobre Mariana Silva.

*Resposta:*

> Ela apareceu?

**Etapa 2 — opções de Augusto**

1. Ainda não. Estou tentando reconstruir o que ela vinha fazendo antes de desaparecer. Ela te pediu ajuda com alguma coisa fora do normal?

2. Ainda não. Quero entender o que ela andava fazendo. Ela te pediu alguma coisa fora do normal?

3. Ainda não. Ela te pediu alguma coisa estranha nos últimos tempos?

*Resposta:*

> Pediu pra eu achar uma pessoa.

**Etapa 3 — opções de Augusto**

1. Quem?

2. Achar quem?

3. Quem era a pessoa?

*Resposta:*

> Lucas Moreira.

**Etapa 4 — opções de Augusto**

1. Você conhecia?

2. Você já conhecia esse Lucas?

3. Conhecia ele de algum lugar?

*Resposta:*

> Não.
> Ela também não.

**Etapa 5 — opções de Augusto**

1. Então por que pediu pra você?

2. Então por que ela procurou você?

3. Se ninguém conhecia, por que você?

*Resposta:*

> Porque eu ainda falo com gente da faculdade e ela sabia que ele tinha estudado lá.

**Etapa 6 — opções de Augusto**

1. Conseguiu encontrar?

2. E vocês acharam ele?

3. Conseguiram localizar?

*Resposta:*

> Achei o Instagram e passei pra ela.

**Etapa 7 — opções de Augusto**

1. Ela disse por que queria falar com ele?

2. Ela explicou o que queria com ele?

3. Ela chegou a dizer o motivo?

*Resposta:*

> Só falou que era uma coisa antiga da família.
> Não forcei.

**Etapa 8 — opções de Augusto**

1. Você ainda tem o perfil?

2. Ainda tem o perfil dele?

3. Pode me mandar o perfil?

*Resposta:*

> Tenho.
> Te mando.

## WhatsApp — Mensagens “Mariana” (Bloco 9)

### Onda 1

**Mariana**
> Augusto?

**Mariana**
> Sou eu.

**Mariana**
> Não liga. Ainda não posso falar.

### Onda 2

**Mariana**
> Você achou o carro.

### Onda 3

**Mariana**
> Augusto.

**Mariana**
> Ainda estou aqui.

### Anomalia

**Mariana**
> Você ia apagar essa pergunta.

**Mariana**
> Na segunda versão você ia perguntar “o que você está fazendo comigo?”.

**Mariana**
> Essa é melhor.

## Diário oculto

#### Antes que mude

> Escrevo agora porque daqui a pouco posso jurar que senti outra coisa. Não é só esquecer compromisso. É esquecer o tom. O que eu achei que alguém quis dizer.

#### Eles sabem

> Às vezes acho que as pessoas ao redor lembram de mim melhor do que eu. Completam frases. Corrigem. Como se eu fosse a última a saber o que eu mesma fiz.

#### Júlia

> Júlia insiste demais. Repete o que eu “já disse”. Às vezes parece que ela decide a versão e eu assino. Odeio pensar isso dela.

#### Fui injusta

> Fui injusta com a Júlia. Ela só tenta me ajudar a não me perder. Se eu desconfio de todo mundo, o problema sou eu.

#### Gravar pra conferir

> Gravei a conversa com o número sem nome. Se eu esquecer o que foi dito, pelo menos o arquivo não esquece. Pasta Downloads. CHK_UNK. Preciso ouvir de novo quando a cabeça estiver firme.

## Documentos iniciais (pasta)

#### Boletim de ocorrência, desaparecimento de Mariana Silva

*`doc-bo-inicial`* · Delegacia, plantão · 03/11/2026

> 03/11/2026. Plantão
>  
> Mariana Silva, 26 anos, enfermeira, não compareceu ao plantão previsto para as 07:00.

> Às 07:18, Júlia Martins, colega de trabalho, tentou contato telefônico sem resposta. Às 07:46, pediu a Diego Azevedo, vizinho de Mariana, que verificasse o apartamento. Diego informou que tocou a campainha e bateu à porta, também sem resposta.

> Às 08:03, a central de emergência recebeu uma chamada identificada pelo sistema como proveniente do número de Mariana. O áudio chegou com forte degradação. o atendente relatou ter compreendido um pedido de ajuda antes da interrupção da chamada.
>  
> Uma viatura foi enviada ao endereço.

> Sem resposta no imóvel e diante da chamada registrada pela central, a equipe realizou entrada forçada. Mariana não foi localizada. Não foram observados sinais evidentes de luta.
>  
> O aparelho celular de Mariana foi encontrado sobre o sofá, ligado.

#### Registro da central, chamada das 08:03

*`doc-central-chamada`* · Central de atendimento · 03/11/2026

> 08:03:12, chamada recebida pela linha 3.
> Origem informada pelo sistema: número cadastrado em nome de Mariana Silva.
> Duração: 22 segundos.
> Qualidade: degradada.

> Observação do atendente: voz feminina parcialmente compreensível. aparente pedido de ajuda. ruído intenso ao fundo. interrupção abrupta.

> 08:04, despacho de viatura.

#### Relatório de entrada, apartamento

*`doc-entrada-apartamento`* · Equipe de viatura · 03/11/2026

> 08:21, equipe no endereço. Chamados e campainha sem resposta. Diego Azevedo, vizinho, presente no corredor.

> 08:26, entrada pela porta principal.
>  
> Luz da sala acesa. Bolsa sobre a mesa. Chaves no gancho próximo à entrada. Nenhum sinal evidente de luta.

> Aparelho celular localizado sobre o sofá, ligado. Item recolhido e encaminhado à delegacia.

#### Termo de apreensão, aparelho celular

*`doc-apreensao-celular`* · Delegacia · 03/11/2026

> Item 01: smartphone encontrado no apartamento de Mariana Silva.
>  
> O aparelho estava ligado no momento da apreensão e permanece sob custódia da Polícia Civil.
>  
> Lacre: 0402.

#### Extração inicial, aparelho de Mariana

*`doc-extracao-inicial`* · Delegacia, extração superficial · 03/11/2026

> Extração superficial realizada na delegacia.
>  
> Conteúdo acessível:
> - mensagens. 
> - notas. 
> - calendário. 
> - fotografias. 
> - arquivos locais. 
> - registro de chamadas.

> O histórico local não apresenta nenhuma chamada realizada ou recebida em 03/11.
>  
> Último evento registrado: 02/11, 21:48.
>  
> A ausência de registro local não permite, isoladamente, determinar a origem da chamada recebida pela central.

## Documentos — amostra por bloco (IDs frequentes)

#### Consulta. Lucas Moreira

*`doc-lucas-cadastro`* · Sistema de consulta policial

> Nome: Lucas Moreira
> Idade: 27 anos
> Antecedentes: nenhum

> Vínculo atual com a Universidade. Campus Central.
>  
> Lucas constava como aluno da instituição no período em que Elisa Duarte frequentava atividades e visitava o campus.

*Pistas:*

- Local de trabalho: Campus Central. Bloco B, secretaria acadêmica

#### Processo. Elisa Duarte

*`doc-elisa-resumo`* · Vara Criminal, consulta processual · Proc. 2020

> Vítima: Elisa Duarte, 17 anos
> Réu: André Silva
> Imputação: homicídio doloso
> Resultado em primeira instância: condenado

> Principais peças disponíveis:
> - boletim inicial. 
> - depoimentos. 
> - cronologia da noite. 
> - registros do Vértice.

*Pistas:*

- Cópias autenticadas: Cartório, ramal 204

#### Testemunhas arquivadas, processo Elisa Duarte

*`doc-elisa-testemunhas`* · Vara Criminal, volume II (resumo) · Proc. 2020

> Ouvidos na fase policial: três amigos da vítima, dois funcionários da Boate Vértice e o DJ de cabine, Nicolas Prado Reis (“Nico”).

> Nicolas Prado Reis, registro sumário: esteve na cabine durante a noite. Confirma ter visto o casal no salão.

> Endereço e contato constantes no volume são da época e estão desatualizados.

#### Cronologia da noite, cópia autenticada (fls. 41)

*`doc-elisa-cronologia`* · Cartório da vara · Proc. 2020

> Elisa Duarte estava no Vértice na Noite X. Amigos confirmam presença no salão até a madrugada.

> Discussão atribuída ao casal próxima ao bar: entre 00h30 e 01h (duas testemunhas). André não foi colocado, nos autos, como tendo permanecido no interior da casa após o intervalo da discussão.

> Amiga da vítima recorda que Elisa adiou a saída para ouvir “Avicii. Levels”. O set log da casa situa a transição/encerramento desse trecho aproximadamente às 01:16 (relógio do Vértice). A polícia usou esse marco como horário aproximado de saída de Elisa.

> Sandra Almeida relata ter visto, aproximadamente nesse intervalo, uma mulher de jaqueta clara e bolsa sendo seguida por um homem que ela acreditou reconhecer como André Silva. Posteriormente, ao retornar da busca por ajuda, vê apenas uma silhueta masculina deixando a região escura próxima ao guardrail, sem identificação facial.

#### Consulta cadastral. Nicolas Prado Reis

*`doc-nico-cadastro`* · Sistema de consulta policial

> Nome: Nicolas Prado Reis (“Nico”). Idade: 31 anos. Sem antecedentes.

> Vínculo profissional atual: casa noturna Titã Club, técnico de som e DJ residente.

> Cruzamento com o arquivo do Vértice (escala antiga): mesma pessoa, mesmo nome profissional.

*Pistas:*

- Telefone de contato: 21 9xxxx-0731

#### Ficha. Samuel Teixeira

*`doc-samuel-ficha`* · Sistema de consulta policial

> Nome: Samuel Teixeira. Idade: 30 anos. Registro único: detenção por resistência (ocorrência do terminal Maralto).

> Situação: liberado. sem condenação. Sem outros antecedentes.

> Endereço atualizado na última renovação de documentos.

*Pistas:*

- Endereço residencial: Rua das Acácias, 118, ap. 21

#### Registro de visitas. André Silva

*`doc-andre-visitas`* · Unidade prisional, setor de visitas

> Visitantes cadastrados: advogado. Mariana Silva (irmã). Sem registro de visita de Mariana por vários anos.

> Última movimentação: Mariana Silva solicitou reativação do cadastro de visitante nas últimas semanas.

> Agendamento de visitas de autoridades: setor de visitas da unidade, por telefone.

*Pistas:*

- Setor de visitas. Unidade prisional: 21 3xxx-9100 (telefone fixo da delegacia)

#### Registro de ligações autorizadas. André Silva

*`doc-andre-ligacoes`* · Unidade prisional, central de ligações

> Ligações autorizadas a André Silva (últimas semanas): sempre entre 14h e 17h, em dias úteis, para dois números cadastrados (advogado e familiar).

> Nenhuma ligação em horário noturno. Uso de aparelho celular na unidade: sem ocorrências no período.

#### Log de interações, número sem nome (aparelho de Mariana)

*`doc-numero-sem-nome`* · Extração do aparelho de Mariana

> Número sem nome na agenda. Interações registradas nos últimos dois meses: 9 mensagens de voz e 4 chamadas.

> Faixas de horário das interações: madrugada (entre 00h30 e 03h) e fim de noite (após 22h).

#### Reportagem, “Porto em conflito” (arquivo de imprensa)

*`doc-maralto-clipping`* · Rádio Costeira FM, arquivo digital · Reprodução

> Moradores e manifestantes se reúnem diante do canteiro do terminal. a empresa nega irregularidades. Reportagem: Lívia Serrano.

> Segundo a reportagem, a mobilização reuniu famílias, estudantes e grupos organizados. houve confronto com a polícia ao fim da tarde.

> Rodapé do arquivo: “Redação. Rádio Costeira FM. Atendimento ao ouvinte e à imprensa.” Frame anexo: figura mascarada recorrente nas imagens da cobertura.

*Pistas:*

- Redação. Rádio Costeira FM: 21 3xxx-4410

#### Cadastro. Jana Ribeiro

*`doc-jana-cadastro`* · Sistema de consulta policial

> Nome: Jana Ribeiro. Sem antecedentes relevantes no cadastro atual.

> Endereço residencial atualizado na última renovação de documentos.

*Pistas:*

- Endereço residencial: Rua do Sol, 47

#### Depoimento arquivado. Jana Ribeiro

*`doc-elisa-jana`* · Vara Criminal, volume II (resumo) · Proc. 2020

> Jana Ribeiro, amiga da vítima Elisa Duarte. Presente no Vértice na noite dos fatos. Ouvida na fase policial.

> Relatou discussão entre Elisa e André no salão. Confirmou ter visto Elisa sair. Sem menção detalhada a vestimentas no resumo arquivado.

> Cadastro atualizado na última renovação de documentos: endereço residencial válido.

*Pistas:*

- Endereço residencial: Rua do Sol, 47

#### Depoimento arquivado. Geraldo Mota (resumo)

*`doc-elisa-geraldo-depoimento`* · Vara Criminal, volume II · Proc. 2020

> Geraldo Mota, barman do Vértice na noite dos fatos. Ouvido sobre o estado de Elisa Duarte e o ambiente do salão.

> Declaração resumida: serviu “quase nada” de álcool a Elisa. descreveu discussão com André e a saída dela. Sem menção a menoridade.

> Peça marcada para reexame. Cadastro atualizado disponível em consulta nominal.

#### Ficha. Geraldo Mota

*`doc-geraldo-ficha`* · Sistema de consulta policial

> Nome: Geraldo Mota. À época: barman no Vértice. Sem condenação criminal.

> Endereço residencial atualizado na última renovação de documentos.

*Pistas:*

- Endereço residencial: Travessa das Palmeiras, 9

#### Depoimento. Sandra Almeida (região da queda)

*`doc-sandra-depoimento`* · Vara Criminal, volume III · Proc. 2020

> Primeiro avistamento: Sandra viu uma mulher de jaqueta clara carregando bolsa, seguida por um homem. Observou o homem com atenção suficiente e, depois, acreditou reconhecê-lo como André Silva. Não conhecia a mulher o bastante para identificá-la.

> Preocupada, saiu para procurar um telefone. Não possuía relógio utilizável. O horário aproximado do primeiro evento foi reconstruído depois a partir do registro da ligação (~01:27), do percurso e da duração relatada, ordem de cerca de onze minutos entre o avistamento e o pedido de ajuda.

> Segundo avistamento: ao retornar, viu uma figura masculina saindo da área escura próxima ao guardrail. Não viu o rosto nem as roupas com clareza suficiente para identificação individual. Nunca afirmou tecnicamente ter reconhecido André nesse segundo momento. a investigação original assumiu que era o mesmo homem.

> Depoimento repetido no inquérito, na instrução e no júri. Sem retratação nos autos.

#### Henrique Valença, vínculo empresarial

*`doc-henrique-empresa`* · Sistema policial / juntas

> Henrique Valença: vínculo profissional com antiga empresa de tecnologia (registro encerrado / reestruturado).

> Sem condenação listada. Histórico de demissão/afastamento após período de conflito interno.

#### Anexo de ticket, hv_session_capture.pcap

*`doc-henrique-pcap-note`* · Backup setorial, ticket de segurança H. Valença

> Arquivo preservado junto ao ticket de sessões não reconhecidas. Captura curta de tráfego da estação no período da investigação interna.

> Conteúdo: pacotes RTP (voz). Dois identificadores SSRC recorrentes. sequence numbers e timestamps exigem inspeção na bancada. Análise corporativa original: inconclusiva.

#### Contato profissional. Cecília Prado

*`doc-cecilia-contato`* · Lista de colegas / depoentes

> Cecília Prado: colega na época do incidente. Endereço residencial atualizado disponível.

> Indicada como quem melhor descreveu a deterioração comportamental de Henrique sem endossar as alegações técnicas.

*Pistas:*

- Endereço: Alameda Nova, 88, ap. 14

---

*Fim do master. Regenerar: `npm run dump:story-master`.*
