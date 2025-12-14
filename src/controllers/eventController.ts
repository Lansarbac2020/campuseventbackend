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
  // Tags is optional and will be parsed in the controller
];

// Helper function to check for event conflicts
const checkEventConflict = async (
  location: string,
  startDate: Date,
  endDate: Date,
  excludeEventId?: string
): Promise<{ hasConflict: boolean; conflictingEvent?: any }> => {
  const where: any = {
    location,
    status: {
      in: [EventStatus.APPROVED, EventStatus.PENDING],
    },
    OR: [
      {
        // New event starts during existing event
        AND: [
          { startDate: { lte: startDate } },
          { endDate: { gt: startDate } },
        ],
      },
      {
        // New event ends during existing event
        AND: [
          { startDate: { lt: endDate } },
          { endDate: { gte: endDate } },
        ],
      },
      {
        // New event completely contains existing event
        AND: [
          { startDate: { gte: startDate } },
          { endDate: { lte: endDate } },
        ],
      },
    ],
  };

  // Exclude current event when updating
  if (excludeEventId) {
    where.id = { not: excludeEventId };
  }

  const conflictingEvent = await prisma.event.findFirst({
    where,
    include: {
      createdBy: {
        select: {
          name: true,
          clubName: true,
        },
      },
    },
  });

  return {
    hasConflict: !!conflictingEvent,
    conflictingEvent,
  };
};

export const createEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ errors: errors.array() });
      return;
    }

    const { title, description, location, startDate, endDate, maxAttendees, category } = req.body;
    let tags = req.body.tags;
    
    // Parse tags if it's a JSON string (from FormData)
    if (typeof tags === 'string') {
      try {
        tags = JSON.parse(tags);
      } catch (e) {
        tags = [];
      }
    }
    
    // Ensure tags is an array
    if (!Array.isArray(tags)) {
      tags = [];
    }
    
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

    // Check for venue conflicts
    const { hasConflict, conflictingEvent } = await checkEventConflict(location, start, end);
    
    if (hasConflict) {
      res.status(409).json({
        error: 'Venue conflict detected',
        message: `This venue is already booked for "${conflictingEvent.title}" from ${new Date(conflictingEvent.startDate).toLocaleString()} to ${new Date(conflictingEvent.endDate).toLocaleString()}`,
        conflictingEvent: {
          id: conflictingEvent.id,
          title: conflictingEvent.title,
          startDate: conflictingEvent.startDate,
          endDate: conflictingEvent.endDate,
          organizer: conflictingEvent.createdBy?.name || conflictingEvent.createdBy?.clubName,
        },
      });
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

    // Check for venue conflicts if location or dates are being updated
    if (location || startDate || endDate) {
      const newLocation = location || event.location;
      const newStartDate = startDate ? new Date(startDate) : event.startDate;
      const newEndDate = endDate ? new Date(endDate) : event.endDate;

      // Validate dates
      if (newStartDate >= newEndDate) {
        res.status(400).json({ error: 'End date must be after start date' });
        return;
      }

      const { hasConflict, conflictingEvent } = await checkEventConflict(
        newLocation,
        newStartDate,
        newEndDate,
        id // Exclude current event from conflict check
      );

      if (hasConflict) {
        res.status(409).json({
          error: 'Venue conflict detected',
          message: `This venue is already booked for "${conflictingEvent.title}" from ${new Date(conflictingEvent.startDate).toLocaleString()} to ${new Date(conflictingEvent.endDate).toLocaleString()}`,
          conflictingEvent: {
            id: conflictingEvent.id,
            title: conflictingEvent.title,
            startDate: conflictingEvent.startDate,
            endDate: conflictingEvent.endDate,
            organizer: conflictingEvent.createdBy?.name || conflictingEvent.createdBy?.clubName,
          },
        });
        return;
      }
    }

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

// Check venue availability
export const checkAvailability = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { location, startDate, endDate, excludeEventId } = req.query;

    if (!location || !startDate || !endDate) {
      res.status(400).json({ error: 'Location, start date, and end date are required' });
      return;
    }

    const start = new Date(startDate as string);
    const end = new Date(endDate as string);

    if (start >= end) {
      res.status(400).json({ error: 'End date must be after start date' });
      return;
    }

    const { hasConflict, conflictingEvent } = await checkEventConflict(
      location as string,
      start,
      end,
      excludeEventId as string | undefined
    );

    if (hasConflict) {
      res.json({
        available: false,
        message: `This venue is already booked for "${conflictingEvent.title}"`,
        conflict: {
          id: conflictingEvent.id,
          title: conflictingEvent.title,
          startDate: conflictingEvent.startDate,
          endDate: conflictingEvent.endDate,
          organizer: conflictingEvent.createdBy?.name || conflictingEvent.createdBy?.clubName,
        },
      });
    } else {
      res.json({
        available: true,
        message: 'Venue is available for the selected time',
      });
    }
  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({ error: 'Failed to check availability' });
  }
};

// Get venue schedule - returns all booked slots for a venue
export const getVenueSchedule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { location, startDate, endDate } = req.query;

    if (!location) {
      res.status(400).json({ error: 'Location is required' });
      return;
    }

    // Default to current week if dates not provided
    const start = startDate 
      ? new Date(startDate as string) 
      : new Date();
    
    const end = endDate 
      ? new Date(endDate as string) 
      : new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from start

    // Fetch all events at this location within the date range
    const bookedSlots = await prisma.event.findMany({
      where: {
        location: location as string,
        status: {
          in: [EventStatus.APPROVED, EventStatus.PENDING],
        },
        OR: [
          {
            // Event starts within range
            startDate: {
              gte: start,
              lte: end,
            },
          },
          {
            // Event ends within range
            endDate: {
              gte: start,
              lte: end,
            },
          },
          {
            // Event spans the entire range
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: end } },
            ],
          },
        ],
      },
      select: {
        id: true,
        title: true,
        startDate: true,
        endDate: true,
        status: true,
        createdBy: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        startDate: 'asc',
      },
    });

    res.json({
      location,
      startDate: start,
      endDate: end,
      bookedSlots: bookedSlots.map((event: any) => ({
        id: event.id,
        title: event.title,
        start: event.startDate,
        end: event.endDate,
        status: event.status,
        organizer: event.createdBy.name,
      })),
    });
  } catch (error) {
    console.error('Get venue schedule error:', error);
    res.status(500).json({ error: 'Failed to fetch venue schedule' });
  }
};


