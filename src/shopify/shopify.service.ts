import { Injectable } from '@nestjs/common';

@Injectable()
export class ShopifyService {
  private readonly shopifyUrl = process.env.SHOPIFY_STORE_URL;
  private readonly accessToken = process.env.SHOPIFY_ACCESS_TOKEN;

  async createProduct(productData: { title: string; price: number }) {
    try {
      const baseUrl = this.shopifyUrl?.startsWith('http')
        ? this.shopifyUrl
        : `https://${this.shopifyUrl}`;

      const response = await fetch(
        `${baseUrl}/admin/api/2023-10/products.json`,
        {
          method: 'POST',
          headers: {
            'X-Shopify-Access-Token': this.accessToken || '',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            product: {
              title: productData.title,
              variants: [
                {
                  price: productData.price.toString(),
                },
              ],
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Erreur Shopify ${response.status}: ${response.statusText}. Détails: ${errorText}`,
        );
      }

      const data = (await response.json()) as {
        product: { id: number; title: string };
      };

      return {
        id: data.product.id,
        title: data.product.title,
        price: productData.price,
        shopify_id: data.product.id.toString(),
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la création du produit Shopify: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
    }
  }
}
