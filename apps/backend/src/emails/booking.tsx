// Booking confirmation — sent to attendee after successful event reservation
import * as React from "react";
import {
  EmailLayout,
  EmailKicker,
  EmailHeading,
  EmailParagraph,
  EmailInfoRow,
  EmailDivider,
  EmailButton,
  EmailMuted,
} from "./layout";

type Booking = {
  name: string;
  eventTitle: string;
  eventDate: string;
  venue: string;
  partySize: number;
  ticketPrice?: number;
  bookingId: string;
};

export function BookingConfirmation({ booking }: { booking: Booking }) {
  const frontendUrl = process.env.NEXT_PUBLIC_FRONTEND_URL || "https://groovethiopia.com";
  const total = booking.ticketPrice ? booking.ticketPrice * booking.partySize : 0;

  return (
    <EmailLayout preview={`You're confirmed for ${booking.eventTitle}`}>
      <EmailKicker>Reservation confirmed</EmailKicker>
      <EmailHeading>You're on the list</EmailHeading>

      <EmailParagraph>
        Thank you, <strong style={{ color: "#f5f5f5" }}>{booking.name}</strong>. Your reservation for{" "}
        <strong style={{ color: "#d49520" }}>{booking.eventTitle}</strong> is confirmed.
      </EmailParagraph>

      <EmailDivider />

      <EmailInfoRow label="Event" value={booking.eventTitle} />
      <EmailInfoRow label="Date" value={booking.eventDate} />
      <EmailInfoRow label="Venue" value={booking.venue} />
      <EmailInfoRow label="Party" value={`${booking.partySize} ${booking.partySize === 1 ? "guest" : "guests"}`} />
      {total > 0 && <EmailInfoRow label="Total" value={`$${total.toLocaleString()}`} />}
      <EmailInfoRow label="Confirmation" value={`#${booking.bookingId.slice(-8).toUpperCase()}`} />

      <EmailDivider />

      <EmailParagraph>
        We'll send venue details and arrival instructions 24 hours before the event.
        Keep this confirmation for your records.
      </EmailParagraph>

      <EmailButton href={`${frontendUrl}/events`}>View event details</EmailButton>

      <EmailMuted>
        Need to make changes? Reply to this email or contact hello@groovethiopia.com.
      </EmailMuted>
    </EmailLayout>
  );
}