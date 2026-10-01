/**
 * ==============================================================================
 * DASHBOARD MOCK DATA & FUTURE BACKEND INTEGRATION REFERENCE
 * ==============================================================================
 * 
 * This file centralizes all placeholder datasets used in the Classly/Edmingle
 * Royal Blue dashboard that do not yet have corresponding models or time-series
 * aggregations in the PostgreSQL/Prisma database schema.
 * 
 * USE THIS FILE AS A SPECIFICATION FOR FUTURE BACKEND DEVELOPMENTS.
 */

/**
 * 1. STUDENT ENROLLMENT OVERVIEW (Time-Series Monthly Trend)
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - `Student` has `joinedAt DateTime @default(now())`.
 * - However, monthly cohort snapshots and historical active counts across 12 months
 *   are not pre-aggregated in the database.
 * 
 * Future Backend Wiring:
 * - Run monthly aggregations querying `Student` records where `joinedAt <= monthEnd`
 *   or create a `MonthlyInstituteMetrics` table updated by a scheduled cron job.
 */
export const studentMonthlyTrend = [
  { month: "Jan", newStudents: 118, active: 1920 },
  { month: "Feb", newStudents: 132, active: 2010 },
  { month: "Mar", newStudents: 126, active: 2078 },
  { month: "Apr", newStudents: 148, active: 2150 },
  { month: "May", newStudents: 156, active: 2208 },
  { month: "Jun", newStudents: 142, active: 2260 },
  { month: "Jul", newStudents: 174, airActive: 2322 },
  { month: "Aug", newStudents: 168, active: 2391 },
  { month: "Sep", newStudents: 184, active: 2486 },
  { month: "Oct", newStudents: 176, active: 2540 },
  { month: "Nov", newStudents: 191, active: 2612 },
  { month: "Dec", newStudents: 204, active: 2690 },
];

/**
 * 2. WEEKLY FEE COMPARISON (Current Month vs Previous Month)
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - `Fee` table tracks individual fee transactions with `amountPaid` and `paidAt`.
 * - Weekly interval groupings (Week 1–4) for both current and past month are mocked
 *   here in Lakhs (₹L) for chart presentation.
 * 
 * Future Backend Wiring:
 * - Query `prisma.fee.aggregate` grouping by 7-day buckets relative to the 1st of
 *   the current month and the 1st of the previous month.
 */
export const weeklyFeeComparison = [
  { week: "Week 1", current: 4.2, previous: 3.6 },
  { week: "Week 2", current: 5.1, previous: 4.3 },
  { week: "Week 3", current: 4.6, previous: 4.1 },
  { week: "Week 4", current: 4.52, previous: 4.36 },
];

/**
 * 3. TODAY'S ATTENDANCE BREAKDOWN (Live Roster Meter)
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - `Attendance` model exists in `schema.prisma` (`status String`, `date DateTime`).
 * - For new institutes with no daily morning roll-call submitted yet today,
 *   this placeholder provides the distribution meter and batch-wise percentages.
 * 
 * Future Backend Wiring:
 * - Run `prisma.attendance.groupBy({ by: ['status'], where: { date: today } })`.
 */
export const todayAttendanceMetrics = {
  overallPercentage: "91.8%",
  totalMarkedCount: 2331,
  breakdown: [
    { label: "Present", percentage: "91.8%", color: "bg-emerald-500" },
    { label: "Absent", percentage: "4.2%", color: "bg-rose-500" },
    { label: "Late", percentage: "2.1%", color: "bg-amber-500" },
    { label: "Leave", percentage: "1.9%", color: "bg-blue-500" },
  ],
  batches: [
    { name: "JEE Advanced A", total: "64", present: "61", absent: "3", rate: "95.3%" },
    { name: "NEET Elite", total: "82", present: "76", absent: "6", rate: "92.7%" },
    { name: "JEE Main B", total: "71", present: "64", absent: "7", rate: "90.1%" },
    { name: "Foundation 10", total: "58", present: "54", absent: "4", rate: "93.1%" },
  ],
};

/**
 * 4. NEEDS ATTENTION / ACTIONABLE ALERTS
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - Real overdue fees are queried dynamically from `prisma.fee`.
 * - Other audit categories (e.g. teachers who haven't marked attendance today,
 *   tests awaiting publication) are placeholders.
 * 
 * Future Backend Wiring:
 * - Scheduled daily health check action that scans:
 *   a) Unsubmitted attendance sheets for today's batches.
 *   b) Students with 3+ consecutive absences.
 *   c) Draft test papers awaiting publishing.
 */
export const attentionAlerts = [
  { severity: "error" as const, title: "12 students have overdue fees", detail: "₹84,000 outstanding", actionText: "View fees", link: "/institute/fees" },
  { severity: "warning" as const, title: "3 batches have incomplete attendance", detail: "Today’s records are still open", actionText: "View batches", link: "/institute/batches" },
  { severity: "warning" as const, title: "2 teachers haven’t submitted attendance", detail: "Submission due by 4:00 PM", actionText: "View teachers", link: "/institute/teachers" },
  { severity: "info" as const, title: "1 test is awaiting result publication", detail: "Physics Unit Test · Class 12", actionText: "View test", link: "/institute/batches" },
  { severity: "error" as const, title: "4 students absent for 3+ classes", detail: "Parent follow-up recommended", actionText: "View students", link: "/institute/students" },
];

/**
 * 5. INSTITUTE ANNOUNCEMENTS & CIRCULARS
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - No `Announcement` model exists currently in `schema.prisma`.
 * 
 * Future Backend Wiring:
 * - Add `model Announcement { id String @id, title String, content String, instituteId String, createdAt DateTime }`
 */
export const mockAnnouncements = [
  { text: "Parent-teacher meeting scheduled for Saturday", date: "Today" },
  { text: "JEE mock test timetable published", date: "Yesterday" },
  { text: "Scholarship forms close this Friday", date: "2 days ago" },
];

/**
 * 6. TOP PERFORMING STUDENTS (Academic Leaderboard)
 * ------------------------------------------------------------------------------
 * Current Schema Status:
 * - Test score grading or GPA tracking is not yet modeled in Prisma.
 * 
 * Future Backend Wiring:
 * - Add `Exam` and `ExamResult` models to store test marks, then calculate top ranks.
 */
export const mockTopPerformers = [
  { rank: "1", name: "Aarav Sharma", batch: "JEE Advanced A", score: "96.8%" },
  { rank: "2", name: "Riya Gupta", batch: "NEET Elite", score: "95.4%" },
  { rank: "3", name: "Ananya Singh", batch: "JEE Main B", score: "94.9%" },
];

/**
 * 7. GLOBAL SEARCH ITEMS (Search palette demo index)
 */
export const searchIndex = [
  { category: "Students", title: "Aarav Sharma", detail: "JEE Advanced A", link: "/institute/students" },
  { category: "Students", title: "Priya Shah", detail: "NEET Elite", link: "/institute/students" },
  { category: "Batches", title: "JEE Advanced A", detail: "64 students", link: "/institute/batches" },
  { category: "Teachers", title: "Dr. Rajiv Sharma", detail: "Physics Faculty", link: "/institute/teachers" },
  { category: "Payments", title: "Payment from Priya Shah", detail: "₹22,500 · Paid", link: "/institute/fees" },
  { category: "Tests", title: "Physics Unit Test", detail: "Published today", link: "/institute/batches" },
];
