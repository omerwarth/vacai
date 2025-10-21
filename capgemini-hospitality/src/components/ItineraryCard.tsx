"use client";

import React, { useEffect, useState } from "react";
import {
  Itinerary,
  ItinerarySegment,
  ItinerarySegmentStop,
  ItinerarySegmentDetail,
  Badge,
} from "@kiwicom/orbit-components";
import * as Icons from "@kiwicom/orbit-components/lib/icons";

// Orbit's badge types — defined inline, no interface needed
type BadgeType = "info" | "success" | "warning" | "critical" | "neutral";

// Helper to safely render icons
const getIconComponent = (iconName: unknown) => {
  if (typeof iconName !== "string") return null;
  const IconComponent = (Icons as Record<string, React.ElementType>)[iconName];
  return IconComponent ? <IconComponent ariaLabel={iconName.toLowerCase()} /> : null;
};

// Type guard to verify objects
const isRecord = (val: unknown): val is Record<string, unknown> =>
  typeof val === "object" && val !== null;

const ItineraryCard: React.FC = () => {
  const [itineraryData, setItineraryData] = useState<unknown>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItinerary = async () => {
      try {
        const res = await fetch("/api/itinerary");
        if (!res.ok) throw new Error("Failed to fetch itinerary");
        const data: unknown = await res.json();
        setItineraryData(data);
      } catch (err) {
        console.error("Error fetching itinerary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItinerary();
  }, []);

  if (loading) return <p>Loading itinerary...</p>;
  if (!isRecord(itineraryData)) return <p>No itinerary found.</p>;

  const segments = Array.isArray(itineraryData.segments)
    ? itineraryData.segments
    : [];

  return (
    <Itinerary>
      {segments.map((segment, i) => {
        if (!isRecord(segment)) return null;

        const stops = Array.isArray(segment.stops) ? segment.stops : [];
        const detail = isRecord(segment.detail) ? segment.detail : null;

        return (
          <ItinerarySegment key={i} spaceAfter="medium">
            {/* Stops */}
            {stops.map((stop, j) => {
              if (!isRecord(stop)) return null;
              return (
                <ItinerarySegmentStop
                  key={j}
                  city={String(stop.city ?? "")}
                  station={String(stop.station ?? "")}
                  date={String(stop.date ?? "")}
                  time={String(stop.time ?? "")}
                />
              );
            })}

            {/* Detail */}
            {detail && (
              <ItinerarySegmentDetail
                icon={getIconComponent(detail.icon)}
                duration={typeof detail.duration === "string" ? detail.duration : ""}
                summary={
                  isRecord(detail.badge) ? (
                    <Badge
                      type={
                        (typeof detail.badge.type === "string" &&
                        ["info", "success", "warning", "critical", "neutral"].includes(
                          detail.badge.type
                        )
                          ? (detail.badge.type as BadgeType)
                          : "info")
                      }
                    >
                      {String(detail.badge.text ?? "")}
                    </Badge>
                  ) : null
                }
                content={
                  Array.isArray(detail.content)
                    ? detail.content
                        .filter(isRecord)
                        .map((section) => ({
                          title: String(section.title ?? ""),
                          items: Array.isArray(section.items)
                            ? section.items
                                .filter(isRecord)
                                .map((item) => ({
                                  icon: getIconComponent(item.icon),
                                  name: String(item.name ?? ""),
                                  value: String(item.value ?? ""),
                                }))
                            : [],
                        }))
                    : []
                }
              />
            )}
          </ItinerarySegment>
        );
      })}
    </Itinerary>
  );
};

export default ItineraryCard;


/*
"use client";

import React from "react";
import {
  Itinerary,
  ItinerarySegment,
  ItinerarySegmentStop,
  ItinerarySegmentDetail,
  Badge,
} from "@kiwicom/orbit-components";

import Airplane from "@kiwicom/orbit-components/lib/icons/Airplane";
import InformationCircle from "@kiwicom/orbit-components/lib/icons/InformationCircle";
import Seat from "@kiwicom/orbit-components/lib/icons/Seat";
import Entertainment from "@kiwicom/orbit-components/lib/icons/Entertainment";
import PowerPlug from "@kiwicom/orbit-components/lib/icons/PowerPlug";
import Wifi from "@kiwicom/orbit-components/lib/icons/Wifi";
import Accommodation from "@kiwicom/orbit-components/lib/icons/Accommodation";
import Map from "@kiwicom/orbit-components/lib/icons/Map";
import Calendar from "@kiwicom/orbit-components/lib/icons/Calendar";
import Location from "@kiwicom/orbit-components/lib/icons/Location";
import Money from "@kiwicom/orbit-components/lib/icons/Money";

const ItineraryCard: React.FC = () => {
  return (
    <Itinerary>
      <ItinerarySegment spaceAfter="medium">
        <ItinerarySegmentStop
          city="Moscow"
          station="Sheremetyevo International Airport (SVO)"
          date="Fri, 19.10"
          time="14:05"
        />
        <ItinerarySegmentDetail
          icon={<Airplane ariaLabel="airplane" />}
          duration="2h 30m"
          summary={
            <Badge type="info">
              Ryanair
            </Badge>
          }
          content={[
            {
              title: "Connection Info",
              items: [
                {
                  icon: <Airplane ariaLabel="airplane" />,
                  name: "Carrier",
                  value: "Ryanair",
                },
                {
                  icon: <InformationCircle ariaLabel="information" />,
                  name: "Connection number",
                  value: "RA 8345",
                },
              ],
            },
            {
              title: "Seating Info",
              items: [
                {
                  icon: <Seat ariaLabel="seat" />,
                  name: "Seat pitch",
                  value: "76cm",
                },
                {
                  icon: <Seat ariaLabel="seat" />,
                  name: "Seat width",
                  value: "43cm",
                },
                {
                  icon: <Seat ariaLabel="seat" />,
                  name: "Seat recline",
                  value: "7cm",
                },
                {
                  icon: <Entertainment ariaLabel="entertainment" />,
                  name: "Audio & video on demand",
                  value: "No",
                },
                {
                  icon: <PowerPlug ariaLabel="power" />,
                  name: "In-seat power",
                  value: "No",
                },
                {
                  icon: <Wifi ariaLabel="wifi" />,
                  name: "Wi-Fi on board",
                  value: "No",
                },
              ],
            },
          ]}
        />
        <ItinerarySegmentStop
          city="Prague"
          station="Václav Havel Airport Prague (PRG)"
          date="Fri, 19.10"
          time="16:35"
        />
      </ItinerarySegment>

      {/* Hotel Accommodation Segment }
      <ItinerarySegment spaceAfter="medium">
        <ItinerarySegmentStop
          city="Prague"
          station="Hotel Golden Well - Lesser Town"
          date="Fri, 19.10 - Sun, 21.10"
          time="Check-in 15:00"
        />
        <ItinerarySegmentDetail
          icon={<Accommodation ariaLabel="hotel" />}
          duration="2 nights"
          summary={
            <Badge type="success">
              5-star Hotel
            </Badge>
          }
          content={[
            {
              title: "Hotel Information",
              items: [
                {
                  icon: <Accommodation ariaLabel="hotel" />,
                  name: "Hotel Name",
                  value: "Hotel Golden Well",
                },
                {
                  icon: <Location ariaLabel="location" />,
                  name: "Address",
                  value: "U Zlaté studně 4, Prague 1",
                },
                {
                  icon: <InformationCircle ariaLabel="information" />,
                  name: "Room Type",
                  value: "Deluxe Double Room",
                },
              ],
            },
            {
              title: "Amenities",
              items: [
                {
                  icon: <Wifi ariaLabel="wifi" />,
                  name: "Free Wi-Fi",
                  value: "Yes",
                },
                {
                  icon: <Entertainment ariaLabel="spa" />,
                  name: "Spa & Wellness",
                  value: "Available",
                },
                {
                  icon: <Money ariaLabel="breakfast" />,
                  name: "Breakfast Included",
                  value: "Yes",
                },
              ],
            },
          ]}
        />
        <ItinerarySegmentStop
          city="Prague"
          station="Check-out 11:00"
          date="Sun, 21.10"
          time="Departure day"
        />
      </ItinerarySegment>

      {/* Activities Segment }
      <ItinerarySegment spaceAfter="medium">
        <ItinerarySegmentStop
          city="Prague"
          station="Old Town Square & Astronomical Clock"
          date="Sat, 20.10"
          time="09:00"
        />
        <ItinerarySegmentDetail
          icon={<Map ariaLabel="activities" />}
          duration="Full day"
          summary={
            <Badge type="info">
              City Tour
            </Badge>
          }
          content={[
            {
              title: "Morning Activities",
              items: [
                {
                  icon: <Map ariaLabel="sightseeing" />,
                  name: "Prague Castle Tour",
                  value: "09:00 - 12:00",
                },
                {
                  icon: <Location ariaLabel="location" />,
                  name: "Charles Bridge Walk",
                  value: "12:30 - 13:30",
                },
              ],
            },
            {
              title: "Afternoon Activities",
              items: [
                {
                  icon: <Calendar ariaLabel="schedule" />,
                  name: "Jewish Quarter Tour",
                  value: "14:00 - 16:00",
                },
                {
                  icon: <Entertainment ariaLabel="culture" />,
                  name: "Traditional Czech Show",
                  value: "19:00 - 21:00",
                },
              ],
            },
          ]}
        />
        <ItinerarySegmentStop
          city="Prague"
          station="Return to Hotel"
          date="Sat, 20.10"
          time="21:30"
        />
      </ItinerarySegment>

      {/* Food & Dining Segment }
      <ItinerarySegment spaceAfter="medium">
        <ItinerarySegmentStop
          city="Prague"
          station="Traditional Czech Cuisine Experience"
          date="Sat, 20.10"
          time="18:00"
        />
        <ItinerarySegmentDetail
          icon={<Money ariaLabel="restaurant" />}
          duration="2 hours"
          summary={
            <Badge type="warning">
              Fine Dining
            </Badge>
          }
          content={[
            {
              title: "Restaurant Details",
              items: [
                {
                  icon: <Money ariaLabel="restaurant" />,
                  name: "Restaurant",
                  value: "Lokál Dlouhááá",
                },
                {
                  icon: <Location ariaLabel="location" />,
                  name: "Location",
                  value: "Dlouhá 33, Prague 1",
                },
                {
                  icon: <InformationCircle ariaLabel="cuisine" />,
                  name: "Cuisine Type",
                  value: "Traditional Czech",
                },
              ],
            },
            {
              title: "Recommended Dishes",
              items: [
                {
                  icon: <Money ariaLabel="food" />,
                  name: "Goulash",
                  value: "Traditional beef stew",
                },
                {
                  icon: <Money ariaLabel="food" />,
                  name: "Svíčková",
                  value: "Beef sirloin with cream sauce",
                },
                {
                  icon: <Money ariaLabel="drink" />,
                  name: "Pilsner Urquell",
                  value: "Local Czech beer",
                },
              ],
            },
          ]}
        />
        <ItinerarySegmentStop
          city="Prague"
          station="End of dinner"
          date="Sat, 20.10"
          time="20:00"
        />
      </ItinerarySegment>
    </Itinerary>
  );
};

export default ItineraryCard;

*/