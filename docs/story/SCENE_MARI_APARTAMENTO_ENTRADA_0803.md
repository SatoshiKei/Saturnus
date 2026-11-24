# Cena — entrada no apartamento de Mariana (03/11, ~08:21)

Documento de **desenho narrativo + produção** (dev).  
Função: transformar o **celular** em objeto inquietante — experiência sensorial que o relatório institucional não carrega. **Não** recapitular P01 nem a chamada das 08:03.

**Copy de jogo (beats):** `src/data/block01/mariApartmentReconstructionBeats.ts`

---

## Resumo em uma frase

Mari (na base) reconstrói para Augusto o relato que ouviu pelo rádio; a sequência visual mostra corredor → porta → entrada → apartamento vazio → som **Melodie** → quarto → **celular no chão**, tela acesa — **~90 s**, áudio diegético → score.

---

## Decisões canônicas (fechadas)

| Tópico | Decisão | Não fazer |
|--------|---------|-----------|
| **Mari** | Sempre na **base**; reconstrução = relato do rádio, não memória dela | Sprite Mari no apartamento; POV de quem subiu |
| **Celular** | **Quarto**, **chão**, tela acesa, toque Melodie | Sofá/sala; meta-explicação de relatório antigo |
| **Documento** | `doc-entrada-apartamento` + BO alinhados (quarto/piso) | Discrepância comentada in-game |
| **Melodie** | Diegético abafado → **score** no corredor interno → excerpt no reveal | Toque contínuo ~119 s; duração da cena = duração do MP3 |
| **Diego** | **Silhueta** na reconstrução (como no relato da viatura); **sem fala** própria | Diego como subplot ou depoimento na cena |
| **Duração** | **~90 s** reconstrução + presente enxuto | Segurar jogador até o fim do arquivo |

---

## Roteiro canônico (copy aprovada)

### Presente — Delegacia

**Mari:** O senhor só vai ver horário e termo de apreensão no papel. Naquela manhã, o senhor ainda não tava aqui.

**Mari:** Eu fiquei na base ouvindo o rádio entrar picado, enquanto o Delegado Siqueira puxava o comando da ocorrência.

**Augusto:** E o que chegou pra você?

**Mari:** A viatura no corredor, o vizinho ali, o apartamento vazio e um toque que não parava. Foi mais ou menos assim que o quadro se montou pra mim pelo rádio.

---

### Reconstrução pelo rádio (08:21–08:26 · ~90 s)

*Narração* — Corredor do prédio. O ar é pesado, de manhã parada, com o som distante da rua lá embaixo. Diego está do lado de fora, esperando, olhando a porta fechada.

*Narração* — A campainha toca uma vez. Silêncio. Toca de novo. Atrás da madeira, mal dá pra ouvir um som abafado — Melodie — vindo lá de dentro, fraco, como se estivesse num cômodo afastado.

**PM (rádio):** Base, sem resposta na porta. Vizinho no corredor confirmou que ninguém abriu.

*Narração* — Do outro lado do rádio, o estalo da linha abre antes da voz. O silêncio no corredor se estende por alguns segundos, só com o zumbido do aparelho e a respiração curta de quem espera resposta.

**Delegado Siqueira (rádio):** Autorizada a entrada. Registra o horário e mantém o canal aberto.

**Mari (rádio):** Copiado. Horário marcado, termo pronto.

*Narração* — A chave gira, a trava cede e a porta abre devagar. O som abafado de Melodie ganha um pouco mais de espaço assim que a fresta se abre.

*Narração* — A sala está vazia, com a luz acesa, sem pressa aparente de saída violenta, mas com aquele vazio esquisito de casa que ficou sozinha. O toque continua lá dentro, marcando o compasso enquanto os policiais avançam pelo corredor interno.

**PM (rádio):** Entrando. Sala vazia, luz acesa. Seguindo o som.

*Narração* — No corredor interno, o som de Melodie vai deixando de parecer só um detalhe de ambiente e passa a acompanhar cada passo, denso, insistente, puxando a atenção até o fim do corredor.

*Narração* — Quarto vazio. Sem ninguém no cômodo. No meio do chão, a tela acesa corta a penumbra com uma claridade fria enquanto Melodie toca sozinha no ambiente.

**PM (rádio):** Tem um aparelho aqui no chão, ligado, tocando. Ninguém no apartamento.

*Narração* — O toque ecoa mais alguns segundos no quarto vazio antes de o registro fotográfico entrar, o lacre ser colocado e o som ir cedendo até sobrar só o silêncio do lugar.

---

### Presente — Fechamento

**Mari:** No papel ficou registro às oito e vinte e seis, aparelho apreendido.

**Mari:** Só que pelo rádio, por alguns segundos, pareceu que tinham achado alguém. E não tinha ninguém.

**Augusto:** Só o telefone tocando sozinho.

**Mari:** É. Exatamente isso.

---

## Áudio — Melodie

**Arquivo:** `public/assets/audio/phone/melodie.mp3` (loop na cena, não duração total do arquivo).

**Regra:** o player **só inicia** no beat `apt-rec-5`, quando a narração diz que um som começa a vazar de dentro. Antes disso, silêncio. Volume sobe por beat até o plano do celular; no fecho da reconstrução (`apt-rec-22`) recua.

---

## Fluxo de produção

```
PRESENTE (Mari enquadra)
    → RECONSTRUÇÃO (~90s, narração + rádio + BG)
    → PRESENTE (fechamento: ninguém / só telefone)
```

Diego: figura estática no corredor no beat 1 — o que a viatura **relatou**; não precisa retrato VN nem diálogo.

---

## Canon documental

| Documento | Conteúdo relevante |
|-----------|-------------------|
| `doc-entrada-apartamento` | 08:21 campainha; vizinho no corredor; 08:26 quarto, celular no piso, toque ativo |
| `doc-bo-inicial` | Celular no quarto, no piso, ligado |
| `doc-apreensao-celular` | Item ligado sob custódia |

Implementado em `seedDocuments.ts`.

---

## Onde encaixar no jogo

| Prioridade | Gancho | Condição |
|------------|--------|----------|
| **1** | Consulta **`doc-entrada-apartamento` + `doc-apreensao-celular`** (ambos lidos) | `¬mari_flashback_apt_0803_seen` |
| **2** | Galeria dev | checkpoint B1 |

**Runtime:** player VN consumindo `mariApartmentReconstructionBeats.ts`; timeline de áudio custom; flag `mari_flashback_apt_0803_seen`.

---

## Assets (somente 2 fundos)

| Uso | Asset | Fonte |
|-----|--------|--------|
| Porta (até abrir) | `public/assets/scenes/apartment/porta-angelim-solida-fri-13.webp` | Asset local — porta angelim |
| Interior (quarto vazio; celular na cena = Melodie + texto) | `public/assets/scenes/apartment/mariana-402-interior-phone.jpg` | Pexels 7027998 — Curtis Adams |

Manifest: `assets/manifest/mariana-402-scenes.json`  
Regenerar: `python tools/assets/build_mariana_402_scene_assets.py` (baixa das URLs, 1920×1080).

Diego: só narração. Copy canônica: `mariApartmentReconstructionBeats.ts`.

---

## Checklist

- [x] Copy aprovada em `.md` + `mariApartmentReconstructionBeats.ts`
- [x] `seedDocuments` (entrada + BO)
- [x] Scene player + áudio Melodie
- [x] Hook dois laudos (entrada + apreensão)
- [x] `Melodie.mp3` no Arquivos do celular de Mariana
- [ ] STORY_MASTER dump

---

## IDs

| id | Uso |
|----|-----|
| `mari_flashback_apt_0803_seen` | One-shot |
| `scene-mari-apartment-0803-reconstruction` | Galeria / SceneId |

---

*Roteiro aprovado pelo autor — runtime pendente.*