# Trilha sugerida — cenas VN (inventário + desenho de produção)

Documento de **direção musical** para cenas já implementadas no Saturnus.  
**Fora do escopo:** reconstrução do apartamento 402 (`MariApartmentReconstructionScene`, áudio diegético Melodie).

**Fonte no código (nov/2026):** `sceneGalleryCatalog.ts`, `locationSceneRender.tsx`, `Block01Opening.tsx`, `reflections.ts`, `ReflectionView`.

**Natureza do doc:** briefing e busca de faixas — **não** é um pedido de uma faixa por linha da tabela. A implementação deve priorizar **poucos stems reutilizáveis** e variação por **mix** (volume, EQ, filtro, mutes), não por dezenas de masters diferentes.

---

## Princípios de produção (fechados)

| Princípio | O que fazer |
|-----------|-------------|
| **Voz e typewriter** | Trilha instrumental discreta; **ducking** durante digitação e picos de diálogo. Narração densa cansa se a melodia compete. |
| **Discreto ≠ inaudível** | Alvos mixados para falantes comuns e fone barato. Texturas “quase ASMR” ou “só sub” são perigosas — manter **fundo perceptível** mesmo em -24 LUFS relativo à voz. |
| **Variantes de cena** | `early-*`, `followup`, visita 1/2: **mesmo stem**, parâmetros diferentes (LPF, peso de percussão, densidade harmônica). |
| **Identidade do jogo** | Cor local importa, mas **leitmotifs** amarram o álbum. Gênero por cena é tempero, não playlist solta. |
| **Literalidade** | “Clockwork”, “motor de oficina”, “bip hospital” = briefing inicial. Na arte final, preferir **contrastes** (silêncio limpo, harmonia fria) quando o clichê soar genérico. |
| **Melodie** | Em `refl-b09-messages` e reflexões: **não** usar o arquivo diegético como score antes da cena 402 fazer sentido. |

---

## Leitmotifs (fio condutor — 4 núcleos)

Produzir **4 famílias** (cada uma: **loop base** 60–120 s). Visitas e reflexões **derivam** destas famílias + filtro “eco de local”, não de gêneros desconectados.

**Variação tensa gravada (opcional):** um stem extra “tense” por família **não é obrigatório**. O perfil de mix **TENSE** (LPF crescente, menos transientes, drone D ou piano A comprimido) cobre a maior parte das reflexões e cenas sem faixa nova. Se existir stem tensa, usar só onde o motor não alcança (ex.: operação ou `trail` com percussão explícita) — não duplicar por família “por segurança”.

| Família | Papel narrativo | Instrumentação sugerida (âncora) | Cenas que derivam |
|---------|-----------------|----------------------------------|-------------------|
| **A — Delegacia / Augusto** | Instituição, caderno, hub | Piano seco + pulso grave muito lento (neo-noir procedural, ~72 BPM) | Abertura, reflexões hub/teoria, hospital depósito (intimidade), fechos B8–B9 |
| **B — Vértice / noite** | Boate, pista, memória de som | Bass pulse abafado, harmônicos escuros (after-hours electronica lenta) | Vértice 1–2, Nico (parente), ecos NVL pós-clube |
| **C — Rua / residência** | Subúrbio, testemunha, vizinhança | Cordas mornas ou nylon + espaço entre notas (não “slice-of-life” genérico de stock) | Jana, Samuel, Sandra, Cecília, Geraldo, Bia, Mauro, Rui |
| **D — Custódia / operação** | Concreto, detenção, ação contida | Drones + percussão espaçada, sem heroísmo militar | André, Miro 1–3, operação galpão, trail (arco tenso) |

**Hospital entrevistas** e **Lívia/Lucas** puxam **A** com cor: pad frio (hospital) ou Rhodes/vibrafone seco (redação/campus) — mesmos elementos harmônicos do núcleo A, timbre diferente.

---

## Legenda de modo

| Modo | UI |
|------|-----|
| **ADV** | Caixa inferior, sprites (`VisualNovelDialog`) |
| **Tópicos** | ADV com menu de assuntos (`TopicInterviewScene`) |
| **NVL** | Blocos internos Augusto (`ReflectionView`) |
| **Linear** | Sequência fixa de beats |

---

## Cenas de visita e linear (direção + família)

Coluna **Família** = qual núcleo toca; **Cor** = ajuste de timbre/arranjo (ainda derivado do núcleo).

### Linear e abertura

| Cena | ID | Família | Cor / notas |
|------|-----|---------|-------------|
| Abertura B1 | `opening` | A | Entrada curta antes da fala; pulso institucional |
| Operação Galpão 17 | `operation` | D | Mais percussão, mesmo drone que Miro |
| Achado final | `trail` | D → A | Arco: metal (D) → colapso com piano longo (A), sem jump scare |

### Hospital

| Cena | ID | Família | Cor / notas |
|------|-----|---------|-------------|
| Entrevistas | `vn-hospital` | A | Pad frio clínico; tópico novo = mesmo loop, LPF levemente mais fechado |
| Depósito | `hospital-deposit` | A | Menos camadas, cello ou equivalente solo |

### Vértice, campus, rádio

| Cena | ID | Família | Cor / notas |
|------|-----|---------|-------------|
| Vértice 1 | `vertice-1` | B | Club abafado de dia |
| Vértice 2 | `vertice-2` | B | Mesmo stem + dissonância leve (Anéis) |
| Lucas | `vn-lucas` | A | Marimba/guitarra limpa, harmonia do núcleo A |
| Lívia | `vn-livia` | A | Rhodes seco, tensão editorial |
| Nico / retorno / early | `vn-nico*` | B | Mesmo que Vértice, mais seco na 1ª visita |

### Residências e rua

| Cena | ID | Família | Cor / notas |
|------|-----|---------|-------------|
| Samuel / early | `vn-samuel*` | C | Doméstico opressivo; evitar comédia — hesitação na dinâmica |
| Jana / followup / early | `vn-jana*` | C | Vizinhança; followup = harmonia menor, **mesmo** arquivo |
| Geraldo / early | `vn-geraldo*` | C | Folk sussurrado opcional; se soar folclore de stock, trocar por cordas secas |
| Sandra | `vn-sandra` | C | **Briefing:** ordem obsessiva. **Preferir:** silêncio limpo + harmonia fria estável em vez de “clockwork” literal |
| Cecília | `vn-cecilia` | C | Piano espaçado, poucas notas |
| Mauro | `vn-mauro` | C | Blues lento só se couber no mesmo campo harmônico; senão cordas do núcleo C |
| Bia | `vn-bia` | C | Synth leve anos 80 como **camada** sobre C, não faixa separada |
| Rui | `vn-rui` | C | Motivo de 4 notas no ostinato do núcleo C |

### Custódia e oficina

| Cena | ID | Família | Cor / notas |
|------|-----|---------|-------------|
| André / followup | `vn-andre*` | D | Concreto; followup = mais cordas dissonantes no mesmo drone |
| Miro 1–3 | `vn-miro*` | D | 1 stem; 2º = baixo sobe no mix; 3º = quase só drone |
| Dênis | `vn-denis` | D | **Briefing:** oficina. **Preferir:** pad industrial **abstrato**; percussão metálica só se não soar cartoon |

### Fora da galeria (motor VN)

| Cena | Família | Cor |
|------|---------|-----|
| Teoria no hub (`refl-theory-*`) | A | Piano + textura papel **moderada** |
| `HexCallScene` / `refl-hex-call` | A | Band-limited leve (sugestão de linha), volume **acima** do mínimo audível |

---

## Reflexões NVL — implementação enxuta

**Não** produzir uma master por `id` em `reflections.ts`. Usar **5 perfis de mix** sobre os núcleos A–D:

| Perfil | Uso | Parâmetros típicos |
|--------|-----|---------------------|
| **HUB** | Teoria, encruzilhada, pontes Omitido | Família A, piano à frente, sem percussão |
| **ECHO** | Pós-visita com `sceneId` | Mesmo núcleo da visita, -6 dB, stereo mais estreito, menos transientes |
| **TENSE** | Revelações B7–B8, Henrique, acidente | Família D ou A + filtro LP crescente nos blocos finais — **prioridade de implementação**; stem tensa gravado só se o mix não bastar |
| **WIDE** | Morsa, protesto, escala | Família A ou D + textura de massa **controlada** (evitar field recording dominante) |
| **CLOSE** | Morte, fecho B9, `refl-b09-augusto` | Família A; `death` compartilha fragmento de **trail** (15–20 s), não faixa nova |

**Regra Melodie:** perfil **CLOSE** em `refl-b09-messages` = pad da família A/B relacionado à noite/mensagem — **sem** melodias reconhecíveis do celular.

**Preset de mix `bandLimited` (não é perfil CLOSE):** `refl-hex-call` e áudio de `HexCallScene` — família **A**, banda estreita (sugestão de linha), volume **acima** do mínimo audível, stereo moderado. **Evitar** parâmetros íntimos de CLOSE (solo cello, fragmento trail, ducking agressivo): a cena é reflexão no hub sobre entrega de arquivos, não fecho emocional.

### Mapeamento `reflections.ts` → perfil (+ eco)

IDs listados em `src/data/reflections.ts`; coluna **Perfil** é o que o runtime deve resolver.

| Perfil | IDs (`refl-*`) | Eco de família (se houver `sceneId`) |
|--------|----------------|--------------------------------------|
| HUB | `theory-julia-pressure`, `theory-andre-obsession`, `theory-maralto-retaliation`, `theory-human-manipulator`, `theory-miro-killed-elisa`, `b05-path`, `b08-omitido-bridge`, `b09-omitido`, `hex-call` | `hex-call`: A + `bandLimited` (ver acima) |
| ECHO | `lucas`, `aneis`, `livia`, `nico`, `samuel`, `andre`, `nico2`, `jana`, `jana2`, `b05-andre`, `b06-geraldo`, `b07-sandra`, `b08-andre`, `samuel-recontextualized` | B, B, A, B, C, D, B, C, C, D, C, C, D, C |
| TENSE | `b07-ricardo-dead`, `b07-henrique-reveal`, `b07-tech`, `b08-accident`, `b08-final` | mistura A/D |
| WIDE | `b05-maralto`, `b08-morsa`, `b08-jaguar-lead`, `b08-miro-guardrail` | cor corporativa / rua em camada baixa |
| CLOSE | `b06-miro`, `b07-notebook`, `b07-hv`, `b09-messages`, `b09-death`, `b09-augusto`, `b09-final` | `notebook`/`hv`: A; `death`: fragment trail |

*Eco:* quando `sceneId` existe, preferir **ECHO** com a família da visita correspondente em vez de inventar género novo.

---

## Não listado como VN de diálogo

| Entrada | Nota |
|---------|------|
| `morsa-cctv` | Tensão pontual ou silêncio + SFX; sem loop longo |
| Apartamento 402 | Diegético `melodie.mp3` apenas na cena |

---

## Próximos passos (implementação)

1. **Entregar 4 loops** (famílias A–D) como mínimo. Stem “tense” gravado = **opcional**; perfil **TENSE** no motor é o caminho principal.
2. **Data layer:** `sceneId` / `reflectionId` → `{ family, profile, mixPreset? }` — ex.: `refl-hex-call` → `{ family: A, profile: HUB, mixPreset: bandLimited }`; não → arquivo único por cena.
3. **Motor:** ducking no ADV; validar níveis em TV/laptop, não só em fone de referência.
4. **QA auditivo:** duas passagens — leitura rápida (typewriter skip) e leitura lenta — mesma faixa deve funcionar nos dois casos.

---

*Inventário de cenas mantido; granularidade sonora reduzida de propósito para produção realista.*