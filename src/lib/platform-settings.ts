import fs from "fs/promises"
import path from "path"

export interface PlatformBankingSettings {
  accountHolderName: string
  accountNumber: string
  ifscCode: string
  bankName: string
  branchName: string
  accountType: "CURRENT" | "SAVINGS"
  upiVpa: string
}

export interface PlatformRazorpaySettings {
  keyId: string
  keySecret: string
  webhookSecret: string
  environment: "TEST" | "LIVE"
  isActive: boolean
}

export interface PlatformSettingsData {
  banking: PlatformBankingSettings
  razorpay: PlatformRazorpaySettings
  updatedAt?: string
  updatedBy?: string
}

const DEFAULT_SETTINGS: PlatformSettingsData = {
  banking: {
    accountHolderName: "Classly Technologies Private Limited",
    accountNumber: "918020045678912",
    ifscCode: "HDFC0001234",
    bankName: "HDFC Bank",
    branchName: "Connaught Place, New Delhi",
    accountType: "CURRENT",
    upiVpa: "classly@okhdfcbank",
  },
  razorpay: {
    keyId: "rzp_test_1DP5mmOlF5G5ag",
    keySecret: "masked_secret_key_configured",
    webhookSecret: "whsec_edmingle_platform_prod",
    environment: "TEST",
    isActive: true,
  },
  updatedAt: new Date().toISOString(),
  updatedBy: "Super Admin",
}

const SETTINGS_FILE_PATH = path.join(process.cwd(), "src", "data", "platform-settings.json")

export async function readPlatformSettings(): Promise<PlatformSettingsData> {
  try {
    const raw = await fs.readFile(SETTINGS_FILE_PATH, "utf-8")
    const parsed = JSON.parse(raw)
    return {
      banking: { ...DEFAULT_SETTINGS.banking, ...parsed.banking },
      razorpay: { ...DEFAULT_SETTINGS.razorpay, ...parsed.razorpay },
      updatedAt: parsed.updatedAt || DEFAULT_SETTINGS.updatedAt,
      updatedBy: parsed.updatedBy || DEFAULT_SETTINGS.updatedBy,
    }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export async function savePlatformSettings(data: Partial<PlatformSettingsData>): Promise<PlatformSettingsData> {
  try {
    const current = await readPlatformSettings()
    const updated: PlatformSettingsData = {
      banking: {
        ...current.banking,
        ...(data.banking || {}),
      },
      razorpay: {
        ...current.razorpay,
        ...(data.razorpay || {}),
      },
      updatedAt: new Date().toISOString(),
      updatedBy: data.updatedBy || current.updatedBy || "Super Admin",
    }

    await fs.mkdir(path.dirname(SETTINGS_FILE_PATH), { recursive: true })
    await fs.writeFile(SETTINGS_FILE_PATH, JSON.stringify(updated, null, 2), "utf-8")
    return updated
  } catch (error) {
    console.error("Failed to write platform settings file:", error)
    throw new Error("Failed to persist platform settings.")
  }
}
