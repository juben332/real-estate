import Icon, { icons } from "../components/ui/Icon";
import PageHead from "../components/ui/PageHead";
import PhotoMark from "../components/ui/PhotoMark";

export default function About() {
  return (
    <section className="hh-section hh-about">
      <PageHead
        kicker="Our Story"
        title="Four houses, one pair of hands"
        sub="The unglamorous, genuinely-cared-about version of hospitality."
      />

      <div className="hh-about-cols">
        <div className="hh-about-photo">
          <PhotoMark label="Est. 2019" alt />
        </div>
        <div className="hh-about-text">
          <p>
            It began in 2019 with <strong>The Pine Loft</strong> — a forest A-frame we fixed up
            ourselves, badly at first, then well. Guests kept writing to say it felt different.
            Lived-in. Honest.
          </p>
          <p>
            So we added three more, slowly, and only ones we'd happily stay in. We don't outsource
            cleaning to strangers, we don't tack on surprise fees, and we don't use a call centre.
            When you message, you get us.
          </p>
          <p>
            Booking direct here means more of what you pay stays with the people who actually make
            the beds. That's the whole model. It doesn't scale — and that's the point.
          </p>
          <div className="hh-about-sign">— Mara &amp; Jonah, your hosts</div>
        </div>
      </div>

      <div className="hh-values">
        {[
          ["Kept by hand",   "Every house is cleaned and checked by us or someone we trust by name."],
          ["Honest pricing", "One nightly rate, all-in. No cleaning fee, no service fee, no asterisk."],
          ["Local memory",   "Guidebooks we actually wrote, for towns we actually know."],
        ].map(([t, d]) => (
          <div key={t} className="hh-value">
            <span className="hh-value-star"><Icon d={icons.star} size={20} /></span>
            <h3>{t}</h3>
            <p>{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
