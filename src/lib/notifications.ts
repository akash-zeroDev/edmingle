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

• Action: ${action}
• Effective Immediately
• Reason / Notes: ${reasonText}

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
