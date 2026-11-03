# Assets — biblioteca VN (fotos)

## Estrutura

```
assets/
  backgrounds/raw/<categoria>/     originais baixados
  backgrounds/processed/<categoria>/  tratamento VN (pipeline)
  props/raw/                       props para recorte futuro
  props/processed/                 (reservado)
  references/                      direção visual
  manifest/                        JSON + logs de download/process
docs/assets/
  background-inventory.md          inventário gerado
  background-validation.md         auditoria visual (ok / reject)
  props-validation.md              auditoria visual dos props
  scene-map.md                     mapa narrativo (placeholder)
```

## Comandos

```bash
npm install
npm run assets:fetch      # baixa raw a partir dos manifests
npm run assets:process    # gera processed/ (flags process:true)
npm run assets:inventory  # regenera background-inventory.md
npm run assets:vn         # fetch + process + inventory
```

## Manifests

- `assets/manifest/backgrounds.json` — cenários por categoria
- `assets/manifest/props.json` — objetos clicáveis

Edite URLs/metadados no JSON e rode `assets:fetch` de novo. Originais nunca são sobrescritos pelo processador.

Validação: confira `props-validation.md` / `background-validation.md`. Para Pexels, o ID na URL deve ser o mesmo da slug em `sourcePage`. Diagnóstico: `node scripts/check-bg-url-mismatch.mjs`.
