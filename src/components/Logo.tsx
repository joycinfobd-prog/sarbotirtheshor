const PLAQUE =
  "M74 66 H166 L182 82 V158 L166 174 H74 L58 158 V82 Z";

/**
 * সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার — লোগো
 * নীল ফলক + সোনালি ত্রিশূল, ঠিক দেওয়া লোগোর নকশা অনুযায়ী ভেক্টরে আঁকা।
 */
export function BrandLogo({ className = "h-[76px] w-[76px]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="সর্বতীর্থেশ্বর মহাদেব রুদ্রাক্ষ ভান্ডার লোগো"
    >
      <defs>
        <linearGradient id="bl-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4d68f" />
          <stop offset="52%" stopColor="#d4a03c" />
          <stop offset="100%" stopColor="#a2712a" />
        </linearGradient>
        <linearGradient id="bl-blue" x1="0.1" y1="0" x2="0.9" y2="1">
          <stop offset="0%" stopColor="#2b8fce" />
          <stop offset="100%" stopColor="#1268a6" />
        </linearGradient>

        <path id="bl-petal" d="M120 116 C 104 92 104 62 120 38 C 136 62 136 92 120 116 Z" />

        <g id="bl-trishul">
          <path d="M0 -72 L0 -88" stroke="url(#bl-gold)" strokeWidth="6" strokeLinecap="round" fill="none" />
          <path
            d="M0 -86 C -9 -90 -18 -99 -21 -112 C -12 -106 -6 -98 -3 -91 C -2 -98 3 -106 11 -112 C 8 -99 4 -90 0 -86 Z"
            fill="url(#bl-gold)"
          />
          <path d="M0 -96 C -3 -105 -2 -114 0 -120 C 2 -114 3 -105 0 -96 Z" fill="url(#bl-gold)" />
        </g>
      </defs>

      {/* পটভূমি */}
      <rect x="0" y="0" width="240" height="240" rx="26" fill="#ffffff" />
      <path d="M0 26 A26 26 0 0 1 26 0 L116 0 C 78 18 34 46 0 82 Z" fill="#1b82c8" opacity="0.92" />
      <path d="M240 214 A26 26 0 0 1 214 240 L124 240 C 162 222 206 194 240 158 Z" fill="#1b82c8" opacity="0.92" />

      {/* মান্ডালা */}
      <g fill="#dbeaf7">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <use key={`p${deg}`} href="#bl-petal" transform={`rotate(${deg} 120 120)`} />
        ))}
      </g>

      {/* ত্রিশূল */}
      <g transform="translate(120 120)">
        {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
          <use key={`t${deg}`} href="#bl-trishul" transform={`rotate(${deg})`} />
        ))}
      </g>

      {/* নীল ফলক */}
      <path d={PLAQUE} fill="url(#bl-blue)" stroke="url(#bl-gold)" strokeWidth="6" strokeLinejoin="round" />
      <path
        d={PLAQUE}
        fill="none"
        stroke="#f7e3b0"
        strokeWidth="1.8"
        opacity="0.85"
        transform="translate(120 120) scale(0.93) translate(-120 -120)"
      />

      {/* বাংলা লেখা */}
      <g
        fill="#ffffff"
        textAnchor="middle"
        fontFamily="'Baloo Da 2','Hind Siliguri',sans-serif"
        fontWeight="700"
      >
        <text x="120" y="104" fontSize="25" textLength="104" lengthAdjust="spacingAndGlyphs">
          সর্বতীর্থেশ্বর
        </text>
        <text x="120" y="134" fontSize="25" textLength="62" lengthAdjust="spacingAndGlyphs">
          মহাদেব
        </text>
        <text x="120" y="163" fontSize="21" textLength="108" lengthAdjust="spacingAndGlyphs">
          রুদ্রাক্ষ ভান্ডার
        </text>
      </g>
    </svg>
  );
}

export function LogoMark({
  className = "h-14 w-14",
  ring = "#0c64a4",
  bead = "#8b4a22",
  gold = "#d4a03c",
}: {
  className?: string;
  ring?: string;
  bead?: string;
  gold?: string;
}) {
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label="রুদ্রাক্ষ ভান্ডার">
      <defs>
        <radialGradient id="lg-bead" cx="38%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#c07a44" />
          <stop offset="60%" stopColor={bead} />
          <stop offset="100%" stopColor="#5c2c12" />
        </radialGradient>
        <linearGradient id="lg-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f4d68f" />
          <stop offset="100%" stopColor={gold} />
        </linearGradient>
      </defs>

      <circle cx="50" cy="50" r="47" fill="none" stroke={ring} strokeWidth="3" />
      <circle cx="50" cy="50" r="41" fill="none" stroke="url(#lg-gold)" strokeWidth="2.2" />

      <path
        d="M50 12c-9 6-14 13-14 21 0 6 3 10 6 13h16c3-3 6-7 6-13 0-8-5-15-14-21z"
        fill="url(#lg-gold)"
        opacity="0.95"
      />

      <path d="M50 8v34" stroke={ring} strokeWidth="3.2" strokeLinecap="round" fill="none" />
      <path
        d="M50 10c-4 2-7 6-7 11 0 3 1 5 2 7M50 10c4 2 7 6 7 11 0 3-1 5-2 7"
        stroke={ring}
        strokeWidth="2.6"
        fill="none"
        strokeLinecap="round"
      />
      <path d="M41 22h18" stroke={ring} strokeWidth="2.6" strokeLinecap="round" />

      <circle cx="50" cy="64" r="21" fill="url(#lg-bead)" />
      <g stroke="#3f1e0c" strokeWidth="1.5" opacity="0.75" fill="none">
        <path d="M50 43c-5 8-5 34 0 42" />
        <path d="M50 43c5 8 5 34 0 42" />
        <path d="M31 58c12 5 26 5 38 0" />
        <path d="M32 71c11 5 25 5 36 0" />
        <path d="M40 46c4 12 16 12 20 0" />
      </g>
      <circle cx="50" cy="64" r="4.4" fill="#2c1206" />
    </svg>
  );
}

export function Wordmark({
  name,
  name2,
  tagline,
  dark = false,
  logoImage,
  compact = false,
}: {
  name: string;
  name2?: string;
  tagline?: string;
  dark?: boolean;
  logoImage?: string;
  compact?: boolean;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      {logoImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoImage}
          alt={name}
          className={`${compact ? "h-14 w-14" : "h-[54px] w-[54px] sm:h-[76px] sm:w-[76px]"} shrink-0 rounded-lg object-contain sm:rounded-2xl`}
        />
      ) : (
        <BrandLogo className={`${compact ? "h-14 w-14" : "h-[54px] w-[54px] sm:h-[76px] sm:w-[76px]"} shrink-0`} />
      )}
      <div className="min-w-0 leading-tight">
        <div
          className={`font-display font-bold ${
            compact ? "text-[1.05rem]" : "text-[0.99rem] sm:text-[1.5rem]"
          } ${dark ? "text-white" : "text-navy"}`}
        >
          {name}
        </div>
        {name2 ? (
          <div
            className={`font-display font-bold ${
              compact ? "text-[0.95rem]" : "text-[0.92rem] sm:text-[1.3rem]"
            } ${dark ? "text-gold" : "text-navy-mid"}`}
          >
            {name2}
          </div>
        ) : null}
        {tagline ? (
          <div
            className={`hidden text-[0.66rem] tracking-wide sm:block ${dark ? "text-white/70" : "text-ink-soft"}`}
          >
            {tagline}
          </div>
        ) : null}
      </div>
    </div>
  );
}
