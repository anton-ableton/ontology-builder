import { mentionedClasses } from '../domain/vocabulary.js'
import { profile } from '../domain/model.js'
import { generateJSON } from '../llm/client.js'
import { ontologyPrompt } from '../llm/prompts.js'
const str = { type: 'string' }
const objects = (properties, required = Object.keys(properties)) => ({
  type: 'array',
  items: { type: 'object', properties, required }
})
const schema = {
  type: 'object',
  required: ['classes', 'objectProperties'],
  properties: {
    classes: objects({
      name: str,
      description: str,
      parent: { type: ['string', 'null'] }
    }),
    objectProperties: objects({
      name: str,
      domain: str,
      range: str,
      description: str
    })
  }
}
export async function extractOntology(chunk) {
  const result = await generateJSON(ontologyPrompt(profile, chunk), schema)
  if (
    !Array.isArray(result?.classes) ||
    !Array.isArray(result?.objectProperties)
  )
    throw Error('Некорректная структура онтологии')
  return {
    ...result,
    classes: [...result.classes, ...mentionedClasses(profile, chunk)]
  }
}
