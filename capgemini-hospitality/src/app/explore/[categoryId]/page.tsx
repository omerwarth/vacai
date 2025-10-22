import React from 'react';
import CategoryPageClient from './CategoryPageClient';

// Required for static export
export function generateStaticParams() {
  return [
    { categoryId: 'beach-paradise' },
    { categoryId: 'cultural-heritage' },
    { categoryId: 'food-adventure' },
    { categoryId: 'luxury-escapes' },
    { categoryId: 'adventure-sports' },
    { categoryId: 'city-exploration' },
  ];
}

export default async function CategoryPage({ params }: { params: Promise<{ categoryId: string }> }) {
  const { categoryId } = await params;
  return <CategoryPageClient categoryId={categoryId} />;
}
