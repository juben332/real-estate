import Icon, { icons } from "../ui/Icon";
import { CHANNELS } from "../../data/properties";

const SYNC_LIST = [CHANNELS.direct, CHANNELS.airbnb, CHANNELS.vrbo, CHANNELS.booking];

export default function ChannelSync() {
  return (
    <div className="hh-chsync">
      <div className="hh-chsync-head">
        <span className="hh-chsync-spark">✦</span> Syncing your calendars
      </div>
      <ul>
        {SYNC_LIST.map((c, i) => (
          <li key={c.label} style={{ animationDelay: `${250 + i * 280}ms` }}>
            <span className="hh-chsync-dot" style={{ background: c.color }} />
            <span className="hh-chsync-label">{c.label}</span>
            <span className="hh-chsync-check"><Icon d={icons.check} size={13} /></span>
          </li>
        ))}
      </ul>
      <p
        className="hh-chsync-foot"
        style={{ animationDelay: `${250 + SYNC_LIST.length * 280 + 150}ms` }}
      >
        All calendars updated — these nights are now blocked everywhere. No double-bookings.
      </p>
    </div>
  );
}
