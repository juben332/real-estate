import { useState, useMemo } from "react";
import Icon, { icons } from "../ui/Icon";
import { CHANNELS } from "../../data/properties";
import { iso, parseISO, rangeDates, prettyDate, blockedMap } from "../../utils/dateHelpers";

export default function BookingCalendar({ propertyBookings, value, onChange }) {
  const today    = new Date();
  const todayIso = iso(today);
  const [cursor, setCursor] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
  const [hover,  setHover]  = useState(null);

  const blocked = useMemo(() => blockedMap(propertyBookings), [propertyBookings]);

  const monthLabel   = cursor.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstWeekday = cursor.getDay();
  const daysInMonth  = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const minCursor    = new Date(today.getFullYear(), today.getMonth(), 1);
  const canPrev      = cursor > minCursor;

  const cells = [];
  for (let i = 0; i < firstWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push(iso(new Date(cursor.getFullYear(), cursor.getMonth(), d)));
  }

  let previewEnd = null;
  if (value.start && !value.end && hover && hover > value.start) {
    const span = rangeDates(value.start, hover);
    if (!span.some((d) => blocked[d])) previewEnd = hover;
  }
  const rangeEnd = value.end || previewEnd;

  function pick(dayIso) {
    if (!value.start || value.end) {
      onChange({ start: dayIso, end: null });
      return;
    }
    if (dayIso <= value.start) {
      onChange({ start: dayIso, end: null });
      return;
    }
    const span = rangeDates(value.start, dayIso);
    if (span.some((d) => blocked[d])) {
      onChange({ start: dayIso, end: null });
      return;
    }
    onChange({ start: value.start, end: dayIso });
  }

  const shift = (n) => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + n, 1));

  return (
    <div className="hh-cal">
      <div className="hh-cal-head">
        <button
          className="hh-cal-nav"
          onClick={() => canPrev && shift(-1)}
          disabled={!canPrev}
          aria-label="Previous month"
        >
          <Icon d={icons.left} size={16} />
        </button>
        <span className="hh-cal-month">{monthLabel}</span>
        <button className="hh-cal-nav" onClick={() => shift(1)} aria-label="Next month">
          <Icon d={icons.right} size={16} />
        </button>
      </div>

      <div className="hh-cal-weekdays">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <span key={d}>{d}</span>
        ))}
      </div>

      <div className="hh-cal-grid" onMouseLeave={() => setHover(null)}>
        {cells.map((dayIso, i) => {
          if (!dayIso) return <span key={`b${i}`} className="hh-cal-cell is-empty" />;

          const channel    = blocked[dayIso];
          const isBlocked  = !!channel;
          const isPast     = dayIso < todayIso;
          const isStart    = dayIso === value.start;
          const isEnd      = dayIso === value.end;
          const inRange    = value.start && rangeEnd && dayIso > value.start && dayIso < rangeEnd;
          const isTentative = previewEnd && !value.end && (isStart || (dayIso > value.start && dayIso <= previewEnd));
          const disabled   = isPast || isBlocked;

          const cls = [
            "hh-cal-cell",
            disabled    ? "is-disabled"  : "is-open",
            isBlocked   ? "is-blocked"   : "",
            isStart     ? "is-start"     : "",
            isEnd       ? "is-end"       : "",
            inRange     ? "is-range"     : "",
            isTentative ? "is-tentative" : "",
          ].join(" ");

          return (
            <button
              key={dayIso}
              className={cls}
              disabled={disabled}
              onMouseEnter={() => setHover(dayIso)}
              onClick={() => pick(dayIso)}
              style={isBlocked ? { "--ch": CHANNELS[channel].color } : undefined}
              title={isBlocked ? `Booked · ${CHANNELS[channel].label}` : undefined}
            >
              {parseISO(dayIso).getDate()}
              {isBlocked && <i className="hh-cal-chdot" />}
            </button>
          );
        })}
      </div>

      <div className="hh-cal-selection">
        <div>
          <span>Check-in</span>
          <strong>{value.start ? prettyDate(value.start) : "—"}</strong>
        </div>
        <div className="hh-cal-arrow"><Icon d={icons.arrow} size={15} /></div>
        <div>
          <span>Check-out</span>
          <strong>{value.end ? prettyDate(value.end) : "—"}</strong>
        </div>
        {(value.start || value.end) && (
          <button className="hh-cal-clear" onClick={() => onChange({ start: null, end: null })}>
            Clear
          </button>
        )}
      </div>
    </div>
  );
}
