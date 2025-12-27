import { Response } from 'express';
import { PrismaClient, RegistrationStatus, EventStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const registerForEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.id;

    // Check if event exists and is approved
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        _count: {
          select: {
            registrations: {
              where: {
                status: RegistrationStatus.REGISTERED,
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

    if (event.status !== EventStatus.APPROVED) {
      res.status(400).json({ error: 'Event is not approved yet' });
      return;
    }

    // Check if event is in the future
    if (event.startDate < new Date()) {
      res.status(400).json({ error: 'Cannot register for past events' });
      return;
    }

    // Check if event is full
    if (event._count.registrations >= event.maxAttendees) {
      res.status(400).json({ error: 'Event is full' });
      return;
    }

    // Check if user already registered
    const existingRegistration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
    });

    if (existingRegistration) {
      if (existingRegistration.status === RegistrationStatus.REGISTERED) {
        res.status(400).json({ error: 'You are already registered for this event' });
        return;
      }
      // If previously cancelled, allow re-registration
    }

    // Create registration
    const registration = await prisma.registration.create({
      data: {
        userId,
        eventId,
        status: RegistrationStatus.REGISTERED,
        qrCode: '', // Will be updated after creation
      },
    });

    // Generate simple QR code identifier (just the registration ID)
    // The actual QR code image will be generated on-demand in the frontend
    const qrCodeIdentifier = `REG-${registration.id}`;

    // Update registration with QR code identifier
    const updatedRegistration = await prisma.registration.update({
      where: { id: registration.id },
      data: { qrCode: qrCodeIdentifier },
      include: {
        event: {
          select: {
            id: true,
            title: true,
            location: true,
            startDate: true,
            endDate: true,
            imageUrl: true,
          },
        },
      },
    });

    // Update event attendee count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentAttendees: {
          increment: 1,
        },
      },
    });

    res.status(201).json({
      message: 'Successfully registered for event',
      registration: updatedRegistration,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Failed to register for event' });
  }
};

export const cancelRegistration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;
    const userId = req.user!.id;

    const registration = await prisma.registration.findUnique({
      where: {
        userId_eventId: {
          userId,
          eventId,
        },
      },
      include: {
        event: true,
      },
    });

    if (!registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    if (registration.status !== RegistrationStatus.REGISTERED) {
      res.status(400).json({ error: 'Registration is already cancelled' });
      return;
    }

    // Check if event has already started
    if (registration.event.startDate < new Date()) {
      res.status(400).json({ error: 'Cannot cancel registration for ongoing or past events' });
      return;
    }

    // Update registration status
    await prisma.registration.update({
      where: { id: registration.id },
      data: {
        status: RegistrationStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    // Decrement event attendee count
    await prisma.event.update({
      where: { id: eventId },
      data: {
        currentAttendees: {
          decrement: 1,
        },
      },
    });

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    console.error('Cancel registration error:', error);
    res.status(500).json({ error: 'Failed to cancel registration' });
  }
};

export const getMyRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { status, upcoming } = req.query;

    const where: any = {
      userId,
    };

    if (status) {
      where.status = status;
    }

    if (upcoming === 'true') {
      where.event = {
        startDate: {
          gte: new Date(),
        },
      };
    }

    const registrations = await prisma.registration.findMany({
      where,
      include: {
        event: {
          include: {
            createdBy: {
              select: {
                name: true,
                clubName: true,
              },
            },
          },
        },
      },
      orderBy: {
        registeredAt: 'desc',
      },
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};

export const getRegistrationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const registration = await prisma.registration.findUnique({
      where: { id },
      include: {
        event: {
          include: {
            createdBy: {
              select: {
                name: true,
                clubName: true,
              },
            },
          },
        },
        user: {
          select: {
            name: true,
            email: true,
            studentId: true,
          },
        },
      },
    });

    if (!registration) {
      res.status(404).json({ error: 'Registration not found' });
      return;
    }

    // Check if user owns this registration or is admin/organizer
    if (
      registration.userId !== userId &&
      req.user!.role !== 'ADMIN' &&
      registration.event.createdById !== userId
    ) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ registration });
  } catch (error) {
    console.error('Get registration error:', error);
    res.status(500).json({ error: 'Failed to fetch registration' });
  }
};

export const getEventRegistrations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { eventId } = req.params;

    // Check if user is the event creator or admin
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.createdById !== req.user!.id && req.user!.role !== 'ADMIN') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const registrations = await prisma.registration.findMany({
      where: {
        eventId,
        status: RegistrationStatus.REGISTERED,
      },
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
      orderBy: {
        registeredAt: 'asc',
      },
    });

    res.json({ registrations });
  } catch (error) {
    console.error('Get event registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch registrations' });
  }
};
