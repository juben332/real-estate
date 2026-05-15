import { useState } from "react";
import Icon, { icons } from "../components/ui/Icon";
import PageHead from "../components/ui/PageHead";
import { PROPERTIES } from "../data/properties";

export default function Contact() {
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({
    name: "", email: "", house: PROPERTIES[0].name, msg: "",
  });
  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  return (
    <section className="hh-section hh-contact">
      <PageHead
        kicker="Say Hello"
        title="Questions before you book?"
        sub="For anything the booking calendar can't answer — we'll write back, usually same day."
      />

      <div className="hh-contact-grid">
        <div className="hh-contact-card">
          {sent ? (
            <div className="hh-sent">
              <span className="hh-sent-mark"><Icon d={icons.star} size={28} /></span>
              <h3>Message sent — thank you, {form.name.split(" ")[0] || "friend"}.</h3>
              <p>
                We'll be in touch at {form.email || "your inbox"} shortly. (This is a demo form —
                wire it to your inbox or a tool like Formspree to go live.)
              </p>
              <button className="hh-btn hh-btn-ghost" onClick={() => setSent(false)}>
                Send another
              </button>
            </div>
          ) : (
            <div className="hh-form">
              <div className="hh-field">
                <label>Your name</label>
                <input value={form.name} onChange={update("name")} placeholder="Jane Rivera" />
              </div>
              <div className="hh-field">
                <label>Email</label>
                <input value={form.email} onChange={update("email")} placeholder="jane@email.com" type="email" />
              </div>
              <div className="hh-field">
                <label>Which house?</label>
                <select value={form.house} onChange={update("house")}>
                  {PROPERTIES.map((p) => <option key={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="hh-field">
                <label>Anything we should know?</label>
                <textarea
                  value={form.msg}
                  onChange={update("msg")}
                  rows={4}
                  placeholder="Rough dates, how many of you, travelling with a dog…"
                />
              </div>
              <button
                className="hh-btn hh-btn-solid hh-btn-full"
                onClick={() => setSent(true)}
                disabled={!form.name || !form.email}
              >
                Send message <Icon d={icons.arrow} />
              </button>
            </div>
          )}
        </div>

        <div className="hh-contact-side">
          <h3>Other ways</h3>
          <p><strong>Email</strong><br />stay@hearthandhollow.co</p>
          <p><strong>Phone &amp; text</strong><br />+1 (828) 555-0174</p>
          <p><strong>Hours</strong><br />We answer 8am–9pm ET, most days sooner.</p>
          <div className="hh-contact-note">
            Prefer to just book? Every house has a live calendar — pick your dates and you're
            confirmed in under a minute, no back-and-forth.
          </div>
        </div>
      </div>
    </section>
  );
}
