import { createClient } from '@sanity/client';
import imageUrlBuilder from '@sanity/image-url';

export const sanityClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
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

export async function getProducts(): Promise<Product[]> {
  return sanityClient.fetch(`*[_type == "product"] | order(_createdAt desc)`);
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return sanityClient.fetch(`*[_type == "product" && slug.current == $slug][0]`, { slug });
}

export async function getProductsByCategory(category: string): Promise<Product[]> {
  return sanityClient.fetch(`*[_type == "product" && category == $category]`, { category });
}
