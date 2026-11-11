// Identifiers are shared by the API, navigation and RDF export.
export const people = {
  palchunov: 'Д. Е. Пальчунов',
  yakhyaeva: 'Г. Э. Яхъяева',
  rylov: 'В. Ю. Рылов'
}
export const organizations = {
  nsu: 'Новосибирский государственный университет',
  koi: 'Кафедра общей информатики ФИТ НГУ',
  sobolev: 'Институт математики им. С. Л. Соболева СО РАН'
}
export const roles = {
  author: 'Автор программы',
  lecturer: 'Лектор курса',
  teacher: 'Преподаватель группы',
  universitySupervisor: 'Руководитель от НГУ',
  hostSupervisor: 'Руководитель от организации',
  thesisSupervisor: 'Руководитель ВКР',
  chair: 'Заведующий кафедрой на титуле'
}
const archive = 'https://fit-old.nsu.ru/data_/docs/'
export const processes = [
  {
    id: 'logic',
    module: 'course',
    type: 'Discipline',
    period: '2012',
    title: 'Прикладная логика',
    source: {
      label: 'Проект программы дисциплины',
      location: 'с. 1–2',
      url: archive + 'mag/program/2012-2014/PL.pdf'
    },
    facts: { discipline: 'Прикладная логика' },
    participants: { author: 'palchunov' },
    positions: { author: 'koi', teacher: 'koi' }
  },
  {
    id: 'java',
    module: 'course',
    type: 'Discipline',
    period: '2016',
    title: 'Объектно-ориентированное программирование на Java',
    source: {
      label: 'Рабочая программа дисциплины',
      location: 'титул и сведения о разработчике',
      url: archive + 'bak/OOP/4_RPD/09.03.01/_09.03.01_B13_rpd.pdf'
    },
    facts: {
      discipline: 'Объектно-ориентированное программирование на Java',
      semester: '4',
      lesson: 'Лабораторные занятия',
      assessment: 'Экзамен'
    },
    participants: { author: 'rylov' },
    positions: { author: 'koi', teacher: 'koi' }
  },
  {
    id: 'practice2018',
    module: 'practice',
    type: 'Practice',
    period: '2018',
    title: 'Учебная практика в ИМ СО РАН',
    source: {
      label: 'Приказ о направлении на практику',
      location: 'п. 2, строка об ИМ СО РАН',
      url: archive + 'prikazy/practika/Pract_uch_bak_280918.pdf'
    },
    facts: {},
    participants: {
      universitySupervisor: 'palchunov',
      hostSupervisor: 'palchunov'
    },
    positions: { universitySupervisor: 'nsu', hostSupervisor: 'sobolev' }
  },
  {
    id: 'thesis2022',
    module: 'thesis',
    type: 'Thesis',
    period: '2022',
    title: 'ВКР о диверсификации портфеля ценных бумаг',
    source: {
      label: 'Магистерская ВКР и задание',
      location: 'с. 1–2',
      url: 'https://bnct.inp.nsk.su/students/Diplom_M_Kuznetsov.pdf'
    },
    facts: { document: 'Diplom_M_Kuznetsov.pdf', due: '2022-05-20' },
    participants: { chair: 'palchunov', thesisSupervisor: 'yakhyaeva' },
    positions: { chair: 'koi', thesisSupervisor: 'koi' }
  },
  {
    id: 'programmingLogic',
    module: 'course',
    type: 'Discipline',
    period: '2025',
    title: 'Логические основы программирования',
    source: {
      label: 'Сообщение НГУ о хакатоне «Тезис Чёрча»',
      location: 'абзац о лекторах',
      url: 'https://t.me/s/nsuniversity/7114'
    },
    facts: { discipline: 'Логические основы программирования' },
    participants: { lecturer: 'yakhyaeva' },
    positions: { lecturer: 'koi', teacher: 'koi' }
  }
]
