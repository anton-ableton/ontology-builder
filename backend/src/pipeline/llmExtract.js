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
1. Use ONLY domain-relevant classes
2. Do NOT generate generic AI terms (Ontology, Model, Methodology)
3. objectProperties MUST be from this list if possible:
   - interactsWith
   - participatesIn
   - usesResource
   - supports
   - monitors
   - adaptsTo

4. If relation is not in list, reuse closest one

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
      options: { temperature: 0 }
    })
  });

  const data = await res.json();

  const ontology = safeParseOntology(data.response);

  if (!ontology) {
    console.log('⚠️ Invalid ontology skipped');
    return null;
  }

  const cleaned = cleanOntology(ontology);

  return cleaned;
}
