# SATURNUS — Plano de revisão pós-playthrough (enriquecido)

> **Status:** **aprovado para execução** (decisões humanas registradas abaixo).  
> **Próximo prompt sugerido:** **A1** (Reflection + discoveries — sem assets de locais).  
> **Origem:** playthrough completo Blocos 1–9 + inspeção do código em `src/` (2026-11).  
> **Filosofia-alvo:** pista → jogador entende → ferramenta diegética → ação → nova informação.  
> **Fora de escopo agora:** redesign iPhone geral; reescrita total de diálogos; expansão cinematográfica da prisão de Miro; reescrita da conclusão final.

Documento derivado do brief do usuário, preenchido com nomes reais de arquivos, flags, componentes e riscos; decisões humanas incorporadas para não rediscutir em cada prompt.

---

## Decisões humanas aprovadas (não rediscutir)

Registradas após revisão do plano. Cada execução futura deve **obedecer** esta lista.

### Reflection / locais

- Reflexão **imediata** após entrevista (síntese da conversa) → **antes do fade**, ainda no local da cena (`SceneRunner`).
- Reflexão que depende de trabalho **depois** (computador / bancada / hub) → **delegacia**.
- Avaliar **caso a caso** (Miro, Sandra, André, etc.), não uma regra cega única.
- Exemplos fixos: `refl-b08-morsa` → **delegacia** (nasce do Rings na bancada); `refl-b08-andre` → **presídio** se for conclusão imediata da conversa com André.
- Residências: **3–4 variantes reutilizáveis** bastam (ex.: apto modesto, apto comum, casa residencial, interior antigo) — não uma casa por NPC.
- Absurdos a corrigir com prioridade: Galpão 17, oficina Dênis, local final Mariana (**sair de nightclub**); Miro → `police-02-interrogation-tone` (já existe).
- **Não** usar roads/port como stopgap do Galpão se continuar visualmente errado → marcar **NOVO ASSET NECESSÁRIO** e resolver em **A2**.

### Telefones / diário / Júlia

- **Lívia permanece no iPhone** (contato profissional individual ok).
- **Presídio, Hospital, Perícia, Cartório** → telefone **fixo** (filtrar `institution` no iPhone).
- **Júlia (onset B7)** → **ligação de voz** (não WhatsApp). Se houver material, ela encaminha depois → arquivo com provenance `received`.
- Diário: após Perícia, **ícone no launcher de Mariana**; PIN no telefone; reutilizar `HiddenDiaryApp` + `tryDiaryPin`.
- Laudo: dizer que o app foi **recuperado e tornado acessível no aparelho**; pode mencionar package fora do launcher; **não** instruir a continuar no módulo Perícia do PC.

### Computador / Caso

- Cronologia B5 → **Timeline do Caderno** + reflexão curta; **não** criar outro documento.
- Guardrail → pedido via **Perícia / telefone fixo**; resultado = **laudo real**.
- Bloco 9: **remoção agressiva** de documentos de raciocínio (releitura diário, assistência Omitido, mensagens, anomalias Augusto → Reflection). Manter docs só com **fonte externa real** (trilha física, outros desaparecimentos, relatório forense, etc.).

### Choices

- Estender `ScriptStep` com **`repliesByOption`** (`replies` como fallback).
- Primeira execução (**D**): **somente WhatsApp**. Ligações depois, se valer a pena.

### Ricardo → Henrique

- Híbrido **A+C**.
- Sequência: Enceladus → hospital → Ricardo Freitas → pesquisa sem identidade convincente → reflexão “nome morto” → material **já existente** de Mariana (pista parcial H.V. / username / e-mail / ID, **incompreensível até Ricardo existir**) → cruzamento → Henrique → reflexão → Cecília.
- `doc-mariana-ricardo-note` **não** pode mais entregar `ricardo_was_henrique_valenca` no mesmo `onOpen`.
- A pista parcial **já estava acessível antes do B7** (diário / arquivo / anotação); no B7 só ganha significado.

### Morsa → André

- Checks de continuidade (**mochila, rádio, sequência**) **obrigatórios**, mas **triviais** após a timeline.
- `masked-man` ok para **preparação** anterior; Puzzle 10 precisa de **2–3 frames** específicos (arte definitiva).
- A palavra **“André”** **não** aparece na UI do puzzle; continuidade visual → pausa → Reflection (“André.”) → **depois** evidência formal.

### Fatia de execução

Não executar “Etapa A/B/C” monolíticas. Usar a ordem **A1…F** da seção “Ordem de execução aprovada”.

### Testes

- Build **uma vez no final** da tarefa (não após cada micro-alteração); se falhar, corrigir e rodar de novo.
- Unitários existentes só se diretamente afetados e rápidos.
- **Não** criar testes automatizados novos, salvo função pura / regra de estado cuja validação manual seja impraticável.
- Sem E2E completo / visual / screenshots por padrão; 3–6 checks manuais + grep de IDs.

---

## Sumário executivo da inspeção

| Frente | Achado principal |
|---|---|
| Reflection backgrounds | **Não** há “último background” global. Cada `ReflectionDef` tem `background` **hardcoded**. Várias reflexões de hub apontam para fundo de entrevista (prisão, hospital, etc.). |
| Achievements / discoveries | Não há sistema separado de “achievements”; o feedback é `DiscoveryHost` + `state.discoveries`. Já pausa com `locationScene` **ou** `fullscreenScene`. Solo reflections **não** setam `fullscreenScene` → popups podem invadir. |
| Backgrounds de visita | `sceneBackgrounds` em `sceneIntros.ts`: muita reutilização (`apartment-01`, `nightclub-01` em galpão/oficina/trilha). |
| Contatos institucionais | `contact-presidio` tem `institution: true`, mas a agenda do iPhone **não filtra** por isso. Hospital/Cartório/Perícia já são sobretudo ramais do fixo. |
| Diário | PIN e leitura estão no **módulo Perícia do computador**. `visibleAppsForDevice` **sempre** esconde `hidden-diary`. App `HiddenDiaryApp` já existe. |
| Caso / AÇÃO | Dezenas de botões “Ação investigativa” em `PoliceComputerPanel` (B5–B9) que criam subdocumentos e flags. |
| Choices | Sistema cosmético: `chatScripts.ts` (`ScriptStep.options` → mesma `replies`). Ligações (`CallSession`) **não** têm choices. |
| Ricardo→Henrique | Hospital diegético ok; o salto está em `doc-mariana-ricardo-note`, que no `onOpen` já entrega **Henrique Valença**. |
| Morsa→André | `onRingsSolved()` adiciona `morsa_was_andre` imediatamente; UI do puzzle é texto; sem frames/imagens; reflexão `refl-b08-morsa` usa fundo de **prisão**. |

---

# ETAPA 1 — Contexto de cena, Reflection Mode, discoveries e backgrounds

## 1.1 Como o background de reflexão funciona hoje

### Modelo de dados

Arquivo: `src/data/reflections.ts`

```ts
interface ReflectionDef {
  id: string
  sceneId?: SceneId      // opcional: reflexão pós-entrevista via SceneRunner
  whenFlag?: string
  background: string     // path explícito — NÃO herda de “cena atual”
  blocks: string[]
}
```

Não existe `currentLocation` / `activeSceneBackground` na store de investigação.  
Localização de visita ativa: `GameHubContext.locationScene` (`LocationSceneId | null`).  
Fundos de visita: `sceneBackgrounds` em `src/data/sceneIntros.ts`.

### Dois pipelines

| Pipeline | Onde | Como escolhe background |
|---|---|---|
| **A — Pós-entrevista** | `SceneRunner` (`src/components/story/vn/SceneTransitions.tsx`) | `reflectionForScene(sceneId)` → `ReflectionDef.background` (em geral = `sceneBackgrounds[sceneId]`) |
| **B — Solo / hub** | `Scene.tsx` → `pendingSoloReflection(flags)` → `ReflectionView` | `reflectionById(id).background` (valores **fixados** no array `reflections`) |

`HexCallScene` (`src/components/investigation/HexCallScene.tsx`) usa `reflectionById('refl-hex-call')` com background **hospital** — embora a cena ocorra na **delegacia** (fixo tocando).

### Alternativa encontrada no código

Já existe campo explícito `background` por reflexão. **Não** é necessário inventar um sistema paralelo de “último fundo”.

**Solução mais simples recomendada:**

1. Estender `ReflectionDef` com algo como `context: 'interview' | 'hub' | 'narrative'` **ou** apenas corrigir paths:
   - hub → fundo da delegacia (ex.: `police-05-chief-office.jpg` / asset processado do hub);
2. Para pós-entrevista, manter `sceneBackgrounds[sceneId]`;
3. Opcional: helper `hubOfficeBackground` exportado de `sceneIntros.ts` para não espalhar strings.

Custo baixo; impacto narrativo alto; sem migração de save (só assets/paths em data).

---

## 1.2 Inventário: reflexões e backgrounds (incorretos vs ok)

### Tipo 1 — pós-entrevista (`sceneId` setado) — em geral OK

| ID | sceneId | Background atual | Adequado? |
|---|---|---|---|
| `refl-lucas` | lucas | universidade | Sim (Tipo 1) |
| `refl-livia` | livia | rádio | Sim |
| `refl-nico` | nico | nightclub (Titã) | Aceitável se Titã=boate |
| `refl-samuel` | samuel | apartment | Sim |
| `refl-andre` | andre | prison visit | Sim |
| `refl-nico2` | nico | nightclub | Sim |
| `refl-jana` / `refl-jana2` | jana | apartment | Sim (mesmo apto compartilhado) |

### Tipo 2/3 — solo no hub (`pendingSoloReflection`) — vários ERRADOS

| ID | Disparo (flag pending) | Background atual | Problema | Background desejado |
|---|---|---|---|---|
| `refl-hex-call` | HexCallScene (fixo) | **hospital** | Augusto na mesa | **delegacia** |
| `refl-b05-andre` | `block05_refl_andre_pending` | **prisão** | Hub / autos | **delegacia** |
| `refl-b05-maralto` | `block05_refl_maralto_pending` | **rádio/Lívia** | Hub | **delegacia** |
| `refl-b05-coincidence` | … | **hospital** | Hub | **delegacia** |
| `refl-b05-path` | … | **hospital** | Hub | **delegacia** |
| `refl-b06-geraldo` | … | **geraldo apt** | Pós-entrevista Geraldo? Na prática dispara via pending após finish — ver § dúvidas | Se hub: delegacia; se imediato pós-cena: manter Geraldo |
| `refl-b06-miro` | … | miro/prisão | Pode ser Tipo 1 se após Miro | Se hub: delegacia |
| `refl-b07-sandra` | … | sandra apt | Idem | Idem |
| `refl-b07-tech` | … | **cecilia** | Pensamento pós-sistema no hub | **delegacia** |
| `refl-b08-morsa` | após Rings | **andre/prisão** | Puzzle na bancada | **delegacia** |
| `refl-b08-andre` | após confrontar André | andre | Pode ser Tipo 1 se ainda no presídio via SceneRunner — hoje é **solo** | Preferir prisão só se ainda em visita; senão delegacia |
| `refl-b08-accident` | … | **rui** | Hub | **delegacia** |
| `refl-b08-final` | após escala VTR-14 | **andre/prisão** | “Descobri a viatura” na mesa | **delegacia** (caso citado no playthrough) |
| `refl-b09-death` | após trilha | trail/nightclub | Pode ser Tipo 4 no local final | Manter `trail` **se** reflexão ainda na cena; senão delegacia |
| `refl-b09-final` | pós-MEMÓRIA | **hospital** | Absurdo | **delegacia** ou fundo narrativo dedicado |

**Arquivos:** `src/data/reflections.ts`, `src/scene/Scene.tsx` (`pendingSoloReflection`), `src/components/story/vn/SceneTransitions.tsx`, handlers `block05…09Handlers.ts` que setam `*_refl_*_pending`.

### Lacuna de design — **RESOLVIDA**

Várias reflexões “pós-entrevista” dos blocos 6–8 **não** usam `SceneRunner` + `sceneId`; usam flag `*_refl_*_pending` e abrem **depois** do retorno à mesa (hub com fundo errado).

**Decisão:** caso a caso.

- Se a reflexão é **síntese imediata da conversa** → mover para **antes do fade** no local (`SceneRunner` / Tipo 1). Ex.: `refl-b08-andre` no **presídio** se for conclusão da visita.
- Se depende de trabalho **posterior** (bancada, Caso, hub) → solo no hub com background de **delegacia**. Ex.: `refl-b08-morsa` **obrigatoriamente** delegacia.

Em **A1**: corrigir backgrounds hub → delegacia e pausar discoveries; mover para SceneRunner só as reflexões claramente “imediatas” listadas na execução (sem assets de locais).

---

## 1.3 Discoveries / “achievements” durante cutscene

| Peça | Arquivo |
|---|---|
| UI | `src/components/investigation/DiscoveryHost.tsx` |
| Fila | `InvestigationState.discoveries` (`investigationStore`) |
| Pause | `paused = Boolean(locationScene) \|\| fullscreenScene` |
| `fullscreenScene` | `src/app/uiStore.ts` — setado hoje **só** em `HexCallScene` |

### Comportamento atual

- Durante `locationScene` (VN / entrevista): DiscoveryHost retorna `null` → fila silenciosa. **OK.**
- Durante HexCall: `setFullscreenScene(true)`. **OK.**
- Durante **solo reflection** e **MemoryWordOverlay**: **não** pausa → cartões podem aparecer por cima. **BUG.**
- Hub/painel aberto **não** pausa discoveries (só `locationScene` / fullscreen).

### Solução mais simples

Reutilizar a ideia existente:

1. Em `Scene.tsx`, ao montar solo reflection / MemoryWordOverlay: `setFullscreenScene(true)` e limpar no unmount; **ou**
2. Estender `DiscoveryHost`: `paused = locationScene || fullscreenScene || soloReflectionActive || memoryOverlay`.

Preferir (1) para um único mecanismo.

Após fim da cena: DiscoveryHost já reaparece quando `paused` fica false; opcional: delay curto (~400–800 ms) antes de mostrar o head da fila (hoje o `useEffect` de SFX dispara assim que `!paused`).

**Preservar:** empilhamento de notices, cartão de evidência persistente, merge de áudios.

---

## 1.4 Tabela de backgrounds por Scene ID

Fonte canônica: `sceneBackgrounds` em `src/data/sceneIntros.ts`.  
Assets processados extras em `assets/backgrounds/processed/` e `public/assets/backgrounds/processed/`.

| Scene ID | Cena narrativa | Background atual | Adequado? | Background futuro sugerido |
|---|---|---|---|---|
| *(hub)* | Delegacia / mesa | `hub-office-bg.jpg` (cena) | Sim | Manter; reutilizar path processado `police/police-05-chief-office.jpg` para reflexões hub |
| `hospital` | Hospital | `hospital-02-corridor-chairs.jpg` | Sim | Manter |
| `vertice` | Boate Vértice | `nightclub-01-lights-haze.jpg` | Sim | Manter (ou `nightclub-02`) |
| `lucas` | Universidade | `university-03-classroom-empty.jpg` | Sim | Manter |
| `livia` | Rádio Costeira | `radio-01-newsroom.jpg` | Sim | Manter |
| `nico` | Titã Club | `nightclub-01-lights-haze.jpg` | Fraco (igual Vértice) | Distinguir Titã: `nightclub-02` ou `bar-01` — **NOVO ASSET NECESSÁRIO** se quiser identidade forte |
| `samuel` | Casa Samuel | `apartment-01-living-room.jpg` | Ok como residência 1 | Manter como “apto A” |
| `andre` | Presídio visitas | `prison-01-visit-room.jpg` | Sim | Manter |
| `jana` | Casa Jana | **mesmo** `apartment-01` | Fraco | `apartment-01-living-modest` ou `apartment-04-hall` — asset já existe em raw/processed |
| `geraldo` | Casa Geraldo | **mesmo** `apartment-01` | Fraco | Variante apto B — **NOVO** ou `bar-01` se for comércio/casa |
| `operation` | Galpão 17 | **`nightclub-01`** | **NÃO** (balada≠galpão) | Industrial/galpão — **NOVO ASSET NECESSÁRIO** (A2; **não** usar roads/port) |
| `miro` | Detenção / entrevista | `prison-01-visit-room.jpg` | Fraco (sala de visitas ≠ interrogatório) | `police-02-interrogation-tone.jpg` (já existe em processed) |
| `sandra` | Casa Sandra | **mesmo** `apartment-01` | Fraco | Apto C distinto — **NOVO** ou hall |
| `cecilia` | Casa Cecília | **mesmo** `apartment-01` | Fraco | Apto D — **NOVO** |
| `mauro` | Casa Mauro | **mesmo** `apartment-01` | Fraco | Residência distinta — **NOVO** |
| `denis` | Oficina Dênis | **`nightclub-01`** | **NÃO** | Oficina/pátio — **NOVO ASSET NECESSÁRIO** |
| `bia` | Casa Bia | **mesmo** `apartment-01` | Fraco | Compartilhar com Rui se compatível; senão **NOVO** |
| `rui` | Casa Rui | **mesmo** `apartment-01` | Fraco | Idem |
| `trail` | Local final Mariana | **`nightclub-01`** | **NÃO** | Galpão desativado / estrada — `roads-01` ou **NOVO** |

**Prioridade mínima (absurdos):** `operation`, `denis`, `trail` (sair de nightclub).  
**Prioridade média:** `miro` → interrogation; diferenciar 2–3 apartamentos.

Arquivos: `src/data/sceneIntros.ts`; eventualmente CSS/`VNSceneShell` se path mudar.

---

### Arquivos prováveis (Etapa 1)

- `src/data/reflections.ts`
- `src/data/sceneIntros.ts`
- `src/scene/Scene.tsx`
- `src/app/uiStore.ts` (se estender pause)
- `src/components/investigation/DiscoveryHost.tsx`
- `src/components/investigation/HexCallScene.tsx`
- `src/components/investigation/MemoryWordOverlay.tsx`
- `src/components/story/vn/SceneTransitions.tsx` (só se converter pending → SceneRunner)

### Mudanças propostas

1. Corrigir `background` de todas as reflexões Tipo 2/3 para delegacia.  
2. Pausar discoveries durante solo reflection / MEMÓRIA overlay via `fullscreenScene`.  
3. Remapear backgrounds absurdos (`operation`, `denis`, `trail`, `miro`).  

### O que será preservado

- Textos das reflexões; flags `*_seen` / `*_pending`; fluxo SceneRunner Tipo 1; fila de discoveries.

### Dependências

- Assets novos para galpão/oficina (podem ser placeholders nomeados).  
- Decisão humana sobre pending vs SceneRunner.

### Riscos

1. Mudar momento da reflexão (hub→ainda na cena) quebra expectativa de e2e que espera overlay `block05-solo-reflection`.  
2. Pausar discoveries demais pode atrasar feedback se `fullscreenScene` vazar true.  
3. Trocar paths de background sem asset em `public/` → imagem quebrada.  
4. Saves antigos: sem impacto (só paths).  

### Validação mínima

1. Checkpoint pós-hospital → reflexão hub usa delegacia.  
2. Entrevista Nico → reflexão ainda no Titã (Tipo 1).  
3. Durante VN, nenhum `discovery-*` visível; após retorno, aparece.  
4. Solo reflection: nenhum popup até fechar.  
5. Abrir cena `operation`: fundo ≠ nightclub.  
6. `refl-b08-final`: fundo delegacia.  

### Dúvidas humanas — **RESOLVIDAS**

1. Miro/Sandra/André: **caso a caso** (imediata → local; posterior → delegacia). Ver “Decisões humanas aprovadas”.  
2. Residências: **3–4 variantes** reutilizáveis.  
3. Galpão: **não** roads/port; marcar **NOVO ASSET** e tratar em **A2**.

---

# ETAPA 2 — Telefones, arquivos e diário oculto

## 2.1 Estrutura atual

| Sistema | Arquivos | Notas |
|---|---|---|
| Contatos iPhone Augusto | `seedContacts.ts` → `state.contacts`; UI `PhoneCallsHome.tsx` | Lista `unlocked`; **não filtra** `institution` |
| Agenda fixo | `PoliceLandlinePanel.tsx` + `LANDLINE_EXT` / scripts em `calls.ts` | Ramais 204, 212, HOSP, etc. |
| Scripts de chamada | `src/data/calls.ts` + `CallSession.tsx` | `contactId` liga script ao iPhone; `ext` ao fixo |
| Apps Mariana | `seedApps.ts`, `phoneApps.ts` | `hidden-diary` forçado oculto no launcher |
| Diário UI | `HiddenDiaryApp.tsx` | Existe; quase inacessível pelo telefone |
| PIN | `tryDiaryPin` em `investigationStore.ts`; UI PIN em `PoliceComputerPanel` (Perícia) | Flag `block04_forensics_access` após laudo |
| Arquivos celular | `FilesApp.tsx` + `phoneMedia.ts` + extras por flags | Sem campo de proveniência |

## 2.2 Tabela de contatos / ferramentas

| Contato | Tipo | Ferramenta atual | Ferramenta correta |
|---|---|---|---|
| Hospital (recepção / arquivo plantão) | Institucional | Fixo ramal `HOSP` (`call-hospital`, `call-hospital-ricardo`) | **Manter fixo** |
| Perícia dispositivos | Institucional | Fixo `212` | **Manter fixo** |
| Cartório | Institucional | Fixo `204` | **Manter fixo** |
| Unidade prisional — visitas | Institucional | **iPhone** via `contact-presidio` + `call-presidio-visit` | **Mover para fixo** (ramal ou discagem na agenda do fixo); não salvar no iPhone |
| Rádio Costeira / Lívia | Híbrido (redação) | iPhone `contact-livia` | Aceitável iPhone **ou** fixo; label atual parece institucional — decidir |
| Nico, Paula, Rafael, Júlia, Camila, Mariana | Pessoais | iPhone | Manter iPhone |
| Central / Arquivo / Plantão (outros) | Institucional | Fixo (quando existirem) | Manter fixo |

**Bug concreto:** `PhoneCallsHome` mostra qualquer `c.unlocked`, incluindo `institution: true`. Campo já existe em `Contact` (`game/types`) mas é ignorado na UI.

**Mudança mínima:** filtrar `!c.institution` na lista do iPhone; adicionar entrada equivalente na agenda do `PoliceLandlinePanel` para presídio; apontar `call-presidio-visit` para discagem do fixo (remover ou não usar `contactId` no iPhone).

---

## 2.3 Diário oculto — fluxo atual vs desejado

### Atual

1. Hexágono → PIN conhecido (`HEX_PIN` / `481526`).  
2. Flag `block04_forensics_unlocked` → ligar Perícia 212.  
3. Laudo `doc-laudo-forense` → `block04_forensics_access`.  
4. Computador → módulo Perícia → form PIN (`tryDiaryPin`) → `diaryUnlocked` + evidência.  
5. Leitura via `HiddenDiaryApp` **embutida no painel do computador** (não no launcher).  
6. `visibleAppsForDevice` **sempre** retorna false para `hidden-diary`.

### Desejado (brief)

Hexágono → Perícia (fixo) → laudo diz que há package oculto → **ícone aparece no iPhone Mariana** → jogador abre → digita PIN → lê no telefone. Computador só mostra laudo.

### Reuso máximo

| Peça | Reutilizar? |
|---|---|
| `HiddenDiaryApp.tsx` | Sim — montar via `PhoneAppRouter` |
| `tryDiaryPin` | Sim — chamar do app no telefone |
| `HEX_PIN` / hexagon | Sim |
| Laudo `doc-laudo-forense` | Sim — mudar texto/onOpen: em vez de só `forensics_access` para PC, setar flag tipo `block04_diary_icon_revealed` |
| `phoneApps.ts` | Alterar: mostrar `hidden-diary` se flag revelada (e ainda pedir PIN se `!diaryUnlocked`) |
| UI PIN no PC | Remover ou deixar atalho legado desligado |

### Saves / checkpoints

- Flags: `block04_forensics_access`, `block04_forensics_done`, `passwordsDiscovered.diary`, `phones.mariana.diaryUnlocked`.  
- Checkpoints DEV e e2e `diary` assumem PIN no **computador** (`forensic-pin-*` testids).  
- **Risco de quebra:** testes e saves mid-bloco-4. Migrar: se `diaryUnlocked` já true, ok; se `forensics_access` sem unlock, revelar ícone.

**Menor alteração:**  
1) após laudo, `installApp`/`setFlag` revela ícone;  
2) PIN só no `HiddenDiaryApp`;  
3) PC mostra laudo + “app tornado acessível no aparelho” sem reader.

---

## 2.4 Arquivos do celular que aparecem depois do início

Auditoria **somente** itens dinâmicos / gated (não a biblioteca estática inicial).

| Arquivo | Quando aparece hoje | Origem atual | Problema | Origem diegética sugerida |
|---|---|---|---|---|
| `REC_1102.m4a` (`mf-rec-maralto`) | `block03_reanalysis_unlocked` | Flag pós-Janus; surge em Downloads | Sem “como chegou lá” | `existing_hidden` ou `forensic_restored` após reanálise; texto: “arquivo localizado após sincronização Janus” |
| `CHK_UNK.m4a` (`mf-chk-unk`) | `block04_unknown_recording_unlocked` (diário aponta) | Flag após ler diário | Melhor: diário aponta; ainda some do nada na pasta | `existing_hidden` — diário revela path; UI: “encontrado em Downloads” com nota |
| Escala outubro.pdf | Biblioteca inicial Mariana | Estático | Ok | `existing_locked` / já no aparelho |
| Fotos/WA estáticos | Início | `phoneMedia.ts` | Ok | `existing` |
| Áudio encaminhado Rafael | WhatsApp Augusto | Chat script | Ok | `received` |
| Áudio anônimo Enceladus | `finishJuliaCamilaOnsetCheck` cria evidência/bancada | **Botão Caso**, não mensagem | Falso “recebido” | Ver § Júlia — deve vir como `received` via WA/ligação |
| Diário | Forense PC | Ver acima | Errado | `forensic_restored` + ícone |

**Modelo leve sugerido:** campo opcional `provenance?: 'existing_locked' | 'existing_hidden' | 'received' | 'exported' | 'forensic_restored'` em `PhoneMediaItem` + label na UI de Arquivos. Sem nova store.

Arquivos: `src/data/block01/phoneMedia.ts`, `src/apps/device/FilesApp.tsx`, handlers B3/B4.

---

## 2.5 Júlia — “Conferir com Júlia/Camila”

| Item | Valor |
|---|---|
| UI | `PoliceComputerPanel` botão `b07-julia-camila-onset` |
| Handler | `finishJuliaCamilaOnsetCheck()` em `block07Handlers.ts` |
| Flags in | `block07_julia_camila_check_unlocked` (após `organizeMemoryOnset`) |
| Flags out | `block07_julia_camila_checked`, `block07_anon_audio_received`, `block07_enceladus_available` |
| Evidências | `no_dramatic_event_at_onset`, `anon_hospital_burst_audio` |
| Áudio | Não é um arquivo de iPhone; vira evidência de bancada (`anon_hospital_burst_audio`) para Enceladus |

### Alteração mínima (sem reescrever diálogo agora)

1. Remover botão do Caso.  
2. Unlock `contact-julia` (já existe) + thread WhatsApp **ou** script `call-julia-onset` no iPhone.  
3. Stub de conversa (1–3 trocas) → `onComplete` chama o **mesmo** `finishJuliaCamilaOnsetCheck()` (ou extrai o dispatch).  
4. Opcional: mensagem com áudio anexado → `received` na bancada/Files.

Preservar: flags Enceladus e evidências; só mudar o **vetor** de disparo.

---

### Arquivos prováveis (Etapa 2)

- `src/apps/phone/PhoneCallsHome.tsx`
- `src/components/investigation/panels/PoliceLandlinePanel.tsx`
- `src/data/calls.ts`, `src/data/game/seedContacts.ts`
- `src/lib/phoneApps.ts`, `src/data/game/seedApps.ts`
- `src/apps/device/HiddenDiaryApp.tsx`, Phone router
- `src/components/investigation/panels/PoliceComputerPanel.tsx` (PIN + botão Júlia)
- `src/game/state/investigationStore.ts` (`tryDiaryPin`)
- `src/data/game/seedDocuments.ts` (`doc-laudo-forense`)
- `src/apps/device/FilesApp.tsx`, `phoneMedia.ts`
- `src/game/story/block07Handlers.ts`
- `src/data/chatScripts.ts` (stub Júlia) **ou** novo call script
- Testes: `tests/e2e` diary / block04 / block07 (atualizar depois, fora desta fase de plano)

### Mudanças propostas

Filtrar institucionais no iPhone; presídio no fixo; diário no telefone pós-laudo; provenance leve; Júlia via contato real.

### O que será preservado

PIN `481526`; conteúdo do diário; Enceladus gate flags; ramais 204/212/HOSP.

### Dependências

Etapa 3 (remover botão Caso Júlia) sobrepõe — coordenar. Diário antes de B5+ save migration.

### Riscos

1. E2E diary quebra.  
2. Jogadores mid-save com `forensics_access` sem ícone.  
3. Presídio só no fixo: jogador pode não achar o ramal sem lead claro no documento.  
4. Duplicar `finishJuliaCamilaOnsetCheck` se WA e botão coexistirem temporariamente.  

### Validação mínima

1. Presídio não aparece em Contatos do iPhone.  
2. Ligar presídio pelo fixo ainda libera mapa.  
3. Após laudo, ícone diário no Mariana; PIN no telefone abre entradas.  
4. PC não é mais a única UI de leitura.  
5. Sem botão “Conferir com Júlia”; contato/chat dispara as mesmas flags.  
6. `REC_1102` mostra origem textual.  

### Dúvidas humanas — **RESOLVIDAS**

1. **Lívia no iPhone.**  
2. **Júlia via ligação de voz**; material opcional depois com provenance `received`.  
3. Laudo: app **recuperado e acessível no aparelho**; pode citar package fora do launcher; **não** mandar o jogador continuar no módulo Perícia.

---

# ETAPA 3 — Computador e excesso de “peças”

## 3.1 Auditoria de ações do módulo Caso (B5–B9)

Fonte UI: `PoliceComputerPanel.tsx` (bloco `tab === 'caso'`).  
Handlers: `block05Handlers`, `block07Handlers`, `block08Handlers`, `block09Handlers`.

| Ação atual (label UI) | Bloco | O que faz | Classificação | Substituição sugerida |
|---|---:|---|---|---|
| Reavaliar linha Maralto / protestos | 5 | `onMaraltoLineWeighed()` → reflexão pending | **B** Reflection | Disparar reflexão ao fechar autos Maralto / ao completar leitura; sem botão |
| Organizar cronologia dos contatos recentes | 5 | Cria `doc-mariana-contact-chronology` | **E → Timeline** | **Aprovado:** Timeline do Caderno + reflexão curta; **sem** documento novo (C1) |
| Comparar cronologia com arquivos do celular | 5 | Cria `doc-phone-file-dependencies` | **B/E** | Reflection + evidência automática |
| Reabrir chamada / entrada / apreensão | 5 | Cria `doc-emergency-reassessment` + lista docs reais | **A parcial** | Manter **reabrir peças reais** (`doc-central-chamada`, etc.); remover subdoc de “reavaliação” |
| Reavaliar duração Morsa | 7 | `doc-morsa-duration-note` | **D/B** | Relê fontes dos protestos na bancada/docs reais → reflexão |
| Organizar início dos lapsos de memória | 7 | `doc-memory-onset-chronology` | **B/D** | Caderno/timeline + reflexão; checagem Júlia (Etapa 2) |
| Conferir com Júlia/Camila… | 7 | `finishJuliaCamilaOnsetCheck` + áudio | **C** | WhatsApp/ligação (Etapa 2) |
| Localizar material digital antigo de Henrique | 7 | `doc-henrique-pcap-note` + Cassini | **D/A** | Documento/busca forense real (“dump” como resultado de consulta/perícia), não botão Caso genérico |
| Solicitar reanálise pericial do guardrail | 8 | `doc-guardrail-reanalise` | **A via fixo** | **Aprovado:** pedido pelo **telefone fixo / Perícia**; resultado = laudo (C2); remover botão Caso |
| Cruzar sistema Henrique × Mariana | 9 | `doc-omitido-interface` + nomeia Omitido | **B/D** | Reflection + evidência; ou documento de interface real já obtido em Cassini |
| Revisitar diário à luz de O Omitido | 9 | `doc-diario-releitura-omitido` | **B** | Reabrir diário no telefone → reflexão automática na 2ª leitura |
| Isolar assistência Omitido | 9 | `doc-omitido-assistencia` | **B/E** | Reflection |
| Conferir o que as mensagens sabem demais | 9 | `doc-mensagens-impossiveis` | **B** | Reflection após ler wave2 no WhatsApp |
| Montar cadeia últimos deslocamentos | 9 | `doc-trilha-fisica-mariana` + mapa | **D** | Consultas reais (câmera/transporte) → um relatório institucional |
| Cruzar outros desaparecimentos | 9 | `doc-outros-desaparecimentos` | **A/D** | Busca no monitor com hits reais |
| Registrar anomalias que envolvem Augusto | 9 | `doc-anomalias-augusto` | **B** | Reflection |

**Nota:** o rótulo de seção é “Ação investigativa” (não a palavra literal “AÇÃO”), mas funciona como verbo universal.

---

## 3.2 Consolidação de documentos (proposta — não executar)

| Grupo artificial | IDs candidatos | ID canônico sugerido | Flags/leads a preservar |
|---|---|---|---|
| Cronologia Mariana B5 | `doc-mariana-contact-chronology`, `doc-phone-file-dependencies`, `doc-emergency-reassessment` | Preferir **não** criar docs; usar caderno + docs reais de emergência | `block05_chronology_done`, `block05_compare_done`, `block05_emergency_revisited`, reflexões |
| Morsa / memória B7 | `doc-morsa-duration-note`, `doc-memory-onset-chronology` | Absorver em evidências + reflexão | `block07_morsa_duration_done`, `block07_memory_onset_done` |
| Ricardo→Henrique | `doc-hospital-ricardo-freitas` (manter), `doc-mariana-ricardo-note` (reformar — Etapa 5) | Hospital = fonte real; nota Mariana vira pista parcial sem revelar Henrique no mesmo open | flags ricardo/henrique |
| Omitido B9 | `doc-omitido-interface`, `doc-diario-releitura-omitido`, `doc-omitido-assistencia`, `doc-mensagens-impossiveis` | Um relatório forense **ou** só reflexões | `block09_omitido_named`, etc. |
| Trilha / outros | `doc-trilha-fisica-mariana`, `doc-outros-desaparecimentos`, `doc-anomalias-augusto` | Trilha = relatório institucional único; resto reflection | `block09_trail_*`, location trail |

Documentos **bons a manter:** BO, laudos, fichas, autos Elisa, escalas, empresa Henrique, guardrail (se pericial), hospital Ricardo, interceptações, etc.

---

### Arquivos prováveis (Etapa 3)

- `PoliceComputerPanel.tsx`
- `block05Handlers.ts`, `block07Handlers.ts`, `block08Handlers.ts`, `block09Handlers.ts`
- `seedDocuments.ts`, `seedStory.ts` (tasks/triggers)
- `seedEvidence.ts` (se evidências passarem a nascer de outras fontes)
- `CaseNotepad` / tasks labels
- Checkpoints DEV correspondentes

### Mudanças propostas

Remover/reduzir botões Caso; mover conclusões para Reflection/caderno/docs reais; consolidar subdocs B5–B9.

### O que será preservado

Flags de progresso e evidências finais; ordem macro dos blocos; puzzles da bancada.

### Dependências

Etapa 2 (Júlia); Etapa 5 (doc Ricardo); Etapa 1 (mais reflexões hub com BG correto).

### Riscos

1. Quebrar triggers `seedStory` que exigem `documentsOwned` de subdocs.  
2. Jogador sem “botão” fica sem saber o próximo passo → reforçar pendências no `CaseNotepad`.  
3. Checkpoints DEV listam flags de botões.  
4. Over-reflection fatigue se tudo virar NVL.  

### Validação mínima

1. Nenhum botão genérico desnecessário no Caso B5–B9 (lista acordada).  
2. Progressão B5 ainda alcança `block05_complete`.  
3. Busca no monitor ainda acha docs reais.  
4. Pendências apontam a ferramenta certa.  
5. Grep: IDs de subdocs removidos sem referências órfãs.  

### Dúvidas humanas — **RESOLVIDAS**

1. Cronologia B5 → **Timeline do Caderno** + reflexão curta; **sem** documento novo.  
2. Guardrail → **fixo / Perícia**; resultado = laudo.  
3. B9 → **agressivo**: raciocínios viram Reflection; docs só com fonte externa real.  
   **Fatia:** C1 = B5–B7; C2 = B8–B9.

---

# ETAPA 4 — Choices cosméticas de diálogo

## 4.1 Sistema comum

| Peça | Arquivo |
|---|---|
| Dados | `src/data/chatScripts.ts` (`ScriptStep`: `options: string[]`, `replies: ScriptReply[]`) |
| UI | Composer WhatsApp (seleciona option → envia; replies fixas) |
| Contratos | `paulaScript`, `rafaelScript` (+ possíveis outros no mesmo arquivo) |
| VN topics | `ChoiceOverlay` — **assuntos**, não tom cosmético |
| Ligações | `CallSession` — **sem** options cosméticas hoje |

Comportamento atual: qualquer option do step produz as **mesmas** `replies` (comentário no próprio `chatScripts.ts`).

## 4.2 Amostra de choices problemáticas (auditoria)

| Cena | Choice atual (exemplo) | Problema | Tons sugeridos |
|---|---|---|---|
| Paula / Lucas sobrenome | `Sobrenome?` / `Sabe o sobrenome dele?` | Paráfrase | Formal / direta (“Lucas o quê?”) / leve |
| Paula / quem | `Quem?` / `Procurando quem?` | Paráfrase | Formal / curta / espelhar fala dela |
| Rafael abertura | 3 opções já um pouco distintas | Ok relativo | Manter; afinar formal/direta/humana |
| Rafael “mesmo” | `Por que “mesmo”?` / `Como assim, “mesmo”?` | Paráfrase | Neutra / mais seca |
| Rafael gravação | duas opções quase iguais | Paráfrase | Procedimental vs. direta |
| Rafael lugar | `Que lugar?` / `Qual lugar?` | Paráfrase | Formal / brusca / confirmatória |

**Chamadas:** não há tríades; expansão futura exigiria **código** em `CallSession` + dados em `calls.ts` (fora do mínimo se só WhatsApp).

## 4.3 Exemplo completo (dados only) — Paula sobrenome

```ts
{
  options: [
    'Você sabe o sobrenome dele?',           // formal
    'Lucas o quê?',                            // direta
    'Lucas Neto? Estou chutando.',            // leve (sem nonsense)
  ],
  // FUTURO: repliesPorOption ou replies: ScriptReply[][] 
  replies: [{ kind: 'text', text: 'Moreira.' }], // hoje único; Etapa 4 expandiria 3 respostas curtas → convergem no próximo step
}
```

### Mudança de código necessária?

- **Só dados:** se mantiver mesma reply (melhora percepção de tom nas options).  
- **Dados + código:** se cada option tiver reply imediata diferente — estender `ScriptStep` para `repliesByOption?: ScriptReply[][]` com fallback.

---

### Arquivos prováveis (Etapa 4)

- `src/data/chatScripts.ts`
- Composer / chat view que consome o script (grep `ScriptStep` / `paulaScript`)
- Opcional futuro: `calls.ts` + `CallSession.tsx`

### Mudanças propostas

Reescrever options (e opcionalmente replies imediatas) nas conversas Augusto existentes; estender tipo se necessário.

### O que será preservado

`onComplete`, evidências, número de steps, convergência narrativa.

### Dependências

Nenhuma das outras etapas.

### Riscos

1. Testes e2e que clicam texto exato da option.  
2. Option cômica demais quebra tom.  
3. Scope creep para VN topics.  

### Validação mínima

1. Paula: 3 tons distintos no step do sobrenome; progressão igual.  
2. Rafael: nenhuma tríade só paráfrase.  
3. `onComplete` ainda dispara.  

### Dúvidas humanas — **RESOLVIDAS**

1. **`repliesByOption`** (com `replies` fallback) — resposta imediata distinta por tom.  
2. Execução **D** = **somente WhatsApp**; CallSession depois, se fizer sentido.

---

# ETAPA 5 — Ricardo → Henrique

## 5.1 Fluxo atual (código)

```
Enceladus (onEnceladusSolved)
  → evidências: hospital env, nome Ricardo, janela de plantão
  → block07_ricardo_search_unlocked

Fixo HOSP (call-hospital-ricardo) OU busca "ricardo"
  → doc-hospital-ricardo-freitas
  → Ricardo Freitas óbito + poor ID
  → task_crosscheck_ricardo_mariana
  → block07_ricardo_crosscheck_unlocked

Busca "ricardo" de novo (seedStory block07_ricardo_cross)
  → doc-mariana-ricardo-note
  → onOpen JÁ adiciona:
       ricardo_identity_false
       ricardo_was_henrique_valenca
       discoverPerson henrique
       block07_henrique_identified
```

**Por que é imediato:** um único documento de “extração” entrega a identidade completa no `onOpen`. Não há etapa intermediária “os dados não fecham” sem nome Henrique; não há reflection entre as duas.

Arquivos: `block07Handlers.ts`, `calls.ts`, `seedDocuments.ts` (`doc-hospital-ricardo-freitas`, `doc-mariana-ricardo-note`), `seedStory.ts` (search rules), `seedEvidence.ts`.

## 5.2 Peças reutilizáveis

- Tom banal do hospital (já bom no doc).  
- Call diegética no fixo.  
- Evidências `ricardo_record_poor_id`, `ricardo_freitas_died_that_shift`.  
- Extração forense / diário / celular Mariana como **fonte** da ponte (já narrada no título do doc).  
- Cecília só após `onHenriqueTrailComplete` (empresa + incidente + contato) — manter.

## 5.3 Alternativas concretas de ponte (2–3)

### Alternativa A — Identificador parcial no celular (recomendada)

1. Após Ricardo: busca Ricardo na consulta → “sem CPF confiável / sem parentes / linha morta” (novo doc curto **sem** Henrique).  
2. Reflection: “nome morto”.  
3. Em Downloads/Notas/diário: fragmento `HV-…` / e-mail parcial / ID de equipamento que casa com **incidente de segurança** já existente de Henrique (`doc-henrique-incidente` só liberado depois) **ou** com username em material Cassini futuro.  
4. Só então busca `Henrique` ou cruzamento manual no Caso/Perícia.

Aproveita: `FilesApp` flags, diário, docs Henrique já modelados.

### Alternativa B — Objeto/documento do hospital

Pulseira / pertence catalogado com monograma ou cartão corporativo parcial no laudo hospitalar **complementar** (pedido via fixo), cruzável com cadastro empresarial.

Aproveita: fluxo institucional fixo; menos dependência do celular.

### Alternativa C — Anotação Mariana ambígua

Fatiar `doc-mariana-ricardo-note`:

- pista parcial (sem nome Henrique);  
- confirmação só após cruzamento independente.

### **Aprovado: híbrido A + C** (com refinemento)

A pista parcial **já existia antes do B7** (diário / arquivo / anotação acessível desde B4 ou forense). Até Ricardo existir, é **incompreensível**. No B7 o jogador finalmente sabe o que procurar — informação antiga ganha significado novo.

**Proibido:** um único `onOpen` que entrega `ricardo_was_henrique_valenca`.

## 5.4 Nova cadeia aprovada

1. Enceladus → só Ricardo + hospital + período.  
2. Fixo hospital → Ricardo Freitas (banal).  
3. Pesquisa Ricardo → **sem identidade convincente** (dead end).  
4. Reflection hub: “Ricardo é um nome morto”.  
5. Material **já existente** de Mariana → identificador parcial (H.V. / username / e-mail / ID).  
6. Cruzamento independente → **Henrique Valença**.  
7. Reflection.  
8. Trail Henrique → Cecília (como hoje).

## 5.5 Saves

Flags `block07_henrique_identified` / evidências `ricardo_was_henrique_valenca` podem existir em saves mid-B7. Migrar: se já identified, ok; se só `ricardo_found`, exigir nova ponte.

---

### Arquivos prováveis (Etapa 5)

- `seedDocuments.ts`, `seedStory.ts`, `seedEvidence.ts`
- `block07Handlers.ts`, `block07DevCheckpoints.ts`
- `calls.ts` (hospital)
- `reflections.ts` (novas reflexões)
- Opcional: `FilesApp` / `phoneMedia` / diary entries
- `PoliceComputerPanel` se houver botão crosscheck

### Mudanças propostas

Fatiar revelação; dead-end Ricardo; ponte material; reflections; Cecília inalterada na ordem.

### O que será preservado

Enceladus; call hospital; evidências finais; Cecília após trail.

### Dependências

Etapa 1 (BG hub reflections); Etapa 2 (proveniência arquivo); Etapa 3 (não recriar botão Caso para o twist).

### Riscos

1. Softlock se ponte não for descoberta (precisa lead claro nas pendências).  
2. Spoiler em título de documento/search snippet.  
3. Checkpoints `b07-ricardo-henrique` comprimem tudo — atualizar.  
4. Duplicar `onOpen` entre call e doc hospital (já duplicado hoje).  

### Validação mínima

1. Pós-Enceladus: nenhum texto player-facing “Henrique”.  
2. Abrir hospital Freitas: sem Henrique.  
3. Dead-end Ricardo visível.  
4. Só após ponte: `henrique` unlocked.  
5. Cecília ainda exige trail.  

### Dúvidas humanas — **RESOLVIDAS**

1. Híbrido **A+C**.  
2. Pista **já acessível antes**; só ganha sentido no B7 (não “aparecer do nada” no B7).

---

# ETAPA 6 — Morsa → André

## 6.1 Implementação atual Puzzle 10

| Peça | Arquivo |
|---|---|
| Dados | `src/data/block08/ringsPuzzle.ts` |
| UI | `src/components/investigation/panels/RingsSession.tsx` |
| Gate | `block08_rings_available` (`startBlock08`) |
| Solve | `onRingsSolved()` → evidências `morsa_was_andre`, `protest_timeline_reconstructed`, … + `block08_refl_morsa_pending` |

UI atual: texto + botões de ordem; após solve, parágrafo descreve continuidade D→F (máscara/rádio/mochila) **em texto**. Sem imagens, sem seleção de correspondências, sem pausa antes da evidência (evidência entra no mesmo `dispatchActions` do solve).

`RING_CALLSIGN_HINT` menciona continuidade visual, mas não há asset wired.

## 6.2 Preparação visual de Morsa (antes do puzzle)

Pontos narrativos existentes que **poderiam** mostrar Morsa mas hoje são texto/evidência:

| Ponto | O que existe | Asset? |
|---|---|---|
| Saturnalia / Lívia / protestos | Evidências `protest_masked_core`, `morsa_unidentified` | Sem imagem dedicada no fluxo |
| Samuel entrevista | Confirma Morsa | Sem foto |
| Docs Maralto / detidos | Texto | — |
| Sprite `masked man.png` | Em `src/assets/sprites/masked man.png`, chave `masked-man` em `characterSprites.ts` | **Existe** — não usado no Rings |
| Rings fontes B/D/F | Descrições textuais | Sem frames |

**Assets novos prováveis:** 2–3 frames (entrada mascarada; lateral; saída desmascarada com mochila/rádio). Listar apenas: `morsa-frame-enter`, `morsa-frame-lateral`, `andre-frame-exit` (ou um contact sheet).

## 6.3 Como inserir apresentação sem reescrever o puzzle

1. **Pré-load diegético:** ao obter evidências de protesto (B3/B4/B6), anexar `imageSrc` em documento/Files/Photos (`sprite:masked-man` ou novos).  
2. **No RingsSession:** após ordem correta, em vez de só texto:  
   - mostrar 3 thumbnails;  
   - jogador marca correspondências (mochila / rádio / sequência);  
   - botão `CONFIRMAR CONTINUIDADE`;  
3. Só no confirmar: chamar lógica atual de `onRingsSolved` **mas** diferir `addEvidence('morsa_was_andre')` até após reflection — **ou** add evidence sem discovery popup (fila pausada + reflection primeiro).

Ritmo desejado:

`confirm → hold timeline → reflection (palavra André) → então discovery evidence`

Hoje: `solve → evidence+hypothesis+refl pending` simultâneos; DiscoveryHost pode mostrar cartão se não estiver em fullscreen.

## 6.4 Ajuste de reflexão

`refl-b08-morsa` hoje: background **prisão**; deve ser **delegacia** (bancada). Texto já centra em “Morsa era André”.

---

### Arquivos prováveis (Etapa 6)

- `ringsPuzzle.ts`, `RingsSession.tsx`
- `block08Handlers.ts` (`onRingsSolved` split)
- `reflections.ts` (`refl-b08-morsa`)
- `seedEvidence.ts` / docs de protesto (anexar mídia)
- `characterSprites.ts` / novos assets em `public` ou `src/assets`
- `DiscoveryHost` / `fullscreenScene` (ritmo)
- Opcional: `PhotosApp` / CaseFiles image block

### Mudanças propostas

Frames + confirmação de continuidade; atrasar popup; BG reflexão; preparar Morsa visual antes.

### O que será preservado

Ordem A→B→E→D→C→F; flags `block08_rings_done`; confrontação André seguinte.

### Dependências

Etapa 1 (reflection BG + pause discoveries); assets.

### Riscos

1. Evidência `morsa_was_andre` atrasada quebra trigger que espera flag imediata.  
2. Sem assets, UI fica placeholder feio.  
3. Confirm step pode confundir se a ordem já “resolveu”.  
4. Spoiler em label de evidência antes da reflection.  

### Validação mínima

1. Antes do puzzle: pelo menos uma imagem mascarada de Morsa visível no caso.  
2. Ordem correta não dispara cartão “André” antes da reflection.  
3. Confirm continuidade → reflection → evidência.  
4. Reflection no hub com BG delegacia.  
5. Presídio confrontação ainda abre depois.  

### Dúvidas humanas — **RESOLVIDAS**

1. Checks **obrigatórios**, triviais após a timeline.  
2. `masked-man` = **preparação** anterior; Puzzle 10 = **2–3 frames** específicos.  
3. **“André.”** só na Reflection; UI do puzzle para na continuidade visual.

---

# Ordem de execução aprovada (prompts pequenos)

> Cada linha = **um prompt Cursor**. Não fundir A1+A2 ou C1+C2 no mesmo job.

| # | Prompt | Escopo (só isso) | Fora deste prompt | Depende de |
|---|---|---|---|---|
| **A1** | Reflection + discoveries | Backgrounds das **reflections** (hub → delegacia; imediatas no local); `fullscreenScene` / pause de DiscoveryHost em solo reflection e overlays; mover reflexões claramente imediatas para pré-fade se listadas | Assets de **locais** / `sceneBackgrounds` de galpão etc. | — |
| **A2** | Backgrounds de locais | Só `sceneBackgrounds` + assets necessários (galpão, oficina, trail, Miro interrogatório, 3–4 residências) | Regras de reflection / discoveries | A1 preferível |
| **B1** | Telefones + Júlia | Filtrar `institution` no iPhone; presídio no fixo; Lívia fica no celular; Júlia onset via **ligação de voz** | Diário / provenance Files | A1 útil |
| **B2** | Diário + provenance | Ícone `hidden-diary` pós-laudo; PIN no telefone; texto do laudo; provenance em arquivos dinâmicos | Contatos / Júlia (já em B1) | B1 opcional; A1 útil |
| **C1** | Caso artificial B5–B7 | Cronologia → Timeline caderno; ações Morsa/memória/Henrique dump; remover botões workflow | Guardrail; B9 | B1 (Júlia); A1 |
| **C2** | Caso artificial B8–B9 | Guardrail via fixo/Perícia; remoção agressiva docs de raciocínio B9 | B5–B7 | C1; A1 |
| **D** | Choices WhatsApp | `repliesByOption` + tons distintos nos scripts existentes | CallSession | — |
| **E** | Ricardo → Henrique | Cadeia A+C aprovada; pista parcial pré-existente; fatiar `doc-mariana-ricardo-note` | Cecília literária profunda | A1, B2, C1 |
| **F** | Morsa → André | Frames + checks + ritmo reflection antes da evidência; prep `masked-man` | Redesign Rings inteiro | A1; A2/assets |

**Começar por A1:** pequeno, corrige bug visível em vários blocos, prepara pause que **F** precisa.

---

## Escopo detalhado sugerido — A1 (próximo prompt)

**Fazer:**

1. Corrigir `background` em `reflections.ts` para todas as reflexões de hub/raciocínio posterior → delegacia (path do escritório / hub).  
2. Garantir reflexões pós-entrevista verdadeiramente imediatas usam fundo do local (e, se hoje disparam só no hub, movê-las para o pipeline `SceneRunner` **somente** quando a decisão caso-a-caso exigir — priorizar correção de BG + flags).  
3. `setFullscreenScene(true)` durante solo reflection e `MemoryWordOverlay` (unmount limpa).  
4. Opcional: pequeno delay ao despausar DiscoveryHost.

**Não fazer em A1:** trocar `sceneBackgrounds.operation` / denis / trail; gerar assets; mexer em puzzles/Caso/telefones.

**Validação mínima A1 (≤6):**

1. Reflexão hub pós-documento usa delegacia.  
2. `refl-b08-morsa` (ou equivalente pending) → delegacia.  
3. Uma reflexão imediata de entrevista mantém o local.  
4. Durante solo reflection, nenhum popup de discovery.  
5. Após fechar reflection, discoveries podem aparecer.  
6. Build uma vez no final.

---

# Política de testes (aprovada — mais restritiva)

Em **cada** prompt de execução, incluir explicitamente:

> Não crie novos testes automatizados para esta tarefa, salvo se a mudança introduzir uma função pura ou regra de estado cuja validação manual seja impraticável.

Regras:

- Alterar → checar TS/linter se disponível → **`npm run build` uma vez no final** (não após cada micro-edit). Se falhar, corrigir e rodar de novo.  
- Unitários **já existentes** só se diretamente afetados e rápidos — **não** interpretar isso como licença para escrever bateria nova.  
- **Não** `test:e2e` completo / visual / screenshots por padrão.  
- 3–6 verificações manuais concretas.  
- Grep de IDs/labels órfãos / spoilers.  
- Não gastar tempo consertando e2e obsoleto além do assert mínimo se CI quebrar.

---

# Alternativas globais no código (reutilizar)

1. **`Contact.institution`** — filtrar no iPhone (**B1**).  
2. **`fullscreenScene` + DiscoveryHost** — estender (**A1**).  
3. **`HiddenDiaryApp` + `tryDiaryPin`** — mudar superfície (**B2**).  
4. **`ReflectionDef.background`** — corrigir dados (**A1**).  
5. **`chatScripts` / `ScriptStep`** — `repliesByOption` (**D**).  
6. **Sprite `masked-man`** — preparação Morsa (**F**); frames novos para o twist.

---

# Checklist de prontidão do plano

- [x] Componentes/arquivos reais nomeados  
- [x] Flags e handlers principais  
- [x] Scene IDs + tabela backgrounds  
- [x] Contatos / ferramentas  
- [x] Diário / PIN / apps  
- [x] Arquivos dinâmicos do celular  
- [x] Ações Caso B5–B9 classificadas  
- [x] Docs artificiais a consolidar (proposta)  
- [x] Choices sistema + amostra  
- [x] Ricardo→Henrique cadeia e alternativas  
- [x] Rings/Morsa estado atual e inserção  
- [x] Riscos / validação por etapa  
- [x] **Decisões humanas registradas**  
- [x] **Ordem A1…F aprovada**  
- [x] **Política de testes restritiva**  

**Plano aprovado. Próxima execução: A1.**