# Stripe Setup Guide

## 1. Create Stripe Account
1. Go to [stripe.com](https://stripe.com/)
2. Sign up for a free account
3. Complete account verification

## 2. Get API Keys
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. Click **Developers** → **API keys**
3. Copy **Publishable key** and **Secret key**
4. Use **Test** keys for development

## 3. Update Environment Variables
Add to your `.env` file:
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
```

## 4. Test the Integration
The checkout API is already set up in `src/app/api/checkout/route.ts`.

### Test Cards
Use these test card numbers:
- **Success**: `4242 4242 4242 4242`
- **Declined**: `4000 0000 0000 0002`
- **Requires Authentication**: `4000 0025 0000 3155`

Use any future expiry date, any 3-digit CVC, and any ZIP code.

## 5. Configure Webhooks (Optional)
For production, set up webhooks:
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `checkout.session.completed`
4. Copy webhook secret to `.env`:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

## 6. Test Checkout Flow
1. Start your app: `npm run dev`
2. Add products to cart
3. Click checkout
4. Use test card: `4242 4242 4242 4242`
5. Complete payment

## 7. Success Page
After payment, users are redirected to `/success` page.

## 8. Production Setup
For production:
1. Switch to **Live** keys in Stripe Dashboard
2. Update environment variables with live keys
3. Complete Stripe account verification
4. Set up proper webhook endpoints

Your Stripe integration is now ready!


When you click "Pay $X with Stripe":

Should redirect to Stripe checkout page

Use test card: 4242 4242 4242 4242

Expiry: Any future date (e.g., 12/25)

CVC: Any 3 digits (e.g., 123)

ZIP: Any ZIP code (e.g., 12345)

3. Other Test Cards
Declined: 4000 0000 0000 0002

Requires 3D Secure: 4000 0025 0000 3155

Insufficient funds: 4000 0000 0000 9995