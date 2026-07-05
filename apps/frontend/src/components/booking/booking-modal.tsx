"use client";

// BookingButton — the single entry point for purchasing or reserving a ticket.
// Always routes the user to the unified multi-gateway checkout at
// /[locale]/tickets/checkout, which is responsible for the entire flow:
// identity → contact → payment-method selection → state-machine-driven capture.

import Link from "next/link";
import { useParams } from "next/navigation";

export function BookingButton({
    eventId,
    eventTitle: _eventTitle,
    startsAt: _startsAt,
    venue: _venue,
    capacity: _capacity,
    ticketPrice,
    eventSlug,
}: {
    eventId: string;
    eventTitle?: string;
    startsAt?: string;
    venue?: string;
    capacity?: number;
    ticketPrice?: number;
    eventSlug?: string;
}) {
    const params = useParams();
    const locale = (params.locale as string) || "en";
    const isPaid = !!ticketPrice && ticketPrice > 0;

    return (
        <Link
            href={`/${locale}/tickets/checkout?event=${eventSlug || eventId}`}
            className="btn-primary"
        >
            {isPaid ? "Buy Ticket" : "Book Tickets"}
        </Link>
    );
}