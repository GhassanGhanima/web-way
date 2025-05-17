import { Body, Controller, Headers, Post, RawBodyRequest, Req, UseGuards, Version } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Request } from 'express';
import { JwtAuthGuard } from '@app/modules/auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '@app/modules/auth/guards/permissions.guard';
import { Permissions, Permission } from '@app/common/decorators/permissions.decorator';
import { StripeService } from '../services/stripe.service';
import { PaymentsService } from '../services/payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly stripeService: StripeService,
    private readonly paymentsService: PaymentsService,
  ) {}

  @Post('webhook')
  @Version('1')
  @ApiOperation({ summary: 'Handle Stripe webhook events' })
  @ApiResponse({
    status: 200,
    description: 'Webhook handled successfully',
  })
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    if (!signature) {
      return { received: false, error: 'Missing stripe-signature header' };
    }

    try {
      const event = await this.stripeService.handleWebhookEvent(
        request.rawBody as Buffer,
        signature,
      );
      
      await this.paymentsService.processWebhookEvent(event);
      return { received: true };
    } catch (err) {
      return { received: false, error: err.message };
    }
  }

  @Post('create-payment-intent')
  @Version('1')
  @UseGuards(JwtAuthGuard, PermissionsGuard)
  @Permissions(Permission.SUBSCRIPTION_CREATE)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a payment intent for one-time payment' })
  @ApiResponse({
    status: 201,
    description: 'Payment intent created',
    schema: {
      type: 'object',
      properties: {
        clientSecret: { type: 'string' },
      },
    },
  })
  async createPaymentIntent(
    @Body() body: { amount: number; currency: string },
  ) {
    const { clientSecret } = await this.paymentsService.createPaymentIntent(
      body.amount,
      body.currency,
    );
    return { clientSecret };
  }
}
