// Synthetic conference fixtures, not university regulations or student records.
export const cases = [
  {
    id: 'practice',
    module: 'practice',
    title: 'Практика П-17',
    source:
      'Руководитель не назначен. Крайний срок отчёта: 2026-10-15. Отчёт сдан 2026-10-17.',
    facts: {
      supervisor: 'не назначен',
      due: '2026-10-15',
      submitted: '2026-10-17'
    }
  },
  {
    id: 'course',
    module: 'course',
    title: 'Дискретная математика · группа М-21',
    source:
      'Дисциплина: Дискретная математика. Группа: М-21. Преподаватель: Ирина Лесова.',
    facts: {
      discipline: 'Дискретная математика',
      group: 'М-21',
      teacher: 'Ирина Лесова'
    }
  },
  {
    id: 'thesis',
    module: 'thesis',
    title: 'Выпускная работа В-04',
    source:
      'Руководитель: Ирина Лесова. Срок представления работы: 2026-05-20. Работа представлена 2026-05-20.',
    facts: {
      supervisor: 'Ирина Лесова',
      due: '2026-05-20',
      submitted: '2026-05-20'
    }
  },
  {
    id: 'assignment',
    module: 'assignment',
    title: 'Учебное поручение У-08',
    source:
      'Исполнитель: Ирина Лесова. Начало поручения: 2026-09-15. Окончание поручения: 2026-09-12.',
    facts: { teacher: 'Ирина Лесова', start: '2026-09-15', end: '2026-09-12' }
  }
]
