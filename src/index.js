import express from 'express';
import { PrismaClient } from '@prisma/client';
import { body, validationResult, param } from 'express-validator';
import { sendSuccess, sendFail, sendError } from './utils/response.js';

const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());

// Middleware untuk autentikasi API Key
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const SUPER_SECRET_KEY = "12345-ABCDE";

  if (apiKey && apiKey === SUPER_SECRET_KEY) {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Missing or invalid API Key.' });
  }
};

app.use(authenticateApiKey);

// Validasi input untuk mood entry
const moodValidationRules = () => {
  return [
    body('user_id').isInt().withMessage('user_id must be an integer'),
    body('date').isISO8601().withMessage('date must be a valid ISO 8601 date (YYYY-MM-DD)'),
    body('mood_score').isInt({ min: 1, max: 5 }).withMessage('mood_score must be an integer between 1 and 5'),
    body('mood_label').optional().isString().isLength({ max: 100 }),
    body('notes').optional().isString(),
  ];
};

// Middleware untuk validasi
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }

  const extractedErrors = {};
  errors.array().forEach(err => {
    if (!extractedErrors[err.path]) {
      extractedErrors[err.path] = err.msg;
    }
  });

  return sendFail(res, 400, extractedErrors);
};

// Simpan mood entry baru
app.post(
  '/mood',
  moodValidationRules(),
  validate,
  async (req, res) => {
    try {
      const { user_id, date, mood_score, mood_label, notes } = req.body;

      const newEntry = await prisma.moodEntry.create({
        data: {
          userId: BigInt(user_id),
          date: new Date(date),
          moodScore: mood_score,
          moodLabel: mood_label,
          notes: notes,
        },
      });
      
      return sendSuccess(res, 201, newEntry, 'Mood entry created successfully');
    } catch (err) {
      console.error(err);
      return sendError(res, 500, 'An unexpected error occurred while creating mood entry.');
    }
  }
);

// Ambil riwayat mood berdasarkan user
app.get(
  '/mood/:user_id',
  [param('user_id').isInt().withMessage('user_id must be an integer')],
  validate,
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const entries = await prisma.moodEntry.findMany({
        where: {
          userId: BigInt(user_id)
        },
        orderBy: {
          date: 'desc'
        }
      });
      
      return sendSuccess(res, 200, entries);
    } catch (err) {
      console.error(err);
      return sendError(res, 500, 'An unexpected error occurred while fetching mood history.');
    }
  }
);

// Hitung summary mood user
app.get(
  '/summary/:user_id',
  [param('user_id').isInt().withMessage('user_id must be an integer')],
  validate,
  async (req, res) => {
    try {
      const { user_id } = req.params;

      const summary = await prisma.moodEntry.aggregate({
        _avg: {
          moodScore: true
        },
        _count: {
          id: true
        },
        where: {
          userId: BigInt(user_id)
        }
      });

      const result = {
        user_id: user_id,
        total_entries: summary._count.id,
        average_mood: summary._avg.moodScore ? summary._avg.moodScore.toFixed(2) : null
      };

      return sendSuccess(res, 200, result);
    } catch (err) {
      console.error(err);
      return sendError(res, 500, 'An unexpected error occurred while calculating summary.');
    }
  }
);

app.listen(port, () => {
  console.log(`Mood Check-in API (Prisma) listening at http://localhost:${port}`);
});