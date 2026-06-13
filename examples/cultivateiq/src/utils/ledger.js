// Append-only, hash-chained QA ledger ("blockchain-like").
//
// Every entry embeds the SHA-256 hash of the previous entry, so any
// retroactive edit to an entry's content breaks every hash after it and is
// surfaced by verifyChain(). There is no edit or delete: corrections are new
// "override" entries that reference the original entry's hash and must carry
// a reason plus a second approver (four-eyes).
//
// Demo scope: the chain lives in browser localStorage, which a determined
// local user could replace wholesale. Production deployments should anchor
// the head hash to a server, a transparency log, or an actual distributed
// ledger so the chain itself cannot be silently regenerated.

export const GENESIS_HASH = "0".repeat(64);

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function canonical(entry) {
  // Stable field order so hashing is deterministic.
  return JSON.stringify({
    index: entry.index,
    timestamp: entry.timestamp,
    prevHash: entry.prevHash,
    payload: entry.payload,
  });
}

export async function buildEntry({ index, prevHash, payload, timestamp }) {
  const entry = {
    index,
    timestamp: timestamp || new Date().toISOString(),
    prevHash,
    payload,
  };
  entry.hash = await sha256Hex(canonical(entry));
  return entry;
}

export async function appendEntry(entries, payload) {
  const prev = entries.length > 0 ? entries[entries.length - 1] : null;
  const entry = await buildEntry({
    index: entries.length,
    prevHash: prev ? prev.hash : GENESIS_HASH,
    payload,
  });
  return [...entries, entry];
}

// Recomputes every hash and link. Returns { valid, brokenAt } where brokenAt
// is the index of the first entry that fails verification (or null).
export async function verifyChain(entries) {
  let prevHash = GENESIS_HASH;
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    if (entry.index !== i || entry.prevHash !== prevHash) {
      return { valid: false, brokenAt: i };
    }
    const recomputed = await sha256Hex(canonical(entry));
    if (recomputed !== entry.hash) {
      return { valid: false, brokenAt: i };
    }
    prevHash = entry.hash;
  }
  return { valid: true, brokenAt: null };
}
