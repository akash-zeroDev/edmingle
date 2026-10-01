/**
 * Mock Workspace Datasets for Batch Operations
 *
 * This file houses high-fidelity structured mock data for batch features that
 * are planned for future database migrations (Curriculum, Timetable, Fee Schedules, Announcements).
 *
 * Future Schema Transition Plan:
 * - `mockFeeRows`      -> Will be backed by `model BatchFeeSchedule` / `model FeeInstallment`
 * - `mockModules`      -> Will be backed by `model CurriculumModule` / `model Topic`
 * - `mockTimetable`    -> Will be backed by `model TimetableSlot` / `model LectureSlot`
 * - `mockAnnouncements`-> Will be backed by `model BatchAnnouncement`
 */

export interface MockStudent {
  roll: string
  name: string
  phone: string
  parentPhone?: string
  attendance: string
  fees: "Paid" | "Partially paid" | "Due"
}

export interface MockFeeRow {
  student: string
  installment: string
  amount: string
  paid: string
  due: string
  date: string
  status: "Paid" | "Partially paid" | "Due"
}

export interface MockModule {
  name: string
  topics: string
  progress: number
}

export interface MockTimetableSlot {
  day: string
  date: string
  time: string
  topic: string
  room: string
}

export type AnnouncementAudience = "students" | "parents" | "both"

export interface MockAnnouncement {
  id: string
  title: string
  meta: string
  body: string
  targetAudience?: AnnouncementAudience
}

// Fallback student records when a freshly created batch has no enrollments yet
export const fallbackStudents: MockStudent[] = [
  { roll: "J26-001", name: "Aarav Sharma", phone: "+91 98102 45631", parentPhone: "+91 98102 45600", attendance: "96.4%", fees: "Paid" },
  { roll: "J26-002", name: "Ananya Gupta", phone: "+91 98911 20548", parentPhone: "+91 98911 20500", attendance: "94.8%", fees: "Paid" },
  { roll: "J26-003", name: "Vivaan Mehta", phone: "+91 99108 66219", parentPhone: "+91 99108 66200", attendance: "91.2%", fees: "Partially paid" },
  { roll: "J26-004", name: "Ishita Kapoor", phone: "+91 98731 80442", parentPhone: "+91 98731 80400", attendance: "89.7%", fees: "Due" },
  { roll: "J26-005", name: "Arjun Nair", phone: "+91 98217 34015", parentPhone: "+91 98217 34000", attendance: "93.1%", fees: "Paid" },
  { roll: "J26-006", name: "Saanvi Rao", phone: "+91 97693 54182", parentPhone: "+91 97693 54100", attendance: "87.5%", fees: "Due" },
]

// Installment billing records per batch
export const mockFeeRows: MockFeeRow[] = [
  { student: "Aarav Sharma", installment: "Quarter 3", amount: "₹40,000", paid: "₹40,000", due: "—", date: "18 Sep 2026", status: "Paid" },
  { student: "Ananya Gupta", installment: "Quarter 3", amount: "₹40,000", paid: "₹40,000", due: "—", date: "16 Sep 2026", status: "Paid" },
  { student: "Vivaan Mehta", installment: "Quarter 3", amount: "₹40,000", paid: "₹25,000", due: "₹15,000", date: "24 Sep 2026", status: "Partially paid" },
  { student: "Ishita Kapoor", installment: "Quarter 3", amount: "₹40,000", paid: "—", due: "₹40,000", date: "30 Sep 2026", status: "Due" },
  { student: "Arjun Nair", installment: "Quarter 3", amount: "₹40,000", paid: "₹40,000", due: "—", date: "12 Sep 2026", status: "Paid" },
  { student: "Saanvi Rao", installment: "Quarter 3", amount: "₹40,000", paid: "—", due: "₹40,000", date: "30 Sep 2026", status: "Due" },
]

// Syllabus and curriculum modules
export const mockModules: MockModule[] = [
  { name: "Mechanics & Properties of Matter", topics: "18 of 20 topics completed", progress: 90 },
  { name: "Electrostatics & Current Electricity", topics: "13 of 18 topics completed", progress: 72 },
  { name: "Magnetism & Electromagnetic Induction", topics: "8 of 16 topics completed", progress: 50 },
  { name: "Optics & Modern Physics", topics: "4 of 14 topics completed", progress: 29 },
]

// Timetable and lecture schedules
export const mockTimetable: MockTimetableSlot[] = [
  { day: "Monday", date: "28 Sep", time: "09:00–10:30", topic: "Electromagnetic Induction", room: "Room 204" },
  { day: "Wednesday", date: "30 Sep", time: "09:00–10:30", topic: "Alternating Current", room: "Room 204" },
  { day: "Friday", date: "02 Oct", time: "09:00–10:30", topic: "AC Circuits: Numericals", room: "Lab 2" },
  { day: "Saturday", date: "03 Oct", time: "11:00–12:00", topic: "Weekly Doubt Clearing Session", room: "Room 108" },
]

// Batch notices and announcements
export const mockAnnouncements: MockAnnouncement[] = [
  {
    id: "ann-1",
    title: "Full syllabus mock test on 4 October",
    meta: "Posted today · All students & parents",
    body: "Reporting time is 08:30 AM sharp. Students must carry their institute ID card and complete revision of Chapters 1 through 3.",
    targetAudience: "both",
  },
  {
    id: "ann-2",
    title: "Updated problem set uploaded for Rotational Dynamics",
    meta: "Posted 26 Sep · Batch students",
    body: "Practice Problem Set 14 now includes step-by-step video solutions and numerical hints for Rotational Inertia.",
    targetAudience: "students",
  },
  {
    id: "ann-3",
    title: "Parent progress mentorship calls scheduled",
    meta: "Posted 24 Sep · Parents",
    body: "Faculty mentors will contact parents of students below 85% attendance by this Friday to review progress and milestones.",
    targetAudience: "parents",
  },
]

