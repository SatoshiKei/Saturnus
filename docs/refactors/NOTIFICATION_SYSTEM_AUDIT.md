# SATURNUS — Auditoria do sistema de notificações / discoveries / unlocks

**Escopo:** inspeção estática do runtime. Nenhuma correção aplicada nesta rodada.  
**Data da auditoria:** 2026-11-09  
**Fonte principal:** `src/game/story/actions.ts` → `withDiscovery` → `state.discoveries` → `DiscoveryHost`

---

# 1. Resumo executivo

Existem **dois canais visuais de “notificação narrativa”** no mesmo host (`DiscoveryHost`), mais **vários feedbacks laterais** (badges, notepad, toast do WhatsApp, overlays de cena) que **não** passam pela fila `discoveries`.

O problema principal não é “muitos componentes diferentes competindo”, e sim:

1. **Uma regra global agressiva** em `applyStoryActions`: quase todo `addEvidence` / `addDocument` / `unlockLocation` / `unlockContact` / `addTask` / `confirmContradiction` empilha um `DiscoveryEvent`.
2. **Handlers e `document.onOpen` despacham lotes** de actions numa única interação → **cascata** (1 clique → N toasts).
3. O host **empilha até 3 notices escuros** ao mesmo tempo e trata **evidence** como **cartão de papel bloqueante** (exige dismiss).

O caso observado no BO encaixa exatamente nisso: 1 cartão claro de evidência + até 3 notices pretos de documento (com um 4º ainda na fila).

**Achievements** existem no menu, mas **não** geram popup/toast no momento do unlock.

**Estimativa de instâncias player-facing alcançáveis via `DiscoveryHost`:** ~**290–310** eventos únicos ao longo de um playthrough completo (ver §5), dominados por evidências (~146) e objetivos (~70–80).

---

# 2. Sistemas encontrados

## 2.1 DiscoveryHost (sistema central de discovery)

| Campo | Detalhe |
|---|---|
| Nome técnico | `DiscoveryHost` |
| Arquivos | `src/components/investigation/DiscoveryHost.tsx`, `src/styles/investigation.css` (`.disc-card`, `.disc-notice`), montado em `InvestigationBootstrap.tsx` |
| Store | `investigationStore.state.discoveries` (`InvestigationState.discoveries`) |
| Produção | `withDiscovery` / `applyStoryActions` em `src/game/story/actions.ts` |
| Disparo | Indireto: qualquer `dispatchActions` / `openDocument` / `extractFromDocument` / engine de contradições |

### Variante A — EvidenceCard (overlay “claro” / papel)

- **Visual:** cartão creme/papel (`.disc-card`), canto superior direito.
- **Bloqueante?** Não congela a mesa, mas **persiste até clique** (× ou “Ver no caderno”).
- **Auto-dismiss:** não.
- **Empilha:** não — se `discoveries[0].kind === 'evidence'`, só esse cartão é mostrado; o resto espera.
- **Kinds:** `evidence` (evidências não-áudio e não-`catalogHidden`).
- **Texto típico:** título da evidência + “EVIDÊNCIA ADQUIRIDA” + “Arquivada no caderno.”
- **SFX:** `evidence`.

### Variante B — Notice (cards pretos empilhados)

- **Visual:** faixa escura (`.disc-notice`), borda esquerda dourada / fria / vermelha conforme kind.
- **Bloqueante?** Não.
- **Auto-dismiss:** **sim** — `4200ms` (sem ação) ou `6500ms` (com botão).
- **Empilha:** até **3** notices consecutivos não-`evidence` na cabeça da fila.
- **Kinds e rótulos:**

| kind | Label UI | Duração tip. | CTA opcional |
|---|---|---|---|
| `document` | DOCUMENTO | 4,2 s | — |
| `contact` | NOVO CONTATO | 4,2 s | — |
| `location` | NOVO LOCAL | 6,5 s | Abrir o mapa |
| `audio` | NOVO ÁUDIO | 6,5 s | Ir à bancada |
| `hypothesis` | HIPÓTESE | 4,2 s | — *(kind existe; `addHypothesis` hoje é silencioso — ver §9)* |
| `objective` | NOVO OBJETIVO | 4,2 s | — |
| `contradiction` | CONTRADIÇÃO REGISTRADA | 6,5 s | Ver no caderno |
| `message` | MENSAGEM | 4,2 s | — |

- **Pausa:** fila não renderiza se `locationScene`, `fullscreenScene` ou `shell !== 'playing'`.

---

## 2.2 CaseNotepad (pendências — feedback lateral, não toast)

| Campo | Detalhe |
|---|---|
| Arquivos | `CaseNotepad.tsx` |
| Store | `state.tasks` |
| Comportamento | Aba “Pendências”; pulsa `data-fresh` ~2,6 s quando `pending.length` sobe |
| Clique | Só para abrir/fechar a lista |
| Classificação | Badge / UI persistente — **não** é discovery |

---

## 2.3 Hub badges (mesa)

| Campo | Detalhe |
|---|---|
| Arquivos | `Scene.tsx` (`fxFor`), `SceneObject.tsx`, `.hub-badge` |
| Exemplos | telefone fixo tocando (Hex), bancada com áudio não visto, celular Augusto com novos contatos |
| Classificação | Badge espacial — **não** passa por `discoveries` |

---

## 2.4 WhatsApp in-app toast

| Campo | Detalhe |
|---|---|
| Arquivos | `WhatsAppShell.tsx` (estado local `toast`) |
| Conteúdo | “Atualizações indisponíveis…”, “Nova conversa bloqueada…”, etc. |
| Duração | 2,2 s |
| Classificação | Toast UX do app — **não narrativo** |

---

## 2.5 WhatsApp unread badge

| Campo | Detalhe |
|---|---|
| Arquivos | `ChatList.tsx` (`wa-chat-row__badge`) |
| Classificação | Badge de app |

---

## 2.6 Phone home badge

| Campo | Detalhe |
|---|---|
| Arquivos | `PhoneHome.tsx` (`phone-home__badge`) — novos contatos no aparelho Augusto |
| Classificação | Badge |

---

## 2.7 Scene labels / first-time hints

| Campo | Detalhe |
|---|---|
| Arquivos | `Scene.tsx` + `uiStore` (`saturnus-ui-hints-v1`) |
| Comportamento | Legendas nos objetos ~7 s na primeira sessão |
| Classificação | Tutorial UI — **não** discovery |

---

## 2.8 MemoryWordOverlay (B9)

| Campo | Detalhe |
|---|---|
| Arquivos | `MemoryWordOverlay.tsx` |
| Comportamento | Fullscreen; exige “Continuar”; seta `fullscreenScene` |
| Classificação | Overlay cinematográfico / puzzle — **fora** da fila discovery |

---

## 2.9 Achievements (histórico sem popup)

| Campo | Detalhe |
|---|---|
| Arquivos | `seedAchievements.ts`, `engine.ts` (`syncAchievements`), `AchievementsScreen.tsx` |
| Unlock | Silencioso → `achievementUnlocks[id] = Date.now()` |
| Popup? | **Não** |
| Classificação | Progresso meta; **sem** toast no momento do unlock |

---

## 2.10 toastQueue (legado morto)

| Campo | Detalhe |
|---|---|
| Campo | `InvestigationState.toastQueue` |
| Uso atual | Inicializado `[]`; migração zera; **nenhum UI consome** |
| Classificação | Deprecated / sem efeito player-facing |

---

## 2.11 Provocations

| Campo | Detalhe |
|---|---|
| `pushProvocation` | Criaria `kind: 'message'` via `withDiscovery` |
| Catálogo | `seedProvocations: []` (vazio) |
| UI dedicada | `dismissProvocation` existe; **nenhum `ProvocationBanner` montado** no bootstrap atual |
| Classificação | Pipeline preparado, **zero instâncias** no jogo atual |

---

## 2.12 VN / Reflections / SceneRunner

Overlays de intro, fade e reflexão — **não** são notificações de unlock. Pausam discoveries via `fullscreenScene` / `locationScene`.

---

# 3. Arquitetura / fluxo

```text
Handler / DocumentSheet / openDocument / extractFromDocument / StoryEngine
        │
        ▼
dispatchActions / applyStoryActions
        │
        ├─ addEvidence (se !catalogHidden) ──► withDiscovery(kind evidence|audio)
        ├─ addDocument (se playerFacing≠false) ► withDiscovery(kind document)
        ├─ unlockLocation (unknown→mapped) ──► withDiscovery(kind location)
        ├─ unlockContact (1ª vez) ───────────► withDiscovery(kind contact)
        ├─ addTask / replaceTasks(fresh) ────► withDiscovery(kind objective)
        ├─ confirmContradiction ─────────────► withDiscovery(kind contradiction)
        ├─ installApp(hidden-diary) ─────────► withDiscovery(kind message)
        ├─ pushProvocation ──────────────────► withDiscovery(kind message) [catálogo vazio]
        └─ addHypothesis / completeTask / discoverPerson / setFlag → SILENCIOSO
        │
        ▼
state.discoveries[]  (persistido no save)
        │
        ▼
DiscoveryHost (se !paused)
        ├─ head.kind==='evidence' → EvidenceCard (bloqueante)
        └─ senão → até 3 Notices (auto-dismiss)
```

### `openDocument` (cascata estrutural)

```text
openDocument(id)
  → addDocument(id)           // toast DOCUMENTO (se novo e playerFacing)
  → marca read
  → onOpen[] (1ª leitura)     // pode addEvidence / unlockContact / unlockLocation / addTask…
```

Arquivo: `investigationStore.openDocument`.

---

# 4. Caso do BO (trace completo)

## Ação do jogador

Na pasta física / Case Files, abre `doc-bo-inicial` e clica **Registrar no caderno** no bloco `b5`.

`DocumentSheet` → `registerInitialPoliceReport()` (`block01Handlers.ts`).

## Actions despachadas (ordem)

| # | Action | Gera discovery? | Motivo |
|---|---|---|---|
| 1 | `setFlag block01_bo_registered` | não | — |
| 2 | `addEvidence initial_police_report` | **sim** → EvidenceCard | Título: «BO — desaparecimento de Mariana Silva» |
| 3 | `addEvidence mariana_phone` | não | Já em `evidenceOwned` no `createInitialState` |
| 4 | `addEvidence emergency_call_raw` | não | Já pré-possuído |
| 5–7 | `discoverPerson` mariana/julia/diego | não | Silencioso |
| 8 | `addHypothesis hyp_kidnapping` | não | Silencioso |
| 9–10 | `linkHypothesis`… | não | — |
| 11 | `completeTask task_review_bo` | não | Silencioso (notepad só pulsa em *add*) |
| 12 | `addDocument doc-central-chamada` | **sim** Notice | «Registro da central — chamada das 08:03» |
| 13 | `addDocument doc-entrada-apartamento` | **sim** Notice | «Relatório de entrada — apartamento de Mariana» |
| 14 | `addDocument doc-apreensao-celular` | **sim** Notice | «Termo de apreensão — aparelho celular» |
| 15 | `addDocument doc-extracao-inicial` | **sim** Notice | «Relatório de extração inicial — aparelho de Mariana» |

## O que o jogador vê

1. **Cartão claro (EvidenceCard)** — exige clique.  
2. Após fechar: **até 3 notices pretos** (docs 12–14).  
3. O 4º documento permanece em `discoveries` até o stack avançar.

**Total de feedbacks DiscoveryHost:** **5** (1 bloqueante + 4 auto).  
**Na tela ao mesmo tempo após dismiss do cartão:** **3** pretos (limite do stack).

## Os três docs já existiam?

Não. Só `doc-bo-inicial` começa em `documentsOwned`. Os quatro docs são **novos unlocks** reais (pasta física `PHYSICAL_DOC_IDS` inclui central/entrada/apreensão; extração também entra na posse).

## Side effects silenciosos no mesmo gesto

- Hipótese `hyp_kidnapping` no caderno.
- Pessoas atualizadas.
- Task `task_review_bo` completada.
- Evidência BO no caderno (além do cartão).
- Celular/áudio de emergência **já** estavam disponíveis (pré-possuídos sem toast inicial).

## Badge / update não toast

- Nada no notepad (não houve `addTask`).
- Bancada já tinha `emergency_call_raw` (badge de áudio não visto depende de `audioSeen`).

---

# 5. Inventário completo (player-facing via DiscoveryHost)

Convenção de IDs de discovery:

- `evidence:<evidenceId>`
- `document:<docId>`
- `location:<locationId>`
- `contact:<contactId>`
- `objective:<taskId>`
- `contradiction:<contraId>`
- `app:hidden-diary` / `message:<provocationId>`

## 5.1 Regra — Evidências (`kind: evidence` ou `audio`)

**Toda** `addEvidence` cujo catálogo **não** tem `catalogHidden` gera discovery.

| Métrica | Valor |
|---|---:|
| Itens no catálogo | 161 |
| `catalogHidden` (sem toast) | 15 |
| **Potencialmente notificáveis** | **~146** |
| Destes, `type:'audio'` → Notice “NOVO ÁUDIO” | ~16 |
| Restantes → EvidenceCard bloqueante | ~130 |

**Hidden (silenciosos):**  
`elisa_more_alcohol_than_stated`, `geraldo_suspected_underage`, `jana_loan_explanation`, `jana_feared_valter_people`, `miro_sought_jana_night_x`, `miro_denies_killing_elisa`, `miro_recovered_jana_bag`, `sandra_acknowledges_miro_possibility`, `mariana_focused_morsa_duration`, `onset_matches_hospital_shifts`, `anon_audio_hospital_environment`, `anon_audio_shift_window`, `phone_files_depend_on_order`, `phone_seized_after_call`, `nico_believes_jacket_jana`.

**Pré-possuídos sem toast na abertura do jogo:** `emergency_call_raw`, `mariana_phone` (`createInitialState` não chama `withDiscovery`).

**Trigger típico:** handlers B1–B9, `document.onOpen`, `extractFromDocument`, interviews, puzzles, triggers em `seedStory`.

**Lista canônica de IDs:** todos os `id` em `seedEvidenceCatalog` exceto os 15 hidden (ver `src/data/game/seedEvidence.ts`).

---

## 5.2 Documentos (`kind: document`)

Toast com **título do documento** quando entra em `documentsOwned` pela primeira vez e `playerFacing !== false`.

| ID | Texto visível | Bloco tip. | Trigger típico | Auto | Clique |
|---|---|---|---|---|---|
| `doc-bo-inicial` | Boletim de ocorrência — desaparecimento | B1 | Já owned no start → **sem toast** | — | — |
| `doc-central-chamada` | Registro da central — chamada das 08:03 | B1 | Registrar BO | sim | não |
| `doc-entrada-apartamento` | Relatório de entrada — apartamento de Mariana | B1 | Registrar BO / revisit B5 | sim | não |
| `doc-apreensao-celular` | Termo de apreensão — aparelho celular | B1 | Registrar BO / revisit B5 | sim | não |
| `doc-extracao-inicial` | Relatório de extração inicial — aparelho de Mariana | B1 | Registrar BO | sim | não |
| `doc-lucas-cadastro` | Consulta cadastral — Lucas Moreira | B2 | Busca / openDocument | sim | não |
| `doc-elisa-resumo` | Processo criminal — resumo (Elisa Duarte) | B2 | openDocument | sim | não |
| `doc-elisa-testemunhas` | Testemunhas arquivadas — processo Elisa Duarte | B2 | openDocument | sim | não |
| `doc-elisa-cronologia` | Cronologia da noite — cópia autenticada (fls. 41) | B2/B3 | open / call | sim | não |
| `doc-vertice-escala` | Escala de DJs e equipe — arquivo antigo do Vértice | B2 | openDocument | sim | não |
| `doc-nico-cadastro` | Consulta cadastral — Nicolas Prado Reis | B3 | openDocument | sim | não |
| `doc-maralto-cadastro` | Consulta cadastral — Maralto Granéis | B3 | openDocument | sim | não |
| `doc-maralto-clipping` | Reportagem — “Porto em conflito”… | B3 | openDocument | sim | não |
| `doc-cruzamento-maralto-elisa` | Pesquisa cruzada — autos Elisa / Maralto… | B3 | openDocument | sim | não |
| `doc-protesto-ocorrencia` | Ocorrência — confronto… | B3 | openDocument | sim | não |
| `doc-protesto-detidos` | Relação de detidos… | B3 | openDocument | sim | não |
| `doc-samuel-ficha` | Ficha — Samuel Teixeira | B4 | openDocument | sim | não |
| `doc-andre-ficha` | Ficha de execução penal — André Silva | B4 | openDocument | sim | não |
| `doc-andre-visitas` | Registro de visitas — André Silva | B4 | openDocument | sim | não |
| `doc-andre-ligacoes` | Registro de ligações autorizadas — André Silva | B4 | openDocument | sim | não |
| `doc-numero-sem-nome` | Log de interações — número sem nome… | B4 | openDocument | sim | não |
| `doc-laudo-forense` | Laudo pericial — aparelho de Mariana… | B4 | open / call | sim | não |
| `doc-elisa-jana` | Depoimento arquivado — Jana Ribeiro | B5 | busca jana | sim | não |
| `doc-elisa-argumento` | Autos — Caso Elisa Duarte | B5 | busca elisa | sim | não |
| `doc-elisa-geraldo-depoimento` | Depoimento arquivado — Geraldo Mota… | B5/B6 | fim B5 / busca | sim | não |
| `doc-geraldo-ficha` | Ficha — Geraldo Mota | B6 | busca | sim | não |
| `doc-vertice-comanda-noitex` | Comanda e fechamento… | B6 | busca | sim | não |
| `doc-valter-ocorrencias` | Válter — ocorrências e vínculos | B6 | busca | sim | não |
| `doc-valter-associados` | Relação de associados — núcleo Válter | B6 | busca | sim | não |
| `doc-valter-interceptacao` | Interceptação de rádio… | B6 | busca | sim | não |
| `doc-tabela-logistica-g17n` | Tabela logística apreendida (parcial) | B6 | trigger/story | sim | não |
| `doc-sandra-depoimento` | Depoimento — Sandra Almeida… | B7 | busca | sim | não |
| `doc-sandra-ficha` | Ficha — Sandra Almeida | B7 | busca | sim | não |
| `doc-hospital-ricardo-freitas` | Hospital Municipal — atendimento / óbito… | B7 | busca | sim | não |
| `doc-ricardo-consulta-negativa` | Consulta civil — Ricardo Freitas… | B7 | busca | sim | não |
| `doc-mariana-ricardo-note` | Extração — anotação privada… | B7 | busca | sim | não |
| `doc-henrique-cadastro` | Consulta cadastral — identificador hvalenca | B7 | busca | sim | não |
| `doc-henrique-empresa` | Henrique Valença — vínculo empresarial | B7 | busca | sim | não |
| `doc-henrique-incidente` | Incidente de segurança… | B7 | busca | sim | não |
| `doc-cecilia-contato` | Contato profissional — Cecília Prado | B7 | busca | sim | não |
| `doc-henrique-pcap-note` | Material digital antigo — captura… | B7 | handler dump | sim | não |
| `doc-guardrail-reanalise` | Laudo complementar — Guardrail… | B8 | open / call | sim | não |
| `doc-camera-veiculo-madrugada` | Câmera viária — veículo com dano… | B8 | busca | sim | não |
| `doc-mauro-transferencia` | Comprovante de transferência… | B8 | entrevista Mauro | sim | não |
| `doc-bia-ficha` | Ficha — Bia… | B8 | busca | sim | não |
| `doc-rui-ficha` | Ficha — Rui | B8 | busca | sim | não |
| `doc-escala-vtr14` | Escala antiga — indicativo VTR-14 | B8/B9 | busca | sim | não |
| `doc-omitido-interface` | Log de sessão — identificador O Omitido | B9 | handler | sim | não |
| `doc-roberto-denuncia` | Roberto Siqueira — afastamento… | B9 | busca | sim | não |
| `doc-trilha-camera-mariana` | *(título no seed)* | B9 | trilha | sim | não |
| `doc-trilha-transporte-mariana` | Consulta — registro de transporte… | B9 | trilha | sim | não |
| `doc-trilha-fisica-mariana` | Relatório institucional — últimos deslocamentos… | B9 | handler trail | sim | não |
| `doc-outros-desaparecimentos` | Resultado de busca — outros desaparecimentos… | B9 | busca | sim | não |

**`playerFacing: false` (sem toast de documento):**  
`doc-elisa-alibi`, `doc-elisa-testemunha-queda`, `doc-mariana-contact-chronology`, `doc-phone-file-dependencies`, `doc-emergency-reassessment`, `doc-morsa-duration-note`, `doc-memory-onset-chronology`, `doc-diario-releitura-omitido`, `doc-omitido-assistencia`, `doc-mensagens-impossiveis`, `doc-anomalias-augusto` (+ quaisquer outros marcados no seed).

**Total docs notificáveis:** **53**.

---

## 5.3 Locais (`kind: location`)

Toast quando status passa de `unknown` para status mapeado **e** o local tem `mapX`/`mapY`.

| ID | Texto | Bloco tip. | Auto | Clique |
|---|---|---|---|---|
| `hospital` | Hospital Municipal | B1 | sim | Abrir o mapa |
| `vertice` | Boate Vértice | B2 | sim | Abrir o mapa |
| `universidade` | Universidade — Campus Central | B2 | sim | Abrir o mapa |
| `titan` | Titã Club | B3/B5 | sim | Abrir o mapa |
| `radio` | Rádio Costeira FM | B3 | sim | Abrir o mapa |
| `samuel-casa` | Rua das Acácias, 118 | B4 | sim | Abrir o mapa |
| `presidio` | Unidade prisional — visita | B4 | sim | Abrir o mapa |
| `jana-casa` | Rua do Sol, 47 | B5 | sim | Abrir o mapa |
| `geraldo-casa` | Travessa das Palmeiras, 9 | B6 | sim | Abrir o mapa |
| `galpao-17` | Galpão 17 — Pátio Norte | B6 | sim | Abrir o mapa |
| `detencao-miro` | Detenção — sala de entrevista | B6 | sim | Abrir o mapa |
| `sandra-casa` | Rua das Hortênsias, 212 | B7 | sim | Abrir o mapa |
| `cecilia-casa` | Alameda Nova, 88 — ap. 14 | B7 | sim | Abrir o mapa |
| `mauro-casa` | Rua do Cedro, 55 | B8 | sim | Abrir o mapa |
| `oficina-denis` | Oficina Dênis — pátio | B8 | sim | Abrir o mapa |
| `bia-casa` | Travessa Leste, 19 | B8 | sim | Abrir o mapa |
| `rui-casa` | Rua das Figueiras, 301 | B8 | sim | Abrir o mapa |
| `trilha-final` | *(seedLocations)* | B9 | sim | Abrir o mapa |

`delegacia` começa conhecida → sem toast de unlock típico.

**~18** locais com potencial de toast.

---

## 5.4 Contatos (`kind: contact`)

| ID | Texto | Já unlocked? | Toast? |
|---|---|---|---|
| `contact-camila` | Camila | sim (start) | não na abertura |
| `contact-julia` | Júlia Martins | não | sim no 1º unlock |
| `contact-rafael` | Rafael | não | sim (fim B1 trigger) |
| `contact-paula` | Paula | não | sim |
| `contact-nico` | Nicolas “Nico” | não | sim (ficha Nico) |
| `contact-livia` | Rádio Costeira FM — redação | não | sim |
| `contact-presidio` | Unidade prisional — setor de visitas | não | sim |
| `contact-mariana-augusto` | Mariana | não | se desbloqueado |

**~7** toasts de contato no playthrough típico.

---

## 5.5 Objetivos (`kind: objective`)

Cada `addTask` (e o primeiro task fresco de `replaceTasks`) gera Notice «NOVO OBJETIVO» com o **label** da task.

Há **~70–80** labels distintos no código (seedTasks + handlers B1–B9).  
Completar task (`completeTask`) é **silencioso** (só some do notepad).

Exemplos: «Revisar ocorrência inicial», «Ouvir ligação de emergência», «Determinar como a chamada foi realizada», «Revisar as peças que sustentaram a condenação de André», …

---

## 5.6 Contradições (`kind: contradiction`)

| ID | Texto UI | Summary | Bloco | Auto | Clique |
|---|---|---|---|---|---|
| `contra_selective_memory` | CONTRADIÇÃO REGISTRADA | Os lapsos de Mariana parecem seletivos. | B1 | sim | Ver no caderno |
| `contra_vertice_clock` | CONTRADIÇÃO REGISTRADA | Cronologia dos autos / cabine não confiável | B3 | sim | Ver no caderno |
| `contra_andre_night_hours` | CONTRADIÇÃO REGISTRADA | Horários do número sem nome × ligações autorizadas | B4 | sim | Ver no caderno |

Disparo: `runStoryEngine` → `detectContradictions` quando ambas evidências estão owned.

**Nota:** `contra_andre_night_hours` também dispara `addEvidence andre_contact_chronology_mismatch` → **EvidenceCard extra** na mesma detecção.

---

## 5.7 Mensagens / apps

| ID discovery | Texto | Trigger | Auto |
|---|---|---|---|
| `app:hidden-diary` | Aplicativo oculto restaurado | `installApp` hidden-diary (perícia / laudo) | sim |

Provocations: **0** no catálogo.

---

## 5.8 Achievements (sem discovery toast)

15 conquistas em `seedAchievements.ts` — só tela de histórico. **Não** entram na contagem de toasts.

---

## 5.9 Totais DiscoveryHost

| Categoria | ≈ instâncias únicas |
|---|---:|
| EvidenceCard / audio notice | ~146 |
| Document notice | 53 |
| Location notice | ~18 |
| Contact notice | ~7 |
| Objective notice | ~75 |
| Contradiction notice | 3 |
| Message (diary) | 1 |
| **Total** | **~300** |

---

# 6. Cascatas

## Cascata: registrar trecho final do BO

### Ação inicial
Registrar `b5` em `doc-bo-inicial`.

### Disparos DiscoveryHost
1. EvidenceCard `initial_police_report`
2–5. Document notices dos 4 docs anexos

### Origem
`registerInitialPoliceReport` → lote de actions.

### Total
**5** (1 bloqueante + 4 auto). Na tela: 1 depois 3.

---

## Cascata: `openDocument` com `onOpen` rico (padrão estrutural)

Exemplos no seed:

| Documento | onOpen gera (além do toast do próprio doc, se novo) |
|---|---|
| `doc-nico-cadastro` | evidence + unlockContact + addTask |
| `doc-maralto-clipping` / cadastros | evidence + contact/task |
| `doc-laudo-forense` | evidence + installApp path + tasks |
| `doc-elisa-jana` | evidence + unlockLocation + addTask |
| `doc-ricardo…` / Mauro | múltiplos evidence + location + task |

### Total típico
**3–5** feedbacks por abertura de ficha.

---

## Cascata: fim de entrevista / puzzle (handlers)

Seleção das maiores (contagem = actions que **podem** notificar; skips por already-owned reduzem em saves avançados):

| Handler / momento | ≈ notify-actions no lote |
|---|---:|
| `registerInitialPoliceReport` | 5 efetivos (1+4) |
| Entrevista Nico (B3) | 5 |
| Janus done | 4 |
| Saturnalia done / replaceTasks | 4 |
| André interview done | 5 |
| Emergency revisit (B5) | até 5 (3 docs se novos + 2 evidence; docs já owned no path normal → **2**) |
| Miro interview (lote grande) | 5 evidence (alguns hidden → menos toasts) |
| Ricardo/Henrique identity path | 6 |
| Mauro interview | 5 |
| Omitido named (B9) | 5 |
| Trail ready (B9) | 4 |

---

## Cascata: contradição automática

Ex.: memória seletiva — ao reunir 2 evidências:

1. Notice `contradiction`
2. (sem toast de hipótese, mas hipótese muda no caderno)
3. Em `contra_andre_night_hours`: **+** EvidenceCard do mismatch + flag Hex

---

## Cascata: análise provisória da emergência

`runProvisionalEmergencyAnalysis`:

1. EvidenceCard / audio `emergency_call_restored`
2. Objective `task_trace_emergency_call`
3. (+ notepad pulse)

**Total:** 2 discoveries + badge notepad.

---

# 7. Duplicidades semânticas

| Situação | Canais | Classificação |
|---|---|---|
| Registrar BO | EvidenceCard “BO…” + docs já listáveis na pasta + caderno | **DUPLICIDADE SEMÂNTICA** (evento × unlock de anexos × arquivo físico) |
| `openDocument` ficha cadastral | Toast DOCUMENTO + toast EVIDÊNCIA do mesmo fato + NOVO CONTATO + NOVO OBJETIVO “falar com X” | **DUPLICIDADE / cascata** |
| Unlock de local | Notice NOVO LOCAL + pino no mapa + CTA “Abrir o mapa” | leve; mapa já comunica |
| `addTask` | Notice NOVO OBJETIVO + pulse do notepad + linha no notepad | **DUPLICIDADE** (3 canais) |
| Áudio novo | Notice NOVO ÁUDIO + badge na bancada + CTA bancada | duplicidade leve |
| Contradição | Notice + entrada no caderno + (às vezes) evidence extra | média |
| Hidden diary | Message toast + ícone novo no launcher | aceitável / dual channel |
| Achievement unlock | Silencioso + histórico | sem duplicidade toast |
| Hipótese nova | Só caderno (sem toast) | sem toast — ok |

---

# 8. Densidade por bloco

Contagens **aproximadas** de events DiscoveryHost tipicamente disparados naquele bloco (não inclui re-toasts impossíveis por idempotência). Achievements = 0 popups.

| Bloco | Auto (notices) | Bloqueantes (EvidenceCard) | Achievements popup | Total ≈ |
|---|---:|---:|---:|---:|
| B1 | alta (docs BO, contacts, objectives, contradiction, áudios) | média | 0 | **35–45** |
| B2 | média | média | 0 | **25–35** |
| B3 | alta (muitas evidences + locations + tasks) | alta | 0 | **40–55** |
| B4 | alta (André, Hex áudios, diário) | alta (Hex batch) | 0 | **40–50** |
| B5 | média-alta (autos, Jana, path) | média | 0 | **30–40** |
| B6 | alta (Valter, Miro lote) | alta | 0 | **35–45** |
| B7 | muito alta (Ricardo/Henrique chain) | alta | 0 | **45–60** |
| B8 | alta (guardrail → Rui) | alta | 0 | **35–45** |
| B9 | média-alta (Omitido, trilha, morte) | média | 0 | **30–40** |
| Global/UI | wa-toast, badges, hints | MemoryWord overlay | menu only | n/a |

### Top 10 ações que mais geram notificações

1. **Registrar BO** — 5 discoveries  
2. **openDocument** ficha com onOpen triplo (Nico/Jana/Mauro/laudo) — 3–5  
3. **Entrevista André (B4)** — ~5  
4. **Path Ricardo→Henrique (B7)** — até 6 num único handler  
5. **Entrevista Miro (lote)** — até 5 evidence (menos se hidden)  
6. **Entrevista Mauro** — ~5  
7. **Omitido named** — ~5  
8. **Saturnalia / Janus done** — 4  
9. **Trail ready** — 4  
10. **Contradição André night hours** — contradiction + evidence (+ hex flag)

---

# 9. Regras globais que causam excesso

1. **`addEvidence` ⇒ sempre discovery** (exceto `catalogHidden`).  
2. **`addDocument` ⇒ sempre discovery** (exceto `playerFacing:false`).  
3. **`addTask` ⇒ sempre discovery** (objetivo).  
4. **`unlockLocation` / `unlockContact` ⇒ discovery** na primeira transição.  
5. **Handlers empilham 3–7 dessas actions** no mesmo `dispatchActions`.  
6. **`openDocument` = addDocument + onOpen** no mesmo commit.  
7. **Evidence bloqueia a fila** → backlog de notices parece “rajada” ao fechar o cartão.  
8. **Stack de 3 notices** intensifica a sensação de spam.  
9. **Não há agregação** de documentos (áudio sim agrega “Novos áudios na bancada”).  
10. **`discoveries` persistem no save** — load pode reapresentar fila não dismissada.  
11. Checkpoints DEV limpam discoveries (`devApply` preserva fila anterior), mas load normal **não**.  
12. `addHypothesis` **não** notifica (assimetria vs evidence/task).

---

# 10. Pontos candidatos à redução

*(somente classificação — sem redesign)*

### Provavelmente remover / silenciar
- Toast de **documento** quando o jogador **acabou de abrir** o próprio documento.
- Toast de **objetivo** quando o notepad já pulsa / lista a pendência.
- Segundo/terceiro/quarto toast de anexos do BO (ou agregar).
- EvidenceCard para evidências que são só eco do documento acabado de registrar.

### Provavelmente agregar
- Lotes de `addDocument` no mesmo dispatch → 1 notice “N documentos adicionados à pasta”.
- Lotes de `addEvidence` não-áudio → 1 cartão / 1 notice.
- onOpen de fichas: 1 notice composto (“Ficha + contato + visita”).

### Provavelmente manter
- Location unlock com CTA mapa (alta utilidade).
- Contradiction notice (evento raro, alto sinal).
- Audio notice com CTA bancada (com agregação já existente).
- Hidden diary message (evento único).
- Badges de mesa / unread WhatsApp.
- MemoryWord overlay (cena, não toast).

### Necessita decisão
- EvidenceCard bloqueante vs notice auto para *todas* as evidências.
- Se `catalogHidden` deveria crescer para “detalhes de entrevista”.
- Se achievements merecem 1 toast curto ou continuam só no menu.
- Persistência de `discoveries` no save (limpar na serialização?).
- Revisit B5 que re-`addDocument` docs já owned (hoje idempotente — ok).

---

## Classificação conceitual rápida

| Canal | Evento real | Unlock UI | Progresso interno | Redundante |
|---|---|---|---|---|
| EvidenceCard | frequentemente | às vezes | sim | alto se eco de doc |
| Document notice | às vezes | sim | sim | alto se openDocument |
| Location/contact | sim | sim | — | baixo–médio |
| Objective | — | — | sim | alto c/ notepad |
| Contradiction | sim | — | sim | baixo |
| Hub badge | sim | sim | — | baixo |
| WA toast | — | UX lock | — | n/a |
| Achievement | meta | — | sim | n/a (sem toast) |

---

## Save / Load

- `discoveries` é campo do `InvestigationState` e **é salvo**.
- Load restaura a fila → toasts antigos **podem reaparecer**.
- `toastQueue` legado é limpo na migração.
- UI efêmera (painel aberto, phone) **não** é salva (ok).

---

## Casebook / Computer / Audio / Mapa / iPhone (síntese)

| Área | Notifica via DiscoveryHost? | Outro feedback |
|---|---|---|
| Casebook pessoas/hipóteses | hipóteses não; pessoas não | lista atualiza |
| Casebook evidence | sim (na aquisição) | lista |
| Casebook contradiction | sim | lista |
| Computer search hit | ao **abrir** doc | lista de resultados |
| Autos extract | `addEvidence` → card | highlight no doc |
| Audio lab conclusion | `addEvidence` / audio | badge bancada |
| Mapa unlock | location notice | pino |
| WhatsApp msg | geralmente silencioso + unread | wa-toast só locks |
| App install | só hidden-diary | ícone launcher |

---

*Fim da auditoria. Nenhuma alteração de produção foi feita além deste arquivo.*
