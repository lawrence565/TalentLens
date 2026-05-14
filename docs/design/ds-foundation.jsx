// ── ds-foundation.jsx ────────────────────────────────────────────────────────
// Foundation design tokens: Brand, Color, Typography, Spacing
// Loaded by design-system.html via Babel standalone (UMD, no import/export)
// All hooks are available as globals: useState, useEffect, useRef

// ── SHARED HELPERS ────────────────────────────────────────────────────────────

const SectionTitle = ({ children }) => (
  <h2
    style={{
      fontFamily: "var(--tl-font)",
      fontSize: 22,
      fontWeight: 800,
      color: "var(--tl-n-900)",
      letterSpacing: "-0.02em",
      marginBottom: 6,
    }}
  >
    {children}
  </h2>
);

const SectionDesc = ({ children }) => (
  <p
    style={{
      fontFamily: "var(--tl-font)",
      fontSize: 14,
      color: "var(--tl-text-muted)",
      lineHeight: 1.65,
      marginBottom: 36,
      maxWidth: 560,
    }}
  >
    {children}
  </p>
);

const Label = ({ children, style }) => (
  <div
    style={{
      fontFamily: "var(--tl-font)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      color: "var(--tl-n-400)",
      marginBottom: 12,
      ...style,
    }}
  >
    {children}
  </div>
);

const Block = ({ children, style }) => (
  <div
    style={{
      background: "var(--tl-surface)",
      border: "1px solid var(--tl-border)",
      borderRadius: 14,
      padding: 28,
      marginBottom: 24,
      ...style,
    }}
  >
    {children}
  </div>
);

// ── LOGO MARK ─────────────────────────────────────────────────────────────────
// Shared logo component (also used by the inline HTML script)
const TLLogoMark = ({ size = 40 }) => {
  const r = size / 2;
  const lensR = size * 0.33;
  const handleLen = size * 0.22;
  const handleX1 = r + lensR * Math.cos((Math.PI / 180) * 45) * 0.7;
  const handleY1 = r + lensR * Math.sin((Math.PI / 180) * 45) * 0.7;
  const handleX2 = r + (lensR + handleLen) * Math.cos((Math.PI / 180) * 45);
  const handleY2 = r + (lensR + handleLen) * Math.sin((Math.PI / 180) * 45);
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width={size} height={size} rx={size * 0.22} fill="var(--tl-brand-600)" />
      <circle
        cx={r}
        cy={r}
        r={lensR}
        stroke="white"
        strokeWidth={size * 0.07}
        fill="none"
      />
      <line
        x1={handleX1}
        y1={handleY1}
        x2={handleX2}
        y2={handleY2}
        stroke="white"
        strokeWidth={size * 0.07}
        strokeLinecap="round"
      />
      <circle cx={r} cy={r} r={lensR * 0.35} fill="rgba(255,255,255,0.22)" />
    </svg>
  );
};

// ── BRAND SECTION ─────────────────────────────────────────────────────────────
const BrandSection = () => {
  const sizes = [
    { px: 64, label: "Display / Hero" },
    { px: 48, label: "Large" },
    { px: 32, label: "Default" },
    { px: 24, label: "Small" },
    { px: 16, label: "Micro" },
  ];

  return (
    <section id="brand" style={{ paddingBottom: 72 }}>
      <SectionTitle>Brand &amp; Identity</SectionTitle>
      <SectionDesc>
        The TalentLens logomark is a magnifying lens — direct visual metaphor
        for AI resume diagnosis. The indigo brand color conveys precision and
        trustworthiness. The wordmark uses Plus Jakarta Sans 800 for
        authority.
      </SectionDesc>

      {/* Logo Scale */}
      <Block>
        <Label>Logo Mark — Size Scale</Label>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 32,
            flexWrap: "wrap",
          }}
        >
          {sizes.map(({ px, label }) => (
            <div key={px} style={{ textAlign: "center" }}>
              <TLLogoMark size={px} />
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 10,
                  color: "var(--tl-n-500)",
                  marginTop: 8,
                }}
              >
                {px}px
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginTop: 2,
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </div>
      </Block>

      {/* Wordmark */}
      <Block>
        <Label>Wordmark — Weight Variants</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { weight: 800, label: "Extrabold — Primary wordmark" },
            { weight: 700, label: "Bold — Section headings" },
            { weight: 600, label: "Semibold — UI labels" },
          ].map(({ weight, label }) => (
            <div
              key={weight}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 28,
                  fontWeight: weight,
                  color: "var(--tl-brand-600)",
                  letterSpacing: "-0.02em",
                  minWidth: 200,
                }}
              >
                TalentLens
              </span>
              <span
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 11,
                  color: "var(--tl-n-400)",
                }}
              >
                weight {weight} · {label}
              </span>
            </div>
          ))}
        </div>
      </Block>

      {/* Brand on dark */}
      <Block style={{ background: "var(--tl-n-900)", borderColor: "transparent" }}>
        <Label style={{ color: "oklch(0.42 0.01 265)" }}>Reversed — Dark Context</Label>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <TLLogoMark size={40} />
          <span
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 22,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            TalentLens
          </span>
          <span
            style={{
              fontFamily: "var(--tl-mono)",
              fontSize: 11,
              color: "oklch(0.42 0.01 265)",
              marginLeft: 8,
            }}
          >
            Design System · v1.0
          </span>
        </div>
      </Block>
    </section>
  );
};

// ── COLOR SECTION ─────────────────────────────────────────────────────────────
const ColorSection = () => {
  const brandSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];
  const accentSteps = [50, 100, 300, 500, 600, 700];
  const neutralSteps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900];

  const severities = [
    {
      name: "High",
      prefix: "tl-high",
      steps: [50, 100, 200, 500, 700],
      label: "Error / Critical",
    },
    {
      name: "Medium",
      prefix: "tl-med",
      steps: [50, 100, 200, 500, 700],
      label: "Warning",
    },
    {
      name: "Low",
      prefix: "tl-low",
      steps: [50, 100, 200, 500, 600, 700],
      label: "Info / Pass",
    },
  ];

  const SwatchRow = ({ prefix, steps, label }) => (
    <div style={{ marginBottom: 24 }}>
      <Label style={{ marginBottom: 8 }}>{label}</Label>
      <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
        {steps.map((step) => (
          <div key={step} style={{ textAlign: "center" }}>
            <div
              style={{
                width: 52,
                height: 44,
                borderRadius: 8,
                background: `var(--${prefix}-${step})`,
                border:
                  step < 200
                    ? "1px solid var(--tl-border)"
                    : "1px solid transparent",
              }}
            />
            <div
              style={{
                fontFamily: "var(--tl-mono)",
                fontSize: 9,
                color: "var(--tl-n-500)",
                marginTop: 4,
              }}
            >
              {step}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section id="colors" style={{ paddingBottom: 72 }}>
      <SectionTitle>Color System</SectionTitle>
      <SectionDesc>
        All colors use the oklch color space for perceptual uniformity. The
        brand palette is indigo (hue 265), accent is teal (hue 192). Severity
        colors use red, amber, and green respectively.
      </SectionDesc>

      <Block>
        <SwatchRow
          prefix="tl-brand"
          steps={brandSteps}
          label="Brand — Indigo (h265)"
        />
        <SwatchRow
          prefix="tl-accent"
          steps={accentSteps}
          label="Accent — Teal (h192)"
        />
        <SwatchRow
          prefix="tl-n"
          steps={neutralSteps}
          label="Neutral — Warm gray"
        />
      </Block>

      <Block>
        <Label>Severity Palette</Label>
        {severities.map(({ name, prefix, steps, label }) => (
          <SwatchRow
            key={name}
            prefix={prefix}
            steps={steps}
            label={`${name} — ${label}`}
          />
        ))}
      </Block>

      <Block>
        <Label>Semantic Surface Tokens</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[
            { token: "--tl-surface", label: "Surface", note: "#ffffff" },
            { token: "--tl-bg", label: "Background", note: "n-50 warm" },
            { token: "--tl-border", label: "Border", note: "n-200" },
            { token: "--tl-border-strong", label: "Border Strong", note: "n-300" },
            { token: "--tl-text", label: "Text", note: "n-900" },
            { token: "--tl-text-muted", label: "Text Muted", note: "n-600" },
            { token: "--tl-text-subtle", label: "Text Subtle", note: "n-500" },
          ].map(({ token, label, note }) => (
            <div
              key={token}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: `var(${token})`,
                  border: "1px solid var(--tl-border-strong)",
                  flexShrink: 0,
                }}
              />
              <div>
                <div
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 12,
                    color: "var(--tl-n-700)",
                    fontWeight: 500,
                  }}
                >
                  {token}
                </div>
                <div
                  style={{
                    fontFamily: "var(--tl-font)",
                    fontSize: 11,
                    color: "var(--tl-n-400)",
                    marginTop: 1,
                  }}
                >
                  {label} · {note}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Block>
    </section>
  );
};

// ── TYPOGRAPHY SECTION ────────────────────────────────────────────────────────
const TypographySection = () => {
  const typeScale = [
    { label: "Display", size: 40, weight: 800, sample: "Resume Diagnosis" },
    { label: "H1", size: 32, weight: 800, sample: "ATS Compatibility Score" },
    { label: "H2", size: 24, weight: 700, sample: "Work Experience" },
    { label: "H3", size: 18, weight: 700, sample: "Issue Summary" },
    { label: "Body Large", size: 16, weight: 400, sample: "Six bullets describe responsibilities but do not show scope." },
    { label: "Body", size: 14, weight: 400, sample: "Managed weekly support operations and helped improve team workflow." },
    { label: "Caption", size: 12, weight: 400, sample: "Last updated · May 2026 · TalentLens v1.0" },
    { label: "Label / Overline", size: 10, weight: 700, sample: "SEVERITY · HIGH PRIORITY" },
  ];

  const monoScale = [
    { label: "Score Display", size: 48, sample: "72" },
    { label: "Data Medium", size: 20, sample: "84 / 100" },
    { label: "Code / Token", size: 13, sample: "--tl-brand-500" },
    { label: "Label Mono", size: 11, sample: "v1.0 · May 2026" },
  ];

  return (
    <section id="typography" style={{ paddingBottom: 72 }}>
      <SectionTitle>Typography</SectionTitle>
      <SectionDesc>
        Plus Jakarta Sans handles all prose, UI, and headings. JetBrains Mono
        is reserved for scores, data values, tokens, and version strings. The
        type scale steps 10–40px.
      </SectionDesc>

      <Block>
        <Label>Plus Jakarta Sans — Type Scale</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {typeScale.map(({ label, size, weight, sample }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                borderBottom: "1px solid var(--tl-border)",
                paddingBottom: 16,
              }}
            >
              <div style={{ width: 120, flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 9,
                    color: "var(--tl-n-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 9,
                    color: "var(--tl-n-300)",
                    marginTop: 2,
                  }}
                >
                  {size}px / w{weight}
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: size,
                  fontWeight: weight,
                  color: "var(--tl-text)",
                  lineHeight: 1.2,
                  letterSpacing: size >= 24 ? "-0.02em" : "normal",
                }}
              >
                {sample}
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block>
        <Label>JetBrains Mono — Data &amp; Scores</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {monoScale.map(({ label, size, sample }) => (
            <div
              key={label}
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 20,
                borderBottom: "1px solid var(--tl-border)",
                paddingBottom: 16,
              }}
            >
              <div style={{ width: 120, flexShrink: 0 }}>
                <div
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 9,
                    color: "var(--tl-n-400)",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 9,
                    color: "var(--tl-n-300)",
                    marginTop: 2,
                  }}
                >
                  {size}px
                </div>
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: size,
                  fontWeight: 500,
                  color: "var(--tl-brand-600)",
                  lineHeight: 1.1,
                }}
              >
                {sample}
              </div>
            </div>
          ))}
        </div>
      </Block>
    </section>
  );
};

// ── SPACING SECTION ───────────────────────────────────────────────────────────
const SpacingSection = () => {
  const spacingScale = [
    { token: "2", px: 2 },
    { token: "4", px: 4 },
    { token: "6", px: 6 },
    { token: "8", px: 8 },
    { token: "12", px: 12 },
    { token: "16", px: 16 },
    { token: "20", px: 20 },
    { token: "24", px: 24 },
    { token: "28", px: 28 },
    { token: "32", px: 32 },
    { token: "40", px: 40 },
    { token: "48", px: 48 },
    { token: "56", px: 56 },
    { token: "64", px: 64 },
    { token: "80", px: 80 },
  ];

  const shadowScale = [
    { name: "--tl-shadow-xs", label: "XS", note: "1px — Chip, tag" },
    { name: "--tl-shadow-sm", label: "SM", note: "2px — Card rest" },
    { name: "--tl-shadow-md", label: "MD", note: "4px — Dropdown, popover" },
    { name: "--tl-shadow-lg", label: "LG", note: "8px — Modal, dialog" },
  ];

  const radiusScale = [
    { value: 4, label: "XS — Chip, tag" },
    { value: 6, label: "SM — Button, badge" },
    { value: 10, label: "MD — Input, small card" },
    { value: 14, label: "LG — Main card" },
    { value: 20, label: "XL — Modal" },
    { value: 9999, label: "Full — Pill" },
  ];

  return (
    <section id="spacing" style={{ paddingBottom: 72 }}>
      <SectionTitle>Spacing &amp; Grid</SectionTitle>
      <SectionDesc>
        Spacing follows a base-4 scale. The main content area uses 56px
        horizontal padding with a 960px max-width. The sidebar is fixed at
        228px.
      </SectionDesc>

      <Block>
        <Label>Spacing Scale (base 4)</Label>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {spacingScale.map(({ token, px }) => (
            <div
              key={token}
              style={{ display: "flex", alignItems: "center", gap: 12 }}
            >
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  width: 28,
                  textAlign: "right",
                  flexShrink: 0,
                }}
              >
                {px}
              </div>
              <div
                style={{
                  height: 14,
                  width: px * 1.5,
                  background: "var(--tl-brand-400)",
                  borderRadius: 3,
                  minWidth: 2,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 10,
                  color: "var(--tl-n-500)",
                }}
              >
                {px}px
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block>
        <Label>Border Radius Scale</Label>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {radiusScale.map(({ value, label }) => (
            <div key={value} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: value > 100 ? 9999 : value,
                  background: "var(--tl-brand-100)",
                  border: "2px solid var(--tl-brand-300)",
                }}
              />
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 9,
                  color: "var(--tl-n-500)",
                  marginTop: 6,
                }}
              >
                {value > 100 ? "full" : `${value}px`}
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 9,
                  color: "var(--tl-n-400)",
                  marginTop: 1,
                }}
              >
                {label.split(" — ")[0]}
              </div>
            </div>
          ))}
        </div>
      </Block>

      <Block>
        <Label>Elevation &amp; Shadow</Label>
        <div style={{ display: "flex", gap: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
          {shadowScale.map(({ name, label, note }) => (
            <div key={name} style={{ textAlign: "center" }}>
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 12,
                  background: "white",
                  boxShadow: `var(${name})`,
                  marginBottom: 10,
                }}
              />
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 10,
                  color: "var(--tl-brand-600)",
                  fontWeight: 600,
                }}
              >
                {label}
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginTop: 2,
                }}
              >
                {note}
              </div>
            </div>
          ))}
        </div>
      </Block>
    </section>
  );
};
