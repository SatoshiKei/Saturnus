# Validação visual — backgrounds (`assets/backgrounds/raw/`)

Auditoria manual de **50** arquivos (nov/2025). Mesma lição dos props: **21 entradas** usam URL Pexels com `sourcePage` Unsplash (ID aleatório → conteúdo errado). Rode `node scripts/check-bg-url-mismatch.mjs` após editar o manifest.

## Resumo

| Status | Qtd | Significado |
|--------|-----|-------------|
| ok | 18 | Cena bate com categoria / `narrativeFit` |
| partial | 9 | Usável com crop ou tom genérico (não é o cenário ideal) |
| reject | 23 | Conteúdo errado — trocar URL antes de `assets:process` |

## Por arquivo

| Arquivo | Status | Observação |
|---------|--------|------------|
| police-01-station-hall.jpg | reject | Balança da justiça + laptop (Pexels 6077797 ≠ delegacia) |
| police-02-interrogation-tone.jpg | ok | Corredor institucional P&B |
| police-03-office-desks.jpg | ok | Escritório/corredor corporativo |
| police-04-night-lights.jpg | reject | Sala de estar doméstica (Pexels 337564 errado) |
| hospital-01-corridor-exit.jpg | ok | Corredor hospitalar |
| hospital-02-corridor-chairs.jpg | ok | Corredor + cadeiras |
| hospital-03-equipment-hall.jpg | ok | Corredor clínico |
| hospital-04-patient-room-tone.jpg | partial | Recepção hospitalar, não quarto |
| apartment-01-living-modest.jpg | ok | Sala modesta |
| apartment-02-kitchen-small.jpg | reject | Cozinha com pessoa cozinhando |
| apartment-03-bedroom-simple.jpg | ok | Quarto |
| apartment-04-hall-brazil-sp.jpg | ok | Corredor de prédio |
| university-01-campus-walk.jpg | ok | Campus externo |
| university-02-library-aisles.jpg | ok | Biblioteca (Pexels 256541) |
| university-03-classroom-empty.jpg | **replace** | Rua noturna Kyiv (Pexels 2897377 errado) → corrigir |
| university-04-lecture-hall.jpg | reject | Formatura / Singapore (Unsplash errado para auditório) |
| bar-01-neighborhood-interior.jpg | **replace** | Cozinha/chef (Pexels 1267320 errado) |
| bar-02-empty-stools.jpg | **replace** | Gato em cesta (Pexels 1543793 errado) |
| bar-03-wood-interior.jpg | partial | Close de coquetel (bar sim, não “interior”) |
| bar-04-bottles-shelf.jpg | ok | Prateleira de bebidas |
| nightclub-01-lights-haze.jpg | ok | Show / pista |
| nightclub-02-dj-booth.jpg | partial | Show rock, não cabine DJ |
| nightclub-03-corridor-dark.jpg | reject | Torrefação de café (Unsplash fcd25c85cd64) |
| nightclub-04-neon-bar.jpg | reject | Rua Xangai (Pexels 7883832 errado) |
| port-01-guanabara-rj.jpg | ok | Baía / industrial |
| port-02-ship-dock.jpg | ok | Containers |
| port-03-warehouse-harbor.jpg | ok | Galpão logístico |
| port-04-rio-industrial-facade.jpg | ok | Fachada industrial + navio |
| bridge-01-overpass-rail.jpg | **replace** | Pirâmides de Gizé (Pexels 4174143 errado) |
| bridge-02-walkway-fog.jpg | **replace** | Pintura abstrata (Pexels 1293120 errado) |
| bridge-03-urban-bridge-night.jpg | ok | Skyline noturno (ponte urbana genérica) |
| roads-01-shoulder-highway.jpg | reject | Avenida NYC, não rodovia |
| roads-02-empty-street-night.jpg | ok | Rua noturna (Chicago) |
| roads-03-wet-asphalt.jpg | reject | Jardinagem / pá |
| roads-04-gas-station-night.jpg | reject | Lamborghini (Pexels 3802510 errado) |
| forum-01-courthouse-columns.jpg | reject | Canteiro de obras |
| prison-01-concrete-wall.jpg | reject | Chaleira na fogueira (Pexels 6063680 errado) |
| prison-02-visitation-glass.jpg | **replace** | Ovelhas (Pexels 5360020; sourcePage apontava 7249945) |
| prison-03-archive-shelves.jpg | reject | Manuscrito cirílico (Pexels 261763 errado) |
| journalist-01-newsroom-desks.jpg | partial | Jornais close, não redação |
| journalist-02-paper-archive.jpg | partial | Mãos escrevendo |
| journalist-03-typewriter-desk.jpg | reject | Mesas de café |
| misc-01-protest-street.jpg | reject | Parlamento italiano |
| misc-02-industrial-street.jpg | reject | Worm’s-eye de skyscrapers |
| misc-03-guardhouse-small.jpg | reject | Skyscrapers, não guarita |
| misc-04-urban-plaza.jpg | reject | Joaninha macro (Pexels 250692 errado) |
| misc-05-parking-empty.jpg | **replace** | Rolls-Royce (Pexels 3764984 errado) |
| misc-06-seaside-urban.jpg | reject | Atol Maldives (Pexels 1268869 errado) |
| misc-07-workshop-garage.jpg | reject | Estação dev / código |
| misc-08-simple-house-exterior.jpg | ok | Casa residencial |

## Correções já aplicadas no manifest (URLs Pexels verificadas)

Ver `assets/manifest/backgrounds.json` — entradas com `validated 2025-11-02` na nota.

## Processo recomendado

1. `node scripts/check-bg-url-mismatch.mjs` — listar Pexels URL + página Unsplash.
2. Só usar ID copiado da **slug** Pexels (`…-12345678/`) ou URL Unsplash completa (`photo-…-hash`).
3. Amostra em `artifacts/bg-verify/` (cópias locais).
4. `npm run assets:fetch` → rever → `npm run assets:process` só nos `process: true` validados.

## Próximo lote (ainda reject)

Prioridade narrativa SATURNUS: `police-01`, `police-04`, `nightclub-03/04`, `roads-01/03/04`, `forum-01`, `prison-01/03`, `journalist-03`, `misc-01/02/03/06/07`, `university-04`, `apartment-02`.
