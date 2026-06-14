const STORAGE_KEY = "trackedBookingNotifications";

export function getTrackedBookings() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveTrackedBookings(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function upsertTrackedBooking(item) {
  const items = getTrackedBookings();
  const idx = items.findIndex((entry) => entry.bookingId === item.bookingId);

  if (idx >= 0) {
    items[idx] = { ...items[idx], ...item };
  } else {
    items.unshift(item);
  }

  saveTrackedBookings(items.slice(0, 20));
  return items;
}

export function markAllTrackedRead() {
  const items = getTrackedBookings().map((item) => ({ ...item, unread: false }));
  saveTrackedBookings(items);
  return items;
}
