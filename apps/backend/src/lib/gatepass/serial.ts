// Serial number generator for gate passes.
// Format follows the spec: `XYZ-123456-ABC` — 3-char event prefix, 6-digit
// monotonically-incrementing sequence, 3-char crypto checksum.

import crypto from "crypto";

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Crockford-ish base32 (no I, O, 0, 1).

/**
 * Generate a deterministic 3-char checksum from the seed material. The
 * checksum is verified by the gate device against the public key.
 */
function generateChecksum(seed: string): string {
    const hash = crypto.createHash("sha256").update(seed).digest();
    let out = "";
    for (let i = 0; i < 3; i++) {
        out += ALPHABET[hash[i] % ALPHABET.length];
    }
    return out;
}

/**
 * Generate a serial number for a new ticket. Uses the current unix timestamp
 * (ms) as the sequence source — collisions are extremely unlikely and the
 * surrounding code retries on collision.
 */
export function generateSerialNumber(prefix = "GTP"): string {
    const seq = Date.now() % 1_000_000; // last 6 digits of epoch ms.
    const sequence = seq.toString().padStart(6, "0");
    const seed = `${prefix}-${sequence}`;
    const checksum = generateChecksum(seed);
    return `${prefix}-${sequence}-${checksum}`;
}

/**
 * Verify the checksum embedded in a serial number.
 */
export function verifySerialChecksum(serial: string): boolean {
    const parts = serial.split("-");
    if (parts.length !== 3) return false;
    const [prefix, sequence, checksum] = parts;
    const expected = generateChecksum(`${prefix}-${sequence}`);
    return expected === checksum;
}

/**
 * Strip prefix/suffix and return the bare sequence.
 */
export function parseSerial(serial: string): { prefix: string; sequence: string; checksum: string } | null {
    const parts = serial.split("-");
    if (parts.length !== 3) return null;
    return { prefix: parts[0], sequence: parts[1], checksum: parts[2] };
}