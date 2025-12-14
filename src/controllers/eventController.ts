import { Response } from 'express';
import { PrismaClient, EventStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';
import { body, validationResult } from 'express-validator';

const prisma = new PrismaClient();

export const createEventValidation = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required'),
  body('maxAttendees').isInt({ min: 1 }).withMessage('Max attendees must be at least 1'),
  body('category').notEmpty().withMessage('Category is required'),
  body('tags').isArray().withMessage('Tags must be an array'),
];

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, description, location, startDate, endDate, maxAttendees, category, tags } = req.body;
    const userId = req.user!.id;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    if (start < new Date()) {
      res.status(400).json({ error: 'Start date must be in the future' });
      return;
    }

    // Handle image upload
    let imageUrl = null;
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`;
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        startDate: start,
        endDate: end,
        maxAttendees: parseInt(maxAttendees),
        category,
        tags,
        imageUrl,
        createdById: userId,
        status: EventStatus.PENDING,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            clubName: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Event created successfully and pending approval',
      event,
    });
  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

export const getEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status, category, search, upcoming } = req.query;

    const where: any = {};

    // Filter by status
    if (status) {
      where.status = status;
    } else {
      // By default, show only approved events for students
      if (req.user?.role === 'STUDENT') {
        where.status = EventStatus.APPROVED;
      }
    }

    // Filter by category
    if (category) {
      where.category = category;
    }

    // Search by title or description
    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filter upcoming events
    if (upcoming === 'true') {
      where.startDate = { gte: new Date() };
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            clubName: true,
          },
        },
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
            clubName: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                studentId: true,
              },
            },
          },
        },
      },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    res.json({ event });
  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
};

export const updateEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check if user is the creator
    if (event.createdById !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only update your own events' });
      return;
    }

    const { title, description, location, startDate, endDate, maxAttendees, category, tags } = req.body;

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description && { description }),
        ...(location && { location }),
        ...(startDate && { startDate: new Date(startDate) }),
        ...(endDate && { endDate: new Date(endDate) }),
        ...(maxAttendees && { maxAttendees: parseInt(maxAttendees) }),
        ...(category && { category }),
        ...(tags && { tags }),
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            clubName: true,
          },
        },
      },
    });

    res.json({
      message: 'Event updated successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
};

export const deleteEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    // Check if user is the creator or admin
    if (event.createdById !== userId && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'You can only delete your own events' });
      return;
    }

    await prisma.event.delete({
      where: { id },
    });

    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
};

export const getMyEvents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;

    const events = await prisma.event.findMany({
      where: {
        createdById: userId,
      },
      include: {
        _count: {
          select: {
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get my events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};
