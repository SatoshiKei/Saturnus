# Mari — auditoria de dicas na Bancada (P01–P12)

Revisão **autoritativa** contra `docs/puzzles/PUZZLES_MASTER.md`.  
**Runtime:** `mariPuzzleHints.ts` (copy) · `mariPuzzleProgressHints.ts` (marcos) · `MariWorkbenchHints.tsx`.

Cada hint é julgada por:

1. **Correção técnica** — método alinhado ao puzzle real  
2. **Timing da fase** — tier na etapa certa, não antes/depois  
3. **Quanto entrega da solução** — método sim; valor narrativo / resposta final não

**Princípio mestre**

> Mari pode revelar o **próximo método**; nunca a **razão narrativa** pela qual aquele método vai dar certo.

- Pode: “compare estes tipos de fonte” — não: “porque os relógios discordam” (+07:30).  
- Pode: “procure material derivado” — não: “porque alguém usou arquivo que só existiu depois”.  
- Pode: “olhe o fundo do rádio” — não: “é a VTR-14”.

---

## Estado do runtime (tempo vs marco)

Hoje: h1 ~0,8 s após abrir; h2 após 1 interação **ou** 35 s; h3 após idle 50 s **ou** 4 interações **ou** 100 s.

**Antes:** cronômetro + `activityCount`. **Agora (código):** marcos em `mariPuzzleProgressHints.ts`; fallback só após ~120 s / ~180 s + idle.

**Diretriz (implementação futura)** — **não** resolver só com `activityCount >= 3 && sessionOpenSec >= 90`:

| Tier | Ancorar em marco real (exemplos) |
|------|----------------------------------|
| h2 | 1º fragmento P01; Structure aberta P02; compare ativo P04; logger consultado P05; 2+ spectrograms P06; findSimilar P08; stream A reconstruído P09; fingerprint áudio P10; passagem consultada P11; 1º match P12 |
| h3 | último fragmento locked P01; pós-Rebuild P02; processamento sem play P03; alignment salvo P04; sequência montada P05; 5+ UNKs vistos P06; canal B ouvido P07; common pattern P08; SSRC B ordenado P09; rota ok P10; CAD aberto P11; várias proveniências P12 |

Cooldown sugerido: 20–45 s após dispensar hN antes de h(N+1).

---

## Resumo — avaliação pós-PUZZLES_MASTER

| Puzzle | Avaliação | O que mudou nesta revisão |
|--------|-----------|---------------------------|
| P01 Cassini | **Boa** | Copy alinhada à progressão Center → Reduction → Profile+Spectral; implementada |
| P02 Iapetus | **Boa** (ajuste) | h1 estrutural antes de áudio; h2 Structure; h3 pós-Rebuild ~22 s |
| P03 Anéis | **Quase boa** | Speech-recovery; **h3** corrige ordem Play ↔ Recovered Speech |
| P04 Janus | **Boa** | Compare → align → save → timing; h2/h3 só após marcos reais (pendente código) |
| P05 Saturnalia | **Mediana → corrigida** | h2 ensina **buffer circular / NEXT WRITE**, não ordenar só pelo ouvido |
| P06 Hexágono | **Boa** | Espectrograma + ordem; sem PIN / “fora da bancada” |
| P07 Luas pastoras | **Boa** | h3 **não** manda cruzar tabela — só anotar G17N/horário |
| P08 Enceladus | **Boa** | Mantida; amarrar gatilhos a ciclo / similar / pattern / difference |
| P09 Cassini-Huygens | **Boa** | h3: **reconstruir de novo** após ordenar pacotes |
| P10 Ordem dos anéis | **Reescrita** | Áudio → vídeo → rota → DVR/storage; **não** “relógios errados”; +h3 |
| P11 Rotação | **Reescrita moderada** | Passagem → CAD → rádio + AVL; **sem** VTR-14; +h3 |
| P12 MEMÓRIA | **Revisão forte** | Sem spoil de “já existia no caso” / dependência temporal; +h3 derived genérico |

### Prontidão da copy (runtime)

| Status | Puzzles |
|--------|---------|
| Praticamente prontos | P01, P04, P08 |
| Ajustes pequenos (feitos no `.ts`) | P02, P03, P06, P09 |
| Reescrita aplicada | P05, P07, P10, P11 |
| Revisão obrigatória aplicada | P12 |

---

## Copy canônica (bancada) — `mariPuzzleHints.ts`

Texto abaixo = **fonte aprovada** para playtest. IDs e `seenFlag` estáveis.

### P01 — Divisão de Cassini

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Esse áudio da central parece mastigado. Antes de desistir, abre o espectro e vê onde o sinal mais apita — costuma ser o lugar de começar o recorte. |
| h2 | ≥1 fragmento OU reduction ativo | Achou a frequência, mas a voz ainda engasga? Aprofunda o notch devagar e dá play de novo em cima do trecho — aqui o ouvido cobra o que o gráfico prometeu. |
| h3 | ≥4 fragments, último locked | Se só falta o final, o truque não é mais notch: marca um pedacinho sem fala, captura o perfil de ruído e só então passa a redução espectral — e ouve de novo, senão não conta. |

### P02 — Iapetus

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Esse corte tá limpo demais pra parecer o fim da gravação. Eu olharia o arquivo antes de tentar limpar o áudio. |
| h2 | Structure aberta | Tem uma página quebrando a sequência. Se o container perdeu a ordem, remontar vem antes de qualquer outra análise. |
| h3 | pós-Rebuild | Agora não para onde o áudio parava antes. Joga o playhead pra depois do corte e escuta o que voltou. |

### P03 — Anéis (`speech-recovery`)

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Tem uma voz de homem enterrada aí no meio da pista. Antes de tentar entender o que ele fala, acha onde ela aparece. |
| h2 | região alvo localizada | Pra limpar isso, pega um trecho em que tenha praticamente só a música. Perfil contaminado pela própria voz vai piorar justamente o que você quer recuperar. |
| h3 | processamento ok, sem recovered | A voz já começou a sair. Agora passa o play em cima desse trecho; a bancada só registra fala recuperada enquanto você realmente escuta. |

**Nota:** h3 **não** pode dizer “quando desbloquear, dá play” — Play é **condição** do registro (master).

### P04 — Janus e Epimetheus

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Duas gravações da mesma noite e cada relógio cantando uma hora diferente? Puxa os dois áudios na mesma régua pra ver onde eles se encostam. |
| h2 | Compare ativo | Vai ajustando o alinhamento até o pico bater direitinho. Quando ficar certinho, salva o estado antes de mexer na referência de tempo. |
| h3 | alignment salvo | Só alinhar o som não converte a hora do registro pro relógio de fora. Aplica o deslocamento de referência no tempo depois de salvar o alinhamento. |

**Proibido:** revelar +07:30 ou offset numérico.

### P05 — Saturnalia

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Dez slots e um log de buffer. Antes de ficar tentando adivinhar a história pelo número do arquivo, vê como esse gravador estava escrevendo. |
| h2 | `RC_LOGGER_BUFFER` aberto | Buffer circular cheio não começa necessariamente no slot zero. O próximo lugar de escrita também te diz onde está o conteúdo mais antigo que ainda sobrou. |
| h3 | sequência montada | Se acha que fechou, monta tudo e roda a continuidade. O ouvido ajuda a montar; a sequência inteira é que confirma. |

**Proibido:** dizer “começa no 06” ou ordem cronológica explícita.

### P06 — Hexágono

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Esses seis arquivos não parecem dizer muita coisa no ouvido. Abre um deles no espectrograma. |
| h2 | ≥2 espectrogramas vistos | Compara o desenho, não a frequência exata. Tem formas simples se repetindo de arquivo pra arquivo. |
| h3 | quase todos examinados | Guarda uma leitura pra cada arquivo e não perde a ordem original. Se trocar duas posições agora, qualquer coisa que você montar depois nasce errada. |

**Proibido:** algarismo romano, 481526, PIN, diário.

### P07 — Luas pastoras

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Tem duas faixas gritando e alguma coisa bem mais fraca presa no meio. Waterfall primeiro. |
| h2 | banda central selecionada | Isola o que tá no meio sem trazer as duas laterais junto. Se a largura pegar demais, você só reconstrói o barulho que já ouvia. |
| h3 | canal B recuperado | Se saiu código ou horário daí, anota. Não tenta arrancar endereço de um áudio que nunca teve endereço. |

Cruzamento **doc-tabela-logistica-g17n** = investigação pós-bancada, não Mari.

### P08 — Enceladus

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | ciclo selecionado | Parece repetição de máquina de hospital no looping infinito, né? Marca um ciclo inteiro na linha do tempo e manda procurar regiões parecidas pra ver quem foge do padrão. |
| h2 | find similar executado | Empilha e compara as regiões que ele achou pra ver qual delas destoa do resto. Monta o padrão comum usando só os ciclos normais — se meter o diferente no meio, estraga a base. |
| h3 | common pattern pronto | Agora é tirar a média do que se repete de cima do ciclo esquisito pra ver o que sobra. Quando o residual destacar a voz, dá o play em cima e ouve o que tava escondido. |

**Proibido:** ciclo 6, “Ricardo”.

### P09 — Cassini-Huygens

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Tem mais de um fluxo nessa captura. Separa um SSRC primeiro e prova que consegue reconstruí-lo antes de mexer no outro. |
| h2 | stream A reconstruído | Esse segundo não parece corrompido; parece fora de ordem. Antes de culpar o codec, olha a sequência dos pacotes. |
| h3 | sequence ordenada | Ordenar a tabela não conserta o áudio que você já gerou. Reconstrói o stream de novo usando essa ordem. |

### P10 — Ordem dos anéis (`RingsSession`)

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | fase mídia aberta | Tem fonte demais aqui. Começa procurando um evento que apareça em duas gravações diferentes. Som ambiente costuma ser melhor âncora que rosto. |
| h2 | fingerprint áudio ok | Se essas duas fontes dividem o mesmo momento, procura uma segunda marca no vídeo. Um padrão de luz ou quadro pode colocar outra câmera na mesma sequência. |
| h3 | rota / câmeras avançando | Se a rota chega numa câmera e o catálogo pula justamente aquele trecho, não assume que nunca foi gravado. Confere a estrutura e depois o armazenamento bruto. |

**Proibido:** André, Morsa = fulano, “relógios errados” como tema central.

### P11 — Rotação de Saturno

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | Rui não lembra prefixo nem placa. O trem, pelo menos, não depende da memória dele. Começa pela passagem e pela janela em que ela ficou fechada. |
| h2 | passagem identificada | Ele disse que a abordagem acabou quando entrou uma urgência no rádio. Procura no CAD o que aconteceu logo depois daquela janela; não espera que o despacho te dê a viatura pronta. |
| h3 | múltiplos candidatos | Se ainda sobrou mais de uma equipe, usa duas coisas independentes: o fundo do rádio pode colocar uma viatura perto do trem, e o AVL diz pra onde ela realmente foi. |

**Proibido:** VTR-14, Augusto, nome do condutor.

### P12 — MEMÓRIA

| Tier | Gatilho sugerido | Fala |
|------|------------------|------|
| h1 | sessão aberta | A voz parece contínua, mas o ambiente não. Escolhe um pedaço curto e trata como se fosse uma evidência separada. |
| h2 | 1º match forte | Um hit forte num trecho curto vale mais que tentar comparar a mensagem inteira. Confirma a proveniência antes de passar pro próximo. |
| h3 | várias fontes, última travada | Não limita a busca ao material que chegou pronto ao caso. A bancada também gerou arquivos durante a investigação. |

**Proibido:** explicar impossibilidade temporal, região D = Cassini derived, “cada pedaço já existia”, MEMÓRIA como resposta.

---

## Backlog de implementação (gatilhos)

| Item | Status |
|------|--------|
| `mariPuzzleProgressHints.ts` + marcos P01–P12 | ✅ |
| `forensicUiToMariProgress` na `ForensicWorkbench` | ✅ |
| `ringsProgress` no `RingsSession` (P10) | ✅ |
| Cooldown ~28 s após dismiss | ✅ |
| Telemetria playtest (`data-hint` + tempo) | pendente |
| Refinar marcos com playtest (falsos positivos) | pendente |

---

## Referências

| Artefato | Uso |
|----------|-----|
| `docs/puzzles/PUZZLES_MASTER.md` | Tutoriais e flags canônicas |
| `src/data/companion/mariPuzzleHints.ts` | Copy em runtime |
| `docs/companion/MARI_HUB_COMPANION.md` | Hub + critérios Mari |

Ao alterar puzzle no Master, revisar **esta tabela** e o pack correspondente no `.ts` (manter `id` / `seenFlag`).