# Fluxo de investigação (Blocos 1–4)

Saturnus é uma investigação policial feita **fisicamente**, com as ferramentas da mesa de Augusto. O jogo
nunca diz “contato disponível”, “entrevista desbloqueada” ou “clique para entrevistar”. O jogador encontra
informação (um telefone, um endereço, um nome em um documento) e **decide o que fazer com ela**.

## Princípios

1. Pessoas são alcançadas por **telefone**, **endereço → mapa → viagem** ou **ligação institucional → documento**.
2. Documentos entregam **pistas operacionais** (telefone, endereço, ramal), nunca interpretações.
3. Evidências, hipóteses e tarefas só contêm o que Augusto **justificadamente sabe** naquele ponto.
4. Conclusões e sentimento vão para o **Modo Reflexão** (Augusto sozinho), para documentos ou para hipóteses —
   nunca para a boca de uma testemunha.
5. Os estados finais dos Blocos 1–4 não mudaram; só mudou **como** o jogador chega a eles.

## Ferramentas da mesa

| Objeto | O que é | Fluxo |
|---|---|---|
| Computador (`monitor`) | Sistema de consulta | Consultas (Pessoas, Empresas, Veículos, Endereços), Ocorrências, Processos/Autos, Documentos, Perícia, Caso |
| Telefone fixo (`landline`) | Linha institucional | Ramais (Gabinete 100, Plantão 201, Cartório 204, Perícia 212, Arquivo 220, Hospital, Central), agenda com os números anotados (inclui o setor de visitas da unidade prisional), ligações recebidas |
| Celular de Augusto | Contatos e conversas reais | Contatos/Recentes, WhatsApp (conversas começam **vazias**; o jogador escreve) |
| Celular de Mariana | Aparelho apreendido | Apps comuns; os inertes não fazem nada (sem “BLOQUEADO”) |
| Mapa (`wall-map`) | Locais **conhecidos** | Endereço descoberto → pino + “NOVO LOCAL”; o jogador abre o mapa e escolhe ir |
| Bancada de áudio | Análise | Lista (mais novo primeiro), selo NOVO, filtros Todos/Novos/Em análise/Analisados |
| Caderno | Registro | Pessoas, Evidências, Locais, Cronologia, Hipóteses, Contradições (registradas sozinhas) |
| Pasta do caso | Documentos físicos | Só o que o jogador possui |

## Eventos de descoberta (`DiscoveryEvent`)

Fila central em `state.discoveries`, exibida por `DiscoveryHost`:

| Tipo | Feedback |
|---|---|
| `evidence` | Cartão de papel persistente (“EVIDÊNCIA ADQUIRIDA”, “Arquivada no caderno”, “Ver no caderno”, ×). Fica até ser fechado; entra na fila. |
| `contact` | Aviso “NOVO CONTATO”; o celular de Augusto vibra e ganha selo numérico; selo no ícone Telefone |
| `location` | Aviso “NOVO LOCAL” com “Abrir o mapa” |
| `audio` | Aviso “NOVO ÁUDIO” (vários viram um só: “Novos áudios na bancada · N arquivos”); selo na bancada |
| `document`, `objective`, `hypothesis`, `message` | Aviso curto |
| `contradiction` | “CONTRADIÇÃO REGISTRADA” com som próprio e atalho para o caderno |

Avisos curtos empilham (até 3). Cartões de evidência ficam sozinhos. A fila pausa durante cenas VN e durante a
cena das seis ligações (`fullscreenScene` em `uiStore`).

## Três modalidades de chegar a alguém

- **A — Telefone:** documento/nota registra o número → contato na agenda → ligação → (se couber) local no mapa.
  Ex.: Nico (cadastro → ligação → Titã).
- **B — Endereço → mapa → viagem:** ficha com endereço → local `visitAvailable` → mapa → “Ir até lá”.
  Ex.: Samuel (Rua das Acácias, 118).
- **C — Institucional → documento:** ligação a um setor → “Algumas horas depois…” → “Documento recebido”.
  Ex.: Cartório (cronologia do processo Elisa), Perícia (laudo).

## Rotas por pessoa

| Pessoa | Caminho |
|---|---|
| Paula | Nota “quarta” no celular de Mariana → contato novo → conversa vazia → jogador escreve (9 trocas) → Lucas |
| Lucas | “Lucas” na Consulta → Cadastro (`doc-lucas-cadastro`, endereço) → mapa (Universidade) → cena |
| Elisa / autos | “Elisa Duarte” (após Lucas) → Resumo + Testemunhas → Cartório (204) → Cronologia |
| Nico | Arquivo do Vértice → nome completo → Consulta → Cadastro com telefone → ligação → Titã |
| Lívia | Pesquisa Maralto → reportagem (Redação Rádio Costeira) → ligação → Rádio |
| Samuel | “Maralto”/“protesto” → Ocorrência + Relação de detidos → “Samuel” → Ficha com endereço → mapa |
| André | “André” → Registro de visitas (telefone do setor) → ligação → unidade prisional → visita |

## Cenas (VN) e transições

`SceneRunner` (`SceneTransitions.tsx`): fade → cabeçalho digitado (data / hora / lugar, 1–2 s, **pulável**,
respeita `prefers-reduced-motion`) → ambiência → cena → Reflexão opcional → fade para preto → retorno à mesa.
Nunca há corte seco para outra cena.

Cabeçalhos (`sceneIntros.ts`), por exemplo André: `04 NOV 2026` / `21:37` / `PENITENCIÁRIA ESTADUAL — SALA DE VISITAS`.

Modo Reflexão (`reflections.ts`): fundo escuro, sem sprites, NVL, 2–5 blocos de Augusto. Usado após Lucas, Nico,
Lívia, Samuel e André e na cena das seis ligações. Sai uma única vez por cena (`<id>_seen`).

## Contradições

Detectadas pelo motor (`engine.ts`) quando as duas evidências definidas em `contradictionDefs` estão no caderno.
Sem formulário de “confirmar contradição”.

## Cena das seis ligações e Puzzle 6

1. Contradição de horários de André (documentos `doc-andre-ligacoes` + `doc-numero-sem-nome`) → `block04_hex_call_pending`.
2. O fixo toca (som + selo). O jogador atende. Ninguém fala. Toca **um** áudio; a linha cai.
3. Pausa → Reflexão com outros telefones tocando ao fundo → seis gravações preservadas na bancada (6 selos NOVO).
4. **Hexágono:** o jogador inspeciona metadados e tags, encadeia **A → D → B → F → C → E → A**, começando pelo arquivo mais antigo.

| De → Para | Fragmento | Dígito |
|---|---|---|
| A → D | NO TELEFONE | 4 |
| D → B | HÁ | 8 |
| B → F | UM DIÁRIO | 1 |
| F → C | QUE | 5 |
| C → E | A TELA | 2 |
| E → A | OMITE | 6 |

Frase: **NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE**. PIN: **`481526`** — nunca aparece antes de o ciclo fechar e
nunca é preenchido sozinho. Dados: `src/data/block04/hexagonPuzzle.ts`.

5. Fixo → Perícia (212) → “Algumas horas depois…” → laudo no módulo **Perícia** do computador (o pacote
   `local.priv.journal` não aparece no launcher) → acesso forense → tela de PIN → o jogador digita `481526` →
   o diário abre dentro do terminal da delegacia. Não existe “mostrar apps ocultos”; o diário não está em nenhum fluxo normal.

## Hooks de SFX (`src/lib/sfx.ts`)

Sons sintetizados (Web Audio) **temporários**. Para trocar por arquivos licenciados, preencher `SFX_FILES`
(`'door': '/assets/sfx/door.ogg'`); o resto do código não muda. Não foram baixados assets externos.

`door, steps, paper, keyboard, chair, pickup, hangup, vibrate, msg-in, msg-out, call-out, evidence, document,
contact, location, objective, contradiction, audio-new, message, scene-in, scene-out, ambience-hush, fade, ui,
error, unlock` + loops `ring` / `landline` e `ambient-phones`.

## Save e migração

`STATE_VERSION = 2`. `migrateState` converte saves antigos (fila `discoveries` ausente, flags de diário antigo);
os estados narrativos (flags, evidências, pessoas, tarefas) são preservados.

## Como adicionar uma nova pista

1. Documento em `seedDocuments.ts` com `leads` (telefone / endereço / instituição) e `onOpen` (ação de contato ou local).
2. Regra em `seedSearchRules` que devolve `documentId`.
3. Se for ligação: `callScripts` em `calls.ts` (`onComplete` libera o local ou entrega o documento).
4. Nenhum texto de interface pode afirmar que uma pessoa “está disponível”.

## Testes

- `npm test` — regras de história (`tests/unit/block0XStory.test.ts`, `storyEngine`, `investigationStore`).
- `npm run test:e2e` — `block01…04` (fluxos por ferramentas), `diary` (15 checagens), `ui` (cartões, bancada, caderno,
  transições, celulares), `screenshots` (capturas em `docs/assets/transversal-review/`).
