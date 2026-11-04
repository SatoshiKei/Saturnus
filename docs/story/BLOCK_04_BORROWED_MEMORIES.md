# Bloco 4 — Memórias que não pertencem

Implementação a partir do estado final real do Bloco 3 (`BLOCK_03_OUT_OF_ORDER_NIGHTS.md`). Fluxo completo e
ferramentas: `docs/gameplay/INVESTIGATION_FLOW.md`. Vozes: `docs/gameplay/CHARACTER_VOICES.md`.

## Entrada e saída

| | |
|---|---|
| **Entrada** | `block03_complete`, `task_identify_morsa`, Morsa apelido sem identidade, Samuel `identified`, linhas Elisa×Maralto sem vínculo. |
| **Saída** | `block04_complete`, pendência **`task_press_nico`**, hipótese de interferência na memória ativa (não confirmada), interlocutor desconhecido sem identidade. |

Os estados finais não mudaram na revisão transversal; só o caminho até eles.

## Fluxo real (ferramentas)

1. **Samuel** — Consulta “Maralto”/“protesto” → `doc-protesto-ocorrencia` + `doc-protesto-detidos` → Consulta “Samuel” →
   `doc-samuel-ficha` (endereço) → local `samuel-casa` (`visitAvailable`) → o jogador abre o mapa e viaja. Cena + Reflexão.
2. **André** — Consulta “André” → `doc-andre-ficha` / `doc-andre-visitas` (registro de visitas, telefone do setor) →
   ligação `call-presidio-visit` → local `presidio` → mapa → cena (fundo `prison-01-visit-room.jpg`) + Reflexão.
3. **Cronologia** — `doc-andre-ligacoes` + `doc-numero-sem-nome` → contradição automática
   (`contra_andre_night_hours`, “CONTRADIÇÃO REGISTRADA”) → `block04_hex_call_pending`.
4. **Seis ligações** — o fixo toca; o jogador atende; ninguém fala; Reflexão; seis áudios na bancada (selo NOVO).
5. **Puzzle 6 (Hexágono)** — ver abaixo.
6. **Perícia** — fixo → ramal 212 (`call-pericia-device`) → laudo (`doc-laudo-forense`, módulo Perícia) →
   `block04_forensics_access` → tela de PIN → o jogador digita **`481526`** → diário.

## Cenas

| Cena | Componente | Background | Intro |
|------|------------|------------|-------|
| Samuel | `SamuelInterviewScene.tsx` | `apartment-01-living-room` | cabeçalho digitado + fade |
| André (prisão) | `AndreInterviewScene.tsx` | `prison-01-visit-room` | `04 NOV 2026` / `21:37` / `PENITENCIÁRIA ESTADUAL — SALA DE VISITAS` |
| Seis ligações | `HexCallScene.tsx` | escurecido (Reflexão) | cena em tela cheia (pausa a fila de descobertas) |

Saída: fade para preto → Reflexão (`refl-samuel`, `refl-andre`, `refl-hex-call`) → retorno à mesa.

## Personagens

- **Samuel** — participou dos protestos, mas não do núcleo; detido dias depois por resistir à polícia; confirma que
  Morsa existiu; **não entrega pessoas**; contou que Mariana perguntou horários.
- **André** — preso, defensivo, desconfiado; sem reação a “Morsa”; confirma mudança de Mariana e pedido para parar.
- **Contato desconhecido** — só via áudio; sem nome.

## Pesquisas (computador)

Todas retornam registros/documentos, nunca “pessoa contatável”. Regras em `seedSearchRules`
(`documentId`); sem botão “Entrevistar”.

## Puzzle 6 — Hexágono

- **Ciclo:** A → D → B → F → C → E → A, começando pelo arquivo mais antigo. O jogador encadeia pelo grafo de metadados.
- **Frase:** `NO TELEFONE HÁ UM DIÁRIO QUE A TELA OMITE`
- **PIN do diário:** `481526`

| De → Para | Fragmento | Dígito |
|-----------|-----------|--------|
| A → D | NO TELEFONE | 4 |
| D → B | HÁ | 8 |
| B → F | UM DIÁRIO | 1 |
| F → C | QUE | 5 |
| C → E | A TELA | 2 |
| E → A | OMITE | 6 |

Fragmento e dígito vêm do metadado/tag de cada arquivo (`HEX_NODES[].fragment/.digit`). Frase e PIN só aparecem
(`hex-phrase`, `hex-code`) depois de o ciclo fechar. Dados: `src/data/block04/hexagonPuzzle.ts`.
Áudios temporários: `public/assets/audio/hex-a.wav` … `hex-f.wav`.

## Perícia e diário

- O diário (`local.priv.journal`) não aparece no launcher, em Ajustes nem em Arquivos. Não existe “mostrar apps ocultos”.
- Laudo diz que o pacote “não é apresentado pelo launcher”; não lê a frase nem o PIN.
- Acesso → PIN vazio, sem preenchimento; PIN errado dá erro; PIN correto abre o diário dentro do terminal.
- Entrada “Gravar pra conferir” → `CHK_UNK` (gravação do desconhecido, `unknown-contact-call.wav`).
- Lógica: `tryDiaryPin` em `block04Handlers.ts`.

## Hipóteses (fim)

| ID | Estado |
|----|--------|
| `hyp_andre_manipulating` | enfraquecida |
| `hyp_julia_manipulating` | ativa, sem prova |
| `hyp_memory_interference` | nova, ativa (não confirmada) |
| `hyp_morsa_key` | ativa — “Morsa pode ser uma peça importante dos protestos” |
| Morsa identidade | aberta |

## Checkpoints DEV

`dev-b04-start` … `dev-b04-end` (painel DEV; usados pelos testes e2e).

## Testes

`tests/unit/block04Story.test.ts` (grafo, frase, PIN, gates), `tests/e2e/block04.spec.ts` (Samuel e André),
`tests/e2e/diary.spec.ts` (15 checagens do diário).

## Bloco 5 — entrada

`task_press_nico` — pressionar Nico sobre omissões da Noite X (jaqueta/Jana **sem revelar no B4**).

## Divergências conhecidas

- Áudios do Hexágono e SFX são temporários (sintetizados / WAV gerados por `scripts/generate-test-audio.mjs`).
- O fundo de Samuel reutiliza a sala de apartamento.
