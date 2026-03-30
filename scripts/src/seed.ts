import {
  db,
  usersTable,
  coursesTable,
  modulesTable,
  lessonsTable,
  tasksTable,
  filesTable,
  automationsTable,
  activityLogsTable,
  enrollmentsTable,
  progressTable,
} from "@workspace/db";
import crypto from "crypto";

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "enterprise_salt").digest("hex");
}

async function seed() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await db.delete(activityLogsTable);
  await db.delete(progressTable);
  await db.delete(enrollmentsTable);
  await db.delete(automationsTable);
  await db.delete(filesTable);
  await db.delete(tasksTable);
  await db.delete(lessonsTable);
  await db.delete(modulesTable);
  await db.delete(coursesTable);
  await db.delete(usersTable);

  console.log("  ✓ Cleared existing data");

  // Create users
  const users = await db.insert(usersTable).values([
    {
      email: "admin@demo.com",
      name: "Alex Morgan",
      passwordHash: hashPassword("admin123"),
      role: "admin",
      department: "Engineering",
      avatarUrl: null,
    },
    {
      email: "manager@demo.com",
      name: "Jordan Lee",
      passwordHash: hashPassword("manager123"),
      role: "manager",
      department: "Product",
      avatarUrl: null,
    },
    {
      email: "sarah@demo.com",
      name: "Sarah Chen",
      passwordHash: hashPassword("employee123"),
      role: "employee",
      department: "Design",
      avatarUrl: null,
    },
    {
      email: "marcus@demo.com",
      name: "Marcus Johnson",
      passwordHash: hashPassword("employee123"),
      role: "employee",
      department: "Engineering",
      avatarUrl: null,
    },
    {
      email: "employee@demo.com",
      name: "Emily Davis",
      passwordHash: hashPassword("employee123"),
      role: "employee",
      department: "Marketing",
      avatarUrl: null,
    },
  ]).returning();

  console.log(`  ✓ Created ${users.length} users`);

  const [admin, manager, sarah, marcus, emily] = users;

  // Create courses
  const courses = await db.insert(coursesTable).values([
    {
      title: "Leadership Excellence Program",
      description: "Develop essential leadership skills for modern enterprises. Learn to inspire teams, drive strategy, and create lasting organizational impact.",
      status: "published",
      duration: 480,
      createdById: admin.id,
    },
    {
      title: "Advanced Data Analysis with Python",
      description: "Master data analysis techniques using Python, pandas, and visualization libraries. From basics to advanced statistical modeling.",
      status: "published",
      duration: 360,
      createdById: admin.id,
    },
    {
      title: "Cybersecurity Fundamentals",
      description: "Essential cybersecurity knowledge for modern professionals. Covers threat landscapes, security protocols, and best practices.",
      status: "draft",
      duration: 240,
      createdById: manager.id,
    },
  ]).returning();

  console.log(`  ✓ Created ${courses.length} courses`);

  const [leadershipCourse, dataCourse, securityCourse] = courses;

  // Create modules for leadership course
  const leadershipModules = await db.insert(modulesTable).values([
    { courseId: leadershipCourse.id, title: "Foundations of Leadership", description: "Core leadership principles and mindsets", order: 1 },
    { courseId: leadershipCourse.id, title: "Team Dynamics & Communication", description: "Building high-performing teams", order: 2 },
    { courseId: leadershipCourse.id, title: "Strategic Thinking", description: "Long-term planning and execution", order: 3 },
  ]).returning();

  // Create modules for data course
  const dataModules = await db.insert(modulesTable).values([
    { courseId: dataCourse.id, title: "Python for Data Science", description: "Getting started with Python and data libraries", order: 1 },
    { courseId: dataCourse.id, title: "Statistical Analysis", description: "Core statistical methods and applications", order: 2 },
    { courseId: dataCourse.id, title: "Data Visualization", description: "Creating compelling charts and dashboards", order: 3 },
  ]).returning();

  // Create lessons
  await db.insert(lessonsTable).values([
    { moduleId: leadershipModules[0].id, title: "What Makes a Great Leader?", content: "Exploring leadership styles and their impact", duration: 30, order: 1 },
    { moduleId: leadershipModules[0].id, title: "Self-Awareness & Emotional Intelligence", content: "Developing EQ as a leadership superpower", duration: 45, order: 2 },
    { moduleId: leadershipModules[1].id, title: "Building Trust with Your Team", content: "Foundations of high-trust relationships", duration: 40, order: 1 },
    { moduleId: leadershipModules[2].id, title: "Vision Setting & OKRs", content: "How to set compelling organizational goals", duration: 50, order: 1 },
    { moduleId: dataModules[0].id, title: "Python Basics & Setup", content: "Setting up your development environment", duration: 30, order: 1 },
    { moduleId: dataModules[0].id, title: "Working with Pandas", content: "Data manipulation and analysis with pandas", duration: 60, videoUrl: "https://www.youtube.com/embed/vmEHCJofslg", order: 2 },
    { moduleId: dataModules[1].id, title: "Descriptive Statistics", content: "Mean, median, standard deviation and more", duration: 45, order: 1 },
    { moduleId: dataModules[2].id, title: "Creating Charts with Matplotlib", content: "Line charts, bar charts, and scatter plots", duration: 40, order: 1 },
  ]);

  console.log("  ✓ Created modules and lessons");

  // Enroll employees in courses
  await db.insert(enrollmentsTable).values([
    { userId: sarah.id, courseId: leadershipCourse.id },
    { userId: marcus.id, courseId: leadershipCourse.id },
    { userId: emily.id, courseId: leadershipCourse.id },
    { userId: sarah.id, courseId: dataCourse.id },
    { userId: marcus.id, courseId: dataCourse.id },
    { userId: manager.id, courseId: leadershipCourse.id },
  ]);

  // Add some progress
  await db.insert(progressTable).values([
    { userId: sarah.id, courseId: leadershipCourse.id, status: "completed", completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    { userId: marcus.id, courseId: leadershipCourse.id, status: "in_progress" },
    { userId: emily.id, courseId: leadershipCourse.id, status: "in_progress" },
    { userId: sarah.id, courseId: dataCourse.id, status: "in_progress" },
    { userId: marcus.id, courseId: dataCourse.id, status: "completed", completedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) },
  ]);

  console.log("  ✓ Created enrollments and progress");

  // Create tasks
  await db.insert(tasksTable).values([
    {
      title: "Complete Q4 Budget Report",
      description: "Compile all department budgets and prepare the Q4 financial summary report for board review.",
      status: "in_progress",
      priority: "urgent",
      assigneeId: manager.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Update Employee Handbook",
      description: "Review and update the employee handbook with the latest policies and procedures from HR.",
      status: "todo",
      priority: "high",
      assigneeId: sarah.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Conduct Security Audit",
      description: "Perform a comprehensive security audit of our production systems and document findings.",
      status: "todo",
      priority: "high",
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Design New Onboarding Flow",
      description: "Create wireframes and mockups for the revamped employee onboarding experience.",
      status: "in_progress",
      priority: "medium",
      assigneeId: sarah.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Platform Performance Optimization",
      description: "Identify and resolve performance bottlenecks in the main application. Target: 40% improvement.",
      status: "in_progress",
      priority: "high",
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Prepare Q1 Marketing Strategy",
      description: "Develop comprehensive marketing strategy for Q1 including digital, content, and event planning.",
      status: "todo",
      priority: "medium",
      assigneeId: emily.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Review Vendor Contracts",
      description: "Review all active vendor contracts up for renewal and negotiate better terms where possible.",
      status: "completed",
      priority: "medium",
      assigneeId: manager.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Set Up CI/CD Pipeline",
      description: "Implement automated testing and deployment pipeline for all services.",
      status: "completed",
      priority: "high",
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Customer Satisfaction Survey",
      description: "Design and distribute the annual customer satisfaction survey. Analyze results and present findings.",
      status: "todo",
      priority: "low",
      assigneeId: emily.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Accessibility Compliance Review",
      description: "Audit the platform for WCAG 2.1 compliance and implement necessary improvements.",
      status: "todo",
      priority: "medium",
      assigneeId: sarah.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
    },
    {
      title: "API Documentation Update",
      description: "Update all API documentation to reflect recent changes. Add code examples and improve clarity.",
      status: "completed",
      priority: "low",
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Team Building Activity Planning",
      description: "Organize Q1 team building event. Research venues, activities, and prepare budget proposal.",
      status: "in_progress",
      priority: "low",
      assigneeId: emily.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Implement Dark Mode",
      description: "Add dark mode support to the enterprise platform UI following design system guidelines.",
      status: "completed",
      priority: "medium",
      assigneeId: sarah.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Database Backup Strategy",
      description: "Implement automated daily backups with 30-day retention policy and test restoration procedure.",
      status: "in_progress",
      priority: "urgent",
      assigneeId: marcus.id,
      createdById: admin.id,
      dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    },
    {
      title: "Social Media Content Calendar",
      description: "Plan and schedule 3 months of social media content across LinkedIn, Twitter, and Instagram.",
      status: "todo",
      priority: "medium",
      assigneeId: emily.id,
      createdById: manager.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("  ✓ Created 15 tasks");

  // Create sample files
  await db.insert(filesTable).values([
    {
      name: "q4-budget-report.pdf",
      originalName: "Q4 Budget Report 2024.pdf",
      mimeType: "application/pdf",
      size: 2457600,
      folder: "Finance",
      url: "/files/q4-budget-report.pdf",
      uploadedById: admin.id,
      isPublic: false,
    },
    {
      name: "employee-handbook-v3.pdf",
      originalName: "Employee Handbook v3.0.pdf",
      mimeType: "application/pdf",
      size: 1843200,
      folder: "HR",
      url: "/files/employee-handbook-v3.pdf",
      uploadedById: manager.id,
      isPublic: true,
    },
    {
      name: "brand-guidelines-2024.pdf",
      originalName: "Brand Guidelines 2024.pdf",
      mimeType: "application/pdf",
      size: 5120000,
      folder: "Design",
      url: "/files/brand-guidelines-2024.pdf",
      uploadedById: sarah.id,
      isPublic: true,
    },
    {
      name: "security-policy.docx",
      originalName: "Security Policy.docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      size: 512000,
      folder: "IT",
      url: "/files/security-policy.docx",
      uploadedById: marcus.id,
      isPublic: false,
    },
    {
      name: "q1-marketing-plan.pptx",
      originalName: "Q1 2025 Marketing Plan.pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      size: 8388608,
      folder: "Marketing",
      url: "/files/q1-marketing-plan.pptx",
      uploadedById: emily.id,
      isPublic: false,
    },
    {
      name: "team-org-chart.png",
      originalName: "Team Org Chart.png",
      mimeType: "image/png",
      size: 204800,
      folder: "HR",
      url: "/files/team-org-chart.png",
      uploadedById: admin.id,
      isPublic: true,
    },
  ]);

  console.log("  ✓ Created 6 files");

  // Create automations
  await db.insert(automationsTable).values([
    {
      name: "Course Completion → Assign Certificate Task",
      description: "When an employee completes a course, automatically assign a task to the admin to issue the certificate.",
      trigger: "course_completed",
      condition: null,
      action: "create_task",
      actionConfig: { taskTitle: "Issue certificate for completed course", assigneeRole: "admin", priority: "low" },
      isActive: true,
      runCount: 12,
    },
    {
      name: "New Task → Notify Manager",
      description: "When a high-priority task is created, immediately notify the assigned manager via activity log.",
      trigger: "task_created",
      condition: { priority: "high" },
      action: "notify_admin",
      actionConfig: { message: "High priority task created", notifyRole: "manager" },
      isActive: true,
      runCount: 34,
    },
    {
      name: "File Upload → Log Activity",
      description: "When any file is uploaded to the system, log an activity entry for audit purposes.",
      trigger: "file_uploaded",
      condition: null,
      action: "notify_admin",
      actionConfig: { message: "New file uploaded", logAudit: true },
      isActive: true,
      runCount: 48,
    },
    {
      name: "Task Completed → Enroll in Advanced Course",
      description: "When an employee completes all their tasks in a sprint, auto-enroll them in an advanced training course.",
      trigger: "task_completed",
      condition: { allTasksCompleted: true },
      action: "enroll_course",
      actionConfig: { courseId: dataCourse.id, message: "Great work! You've been enrolled in an advanced course." },
      isActive: false,
      runCount: 3,
    },
    {
      name: "New User Enrolled → Send Welcome",
      description: "When a new user is enrolled in a course, send a welcome notification with course details.",
      trigger: "user_enrolled",
      condition: null,
      action: "send_notification",
      actionConfig: { template: "welcome_course", channel: "email" },
      isActive: true,
      runCount: 67,
    },
  ]);

  console.log("  ✓ Created 5 automations");

  // Seed activity logs
  const now = Date.now();
  await db.insert(activityLogsTable).values([
    { userId: admin.id, action: "created", entityType: "course", entityId: leadershipCourse.id, metadata: { title: "Leadership Excellence Program" }, createdAt: new Date(now - 15 * 24 * 60 * 60 * 1000) },
    { userId: manager.id, action: "enrolled", entityType: "enrollment", entityId: sarah.id, metadata: { courseTitle: "Leadership Excellence Program", userName: "Sarah Chen" }, createdAt: new Date(now - 14 * 24 * 60 * 60 * 1000) },
    { userId: admin.id, action: "created", entityType: "task", entityId: 1, metadata: { title: "Q4 Budget Report" }, createdAt: new Date(now - 12 * 24 * 60 * 60 * 1000) },
    { userId: sarah.id, action: "completed", entityType: "course", entityId: leadershipCourse.id, metadata: { courseTitle: "Leadership Excellence Program" }, createdAt: new Date(now - 7 * 24 * 60 * 60 * 1000) },
    { userId: marcus.id, action: "uploaded", entityType: "file", entityId: 4, metadata: { fileName: "Security Policy.docx" }, createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
    { userId: manager.id, action: "completed", entityType: "task", entityId: 7, metadata: { title: "Review Vendor Contracts" }, createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000) },
    { userId: marcus.id, action: "completed", entityType: "task", entityId: 8, metadata: { title: "Set Up CI/CD Pipeline" }, createdAt: new Date(now - 4 * 24 * 60 * 60 * 1000) },
    { userId: emily.id, action: "uploaded", entityType: "file", entityId: 5, metadata: { fileName: "Q1 2025 Marketing Plan.pptx" }, createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
    { userId: marcus.id, action: "completed", entityType: "course", entityId: dataCourse.id, metadata: { courseTitle: "Advanced Data Analysis with Python" }, createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000) },
    { userId: admin.id, action: "created", entityType: "automation", entityId: 1, metadata: { name: "Course Completion → Assign Certificate Task" }, createdAt: new Date(now - 2 * 24 * 60 * 60 * 1000) },
    { userId: sarah.id, action: "completed", entityType: "task", entityId: 13, metadata: { title: "Implement Dark Mode" }, createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
    { userId: marcus.id, action: "completed", entityType: "task", entityId: 11, metadata: { title: "API Documentation Update" }, createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000) },
  ]);

  console.log("  ✓ Created activity logs");
  console.log("\n✅ Database seeded successfully!");
  console.log("\nDemo credentials:");
  console.log("  Admin: admin@demo.com / admin123");
  console.log("  Manager: manager@demo.com / manager123");
  console.log("  Employee: employee@demo.com / employee123");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
