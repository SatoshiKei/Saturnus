# Validação visual — props (`assets/props/raw/misc/`)

Auditoria manual (nov/2025). **Não confiar só em HTTP 200:** o ID na URL Pexels/Unsplash precisa bater com a página do foto (`sourcePage`) e com o conteúdo baixado.

## Legenda

| Status | Significado |
|--------|-------------|
| ok | Combina com filename/tags |
| replace | Arquivo errado; URL corrigida no manifest |
| partial | Usável com recorte, mas não é o objeto ideal |
| brand | Marca visível — recortar ou substituir na arte final |

## Resultado

| Arquivo | Status | Observação |
|---------|--------|------------|
| `prop-smartphone-table.jpg` | ok | iPhone + AirPods, fundo claro |
| `prop-coffee-cup.jpg` | ok | Xícara de café |
| `prop-headphones-desk.jpg` | ok | Fones over-ear |
| `prop-manila-folder.jpg` | partial | Mãos escrevendo em papéis; não é pasta manila |
| `prop-vinyl-record.jpg` | ok / brand | Discos de vinil (arte de álbum visível) |
| `prop-bluetooth-speaker.jpg` | ok / brand | Speaker JBL |
| `prop-walkie-talkie.jpg` | **replace** | Era mesa de engenharia (Unsplash); → Pexels 10349990 |
| `prop-turntable.jpg` | **replace** | Era gráfico árabe; → Pexels 705794 |
| `prop-notebook-pen.jpg` | **replace** | Era reunião de marketing; → Pexels 5717421 |
| `prop-landline-phone.jpg` | **replace** | Era baseball; → Pexels 13796734 |
| `prop-voice-recorder.jpg` | **replace** | Era macro de inseto; → Pexels 18446974 (TP-7, product shot) |
| `prop-scattered-papers.jpg` | **replace** | Era laptop + cartão; → Pexels 6539020 |
| `prop-wall-calendar.jpg` | **replace** | Era cena noturna de mesa (ID 669996 ≠ título); → Pexels 37124477 |

## Processo recomendado

1. Copiar URL **da página** do Pexels (slug + ID no path), não inventar ID.
2. Baixar amostra (`?w=800`), abrir e confirmar assunto.
3. Atualizar `assets/manifest/props.json` (`url`, `sourcePage`, `validatedAt` opcional).
4. `npm run assets:fetch` e rever esta tabela.

## Contact sheet (dev)

Amostras de verificação: `artifacts/prop-verify/` (não versionado).
