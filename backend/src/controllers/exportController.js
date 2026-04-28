import fs from 'fs';
import { jsonToOwl } from '../utils/jsonToOwl.js';

export function downloadOwl(req, res) {
  const ontology = req.body;

  const owl = jsonToOwl(ontology);

  const filePath = './data/final_ontology.owl';
  fs.writeFileSync(filePath, owl);

  res.download(filePath);
}
