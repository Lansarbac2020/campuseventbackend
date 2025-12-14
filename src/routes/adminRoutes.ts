import express from 'express';
import {
  approveEvent,
  rejectEvent,
  getPendingEvents,
  getAllUsers,
  toggleUserStatus,
  getDashboardStats,
} from '../controllers/adminController';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('ADMIN'));

// Event management
router.get('/events/pending', getPendingEvents);
router.put('/events/:id/approve', approveEvent);
router.put('/events/:id/reject', rejectEvent);

// User management
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);

// Dashboard
router.get('/dashboard/stats', getDashboardStats);

export default router;
