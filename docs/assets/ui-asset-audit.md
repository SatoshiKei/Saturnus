# Auditoria de assets — Saturnus

Gerado por `node scripts/audit-assets.mjs`. Resolução/transparência medidas com `sharp`.

Legenda de decisão: **Manter**, **Substituir** (quando houver arte melhor) ou **Removido da implementação**
(arquivo movido para `assets/deprecated/ui/`, sem apagar o original).

## 1. Assets em uso (`public/`)

| Arquivo | Resolução | Transparência | Função | Problema | Decisão | Fonte | Licença |
|---|---|---|---|---|---|---|---|
| `public/assets/audio/voice-mock-a.wav` | — | — | Áudio de teste (evidências e WhatsApp) | Tom sintético, não é voz. | Substituir por gravação real quando existir | scripts/generate-test-audio.mjs | Autoral (projeto) |
| `public/assets/audio/voice-mock-b.wav` | — | — | Áudio de teste | Tom sintético, não é voz. | Substituir por gravação real quando existir | scripts/generate-test-audio.mjs | Autoral (projeto) |
| `public/assets/scene/chat-sample-product.jpg` | 480×349 | não | Imagem de exemplo em conversa de WhatsApp (mock) | Imagem de teste, sem relação narrativa. | Substituir por imagem narrativa quando existir | Gerado localmente (mock) | Autoral (projeto) |
| `public/assets/scene/hub-office-bg.jpg` | 2560×1440 | não | Fundo da sala (e da tela de título) | Foto de escritório institucional de aparência genérica/asiática (não é uma delegacia brasileira identificável). Móveis e arquivo ao fundo são aproveitados; a mesa e os telefones originais ficam cobertos pela mesa nova. | Manter até haver foto de delegacia brasileira | Pexels 12289987 — Luke Dang (original em assets/backgrounds/raw/police/police-05-chief-office.jpg) | Pexels License (uso livre, sem atribuição obrigatória) |
| `public/assets/scene/hub/audio-station.png` | 880×660 | sim (recorte real) | Objeto: bancada de áudio (abre AudioWorkbench) | Placeholder vetorial (notebook + fone + papéis). | Manter / substituir por recorte fotográfico | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/case-folder.png` | 760×600 | sim (recorte real) | Objeto: pasta do caso (abre CaseFiles) | Placeholder vetorial. | Manter / substituir por recorte fotográfico | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/city-map.svg` | vetor 1200×800 | sim | Base do mapa da cidade na tela LocationsMap | Cidade fictícia genérica. | Manter | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/coffee.png` | 300×300 | sim (recorte real) | Objeto decorativo (xícara de café) | Placeholder vetorial. | Manter | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/desk-sheet-bo.png` | 400×460 | sim (recorte real) | Evidência física na mesa: folha do BO (aparece quando o BO é obtido) | Placeholder vetorial. | Manter | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/desk-table.png` | 3840×960 | sim (recorte real) | Mesa em primeiro plano (cobre a mesa da foto) | Ilustração vetorial com granulado; não é foto. Perspectiva fixa ~55° coerente com o fundo. | Manter; substituir por foto de mesa recortada quando disponível | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/landline.png` | 660×500 | sim (recorte real) | Objeto: telefone fixo (abre PoliceLandline) | Placeholder vetorial. | Manter / substituir por recorte fotográfico | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/monitor.png` | 1040×940 | sim (recorte real) | Objeto: computador policial (abre PoliceComputer) | Placeholder vetorial; tela é decorativa (a interface real é HTML). | Manter / substituir por recorte fotográfico (mesmo nome e tamanho) | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/notebook.png` | 680×540 | sim (recorte real) | Objeto: caderno de investigação | Placeholder vetorial. | Manter / substituir por recorte fotográfico | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/wall-calendar.png` | 480×640 | sim (recorte real) | Calendário de parede (decorativo; data do caso) | Placeholder vetorial. | Manter | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/assets/scene/hub/wall-map.png` | 1040×760 | sim (recorte real) | Mapa pregado na parede (abre LocationsMap) | Placeholder vetorial. | Manter | Gerado por scripts/build-hub-objects.mjs | Autoral (projeto) |
| `public/favicon.svg` | vetor 48×46 | sim | Favicon | Gerado pelo template Vite. | Substituir por ícone próprio | Template Vite | MIT |
| `public/icons.svg` | ? | ? | Sprite do template Vite | Sem uso na interface do jogo. | Remover quando o template inicial sair | Template Vite | MIT |

## 2. Assets retirados da implementação

| Arquivo | Resolução | Transparência | Função | Problema | Decisão | Fonte | Licença |
|---|---|---|---|---|---|---|---|
| `assets/deprecated/ui/props/audio-papers.jpg` | 1200×1800 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/case-folder.jpg` | 1200×801 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/coffee.jpg` | 1200×1798 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/headphones.jpg` | 1200×800 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/landline.jpg` | 1200×800 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/notebook.jpg` | 1200×1798 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/props/wall-calendar.jpg` | 1200×1600 | não | (antigo) | Fotos retangulares com fundo (aparência de “foto colada”), sem recorte, sombra ou escala consistentes. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/background-office.jpg` | 1920×1282 | não | (antigo) | Foto antiga do fundo (Unsplash). Substituída por hub-office-bg.jpg; enquadramento errado. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/background-office.webp` | 1920×1282 | não | (antigo) | Foto antiga do fundo (Unsplash). Substituída por hub-office-bg.jpg; enquadramento errado. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/coffee-cup.svg` | vetor 90×110 | sim | (antigo) | Ícone plano antigo; substituído por hub/coffee.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/desk-lamp.svg` | vetor 180×280 | sim | (antigo) | Ícone plano antigo; sem uso na nova composição. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/desk-surface.svg` | vetor 1360×420 | sim | (antigo) | Mesa plana antiga; substituída por hub/desk-table.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/evidence-box.svg` | ? | ? | (antigo) | Ícone plano antigo; substituído por hub/case-folder.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/hub-delegacia-bg.jpg` | 1920×2880 | não | (antigo) | Fundo antigo era um corredor — não corresponde a uma sala de delegado. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/landline-phone.svg` | vetor 200×120 | sim | (antigo) | Telefone antigo (abria interface de celular); substituído por hub/landline.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/map-board.svg` | vetor 200×160 | sim | (antigo) | Quadro/mapa antigo; substituído por hub/wall-map.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/monitor.svg` | vetor 420×320 | sim | (antigo) | Ícone plano antigo; substituído por hub/monitor.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/notebook.svg` | vetor 200×120 | sim | (antigo) | Ícone plano antigo; substituído por hub/notebook.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/papers.svg` | vetor 280×140 | sim | (antigo) | Ícone plano antigo; função assumida por audio-station.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/pen.svg` | vetor 120×40 | sim | (antigo) | Ícone plano antigo; caneta agora faz parte de notebook.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/photo-frame.svg` | vetor 130×150 | sim | (antigo) | Ícone plano antigo; sem uso narrativo. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/scene/wall-calendar.svg` | vetor 220×260 | sim | (antigo) | Calendário antigo; substituído por hub/wall-calendar.png. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |
| `assets/deprecated/ui/source/office-background-unsplash.jpg` | 1920×1282 | não | (antigo) | Original do fundo antigo. | **Removido da implementação** (arquivo preservado) | Projeto anterior | — |

## 3. Biblioteca de backgrounds (`assets/backgrounds/raw`)

Nenhum destes é carregado diretamente pelo jogo; a sala usa apenas a versão processada de
`police-05-chief-office.jpg`. Observação: a entrada `police-01` do manifest mistura URL do Pexels com
página do Unsplash — conferir a licença real antes de usar.

| Arquivo | Resolução | Transparência | Função | Problema | Decisão | Fonte | Licença |
|---|---|---|---|---|---|---|---|
| `assets/backgrounds/raw/apartment/apartment-01-living-modest.jpg` | 1920×1428 | não | Apartamento modesto — candidato apartamento Mariana (mock) | Sem rostos; mobília neutra | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/apartment/apartment-02-kitchen-small.jpg` | 1920×1280 | não | Cozinha de apartamento pequeno | Crop para remover marcas de eletro | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/apartment/apartment-03-bedroom-simple.jpg` | 1920×1280 | não | Quarto de apartamento / testemunha | Iluminação lateral | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/apartment/apartment-04-hall-brazil-sp.jpg` | 1920×1077 | não | Corredor de prédio antigo — transição urbana BR | Referência brasileira explícita | Mantido na biblioteca (versão filtrada existe) | Pexels — Aaron Mello | Pexels License |
| `assets/backgrounds/raw/bar/bar-01-neighborhood-interior.jpg` | 1920×1280 | não | Boteco de bairro / Bar do Geraldo (mock) | Evitar logos no balcão — crop; validated 2025-11-02 | Mantido na biblioteca (versão filtrada existe) | Pexels — Quang Nguyen Vinh | Pexels License |
| `assets/backgrounds/raw/bar/bar-02-empty-stools.jpg` | 1920×3414 | não | Bar vazio antes do movimento | Tom quente; validated 2025-11-02 | Mantido na biblioteca | Pexels — Mirac Sendil | Pexels License |
| `assets/backgrounds/raw/bar/bar-03-wood-interior.jpg` | 1920×1283 | não | Bar interno alternativo | Sem pessoas | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/bar/bar-04-bottles-shelf.jpg` | 1920×1280 | não | Detalhe / transição no bar | Crop estreito possível | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/bridge_guardrail/bridge-01-overpass-rail.jpg` | 1920×2560 | não | Passarela com guardrail — candidato cena Elisa (mock) | Verificar altura do rail no crop; validated 2025-11-02 | Mantido na biblioteca (versão filtrada existe) | Pexels — Anshu Kumar | Pexels License |
| `assets/backgrounds/raw/bridge_guardrail/bridge-02-walkway-fog.jpg` | 1920×2875 | não | Passarela atmosférica | Poucos elementos; validated 2025-11-02 | Mantido na biblioteca | Pexels — Erik Mclean | Pexels License |
| `assets/backgrounds/raw/bridge_guardrail/bridge-03-urban-bridge-night.jpg` | 1920×1165 | não | Transição urbana noturna | Luzes bokeh | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/hospital/hospital-01-corridor-exit.jpg` | 1920×2560 | não | Corredor de hospital de médio porte | Vazio, fluorescente | Mantido na biblioteca (versão filtrada existe) | Pexels — Luis Ribeiro | Pexels License |
| `assets/backgrounds/raw/hospital/hospital-02-corridor-chairs.jpg` | 1920×2879 | não | Posto de enfermagem / fila de espera | Portas abertas; fácil crop | Mantido na biblioteca (versão filtrada existe) | Pexels — Van Mailian | Pexels License |
| `assets/backgrounds/raw/hospital/hospital-03-equipment-hall.jpg` | 1920×2880 | não | Área clínica / transição para quarto | Equipamento genérico | Mantido na biblioteca | Pexels — Juan Moccagatta | Pexels License |
| `assets/backgrounds/raw/hospital/hospital-04-patient-room-tone.jpg` | 1920×1307 | não | Quarto de paciente / enfermaria | Ambiente limpo, poucos elementos | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/journalist/journalist-01-newsroom-desks.jpg` | 1920×1280 | não | Redação / arquivo de jornalista | Monitores sem conteúdo legível — crop | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/journalist/journalist-02-paper-archive.jpg` | 1920×1281 | não | Mesa com documentos / investigação paralela | Macro; sem logos | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/journalist/journalist-03-typewriter-desk.jpg` | 1920×2880 | não | Arquivo pessoal / mesa de repórter | Atmosfera retrô | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-01-protest-street.jpg` | 1920×1280 | não | Protesto Maralto (mock) — usar crop amplo ou desfoque extra | Muitas pessoas; candidato secundário | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-02-industrial-street.jpg` | 1920×1280 | não | Rua industrial / Maralto | Vertical; crop horizontal | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-03-guardhouse-small.jpg` | 1920×1276 | não | Guarita / portão industrial | Pequena edificação | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-04-urban-plaza.jpg` | 1920×1440 | não | Praça / encontro urbano | Verificar pessoas ao fundo | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-05-parking-empty.jpg` | 1920×1275 | não | Estacionamento / transição | Garagem subterrânea; validated 2025-11-02 | Mantido na biblioteca | Pexels — Carl Newton | Pexels License |
| `assets/backgrounds/raw/misc/misc-06-seaside-urban.jpg` | 1920×1275 | não | Beira-mar urbano — Niterói/Rio genérico | Substituir se 404; ver misc-06-alt | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-07-workshop-garage.jpg` | 1920×2879 | não | Oficina / depósito | Interior industrial | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/misc/misc-08-simple-house-exterior.jpg` | 1920×1280 | não | Casa simples de testemunha | Externa residencial neutra | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/nightclub/nightclub-01-lights-haze.jpg` | 1920×1282 | não | Boate Vértice — pista (mock) | Silhuetas; crop para reduzir rostos | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/nightclub/nightclub-02-dj-booth.jpg` | 1920×1372 | não | Cabine de DJ | Equipamento genérico | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/nightclub/nightclub-03-corridor-dark.jpg` | 1920×1280 | não | Corredor de boate / backstage | Baixa luz | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/nightclub/nightclub-04-neon-bar.jpg` | 1920×2880 | não | Bar interno da boate | Neon sem texto legível — verificar crop | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/police/police-01-station-hall.jpg` | 1920×1280 | não | Corredor/saguão de DP ou posto policial genérico | Poucas pessoas; crop horizontal possível | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash contributor | Unsplash License |
| `assets/backgrounds/raw/police/police-02-interrogation-tone.jpg` | 1920×2880 | não | Corredor austero / sala de espera policial | Já em grayscale; bom para VN | Mantido na biblioteca (versão filtrada existe) | Pexels — Tima Miroshnichenko | Pexels License |
| `assets/backgrounds/raw/police/police-03-office-desks.jpg` | 1920×1282 | não | Sala de investigação / mesa de delegacia | Reutilizado do bootstrap; sem marcas | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/police/police-04-night-lights.jpg` | 1920×870 | não | Blitz / operação noturna (crop para remover detalhes) | Verificar crop para placas | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/police/police-05-chief-office.jpg` | 3543×2397 | não | Sala de chefia/delegado | Ver hub-office-bg.jpg | **Em uso** (via hub-office-bg.jpg) | Pexels 12289987 — Luke Dang | Pexels License |
| `assets/backgrounds/raw/port/port-01-guanabara-rj.jpg` | 1920×2880 | não | Área portuária / Maralto — transição (mock) | Silhueta ao pôr do sol; pouco detalhe identificável | Mantido na biblioteca (versão filtrada existe) | Pexels — Lucas Rodrigues Vimieiro | Pexels License |
| `assets/backgrounds/raw/port/port-02-ship-dock.jpg` | 1920×1259 | não | Terminal / doca de granéis | Containers — crop para marcas | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/port/port-03-warehouse-harbor.jpg` | 1920×1280 | não | Galpão portuário | Vazio | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/port/port-04-rio-industrial-facade.jpg` | 1920×1440 | não | Edificação industrial urbana RJ | Rio de Janeiro; fábrica degradada | Mantido na biblioteca | Unsplash — higor marques | Unsplash License |
| `assets/backgrounds/raw/prison_forum/forum-01-courthouse-columns.jpg` | 1920×1280 | não | Fachada de fórum / tribunal | Externa; sem texto | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/prison_forum/prison-01-concrete-wall.jpg` | 1920×1080 | não | Exterior prisional genérico | Sem identificação | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/prison_forum/prison-02-visitation-glass.jpg` | 1920×2881 | não | Parlatório / sala de visitas (adaptável) | Sala de reunião vazia; validated 2025-11-02 | Mantido na biblioteca | Pexels — Mikhail Nilov | Pexels License |
| `assets/backgrounds/raw/prison_forum/prison-03-archive-shelves.jpg` | 1920×1275 | não | Sala de arquivos / interrogatório alternativo | Reutilizar se duplicado — curadoria | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/roads/roads-01-shoulder-highway.jpg` | 1920×1280 | não | Estrada com acostamento | Carros distantes — crop | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/roads/roads-02-empty-street-night.jpg` | 1920×2402 | não | Rua noturna com iluminação irregular | Atmosfera melancólica | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/roads/roads-03-wet-asphalt.jpg` | 1920×1280 | não | Transição / fuga urbana | Reflexos | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/roads/roads-04-gas-station-night.jpg` | 1920×1536 | não | Posto de gasolina | Remover logos de posto via crop | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/university/university-01-campus-walk.jpg` | 1920×1257 | não | Campus universitário simples | Poucas pessoas ao fundo — crop | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/university/university-02-library-aisles.jpg` | 1920×1279 | não | Biblioteca universitária | Sem rostos | Mantido na biblioteca (versão filtrada existe) | Unsplash — Unsplash | Unsplash License |
| `assets/backgrounds/raw/university/university-03-classroom-empty.jpg` | 1920×2560 | não | Sala de aula vazia | Carteiras alinhadas; validated 2025-11-02 | Mantido na biblioteca (versão filtrada existe) | Pexels — Berna Elif | Pexels License |
| `assets/backgrounds/raw/university/university-04-lecture-hall.jpg` | 1920×1280 | não | Auditório / aula magna | Vazio | Mantido na biblioteca | Unsplash — Unsplash | Unsplash License |

## 4. Pendências conhecidas

- Os objetos da mesa são ilustrações vetoriais honestas (placeholders). Para trocar por recortes fotográficos,
  mantenha nome e tamanho dos arquivos em `public/assets/scene/hub/`.
- O fundo ainda não é uma delegacia brasileira reconhecível.
- Áudios `voice-mock-*.wav` são tons sintéticos.
