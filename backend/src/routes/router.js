import express from 'express';
import { downloadOwl } from '../controllers/exportController.js';

const router = express.Router();

router.post('/export/owl', downloadOwl);

export default router;
