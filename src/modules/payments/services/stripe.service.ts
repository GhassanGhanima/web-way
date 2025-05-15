import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { User } from '@app/modules/users/entities/user.entity';
import { Plan } from '@app/modules/plans/entities/plan.entity';

type ExpandedInvoice = Stripe.Invoice & {
  payment_intent?: Stripe.PaymentIntent;
};

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor(private configService: ConfigService) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createCustomer(user: User): Promise<string> {
    const customer = await this.stripe.customers.create({
      email: user.email,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || undefined,
      metadata: {
        userId: user.id,
      },
    });

    return customer.id;
  }

  async createSubscription(
    customerId: string,
    plan: Plan,
    trialDays = 0,
  ): Promise<{ subscriptionId: string; clientSecret: string }> {
    let stripePrice: Stripe.Price;

    if (plan.externalPlanId) {
      stripePrice = await this.stripe.prices.retrieve(plan.externalPlanId);
    } else {
      // Create a new price if an external ID doesn't exist
      const product = await this.stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: {
          planId: plan.id,
        },
      });

      // Handle quarterly interval (3 months)
      const recurringConfig: Stripe.PriceCreateParams.Recurring = {
        interval: this.mapPlanIntervalToStripe(plan.interval),
      };

      // If quarterly, set interval_count to 3
      if (plan.interval === 'quarterly') {
        recurringConfig.interval_count = 3;
      }

      stripePrice = await this.stripe.prices.create({
        product: product.id,
        unit_amount: plan.price,
        currency: plan.currency.toLowerCase(),
        recurring: recurringConfig,
        metadata: {
          planId: plan.id,
        },
      });
    }

    // Create the subscription
    const subscription = await this.stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: stripePrice.id }],
      trial_period_days: trialDays > 0 ? trialDays : undefined,
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Get the client secret for confirming the payment
    const invoice = subscription.latest_invoice as ExpandedInvoice;
    
    if (!invoice || typeof invoice !== 'object') {
      throw new Error('Invoice not found or not expanded correctly');
    }
    
    if (!invoice.payment_intent) {
      throw new Error('Payment intent not found on the invoice.');
    }

    return {
      subscriptionId: subscription.id,
      clientSecret: invoice.payment_intent.client_secret || '',
    };
  }

  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.stripe.subscriptions.cancel(subscriptionId);
  }

  async handleWebhookEvent(payload: Buffer, signature: string): Promise<Stripe.Event> {
    const webhookSecret = this.configService.get<string>('STRIPE_WEBHOOK_SECRET');
    
    if (!webhookSecret) {
      throw new Error('Webhook secret not configured');
    }

    return this.stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret,
    );
  }

  private mapPlanIntervalToStripe(interval: string): Stripe.PriceCreateParams.Recurring.Interval {
    switch (interval) {
      case 'monthly':
        return 'month';
      case 'quarterly':
        // Stripe doesn't have quarterly, use month and set interval_count=3 separately
        return 'month';
      case 'annual':
        return 'year';
      default:
        return 'month';
    }
  }
}