import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { StripeService } from './stripe.service';
import { SubscriptionStatus } from '@app/modules/subscriptions/entities/subscription.entity';
import { SubscriptionsService } from '@app/modules/subscriptions/subscriptions.service';

// Extended Invoice type to properly handle the subscription property
type StripeInvoice = Stripe.Invoice & {
  subscription?: string | Stripe.Subscription;
};

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);
  private stripe: Stripe;

  constructor(
    private configService: ConfigService,
    private stripeService: StripeService,
    private subscriptionsService: SubscriptionsService,
  ) {
    this.stripe = new Stripe(this.configService.get<string>('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2023-10-16',
    });
  }

  async createPaymentIntent(amount: number, currency: string = 'usd'): Promise<{ clientSecret: string }> {
    const paymentIntent = await this.stripe.paymentIntents.create({
      amount,
      currency,
    });

    return {
      clientSecret: paymentIntent.client_secret || '',
    };
  }

  async processWebhookEvent(event: Stripe.Event): Promise<void> {
    this.logger.log(`Processing webhook event: ${event.type}`);

    switch (event.type) {
      case 'customer.subscription.created':
        await this.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as StripeInvoice);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as StripeInvoice);
        break;
      default:
        this.logger.log(`Unhandled event type: ${event.type}`);
    }
  }

  private async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Implementation depends on how we store the mapping between Stripe subscriptions and our own
    this.logger.log(`Subscription created: ${subscription.id}`);
  }

  private async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    const status = this.mapStripeStatusToSubscriptionStatus(subscription.status);
    
    try {
      // Find our subscription by external ID
      const ourSubscription = await this.subscriptionsService.findByExternalId(subscription.id);
      
      if (ourSubscription) {
        await this.subscriptionsService.updateStatus(ourSubscription.id, status);
      }
    } catch (error) {
      this.logger.error(`Error updating subscription: ${error.message}`, error.stack);
    }
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    try {
      const ourSubscription = await this.subscriptionsService.findByExternalId(subscription.id);
      
      if (ourSubscription) {
        await this.subscriptionsService.updateStatus(ourSubscription.id, SubscriptionStatus.CANCELED);
      }
    } catch (error) {
      this.logger.error(`Error handling deleted subscription: ${error.message}`, error.stack);
    }
  }

  private async handleInvoicePaymentSucceeded(invoice: StripeInvoice): Promise<void> {
    if (invoice.subscription) {
      try {
        // Get the subscription ID, handling both string and Subscription object cases
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id;
          
        const ourSubscription = await this.subscriptionsService.findByExternalId(subscriptionId);
        
        if (ourSubscription) {
          // Update payment records, extend subscription end date, etc.
          const endDate = new Date(ourSubscription.endDate);
          endDate.setMonth(endDate.getMonth() + 1); // Extend by 1 month (adjust based on plan)
          
          await this.subscriptionsService.update(ourSubscription.id, {
            status: SubscriptionStatus.ACTIVE,
            endDate,
          });
        }
      } catch (error) {
        this.logger.error(`Error handling invoice payment success: ${error.message}`, error.stack);
      }
    }
  }

  private async handleInvoicePaymentFailed(invoice: StripeInvoice): Promise<void> {
    if (invoice.subscription) {
      try {
        // Get the subscription ID, handling both string and Subscription object cases
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id;
          
        const ourSubscription = await this.subscriptionsService.findByExternalId(subscriptionId);
        
        if (ourSubscription) {
          // Mark as payment failed, send notification, etc.
          this.logger.log(`Payment failed for subscription: ${ourSubscription.id}`);
          
          // We don't immediately cancel the subscription, as Stripe will retry payment
          // But we might want to notify the user
        }
      } catch (error) {
        this.logger.error(`Error handling invoice payment failure: ${error.message}`, error.stack);
      }
    }
  }

  private mapStripeStatusToSubscriptionStatus(stripeStatus: string): SubscriptionStatus {
    switch (stripeStatus) {
      case 'active':
        return SubscriptionStatus.ACTIVE;
      case 'canceled':
        return SubscriptionStatus.CANCELED;
      case 'incomplete':
      case 'incomplete_expired':
        return SubscriptionStatus.PENDING;
      case 'past_due':
      case 'unpaid':
        return SubscriptionStatus.EXPIRED;
      case 'trialing':
        return SubscriptionStatus.TRIAL;
      default:
        return SubscriptionStatus.PENDING;
    }
  }
}