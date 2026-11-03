# Story engine

```ts
interface StoryTrigger {
  id: string
  once?: boolean
  conditions: StoryCondition[]
  actions: StoryActionRef[]
}
```

Adicione triggers em `src/data/game/seedStory.ts`. Após mutações relevantes, `dispatchActions` / `applyStoryActions` chama `runStoryEngine`.

Condições suportadas: `flag`, `evidenceOwned`, `personStatusAtLeast`, `topicKnown`, `appInstalled`, `passwordDiscovered`, `contradictionConfirmed`.

Ações: ver `StoryActionRef` em `src/game/types/index.ts`.
