/**
 * Professional Institute Document Print Utilities
 * Generates official, minimal, publication-grade bills, receipts, and vouchers
 * suitable for Indian Coaching Institutes and Academies.
 */

// Helper to convert number to Indian Currency Words
export function numberToIndianRupeesWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return "Zero Rupees Only"

  const a = [
    "", "One ", "Two ", "Three ", "Four ", "Five ", "Six ", "Seven ", "Eight ", "Nine ",
    "Ten ", "Eleven ", "Twelve ", "Thirteen ", "Fourteen ", "Fifteen ", "Sixteen ",
    "Seventeen ", "Eighteen ", "Nineteen ",
  ]
  const b = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

  function inWords(n: number): string {
    if (n < 20) return a[n]
    const digit = n % 10
    return b[Math.floor(n / 10)] + (digit ? " " + a[digit] : " ")
  }

  let words = ""
  const crore = Math.floor(num / 10000000)
  num %= 10000000

  const lakh = Math.floor(num / 100000)
  num %= 100000

  const thousand = Math.floor(num / 1000)
  num %= 1000

  const hundred = Math.floor(num / 100)
  const remaining = num % 100

  if (crore > 0) words += inWords(crore) + "Crore "
  if (lakh > 0) words += inWords(lakh) + "Lakh "
  if (thousand > 0) words += inWords(thousand) + "Thousand "
  if (hundred > 0) words += inWords(hundred) + "Hundred "
  if (remaining > 0) words += inWords(remaining)

  return (words.trim() + " Rupees Only").replace(/\s+/g, " ")
}

// Print an HTML string using an isolated, zero-UI background iframe
export function printIsolatedDocument(htmlBody: string, documentTitle: string) {
  if (typeof window === "undefined") return

  const iframe = document.createElement("iframe")
  iframe.style.position = "fixed"
  iframe.style.right = "0"
  iframe.style.bottom = "0"
  iframe.style.width = "0"
  iframe.style.height = "0"
  iframe.style.border = "0"
  iframe.style.visibility = "hidden"
  document.body.appendChild(iframe)

  const doc = iframe.contentWindow?.document
  if (!doc) {
    window.print()
    return
  }

  doc.open()
  doc.write(`
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <title>${documentTitle}</title>
        <style>
          @page {
            size: A4 portrait;
            margin: 12mm 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            color: #0f172a;
            background: #ffffff;
            font-size: 12px;
            line-height: 1.5;
            padding: 10px;
          }
          .bill-sheet {
            max-width: 760px;
            margin: 0 auto;
            border: 1.5px solid #0f172a;
            padding: 24px 28px;
            background: #ffffff;
          }
          .bill-header {
            text-align: center;
            border-bottom: 2px solid #0f172a;
            padding-bottom: 14px;
            margin-bottom: 16px;
          }
          .inst-name {
            font-size: 20px;
            font-weight: 800;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            color: #0f172a;
          }
          .inst-meta {
            font-size: 10.5px;
            color: #475569;
            margin-top: 3px;
          }
          .doc-banner {
            display: inline-block;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 1.2px;
            text-transform: uppercase;
            border: 1.5px solid #0f172a;
            padding: 4px 18px;
            margin-top: 10px;
            background: #f8fafc;
          }
          .meta-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .meta-table td {
            padding: 5px 8px;
            font-size: 11.5px;
            border: 1px solid #cbd5e1;
          }
          .meta-table td.lbl {
            font-weight: 600;
            color: #475569;
            width: 22%;
            background: #f8fafc;
          }
          .meta-table td.val {
            font-weight: 600;
            color: #0f172a;
            width: 28%;
          }
          .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 16px;
          }
          .items-table th {
            background: #f1f5f9;
            color: #0f172a;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            border: 1px solid #94a3b8;
            padding: 7px 10px;
            text-align: left;
          }
          .items-table th.right, .items-table td.right {
            text-align: right;
          }
          .items-table td {
            padding: 7px 10px;
            font-size: 11.5px;
            border: 1px solid #cbd5e1;
          }
          .items-table tr.total-row td {
            font-weight: 800;
            font-size: 13px;
            border-top: 2px solid #0f172a;
            border-bottom: 2px solid #0f172a;
            background: #f8fafc;
          }
          .words-box {
            font-size: 11px;
            color: #1e293b;
            margin-bottom: 20px;
            padding: 8px 12px;
            background: #f8fafc;
            border: 1px solid #cbd5e1;
          }
          .words-label {
            font-weight: 600;
            text-transform: uppercase;
            font-size: 10px;
            color: #64748b;
          }
          .words-text {
            font-weight: 700;
            font-style: italic;
            margin-top: 1px;
          }
          .sign-grid {
            display: flex;
            justify-content: space-between;
            margin-top: 48px;
            padding-top: 6px;
          }
          .sign-col {
            text-align: center;
            width: 210px;
          }
          .sign-line {
            border-top: 1.5px solid #0f172a;
            margin-bottom: 5px;
          }
          .sign-title {
            font-size: 11px;
            font-weight: 700;
            color: #1e293b;
          }
          .sign-sub {
            font-size: 9.5px;
            color: #64748b;
          }
          .bill-footer {
            margin-top: 20px;
            border-top: 1px dashed #cbd5e1;
            padding-top: 8px;
            text-align: center;
            font-size: 9.5px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="bill-sheet">
          ${htmlBody}
        </div>
      </body>
    </html>
  `)
  doc.close()

  // Wait for fonts and content to mount then execute browser print dialog
  setTimeout(() => {
    iframe.contentWindow?.focus()
    iframe.contentWindow?.print()
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe)
      }
    }, 2000)
  }, 250)
}

export interface SalaryVoucherPrintData {
  voucherNo: string
  teacherName: string
  teacherPhone?: string | null
  month: number
  year: number
  baseSalary: number
  bonus: number
  deductions: number
  netAmount: number
  paymentMode: string
  transactionRef?: string | null
  paidAt?: string
  instituteName?: string
}

// Generates and prints an official institutional Salary Disbursement Voucher
export function printOfficialSalaryVoucher(data: SalaryVoucherPrintData) {
  const monthName = new Date(data.year, data.month - 1, 1).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  })

  const dateFormatted = data.paidAt
    ? new Date(data.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date(data.paidAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

  const amountInWords = numberToIndianRupeesWords(data.netAmount)

  const modeDisplay =
    data.paymentMode === "RAZORPAY"
      ? "Razorpay Online Payout (Test Mode)"
      : data.paymentMode === "NET_BANKING"
      ? "Bank Transfer (NEFT / IMPS)"
      : data.paymentMode

  const html = `
    <div class="bill-header">
      <div class="inst-name">${data.instituteName || "Classly Coaching Institute"}</div>
      <div class="inst-meta">Central Administrative Office · Educational Payouts & Faculty Ledger</div>
      <div class="inst-meta">Contact: +91 98102 45631 · Email: accounts@classly.edu · GSTIN / Reg: 07AAAEC1234F1Z8</div>
      <div class="doc-banner">Salary Disbursement Voucher</div>
    </div>

    <table class="meta-table">
      <tr>
        <td class="lbl">Voucher No:</td>
        <td class="val">${data.voucherNo}</td>
        <td class="lbl">Disbursed Date & Time:</td>
        <td class="val">${dateFormatted}</td>
      </tr>
      <tr>
        <td class="lbl">Faculty Name:</td>
        <td class="val">${data.teacherName}</td>
        <td class="lbl">Pay Period:</td>
        <td class="val">${monthName}</td>
      </tr>
      <tr>
        <td class="lbl">Contact No:</td>
        <td class="val">${data.teacherPhone || "N/A"}</td>
        <td class="lbl">Disbursement Mode:</td>
        <td class="val">${modeDisplay}</td>
      </tr>
      <tr>
        <td class="lbl">Transaction Ref / UTR:</td>
        <td class="val" colspan="3" style="font-family: monospace; font-size: 11px;">
          ${data.transactionRef || "N/A (Direct Ledger Credit)"}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 8%;">S.No</th>
          <th>Remuneration Component</th>
          <th style="width: 28%;">Accounting Classification</th>
          <th class="right" style="width: 25%;">Amount (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>Monthly Base Retainer</strong></td>
          <td>Faculty Base Remuneration</td>
          <td class="right">₹${data.baseSalary.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>2</td>
          <td>Performance Incentive / Bonus</td>
          <td>Additions</td>
          <td class="right">₹${data.bonus.toLocaleString("en-IN")}</td>
        </tr>
        <tr>
          <td>3</td>
          <td>Professional Tax & Deductions</td>
          <td>Statutory / Advance Deductions</td>
          <td class="right">- ₹${data.deductions.toLocaleString("en-IN")}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="right">NET AMOUNT DISBURSED:</td>
          <td class="right">₹${data.netAmount.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div class="words-box">
      <div class="words-label">Amount in Words:</div>
      <div class="words-text">${amountInWords}</div>
    </div>

    <div class="sign-grid">
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Faculty Signature</div>
        <div class="sign-sub">${data.teacherName} (Receiver)</div>
      </div>
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Authorized Signatory</div>
        <div class="sign-sub">For ${data.instituteName || "Classly Coaching Institute"} (Accounts Desk)</div>
      </div>
    </div>

    <div class="bill-footer">
      This is an official, computer-generated faculty salary voucher issued by ${data.instituteName || "Classly Coaching Institute"}.
      <br />Generated on ${new Date().toLocaleString("en-IN")} · All rights reserved.
    </div>
  `

  printIsolatedDocument(html, `Salary_Voucher_${data.voucherNo}`)
}

export interface FeeReceiptPrintData {
  receiptNo: string
  studentName: string
  batchName: string
  amount: number
  paymentMode: string
  remainingBalance: number
  paidAt?: string
  cashierName?: string
  instituteName?: string
  parentPhone?: string | null
  studentPhone?: string | null
  transactionRef?: string | null
}

// Generates and prints an official institutional Tuition Fee Payment Receipt
export function printOfficialFeeReceipt(data: FeeReceiptPrintData) {
  const dateFormatted = data.paidAt
    ? new Date(data.paidAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date(data.paidAt).toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
    : new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }) +
      ", " +
      new Date().toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })

  const amountInWords = numberToIndianRupeesWords(data.amount)

  const html = `
    <div class="bill-header">
      <div class="inst-name">${data.instituteName || "Classly Coaching Institute"}</div>
      <div class="inst-meta">Central Administrative Office · Student Admissions & Fee Collection Desk</div>
      <div class="inst-meta">Contact: +91 98102 45631 · Email: accounts@classly.edu · GSTIN: 07AAAEC1234F1Z8</div>
      <div class="doc-banner">Official Tuition Fee Receipt</div>
    </div>

    <table class="meta-table">
      <tr>
        <td class="lbl">Receipt No:</td>
        <td class="val">${data.receiptNo}</td>
        <td class="lbl">Payment Date & Time:</td>
        <td class="val">${dateFormatted}</td>
      </tr>
      <tr>
        <td class="lbl">Student Name:</td>
        <td class="val">${data.studentName}</td>
        <td class="lbl">Enrolled Batch:</td>
        <td class="val">${data.batchName}</td>
      </tr>
      <tr>
        <td class="lbl">Contact Phone:</td>
        <td class="val">${data.parentPhone || data.studentPhone || "N/A"}</td>
        <td class="lbl">Payment Mode:</td>
        <td class="val">${data.paymentMode}</td>
      </tr>
      <tr>
        <td class="lbl">Gateway / Bank Ref:</td>
        <td class="val" colspan="3" style="font-family: monospace; font-size: 11px;">
          ${data.transactionRef || "N/A (Direct Ledger Credit)"}
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 8%;">S.No</th>
          <th>Fee Particulars / Course Description</th>
          <th style="width: 25%;">Academic Term</th>
          <th class="right" style="width: 25%;">Amount Paid (INR)</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td><strong>Tuition & Coaching Fee Installment</strong></td>
          <td>Academic Session 2026-27</td>
          <td class="right">₹${data.amount.toLocaleString("en-IN")}</td>
        </tr>
        <tr class="total-row">
          <td colspan="3" class="right">TOTAL AMOUNT RECEIVED:</td>
          <td class="right">₹${data.amount.toLocaleString("en-IN")}</td>
        </tr>
      </tbody>
    </table>

    <div class="words-box">
      <div class="words-label">Amount in Words:</div>
      <div class="words-text">${amountInWords}</div>
    </div>

    <div style="font-size: 11px; margin-bottom: 20px; padding: 6px 10px; background: ${data.remainingBalance === 0 ? "#f0fdf4" : "#fffbeb"}; border: 1px solid ${data.remainingBalance === 0 ? "#bbf7d0" : "#fef08a"}; border-radius: 4px;">
      <strong>Payment Status:</strong> ${data.remainingBalance === 0 ? "CLEAR - Full tuition balance settled." : `PARTIAL - Outstanding balance remaining: ₹${data.remainingBalance.toLocaleString("en-IN")}`}
    </div>

    <div class="sign-grid">
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Student / Parent Copy</div>
        <div class="sign-sub">Acknowledgement of Payment</div>
      </div>
      <div class="sign-col">
        <div class="sign-line"></div>
        <div class="sign-title">Authorized Accounts Officer</div>
        <div class="sign-sub">For ${data.instituteName || "Classly Coaching Institute"} (Official Seal)</div>
      </div>
    </div>

    <div class="bill-footer">
      Official computerized payment receipt generated by Classly Learning Management System.
      <br />Fees once deposited are subject to institute admission policy. Keep this receipt safe for exam hall tickets.
    </div>
  `

  printIsolatedDocument(html, `Fee_Receipt_${data.receiptNo}`)
}
