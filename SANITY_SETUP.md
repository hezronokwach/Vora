# Sanity CMS Setup Guide

## 1. Create Sanity Account
1. Go to [sanity.io](https://www.sanity.io/)
2. Sign up with GitHub/Google or email
3. Create a new project

## 2. Initialize Sanity in Project
```bash
cd sanity
npm install
npx sanity init
```

When prompted:
- **Project name**: `vora-marketplace`
- **Dataset**: `production`
- **Project template**: `Clean project with no predefined schemas`

## 3. Configure Schema
The product schema is already in `sanity/schemas/product.ts`. Deploy it:

```bash
npx sanity deploy
```

## 4. Add Sample Data
```bash
# Import sample products
npx sanity dataset import SEED_DATA.ndjson production
```

## 5. Get API Credentials
1. Go to [sanity.io/manage](https://sanity.io/manage)
2. Select your project
3. Go to **API** tab
4. Copy **Project ID**
5. Go to **Tokens** tab
6. Create new token with **Editor** permissions
7. Copy the token

## 6. Update Environment Variables
Add to your `.env` file:
```bash
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id_here
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token_here
```

## 7. Start Sanity Studio
```bash
cd sanity
npm run dev
```

Visit `http://localhost:3333` to manage products.

## 8. Add Products
In Sanity Studio:
1. Click **Create** → **Product**
2. Fill in:
   - **Title**: Product name
   - **Price**: Numeric value
   - **Category**: dresses, tops, bottoms, accessories, shoes
   - **Tags**: Color names (red, blue, etc.)
   - **Stock**: Available quantity
   - **Emotion Boost**: 0.1-0.3 (affects discount calculation)
   - **Image**: Upload product photo

## Sample Product Data
```json
{
  "title": "Comfort Dress",
  "price": 89,
  "category": "dresses",
  "tags": ["blue", "comfortable", "casual"],
  "stock": 15,
  "emotionBoost": 0.2,
  "description": "A comfortable dress perfect for any occasion"
}
```

Your Sanity CMS is now ready!