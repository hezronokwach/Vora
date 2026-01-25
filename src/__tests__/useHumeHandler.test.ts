import { useHumeHandler } from '@/hooks/useHumeHandler'
import { useMarketStore } from '@/store/useMarketStore'

// Mock the store
jest.mock('@/store/useMarketStore')

describe('useHumeHandler', () => {
  const mockStore = {
    products: [
      { _id: '1', name: 'Blue Dress', category: 'dresses', color: 'blue', price: 80 },
      { _id: '2', name: 'Red Top', category: 'tops', color: 'red', price: 40 },
    ],
    setFilters: jest.fn(),
    addToCart: jest.fn(),
    setCheckoutOpen: jest.fn(),
    emotionDiscount: 15,
    applyEmotionDiscount: jest.fn(),
  }

  beforeEach(() => {
    (useMarketStore as jest.Mock).mockReturnValue(mockStore)
    jest.clearAllMocks()
  })

  it('should filter products by category', () => {
    const handler = useHumeHandler()
    
    const result = handler({
      type: 'tool_call',
      name: 'filter_products',
      parameters: { category: 'dresses' }
    })

    expect(mockStore.setFilters).toHaveBeenCalledWith({ category: 'dresses' })
    expect(result).toContain('Found 1 dress')
  })

  it('should filter products by price', () => {
    const handler = useHumeHandler()
    
    const result = handler({
      type: 'tool_call',
      name: 'filter_products',
      parameters: { max_price: 50 }
    })

    expect(mockStore.setFilters).toHaveBeenCalledWith({ maxPrice: 50 })
    expect(result).toContain('Found 1 item under $50')
  })

  it('should add product to cart', () => {
    const handler = useHumeHandler()
    
    const result = handler({
      type: 'tool_call',
      name: 'add_to_cart',
      parameters: { product_id: '1', quantity: 2 }
    })

    expect(mockStore.addToCart).toHaveBeenCalledWith(mockStore.products[0], 2)
    expect(result).toContain('Added 2 Blue Dress to your cart')
  })

  it('should trigger checkout', () => {
    const handler = useHumeHandler()
    
    const result = handler({
      type: 'tool_call',
      name: 'trigger_checkout'
    })

    expect(mockStore.setCheckoutOpen).toHaveBeenCalledWith(true)
    expect(result).toContain('Opening checkout')
  })

  it('should apply emotion discount', () => {
    const handler = useHumeHandler()
    
    const result = handler({
      type: 'tool_call',
      name: 'apply_discount',
      parameters: { reason: 'stress_relief' }
    })

    expect(mockStore.applyEmotionDiscount).toHaveBeenCalled()
    expect(result).toContain('15% empathy discount')
  })
})