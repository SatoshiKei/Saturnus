# SATURNUS

Fundação visual e técnica (bootstrap): mesa de investigação composável + smartphone interativo com apps mock (WhatsApp, Notas, Calendário). Sem backend, puzzle ou narrativa canon.

## Stack

- Vite 8 + React 19 + TypeScript (ESM)
- Vitest + Testing Library (unitários)
- Playwright (E2E + screenshots)

## Como rodar

```bash
npm install
npm run dev          # http://localhost:5173
npm run build
npm run preview      # :4173 (Playwright E2E usa :4174 — ver playwright.config.ts)
npm test
npm run test:e2e
```

Áudio de teste: `npm run audio:generate`

## Arquitetura

```
src/
  app/           App, PhoneSessionContext
  scene/         Scene, SceneObject, composição
  phone/         PhoneShell, PhoneHome, PhoneAppRouter
  apps/          whatsapp, notes, calendar
  components/    shared (Avatar, …)
  data/          mocks + sceneComposition.ts
  lib/           phoneRouter, sceneLayout, assetPath
  types/
  styles/
public/assets/   scene, audio, source
tests/unit/      Vitest
tests/e2e/       Playwright
docs/ASSETS.md   licenças
```

Estado do telefone: `PhoneSessionContext` (aberto/fechado + pilha de rotas). Sem Redux.

## Dados mock

| Arquivo | Conteúdo |
| --- | --- |
| `src/data/mockContacts.ts` | Contatos WhatsApp |
| `src/data/mockChats.ts` | Conversas e mensagens |
| `src/data/mockNotes.ts` | Notas |
| `src/data/mockCalendar.ts` | Eventos |
| `src/data/sceneComposition.ts` | Objetos da cena |

Textos e nomes são **descartáveis**, não canon.

## Assets

- Processados: `public/assets/scene/`
- Originais: `public/assets/source/`
- Registro: `docs/ASSETS.md`

## Adicionar objeto na cena

Edite `src/data/sceneComposition.ts` e inclua um item com `id`, `asset` (ou `kind: 'phone'`), `x`, `y`, `width`, `height`, `zIndex`, etc. Resolução base: **1920×1080**.

## Adicionar app no telefone

1. Tipo em `src/types/phone.ts` (`PhoneAppId`, rotas se necessário).
2. Ícone em `PhoneHome.tsx`.
3. Rota em `PhoneAppRouter.tsx` + componente em `src/apps/`.

## Adicionar conversa WhatsApp

1. Contato em `mockContacts.ts` (se novo).
2. Thread em `mockChats.ts` com `messages` tipadas (`ChatMessage`).

## Adicionar tipo de mensagem

1. Variante em `src/types/messaging.ts`.
2. Dados em `mockChats.ts`.
3. Render em `MessageBubble.tsx` (+ componente dedicado se fizer sentido).

## Screenshots E2E

Gerados em `artifacts/saturnus-bootstrap/` ao rodar `npm run test:e2e`.
