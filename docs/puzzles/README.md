# Puzzles forenses — documentação dev

| Documento | Uso |
|-----------|-----|
| **[PUZZLES_MASTER.md](PUZZLES_MASTER.md)** | **Único tutorial compilado** P01–P12 (texto integral de desenvolvimento) |
| `puzzleNN_tutorial.txt` | Espelhos legados — manter em sync ou descontinuar; fonte autoritativa = Master |

**Conclusão técnica QA:** `src/forensic/canonicalPuzzleCompletion.ts`  
**Sessões:** `src/forensic/puzzles/puzzle*.ts` · P10 `RingsSession`.

Ao mudar `doneFlag`, handlers ou `completion.kind`: atualizar a tabela canônica e a seção do puzzle em **PUZZLES_MASTER.md**.