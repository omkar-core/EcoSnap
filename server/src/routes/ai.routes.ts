import { Router, Request, Response, NextFunction } from 'express';
import { analyzeImage, chat, generateAriaReport } from '../services/gemini.server';
import { validateAnalyzeRequest, validateChatRequest, validateAriaRequest } from '../middleware/validator';
import { aiEndpointLimiter, chatEndpointLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/analyze', aiEndpointLimiter, validateAnalyzeRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { imageBase64, context, personalKey } = req.body;
    const result = await analyzeImage(imageBase64, context, personalKey);
    res.json(result);
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      res.status(503).json({ error: 'AI service unavailable' });
    } else {
      next(error);
    }
  }
});

router.post('/chat', chatEndpointLimiter, validateChatRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { message, personalKey } = req.body;
    const result = await chat(message, personalKey);
    res.json({ text: result });
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      res.status(503).json({ error: 'AI service unavailable' });
    } else {
      next(error);
    }
  }
});

router.post('/aria-report', aiEndpointLimiter, validateAriaRequest, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { stats, personalKey } = req.body;
    const result = await generateAriaReport(stats, personalKey);
    res.json({ text: result });
  } catch (error: any) {
    if (error.message === 'API_KEY_MISSING') {
      res.status(503).json({ error: 'AI service unavailable' });
    } else {
      next(error);
    }
  }
});

export default router;
