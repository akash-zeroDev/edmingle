/**
 * Central notification service for Edmingle
 * Sends SMS and Email notices to students, parents, and faculty
 */

export interface NotificationPayload {
  recipientName: string;
  recipientEmail?: string | null;
  recipientPhone?: string | null;
  parentPhone?: string | null;
  instituteName: string;
  action: "SUSPENDED" | "REMOVED" | "REACTIVATED";
  targetType: "STUDENT" | "TEACHER";
  reason?: string | null;
  batchNames?: string[];
}

export async function dispatchNotice(payload: NotificationPayload) {
  const {
    recipientName,
    recipientEmail,
    recipientPhone,
    parentPhone,
    instituteName,
    action,
    targetType,
    reason,
    batchNames = [],
  } = payload;

  const actionText =
    action === "SUSPENDED"
      ? "temporarily suspended"
      : action === "REMOVED"
      ? "permanently removed"
      : "reactivated";

  const targetLabel = targetType === "STUDENT" ? "Student" : "Faculty Member";
  const batchDetails = batchNames.length > 0 ? ` (Batches: ${batchNames.join(", ")})` : "";
  const reasonText = reason && reason.trim() ? reason.trim() : "Administrative decision / Policy compliance";

  // 1. Compose Email Notice
  const emailSubject = `Important Notice: ${targetLabel} Status Update from ${instituteName}`;
  const emailContent = `
===================================================================
OFFICIAL NOTICE - ${instituteName.toUpperCase()}
===================================================================
Dear ${recipientName},

This is an official communication informing you that your status as a ${targetLabel.toLowerCase()}${batchDetails} at ${instituteName} has been ${actionText.toUpperCase()}.

- Action: ${action}
- Effective immediately
- Reason: ${reasonText}

If you believe this is an error or have questions regarding this decision, please reach out to the institute administration immediately.

Sincerely,
Administration Department
${instituteName}
===================================================================
`.trim();

  // 2. Compose SMS Message (concise)
  const smsMessage = `[${instituteName}] Official Notice: ${recipientName} has been ${actionText}${batchDetails}. Reason: ${reasonText}. Contact admin for details.`;

  const recipients = {
    emails: [] as string[],
    phones: [] as string[],
  };

  if (recipientEmail) recipients.emails.push(recipientEmail);
  if (recipientPhone) recipients.phones.push(recipientPhone);
  if (parentPhone && parentPhone !== recipientPhone) recipients.phones.push(parentPhone);

  // Dispatch Log (simulated gateway / production webhook dispatch)
  console.log(`\n📨 [NOTIFICATION DISPATCHED] ================================`);
  console.log(`Institute: ${instituteName}`);
  console.log(`Target: ${recipientName} (${targetLabel})`);
  console.log(`Action: ${action}`);
  console.log(`Reason: ${reasonText}`);
  
  if (recipients.emails.length > 0) {
    console.log(`📧 EMAILS SENT TO: ${recipients.emails.join(", ")}`);
    console.log(`   Subject: ${emailSubject}`);
    console.log(`   Body:\n${emailContent}`);
  }

  if (recipients.phones.length > 0) {
    console.log(`📱 SMS SENT TO: ${recipients.phones.join(", ")}`);
    console.log(`   SMS Text: ${smsMessage}`);
  }
  console.log(`============================================================\n`);

  return {
    success: true,
    recipients,
    emailSubject,
    smsMessage,
    deliveredAt: new Date().toISOString(),
  };
}

export interface FeeReceiptNoticePayload {
  studentName: string;
  parentPhone?: string | null;
  studentPhone?: string | null;
  parentEmail?: string | null;
  instituteName: string;
  receiptNo: string;
  amount: number;
  paymentMode: string;
  remainingBalance: number;
  batchName: string;
}

export async function dispatchFeeReceiptNotice(payload: FeeReceiptNoticePayload) {
  const {
    studentName,
    parentPhone,
    studentPhone,
    parentEmail,
    instituteName,
    receiptNo,
    amount,
    paymentMode,
    remainingBalance,
    batchName,
  } = payload;

  const formattedAmount = `₹${amount.toLocaleString("en-IN")}`;
  const formattedBalance = `₹${remainingBalance.toLocaleString("en-IN")}`;

  const whatsappMessage = `*Payment receipt from ${instituteName}*\n\nDear Parent/Student,\nWe have received fee payment of *${formattedAmount}* via *${paymentMode}* for *${studentName}* (${batchName}).\n\n- Receipt No: ${receiptNo}\n- Remaining balance: ${formattedBalance}\n- Date: ${new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}\n\nThank you,\n${instituteName}`;

  const smsMessage = `[${instituteName}] Fee Payment Received: ${formattedAmount} for ${studentName} (${batchName}) via ${paymentMode}. Receipt #${receiptNo}. Balance Due: ${formattedBalance}.`;

  const recipients = {
    emails: parentEmail ? [parentEmail] : [],
    phones: [parentPhone, studentPhone].filter(Boolean) as string[],
  };

  console.log(`\n💳 [FEE RECEIPT NOTIFICATION] ================================`);
  console.log(`Institute: ${instituteName} | Receipt: ${receiptNo}`);
  console.log(`Student: ${studentName} | Amount: ${formattedAmount}`);
  if (recipients.phones.length > 0) {
    console.log(`📱 WhatsApp/SMS queued for: ${recipients.phones.join(", ")}`);
    console.log(`   Message: ${smsMessage}`);
  }
  console.log(`============================================================\n`);

  return {
    success: true,
    recipients,
    whatsappMessage,
    smsMessage,
    deliveredAt: new Date().toISOString(),
  };
}

export interface FeeReminderNoticePayload {
  studentName: string;
  parentPhone?: string | null;
  studentPhone?: string | null;
  instituteName: string;
  amountDue: number;
  dueDate: string;
  batchName: string;
}

export async function dispatchFeeReminderNotice(payload: FeeReminderNoticePayload) {
  const {
    studentName,
    parentPhone,
    studentPhone,
    instituteName,
    amountDue,
    dueDate,
    batchName,
  } = payload;

  const formattedAmount = `₹${amountDue.toLocaleString("en-IN")}`;

  const whatsappMessage = `*Fee Payment Reminder · ${instituteName}*\n\nDear Parent,\nThis is a gentle reminder that the academic fee of *${formattedAmount}* for *${studentName}* (${batchName}) is due on *${dueDate}*.\n\nPlease clear the dues at the center reception counter or scan the UPI QR code.\n\nThank you,\nAdministration, ${instituteName}`;

  const smsMessage = `[${instituteName}] Reminder: Fee of ${formattedAmount} for ${studentName} (${batchName}) is due on ${dueDate}. Please pay at reception desk or via UPI.`;

  const recipients = [parentPhone, studentPhone].filter(Boolean) as string[];

  console.log(`\n🔔 [FEE REMINDER NOTIFICATION] ==============================`);
  console.log(`Institute: ${instituteName} | Target: ${studentName}`);
  console.log(`Amount Due: ${formattedAmount} | Due Date: ${dueDate}`);
  console.log(`📱 SMS/WhatsApp queued for: ${recipients.join(", ")}`);
  console.log(`============================================================\n`);

  return {
    success: true,
    recipients,
    whatsappMessage,
    smsMessage,
    deliveredAt: new Date().toISOString(),
  };
}

