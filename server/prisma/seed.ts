/// <reference types="node" />
import { PrismaClient } from "@prisma/client";
import bcryptjsModule from "bcryptjs";

// Handle CJS/ESM interop: bcryptjs is a CJS module
const bcryptjs = (bcryptjsModule as any).default || bcryptjsModule;

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const adminPassword = await bcryptjs.hash("password123", 10);
  const memberPassword = await bcryptjs.hash("password123", 10);

  const admin = await prisma.user.create({
    data: {
      name: "Admin User",
      email: "admin@teamflow.com",
      password: adminPassword,
      role: "ADMIN",
      status: "ACTIVE",
    },
  });
  console.log(`✓ Created admin: ${admin.email}`);

  const alice = await prisma.user.create({
    data: {
      name: "Alice Johnson",
      email: "alice@teamflow.com",
      password: memberPassword,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  const bob = await prisma.user.create({
    data: {
      name: "Bob Williams",
      email: "bob@teamflow.com",
      password: memberPassword,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  const carol = await prisma.user.create({
    data: {
      name: "Carol Martinez",
      email: "carol@teamflow.com",
      password: memberPassword,
      role: "MEMBER",
      status: "ACTIVE",
    },
  });

  console.log(`✓ Created 3 team members`);

  // Create projects
  const project1 = await prisma.project.create({
    data: {
      title: "Website Redesign",
      description:
        "Complete overhaul of the company website with modern design, improved UX, and mobile-first approach.",
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: alice.id, role: "MEMBER" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project2 = await prisma.project.create({
    data: {
      title: "Mobile App v2.0",
      description:
        "Build the next version of our mobile application with React Native, including offline support and push notifications.",
      createdBy: admin.id,
      members: {
        create: [
          { userId: admin.id, role: "ADMIN" },
          { userId: carol.id, role: "MEMBER" },
          { userId: alice.id, role: "MEMBER" },
        ],
      },
    },
  });

  const project3 = await prisma.project.create({
    data: {
      title: "API Migration",
      description:
        "Migrate legacy REST APIs to GraphQL with improved performance and type safety.",
      createdBy: alice.id,
      members: {
        create: [
          { userId: alice.id, role: "ADMIN" },
          { userId: bob.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log(`✓ Created 3 projects`);

  // Create tasks for Project 1
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  const yesterday = new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000);
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

  const tasks = await Promise.all([
    // Website Redesign tasks
    prisma.task.create({
      data: {
        title: "Design system setup",
        description: "Create color palette, typography, spacing tokens in Figma",
        status: "DONE",
        priority: "HIGH",
        projectId: project1.id,
        assignedTo: alice.id,
        createdBy: admin.id,
        dueDate: twoDaysAgo,
      },
    }),
    prisma.task.create({
      data: {
        title: "Homepage wireframes",
        description: "Create low-fidelity wireframes for the new homepage",
        status: "DONE",
        priority: "HIGH",
        projectId: project1.id,
        assignedTo: alice.id,
        createdBy: admin.id,
        dueDate: yesterday,
      },
    }),
    prisma.task.create({
      data: {
        title: "Implement responsive navbar",
        description: "Build the navigation component with mobile hamburger menu",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        projectId: project1.id,
        assignedTo: bob.id,
        createdBy: admin.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: "Set up CI/CD pipeline",
        description: "Configure GitHub Actions for automated testing and deployment",
        status: "REVIEW",
        priority: "MEDIUM",
        projectId: project1.id,
        assignedTo: admin.id,
        createdBy: admin.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: "Performance audit",
        description: "Run Lighthouse and fix all major performance issues",
        status: "TODO",
        priority: "URGENT",
        projectId: project1.id,
        assignedTo: bob.id,
        createdBy: admin.id,
        dueDate: yesterday, // overdue
      },
    }),
    prisma.task.create({
      data: {
        title: "SEO optimization",
        description: "Add meta tags, structured data, and sitemap",
        status: "TODO",
        priority: "LOW",
        projectId: project1.id,
        assignedTo: alice.id,
        createdBy: admin.id,
      },
    }),

    // Mobile App tasks
    prisma.task.create({
      data: {
        title: "Set up React Native project",
        description: "Initialize the project with Expo and configure navigation",
        status: "DONE",
        priority: "HIGH",
        projectId: project2.id,
        assignedTo: carol.id,
        createdBy: admin.id,
        dueDate: twoDaysAgo,
      },
    }),
    prisma.task.create({
      data: {
        title: "Offline data sync",
        description: "Implement offline-first architecture with WatermelonDB",
        status: "IN_PROGRESS",
        priority: "URGENT",
        projectId: project2.id,
        assignedTo: carol.id,
        createdBy: admin.id,
        dueDate: nextWeek,
      },
    }),
    prisma.task.create({
      data: {
        title: "Push notifications",
        description: "Set up Firebase Cloud Messaging for push notifications",
        status: "TODO",
        priority: "HIGH",
        projectId: project2.id,
        assignedTo: alice.id,
        createdBy: admin.id,
      },
    }),
    prisma.task.create({
      data: {
        title: "App store screenshots",
        description: "Create promotional screenshots for iOS and Android stores",
        status: "TODO",
        priority: "LOW",
        projectId: project2.id,
        assignedTo: carol.id,
        createdBy: admin.id,
      },
    }),

    // API Migration tasks
    prisma.task.create({
      data: {
        title: "Schema design",
        description: "Design GraphQL schema with proper types and resolvers",
        status: "DONE",
        priority: "HIGH",
        projectId: project3.id,
        assignedTo: alice.id,
        createdBy: alice.id,
        dueDate: twoDaysAgo,
      },
    }),
    prisma.task.create({
      data: {
        title: "Write migration scripts",
        description: "Create data migration scripts for seamless transition",
        status: "IN_PROGRESS",
        priority: "MEDIUM",
        projectId: project3.id,
        assignedTo: bob.id,
        createdBy: alice.id,
        dueDate: nextWeek,
      },
    }),
  ]);

  console.log(`✓ Created ${tasks.length} tasks`);

  // Create some comments
  await prisma.comment.createMany({
    data: [
      {
        taskId: tasks[0].id,
        userId: admin.id,
        message: "Great work on the design system! The color palette looks solid.",
      },
      {
        taskId: tasks[0].id,
        userId: alice.id,
        message: "Thanks! I've added the dark mode variants as well.",
      },
      {
        taskId: tasks[2].id,
        userId: bob.id,
        message: "Working on the mobile menu animation. Should be ready by tomorrow.",
      },
      {
        taskId: tasks[4].id,
        userId: admin.id,
        message: "This is urgent — we need to fix LCP before the launch.",
      },
      {
        taskId: tasks[7].id,
        userId: carol.id,
        message: "Offline sync is tricky. Might need an extra day for conflict resolution.",
      },
    ],
  });

  console.log(`✓ Created 5 comments`);

  console.log("\n✅ Seed complete!");
  console.log("\n📋 Demo Credentials:");
  console.log("   Email: admin@teamflow.com");
  console.log("   Password: password123");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
