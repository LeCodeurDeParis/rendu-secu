import {
  Controller,
  Post,
  Body,
  Headers,
  RawBodyRequest,
  Req,
  UnauthorizedException,
  HttpCode,
} from '@nestjs/common';
import { WebhookService } from './webhook.service';

@Controller('webhooks')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) {}

  @Post('shopify-sales')
  @HttpCode(200)
  async handleShopifySales(
    @Headers('x-shopify-hmac-sha256') hmacHeader: string,
    @Req() req: any,
    @Body() body: any,
  ) {
    // Vérifier la signature HMAC
    const rawBody = req.rawBody?.toString('utf8') || JSON.stringify(body);

    if (!hmacHeader) {
      throw new UnauthorizedException('Signature HMAC manquante');
    }

    const isValid = this.webhookService.verifyWebhookSignature(
      rawBody,
      hmacHeader,
    );

    if (!isValid) {
      throw new UnauthorizedException('Signature HMAC invalide');
    }

    // Traiter le webhook
    return await this.webhookService.handleOrderCreation(body);
  }
}
