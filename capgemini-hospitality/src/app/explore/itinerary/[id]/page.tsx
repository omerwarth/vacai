import React from 'react';
import ItineraryDetailClient from './ItineraryDetailClient';
import { allItineraries } from './data';

// Required for static export
export function generateStaticParams() {
  return Object.keys(allItineraries).map(id => ({ id }));
}

export default async function ItineraryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ItineraryDetailClient itineraryId={id} />;
}
