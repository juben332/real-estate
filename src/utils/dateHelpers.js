export const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const parseISO = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const addDays = (s, n) => {
  const d = parseISO(s);
  d.setDate(d.getDate() + n);
  return iso(d);
};

export const nightsBetween = (a, b) =>
  Math.round((parseISO(b) - parseISO(a)) / 86400000);

export const rangeDates = (start, end) => {
  const out = [];
  let cur = start;
  while (cur < end) {
    out.push(cur);
    cur = addDays(cur, 1);
  }
  return out;
};

export const prettyDate = (s) =>
  parseISO(s).toLocaleDateString(undefined, { month: "short", day: "numeric" });

/** Returns a map of iso-date string -> channel key for every blocked night. */
export const blockedMap = (list) => {
  const m = {};
  (list || []).forEach((b) =>
    rangeDates(b.start, b.end).forEach((d) => (m[d] = b.channel))
  );
  return m;
};
