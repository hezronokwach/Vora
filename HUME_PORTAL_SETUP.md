# Hume Portal Configuration Guide

## Overview
Configure voice shopping tools in the [Hume Portal](https://beta.hume.ai/evi/configs) for Vora's empathic shopping experience.

## Required Tools Setup

### 1. filter_products
**Purpose**: Filter products by category, color, and price

```json
{
  "type": "object",
  "required": [],
  "properties": {
    "category": {
      "type": "string",
      "enum": ["dresses", "tops", "bottoms", "accessories", "shoes"],
      "description": "Product category to filter by"
    },
    "color": {
      "type": "string",
      "enum": ["red", "blue", "green", "black", "white", "pink", "purple", "yellow"],
      "description": "Color to filter products by"
    },
    "max_price": {
      "type": "number",
      "description": "Maximum price for products"
    }
  }
}
```

### 2. add_to_cart
**Purpose**: Add products to shopping cart

```json
{
  "type": "object",
  "required": ["product_id"],
  "properties": {
    "product_id": {
      "type": "string",
      "description": "The ID of the product to add to cart"
    },
    "quantity": {
      "type": "number",
      "description": "Number of items to add to cart"
    }
  }
}
```

### 3. trigger_checkout
**Purpose**: Open checkout modal for payment

```json
{
  "type": "object",
  "required": [],
  "properties": {}
}
```

### 4. apply_discount
**Purpose**: Apply emotion-based discounts

```json
{
  "type": "object",
  "required": ["reason"],
  "properties": {
    "reason": {
      "type": "string",
      "enum": ["stress_relief", "frustration_help", "comfort_support"],
      "description": "Reason for applying the discount"
    }
  }
}
```

## Voice Personality Configuration

### System Prompt
```
You are Vora, an empathic shopping assistant. You understand emotions through voice and provide comfort-driven shopping experiences.

Key traits:
- Empathetic and understanding
- Never pushy or sales-focused
- Offer discounts when detecting stress/frustration
- Use natural, conversational language
- Focus on user comfort and satisfaction

When users sound stressed or frustrated, proactively offer empathy discounts and supportive messaging.
```

### Response Guidelines
- **Calm State**: Friendly, helpful product recommendations
- **Engaged State**: Enthusiastic about user's choices
- **Stressed State**: Offer comfort, discounts, and reassurance

## Testing Voice Commands

### Product Filtering
- "Show me dresses under $100"
- "I want blue tops"
- "Find comfortable shoes"
- "What accessories do you have?"

### Cart Management
- "Add this to my cart"
- "I'll take two of these"
- "Put that dress in my cart"

### Checkout Process
- "I'm ready to buy"
- "Let's checkout"
- "I want to purchase these items"

### Emotion Triggers (for testing discounts)
- "This is so expensive!" (frustrated tone)
- "I can't afford this..." (sad tone)
- "Everything costs too much!" (stressed tone)

## Configuration Steps

1. **Create New Config** in Hume Portal
2. **Add Tools** using the JSON configurations above
3. **Set System Prompt** with Vora's personality
4. **Configure Voice Settings**:
   - Voice: Choose empathetic, warm voice
   - Speed: Moderate (not too fast)
   - Emotion Detection: Enable all emotions
5. **Test Configuration** with sample commands
6. **Copy Config ID** to your `.env` file

## Environment Variables
```bash
NEXT_PUBLIC_HUME_CONFIG_ID=your_config_id_here
NEXT_PUBLIC_HUME_API_KEY=your_api_key_here
NEXT_PUBLIC_HUME_SECRET_KEY=your_secret_key_here
```

## Troubleshooting

### Common Issues
- **Tools not triggering**: Check parameter types match exactly
- **No emotion detection**: Ensure prosody analysis is enabled
- **Voice not responding**: Verify API keys and config ID
- **Discounts not applying**: Check emotion thresholds in algorithm

### Debug Tips
- Use browser console to see tool calls
- Check network tab for Hume API responses
- Test with exaggerated emotional tones
- Verify all required parameters are provided