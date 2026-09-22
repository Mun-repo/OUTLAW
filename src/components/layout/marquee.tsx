const LINE =
  "Outlaw — Collectif indépendant — Culture underground — Ceux qui tracent leur propre route — ";

export function Marquee() {
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{LINE.repeat(4)}</span>
        <span>{LINE.repeat(4)}</span>
      </div>
    </div>
  );
}
