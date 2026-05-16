import Icon, { icons } from "../ui/Icon";
import PhotoMark from "../ui/PhotoMark";

export default function AboutStrip({ onMore }) {
  return (
    <section className="hh-aboutstrip" id="story">
      <div className="hh-aboutstrip-mark">
        <PhotoMark label="Your hosts" alt />
      </div>
      <div className="hh-aboutstrip-body">
        <h2 className="hh-h2">We only have four — on purpose.</h2>
        <p>
          Homely started with one creaky cabin and a belief that renting a place to sleep
          shouldn't feel like a transaction. We kept it small so every house gets real attention:
          we know which floorboard sings, where the light lands at 4pm, the café worth the walk.
        </p>
        <button className="hh-btn hh-btn-ghost" onClick={onMore}>
          Read our story <Icon d={icons.arrow} />
        </button>
      </div>
    </section>
  );
}
