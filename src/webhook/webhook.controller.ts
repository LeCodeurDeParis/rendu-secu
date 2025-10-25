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
    const productIdMatches = rawBody.match(/"product_id":(\d+)/g);
    const productIds =
      productIdMatches?.map((match) => match.match(/(\d+)/)?.[1]) || [];

    console.log('=== DEBUG RAW BODY ===');
    console.log('IDs trouvés:', productIds);

    // Parser le JSON normalement
    const orderData = JSON.parse(rawBody);

    // Remplacer les product_id corrompus par les bons
    if (productIds.length > 0) {
      orderData.line_items?.forEach((item: any, index: number) => {
        if (productIds[index]) {
          item.product_id = productIds[index];
        }
      });
    }

    console.log('=== DEBUG CORRECTION ===');
    console.log(
      'orderData.product_id après correction:',
      orderData.line_items?.[0]?.product_id,
    );

    console.log('=== DEBUG PARSING ===');
    console.log('body.product_id:', body.line_items?.[0]?.product_id);
    console.log('orderData.product_id:', orderData.line_items?.[0]?.product_id);
    console.log('Type body:', typeof body.line_items?.[0]?.product_id);
    console.log(
      'Type orderData:',
      typeof orderData.line_items?.[0]?.product_id,
    );

    return await this.webhookService.handleOrderCreation(orderData);
  }
}
