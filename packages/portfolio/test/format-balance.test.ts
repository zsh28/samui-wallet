import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { formatBalance, formatBalanceUsd, formatUsdValue } from '../src/data-access/format-balance.js'

describe('formatBalance', () => {
  describe('expected behavior', () => {
    it('should format zero balance', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 0, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('0')
    })

    it('should format bigint balance correctly', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('1')
    })

    it('should format number balance correctly', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1500000000, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('1.5')
    })

    it('should format small decimals correctly', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 123456n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('0.000123')
    })

    it('should format very small amounts with less than threshold', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('<0.00001')
    })

    it('should format millions with M suffix', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 2500000000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('2.5M')
    })

    it('should format billions with B suffix', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1500000000000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('1.5B')
    })

    it('should format trillions with T suffix', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1200000000000000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('1.2T')
    })

    it('should handle undefined balance', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: undefined, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('0')
    })

    it('should limit fraction digits to decimals parameter', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1123456789n, decimals: 2 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('11.23')
    })

    it('should limit fraction digits to maximum of 6', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1123456789123n, decimals: 18 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('0.001123')
    })
  })

  describe('unexpected behavior', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle negative balances', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: -1000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('-1')
    })

    it('should handle very large negative balances', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: -1500000000000000000n, decimals: 9 }

      // ACT
      const result = formatBalance(input)

      // ASSERT
      expect(result).toBe('-1.5B')
    })
  })
})

describe('formatBalanceUsd', () => {
  describe('expected behavior', () => {
    it('should format zero USD balance', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 0, decimals: 9, usdPrice: 100 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0')
    })

    it('should format USD balance with proper decimals', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000000n, decimals: 9, usdPrice: 123.45 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$123.45')
    })

    it('should format large USD amounts with commas', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 10000000000n, decimals: 9, usdPrice: 123.45 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$1,234.50')
    })

    it('should format fractional USD amounts under $1', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000n, decimals: 9, usdPrice: 0.5 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0.0005')
    })

    it('should format very small USD amounts with less than threshold', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1n, decimals: 9, usdPrice: 0.5 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('<$0.001')
    })

    it('should handle zero USD price', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000000n, decimals: 9, usdPrice: 0 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0')
    })

    it('should handle undefined balance', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: undefined, decimals: 9, usdPrice: 100 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0')
    })

    it('should handle undefined USD price', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000000n, decimals: 9, usdPrice: undefined }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0')
    })

    it('should use significant digits for small amounts', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 12345n, decimals: 9, usdPrice: 1 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('$0.0000123')
    })
  })

  describe('unexpected behavior', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle negative USD balances', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: -1000000000n, decimals: 9, usdPrice: 100 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('-$100.00')
    })

    it('should handle negative USD price', () => {
      // ARRANGE
      expect.assertions(1)
      const input = { balance: 1000000000n, decimals: 9, usdPrice: -100 }

      // ACT
      const result = formatBalanceUsd(input)

      // ASSERT
      expect(result).toBe('-$100.00')
    })
  })
})

describe('formatUsdValue', () => {
  describe('expected behavior', () => {
    it('should format zero USD value', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 0

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$0')
    })

    it('should format normal USD values', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 123.45

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$123.45')
    })

    it('should format large USD values with commas', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 1234567.89

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$1,234,567.89')
    })

    it('should format small USD values under $1', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 0.123

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$0.123')
    })

    it('should format very small USD values with less than threshold', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 0.0001

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('<$0.001')
    })

    it('should round very small values correctly', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 0.00999

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$0.00999')
    })

    it('should format fractional values between 0.001 and 1', () => {
      // ARRANGE
      expect.assertions(1)
      const input = 0.0567

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('$0.0567')
    })
  })

  describe('unexpected behavior', () => {
    beforeEach(() => {
      vi.spyOn(console, 'log').mockImplementation(() => {})
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle negative USD values', () => {
      // ARRANGE
      expect.assertions(1)
      const input = -123.45

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('-$123.45')
    })

    it('should handle very small negative values', () => {
      // ARRANGE
      expect.assertions(1)
      const input = -0.0001

      // ACT
      const result = formatUsdValue(input)

      // ASSERT
      expect(result).toBe('<$0.001')
    })

    it('should handle Infinity values', () => {
      // ARRANGE
      expect.assertions(1)
      const input = Infinity

      // ACT & ASSERT
      expect(() => formatUsdValue(input)).not.toThrow()
    })

    it('should handle NaN values', () => {
      // ARRANGE
      expect.assertions(1)
      const input = NaN

      // ACT & ASSERT
      expect(() => formatUsdValue(input)).not.toThrow()
    })
  })
})
