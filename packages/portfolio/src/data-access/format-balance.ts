const formatters = new Map<string, Intl.NumberFormat>()

export function formatBalance({
  balance = 0,
  decimals,
}: {
  balance: bigint | number | undefined
  decimals: number
}): string {
  const balanceNum = typeof balance === 'bigint' ? balance : BigInt(balance || 0)

  if (balanceNum === 0n) return '0'

  if (balanceNum < 0n) {
    return `-${formatBalance({ balance: -balanceNum, decimals })}`
  }

  const effectiveDecimals = Math.min(decimals, 15)
  const balanceFloat = Number(balanceNum) / 10 ** effectiveDecimals

  if (decimals <= 6) {
    if (balanceFloat >= 1_000_000) {
      const scaledValue = balanceFloat / 1_000_000
      return formatTokenValue(scaledValue, decimals)
    }
    return formatTokenValue(balanceFloat, decimals)
  }

  if (balanceFloat >= 1_000_000_000_000) {
    return `${formatTokenValue(balanceFloat / 1_000_000_000_000, 2)}T`
  }

  if (balanceFloat >= 1_000_000_000) {
    return `${formatTokenValue(balanceFloat / 1_000_000_000, 2)}B`
  }

  if (balanceFloat >= 1_000_000) {
    return `${formatTokenValue(balanceFloat / 1_000_000, 2)}M`
  }

  if (balanceFloat < 0.00001) {
    return '<0.00001'
  }

  const maxFractionDigits = Math.min(6, decimals)
  return formatTokenValue(balanceFloat, maxFractionDigits)
}

function formatTokenValue(value: number, maxFractionDigits: number): string {
  const formatter = getFormatter({
    maximumFractionDigits: maxFractionDigits,
    minimumFractionDigits: 0,
  })
  return formatter.format(value)
}

function getFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options)
  if (!formatters.has(key)) {
    formatters.set(key, new Intl.NumberFormat('en-US', options))
  }
  return formatters.get(key)!
}

const usdFormatters = new Map<string, Intl.NumberFormat>()

export function formatBalanceUsd({
  balance = 0,
  decimals,
  usdPrice,
}: {
  balance: bigint | number | undefined
  decimals: number
  usdPrice: number | undefined
}): string {
  if (usdPrice === undefined) return '$0'

  const balanceNum = typeof balance === 'bigint' ? balance : BigInt(balance || 0)
  const usdValue = (usdPrice * Number(balanceNum)) / 10 ** decimals

  if (usdValue === 0) return '$0'

  // Handle negative values
  if (usdValue < 0) {
    const absValue = Math.abs(usdValue)
    return `-${formatUsdValue(absValue)}`
  }

  if (usdValue < 0.00001) {
    return '<$0.001'
  }

  if (usdValue >= 1) {
    return getUsdFormatter({
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(usdValue)
  }

  return getUsdFormatter({
    maximumFractionDigits: 7,
    minimumFractionDigits: 0,
  }).format(usdValue)
}

export function formatUsdValue(usdValue: number): string {
  // Handle special cases
  if (Number.isNaN(usdValue) || !Number.isFinite(usdValue)) {
    return '$0'
  }

  // Handle zero case
  if (usdValue === 0) return '$0'

  // Handle negative values
  if (usdValue < 0) {
    const absValue = Math.abs(usdValue)
    // Handle very small negative values
    if (absValue < 0.001) {
      return '<$0.001'
    }
    return `-${formatUsdValue(absValue)}`
  }

  // Handle very small values
  if (usdValue < 0.001) {
    return '<$0.001'
  }

  // Handle normal values (>= $0.001)
  if (usdValue >= 1) {
    return getUsdFormatter({
      maximumFractionDigits: 2,
      minimumFractionDigits: 2,
    }).format(usdValue)
  }

  // Handle fractional values between $0.001 and $1
  return getUsdFormatter({
    maximumSignificantDigits: 5,
    minimumFractionDigits: 0,
  }).format(usdValue)
}

function getUsdFormatter(options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = JSON.stringify(options)
  if (!usdFormatters.has(key)) {
    usdFormatters.set(
      key,
      new Intl.NumberFormat('en-US', {
        currency: 'USD',
        style: 'currency',
        ...options,
      }),
    )
  }
  return usdFormatters.get(key)!
}
