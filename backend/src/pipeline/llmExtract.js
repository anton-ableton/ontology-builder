import fetch from 'node-fetch';
import { safeParseOntology } from '../utils/safeParseOntology.js';
import { cleanOntology } from '../utils/cleanOntology.js';

export async function extractOntology(chunk) {

const prompt = `
You are building an ontology for Smart Learning Environments (SLE).

DOMAIN:
Smart Learning Environment includes:
- Learner
- Teacher
- Learning System
- Learning Activity
- Learning Resource
- Learning Analytics

RULES:
1. Prefer domain-relevant classes, but extract any meaningful entities from the text.
  IMPORTANT:
  - Use consistent naming (CamelCase, no spaces)
  - Avoid duplicates like "Learning System" vs "LearningSystem"
  - Reuse existing class names when possible
2. Do NOT generate generic AI terms (Ontology, Model, Methodology)
3. objectProperties MUST be from this list if possible:
   - interactsWith
   - participatesIn
   - usesResource
   - supports
   - monitors
   - adaptsTo

4. If relation is not in list, reuse closest one
5. Use EXACT class names consistently (no variations like "Learning System" vs "LearningSystem")

Return STRICT JSON:

{
  "classes": [
    {
      "name": "string",
      "description": "string",
      "parent": "string or null"
    }
  ],
  "objectProperties": [
    {
      "name": "string",
      "domain": "string",
      "range": "string",
      "description": "string"
    }
  ]
}

TEXT:
${chunk}
`;

  const res = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    body: JSON.stringify({
      model: 'llama3.2',
      prompt,
      stream: false,
      format: 'json',
      options: { temperature: 0 }
    })
  });

  const data = await res.json();

  const ontology = safeParseOntology(data.response);

  if (!ontology) {
    return null;
  }

  const cleaned = cleanOntology(ontology);
  return cleaned;
}
