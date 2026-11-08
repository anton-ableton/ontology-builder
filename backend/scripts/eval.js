import { cases } from '../src/domain/cases.js'
import { moduleOf } from '../src/domain/model.js'
import { propose } from '../src/llm/extract.js'
import { settings } from '../src/llm/client.js'
const examples = [
  ...cases,
  {
    id: 'silence',
    module: 'practice',
    source: 'Студент уточнил порядок оформления дневника.',
    facts: {}
  },
  {
    id: 'planned-review',
    module: 'practice',
    source:
      'Защита запланирована на 2026-10-20. Сведений о проведении защиты нет.',
    facts: {}
  }
]
examples.push(
  {
    id: 'prose',
    module: 'practice',
    source:
      'В приказе Мария Зорина указана как руководитель практики. Студент принёс отчёт 2026-11-03.',
    facts: { supervisor: 'Мария Зорина', submitted: '2026-11-03' }
  },
  {
    id: 'unrelated',
    module: 'course',
    source: 'Сотрудники обсуждали замену мебели в кабинете.',
    facts: {}
  },
  {
    id: 'missing-appointment',
    module: 'practice',
    source: 'Вопрос о назначении руководителя пока не обсуждался.',
    facts: {}
  },
  {
    id: 'same-day',
    module: 'assignment',
    source: 'Работа началась 2026-09-01 и закончилась 2026-09-01.',
    facts: { start: '2026-09-01', end: '2026-09-01' }
  }
)
examples.push(
  {
    id: 'russian-dates',
    module: 'practice',
    source: 'Крайний срок отчёта: 15.10.2026. Отчёт сдан 17 октября 2026 года.',
    facts: { due: '2026-10-15', submitted: '2026-10-17' }
  },
  {
    id: 'initials',
    module: 'course',
    source: 'Преподаватель: И. К. Соколова. Группа: Л-11.',
    facts: { teacher: 'И. К. Соколова', group: 'Л-11' }
  }
)
// Additional free-form examples, separate from the 12 prompt-development cases.
examples.push(
  {
    id: 'check-free-1',
    module: 'practice',
    source:
      'Практику курирует Антон Беляев. Отчёт студент передал 02.11.2026. Дату защиты уточнят на следующей неделе.',
    facts: { supervisor: 'Антон Беляев', submitted: '2026-11-02' }
  },
  {
    id: 'check-free-2',
    module: 'thesis',
    source:
      'Текст ВКР в карточке: не приложен. Фамилию руководителя секретарь ещё уточняет.',
    facts: { document: 'не приложен' }
  },
  {
    id: 'check-free-3',
    module: 'course',
    source:
      'В осеннем семестре занятия по дисциплине Логика посещает группа Б-09.',
    facts: { semester: 'осеннем семестре', discipline: 'Логика', group: 'Б-09' }
  }
)
let correct = 0,
  proposed = 0,
  expected = 0,
  exact = 0
console.log('Provider:', settings().provider, settings().model)
for (const sample of examples) {
  const t = Date.now(),
    { items, warnings } = await propose(moduleOf(sample.module), sample.source)
  const n = items.filter((x) => sample.facts[x.key] === x.value).length,
    k = Object.keys(sample.facts).length
  correct += n
  proposed += items.length
  expected += k
  exact += Number(n === k && items.length === k)
  console.log(
    JSON.stringify({
      id: sample.id,
      items,
      warnings,
      match: n,
      expected: k,
      ms: Date.now() - t
    })
  )
}
console.log(
  JSON.stringify({
    correct,
    proposed,
    expected,
    exactCases: exact,
    cases: examples.length
  })
)
