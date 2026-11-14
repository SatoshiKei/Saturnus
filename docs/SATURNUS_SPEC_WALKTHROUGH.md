# SATURNUS — Especificação técnica + Walkthrough completo

Documento **canônico de referência** para quem precisa entender o jogo de ponta a ponta: o que existe na interface, como os sistemas se conectam, e o caminho completo até `saturnus_complete`.

| | |
|---|---|
| **Tipo** | Spec técnica + walkthrough operacional |
| **Escopo** | Blocos 1–9 (implementação atual) |
| **Fonte de verdade do runtime** | Código em `src/` (se houver divergência, o código vence) |
| **Documentos satélites** | Ver §18 |

Não é um GDD de pitch. Não é só dica de “o que clicar depois”. É o mapa de **como o jogo funciona** e **como se zera**.

---

## 1. Visão do produto

**Saturnus** é um jogo narrativo de investigação policial (point-and-click + visual novel) ambientado na mesa do delegado **Augusto Nogueira**. O jogador não recebe botões do tipo “Entrevistar X disponível”. Ele encontra **telefone, endereço, ramal ou documento** e opera as ferramentas da sala como se estivesse no escritório.

### Premissa diegética (curta)

Mariana Silva desaparece. Augusto herda o caso. O aparelho dela, a ligação de emergência das 08:03, o hospital, o bar Vértice, o caso antigo de Elisa Duarte e uma infraestrutura tecnológica (“O Omitido”) convergem até a palavra final **MEMÓRIA**.

### Princípios de design (obrigatórios)

1. **Ferramenta certa, interface certa** — celular Mariana ≠ celular Augusto ≠ telefone fixo. Nunca reutilizar um painel pelo outro.
2. **Descoberta operacional** — documentos entregam pistas (número, endereço, ramal), não interpretações.
3. **Conclusões no Modo Reflexão** — sentimento e síntese de Augusto ficam em NVL (`reflections.ts`), não na boca da testemunha.
4. **Progresso por estado** — flags, evidências, status de pessoas/locais e triggers (`seedStory.ts`). Evitar `storyStep` em componentes.
5. **UI diegética** — painéis que parecem objetos (papel, terminal, bancada); sem modais brancos genéricos.

---

## 2. Stack e layout do repositório

| Camada | Tecnologia |
|---|---|
| App | Vite 8 + React 19 + TypeScript (ESM) |
| Testes | Vitest + Testing Library; Playwright (E2E) |
| Persistência | `localStorage` chave `saturnus-investigation-v1` (`STATE_VERSION` na store) |

```
src/
  app/                 App shell, GameHubContext, uiStore, PhoneSessionContext
  scene/               Scene.tsx — quadro 1920×1080 + objetos
  phone/               PhoneShell, home, router de apps
  apps/                whatsapp, notes, calendar, device (Files, Photos, WaveLab, …)
  components/
    investigation/     Hub overlays, DiscoveryHost, painéis, puzzles, menu
    story/             Cenas VN (entrevistas, ADV/NVL)
    ui/                GamePanel e primitives
  data/
    game/              seed* (evidence, documents, people, locations, story, apps…)
    block01…block09/   roteiros de entrevista e puzzles por bloco
    calls.ts           scripts de ligação
  game/
    state/             investigationStore
    story/             engine, actions, handlers, dev checkpoints
    types/             InvestigationState, HubPanel, StoryActionRef…
  styles/              tokens, scene, game-ui, phone, investigation, visual-novel
public/assets/         cena hub, áudio, backgrounds processados
docs/                  este arquivo e satélites
tests/                 unit + e2e
```

Comandos úteis: `npm run dev` · `npm run build` · `npm test` · `npm run test:e2e`.

---

## 3. Loop de jogo (macro)

```
Título (MainMenuOverlay)
  → Novo / Continuar
  → Mesa do delegado (Scene)
       ├─ clicar objeto → focusZoom → HubOverlay → painel (GamePanel)
       ├─ DiscoveryHost (cartões / toasts)
       ├─ CaseNotepad (pendências)
       └─ viagem / ligação / documento
            → SceneRunner (fade → intro → VN → reflexão opcional → mesa)
  → flags / evidências → runStoryEngine → novos leads
  → … até overlay MEMÓRIA + saturnus_complete
```

O hub nunca “teleporta” o jogador para uma entrevista. **Mapa → Ir até lá** ou **ligação que libera local** abre a cena.

---

## 4. Hub visual — sala 16:9

### 4.1 Quadro e câmera

- Arquivo: `src/scene/Scene.tsx`
- Resolução lógica: **1920×1080**, escalada com letterbox (`computeSceneScale`); variável CSS `--u`
- Composição: `src/data/sceneComposition.ts`
- Fundo: `public/assets/scene/hub-office-bg.jpg` (pipeline em `scripts/build-hub-bg.mjs`)
- Objetos PNG: `public/assets/scene/hub/` (`scripts/build-hub-objects.mjs`)
- Hover: brilho + sombra âmbar no objeto (sem retângulo de seleção); legendas de 1ª vez ~7 s (`uiStore`)
- Clique interativo: opcional `focusZoom` aproxima a câmera (~280 ms) antes de abrir o painel

### 4.2 Mapa objeto → sistema

| Objeto na cena | `hubTarget` / painel | Componente principal | Função |
|---|---|---|---|
| Celular Mariana | `mariana-phone` | `PhoneShell` (`phoneDevice: mariana`) | Aparelho apreendido |
| Celular Augusto | `augusto-phone` | `PhoneShell` (`phoneDevice: augusto`) | Agenda / WhatsApp profissional |
| Telefone fixo | `landline` | `PoliceLandlinePanel` | Ramais e ligações institucionais |
| Monitor | `computer` | `PoliceComputerPanel` | Consultas, autos, Perícia, Caso |
| Caderno | `casebook` | `CasebookPanel` | Pessoas, evidências, hipóteses… |
| Pasta | `case-files` | `CaseFilesPanel` | Documentos físicos do caso |
| Bancada de áudio | `audio-lab` | `AudioLabPanel` | Análises e puzzles de áudio |
| Mapa na parede | `map` | `LocationsPanel` | Locais conhecidos + viagem |

Tipo: `HubPanel` em `src/game/types/index.ts`. Orquestração: `HubOverlay.tsx` + `GameHubContext`.

### 4.3 HUD permanente na mesa

| Peça | Arquivo | Comportamento |
|---|---|---|
| **Pendências** | `CaseNotepad.tsx` | Aba no canto; folha lateral “CASO MARIANA SILVA”; espelha tarefas abertas |
| **Descobertas** | `DiscoveryHost.tsx` | Fila `state.discoveries`; cartões de evidência persistem até fechar |
| **Menu** | `MainMenuOverlay.tsx` | Continuar / Novo jogo |
| **DEV** | `DevStoryPanel.tsx` | Checkpoints `b01…b09` (só desenvolvimento) |

Tokens visuais: `src/styles/tokens.css` (carvão, papel, âmbar, azul-petróleo). Painéis: `GamePanel` com variantes `paper` | `terminal` | `workbench` | `console` | `map`. Fecham com ESC, véu ou botão.

---

## 5. Estado, save e story engine

### 5.1 Store

- **Global jogável:** `src/game/state/investigationStore.ts`
- **Só UI:** `src/app/uiStore.ts` (menu, dicas vistas, `fullscreenScene` — **fora do save**)
- Conteúdo típico do save: flags, `evidenceOwned`, people/contacts, locations, tasks, phones (apps/chats), hypotheses, contradictions, discoveries, callsDone, etc.

### 5.2 Story engine

```
seedStory.ts (StoryTrigger[])
  → condições (flag, evidenceOwned, personStatusAtLeast, …)
  → actions (StoryActionRef)
  → runStoryEngine após mutações relevantes (dispatchActions)
```

- Avaliação: `src/game/story/engine.ts`
- Ações: `src/game/story/actions.ts`
- Handlers por bloco: `src/game/story/block0XHandlers.ts`
- Checkpoints DEV: `src/game/story/block0XDevCheckpoints.ts`

### 5.3 Eventos de descoberta

| Tipo | Feedback ao jogador |
|---|---|
| `evidence` | Cartão “EVIDÊNCIA ADQUIRIDA” (persistente; “Ver no caderno”) |
| `contact` | “NOVO CONTATO”; vibração/selo no celular Augusto |
| `location` | “NOVO LOCAL” + atalho “Abrir o mapa” |
| `audio` | “NOVO ÁUDIO” (agrega se vários); selo na bancada |
| `contradiction` | “CONTRADIÇÃO REGISTRADA” + som + atalho caderno |
| `document` / `objective` / `hypothesis` / `message` | Aviso curto |

A fila **pausa** durante cenas VN e durante a cena das seis ligações (`fullscreenScene`).

### 5.4 Três modalidades de alcançar alguém

| Modalidade | Fluxo | Exemplo |
|---|---|---|
| **A — Telefone** | Documento → contato → ligação → (local) | Nico → Titã |
| **B — Endereço** | Ficha com endereço → local `visitAvailable` → mapa → Ir | Samuel, Sandra |
| **C — Institucional** | Ramal no fixo → “Algumas horas depois…” → documento | Cartório 204, Perícia 212 |

---

## 6. Interfaces — especificação por ferramenta

### 6.1 Pasta do caso (`CaseFilesPanel`)

- Visual: pasta manila + fichas + folha de leitura (`DocumentSheet`)
- Contém só documentos **já possuídos** (`documentsOwned` / unlock via ações)
- Bloco 1: abrir `doc-bo-inicial` e **Registrar ocorrência** no bloco final (`b5`) dispara `registerInitialPoliceReport`

### 6.2 Computador policial (`PoliceComputerPanel`)

Terminal institucional (variante `terminal`). Módulos típicos:

| Área | Uso |
|---|---|
| **Consultas / Busca** | Pessoas, empresas, veículos, endereços — regras em `seedSearchRules` |
| **Ocorrências / Processos / Autos** | Documentos do caso Elisa, Maralto, etc. |
| **Documentos** | Abertura dispara `onOpen` (discoverPerson, unlockLocation, addEvidence…) |
| **Perícia** | Laudo do aparelho; acesso forense ao diário (PIN) — **não** passa pelo launcher do celular |
| **Caso** | Ações narrativas por bloco (reavaliar Maralto, cronologias, Omitido, trilha física…) |

Regra de UX: abrir um documento **não** “entrevista” ninguém. Ele dá o lead; o jogador opera telefone/mapa.

### 6.3 Telefone fixo (`PoliceLandlinePanel`)

- Não é smartphone. Ramais: Gabinete 100, Plantão 201, **Cartório 204**, **Perícia 212**, Arquivo 220, Hospital, Central, etc.
- Agenda com números anotados (ex.: setor de visitas do presídio)
- Ligações **recebidas** (toque + selo) — ex.: cena das seis ligações no Bloco 4
- Scripts: `CallSession` em modo **não-compact** (painel institucional)

### 6.4 Mapa (`LocationsPanel`)

- Só locais com status conhecido (`unknown` não aparece)
- Card do local: descrição, pessoas relacionadas, **VISITAR** / Ir até lá
- Visita → `sceneId` → `Scene.tsx` escolhe a cena (`HospitalInterviewScene`, `SandraInterviewScene`, …)

### 6.5 Caderno (`CasebookPanel`)

Abas: Pessoas · Evidências · Locais · Timeline · Hipóteses · Contradições.  
Rótulos PT: `src/lib/labels.ts`.  
Contradições: motor registra sozinho quando o par de evidências de `contradictionDefs` está no inventário — **sem** formulário “confirmar”.

### 6.6 Bancada de áudio (`AudioLabPanel`)

- Lista de arquivos (mais novo primeiro), selos NOVO, filtros Todos / Novos / Em análise / Analisados
- Análise provisória onde o roteiro ainda não tem DSP completo
- Sessões de puzzle embutidas (quando desbloqueadas):

| Sessão | Arquivo | Puzzle |
|---|---|---|
| Hexágono | `HexagonSession.tsx` | Bloco 4 |
| Luas Pastoras | `ShepherdMoonsSession.tsx` | Bloco 6 |
| Enceladus | `EnceladusSession.tsx` | Bloco 7 |
| Cassini-Huygens | `CassiniSession.tsx` | Bloco 7 |
| Ordem dos Anéis | `RingsSession.tsx` | Bloco 8 |
| Rotação de Saturno | `RotationSession.tsx` | Bloco 8 |
| MEMÓRIA | `MemorySession.tsx` | Bloco 9 |

Dados dos puzzles: `src/data/block0X/*Puzzle.ts`.

### 6.7 Celulares (`PhoneShell`)

Dois aparelhos via `GameHubContext.phoneDevice`.

| | Mariana | Augusto |
|---|---|---|
| Função | Aparelho apreendido | Profissional |
| WhatsApp | Threads dela (`unlockedChatIds`) | Contatos/chats profissionais |
| Apps típicos | WhatsApp, Notas, Telefone, Arquivos, Fotos, Calendário, Ajustes, App Store, WaveLab (instalável) | WhatsApp, Telefone (Contatos/Recentes), etc. |
| Diário | App `hidden-diary` **nunca** no launcher; só via Perícia + PIN | — |

**Telefone (Augusto) — UI atual:**

- `PhoneCallsHome.tsx` + `phone.css`: lista estilo iOS (busca visual, abas Contatos/Recentes, avatares com iniciais)
- Ligação ativa: header some; `CallSession` `compact` + `cs--ios` em tela cheia (gradiente, timer, grade 3×2 decorativa, botão vermelho com ícone handset)
- Sem resposta: script sintético `noAnswer(name)`

Visibilidade de apps: `visibleAppsForDevice` (`phoneApps.ts` + `seedApps.ts`).

**WhatsApp:** `WhatsAppShell` → lista → `ChatView` / composer. Conversas de Augusto com testemunhas **começam vazias**; o jogador escreve (ex.: Paula, 9 trocas).

---

## 7. Sistema VN (cenas)

### 7.1 Pipeline de transição

`SceneTransitions` / `SceneRunner`:

1. Fade  
2. Cabeçalho digitado (data / hora / lugar) — pulável; respeita `prefers-reduced-motion`  
3. Ambiência + cena  
4. Reflexão opcional (NVL)  
5. Fade → mesa  

Cabeçalhos: `src/data/sceneIntros.ts`. Fundos: `sceneBackgrounds`.

### 7.2 Componentes de diálogo

| Modo | Uso | Notas |
|---|---|---|
| **ADV** | Fala com portrait | `VisualNovelDialog`, sprites via `characterSprites.ts` |
| **Choices / topics** | Assuntos da entrevista | Overlay central |
| **NVL** | Reflexão | Sem sprites; 2–5 blocos |
| **Backlog** | Tecla L | Histórico |

Entrevistas por tópicos compartilham `TopicInterviewScene.tsx`:

- Config: `portrait`, `beats`, flags por tópico, `finish()`
- Retrato: mostra para falas cujo `speaker` **não** é Augusto (não exige `portrait:` em cada beat)
- Sprites: cada PNG em `src/assets/sprites/` precisa de **import + chave** em `CHARACTER_SPRITE_URLS` (`characterSprites.ts`). Arquivo órfão na pasta **não** carrega.

### 7.3 Cenas nomeadas (amostra)

Hospital, Vértice (Iara/Sandro/Caio), Lucas, Nico (+ followup), Lívia, Samuel, André (+ followup), Jana (+ followup), Geraldo, Miro (+ followup + third), Sandra, Cecília, Bia, Rui, Mauro, Denis, etc. Roteamento em `src/scene/Scene.tsx`.

---

## 8. Modelo de evidências e documentos

### Evidências (`seedEvidence.ts`)

Posse: `evidenceOwned[]`. Campos relevantes: `sourceType` / `sourceId`, `originalOrDerived`, `exportable`, `deviceLocked`, `requiredAppId`, `puzzleMeta`.

### Documentos (`seedDocuments.ts`)

Blocos de texto; `onOpen` com ações; `leads` (telefone/endereço/instituição); às vezes `extractAction`.

### Pessoas / locais

- `seedPeople.ts`, `seedLocations.ts`
- Status de pessoa: identified → located → interviewed (etc.)
- Local: `unknown` → `visitAvailable` → `visited`
- Gates de registro: `personRegistryGates.ts` (ex.: Sandra só após flag de busca)

### Ligações (`data/calls.ts`)

`CallScript`: `available`, `lines` / `repeat` / `notYet`, `onComplete`, opcional `timeSkip` / `result`.

---

## 9. Catálogo de puzzles de áudio / forense

| # | Nome | Bloco | Onde | Solução / resultado (implementação atual) |
|---|---|---|---|---|
| 1 | Emergência 08:03 | 1 | Bancada | Análise provisória → evidência restaurada |
| 2 | Áudio Rafael | 2 | Bancada | Libera Vértice |
| 3 | Janus | 3 | Bancada | Sincroniza duas gravações Noite X |
| 4 | Saturnalia | 3 | Bancada | Transmissão Lívia → Morsa + Samuel |
| 5 | Hexágono | 4 | Bancada | Cadeia A→D→B→F→C→E→A → frase → PIN **`481526`** |
| 6 | Luas Pastoras | 6 | Bancada | Token **G17N** → Galpão 17 |
| 7 | Enceladus | 7 | Bancada | Áudio hospitalar × equipamento |
| 8 | Cassini-Huygens | 7 | Bancada | Separar SSRCs: **A1** = seq 100–103; **B7** = 200–202; ignorar dup |
| 9 | Ordem dos Anéis | 8 | Bancada | Sync → ordem **A → B → E → D → C → F** (não usar t bruto) |
| 10 | Rotação de Saturno | 8 | Bancada | Offsets: radio **0**, cad **−3**, dispatch **−2** → **VTR-14** |
| 11 | MEMÓRIA | 9 | Bancada | Trechos: A=apartment, B=emergency, C=enceladus, D=cassini → palavra **MEMÓRIA** |

Vários painéis ainda são **placeholders funcionais** (“análise provisória”) no lugar de DSP completo.

### Hexágono (detalhe)

| De → Para | Fragmento | Dígito |
|---|---|---|
| A → D | NO TELEFONE | 4 |
| D → B | HÁ | 8 |
| B → F | UM DIÁRIO | 1 |
| F → C | QUE | 5 |
| C → E | A TELA | 2 |
| E → A | OMITE | 6 |

Frase: **NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE**. PIN só após fechar o ciclo. Dados: `block04/hexagonPuzzle.ts`. Diário abre **no terminal (Perícia)**, não no launcher do celular.

---

## 10. Walkthrough completo (Blocos 1–9)

Convenção: **Termina com** = flag(s) de fechamento. Use o **CaseNotepad** como bússola de tarefas.

---

### Bloco 1 — O desaparecimento

**Termina com:** `block01_complete` (Rafael no WhatsApp do Augusto; chat ainda vazio).

| Passo | Ferramenta | Ação detalhada |
|---|---|---|
| 1 | Pasta | Abrir BO inicial → **Registrar ocorrência** (`b5`) |
| 2 | Bancada | Ligação de emergência → análise provisória |
| 3 | Celular Mariana | WhatsApp → abrir thread **Júlia** |
| 4 | Celular Mariana | WhatsApp → **Rafael** → reproduzir áudio |
| 5 | — | Com as duas evidências de memória → **CONTRADIÇÃO** (lapsos seletivos) → hospital no mapa |
| 6 | Mapa | Hospital Municipal → assuntos (última vez / comportamento / falhas / Camila a sós) |
| 7 | — | Fim da visita → bloco completo |

Triggers-chave: `block01_unlock_hospital`, `block01_end_block` (`docs/story/BLOCK_01_DISAPPEARANCE.md`).

---

### Bloco 2 — Duas trilhas (Vértice × Paula/Lucas/Elisa)

**Termina com:** `block02_complete` + pendência **Localizar Nico**.  
Trilhas A e B em ordem livre; convergência exige as duas.

#### Trilha A — Rafael / Vértice

1. Celular Augusto → WhatsApp Rafael → áudio encaminhado  
2. Bancada → análise → **Vértice** no mapa  
3. Mapa → Vértice → Iara, Sandro, Caio; perguntar a Sandro; **Consultar arquivos antigos** → identifica Nico  

#### Trilha B — Paula / Lucas / Elisa

1. Celular Mariana → Notas → **Quarta** → libera Paula no Augusto  
2. Celular Augusto → WhatsApp Paula (vazio) → **9 trocas** até Moreira / “coisa antiga da família”  
3. Monitor → `Lucas` → cadastro/endereço → mapa Universidade → esgotar assuntos  
4. Monitor → `Elisa Duarte` → Resumo do processo + Testemunhas  

#### Convergência

Nico identificado + evidências Paula/Lucas + resumo Elisa + Nico testemunha → investigação própria confirmada + tarefa Localizar Nico.

---

### Bloco 3 — Noites fora de ordem

**Termina com:** `block03_complete` → pendência **Descobrir quem era Morsa**.

1. Monitor → cadastro completo de Nico → ligar (Augusto) → Titã no mapa  
2. Titã → entrevista (Elisa, Noite X, Mariana, gravações)  
3. Bancada → Janus (duas gravações Noite X)  
4. Celular Mariana → Arquivos → `REC_1102.m4a` (após reanálise)  
5. Monitor → Maralto (docs / reportagem)  
6. Opcional: cruzar Maralto + Elisa  
7. Reportagem → ligar Lívia → Rádio → entrevista → arquivo bruto  
8. Bancada → Saturnalia → apelido **Morsa** + pista Samuel  

Extra: Cartório **204** (cronologia Elisa); ler autos pode registrar contradição relógio Vértice × cronologia oficial.

---

### Bloco 4 — Memórias emprestadas

**Termina com:** `block04_complete` → pendência **Voltar a falar com Nico**.

**Samuel:** Monitor Maralto/protesto → detidos → Samuel → endereço → mapa → entrevista.

**André:** Monitor André → visitas (telefone) → ligar → Presídio → visita completa.

**Cronologia / Hexágono / diário:**

1. Monitor → ligações autorizadas de André; buscar `desconhecido` / `sem nome` → contradição de horários  
2. Fixo toca → atender (silêncio + um áudio) → reflexão → 6 áudios na bancada  
3. Hexágono: metadados **A→D→B→F→C→E→A** → PIN **`481526`**  
4. Fixo → Perícia **212** → laudo → módulo Perícia → PIN → diário  
5. Ler diário → gravação do desconhecido → analisar na bancada → fim do bloco  

---

### Bloco 5 — O percurso deixado

**Termina com:** `block05_complete` → **Reexaminar Elisa do zero (Geraldo)**.

1. Titã → 2ª conversa Nico (jaqueta / Jana)  
2. Monitor → Jana → mapa → entrevista  
3. Monitor → peças Elisa → reflexão André  
4. Aba **Caso**: reavaliar Maralto → cronologia de contatos → comparar com celular → reabrir emergência/entrada/apreensão → reflexão **percurso deliberado**  
5. Última reflexão → fim do bloco  

---

### Bloco 6 — A pessoa errada

**Termina com:** `block06_complete` → pressionar Miro de novo.

1. Monitor Geraldo → mapa → entrevista → reflexão  
2. Jana 2ª visita (medo gente do Válter)  
3. Monitor Válter / Miro → ocorrências, associados, interceptação  
4. Bancada → Luas Pastoras → **G17N** → Galpão 17  
5. Operação → Miro detido → entrevista → reflexão → fim  

---

### Bloco 7 — O homem que não era Ricardo

**Termina com:** `block07_complete` → identificar Morsa + comparar Henrique × Mariana.

1. Miro 2ª pressão (queda / bolsa Jana)  
2. Monitor Sandra → mapa → entrevista → reflexão lookalike  
3. Caso: duração de Morsa nos protestos  
4. Caso: início dos lapsos → checagem Júlia/Camila  
5. Bancada → Enceladus (áudio hospitalar)  
6. Ricardo → identidade falsa **Henrique Valença**  
7. Henrique → Cecília → mapa → entrevista  
8. Caso: dump Henrique → Cassini-Huygens → fim  

**Cassini (lembrete):** A1 = p1,p3,p5,p7 · B7 = p2,p4,p8 · p6 dup ignorado.

---

### Bloco 8 — A noite sem assassinato

**Termina com:** `block08_complete` → **Como Mariana descobriu tudo?**

1. Bancada → Ordem dos Anéis → timeline → **Morsa = André** (ordem A B E D C F)  
2. Presídio → confrontar André  
3. Miro 3ª vez → queda acidente, não empurrão  
4. Caso: reanálise pericial do guardrail  
5. Cadeia guardrail → câmera → Mauro → oficina → Bia → Rui  
6. Bancada → Rotação de Saturno → **VTR-14** → escala → reflexão Augusto na cadeia → fim  

---

### Bloco 9 — MEMÓRIA (final)

**Termina com:** overlay **MEMÓRIA** + `saturnus_complete`.

1. Caso → cruzar Henrique × Mariana → **O Omitido** nomeado  
2. Caso → revisitar diário → assistência técnica no plano  
3. Monitor → Roberto / Siqueira → Augusto colocado no caso  
4. WhatsApp Augusto → mensagens “Mariana” (ondas 1→2→3)  
5. Caso → mensagens que sabem demais → trilha física → mapa → local final → morte → reflexão  
6. Mensagem pós-morte → outros desaparecimentos / anomalias Augusto  
7. Bancada → gravação “recente” → Puzzle MEMÓRIA (12)  
8. Fechar overlay → reflexão final → fim  

---

## 11. Ramais e atalhos operacionais

| Ramal | Uso |
|---|---|
| 204 | Cartório — cronologia processo Elisa |
| 212 | Perícia — laudo / acesso forense ao diário |

Outros ramais aparecem conforme documentos e fase.

**PIN do diário:** `481526` (somente após Hexágono completo).

---

## 12. Áudio e SFX

- Áudios diegéticos: `public/assets/audio/` (gerar com `npm run audio:generate` quando aplicável)
- SFX sintetizados: `src/lib/sfx.ts` (hooks `door`, `paper`, `pickup`, `evidence`, `contradiction`, `ring`, …). Troca por arquivo: preencher `SFX_FILES`.

---

## 13. Como adicionar conteúdo novo (checklist)

### Nova pessoa entrevistável

1. Entrada em `seedPeople.ts` (+ local em `seedLocations.ts` se visitável)  
2. Documento(s) com `onOpen` / leads em `seedDocuments.ts` + regra de busca  
3. Cena `*InterviewScene.tsx` + beats em `data/block0X/`  
4. Sprite PNG + registro em `characterSprites.ts`  
5. Handler / flags / tarefas / trigger em `seedStory`  
6. Roteamento em `Scene.tsx`  

### Novo documento pesquisável

1. `seedDocuments.ts`  
2. Regra em search seeds  
3. Nada de texto UI “pessoa disponível”  

### Novo puzzle na bancada

1. Dados `*Puzzle.ts`  
2. `*Session.tsx`  
3. Gate de UI em `AudioLabPanel` + flag `on*Solved` no handler  

---

## 14. Testes e DEV

| Comando | Cobertura |
|---|---|
| `npm test` | Story rules, store, engine (`tests/unit/`) |
| `npm run test:e2e` | `block01…09`, diary, ui, visual, VN screenshots |
| Painel DEV | Checkpoints `dev-b0X-*` — **não** substituem o walkthrough na 1ª jogada |

Capturas UI: `tests/e2e/visual.spec.ts`, `scripts/capture-ui.mjs`, artefatos em `artifacts/ui/` e `docs/assets/`.

---

## 15. Limitações conhecidas (honestidade técnica)

- Vários puzzles de áudio são **placeholders jogáveis**, não DSP real  
- Objetos da mesa: ilustrações com sombra assada (não fotogrametria)  
- README raiz ainda descreve bootstrap antigo em partes — este arquivo e `GAMEPLAY_SYSTEMS.md` estão mais atualizados  
- Personagens sem PNG em `sprites/` + mapa em `characterSprites.ts` ficam sem portrait  
- `UI_VISUAL_SYSTEM.md` pode mencionar limitações de visita já superadas; confiar no `Scene.tsx` atual  

---

## 16. Glossário rápido

| Termo | Significado |
|---|---|
| Hub | Mesa 16:9 com objetos clicáveis |
| Lead | Telefone / endereço / ramal obtido de documento |
| Discovery | Evento na fila de descobertas |
| Trigger | Regra em `seedStory` que dispara ações quando condições batem |
| ADV / NVL | Modos de diálogo VN |
| Análise provisória | Stub de puzzle de áudio que ainda avança a narrativa |
| O Omitido | Sistema/contexto nomeado no Bloco 9 |

---

## 17. Ordem canônica de verificação (QA)

1. Novo jogo → Bloco 1 sem DEV  
2. Convergência Bloco 2 (duas trilhas)  
3. Janus + Saturnalia  
4. Hexágono + PIN + diário só via Perícia  
5. Miro / Galpão / Sandra / Cassini  
6. Anéis + Rotação + VTR-14  
7. MEMÓRIA + `saturnus_complete`  
8. Save Continuar / Novo jogo limpa progresso  

Espelhar `tests/e2e/block0X.spec.ts` quando possível.

---

## 18. Documentos satélites

| Documento | Papel |
|---|---|
| `docs/WALKTHROUGH.md` | Walkthrough técnico curto (flags/passos) |
| `docs/WALKTHROUGH_GUIA.md` / `.txt` | Guia humano |
| `docs/GAMEPLAY_SYSTEMS.md` | Hub e store (resumo) |
| `docs/gameplay/INVESTIGATION_FLOW.md` | Princípios + Blocos 1–4 detalhados |
| `docs/story/BLOCK_0X_*.md` | Design narrativo por bloco |
| `docs/UI_VISUAL_SYSTEM.md` | Tokens e componentes visuais |
| `docs/PHONE_SYSTEM.md` | Dois aparelhos |
| `docs/EVIDENCE_MODEL.md` / `STORY_ENGINE.md` / `AUDIO_ANALYSIS.md` | Modelos pontuais |
| `docs/assets/screenplay/section *.md` | Roteiro literário |
| `docs/ASSETS.md` | Licenças / assets |

---

*Última consolidação: alinhada à implementação dos Blocos 1–9, UI de chamada iOS, registro de sprites e puzzles placeholder Cassini / Anéis / Rotação / MEMÓRIA.*
