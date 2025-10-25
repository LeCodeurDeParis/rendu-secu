export class ProductDTO {
  shopify_id: string;
  created_by: number;
  sales_count?: number;
}

export class CreateProductDTO {
  shopify_id: string;
}
