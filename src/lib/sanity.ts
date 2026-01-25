import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'gtdvvh3t',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.NEXT_PUBLIC_SANITY_API_TOKEN,
});

const builder = imageUrlBuilder(sanityClient);

export function urlFor(source: any) {
  return builder.image(source);
}

export interface Product {
  _id: string;
  title: string;
  slug: { current: string };
  price: number;
  stock: number;
  image: any;
  category: string;
  tags: string[];
  emotionBoost: number;
  description: string;
}

export async function updateProductStock(productId: string, quantityPurchased: number): Promise<void> {
  try {
    console.log(`🔄 Updating stock for product ${productId}, reducing by ${quantityPurchased}`);
    
    // Get current product
    const product = await sanityClient.fetch(`*[_type == "product" && _id == $id][0]`, { id: productId });
    console.log('Current product:', product);
    
    if (product) {
      const newStock = Math.max(0, product.stock - quantityPurchased);
      console.log(`Stock change: ${product.stock} -> ${newStock}`);
      
      // Update stock in Sanity
      const result = await sanityClient
        .patch(productId)
        .set({ stock: newStock })
        .commit();
      
      console.log('✅ Sanity stock update result:', result);
    } else {
      console.error('❌ Product not found:', productId);
    }
  } catch (error) {
    console.error('❌ Failed to update product stock in Sanity (permissions issue):', error);
    console.log('⚠️ Continuing with local stock update only...');
    // Don't throw - let checkout continue with local state update
  }
}

export async function getProducts(): Promise<Product[]> {
  return sanityClient.fetch(`*[_type == "product"] | order(_createdAt desc)`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return sanityClient.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return sanityClient.fetch(`*[_type == "product" && category == $category]`, { category });
}
