import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-12-15.clover',
});

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    return NextResponse.json({ url: session.url });
  } catch (error: any) {
    console.error('Error retrieving session URL:', error);
    return NextResponse.json(
      { error: 'Failed to get checkout URL' },
      { status: 500 }
    );
  }
}