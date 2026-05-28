import { body, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

export const validateAnalyzeRequest = [
  body('imageBase64')
    .exists().withMessage('Image data is required')
    .isString().withMessage('Image data must be a string')
    .notEmpty().withMessage('Image data cannot be empty'),
  body('personalKey')
    .optional()
    .isString(),
  body('context')
    .optional()
    .isObject(),
  body('context.activity')
    .optional()
    .isString(),
  body('context.lat')
    .optional()
    .isNumeric(),
  body('context.lng')
    .optional()
    .isNumeric(),
  body('context.timestamp')
    .optional()
    .isString(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
    next();
  }
];

export const validateChatRequest = [
  body('message')
    .exists().withMessage('Message is required')
    .isString().withMessage('Message must be a string')
    .notEmpty().withMessage('Message cannot be empty')
    .isLength({ max: 2000 }).withMessage('Message is too long'),
  body('personalKey')
    .optional()
    .isString(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
    next();
  }
];

export const validateAriaRequest = [
  body('stats')
    .exists().withMessage('Stats are required')
    .isObject().withMessage('Stats must be an object'),
  body('personalKey')
    .optional()
    .isString(),
  (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
       res.status(400).json({ errors: errors.array() });
       return;
    }
    next();
  }
];
