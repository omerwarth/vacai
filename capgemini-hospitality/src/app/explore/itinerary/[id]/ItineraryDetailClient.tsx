"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth0 } from "@auth0/auth0-react";
import { apiService, Itinerary } from "@/config/api";
import ItineraryCard from "../../../../components/ItineraryCard";

export default function ItineraryDetailClient() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { user } = useAuth0();
  const [itinerary, setItinerary] = useState<Itinerary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItinerary() {
      if (!id) return;

      setLoading(true);
      setError(null);
      try {
        // Use authenticated user ID
        const userId = user?.sub;
        if (!userId) {
          setError("User not authenticated.");
          return;
        }
        
        // Fetch all itineraries for the current user, then find by id
        const response = await apiService.getItineraries(userId);
        const found = (response.itineraries || []).find((item: Itinerary) => item.id === id);
        setItinerary(found || null);
      } catch (err) {
        console.error('Failed to load itinerary:', err);
        setError("Failed to load itinerary.");
      } finally {
        setLoading(false);
      }
    }

    fetchItinerary();
  }, [id, user?.sub]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!itinerary) return <div className="p-8 text-gray-600">Itinerary not found.</div>;

  return <ItineraryCard itinerary={itinerary} />;
}
