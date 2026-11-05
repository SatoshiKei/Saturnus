# Bloco 7 — O homem que não era Ricardo

## Estado de entrada

Fim real do Bloco 6 (`block06_complete` / `block07_entry_ready`):

- Elisa mais alcoolizada do que o processo sugeria; Geraldo minimizou
- Jana entregou pertences deliberadamente; medo de gente do Válter
- Miro preso por crimes atuais; admitiu seguir Elisa por engano; nega matar
- André oficialmente culpado; alternativa concreta existe
- Objetivo: **até onde Miro seguiu Elisa e o que ainda omite**

Trigger `block07_start`: reabre `detencao-miro`.

## Miro (2ª pressão)

- Confronta lacuna temporal com autos da Noite X
- Sob pressão: desceu à região da queda **depois**; motivo declarado — recuperar bolsa de Jana
- Mantém: Elisa já havia caído; não empurrar; não tocar antes; não responsável pela morte
- Evidências: `miro_descended_fall_area`, `miro_recovered_jana_bag`
- Hipótese `hyp_miro_followed_to_fall` confirmada; `hyp_miro_may_be_involved_elisa` ativa
- Exige revisitar **Sandra** (autos), sem botão automático

## Sandra

- Busca “sandra” → depoimento + ficha (`sandra-casa`)
- Continua identificando André; reconhece possibilidade lógica de Miro
- Foto/reconhecimento não produz troca conveniente
- Evidências: `sandra_still_identifies_andre`, `sandra_acknowledges_miro_possibility`
- Reflexão: duas explicações incompatíveis; hipótese (não fato) de que o homem visto pode não ter sido André

## Morsa (duração)

- Ação no PC: reavaliar arquivos dos protestos / transmissão
- Morsa ativo em intervalo relevante; Mariana focava essa duração
- Hipótese: identidade de Morsa como ponte Elisa ↔ protestos (`hyp_morsa_bridges_elisa_protests`)
- Sem identidade; sem apontar André

## Cronologia da memória

- Organizar primeiros registros anormais → meses antes; coincide com plantões
- Checagem curta Júlia/Camila: sem evento dramático óbvio
- Evidências: `memory_anomalies_months_before`, `onset_matches_hospital_shifts`, `no_dramatic_event_at_onset`

## Puzzle 8 — Enceladus (placeholder)

- Após checagem: áudio anônimo (`anon_hospital_burst_audio`) na bancada
- Rajadas periódicas × tabela de equipamentos hospitalares
- Resultado: hospital + janela de plantão + nome **Ricardo** (sem “investigue Ricardo Freitas”)

## Ricardo → Henrique

- Ligação hospital / consulta “ricardo” → registro pobre; óbito no plantão; reação inicial: pode não levar a lugar algum
- Cruzamento com dados de Mariana → identidade falsa → **Henrique Valença**
- Busca Henrique → empresa de tecnologia, incidente de segurança, Cecília Prado

## Cecília

- Descreve deterioração: preocupação → obsessão → paranoia; medo de observação/manipulação
- Empresa tratou como problema pessoal
- Não declara IA; Augusto interpreta origem tecnológica convencional (`hyp_unknown_tech_origin`)

## Puzzle 9 — Cassini-Huygens (placeholder)

- Material digital antigo (`henrique_rtp_capture`) — PCAP/RTP misturado
- Separar dois SSRCs → duas sessões; sistema com memória/contexto incomum
- Similaridade com interlocutor de Mariana (`hyp_henrique_mariana_same_system`)
- Sem nome O Omitido; sem IA senciente declarada

## Evidências (mínimo)

Miro descida/bolsa; Sandra mantém André; alternativa ao lookalike; Morsa duração; lapsos meses antes; áudio hospitalar + Ricardo; Ricardo morto no plantão; identidade falsa → Henrique; empresa/incidente; dump RTP; duas sessões; sistema contextual.

## Hipóteses ao final

| Hipótese | Estado |
| --- | --- |
| Miro envolvido na morte | Plausível, não provado |
| Homem visto era André | Enfraquecida; Sandra sustenta |
| Morsa liga Elisa e protestos | Linha investigativa |
| Memória após período específico | Ganha força |
| Ricardo ligado ao início | Plausível |
| Interlocutor de origem tecnológica | Nova, forte |
| Henrique e Mariana — mesmo sistema/operador | Nova, plausível |

## Estado final

Miro admitiu a descida; Sandra manteve André; duas versões incompatíveis; Morsa sem ID; lapsos datados; Puzzles 8 e 9 resolvidos; Henrique/Cecília; hipótese tecnológica; O Omitido e Morsa não revelados.

## Entrada do Bloco 8

`task_identify_morsa` + `task_compare_henrique_mariana_system` (`block08_entry_ready`). Puzzle 10 não implementado.
