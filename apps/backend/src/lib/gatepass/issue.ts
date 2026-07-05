// Gate pass issuance — produces the cryptographically signed payload that is
// encoded into the QR code presented by the holder at the gate.

import { prisma } from "@groovethiopia/db";
import { signPayload, getKeys } from "@/lib/crypto";

export interface GatePassPayload {
    iss: string;
    sub: string;
    sn: string;
    exp: number;
    sig: string;
}

export interface IssuedPass {
    qrPayloadBase64: string;
    payload: GatePassPayload;
    publicKey: string;
    ticket: any;
}

/**
 * Issue (or re-issue) a signed gate pass for a given ticket purchase.
 * Idempotent — re-running returns the same payload as long as the ticket has
 * not been revoked.
 */
export async function issueGatePass(ticketId: string): Promise<IssuedPass> {
    const ticket = await prisma.ticketPurchase.findUnique({
        where: { id: ticketId },
        include: {
            publicUser: true,
        },
    });
    if (!ticket) throw new Error(`Ticket not found: ${ticketId}`);

    const event = await prisma.content.findUnique({ where: { id: ticket.eventId } });
    if (!event) throw new Error(`Event not found: ${ticket.eventId}`);

    const expiresAt =
        ticket.passExpiresAt ||
        event.endsAt ||
        new Date(Date.now() + 24 * 60 * 60 * 1000);

    const expEpoch = Math.floor(expiresAt.getTime() / 1000);

    const unsigned = {
        iss: "groovethiopia.com",
        sub: ticket.id,
        sn: ticket.serialNumber,
        exp: expEpoch,
    };

    const sig = signPayload(unsigned);

    const payload: GatePassPayload = { ...unsigned, sig };
    const qrPayloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64");

    // Persist issuance metadata on the ticket row.
    await prisma.ticketPurchase.update({
        where: { id: ticket.id },
        data: {
            passIssuedAt: ticket.passIssuedAt || new Date(),
            passExpiresAt: expiresAt,
        },
    });

    const { publicKeyPem } = getKeys();

    return {
        qrPayloadBase64,
        payload,
        publicKey: publicKeyPem,
        ticket: {
            id: ticket.id,
            ticketType: ticket.ticketType,
            quantity: ticket.quantity,
            totalPrice: ticket.totalPrice,
            currency: ticket.currency,
            serialNumber: ticket.serialNumber,
            status: ticket.status,
            passExpiresAt: expiresAt,
            createdAt: ticket.createdAt,
            event: {
                title: event.title,
                slug: event.slug,
                startsAt: event.startsAt,
                endsAt: event.endsAt,
                venue: event.venue,
                venueAddress: event.venueAddress,
            },
            user: {
                name: ticket.publicUser?.name,
                email: ticket.publicUser?.email,
                phoneNumber: ticket.phoneNumber || ticket.publicUser?.phoneNumber,
            },
        },
    };
}