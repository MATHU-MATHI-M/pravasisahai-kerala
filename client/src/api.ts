// --------------------
// Type Definitions
// --------------------

export type LoginPayload = {
  aadhaar_number?: string;
  barcode_id?: string;
  kms_id?: string;
  phone?: string;
  health_id?: string;
  dob?: string;
};

export type RegisterPayload = {
  name: string;
  aadhaar_number: string;
  phone: string;
  kms_id: string;
  dob: string;
  age?: number;
  from_state?: string;
  work_place?: string;
};

// --------------------
// JSON Helper
// --------------------

const json = async (r: Response) => {
  try {
    return await r.json();
  } catch {
    return null; // fallback if backend returns non-JSON
  }
};

// --------------------
// API Calls
// --------------------

export async function apiRegister(payload: RegisterPayload) {
  const res = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await json(res);
  if (!res.ok) {
    const message = data?.message || `Register failed (${res.status})`;
    throw new Error(message);
  }

  return data as {
    status: string;
    verified: boolean;
    health_id: string;
    barcode_id: string;
    token: string;
  };
}

export async function apiVerify(
  payload: Partial<RegisterPayload> & { barcode_id?: string; health_id?: string }
) {
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await json(res);
  if (!res.ok) {
    const message = data?.message || `Verify failed (${res.status})`;
    throw new Error(message);
  }

  return data as {
    status: string;
    verified: boolean;
    health_id: string;
    barcode_id: string;
  };
}

export async function apiLogin(payload: LoginPayload) {
  const res = await fetch("/api/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await json(res);
  if (!res.ok) {
    const message = data?.message || `Login failed (${res.status})`;
    throw new Error(message);
  }

  return data as {
    status: string;
    health_id: string;
    token: string;
  };
}

export async function apiMe(token: string) {
  const res = await fetch("/api/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await json(res);
  if (!res.ok) {
    const message = data?.message || `Fetch profile failed (${res.status})`;
    throw new Error(message);
  }

  return data as {
    health_id: string;
    name?: string;
    aadhaar_last4?: string;
    phone?: string;
    kms_id?: string;
    dob?: string;
    age?: number;
    from_state?: string;
    work_place?: string;
    verified?: boolean;
  };
}

// --------------------
// Session Management
// --------------------

export function saveSession(token: string, healthId: string) {
  sessionStorage.setItem("token", token);
  sessionStorage.setItem("health_id", healthId);
}

export function readSession() {
  const token = sessionStorage.getItem("token") || "";
  const health_id = sessionStorage.getItem("health_id") || "";
  return { token, health_id };
}

export function clearSession() {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("health_id");
}

// --------------------
// Feature Flag
// --------------------

export const useDirectFirestore =
  (import.meta as any).env?.VITE_USE_DIRECT_FIRESTORE === "true";