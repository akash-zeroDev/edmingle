# Edmingle - Future Roadmap

The following features were discussed during the initial architecture phase but have been deferred to post-MVP versions to ensure a faster time to market.

## Super Admin Dashboard (Post-MVP Features)

### 4. Platform Users
*   **What it is:** Global user management.
*   **What it shows:** A list of every single user (Institute Admins, Teachers) across the platform. Helpful for debugging if an Institute Admin forgets their email or gets locked out.

### 5. Broadcasts / Announcements
*   **What it is:** System-wide messaging.
*   **What it shows:** Allows the platform owner to post a banner that every Institute sees when they log in. (e.g., "Scheduled Maintenance on Sunday at 2 AM").

### 6. Support / Tickets
*   **What it is:** Helpdesk for your clients.
*   **What it shows:** When an Institute Admin has a bug or a question, they submit a ticket, and it lands here for you to resolve.

### 7. Global Settings
*   **What it is:** Platform configurations.
*   **What it shows:** Manage payment gateway keys (Stripe/Razorpay), email server settings (Resend/SendGrid), and your own Admin profile.

---

## Institute & Batch Management (Upcoming Versions)

### 1. Curriculum & Syllabus Progress Tracker
*   **What it is:** Granular syllabus and chapter completion tracking per batch.
*   **What it shows:** 
    *   Allows institute admins and faculty to define the syllabus roadmap, divided into chapters and modules per batch/subject (e.g., *Kinematics: 100% Complete*, *Thermodynamics: 40% In Progress*, *Optics: Upcoming*).
    *   Enables faculty to log completed topics and lecture milestones.
    *   Provides students and parents with clear visibility into course progress, milestones, and projected completion dates.
*   **Data Modeling Considerations:**
    *   `SyllabusModule` / `Chapter` model linked to `Batch`.
    *   Fields: `title`, `description`, `order`, `status` (`NOT_STARTED` | `IN_PROGRESS` | `COMPLETED`), `completionPercentage`, `completedAt`, `facultyNotes`.

### 2. Weekly Timetable & Lecture Schedule Grid
*   **What it is:** Interactive visual weekly calendar and clash-prevention engine.
*   **What it shows:**
    *   Interactive weekly calendar grid (Monday–Saturday) rendering all scheduled lecture time slots across batches.
    *   **Conflict & Double-Booking Prevention**: Automatically validates and blocks scheduling collisions where the same teacher or room is assigned to multiple classes simultaneously.
    *   Color-coded views by batch, faculty member, or classroom/room location.
    *   Quick rescheduling and real-time schedule distribution to faculty and students.
*   **Data Modeling Considerations:**
    *   `TimetableSlot` model linked to `Batch`, `Teacher`, and optional `Classroom`.
    *   Fields: `dayOfWeek` (MONDAY..SATURDAY), `startTime`, `endTime`, `roomNumber`, `recurrence`.

---

## Workspace Mock Datasets Reference

The prototype data powering batch features before full database migration is documented and maintained in:
👉 [`src/data/mock-batch-workspace.ts`](file:///Users/apple/Desktop/Edmingle/src/data/mock-batch-workspace.ts)

*   `mockFeeRows`: Pre-modeled installment billing structures for batches.
*   `mockModules`: Syllabus chapter hierarchy with progress tracking.
*   `mockTimetable`: 6-day lecture schedule slots and room allocations.
*   `mockAnnouncements`: Batch broadcast notices with audience targeting.


