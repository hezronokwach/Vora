import { renderHook, act } from '@testing-library/react'
import { useMarketStore } from '@/store/useMarketStore'

// Mock Firebase
jest.mock('@/lib/firebaseService', () => ({
  storeOrder: jest.fn(),
  storeEmotionSnapshot: jest.fn(),
}))

describe('useMarketStore', () => {
  beforeEach(() => {
    useMarketStore.getState().resetStore()
  })

  it('should add product to cart', () => {
    const { result } = renderHook(() => useMarketStore())
    
    const mockProduct = {
      _id: '1',
      name: 'Test Dress',
      price: 50,
      image: 'test.jpg',
      category: 'dresses',
      color: 'blue',
      emotionBoost: 0.1
    }

    act(() => {
      result.current.addToCart(mockProduct, 2)
    })

    expect(result.current.cart).toHaveLength(1)
    expect(result.current.cart[0].quantity).toBe(2)
    expect(result.current.cartTotal).toBe(100)
  })

  it('should apply emotion discount', () => {
    const { result } = renderHook(() => useMarketStore())
    
    act(() => {
      result.current.setEmotionData({
        dominantEmotion: 'Stress',
        confidence: 0.8,
        prosody: { stress: 0.7 }
      })
    })

    expect(result.current.emotionDiscount).toBeGreaterThan(0)
    expect(result.current.emotionDiscount).toBeLessThanOrEqual(25)
  })

  it('should filter products by category', () => {
    const { result } = renderHook(() => useMarketStore())
    
    const mockProducts = [
      { _id: '1', category: 'dresses', name: 'Dress 1' },
      { _id: '2', category: 'tops', name: 'Top 1' },
    ]

    act(() => {
      result.current.setProducts(mockProducts)
      result.current.setFilters({ category: 'dresses' })
    })

    const filtered = result.current.filteredProducts
    expect(filtered).toHaveLength(1)
    expect(filtered[0].category).toBe('dresses')
  })

  it('should calculate cart total with discount', () => {
    const { result } = renderHook(() => useMarketStore())
    
    const mockProduct = { _id: '1', price: 100, emotionBoost: 0.1 }

    act(() => {
      result.current.addToCart(mockProduct, 1)
      result.current.setEmotionData({
        dominantEmotion: 'Stress',
        confidence: 0.8,
        prosody: { stress: 0.8 }
      })
    })

    const discount = result.current.emotionDiscount
    const expectedTotal = 100 - (100 * discount / 100)
    
    expect(result.current.finalTotal).toBeCloseTo(expectedTotal, 2)
  })
})