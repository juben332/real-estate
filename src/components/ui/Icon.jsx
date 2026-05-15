export const icons = {
  bed:   "M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 18h18M3 18v2M21 18v2M7 10V7a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v3",
  bath:  "M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3zM6 12V5a2 2 0 0 1 2-2 2 2 0 0 1 2 2M10 7h2",
  guest: "M16 21v-2a4 4 0 0 0-8 0v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  pin:   "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0zM12 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
  arrow: "M5 12h14M12 5l7 7-7 7",
  back:  "M19 12H5M12 19l-7-7 7-7",
  star:  "M12 2l3 7 7 .5-5.5 4.5 2 7-6.5-4-6.5 4 2-7L2 9.5 9 9z",
  left:  "M15 18l-6-6 6-6",
  right: "M9 18l6-6-6-6",
  close: "M18 6 6 18M6 6l12 12",
  lock:  "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  check: "M20 6 9 17l-5-5",
  bolt:  "M13 2 3 14h7l-1 8 10-12h-7z",
};

export default function Icon({ d, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}
