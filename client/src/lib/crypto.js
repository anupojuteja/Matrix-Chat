const KEY_ID = "dev_aes_key_b64";

function b64ToArray(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
function arrayToB64(arr) {
  return btoa(String.fromCharCode(...new Uint8Array(arr)));
}
async function importKey(raw) {
  return crypto.subtle.importKey("raw", raw, "AES-GCM", true, ["encrypt", "decrypt"]);
}

export async function getOrCreateKey() {
  let b64 = localStorage.getItem(KEY_ID);
  if (!b64) {
    const raw = crypto.getRandomValues(new Uint8Array(32));
    b64 = arrayToB64(raw);
    localStorage.setItem(KEY_ID, b64);
  }
  return importKey(b64ToArray(b64));
}

export async function encryptText(plaintext) {
  const key = await getOrCreateKey();
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const c = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plaintext));
  return { cipherText: arrayToB64(new Uint8Array(c)), nonce: arrayToB64(iv) };
}

export async function decryptText(cipherTextB64, nonceB64) {
  const key = await getOrCreateKey();
  const dec = new TextDecoder();
  const cipher = b64ToArray(cipherTextB64);
  const iv = b64ToArray(nonceB64);
  const pt = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, cipher);
  return dec.decode(pt);
}
