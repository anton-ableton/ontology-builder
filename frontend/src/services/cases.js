import { requestJson, postJson } from './http'
export const loadCatalog = (signal) =>
  requestJson('/api/case/catalog', { signal })
export const checkFacts = (module, facts, caseId, signal) =>
  postJson(
    '/api/case/check',
    { module, facts, caseId, includeTurtle: false },
    signal
  )
export const proposeFacts = (module, source, signal) =>
  postJson('/api/case/propose', { module, source }, signal)
export const exportGraph = (module, facts, caseId) =>
  postJson('/api/case/check', { module, facts, caseId })
