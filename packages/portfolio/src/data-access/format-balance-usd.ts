const usdFormatters = new Map<string, Intl.NumberFormat>()

export function formatBalanceUsd({
  balance = 0,
  decimals = 2,
  usdPrice,
}: {
  balance: bigint | number | undefined
  decimals: number
  usdPrice: number | undefined
}) {
  if (!usdPrice) {
    return '$0.00'
  }

  const balanceNum = typeof balance === 'bigint' ? balance : BigInt(balance || 0)

  if (balanceNum === 0n) {
    return '$0.00'
  }

  const tokenValue = Number(balanceNum) / Math.pow(10, decimals)
  const usdValue = tokenValue * usdPrice

  return formatUsdValue(usdValue)
}

export function formatUsdValue(usdValue: number): string {
  if (!Number.isFinite(usdValue) || usdValue === 0) {
    return '$0.00'
  }

  // Handle negative values by working with absolute amount then applying sign
  const isNegative = usdValue < 0
  const absValue = Math.abs(usdValue)

  // Show threshold for sub-cent amounts instead of $0.00
  if (absValue < 0.01 && absValue > 0) {
    return '<$0.01'
  }

  // Format to 2 decimal places like traditional currency eg $123.45, $0.99
  const formatted = getUsdFormatter({
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(absValue)

  // Add negative sign back if needed
  return isNegative ? `-${formatted}` : formatted
}

function getUsdFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options)
  let formatter = usdFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat('en-US', {
      currency: 'USD',
      style: 'currency',
      ...options,
    })
    usdFormatters.set(key, formatter)
  }
  return formatter
}
