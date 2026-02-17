/**
 * Stripe Payment Integration
 * Handles checkout sessions, subscriptions, and webhook processing
 */

import Stripe from 'stripe';
import { logger } from '@/lib/logger';

// Lazy initialization
let stripeClient: Stripe | null = null;

function getStripe(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    if (!secretKey) {
      throw new Error('STRIPE_SECRET_KEY is not configured');
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2026-01-28.clover',
      typescript: true,
    });
  }
  return stripeClient;
}

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

// ─── Checkout Sessions ──────────────────────────────────────────────────────

export interface CreateCheckoutOptions {
  userId: string;
  email: string;
  priceId: string;
  successUrl?: string;
  cancelUrl?: string;
  metadata?: Record<string, string>;
}

export async function createCheckoutSession(options: CreateCheckoutOptions): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: options.email,
    line_items: [{ price: options.priceId, quantity: 1 }],
    success_url: options.successUrl || `${APP_URL}/subscriptions?success=true&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: options.cancelUrl || `${APP_URL}/subscriptions?canceled=true`,
    metadata: {
      userId: options.userId,
      ...options.metadata,
    },
    subscription_data: {
      metadata: {
        userId: options.userId,
      },
    },
  });

  if (!session.url) {
    throw new Error('Failed to create checkout session URL');
  }

  logger.info('Stripe checkout session created', { sessionId: session.id, userId: options.userId });
  return session.url;
}

// ─── One-Time Payments (Wallet Deposits) ────────────────────────────────────

export interface CreatePaymentOptions {
  userId: string;
  email: string;
  amount: number; // in cents
  currency?: string;
  description: string;
  metadata?: Record<string, string>;
}

export async function createPaymentIntent(options: CreatePaymentOptions): Promise<{ clientSecret: string; id: string }> {
  const stripe = getStripe();

  const paymentIntent = await stripe.paymentIntents.create({
    amount: options.amount,
    currency: options.currency || 'usd',
    description: options.description,
    receipt_email: options.email,
    metadata: {
      userId: options.userId,
      ...options.metadata,
    },
  });

  logger.info('Stripe payment intent created', { id: paymentIntent.id, userId: options.userId });

  return {
    clientSecret: paymentIntent.client_secret!,
    id: paymentIntent.id,
  };
}

// ─── Subscription Management ────────────────────────────────────────────────

export async function cancelSubscription(subscriptionId: string, atPeriodEnd = true): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: atPeriodEnd,
  });

  logger.info('Stripe subscription canceled', { subscriptionId, atPeriodEnd });
  return subscription;
}

export async function resumeSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.update(subscriptionId, {
    cancel_at_period_end: false,
  });

  logger.info('Stripe subscription resumed', { subscriptionId });
  return subscription;
}

export async function changeSubscriptionPlan(
  subscriptionId: string,
  newPriceId: string
): Promise<Stripe.Subscription> {
  const stripe = getStripe();

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
    items: [
      {
        id: subscription.items.data[0].id,
        price: newPriceId,
      },
    ],
    proration_behavior: 'create_prorations',
  });

  logger.info('Stripe subscription plan changed', { subscriptionId, newPriceId });
  return updatedSubscription;
}

export async function getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
  const stripe = getStripe();
  return stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });
}

// ─── Customer Management ────────────────────────────────────────────────────

export async function createCustomer(email: string, name: string, metadata?: Record<string, string>): Promise<string> {
  const stripe = getStripe();

  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  });

  return customer.id;
}

export async function getCustomerPortalUrl(customerId: string): Promise<string> {
  const stripe = getStripe();

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/subscriptions`,
  });

  return session.url;
}

// ─── Webhook Verification ───────────────────────────────────────────────────

export function constructWebhookEvent(payload: string | Buffer, signature: string): Stripe.Event {
  const stripe = getStripe();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not configured');
  }

  return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
}

export interface WebhookHandlers {
  onCheckoutCompleted?: (session: Stripe.Checkout.Session) => Promise<void>;
  onSubscriptionCreated?: (subscription: Stripe.Subscription) => Promise<void>;
  onSubscriptionUpdated?: (subscription: Stripe.Subscription) => Promise<void>;
  onSubscriptionDeleted?: (subscription: Stripe.Subscription) => Promise<void>;
  onPaymentSucceeded?: (invoice: Stripe.Invoice) => Promise<void>;
  onPaymentFailed?: (invoice: Stripe.Invoice) => Promise<void>;
}

export async function handleWebhookEvent(event: Stripe.Event, handlers: WebhookHandlers): Promise<void> {
  switch (event.type) {
    case 'checkout.session.completed':
      await handlers.onCheckoutCompleted?.(event.data.object as Stripe.Checkout.Session);
      break;
    case 'customer.subscription.created':
      await handlers.onSubscriptionCreated?.(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.updated':
      await handlers.onSubscriptionUpdated?.(event.data.object as Stripe.Subscription);
      break;
    case 'customer.subscription.deleted':
      await handlers.onSubscriptionDeleted?.(event.data.object as Stripe.Subscription);
      break;
    case 'invoice.payment_succeeded':
      await handlers.onPaymentSucceeded?.(event.data.object as Stripe.Invoice);
      break;
    case 'invoice.payment_failed':
      await handlers.onPaymentFailed?.(event.data.object as Stripe.Invoice);
      break;
    default:
      logger.info('Unhandled Stripe webhook event', { type: event.type });
  }
}
