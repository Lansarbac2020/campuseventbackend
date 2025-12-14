import express from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  updateEvent,
  deleteEvent,
  getMyEvents,
  createEventValidation,
  checkAvailability,
  getVenueSchedule,
} from '../controllers/eventController';
import { authenticate, authorize } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = express.Router();

// Public routes
router.get('/', getEvents);
router.get('/check-availability', checkAvailability);
router.get('/venue-schedule', getVenueSchedule);
router.get('/:id', getEventById);

// Protected routes - Organizers only
router.post(
  '/',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  upload.single('image'),
  createEventValidation,
  createEvent
);

router.get('/my/events', authenticate, authorize('ORGANIZER', 'ADMIN'), getMyEvents);

router.put(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  updateEvent
);

router.delete(
  '/:id',
  authenticate,
  authorize('ORGANIZER', 'ADMIN'),
  deleteEvent
);

export default router;

