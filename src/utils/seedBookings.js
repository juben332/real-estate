import { iso, addDays } from "./dateHelpers";

/** Generates realistic cross-channel seed bookings relative to today. */
export function makeSeedBookings() {
  const t = new Date();
  const base = iso(new Date(t.getFullYear(), t.getMonth(), t.getDate()));
  return {
    pine: [
      { start: addDays(base, 4),  end: addDays(base, 8),  channel: "airbnb" },
      { start: addDays(base, 17), end: addDays(base, 20), channel: "vrbo" },
    ],
    marsh: [
      { start: addDays(base, 2),  end: addDays(base, 6),  channel: "booking" },
      { start: addDays(base, 23), end: addDays(base, 28), channel: "airbnb" },
    ],
    kiln: [
      { start: addDays(base, 9),  end: addDays(base, 13), channel: "airbnb" },
    ],
    dune: [
      { start: addDays(base, 6),  end: addDays(base, 10), channel: "vrbo" },
      { start: addDays(base, 14), end: addDays(base, 16), channel: "booking" },
    ],
  };
}
