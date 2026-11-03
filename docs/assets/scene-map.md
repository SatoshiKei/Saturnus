# Mapa de cenas — backgrounds (rascunho de curadoria)

**Atenção:** ligações narrativas são **placeholders** para curadoria visual. Não canonizam história, culpados ou ordem de eventos.

Legenda: `raw` = candidato bruto; `processed` = tratamento VN; escolher 1–2 finais por linha após revisão manual.

## Institucional / investigação

| Uso narrativo (mock) | Categorias | Candidatos sugeridos (id) | Notas |
| --- | --- | --- | --- |
| Delegacia / mesa de investigação | `police` | `police-01`, `police-03`, `police-02` | `police-03` já usado no bootstrap UI |
| Sala de interrogatório | `police`, `prison_forum` | `police-02`, `prison-03` | Corredores austeros |
| Arquivo / sala de evidências | `journalist`, `police` | `journalist-02`, `prison-04` | Mesas com papéis |
| Blitz / operação | `police`, `roads` | `police-04`, `roads-04` | Crop para placas |

## Personagens / doméstico

| Uso narrativo (mock) | Categorias | Candidatos | Notas |
| --- | --- | --- | --- |
| Apartamento Mariana | `apartment` | `apartment-01`, `apartment-03`, `apartment-04` | `apartment-04` = corredor prédio SP |
| Casa testemunha | `misc` | `misc-08` | Exterior simples |
| Cozinha / vida cotidiana | `apartment` | `apartment-02` | |

## Saúde

| Uso narrativo (mock) | Categorias | Candidatos | Notas |
| --- | --- | --- | --- |
| Hospital público / corredor | `hospital` | `hospital-01`, `hospital-02`, `hospital-03` | |
| Quarto de paciente | `hospital` | `hospital-04` | |
| Necrotério / admin (adaptável) | `hospital`, `prison_forum` | `hospital-03`, `prison-03` | Iluminação fria |

## Universidade

| Uso | Categorias | Candidatos |
| --- | --- | --- |
| Campus | `university` | `university-01` |
| Biblioteca | `university` | `university-02` |
| Sala de aula vazia | `university` | `university-03` |

## Vida noturna

| Uso narrativo (mock) | Categorias | Candidatos | Notas |
| --- | --- | --- | --- |
| Boate Vértice (pista) | `nightclub` | `nightclub-01` | Crop silhuetas |
| Cabine DJ | `nightclub` | `nightclub-02` | |
| Corredor boate | `nightclub` | `nightclub-03` | |
| Bar interno boate | `nightclub`, `bar` | `nightclub-04`, `bar-01` | |
| Boteco bairro / Geraldo | `bar` | `bar-01`, `bar-02`, `bar-03` | |

## Porto / Maralto / industrial

| Uso narrativo (mock) | Categorias | Candidatos | Notas |
| --- | --- | --- | --- |
| Área portuária RJ | `port` | `port-01` | Guanabara — BR |
| Doca / granéis | `port` | `port-02`, `port-03` | |
| Fábrica / industrial RJ | `port`, `misc` | `port-04`, `misc-02` | |
| Guarita | `misc` | `misc-03` | |
| Protestos Maralto | `misc` | `misc-01` | Multidão — uso secundário / crop |

## Tragédia / transição (mock)

| Uso narrativo (mock) | Categorias | Candidatos | Notas |
| --- | --- | --- | --- |
| Morte Elisa — passarela | `bridge_guardrail` | `bridge-01`, `bridge-02` | Guardrail visível |
| Estrada / fuga | `roads` | `roads-01`, `roads-03` | |
| Rua noite luz falha | `roads` | `roads-02` | |
| Praça encontro | `misc` | `misc-04` | |
| Estacionamento | `misc` | `misc-05` | |
| Orla / beira-mar | `misc` | `misc-06` | |

## Justiça

| Uso | Categorias | Candidatos |
| --- | --- | --- |
| Fórum fachada | `prison_forum` | `forum-01` |
| Prisão exterior | `prison_forum` | `prison-02` |
| Parlatório | `prison_forum` | `prison-03` |

## Jornalismo

| Uso | Categorias | Candidatos |
| --- | --- | --- |
| Redação | `journalist` | `journalist-01` |
| Arquivo documentos | `journalist` | `journalist-02`, `journalist-03` |

## Oficina / depósito

| Uso | Categorias | Candidatos |
| --- | --- | --- |
| Oficina | `misc` | `misc-07` |

## Props clicáveis (separado)

Ver `assets/props/raw/` — recorte manual para mesa de investigação ou hotspots futuros:

| Prop | Arquivo manifest | Hotspot futuro |
| --- | --- | --- |
| Celular | `prop-smartphone-table.jpg` | Objeto iPhone na cena |
| Caderno / papéis | `prop-notebook-pen.jpg`, `prop-scattered-papers.jpg` | Mesa |
| Gravador | `prop-voice-recorder.jpg` | Evidência |
| Pasta documentos | `prop-manila-folder.jpg` | Mesa |
| Telefone fixo | `prop-landline-phone.jpg` | Substituir SVG mesa |
| Calendário | `prop-wall-calendar.jpg` | Parede |
| Vinil / toca-discos | `prop-vinyl-record.jpg`, `prop-turntable.jpg` | Ambiente personagem |

## Próximo passo (fora desta etapa)

- Escolher 1 background final por linha da tabela  
- Apontar `sceneComposition.ts` / engine VN para `processed/`  
- Recortar props com alpha e mover para `props/processed/`
