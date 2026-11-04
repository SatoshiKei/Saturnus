# Bloco 4 — Memórias que não pertencem

Implementação a partir do estado final real do Bloco 3 (`BLOCK_03_OUT_OF_ORDER_NIGHTS.md`).

## Entrada e saída

| | |
|---|---|
| **Entrada** | `block03_complete`, `task_identify_morsa`, Morsa apelido sem identidade, Samuel `identified`, linhas Elisa×Maralto sem vínculo. |
| **Saída** | `block04_complete`, pendência **`task_press_nico`**, hipótese de interferência na memória ativa (não confirmada), interlocutor desconhecido sem identidade. |

## Cenas

| Cena | Componente | Background |
|------|------------|------------|
| Samuel | `SamuelInterviewScene.tsx` | university (reuso) |
| André (prisão) | `AndreInterviewScene.tsx` | hospital corridor (reuso / sala de visita) |

Mapa: `presidio` após registro de visitas. Também via **Pessoas → Entrevistar**.

## Personagens

- **Samuel** — confirma Morsa; não identifica; relata interesse de Mariana em horários.
- **André** — hostil; confirma mudança de Mariana e pedido para parar; nada útil sobre Maralto/Morsa.
- **Contato desconhecido** — só via áudio; sem nome/O Omitido.

## Pesquisas

| Regra | Flag | Termos | Evidência |
|-------|------|--------|-----------|
| `block04_samuel_cadastro` | `block04_samuel_search_unlocked` | `samuel` | `samuel_current_record` |
| `block04_andre_visits` | `block04_andre_records_unlocked` | `andre` | `mariana_andre_visit_record` |
| `block04_prison_chronology` | `block04_chronology_search_unlocked` | `cronologia` | `andre_contact_chronology_mismatch` |

## Puzzle 6 — Hexágono

- **Ciclo:** A → D → B → F → C → E → A  
- **Palavras (ordem do ciclo):** PROCURE / O / QUE / A / TELA / OMITE  
- **Frase:** `PROCURE O QUE A TELA OMITE`  
- **Placeholder:** `hexagon-provisional-panel` / `hexagon-provisional-solve`  
- **Futuro:** metadata + grafo + extração de palavras  
- Dados: `src/data/block04/hexagonPuzzle.ts`

| Nó | Arquivo | Anomalia (provisória) | Aponta | Palavra |
|----|---------|----------------------|--------|---------|
| A | FRAG_A.wav | sampleRate → 22050 | D | PROCURE |
| D | FRAG_D.wav | canais → stereo | B | O |
| B | FRAG_B.wav | checksum parcial | F | QUE |
| F | FRAG_F.wav | codec tag | C | A |
| C | FRAG_C.wav | duração registrada | E | TELA |
| E | FRAG_E.wav | container fecha ciclo | A | OMITE |

Áudios placeholder: `public/assets/audio/hex-a.wav` … `hex-f.wav`.  
Gravação do desconhecido: `unknown-contact-call.wav` / evidência `unknown_contact_recording` (`CHK_UNK.m4a`).

## Perícia e diário

1. Frase → `block04_forensics_unlocked`  
2. Sistema de consulta → Arquivos → varredura  
3. `revealHiddenApps` + `discoverPassword(diary)`  
4. App Diário (senha `demo-diary`)  
5. Entrada “Gravar pra conferir” → `CHK_UNK`  

## Triggers

| ID | Condição | Efeito |
|----|----------|--------|
| `block04_start` | `block03_complete` | busca Samuel + `hyp_morsa_key` |

Handlers: `block04Handlers.ts`.

## Dependências

Samuel ← Morsa (B3) → visitas André → cronologia → 6 áudios → Hexágono → perícia → diário → CHK_UNK → hipótese interferência.

## Hipóteses (fim)

| ID | Estado |
|----|--------|
| `hyp_andre_manipulating` | enfraquecida |
| `hyp_julia_manipulating` | ativa, sem prova |
| `hyp_memory_interference` | nova, ativa |
| `hyp_morsa_key` | ativa |
| Morsa identidade | aberta |

## Checkpoints DEV

`dev-b04-start` … `dev-b04-end`.

## Bloco 5 — entrada

`task_press_nico` — pressionar Nico sobre omissões da Noite X (preparar jaqueta/Jana **sem revelar no B4**).

## Divergências

- Fundo do presídio reutiliza corredor hospitalar (sem crop novo).  
- Provocação dos seis áudios usa `ProvocationBanner` + evidências na bancada.  
- Diário só acessível após perícia (`block04_forensics_done`), mesmo se Settings revelar apps.  
- Senha do diário permanece `demo-diary` (já existente).  
