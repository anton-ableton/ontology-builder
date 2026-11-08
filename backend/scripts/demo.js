import { cases } from '../src/domain/cases.js'
import { moduleOf, graphFor, evaluate } from '../src/domain/model.js'
for (const c of cases) {
  console.log('\n' + c.title)
  const mod = moduleOf(c.module)
  console.table(evaluate(mod, graphFor(mod, c.facts)))
}
