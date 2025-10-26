import { productsTable } from 'src/db/schema';
import { db } from 'src/index';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';
import { getUtcDate } from 'src/utils/date.utils';

export class WebhookService {
  private readonly webhookSecret = process.env.SHOPIFY_WEBHOOK_SECRET;
  verifyWebhookSignature(body: string, hmacHeader: string): boolean {
    if (!this.webhookSecret) {
      throw new Error('SHOPIFY_WEBHOOK_SECRET non configuré');
    }

    const hash = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(body, 'utf8')
      .digest('base64');

    return hash === hmacHeader;
  }

  async handleOrderCreation(orderData: any) {
    try {
      console.log('=== WEBHOOK REÇU ===');
      console.log('Order ID:', orderData.id);

      const lineItems = orderData.line_items || [];
      console.log('Nombre de line_items:', lineItems.length);

      if (!lineItems.length) {
        return {
          message: 'Aucun produit dans la commande',
          productsUpdated: 0,
        };
      }

      let productsUpdated = 0;

      for (const item of lineItems) {
        const shopifyProductId = item.product_id.toString();
        const quantity = item.quantity || 1;

        console.log('\n--- Traitement item ---');
        console.log('Titre:', item.title || item.name);
        console.log('Product ID reçu (brut):', item.product_id);
        console.log('Product ID reçu (string):', shopifyProductId);
        console.log('Quantité:', quantity);

        if (!shopifyProductId || shopifyProductId === 'undefined') {
          console.warn('⚠️ Produit sans ID Shopify ignoré');
          continue;
        }

        console.log(
          'Recherche dans la BDD avec shopify_id =',
          shopifyProductId,
        );

        const product = await db
          .select()
          .from(productsTable)
          .where(eq(productsTable.shopify_id, shopifyProductId))
          .limit(1);

        console.log('Produits trouvés dans la BDD:', product.length);

        if (product.length > 0) {
          console.log('✅ Produit trouvé - ID local:', product[0].id);

          const updated = await db
            .update(productsTable)
            .set({
              sales_count: product[0].sales_count + quantity,
              updatedAt: new Date(getUtcDate()),
            })
            .where(eq(productsTable.id, product[0].id))
            .returning();

          console.log(
            '✅ Mise à jour réussie. Nouveau sales_count:',
            updated[0].sales_count,
          );
          productsUpdated++;
        } else {
          console.warn(`⚠️ Produit ${shopifyProductId} NON TROUVÉ`);
          const allProducts = await db.select().from(productsTable);
          console.log(
            'shopify_id en BDD:',
            allProducts.map((p) => p.shopify_id),
          );
        }
      }

      return {
        message: 'Webhook traité avec succès',
        productsUpdated,
        totalLineItems: lineItems.length,
      };
    } catch (error) {
      console.error('❌ ERREUR:', error);
      throw new Error(
        `Erreur: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
