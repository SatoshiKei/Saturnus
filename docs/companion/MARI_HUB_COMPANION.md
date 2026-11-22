# Mari — companion (bancada + hub)

Assistente **Mari** (≠ Mariana Silva). Backlog de falas + estratégia de integração.

| Runtime hoje | Lacuna |
|--------------|--------|
| Abertura VN + hub B1 (`hub-welcome` + 4 beats) | Hub cotidiano B2–B9 (raro) |
| `mariPuzzleHints.ts` + `MariWorkbenchHints` em P01–P12 | Playtest de gatilhos / soft-lock |
| `mariCompanion.ts`, `MariCompanionHost.tsx` | — |

---

## Propósito (o combinado)

### Primário — dicas na Bancada

Durante cada um dos **12 puzzles**, a Mari faz **2 a 3 comentários** enquanto Augusto está na sessão forense.

- Objetivo: o jogador **saber o que tentar a seguir** naquele puzzle (orientação de procedimento / percepção), sem virar walkthrough de clique.
- Tom: colega que já viu perícia estranha na mesma ferramenta — “começa pelo ruído de fundo”, “compara as duas janelas”, “isso aqui não fecha se o horário não bater”.
- **Pode** apontar **modo de trabalho** (espectrograma vs waveform, comparar fontes, timeline, ordem dos clipes). **Não** deve entregar solução literal (frequência exata, PIN, sequência final, nome do suspeito).
- Disparo sugerido por puzzle: **(1)** abertura da sessão, **(2)** após tempo ou primeiro progresso parcial, **(3)** se o jogador estiver parado / segunda tentativa (anti-softlock leve).
- Referência técnica (só dev): `docs/puzzles/puzzleNN_tutorial.txt` → traduzir para voz da Mari, não copiar UI.

### Secundário — cotidiano no hub

Entre puzzles e entre idas ao mapa/telefone: beats **curtos no hub livre** (pasta, café, Siqueira, rotina da delegacia).

- Objetivo: **personagem** + fazer a presença dela na bancada parecer **natural por contraste** (antes ela existia como gente da casa; na perícia ela fica séria e útil).
- Frequência: **espaçado** — não competir com as 2–3 dicas por puzzle.
- O `hub-welcome` atual e os beats B1 abaixo entram aqui.

### Regras de fronteira

| Pode (dica na bancada) | Evitar |
|------------------------|--------|
| Próximo passo de **método** forense | “Clique em X”, “meta”, flag, ID de evidência |
| O que a ferramenta **costuma** exigir neste tipo de material | Resposta final do puzzle |
| Tom de colega no mesmo ambiente | Duplicar texto de `task_*` ou reflexão de Augusto |

Pendências do caderno continuam na voz de Augusto; Mari **não** substitui notificações de descoberta.

---

## Onde aparece (alvo de implementação)

| Contexto | UI | Status |
|----------|-----|--------|
| Abertura B1 | VN `openingSceneBeats.ts` | ✅ |
| Hub livre (mesa, sem painel/phone) | `MariCompanionHost` overlay ADV | ✅ parcial |
| **Bancada forense** (Audio Lab → `ForensicWorkbench` / P10 `RingsSession`) | `MariWorkbenchHints` — balão canto, `data-testid=mari-workbench-hint` | ✅ |
| VN / reflexão / telefone aberto | Silêncio | ✅ |

**Nota:** o piloto (`a61193b`) testou só hub **sem** beats de puzzle — alinhado a “secundário primeiro”, não ao desenho completo.

---

## Contrato de dados (proposta)

Separar dois catálogos (mesmo `speaker: Mari`):

### A) `MARI_PUZZLE_HINTS[]` (novo)

```ts
{
  puzzleId: 'puzzle-01-cassini' // alinhado a forensic session
  hints: [
    { id: 'p01-h1', trigger: 'session_open', seenFlag: 'mari_p01_h1_seen', lines: [...] },
    { id: 'p01-h2', trigger: 'progress_partial' | 'idle_90s', ... },
    { id: 'p01-h3', trigger: 'idle_late' | 'before_complete', ... },
  ]
}
```

`trigger` lê estado da sessão (`ForensicWorkbench` / mix layers / completion registry), não narrativa global.

### B) `MARI_COMPANION_BEATS[]` (existente)

Hub cotidiano: `requireFlags` / `blockIfFlags` / `seenFlag` como hoje.

---

## Dicas por puzzle (primário) — implementado

**Fonte canônica de copy:** `src/data/companion/mariPuzzleHints.ts`  
**Runtime:** `MariWorkbenchHints` (`ForensicWorkbench` + `RingsSession` para P10).  
**Flags:** `mari_pNN_hN_seen` ao fechar o balão (“Entendi”).

| puzzleId | h1 | h2 | h3 |
|----------|----|----|-----|
| `puzzle-01-cassini` … `puzzle-09-cassini-huygens` | abertura (~0,8 s) | progresso / ~35 s | idle / atividade |
| `puzzle-10-rings` | idem | idem | — (2 dicas) |
| `puzzle-11-saturn-rotation`, `puzzle-12-memory` | idem | idem | — (2 dicas) |

Escalada em código: `nextMariPuzzleHintTier()` — h1 imediato; h2 após `activityCount` ou tempo; h3 após idle longo (quando existir).

---

## Backlog — hub cotidiano (secundário)

### Implementado

| id | seenFlag | Texto |
|----|----------|-------|
| `hub-welcome` | `mari_hub_welcome_seen` | Pasta, fixo, “me chama” |

### Bloco 1 — em `mariCompanion.ts`

**1. `hub-b01-after-bo`** — `mari_hub_b01_bo_seen` · requer `block01_bo_registered`

<!-- REFATORAÇÃO INÍCIO -->
**Mari:** O registro subiu pro sistema. Quando o Siqueira pegava ocorrência assim de madrugada, a primeira coisa que ele pedia era saber quem tinha mexido no horário antes de bater o ponto.

**Augusto:** E aqui?

**Mari:** Aqui o papel já chegou carimbado. O resto está no que sobrou do aparelho.
<!-- REFATORAÇÃO FIM -->

**2. `hub-b01-after-emg`** — `mari_hub_b01_emg_seen` · pós ouvir/mexer na emergência

<!-- REFATORAÇÃO INÍCIO -->
**Mari:** A linha da central pega um chiado feio quando entra sinal fraco. Não é o primeiro áudio que chega parecendo que alguém falou dentro de um corredor de vento.

**Augusto:** Mesmo assim tem voz ali.

**Mari:** Tem. Só exige paciência de quem não desliga na metade.
<!-- REFATORAÇÃO FIM -->

**3. `hub-b01-after-phone`** — `mari_hub_b01_phone_seen` · após celular Mariana no B1

<!-- REFATORAÇÃO INÍCIO -->
**Mari:** Celular de plantonista costuma ter meia dúzia de conversa picada e lembrete de troca de turno. Quando começa a faltar ponta solta, geralmente não é só distração.

**Augusto:** Vamos ver o que o hospital diz.
<!-- REFATORAÇÃO FIM -->

**4. `hub-b01-before-hospital`** — `mari_hub_b01_hospital_seen` · hospital no mapa, ¬ `block01_complete`

<!-- REFATORAÇÃO INÍCIO -->
**Mari:** No hospital o pessoal fala rápido entre uma porta e outra. Se for falar com eles, deixa o ritmo assentar antes de apertar o assunto.

**Augusto:** Certo. Tô saindo.
<!-- REFATORAÇÃO FIM -->

### Blocos 2–9 (cotidiano)

Poucos beats cada — só onde reforçar casa/personagem. Não obrigatório por bloco.

| id proposto | gatilho | Fala |
|-------------|---------|------|
| `hub-b02-…` | — | <!-- REFATORAÇÃO INÍCIO --><!-- REFATORAÇÃO FIM --> |

---

## Próximo

1. Playtest timing (h2/h3) em sessões longas.  
2. Hub B2–B9 só onde faltar respiro narrativo.  
3. Opcional: `dump:story-master` incluir hints da Mari.

---

## Critérios de aceite

- [x] Cada puzzle tem **2–3** dicas com escalada clara (orientar → refinar → destravar).  
- [x] Dicas são **procedimento/percepção**, não spoiler de solução.  
- [ ] Hub cotidiano **não** repete o que a Mari já disse na abertura ou na bancada do mesmo marco (validar em jogo).  
- [x] Voz alinhada a `docs/gameplay/CHARACTER_VOICES.md` § Mari.

---

## Referências

- Voz: `docs/gameplay/CHARACTER_VOICES.md`  
- Puzzles (dev): `docs/puzzles/puzzleNN_tutorial.txt`  
- Código: `mariPuzzleHints.ts`, `MariWorkbenchHints.tsx`, `mariCompanion.ts`, `MariCompanionHost.tsx`