import crypto from "crypto";
import fs from "fs";
import path from "path";

// Save keys to keys/ directory in the workspace root
const KEYS_DIR = path.join(process.cwd(), "keys");
const PRIVATE_KEY_PATH = path.join(KEYS_DIR, "private.pem");
const PUBLIC_KEY_PATH = path.join(KEYS_DIR, "public.pem");

export function getKeys() {
  if (fs.existsSync(PRIVATE_KEY_PATH) && fs.existsSync(PUBLIC_KEY_PATH)) {
    const privateKeyPem = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");
    const publicKeyPem = fs.readFileSync(PUBLIC_KEY_PATH, "utf8");
    return { privateKeyPem, publicKeyPem };
  }

  // Generate new EC key pair (P-256)
  const { privateKey, publicKey } = crypto.generateKeyPairSync("ec", {
    namedCurve: "prime256v1",
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
    publicKeyEncoding: { type: "spki", format: "pem" },
  });

  if (!fs.existsSync(KEYS_DIR)) {
    fs.mkdirSync(KEYS_DIR, { recursive: true });
  }

  fs.writeFileSync(PRIVATE_KEY_PATH, privateKey, "utf8");
  fs.writeFileSync(PUBLIC_KEY_PATH, publicKey, "utf8");

  return { privateKeyPem: privateKey, publicKeyPem: publicKey };
}

export function signPayload(payload: object): string {
  const { privateKeyPem } = getKeys();
  const data = JSON.stringify(payload);
  const sign = crypto.createSign("SHA256");
  sign.update(data);
  sign.end();
  const signature = sign.sign(privateKeyPem, "base64");
  return signature;
}

export function verifyPayload(payload: object, signature: string): boolean {
  const { publicKeyPem } = getKeys();
  const data = JSON.stringify(payload);
  const verify = crypto.createVerify("SHA256");
  verify.update(data);
  verify.end();
  return verify.verify(publicKeyPem, signature, "base64");
}
