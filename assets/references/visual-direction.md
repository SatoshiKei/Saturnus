# Referência visual — SATURNUS (VN foto real)

## Inspiração (não canon, não copiar assets)

- **Umineko / Ryukishi07 (07th Expansion)**: composição de CGs fotográficas ou pintadas com atmosphere pesada, granulação, cores contidas, interiors domestic e institucionais opressivos.
- Este projeto usa **fotos stock reais** + pipeline em `scripts/process-vn-backgrounds.mjs`.

## Pipeline (processed/)

1. Resize max 1920px largura  
2. Saturação ~72%, brilho levemente reduzido  
3. Contraste moderado (linear)  
4. Blur 0.35px (compressão de detalhe)  
5. Matriz de cor fria/melancólica (recomb)  
6. Granulação overlay ~8%  
7. Vinheta radial suave  
8. Export JPEG q=88  

Originais intactos em `assets/backgrounds/raw/`.

## Prioridade geográfica

Sudeste BR (RJ, Niterói, Baixada, Santos, Vitória, cidades médias) quando houver candidato equivalente; senão genérico cropável.
