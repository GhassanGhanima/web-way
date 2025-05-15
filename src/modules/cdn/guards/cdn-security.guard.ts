import { Injectable, CanActivate, ExecutionContext, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import * as crypto from 'crypto';
import { IntegrationsService } from '@app/modules/integrations/integrations.service';

@Injectable()
export class CdnSecurityGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private integrationsService: IntegrationsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const apiKey = request.query.apiKey as string;
    const token = request.query.token as string;
    const origin = request.headers.origin;
    
    // Validate API key
    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }
    
    // Fetch integration
    const integration = await this.integrationsService.findByApiKey(apiKey);
    if (!integration) {
      throw new UnauthorizedException('Invalid API key');
    }
    
    // Validate token if present
    if (token) {
      const isValidToken = this.validateToken(token, integration.id);
      if (!isValidToken) {
        throw new UnauthorizedException('Invalid or expired token');
      }
    }
    
    // Validate origin if present
    if (origin) {
      const domain = origin.replace(/^https?:\/\//, '').split(':')[0];
      const isAllowedDomain = this.validateDomain(domain, integration);
      
      if (!isAllowedDomain) {
        throw new ForbiddenException(`Domain ${domain} is not authorized for this integration`);
      }
    }
    
    // Check rate limits and other security validations
    const isWithinRateLimit = await this.checkRateLimit(apiKey, request.ip || '');
    if (!isWithinRateLimit) {
      throw new ForbiddenException('Rate limit exceeded');
    }
    
    return true;
  }

  private validateToken(token: string, integrationId: string): boolean {
    try {
      const [signature, payloadBase64] = token.split('.');
      const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString('utf8'));
      
      // Check expiration
      if (payload.exp < Math.floor(Date.now() / 1000)) {
        return false;
      }
      
      // Check integration ID
      if (payload.integrationId !== integrationId) {
        return false;
      }
      
      // Verify signature
      const secretKey = this.configService.get<string>('cdn.tokenSecret');
      if (!secretKey) {
        throw new Error('Token secret key is not defined in the configuration');
      }
      const expectedSignature = crypto
        .createHmac('sha256', secretKey)
        .update(JSON.stringify(payload))
        .digest('hex');
      
      return signature === expectedSignature;
    } catch (error) {
      return false;
    }
  }

  private validateDomain(domain: string, integration: any): boolean {
    // Check if domain matches the integration's domain or is in the allowed domains
    if (domain === integration.domain) {
      return true;
    }
    
    if (integration.allowedDomains && integration.allowedDomains.includes(domain)) {
      return true;
    }
    
    // Check for subdomains
    if (domain.endsWith(`.${integration.domain}`)) {
      return true;
    }
    
    return false;
  }

  private async checkRateLimit(apiKey: string, ipAddress: string): Promise<boolean> {
    // Implementation would check a rate limiting service or database
    // For now, just return true
    return true;
  }
}
