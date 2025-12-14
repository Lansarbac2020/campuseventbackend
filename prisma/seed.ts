import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@campus.edu' },
    update: {},
    create: {
      email: 'admin@campus.edu',
      password: adminPassword,
      name: 'System Admin',
      role: UserRole.ADMIN,
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create organizer users
  const organizerPassword = await bcrypt.hash('organizer123', 10);
  const organizer1 = await prisma.user.upsert({
    where: { email: 'tech.club@campus.edu' },
    update: {},
    create: {
      email: 'tech.club@campus.edu',
      password: organizerPassword,
      name: 'Tech Club President',
      role: UserRole.ORGANIZER,
      clubName: 'Technology Club',
    },
  });

  const organizer2 = await prisma.user.upsert({
    where: { email: 'music.club@campus.edu' },
    update: {},
    create: {
      email: 'music.club@campus.edu',
      password: organizerPassword,
      name: 'Music Club President',
      role: UserRole.ORGANIZER,
      clubName: 'Music Society',
    },
  });
  console.log('✅ Organizer users created');

  // Create student users
  const studentPassword = await bcrypt.hash('student123', 10);
  await prisma.user.upsert({
    where: { email: 'john.doe@campus.edu' },
    update: {},
    create: {
      email: 'john.doe@campus.edu',
      password: studentPassword,
      name: 'John Doe',
      role: UserRole.STUDENT,
      studentId: 'STU001',
    },
  });

  await prisma.user.upsert({
    where: { email: 'jane.smith@campus.edu' },
    update: {},
    create: {
      email: 'jane.smith@campus.edu',
      password: studentPassword,
      name: 'Jane Smith',
      role: UserRole.STUDENT,
      studentId: 'STU002',
    },
  });
  console.log('✅ Student users created');

  // Create sample events
  await prisma.event.create({
    data: {
      title: 'Web Development Workshop',
      description: 'Learn modern web development with React and Node.js. Perfect for beginners!',
      location: 'Computer Lab A-101',
      startDate: new Date('2025-01-15T14:00:00'),
      endDate: new Date('2025-01-15T17:00:00'),
      maxAttendees: 50,
      category: 'Workshop',
      tags: ['Technology', 'Programming', 'Web Development'],
      createdById: organizer1.id,
      status: 'APPROVED',
    },
  });

  await prisma.event.create({
    data: {
      title: 'Annual Music Festival',
      description: 'Join us for an evening of live music performances by talented student bands!',
      location: 'University Auditorium',
      startDate: new Date('2025-01-20T18:00:00'),
      endDate: new Date('2025-01-20T22:00:00'),
      maxAttendees: 200,
      category: 'Concert',
      tags: ['Music', 'Entertainment', 'Festival'],
      createdById: organizer2.id,
      status: 'APPROVED',
    },
  });

  await prisma.event.create({
    data: {
      title: 'AI & Machine Learning Seminar',
      description: 'Industry experts discuss the latest trends in AI and machine learning.',
      location: 'Main Hall',
      startDate: new Date('2025-01-25T10:00:00'),
      endDate: new Date('2025-01-25T13:00:00'),
      maxAttendees: 100,
      category: 'Seminar',
      tags: ['Technology', 'AI', 'Machine Learning'],
      createdById: organizer1.id,
      status: 'PENDING',
    },
  });

  console.log('✅ Sample events created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📝 Login credentials:');
  console.log('Admin: admin@campus.edu / admin123');
  console.log('Organizer: tech.club@campus.edu / organizer123');
  console.log('Student: john.doe@campus.edu / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
