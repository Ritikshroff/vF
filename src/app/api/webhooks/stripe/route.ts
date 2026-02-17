/**
 * Stripe Webhook Handler
 * POST /api/webhooks/stripe
 */

import { NextRequest, NextResponse } from 'next/server';
import { constructWebhookEvent, handleWebhookEvent } from '@/lib/stripe';
import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 });
  }

  let event;
  try {
    event = constructWebhookEvent(body, signature);
  } catch (error) {
    logger.error('Stripe webhook signature verification failed', { error });
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    await handleWebhookEvent(event, {
      async onCheckoutCompleted(session) {
        const userId = session.metadata?.userId;
        const planId = session.metadata?.planId;
        if (!userId || !planId) return;

        const subscriptionId = session.subscription as string;
        if (!subscriptionId) return;

        // Check if user already has a subscription
        const existing = await prisma.subscription.findFirst({
          where: { userId },
        });

        if (existing) {
          // Update existing subscription
          await prisma.subscription.update({
            where: { id: existing.id },
            data: {
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
              planId,
              status: 'ACTIVE',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        } else {
          // Create new subscription
          await prisma.subscription.create({
            data: {
              userId,
              planId,
              stripeSubscriptionId: subscriptionId,
              stripeCustomerId: session.customer as string,
              status: 'ACTIVE',
              billingInterval: 'MONTHLY',
              currentPeriodStart: new Date(),
              currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            },
          });
        }

        logger.info('Checkout completed', { userId, subscriptionId });
      },

      async onSubscriptionUpdated(subscription) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const sub = subscription as any;
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: subscription.status === 'active' ? 'ACTIVE' : 'PAST_DUE',
            cancelAt: subscription.cancel_at ? new Date(subscription.cancel_at * 1000) : null,
            ...(sub.current_period_start && {
              currentPeriodStart: new Date(sub.current_period_start * 1000),
            }),
            ...(sub.current_period_end && {
              currentPeriodEnd: new Date(sub.current_period_end * 1000),
            }),
          },
        });
      },

      async onSubscriptionDeleted(subscription) {
        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            status: 'CANCELLED',
            cancelledAt: new Date(),
          },
        });
      },

      async onPaymentFailed(invoice) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const inv = invoice as any;
        const subscriptionId = (inv.subscription || inv.parent?.subscription_details?.subscription) as string;
        if (!subscriptionId) return;

        await prisma.subscription.updateMany({
          where: { stripeSubscriptionId: subscriptionId },
          data: { status: 'PAST_DUE' },
        });

        logger.warn('Payment failed for subscription', { subscriptionId });
      },
    });

    return NextResponse.json({ received: true });
  } catch (error) {
    logger.error('Stripe webhook handler error', { error, eventType: event.type });
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
