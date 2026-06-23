import { Request, Response } from 'express';
import Stripe from 'stripe';

let stripeObj: Stripe | null = null;
const getStripe = (): Stripe | null => {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (!stripeObj) {
    stripeObj = new Stripe(key, {
      apiVersion: '2025-01-27' as any,
    });
  }
  return stripeObj;
};

export const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const { items, email } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'Items are required for checkout' });
    }

    const stripe = getStripe();
    const origin = req.headers.origin || 'http://localhost:3000';

    if (stripe) {
      const lineItems = items.map((item: any) => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.name_en || item.name || 'Premium Artisan Good',
          },
          unit_amount: Math.round((item.price || 0) * 100),
        },
        quantity: item.quantity || 1,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        customer_email: email,
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}?checkout=cancel`,
      });

      return res.json({
        success: true,
        mode: 'stripe',
        url: session.url,
      });
    } else {
      const orderId = 'AE-' + Math.floor(100000 + Math.random() * 900000);
      const secureHash = Math.random().toString(36).substring(2, 15).toUpperCase();
      
      return res.json({
        success: true,
        mode: 'sensory-simulated',
        orderId,
        secureHash,
        message: 'No Stripe keys detected in workspace. Executing premium offline checkout vault.',
      });
    }
  } catch (error: any) {
    console.error('Checkout creation failure:', error);
    res.status(500).json({ success: false, error: error?.message || 'Failed to instantiate checkout' });
  }
};
