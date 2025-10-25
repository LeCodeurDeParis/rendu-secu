import { Injectable } from '@nestjs/common';
import { db } from 'src/index';
import { productsTable, usersTable } from 'src/db/schema';
import { eq, desc } from 'drizzle-orm';
import { ShopifyService } from 'src/shopify/shopify.service';

@Injectable()
export class ProductsService {
  constructor(private readonly shopifyService: ShopifyService) {}
  async createProduct(
    productData: {
      title: string;
      price: number;
      image_url?: string;
      shopify_id?: string;
    },
    userId: number,
    hasImagePermission: boolean = false,
  ) {
    try {
      if (productData.image_url && !hasImagePermission) {
        throw new Error(
          'Permission refusée : vous devez avoir un compte PREMIUM pour ajouter des images',
        );
      }

      const shopifyProduct =
        await this.shopifyService.createProduct(productData);

      const result = await db
        .insert(productsTable)
        .values({
          shopify_id: productData.shopify_id || shopifyProduct.shopify_id,
          created_by: userId,
          sales_count: 0,
          image_url: productData.image_url || null,
        })
        .returning();

      return {
        message: 'Produit créé avec succès',
        data: result[0],
      };
    } catch (error) {
      throw new Error(
        `Erreur lors de la création du produit: ${error.message}`,
      );
    }
  }

  async getBestsellers(userId: number) {
    const products = await db
      .select({
        id: productsTable.id,
        shopify_id: productsTable.shopify_id,
        sales_count: productsTable.sales_count,
        image_url: productsTable.image_url,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .where(eq(productsTable.created_by, userId))
      .orderBy(desc(productsTable.sales_count));

    return {
      message: 'Bestsellers récupérés avec succès',
      data: products,
      count: products.length,
    };
  }

  async getAllProducts() {
    const products = await db
      .select({
        id: productsTable.id,
        shopify_id: productsTable.shopify_id,
        sales_count: productsTable.sales_count,
        createdAt: productsTable.createdAt,
        creator: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.created_by, usersTable.id));

    return {
      message: 'Liste des produits récupérée avec succès',
      data: products,
      count: products.length,
    };
  }

  async getProductById(id: number) {
    const product = await db
      .select({
        id: productsTable.id,
        shopify_id: productsTable.shopify_id,
        sales_count: productsTable.sales_count,
        createdAt: productsTable.createdAt,
        creator: {
          id: usersTable.id,
          name: usersTable.name,
          email: usersTable.email,
        },
      })
      .from(productsTable)
      .leftJoin(usersTable, eq(productsTable.created_by, usersTable.id))
      .where(eq(productsTable.id, id))
      .limit(1);

    if (!product.length) {
      throw new Error('Produit introuvable');
    }

    return product[0];
  }

  async updateSalesCount(id: number, newSalesCount: number) {
    const result = await db
      .update(productsTable)
      .set({
        sales_count: newSalesCount,
        updatedAt: new Date(),
      })
      .where(eq(productsTable.id, id))
      .returning();

    if (!result.length) {
      throw new Error('Produit introuvable');
    }

    return {
      message: 'Nombre de ventes mis à jour avec succès',
      data: result[0],
    };
  }

  async getProductsByUser(userId: number) {
    const products = await db
      .select({
        id: productsTable.id,
        shopify_id: productsTable.shopify_id,
        sales_count: productsTable.sales_count,
        createdAt: productsTable.createdAt,
      })
      .from(productsTable)
      .where(eq(productsTable.created_by, userId));

    return {
      message: "Produits de l'utilisateur récupérés avec succès",
      data: products,
      count: products.length,
    };
  }
}
