// Lightweight client-only auth mock. Real cloud auth can be added later.
export type SessionUser = { name: string; email: string };

const KEY = "sigap.session.v1";

export function getSession(): SessionUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as SessionUser) : null;
  } catch {
    return null;
  }
}

export function setSession(user: SessionUser) {
  window.localStorage.setItem(KEY, JSON.stringify(user));
  window.dispatchEvent(new Event("sigap:session"));
}

export function clearSession() {
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new Event("sigap:session"));
}

const BOOKINGS_KEY = "sigap.bookings.v1";
export type Booking = {
  id: string;
  destinationId: string;
  destinationName: string;
  date: string;
  visitors: number;
  total: number;
  rating?: number;
  review?: string;
  createdAt: string;
};

export function getBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(BOOKINGS_KEY) || "[]");
  } catch {
    return [];
  }
}

export function addBooking(b: Booking) {
  const list = getBookings();
  list.unshift(b);
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("sigap:bookings"));
}

export function rateBooking(id: string, rating: number, review: string) {
  const list = getBookings().map((b) => (b.id === id ? { ...b, rating, review } : b));
  window.localStorage.setItem(BOOKINGS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("sigap:bookings"));
}

const BUSINESS_KEY = "sigap.business.v1";
export type BusinessApplication = {
  id: string;
  name: string;
  location: string;
  category: string;
  price: number;
  facilities: string;
  responsibleName: string;
  responsibleNIK: string;
  certificate: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
};
export function getBusinesses(): BusinessApplication[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(BUSINESS_KEY) || "[]");
  } catch {
    return [];
  }
}
export function addBusiness(b: BusinessApplication) {
  const list = getBusinesses();
  list.unshift(b);
  window.localStorage.setItem(BUSINESS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("sigap:business"));
}

export function useHydratedSession() {
  // Simple hook to re-render on session change
  if (typeof window === "undefined") return null;
  return getSession();
}
