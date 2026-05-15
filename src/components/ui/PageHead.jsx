export default function PageHead({ kicker, title, sub }) {
  return (
    <div className="hh-pagehead">
      <p className="hh-kicker">{kicker}</p>
      <h1 className="hh-pagehead-title">{title}</h1>
      {sub && <p className="hh-pagehead-sub">{sub}</p>}
    </div>
  );
}
