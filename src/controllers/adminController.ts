import { Response } from 'express';
import { PrismaClient, EventStatus } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const approveEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== EventStatus.PENDING) {
      res.status(400).json({ error: 'Event is not pending approval' });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.APPROVED,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
            clubName: true,
          },
        },
      },
    });

    res.json({
      message: 'Event approved successfully',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Approve event error:', error);
    res.status(500).json({ error: 'Failed to approve event' });
  }
};

export const rejectEvent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      res.status(404).json({ error: 'Event not found' });
      return;
    }

    if (event.status !== EventStatus.PENDING) {
      res.status(400).json({ error: 'Event is not pending approval' });
      return;
    }

    const updatedEvent = await prisma.event.update({
      where: { id },
      data: {
        status: EventStatus.REJECTED,
      },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
            clubName: true,
          },
        },
      },
    });

    res.json({
      message: 'Event rejected',
      event: updatedEvent,
    });
  } catch (error) {
    console.error('Reject event error:', error);
    res.status(500).json({ error: 'Failed to reject event' });
  }
};

export const getPendingEvents = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const events = await prisma.event.findMany({
      where: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ events });
  } catch (error) {
    console.error('Get pending events error:', error);
    res.status(500).json({ error: 'Failed to fetch pending events' });
  }
};

export const getAllUsers = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        studentId: true,
        clubName: true,
        isActive: true,
        createdAt: true,
        _count: {
          select: {
            eventsCreated: true,
            registrations: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

export const toggleUserStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Prevent admin from deactivating themselves
    if (user.id === req.user!.id) {
      res.status(400).json({ error: 'Cannot deactivate your own account' });
      return;
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        isActive: !user.isActive,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });

    res.json({
      message: `User ${updatedUser.isActive ? 'activated' : 'deactivated'} successfully`,
      user: updatedUser,
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

export const getDashboardStats = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [totalUsers, totalEvents, totalRegistrations, pendingEvents] = await Promise.all([
      prisma.user.count(),
      prisma.event.count(),
      prisma.registration.count({
        where: {
          status: 'REGISTERED',
        },
      }),
      prisma.event.count({
        where: {
          status: EventStatus.PENDING,
        },
      }),
    ]);

    const upcomingEvents = await prisma.event.count({
      where: {
        status: EventStatus.APPROVED,
        startDate: {
          gte: new Date(),
        },
      },
    });

    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    res.json({
      stats: {
        totalUsers,
        totalEvents,
        totalRegistrations,
        pendingEvents,
        upcomingEvents,
        usersByRole,
      },
    });
  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
