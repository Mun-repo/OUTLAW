export function FilmGrain() {
  return (
    <div className="film-grain" aria-hidden="true">
      <svg
        className="film-grain-svg"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
      >
        <filter
          id="otl-grain"
          x="0%"
          y="0%"
          width="100%"
          height="100%"
          colorInterpolationFilters="sRGB"
        >
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.78"
            numOctaves="4"
            stitchTiles="stitch"
            result="n"
          />
          <feColorMatrix type="saturate" values="0" in="n" />
        </filter>
        <rect width="100%" height="100%" filter="url(#otl-grain)" />
      </svg>
      <div className="film-grain-fine" />
      <div className="film-grain-coarse" />
    </div>
  );
}
