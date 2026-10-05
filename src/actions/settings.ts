"use server"

import prisma from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { currentUser } from "@clerk/nextjs/server"
import { z } from "zod"
import crypto from "crypto"
import { getAuthenticatedInstitute } from "@/lib/current-institute"
import { dispatchNotice } from "@/lib/notifications"
import {
  readPlatformSettings,
  savePlatformSettings,
  type PlatformBankingSettings,
  type PlatformRazorpaySettings,
} from "@/lib/platform-settings"

// ==========================================
// 1. ZOD SCHEMAS WITH STRICT SECURITY CHECKS
// ==========================================

export const superAdminBankingSchema = z
  .object({
    accountHolderName: z
      .string()
      .trim()
      .min(3, "Account holder name must be at least 3 characters")
      .max(100, "Account holder name cannot exceed 100 characters")
      .regex(/^[a-zA-Z\s.]+$/, "Account holder name can only contain letters, spaces, and dots"),
    accountNumber: z
      .string()
      .trim()
      .regex(/^\d{9,18}$/, "Account number must be between 9 and 18 numerical digits"),
    confirmAccountNumber: z
      .string()
      .trim()
      .regex(/^\d{9,18}$/, "Confirmation account number must be between 9 and 18 numerical digits"),
    ifscCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid Indian IFSC code format (e.g. HDFC0001234, SBIN0000456)"),
    bankName: z
      .string()
      .trim()
      .min(2, "Bank name must be at least 2 characters")
      .max(80),
    branchName: z
      .string()
      .trim()
      .min(2, "Branch city/name must be at least 2 characters")
      .max(100),
    accountType: z.enum(["CURRENT", "SAVINGS"], {
      errorMap: () => ({ message: "Account type must be CURRENT or SAVINGS" }),
    }),
    upiVpa: z
      .string()
      .trim()
      .toLowerCase()
      .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI handle format (e.g. merchant@icici, classly@hdfc)")
      .or(z.literal("")),
  })
  .refine((data) => data.accountNumber === data.confirmAccountNumber, {
    message: "Bank account numbers do not match. Please re-enter carefully.",
    path: ["confirmAccountNumber"],
  })

export const razorpaySettingsSchema = z.object({
  keyId: z
    .string()
    .trim()
    .min(8, "Razorpay Key ID is required (e.g. rzp_test_... or rzp_live_...)"),
  keySecret: z
    .string()
    .trim()
    .min(6, "Razorpay Key Secret is required"),
  webhookSecret: z.string().trim().optional(),
  environment: z.enum(["TEST", "LIVE"]),
  isActive: z.boolean().default(true),
})

export const instituteSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Institute name must be at least 2 characters")
    .max(100, "Institute name cannot exceed 100 characters"),
  location: z.string().trim().max(200).optional(),
  phoneNo: z
    .string()
    .trim()
    .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
    .or(z.literal(""))
    .optional(),
  tagline: z.string().trim().max(150).optional(),
  gstin: z
    .string()
    .trim()
    .regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid Indian GSTIN format (e.g. 07AAAAA0000A1Z5)")
    .or(z.literal(""))
    .optional(),
  upiVpa: z
    .string()
    .trim()
    .toLowerCase()
    .regex(/^[\w.-]+@[\w.-]+$/, "Invalid UPI handle format (e.g. institute@okhdfcbank)")
    .or(z.literal(""))
    .optional(),
  receiptPrefix: z
    .string()
    .trim()
    .toUpperCase()
    .min(2, "Receipt prefix must be at least 2 letters")
    .max(8)
    .regex(/^[A-Z0-9]+$/, "Receipt prefix can only contain alphanumeric characters")
    .default("REC"),
  receiptTerms: z.string().trim().max(500).optional(),
  bankName: z.string().trim().max(80).optional(),
  bankAccountNumber: z.string().trim().regex(/^\d{9,18}$/, "Bank account number must be 9-18 digits").or(z.literal("")).optional(),
  bankIfsc: z.string().trim().toUpperCase().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code").or(z.literal("")).optional(),
  defaultBatchTimings: z.string().trim().optional(),
  attendanceGraceMinutes: z.coerce.number().min(0).max(60).default(15),
  sendAbsenteeAlert: z.boolean().default(true),
  sendFeeReminderAlert: z.boolean().default(true),
})

export const teacherAcademicProfileSchema = z.object({
  subjects: z
    .array(z.string().trim().min(1, "Subject cannot be empty"))
    .min(1, "Please specify at least one subject taught"),
  classes: z
    .array(z.string().trim().min(1, "Class/grade cannot be empty"))
    .min(1, "Please specify at least one class or batch level taught"),
  bio: z.string().trim().max(600, "Bio cannot exceed 600 characters").optional(),
})

// ==========================================
// 2. SUPER ADMIN SETTINGS ACTIONS
// ==========================================

export async function getSuperAdminSettings() {
  const user = await currentUser()
  if (user?.publicMetadata?.role !== "superadmin") {
    throw new Error("Unauthorized: Only Super Administrators can view platform settings.")
  }
  return await readPlatformSettings()
}

export async function updateSuperAdminBankingSettings(input: unknown) {
  try {
    const user = await currentUser()
    if (user?.publicMetadata?.role !== "superadmin") {
      return { success: false, error: "Unauthorized: Superadmin access required." }
    }

    const validated = superAdminBankingSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed for banking details.",
      }
    }

    const adminName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Super Admin"

    // Persist to platform settings
    await savePlatformSettings({
      banking: {
        accountHolderName: validated.data.accountHolderName,
        accountNumber: validated.data.accountNumber,
        ifscCode: validated.data.ifscCode,
        bankName: validated.data.bankName,
        branchName: validated.data.branchName,
        accountType: validated.data.accountType,
        upiVpa: validated.data.upiVpa || "",
      },
      updatedBy: adminName,
    })

    // Create Audit Log entry
    await prisma.auditLog.create({
      data: {
        actor: adminName,
        action: "MERCHANT_BANKING_UPDATED",
        details: `Updated platform payout banking details (${validated.data.bankName}, IFSC: ${validated.data.ifscCode}, A/C: ••••${validated.data.accountNumber.slice(-4)})`,
        severity: "WARNING",
        targetType: "PlatformSettings",
      },
    })

    revalidatePath("/admin/settings")
    return { success: true, message: "Merchant banking details updated successfully." }
  } catch (error: any) {
    console.error("Error updating super admin banking settings:", error)
    return { success: false, error: error.message || "Failed to update merchant banking details." }
  }
}

export async function updateRazorpaySettings(input: unknown) {
  try {
    const user = await currentUser()
    if (user?.publicMetadata?.role !== "superadmin") {
      return { success: false, error: "Unauthorized: Superadmin access required." }
    }

    const validated = razorpaySettingsSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed for Razorpay settings.",
      }
    }

    const adminName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Super Admin"

    await savePlatformSettings({
      razorpay: {
        keyId: validated.data.keyId,
        keySecret: validated.data.keySecret,
        webhookSecret: validated.data.webhookSecret || "",
        environment: validated.data.environment,
        isActive: validated.data.isActive,
      },
      updatedBy: adminName,
    })

    await prisma.auditLog.create({
      data: {
        actor: adminName,
        action: "RAZORPAY_CONFIG_UPDATED",
        details: `Updated Razorpay gateway configuration (Environment: ${validated.data.environment}, Active: ${validated.data.isActive})`,
        severity: "WARNING",
        targetType: "PlatformSettings",
      },
    })

    revalidatePath("/admin/settings")
    return { success: true, message: "Razorpay payment gateway configured successfully." }
  } catch (error: any) {
    console.error("Error updating Razorpay settings:", error)
    return { success: false, error: error.message || "Failed to update Razorpay configuration." }
  }
}

/**
 * Validates Razorpay credentials by sending a live probe request to Razorpay REST API
 */
export async function verifyRazorpayCredentials(keyId: string, keySecret: string) {
  try {
    const user = await currentUser()
    if (user?.publicMetadata?.role !== "superadmin") {
      return { success: false, message: "Unauthorized" }
    }

    if (!keyId || !keySecret) {
      return { success: false, message: "Both Razorpay Key ID and Key Secret are required." }
    }

    const basicAuth = Buffer.from(`${keyId}:${keySecret}`).toString("base64")

    // Probe Razorpay API (orders endpoint with count=1)
    const response = await fetch("https://api.razorpay.com/v1/orders?count=1", {
      method: "GET",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    if (response.status === 200) {
      return {
        success: true,
        message: "Razorpay credentials verified successfully! Live API connection established.",
      }
    } else if (response.status === 401) {
      return {
        success: false,
        message: "Authentication failed. The Razorpay Key ID or Key Secret is invalid.",
      }
    } else {
      const errData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: errData?.error?.description || `Razorpay returned HTTP ${response.status}`,
      }
    }
  } catch (error: any) {
    // In restricted sandbox or offline mode, give helpful verification notice
    if (error?.message?.includes("fetch failed") || error?.code === "ENOTFOUND") {
      return {
        success: false,
        message: "Unable to reach Razorpay API endpoint. Check internet connection or network proxy.",
      }
    }
    return {
      success: false,
      message: error?.message || "Failed to probe Razorpay credentials.",
    }
  }
}

// ==========================================
// 3. INSTITUTE ADMIN SETTINGS ACTIONS
// ==========================================

export async function getInstituteSettings() {
  const authData = await getAuthenticatedInstitute()
  if (!authData?.institute) {
    throw new Error("Unauthorized or institute not found")
  }
  const { institute } = authData

  let extraConfig: any = {}
  try {
    if (institute.subsInfo) {
      extraConfig = JSON.parse(institute.subsInfo)
    }
  } catch {
    extraConfig = {}
  }

  return {
    id: institute.id,
    name: institute.name,
    location: institute.location || "",
    phoneNo: institute.phoneNo || "",
    adminEmail: institute.adminEmail,
    subscriptionType: institute.subscriptionType,
    joinedAt: institute.joinedAt,
    // Extended fields stored in subsInfo
    tagline: extraConfig.tagline || "",
    gstin: extraConfig.gstin || "",
    upiVpa: extraConfig.upiVpa || "",
    receiptPrefix: extraConfig.receiptPrefix || "REC",
    receiptTerms: extraConfig.receiptTerms || "Fees once paid are non-refundable. Please retain this receipt for official records.",
    bankName: extraConfig.bankName || "",
    bankAccountNumber: extraConfig.bankAccountNumber || "",
    bankIfsc: extraConfig.bankIfsc || "",
    defaultBatchTimings: extraConfig.defaultBatchTimings || "04:00 PM - 07:00 PM",
    attendanceGraceMinutes: extraConfig.attendanceGraceMinutes ?? 15,
    sendAbsenteeAlert: extraConfig.sendAbsenteeAlert ?? true,
    sendFeeReminderAlert: extraConfig.sendFeeReminderAlert ?? true,
  }
}

export async function updateInstituteSettings(input: unknown) {
  try {
    const authData = await getAuthenticatedInstitute()
    if (!authData?.institute) {
      return { success: false, error: "Unauthorized or institute not found." }
    }
    const { institute, user } = authData

    const validated = instituteSettingsSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed for institute settings.",
      }
    }

    const {
      name,
      location,
      phoneNo,
      tagline,
      gstin,
      upiVpa,
      receiptPrefix,
      receiptTerms,
      bankName,
      bankAccountNumber,
      bankIfsc,
      defaultBatchTimings,
      attendanceGraceMinutes,
      sendAbsenteeAlert,
      sendFeeReminderAlert,
    } = validated.data

    const subsInfoJson = JSON.stringify({
      tagline: tagline || "",
      gstin: gstin || "",
      upiVpa: upiVpa || "",
      receiptPrefix: receiptPrefix || "REC",
      receiptTerms: receiptTerms || "",
      bankName: bankName || "",
      bankAccountNumber: bankAccountNumber || "",
      bankIfsc: bankIfsc || "",
      defaultBatchTimings: defaultBatchTimings || "",
      attendanceGraceMinutes,
      sendAbsenteeAlert,
      sendFeeReminderAlert,
    })

    // Execute raw SQL first to bypass any stale dev caching
    await prisma.$executeRaw`
      UPDATE "Institute" 
      SET 
        name = ${name},
        location = ${location || null},
        "phoneNo" = ${phoneNo || null},
        "subsInfo" = ${subsInfoJson}
      WHERE id = ${institute.id}
    `

    // Also update via Prisma Client
    try {
      await prisma.institute.update({
        where: { id: institute.id },
        data: {
          name,
          location: location || null,
          phoneNo: phoneNo || null,
          subsInfo: subsInfoJson,
        },
      })
    } catch {
      // Continue even if Prisma cached schema differs
    }

    const actor = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : "Institute Admin"

    await prisma.auditLog.create({
      data: {
        actor,
        action: "INSTITUTE_SETTINGS_UPDATED",
        details: `Updated center branding: Name changed to "${name}", Location: "${location || "N/A"}", UPI: "${upiVpa || "N/A"}"`,
        severity: "INFO",
        targetId: institute.id,
        targetType: "Institute",
      },
    })

    // Revalidate all pages where institute branding or details render live!
    revalidatePath("/institute", "layout")
    revalidatePath("/institute/settings")
    revalidatePath("/institute/fees")
    revalidatePath("/institute/payroll")
    revalidatePath("/institute/students")
    revalidatePath("/institute/teachers")
    revalidatePath("/teacher", "layout")
    revalidatePath("/student", "layout")
    revalidatePath("/admin/institutes")

    return {
      success: true,
      message: "Institute profile & branding updated successfully across all portals and receipts.",
    }
  } catch (error: any) {
    console.error("Error updating institute settings:", error)
    return { success: false, error: error.message || "Failed to update institute settings." }
  }
}

// ==========================================
// 4. TEACHER ACADEMIC PROFILE & TAG ACTIONS
// ==========================================

export async function updateTeacherAcademicProfile(input: unknown) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized: Please log in." }
    }

    const validated = teacherAcademicProfileSchema.safeParse(input)
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.issues[0]?.message || "Validation failed for academic profile.",
      }
    }

    const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    const teacher = await prisma.teacher.findFirst({
      where: {
        OR: [
          { clerkUserId: user.id },
          ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
          ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
        ],
      },
    })

    if (!teacher) {
      return { success: false, error: "Teacher record not found for your account." }
    }

    // Pack subjects and classes into structured JSON or comma-separated format
    const subjectsPayload = JSON.stringify({
      subjects: validated.data.subjects,
      classes: validated.data.classes,
      bio: validated.data.bio || "",
    })

    await prisma.teacher.update({
      where: { id: teacher.id },
      data: {
        subjects: subjectsPayload,
      },
    })

    const actor = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : teacher.name

    await prisma.auditLog.create({
      data: {
        actor,
        action: "TEACHER_ACADEMIC_PROFILE_UPDATED",
        details: `Updated subjects: [${validated.data.subjects.join(", ")}], Classes: [${validated.data.classes.join(", ")}]`,
        severity: "INFO",
        targetId: teacher.id,
        targetType: "Teacher",
      },
    })

    revalidatePath("/teacher")
    revalidatePath("/teacher", "layout")
    revalidatePath("/institute/teachers")

    return {
      success: true,
      message: "Academic profile, subjects taught, and classes updated successfully.",
    }
  } catch (error: any) {
    console.error("Error updating teacher academic profile:", error)
    return { success: false, error: error.message || "Failed to update academic profile." }
  }
}

// ==========================================
// 5. SECURE OTP PHONE NUMBER VERIFICATION
// ==========================================

interface OtpRecord {
  phone: string
  otp: string
  userId: string
  role: "student" | "teacher"
  expiresAt: number
  attempts: number
}

// In-memory OTP storage with automatic 5-minute expiry
const otpStore = new Map<string, OtpRecord>()

const MAX_PHONE_CHANGES_PER_YEAR = 3
const COOLDOWN_HOURS = 24

/**
 * Returns phone update quota status for the current student or teacher
 */
export async function getPhoneChangeQuota(role: "student" | "teacher") {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    let recordId: string | null = null
    let currentPhone: string | null = null

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { clerkUserId: user.id },
            ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
            ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
          ],
        },
      })
      if (teacher) {
        recordId = teacher.id
        currentPhone = teacher.phoneNo
      }
    } else {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { clerkUserId: user.id },
            ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
            ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
          ],
        },
      })
      if (student) {
        recordId = student.id
        currentPhone = student.phoneNo
      }
    }

    if (!recordId) {
      // In preview mode or unlinked user, provide standard quota
      return {
        success: true,
        currentPhone: currentPhone || "+91 98102 45631",
        usedChanges: 1,
        maxChanges: MAX_PHONE_CHANGES_PER_YEAR,
        remainingQuota: 2,
        canChange: true,
      }
    }

    // Calculate start of current academic year (April 1st)
    const now = new Date()
    const currentYear = now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1
    const academicYearStart = new Date(currentYear, 3, 1) // April 1st

    const changesThisYear = await prisma.auditLog.count({
      where: {
        targetId: recordId,
        action: "PHONE_NUMBER_UPDATED",
        createdAt: { gte: academicYearStart },
      },
    })

    const lastChange = await prisma.auditLog.findFirst({
      where: {
        targetId: recordId,
        action: "PHONE_NUMBER_UPDATED",
      },
      orderBy: { createdAt: "desc" },
    })

    let cooldownRemainingHours = 0
    if (lastChange) {
      const elapsedMs = Date.now() - new Date(lastChange.createdAt).getTime()
      const cooldownMs = COOLDOWN_HOURS * 60 * 60 * 1000
      if (elapsedMs < cooldownMs) {
        cooldownRemainingHours = Math.ceil((cooldownMs - elapsedMs) / (60 * 60 * 1000))
      }
    }

    const remainingQuota = Math.max(0, MAX_PHONE_CHANGES_PER_YEAR - changesThisYear)
    const canChange = remainingQuota > 0 && cooldownRemainingHours === 0

    return {
      success: true,
      currentPhone: currentPhone || "Not configured",
      usedChanges: changesThisYear,
      maxChanges: MAX_PHONE_CHANGES_PER_YEAR,
      remainingQuota,
      canChange,
      cooldownRemainingHours,
    }
  } catch (error: any) {
    console.error("Error getting phone change quota:", error)
    return { success: false, error: "Failed to fetch phone update quota." }
  }
}

/**
 * Initiates phone number change by validating quota, generating a 6-digit OTP, and dispatching notice
 */
export async function requestPhoneChangeOtp({
  newPhone,
  role,
}: {
  newPhone: string
  role: "student" | "teacher"
}) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized: Please log in." }
    }

    // Clean phone number (strip whitespace, hyphens, and +91 if present)
    const cleanPhone = newPhone.replace(/\s+/g, "").replace(/-/g, "")
    const digitsOnly = cleanPhone.startsWith("+91")
      ? cleanPhone.slice(3)
      : cleanPhone.startsWith("91") && cleanPhone.length === 12
      ? cleanPhone.slice(2)
      : cleanPhone

    // Validate 10-digit Indian phone format
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      return {
        success: false,
        error: "Please enter a valid 10-digit Indian mobile number (starting with 6, 7, 8, or 9).",
      }
    }

    const formattedNewPhone = `+91 ${digitsOnly.slice(0, 5)} ${digitsOnly.slice(5)}`

    // Check quota and authorization
    const quota = await getPhoneChangeQuota(role)
    if (!quota.success) {
      return { success: false, error: quota.error }
    }

    if (quota.remainingQuota <= 0) {
      return {
        success: false,
        error: `Annual limit reached: You have exhausted all ${MAX_PHONE_CHANGES_PER_YEAR} phone number updates for this academic year. Contact your institute admin for assistance.`,
      }
    }

    if (quota.cooldownRemainingHours && quota.cooldownRemainingHours > 0) {
      return {
        success: false,
        error: `Security cooldown active: Please wait ${quota.cooldownRemainingHours} hour(s) before updating your phone number again.`,
      }
    }

    // Check if new number is identical to current
    const currentPhoneDigits = quota.currentPhone?.replace(/\D/g, "").slice(-10)
    if (currentPhoneDigits === digitsOnly) {
      return {
        success: false,
        error: "The new mobile number cannot be the same as your currently registered mobile number.",
      }
    }

    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString()
    const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

    const storeKey = `${user.id}_${digitsOnly}`
    otpStore.set(storeKey, {
      phone: digitsOnly,
      otp,
      userId: user.id,
      role,
      expiresAt,
      attempts: 0,
    })

    // Dispatch notification
    await dispatchNotice({
      channel: "SMS",
      recipient: formattedNewPhone,
      title: "Classly Mobile Verification",
      message: `Your Classly verification code is ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`,
    })

    console.log(`[AUTH OTP DISPATCH] Sent 6-digit OTP ${otp} to ${formattedNewPhone} for user ${user.id}`)

    return {
      success: true,
      message: `Verification code sent to +91 ${digitsOnly.slice(0, 2)}••••••${digitsOnly.slice(-2)}`,
      formattedPhone: formattedNewPhone,
      remainingQuota: quota.remainingQuota,
      // Provide devOtp in development mode for easy manual testing
      devOtp: process.env.NODE_ENV !== "production" ? otp : undefined,
    }
  } catch (error: any) {
    console.error("Error requesting phone change OTP:", error)
    return { success: false, error: error.message || "Failed to generate verification code." }
  }
}

/**
 * Verifies the 6-digit OTP and updates the registered phone number in the database
 */
export async function verifyPhoneChangeOtp({
  newPhone,
  otp,
  role,
}: {
  newPhone: string
  otp: string
  role: "student" | "teacher"
}) {
  try {
    const user = await currentUser()
    if (!user) {
      return { success: false, error: "Unauthorized: Please log in." }
    }

    const cleanPhone = newPhone.replace(/\D/g, "").slice(-10)
    const cleanOtp = otp.trim()

    if (!cleanOtp || cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return { success: false, error: "Please enter a valid 6-digit verification code." }
    }

    const storeKey = `${user.id}_${cleanPhone}`
    const record = otpStore.get(storeKey)

    if (!record) {
      return {
        success: false,
        error: "Verification code has expired or was not requested. Please request a new code.",
      }
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(storeKey)
      return {
        success: false,
        error: "Verification code has expired. Please request a new code.",
      }
    }

    if (record.attempts >= 3) {
      otpStore.delete(storeKey)
      return {
        success: false,
        error: "Too many failed attempts. This verification code has been invalidated for security. Please request a new one.",
      }
    }

    if (record.otp !== cleanOtp) {
      record.attempts += 1
      const remainingAttempts = 3 - record.attempts
      return {
        success: false,
        error: `Incorrect verification code. ${remainingAttempts} attempt(s) remaining.`,
      }
    }

    // OTP verified successfully! Update the database
    const formattedPhone = `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    const emailList = user.emailAddresses?.map((e) => e.emailAddress.toLowerCase()) || []
    const phoneList = user.phoneNumbers?.map((p) => p.phoneNumber.replace(/\D/g, "")).filter(Boolean) || []

    let updatedTargetId = ""
    let oldPhone = ""

    if (role === "teacher") {
      const teacher = await prisma.teacher.findFirst({
        where: {
          OR: [
            { clerkUserId: user.id },
            ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
            ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
          ],
        },
      })

      if (teacher) {
        updatedTargetId = teacher.id
        oldPhone = teacher.phoneNo || "None"
        await prisma.teacher.update({
          where: { id: teacher.id },
          data: { phoneNo: formattedPhone },
        })
      }
    } else {
      const student = await prisma.student.findFirst({
        where: {
          OR: [
            { clerkUserId: user.id },
            ...(emailList.length > 0 ? [{ email: { in: emailList } }] : []),
            ...(phoneList.length > 0 ? [{ phoneNo: { in: phoneList } }] : []),
          ],
        },
      })

      if (student) {
        updatedTargetId = student.id
        oldPhone = student.phoneNo || "None"
        await prisma.student.update({
          where: { id: student.id },
          data: { phoneNo: formattedPhone },
        })
      }
    }

    // Record audit log entry
    const actorName = user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : `${role.toUpperCase()}`
    await prisma.auditLog.create({
      data: {
        actor: actorName,
        action: "PHONE_NUMBER_UPDATED",
        details: `Updated registered mobile number from "${oldPhone}" to "${formattedPhone}" via OTP verification`,
        severity: "INFO",
        targetId: updatedTargetId || user.id,
        targetType: role === "teacher" ? "Teacher" : "Student",
      },
    })

    // Delete used OTP
    otpStore.delete(storeKey)

    // Revalidate affected pages
    if (role === "teacher") {
      revalidatePath("/teacher")
      revalidatePath("/teacher", "layout")
      revalidatePath("/institute/teachers")
    } else {
      revalidatePath("/student")
      revalidatePath("/student", "layout")
      revalidatePath("/institute/students")
    }

    return {
      success: true,
      message: `Registered mobile number successfully updated to ${formattedPhone}.`,
      updatedPhone: formattedPhone,
    }
  } catch (error: any) {
    console.error("Error verifying phone change OTP:", error)
    return { success: false, error: error.message || "Failed to verify code and update mobile number." }
  }
}
