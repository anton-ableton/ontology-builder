// Whole terms only: a mention suggests a class, never a fact about an individual.
export function mentionedClasses(profile, source) {
  const terms = (s) =>
    s
      .normalize('NFC')
      .toLocaleLowerCase('ru')
      .match(/[\p{L}\p{N}]+/gu) || []
  const haystack = ' ' + terms(source).join(' ') + ' '
  return Object.entries(profile.classes)
    .filter(([id, label]) =>
      [id, label].some((s) => haystack.includes(' ' + terms(s).join(' ') + ' '))
    )
    .map(([name, description]) => ({ name, description, parent: null }))
}
