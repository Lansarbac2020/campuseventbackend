import express from 'express';
import {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  getRegistrationById,
  getEventRegistrations,
} from '../controllers/registrationController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// Student routes
router.post('/events/:eventId/register', authenticate, authorize('STUDENT'), registerForEvent);
router.delete('/events/:eventId/cancel', authenticate, authorize('STUDENT'), cancelRegistration);
router.get('/my', authenticate, authorize('STUDENT'), getMyRegistrations);
router.get('/:id', authenticate, getRegistrationById);

// Organizer/Admin routes
router.get(
  '/events/:eventId/attendees',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  getEventRegistrations
);

export default router;
