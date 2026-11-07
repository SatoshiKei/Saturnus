# Walkthrough — Saturnus (Blocos 1 a 9)

Referência **técnica curta** (flags, ordem de sistemas, puzzles).  
Para a **especificação completa** (interfaces, componentes, arquitetura + walkthrough robusto), use **[SATURNUS_SPEC_WALKTHROUGH.md](SATURNUS_SPEC_WALKTHROUGH.md)**.  
Para leitura normal, use **[WALKTHROUGH_GUIA.md](WALKTHROUGH_GUIA.md)** ou **[WALKTHROUGH.txt](WALKTHROUGH.txt)**.

Guia simplificado para zerar a investigação do início ao fim (`saturnus_complete`).  
Detalhes por bloco: `docs/story/BLOCK_0X_*.md` e `docs/gameplay/INVESTIGATION_FLOW.md`.

---

## Antes de começar

- **Onde você joga:** mesa do delegado (cena 16:9). Cada objeto abre **uma** ferramenta (celular da Mariana ≠ celular do Augusto ≠ telefone fixo).
- **Pendências:** bloco de notas de Augusto (`CaseNotepad`) — espelha tarefas abertas; use como bússola.
- **Caderno:** evidências, pessoas, hipóteses, contradições (muitas entram **sozinhas** quando duas provas coexistem).
- **Descobertas:** avisos de contato, local, áudio, contradição etc. Feche cartões de evidência para não bloquear cliques.
- **Save:** menu → Continuar / Novo jogo (`localStorage`, chave `saturnus-investigation-v1`).
- **Regra de ouro:** documentos dão **telefone, endereço ou ramal** — você liga, consulta de novo ou abre o **mapa** e viaja. Não espere botão “entrevistar” no terminal.

| Objeto na mesa | Ferramenta |
|----------------|------------|
| Pasta | BO e documentos físicos |
| Bancada de áudio | Análises e puzzles de som |
| Celular Mariana | Aparelho apreendido |
| Celular Augusto | WhatsApp / agenda profissional |
| Telefone fixo | Ramais institucionais |
| Monitor | Sistema de consulta |
| Mapa | Viagens (só locais já conhecidos) |
| Caderno | Registro do caso |

---

## Bloco 1 — O desaparecimento

**Termina com:** `block01_complete` (Rafael no WhatsApp do Augusto).

1. **Pasta do caso** → abrir o BO inicial → **Registrar ocorrência** no trecho final (`b5`).
2. **Bancada** → selecionar ligação de emergência → **Análise provisória**.
3. **Celular Mariana** → WhatsApp → abrir **Júlia** (só entrar na conversa).
4. **Mesmo celular** → WhatsApp → **Rafael** → **Reproduzir áudio**.
5. Quando as duas evidências de memória existirem, aparece **CONTRADIÇÃO REGISTRADA** (lapsos seletivos) e o **hospital** entra no mapa.
6. **Mapa** → **Hospital Municipal** → visitar → esgotar os **5 assuntos**:
   - Última vez que viram Mariana  
   - Comportamento recente  
   - Falhas de memória  
   - Pasta guardada por Júlia  
   - Conversar com Camila a sós  
7. Encerrar a visita → Bloco 1 completo. **Celular Augusto** passa a ter contato **Rafael** (conversa ainda vazia).

---

## Bloco 2 — Duas trilhas (Vértice × Paula/Lucas/Elisa)

**Termina com:** `block02_complete` e pendência **Localizar Nico**.

As trilhas **A** e **B** podem ser feitas em ordem livre, mas a **convergência** exige **as duas** terminadas.

### Trilha A — Rafael e o Vértice

1. **Celular Augusto** → WhatsApp → **Rafael** → reproduzir o **áudio encaminhado**.
2. **Bancada** → áudio encaminhado → **Análise provisória** → desbloqueia **Vértice** no mapa.
3. **Mapa** → **Vértice** → visitar → falar com **Iara, Sandro, Caio**, perguntar a Sandro sobre o interesse de Mariana, **Consultar arquivos antigos** (identifica **Nico**).

### Trilha B — Paula, Lucas e Elisa

1. **Celular Mariana** → **Notas** → abrir nota **Quarta** (libera contato **Paula** no Augusto).
2. **Celular Augusto** → WhatsApp → **Paula** (conversa **começa vazia**) → usar **Mensagem** e completar **9 trocas** até aparecer **Moreira** / linha sobre “coisa antiga da família”.
3. **Monitor** → Consultas → buscar **`Lucas`** → abrir cadastro → anotar endereço → **mapa** → **Universidade** → entrevista → esgotar **todos** os assuntos.
4. **Monitor** → buscar **`Elisa Duarte`** → abrir **Resumo do processo** e **Testemunhas** (dois documentos).

### Convergência (fim do Bloco 2)

Quando você tiver **Nico identificado no Vértice**, evidência da **Paula/Lucas**, **resumo Elisa** e **Nico testemunha Elisa**, o motor registra convergência, nova evidência sobre Mariana reconstruindo o caso Elisa, hipótese de investigação própria **confirmada**, e a pendência **Localizar Nico**.

---

## Bloco 3 — Noites fora de ordem

**Termina com:** `block03_complete` → pendência **Descobrir quem era Morsa**.

1. **Monitor** → buscar nome completo de **Nico** (cadastro) → abrir documento → **ligar** pelo celular Augusto → **Titã** no mapa.
2. **Mapa** → **Titã** → entrevista Nico → esgotar assuntos (Elisa, Noite X, Mariana, gravações).
3. **Bancada** → duas gravações da Noite X → **Janus** (análise provisória / sincronizar).
4. **Celular Mariana** → app **Arquivos** → ouvir **`REC_1102.m4a`** (só após reanálise liberada).
5. **Monitor** → pesquisar **Maralto** → documentos públicos / reportagem.
6. **Monitor** → (opcional) cruzar **Maralto + Elisa** se quiser o vínculo “sem ligação” explícito.
7. **Lívia:** a partir da reportagem (Redação Rádio Costeira) → **ligar** → **Rádio** no mapa → entrevista → arquivo bruto na bancada.
8. **Bancada** → transmissão de Lívia → **Saturnalia** (reconstrução provisória) → **Morsa** (apelido) + pista **Samuel** → fim do bloco.

**Extra útil:** após Janus, **Cartório (204)** no fixo pode entregar cronologia Elisa; **ler** em Processos/Autos registra contradição **relógio do Vértice × cronologia oficial** (não encerra o bloco sozinha).

---

## Bloco 4 — Memórias emprestadas

**Termina com:** `block04_complete` → pendência **Voltar a falar com Nico**.

### Samuel (protestos)

1. **Monitor** → **Maralto** / **protesto** → ocorrência + relação de detidos.
2. **Monitor** → **Samuel** → ficha com **endereço** → **mapa** → casa → entrevista completa.

### André (prisão)

1. **Monitor** → **André** → registro de **visitas** (telefone do presídio) → **ligar** → **Presídio** no mapa → visita → assuntos completos.

### Cronologia, ligação muda e diário

1. **Monitor** → **André** de novo → **ligações autorizadas**; buscar **`desconhecido`** ou **`sem nome`** → log do número sem nome → **contradição automática** de horários.
2. **Telefone fixo** toca → **atender** (silêncio + um áudio) → reflexão → **6 áudios** na bancada.
3. **Bancada** → **Hexágono:** encadear metadados **A→D→B→F→C→E→A** (arquivo mais antigo primeiro) → frase **NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE** → PIN **`481526`** (só depois do ciclo).
4. **Fixo** → **Perícia (212)** → aguardar laudo → módulo **Perícia** no monitor → acesso forense → **PIN `481526`** → **diário** (não está no celular).
5. Ler entradas do diário → localizar gravação do desconhecido → **analisar** na bancada → **Bloco 4 completo**.

---

## Bloco 5 — O percurso deixado

**Termina com:** `block05_complete` → **Reexaminar Elisa do zero (Geraldo)**.

1. **Mapa** → **Titã** de novo → segunda conversa com **Nico** (jaqueta / Jana).
2. **Monitor** → **Jana** (depoimento nos autos) → endereço → **mapa** → entrevista.
3. **Monitor** → peças **Elisa** (argumento, álibi, testemunha da queda) → revisão dos autos → reflexão **André**.
4. Aba **Caso** no monitor (ações aparecem conforme avança):
   - Reavaliar linha **Maralto / protestos** → reflexão Maralto  
   - Organizar **cronologia dos contatos** de Mariana  
   - **Comparar** cronologia com arquivos do celular → reflexão coincidência  
   - **Reabrir** chamada de emergência / entrada / apreensão → reflexão **percurso deliberado**  
5. Após a última reflexão → Bloco 5 completo.

---

## Bloco 6 — A pessoa errada

**Termina com:** `block06_complete` → pressionar **Miro** de novo.

1. **Monitor** → **Geraldo** (depoimento + ficha + comanda Vértice) → **mapa** → entrevista → reflexão.
2. **Mapa** → **Jana** (2ª visita, após reflexão de Geraldo) → medo de gente do **Válter**.
3. **Monitor** → **Válter** / **Miro** → ocorrências, associados, **interceptação de rádio**.
4. **Bancada** → interceptações → **Luas Pastoras** (placeholder) → token **G17N** → **Galpão 17** no mapa.
5. **Mapa** → operação → **Miro** detido → entrevista → reflexão → Bloco 6 completo.

---

## Bloco 7 — O homem que não era Ricardo

**Termina com:** `block07_complete` → identificar **Morsa** + comparar **Henrique × Mariana**.

1. **Mapa** → **Detenção Miro** → **2ª pressão** (região da queda / bolsa de Jana).
2. **Monitor** → **Sandra** → depoimento + ficha → **mapa** → entrevista → reflexão (lookalike).
3. **Caso (monitor):** reavaliar **duração de Morsa** nos protestos.
4. **Caso:** organizar **início dos lapsos de memória** → checagem **Júlia/Camila** (botão no Caso).
5. **Bancada** → áudio anônimo hospitalar → **Enceladus** (placeholder).
6. **Monitor / fixo Hospital** → **Ricardo** → cruzamento → identidade falsa **Henrique Valença**.
7. **Monitor** → **Henrique** → empresa, incidente, **Cecília** → **mapa** → casa da Cecília → entrevista.
8. **Caso:** localizar dump digital de Henrique → **Bancada** → **Cassini-Huygens** (placeholder) → Bloco 7 completo.

---

## Bloco 8 — A noite sem assassinato

**Termina com:** `block08_complete` → **Como Mariana descobriu tudo?**

1. **Bancada** → fontes dos protestos → **Ordem dos Anéis** (placeholder) → timeline → **Morsa = André**.
2. **Mapa** → **Presídio** → confrontar **André** (admite Morsa / álibi).
3. **Mapa** → **Miro** (3ª vez) com álibi de André → queda por acidente, não empurrão.
4. **Caso (monitor):** reanálise pericial do **guardrail**.
5. Cadeia **guardrail → câmera → Mauro → oficina → Bia → Rui** (consultas **`guardrail`**, **`Mauro`**, **`Bia`**, **`Rui`** conforme documentos forem abrindo).
6. **Bancada** → logs de rádio/CAD → **Rotação de Saturno** (placeholder) → indicativo **VTR-14** → consulta **escala** → reflexão sobre **Augusto na cadeia** → Bloco 8 completo.

---

## Bloco 9 — MEMÓRIA (final)

**Termina com:** overlay **MEMÓRIA** + `saturnus_complete`.

Ordem lógica (várias ações ficam na aba **Caso** do monitor):

1. **Caso** → cruzar sistema de **Henrique** com registros de **Mariana** → **O Omitido** nomeado.
2. **Caso** → revisitar **diário** à luz do Omitido → mapear **assistência técnica** no plano do desaparecimento.
3. **Monitor** → consulta **Roberto** / **Siqueira** → denúncia anônima → Augusto **colocado** no caso.
4. **Celular Augusto** → WhatsApp → mensagens em nome de **Mariana** (ondas 1 → 2 → 3 após eventos).
5. **Caso** → conferir mensagens que **sabem demais** → montar **trilha física** → **mapa** → local final → confirmação da **morte** → reflexão.
6. Ler mensagem **pós-morte** → **Caso** → outros desaparecimentos → anomalias envolvendo **Augusto**.
7. **Bancada** → gravação “recente” de Mariana → **Puzzle MEMÓRIA** (12) → palavra revelada.
8. Fechar overlay **MEMÓRIA** → **reflexão final** temática → **fim do Saturnus**.

---

## Puzzles de áudio (resumo)

| Bloco | Nome | Onde | Observação |
|-------|------|------|------------|
| 1 | Emergência | Bancada | Análise provisória |
| 2 | Encaminhamento Rafael | Bancada | Libera Vértice |
| 3 | Janus | Bancada | Duas gravações Nico |
| 3 | Saturnalia | Bancada | Arquivo de Lívia |
| 4 | Hexágono | Bancada | PIN diário **`481526`** |
| 6 | Luas Pastoras | Bancada | Leva ao Galpão 17 |
| 7 | Enceladus | Bancada | Rajadas × equipamento hospital |
| 7 | Cassini-Huygens | Bancada | Duas sessões RTP |
| 8 | Ordem dos Anéis | Bancada | Morsa = André |
| 8 | Rotação de Saturno | Bancada | Indicativo VTR-14 |
| 9 | MEMÓRIA | Bancada | Palavra final do jogo |

Implementações atuais usam painéis **provisórios** (“análise provisória”) onde o roteiro prevê DSP completo.

---

## Ramais úteis (telefone fixo)

| Ramal | Uso típico |
|-------|------------|
| 204 | Cartório — cronologia processo Elisa |
| 212 | Perícia — laudo do aparelho / diário oculto |

Outros ramais (Plantão, Arquivo, Hospital, Central) aparecem conforme documentos e fase do caso.

---

## Atalhos de teste (DEV)

Painel **DEV** na mesa → checkpoints `dev-b01-*` … `dev-b09-*` (ver `block0XDevCheckpoints.ts`).  
Servem para pular trechos durante desenvolvimento; **não** substituem este walkthrough na primeira jogada.

---

## Referências

- Fluxo diegético e ferramentas: [`docs/gameplay/INVESTIGATION_FLOW.md`](gameplay/INVESTIGATION_FLOW.md)  
- Sistemas da mesa: [`docs/GAMEPLAY_SYSTEMS.md`](GAMEPLAY_SYSTEMS.md)  
- Por bloco narrativo: [`docs/story/`](story/)  
- Testes e2e (ordem canônica por bloco): [`tests/e2e/block01.spec.ts`](../tests/e2e/block01.spec.ts) … `block09`
