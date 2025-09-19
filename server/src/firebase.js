// server/src/firebase.js
const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

function createMemoryDb() {
  // ... copy your existing createMemoryDb implementation here (same as you had) ...
  const store = new Map();
  function toSnapshot(arr) {
    return { docs: (arr || []).map((obj) => ({ data: () => obj })) };
  }
  function ensure(name) {
    if (!store.has(name)) store.set(name, []);
    return store.get(name);
  }
  function createQuery(name, base) {
    let predicates = base?.predicates ? [...base.predicates] : [];
    let lim = base?.lim || 0;
    return {
      where(field, op, value) {
        if (op !== "==") throw new Error("memory-db only supports ==");
        predicates.push((d) => (d || {})[field] === value);
        return createQuery(name, { predicates, lim });
      },
      limit(n) {
        lim = n;
        return createQuery(name, { predicates, lim });
      },
      async get() {
        const arr = ensure(name).map((e) => e.data);
        let out = arr.filter((d) => predicates.every((p) => p(d)));
        if (lim > 0) out = out.slice(0, lim);
        return toSnapshot(out);
      }
    };
  }
  return {
    collection(name) {
      ensure(name);
      return {
        async add(doc) {
          const arr = ensure(name);
          const id = String(arr.length);
          arr.push({ id, data: { ...doc } });
          return { id };
        },
        async get() {
          const arr = ensure(name).map((e) => e.data);
          return toSnapshot(arr);
        },
        where(field, op, value) {
          return createQuery(name).where(field, op, value);
        },
        doc(id) {
          return {
            async set(data, opts) {
              const arr = ensure(name);
              const idx = arr.findIndex((e) => e.id === id);
              if (idx >= 0) {
                arr[idx].data = opts?.merge ? { ...arr[idx].data, ...data } : { ...data };
              } else {
                arr.push({ id, data: { ...data } });
              }
              return { id };
            }
          };
        }
      };
    }
  };
}

let db;
try {
  // Allow either: path to JSON file OR full JSON string in FIREBASE_SERVICE_ACCOUNT
  const credEnv = (process.env.FIREBASE_SERVICE_ACCOUNT || process.env.GOOGLE_APPLICATION_CREDENTIALS || "").trim();

  let serviceAccount = null;

  if (credEnv) {
    // If path exists on disk -> require it
    const possiblePath = path.resolve(credEnv);
    if (fs.existsSync(possiblePath)) {
      serviceAccount = require(possiblePath);
    } else {
      // try parse as JSON string
      try {
        serviceAccount = JSON.parse(credEnv);
      } catch (e) {
        // not JSON; try to read as path relative to repo root
        const alt = path.resolve(process.cwd(), credEnv);
        if (fs.existsSync(alt)) serviceAccount = require(alt);
      }
    }
  }

  if (!serviceAccount && process.env.GOOGLE_APPLICATION_CREDENTIALS && fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS)) {
    serviceAccount = require(path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS));
  }

  if (!serviceAccount) throw new Error("No Firebase service account JSON found. Check FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS environment variable");

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID || serviceAccount.project_id,
    databaseURL: process.env.FIREBASE_DATABASE_URL || undefined
  });

  db = admin.firestore();
  console.log("✅ Connected to Firebase project:", serviceAccount.project_id || process.env.FIREBASE_PROJECT_ID);
} catch (e) {
  console.warn("⚠️ Firebase admin init failed. Using in-memory mock DB:", e.message);
  db = createMemoryDb();
}

module.exports = { db };
