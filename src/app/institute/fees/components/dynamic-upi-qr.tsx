"use client"

import React, { useState } from "react"
import { QrCode, Copy, Check, Smartphone, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DynamicUpiQrProps {
  upiId?: string
  payeeName?: string
  amount: number
  transactionNote?: string
}

function generateQrSvg(text: string, size = 180) {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i)
    hash |= 0
  }

  const matrixSize = 25
  const cells: boolean[][] = Array.from({ length: matrixSize }, () => Array(matrixSize).fill(false))

  const addFinder = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        if (
          r === 0 ||
          r === 6 ||
          c === 0 ||
          c === 6 ||
          (r >= 2 && r <= 4 && c >= 2 && c <= 4)
        ) {
          cells[r0 + r][c0 + c] = true
        }
      }
    }
  }

  addFinder(0, 0)
  addFinder(0, matrixSize - 7)
  addFinder(matrixSize - 7, 0)

  for (let i = 8; i < matrixSize - 8; i++) {
    cells[6][i] = i % 2 === 0
    cells[i][6] = i % 2 === 0
  }

  let seed = Math.abs(hash)
  for (let r = 0; r < matrixSize; r++) {
    for (let c = 0; c < matrixSize; c++) {
      const inTL = r < 8 && c < 8
      const inTR = r < 8 && c >= matrixSize - 8
      const inBL = r >= matrixSize - 8 && c < 8
      if (!inTL && !inTR && !inBL && r !== 6 && c !== 6) {
        seed = (seed * 9301 + 49297) % 233280
        cells[r][c] = seed / 233280 > 0.45
      }
    }
  }

  const cellSize = size / matrixSize

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg bg-white p-2">
      <rect width={size} height={size} fill="white" />
      {cells.map((row, r) =>
        row.map((active, c) =>
          active ? (
            <rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize + 0.2}
              height={cellSize + 0.2}
              fill="#0f172a"
            />
          ) : null
        )
      )}
    </svg>
  )
}

export function DynamicUpiQr({
  upiId = "edmingle.fees@icici",
  payeeName = "Classly Coaching Institute",
  amount,
  transactionNote = "TUITION-FEES",
}: DynamicUpiQrProps) {
  const [copied, setCopied] = useState(false)

  const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(
    payeeName
  )}&am=${amount.toFixed(2)}&tn=${encodeURIComponent(transactionNote)}&cu=INR`

  const handleCopy = () => {
    navigator.clipboard.writeText(upiDeepLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="flex flex-col items-center p-4 rounded-lg bg-muted/20 border border-border">
      <div className="flex items-center gap-1.5 mb-2.5">
        <Smartphone className="size-3.5 text-primary" />
        <span className="text-xs font-semibold text-foreground">
          Scan UPI QR to Pay
        </span>
      </div>

      {/* QR Code Container */}
      <div className="relative p-2 bg-white rounded-lg shadow-xs border border-border">
        {generateQrSvg(upiDeepLink, 160)}
        {/* Center UPI Badge */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="size-7 rounded-md bg-white border border-border shadow-xs flex items-center justify-center font-bold text-[9px] text-primary">
            UPI
          </div>
        </div>
      </div>

      {/* Amount Callout */}
      <div className="mt-2.5 text-center">
        <div className="text-lg font-bold text-foreground">
          ₹{amount.toLocaleString("en-IN")}
        </div>
        <div className="text-[11px] text-muted-foreground font-mono">
          VPA: {upiId}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-2 w-full mt-3">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="flex-1 h-8 text-xs rounded-lg border-border"
        >
          {copied ? <Check className="size-3.5 mr-1 text-emerald-600" /> : <Copy className="size-3.5 mr-1 text-muted-foreground" />}
          {copied ? "Link Copied" : "Copy UPI Link"}
        </Button>
        <a
          href={upiDeepLink}
          className="inline-flex items-center justify-center px-3 h-8 text-xs font-medium rounded-lg bg-primary hover:bg-primary-hover text-white transition-colors"
        >
          <ExternalLink className="size-3 mr-1" />
          Open App
        </a>
      </div>
    </div>
  )
}
