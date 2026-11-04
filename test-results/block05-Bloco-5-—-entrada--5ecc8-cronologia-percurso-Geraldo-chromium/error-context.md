# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: block05.spec.ts >> Bloco 5 — entrada, Jana pelos autos, revisão, cronologia, percurso, Geraldo
- Location: tests\e2e\block05.spec.ts:23:1

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for getByTestId('pc-doc-back')
    - locator resolved to <button type="button" class="pc-back" aria-label="Voltar" data-testid="pc-doc-back">‹</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <p class="vn-nvl__text">Nico apontou uma inconsistência real. A jaqueta é…</p> from <div class="tr-refl-layer" data-testid="block05-solo-reflection">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <p class="vn-nvl__text">Nico apontou uma inconsistência real. A jaqueta é…</p> from <div class="tr-refl-layer" data-testid="block05-solo-reflection">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    16 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <p class="vn-nvl__text">Nico apontou uma inconsistência real. A jaqueta é…</p> from <div class="tr-refl-layer" data-testid="block05-solo-reflection">…</div> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=f1e2]:
  - main "SATURNUS — mesa de investigação" [ref=f1e3]:
    - generic [ref=f1e5]:
      - generic [ref=f1e6]:
        - button "Mapa da cidade e locais conhecidos" [ref=f1e7] [cursor=pointer]
        - generic:
          - generic: "4"
          - button "Celular profissional de Augusto" [ref=f1e8] [cursor=pointer]:
            - generic [ref=f1e10]:
              - generic [ref=f1e12]: 22:14
              - generic [ref=f1e13]: terça, 13 de outubro
              - generic [ref=f1e14]:
                - generic [ref=f1e16]: Chamadas
                - emphasis [ref=f1e17]: 2 perdidas
        - button "Computador policial" [ref=f1e18] [cursor=pointer]
        - button "Pasta do caso" [ref=f1e19] [cursor=pointer]
        - button "Caderno de investigação" [ref=f1e20] [cursor=pointer]
        - button "Celular apreendido de Mariana" [ref=f1e21] [cursor=pointer]:
          - generic [ref=f1e23]:
            - generic [ref=f1e25]: 22:14
            - generic [ref=f1e26]: terça, 13 de outubro
            - generic [ref=f1e27]:
              - generic [ref=f1e29]: WhatsApp
              - emphasis [ref=f1e30]: "Júlia: Você viu a Mariana?"
          - generic [ref=f1e31]: EV-01
        - generic:
          - generic: "13"
          - button "Bancada de análise de áudio" [ref=f1e32] [cursor=pointer]
        - button "Telefone fixo da delegacia" [ref=f1e33] [cursor=pointer]
        - generic [aria-hidden]:
          - generic: Mapa da cidade
          - generic: Celular de Augusto
          - generic: Computador
          - generic: Pasta do caso
          - generic: Caderno de investigação
          - generic: Celular apreendido
          - generic: Bancada de áudio
          - generic: Telefone da delegacia
      - generic:
        - paragraph [aria-hidden]: Caso 0001/2026
        - complementary "Bloco de notas de Augusto":
          - button "Pendências 1" [ref=f1e34] [cursor=pointer]:
            - generic [ref=f1e35]: Pendências
            - generic [ref=f1e36]: "1"
          - generic [aria-hidden]:
            - paragraph: CASO MARIANA SILVA
            - list:
              - listitem: Reavaliar o que a linha Maralto explica — e o que não explica
              - listitem: Voltar a falar com Nico sobre a Noite X
              - listitem: Localizar Jana nos autos do caso Elisa
              - listitem: Ir ao endereço de Jana Ribeiro
              - listitem: Revisar as peças que sustentaram a condenação de André
      - generic [ref=f1e37]:
        - button "Pular" [ref=f1e39] [cursor=pointer]
        - generic [ref=f1e42]:
          - paragraph [ref=f1e43]: AUGUSTO
          - paragraph [ref=f1e44]: Nico apontou uma inconsistência real. A jaqueta é outro detalhe estranho. Jana omitiu o óbvio até ser perguntada.
      - dialog "Sistema de consulta" [ref=f1e47]:
        - generic [ref=f1e48]:
          - button "Sair" [ref=f1e49] [cursor=pointer]:
            - generic [aria-hidden] [ref=f1e50]: ‹
            - text: Sair
          - generic [ref=f1e51]:
            - generic [ref=f1e52]: Polícia Civil
            - heading "Sistema de consulta" [level=2] [ref=f1e53]
          - generic [ref=f1e54]: Insp. Augusto Nogueira · designação interina · 19:49
        - generic [ref=f1e57]:
          - navigation "Seções do sistema" [ref=f1e58]:
            - button "Consultas" [ref=f1e59] [cursor=pointer]
            - button "Ocorrências" [ref=f1e60] [cursor=pointer]
            - button "Processos / Autos" [ref=f1e61] [cursor=pointer]
            - button "Documentos" [ref=f1e62] [cursor=pointer]
            - button "Perícia" [ref=f1e63] [cursor=pointer]
            - button "Caso" [ref=f1e64] [cursor=pointer]
            - paragraph [ref=f1e65]: Acesso restrito.Consultas são registradas.
          - generic [ref=f1e67]:
            - button "Voltar" [ref=f1e68] [cursor=pointer]: ‹
            - article [ref=f1e69]:
              - paragraph [ref=f1e70]: Autos
              - heading "Peças — testemunha próxima à região da queda" [level=3] [ref=f1e71]
              - paragraph [ref=f1e72]: Vara Criminal — resumo · Proc. 2020
              - paragraph [ref=f1e73]: Uma testemunha afirmou ter visto, próximo à região da queda, alguém com porte semelhante ao de André Silva.
              - paragraph [ref=f1e74]: A identificação visual não foi inequívoca; o conjunto probatório, contudo, sustentou a condenação.
  - status [ref=f1e75]:
    - button "Fechar" [ref=f1e76] [cursor=pointer]: ×
    - generic [ref=f1e77]: EVIDÊNCIA ADQUIRIDA
    - 'heading "Autos: discussão e ciúmes entre André e Elisa" [level=3] [ref=f1e82]'
    - paragraph [ref=f1e83]: Pasta do caso
    - paragraph [ref=f1e84]: Arquivada no caderno.
    - button "Ver no caderno" [ref=f1e86] [cursor=pointer]
  - button "DEV" [ref=f1e87]
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test'
  2   | import {
  3   |   closeHub,
  4   |   dev,
  5   |   dismissEvidenceCards,
  6   |   newGame,
  7   |   openHubObject,
  8   |   readSave,
  9   |   searchAndOpen,
  10  |   waitForNotice,
  11  | } from './helpers'
  12  | 
  13  | test.use({ viewport: { width: 1920, height: 1080 } })
  14  | 
  15  | async function skipSoloReflection(page: import('@playwright/test').Page) {
  16  |   const layer = page.getByTestId('block05-solo-reflection')
  17  |   if (await layer.isVisible().catch(() => false)) {
  18  |     await page.getByTestId('reflection-skip').click()
  19  |     await expect(layer).toBeHidden({ timeout: 8000 })
  20  |   }
  21  | }
  22  | 
  23  | test('Bloco 5 — entrada, Jana pelos autos, revisão, cronologia, percurso, Geraldo', async ({ page }) => {
  24  |   test.setTimeout(240_000)
  25  |   await newGame(page)
  26  |   await dev(page, 'b05-start')
  27  | 
  28  |   let save = await readSave(page)
  29  |   expect(save.flags.block05_started).toBe(true)
  30  |   expect(save.locations.titan.status).toBe('visitAvailable')
  31  |   expect(save.tasks.some((t: { id: string }) => t.id === 'task_press_nico')).toBe(true)
  32  | 
  33  |   // Segunda conversa com Nico (checkpoint: mesma progressão dos handlers da cena).
  34  |   await dev(page, 'b05-after-nico2')
  35  |   save = await readSave(page)
  36  |   expect(save.flags.block05_nico_followup_done).toBe(true)
  37  |   expect(save.evidenceOwned).toContain('nico_believes_jacket_jana')
  38  |   expect(save.flags.block05_jana_search_unlocked).toBe(true)
  39  | 
  40  |   // Jana pelos autos — sem botão automático de entrevista.
  41  |   await openHubObject(page, 'monitor')
  42  |   await page.getByTestId('pc-nav-consultas').click()
  43  |   await page.getByTestId('police-search-input').fill('jana')
  44  |   await page.getByTestId('police-search-submit').click()
  45  |   await expect(page.getByTestId('search-open-doc-elisa-jana')).toBeVisible()
  46  |   await page.getByTestId('search-open-doc-elisa-jana').click()
  47  |   await expect(page.getByTestId('case-document-view')).toBeVisible()
  48  |   await closeHub(page)
  49  |   await waitForNotice(page, 'discovery-location')
  50  |   save = await readSave(page)
  51  |   expect(save.locations['jana-casa'].status).toBe('visitAvailable')
  52  |   expect(save.people.jana.status).toBe('located')
  53  | 
  54  |   await openHubObject(page, 'wall-map')
  55  |   await page.getByTestId('map-pin-jana-casa').click()
  56  |   await expect(page.getByTestId('visit-jana-casa')).toBeVisible()
  57  |   await closeHub(page)
  58  | 
  59  |   await dev(page, 'b05-after-jana')
  60  |   save = await readSave(page)
  61  |   expect(save.evidenceOwned).toContain('jana_confirms_jacket')
  62  |   expect(save.evidenceOwned).toContain('jana_loan_explanation')
  63  |   expect(save.flags.block05_elisa_review_unlocked).toBe(true)
  64  | 
  65  |   await openHubObject(page, 'monitor')
  66  |   await page.getByTestId('pc-nav-consultas').click()
  67  |   for (const docId of ['doc-elisa-argumento', 'doc-elisa-alibi', 'doc-elisa-testemunha-queda']) {
  68  |     await page.getByTestId('police-search-input').fill('elisa')
  69  |     await page.getByTestId('police-search-submit').click()
  70  |     await page.getByTestId(`search-open-${docId}`).click()
  71  |     await expect(page.getByTestId('case-document-view')).toBeVisible()
> 72  |     await page.getByTestId('pc-doc-back').click()
      |                                           ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  73  |     await page.getByTestId('pc-nav-consultas').click()
  74  |   }
  75  |   await skipSoloReflection(page)
  76  |   await closeHub(page)
  77  |   await dismissEvidenceCards(page)
  78  |   await skipSoloReflection(page)
  79  |   save = await readSave(page)
  80  |   expect(save.flags.block05_elisa_review_done).toBe(true)
  81  |   expect(save.hypotheses.hyp_mariana_needed_brother).toBeTruthy()
  82  | 
  83  |   await skipSoloReflection(page)
  84  |   await openHubObject(page, 'monitor')
  85  |   await page.getByTestId('pc-nav-caso').click()
  86  |   await page.getByTestId('b05-weigh-maralto').click()
  87  |   await closeHub(page)
  88  |   await skipSoloReflection(page)
  89  |   save = await readSave(page)
  90  |   expect(save.flags.block05_chronology_action_unlocked).toBe(true)
  91  | 
  92  |   await openHubObject(page, 'monitor')
  93  |   await page.getByTestId('pc-nav-caso').click()
  94  |   await page.getByTestId('b05-organize-chronology').click()
  95  |   await page.getByTestId('b05-compare-files').click()
  96  |   await page.getByTestId('b05-revisit-emergency').click()
  97  |   await closeHub(page)
  98  |   await dismissEvidenceCards(page)
  99  |   await skipSoloReflection(page)
  100 | 
  101 |   save = await readSave(page)
  102 |   expect(save.flags.block05_complete).toBe(true)
  103 |   expect(save.hypotheses.hyp_deliberate_path).toBeTruthy()
  104 |   expect(save.evidenceOwned).toContain('mariana_sought_people_before')
  105 |   expect(save.evidenceOwned).toContain('phone_files_depend_on_order')
  106 |   expect(save.evidenceOwned).toContain('call_enabled_apartment_entry')
  107 |   expect(save.evidenceOwned).toContain('phone_seized_after_call')
  108 |   expect(save.tasks.some((t: { id: string }) => t.id === 'task_reexamine_elisa_from_scratch')).toBe(true)
  109 |   expect(save.documentsOwned).toContain('doc-elisa-geraldo-depoimento')
  110 | })
  111 | 
```