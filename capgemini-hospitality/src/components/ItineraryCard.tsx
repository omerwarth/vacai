"use client";

import React, { JSX } from "react";
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
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Entertainment from "@kiwicom/orbit-components/lib/icons/Entertainment";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import PowerPlug from "@kiwicom/orbit-components/lib/icons/PowerPlug";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import Wifi from "@kiwicom/orbit-components/lib/icons/Wifi";
import HotelIcon from "@kiwicom/orbit-components/lib/icons/Accommodation";
import Map from "@kiwicom/orbit-components/lib/icons/Map";
import Calendar from "@kiwicom/orbit-components/lib/icons/Calendar";
import Location from "@kiwicom/orbit-components/lib/icons/Location";
import Money from "@kiwicom/orbit-components/lib/icons/Money";

import type { Itinerary as ItineraryType, Flight, Activity, Accommodation as AccommodationType, Restaurant } from "@/config/api";

type ItineraryCardProps = {
  itinerary: ItineraryType;
};

const ItineraryCard: React.FC<ItineraryCardProps> = ({ itinerary }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const segments: JSX.Element[] = [];

  // Add flights
  if (itinerary.flights && itinerary.flights.length > 0) {
    itinerary.flights.forEach((flight: Flight, index: number) => {
      segments.push(
        <ItinerarySegment key={`flight-${index}`} spaceAfter="medium">
          <ItinerarySegmentStop
            city={flight.departure.airport}
            station={`${flight.airline} ${flight.flightNumber}`}
            date={formatDate(itinerary.startDate)}
            time={flight.departure.time}
          />
          <ItinerarySegmentDetail
            icon={<Airplane ariaLabel="airplane" />}
            duration="Flight"
            summary={
              <Badge type="info">
                {flight.airline}
              </Badge>
            }
            content={[
              {
                title: "Flight Details",
                items: [
                  {
                    icon: <Airplane ariaLabel="airplane" />,
                    name: "Flight Number",
                    value: flight.flightNumber,
                  },
                  {
                    icon: <InformationCircle ariaLabel="information" />,
                    name: "Airline",
                    value: flight.airline,
                  },
                  ...(flight.seat ? [{
                    icon: <Seat ariaLabel="seat" />,
                    name: "Seat",
                    value: flight.seat,
                  }] : []),
                  ...(flight.confirmation ? [{
                    icon: <InformationCircle ariaLabel="confirmation" />,
                    name: "Confirmation",
                    value: flight.confirmation,
                  }] : []),
                ],
              },
            ]}
          />
          <ItinerarySegmentStop
            city={flight.arrival.airport}
            station="Arrival"
            date={formatDate(itinerary.startDate)}
            time={flight.arrival.time}
          />
        </ItinerarySegment>
      );
    });
  }

  // Add accommodations
  if (itinerary.accommodations && itinerary.accommodations.length > 0) {
    itinerary.accommodations.forEach((acc: AccommodationType, index: number) => {
      segments.push(
        <ItinerarySegment key={`accommodation-${index}`} spaceAfter="medium">
          <ItinerarySegmentStop
            city={itinerary.destination}
            station={acc.name}
            date={`${formatDate(acc.checkIn)} - ${formatDate(acc.checkOut)}`}
            time="Check-in"
          />
          <ItinerarySegmentDetail
            icon={<HotelIcon ariaLabel="hotel" />}
            duration={`${Math.ceil((new Date(acc.checkOut).getTime() - new Date(acc.checkIn).getTime()) / (1000 * 60 * 60 * 24))} nights`}
            summary={
              <Badge type="success">
                {acc.type}
              </Badge>
            }
            content={[
              {
                title: "Hotel Information",
                items: [
                  {
                    icon: <HotelIcon ariaLabel="hotel" />,
                    name: "Hotel Name",
                    value: acc.name,
                  },
                  ...(acc.address ? [{
                    icon: <Location ariaLabel="location" />,
                    name: "Address",
                    value: acc.address,
                  }] : []),
                  ...(acc.confirmation ? [{
                    icon: <InformationCircle ariaLabel="information" />,
                    name: "Confirmation",
                    value: acc.confirmation,
                  }] : []),
                ],
              },
            ]}
          />
          <ItinerarySegmentStop
            city={itinerary.destination}
            station="Check-out"
            date={formatDate(acc.checkOut)}
            time="Departure"
          />
        </ItinerarySegment>
      );
    });
  }

  // Add activities
  if (itinerary.activities && itinerary.activities.length > 0) {
    itinerary.activities.forEach((activity: Activity, index: number) => {
      segments.push(
        <ItinerarySegment key={`activity-${index}`} spaceAfter="medium">
          <ItinerarySegmentStop
            city={itinerary.destination}
            station={activity.name}
            date={activity.date ? formatDate(activity.date) : formatDate(itinerary.startDate)}
            time={activity.time || "All day"}
          />
          <ItinerarySegmentDetail
            icon={<Map ariaLabel="activities" />}
            duration="Activity"
            summary={
              <Badge type="info">
                Activity
              </Badge>
            }
            content={[
              {
                title: "Activity Details",
                items: [
                  {
                    icon: <Map ariaLabel="activity" />,
                    name: "Activity",
                    value: activity.name,
                  },
                  ...(activity.location ? [{
                    icon: <Location ariaLabel="location" />,
                    name: "Location",
                    value: activity.location,
                  }] : []),
                  ...(activity.cost ? [{
                    icon: <Money ariaLabel="cost" />,
                    name: "Cost",
                    value: `$${activity.cost}`,
                  }] : []),
                  ...(activity.bookingConfirmation ? [{
                    icon: <InformationCircle ariaLabel="confirmation" />,
                    name: "Confirmation",
                    value: activity.bookingConfirmation,
                  }] : []),
                ],
              },
            ]}
          />
          <ItinerarySegmentStop
            city={itinerary.destination}
            station="Activity Complete"
            date={activity.date ? formatDate(activity.date) : formatDate(itinerary.startDate)}
            time={activity.time ? "End time" : "Evening"}
          />
        </ItinerarySegment>
      );
    });
  }

  // Add restaurants
  if (itinerary.restaurants && itinerary.restaurants.length > 0) {
    itinerary.restaurants.forEach((restaurant: Restaurant, index: number) => {
      segments.push(
        <ItinerarySegment key={`restaurant-${index}`} spaceAfter="medium">
          <ItinerarySegmentStop
            city={itinerary.destination}
            station={restaurant.name}
            date={restaurant.date ? formatDate(restaurant.date) : formatDate(itinerary.startDate)}
            time={restaurant.time || "Dinner"}
          />
          <ItinerarySegmentDetail
            icon={<Money ariaLabel="restaurant" />}
            duration="2 hours"
            summary={
              <Badge type="warning">
                Dining
              </Badge>
            }
            content={[
              {
                title: "Restaurant Details",
                items: [
                  {
                    icon: <Money ariaLabel="restaurant" />,
                    name: "Restaurant",
                    value: restaurant.name,
                  },
                  ...(restaurant.cuisine ? [{
                    icon: <InformationCircle ariaLabel="cuisine" />,
                    name: "Cuisine",
                    value: restaurant.cuisine,
                  }] : []),
                  ...(restaurant.address ? [{
                    icon: <Location ariaLabel="location" />,
                    name: "Address",
                    value: restaurant.address,
                  }] : []),
                  ...(restaurant.reservationConfirmation ? [{
                    icon: <InformationCircle ariaLabel="confirmation" />,
                    name: "Confirmation",
                    value: restaurant.reservationConfirmation,
                  }] : []),
                ],
              },
            ]}
          />
          <ItinerarySegmentStop
            city={itinerary.destination}
            station="End of meal"
            date={restaurant.date ? formatDate(restaurant.date) : formatDate(itinerary.startDate)}
            time="After dinner"
          />
        </ItinerarySegment>
      );
    });
  }

  // If no segments, show a basic itinerary overview
  if (segments.length === 0) {
    segments.push(
      <ItinerarySegment key="overview" spaceAfter="medium">
        <ItinerarySegmentStop
          city={itinerary.destination}
          station={itinerary.title}
          date={`${formatDate(itinerary.startDate)} - ${formatDate(itinerary.endDate)}`}
          time="Trip Overview"
        />
        <ItinerarySegmentDetail
          icon={<Calendar ariaLabel="calendar" />}
          duration={`${Math.ceil((new Date(itinerary.endDate).getTime() - new Date(itinerary.startDate).getTime()) / (1000 * 60 * 60 * 24))} days`}
          summary={
            <Badge type={itinerary.status === 'completed' ? 'success' : 'info'}>
              {itinerary.status || 'Planning'}
            </Badge>
          }
          content={[
            {
              title: "Trip Details",
              items: [
                {
                  icon: <Calendar ariaLabel="dates" />,
                  name: "Dates",
                  value: `${itinerary.startDate} - ${itinerary.endDate}`,
                },
                ...(itinerary.budget ? [{
                  icon: <Money ariaLabel="budget" />,
                  name: "Budget",
                  value: `${itinerary.currency || 'USD'} ${itinerary.budget}`,
                }] : []),
                ...(itinerary.notes ? [{
                  icon: <InformationCircle ariaLabel="notes" />,
                  name: "Notes",
                  value: itinerary.notes,
                }] : []),
              ],
            },
          ]}
        />
        <ItinerarySegmentStop
          city={itinerary.destination}
          station="Trip Complete"
          date={formatDate(itinerary.endDate)}
          time="Departure"
        />
      </ItinerarySegment>
    );
  }

  return (
    <div className="orbit-itinerary-wrapper">
      <Itinerary>
        {segments}
      </Itinerary>
    </div>
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

  const generateFlightSegments = (flights: Flight[]) => {
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