// ── ds-components.jsx ────────────────────────────────────────────────────────
// UI Components: Buttons, Badges, Cards, Form Inputs
// Loaded by design-system.html via Babel standalone (UMD, no import/export)
// All hooks are available as globals: useState, useEffect, useRef

// ── BUTTON SECTION ────────────────────────────────────────────────────────────
const ButtonSection = () => {
  const [hovered, setHovered] = useState(null);

  const baseBtn = {
    fontFamily: "var(--tl-font)",
    fontWeight: 600,
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    transition: "opacity 0.12s, box-shadow 0.12s",
    letterSpacing: "-0.01em",
  };

  const variants = [
    {
      key: "primary",
      label: "Primary",
      style: {
        background: "var(--tl-brand-600)",
        color: "white",
        boxShadow: "var(--tl-shadow-sm)",
      },
      note: "Primary action — submit, analyze, continue",
    },
    {
      key: "secondary",
      label: "Secondary",
      style: {
        background: "white",
        color: "var(--tl-brand-600)",
        border: "1.5px solid var(--tl-brand-300)",
      },
      note: "Secondary action — cancel, back, skip",
    },
    {
      key: "ghost",
      label: "Ghost",
      style: {
        background: "transparent",
        color: "var(--tl-n-600)",
        border: "1.5px solid var(--tl-border)",
      },
      note: "Tertiary / low-emphasis actions",
    },
    {
      key: "danger",
      label: "Danger",
      style: {
        background: "var(--tl-high-500)",
        color: "white",
        boxShadow: "var(--tl-shadow-sm)",
      },
      note: "Destructive — delete, clear, reset",
    },
    {
      key: "success",
      label: "Success",
      style: {
        background: "var(--tl-low-600)",
        color: "white",
        boxShadow: "var(--tl-shadow-sm)",
      },
      note: "Affirmative — apply fix, export, download",
    },
  ];

  const sizes = [
    { key: "sm", label: "SM", padding: "6px 12px", fontSize: 12 },
    { key: "md", label: "MD", padding: "9px 18px", fontSize: 13 },
    { key: "lg", label: "LG", padding: "12px 24px", fontSize: 14 },
  ];

  return (
    <section id="buttons" style={{ paddingBottom: 72 }}>
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
        Buttons
      </h2>
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
        Five semantic variants across three sizes. Primary and Danger use
        filled backgrounds; Secondary and Ghost use outlined/transparent
        treatments. All use border-radius 8px and weight 600.
      </p>

      {/* Variants */}
      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          Variants
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {variants.map(({ key, label, style, note }) => (
            <div
              key={key}
              style={{ display: "flex", alignItems: "center", gap: 20 }}
            >
              <button
                style={{
                  ...baseBtn,
                  ...style,
                  padding: "9px 18px",
                  fontSize: 13,
                  minWidth: 120,
                  opacity: hovered === key ? 0.85 : 1,
                }}
                onMouseEnter={() => setHovered(key)}
                onMouseLeave={() => setHovered(null)}
              >
                {label}
              </button>
              <span
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 12,
                  color: "var(--tl-n-500)",
                }}
              >
                {note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sizes */}
      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          Size Scale
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {sizes.map(({ key, label, padding, fontSize }) => (
            <button
              key={key}
              style={{
                ...baseBtn,
                background: "var(--tl-brand-600)",
                color: "white",
                padding,
                fontSize,
                boxShadow: "var(--tl-shadow-sm)",
              }}
            >
              {label} · Analyze
            </button>
          ))}
        </div>
      </div>

      {/* States */}
      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          States
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <button
            style={{
              ...baseBtn,
              background: "var(--tl-brand-600)",
              color: "white",
              padding: "9px 18px",
              fontSize: 13,
            }}
          >
            Default
          </button>
          <button
            style={{
              ...baseBtn,
              background: "var(--tl-brand-700)",
              color: "white",
              padding: "9px 18px",
              fontSize: 13,
              boxShadow: "var(--tl-shadow-md)",
            }}
          >
            Hover
          </button>
          <button
            style={{
              ...baseBtn,
              background: "var(--tl-brand-800)",
              color: "white",
              padding: "9px 18px",
              fontSize: 13,
            }}
          >
            Active / Pressed
          </button>
          <button
            disabled
            style={{
              ...baseBtn,
              background: "var(--tl-n-200)",
              color: "var(--tl-n-400)",
              padding: "9px 18px",
              fontSize: 13,
              cursor: "not-allowed",
            }}
          >
            Disabled
          </button>
          <button
            style={{
              ...baseBtn,
              background: "var(--tl-brand-600)",
              color: "white",
              padding: "9px 18px",
              fontSize: 13,
              gap: 8,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{ animation: "tl-spin 1s linear infinite" }}
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="rgba(255,255,255,0.35)"
                strokeWidth="2"
              />
              <path
                d="M7 2 A5 5 0 0 1 12 7"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Loading…
          </button>
        </div>
      </div>
    </section>
  );
};

// ── BADGE SECTION ─────────────────────────────────────────────────────────────
const BadgeSection = () => {
  const badges = [
    {
      label: "High",
      bg: "var(--tl-high-50)",
      border: "var(--tl-high-200)",
      text: "var(--tl-high-700)",
      dot: "var(--tl-high-500)",
      note: "Critical issues — missing keywords, wrong format",
    },
    {
      label: "Medium",
      bg: "var(--tl-med-50)",
      border: "var(--tl-med-200)",
      text: "var(--tl-med-700)",
      dot: "var(--tl-med-500)",
      note: "Improvements — clarity, structure, phrasing",
    },
    {
      label: "Low",
      bg: "var(--tl-low-50)",
      border: "var(--tl-low-200)",
      text: "var(--tl-low-700)",
      dot: "var(--tl-low-500)",
      note: "Minor polish — formatting, length, style",
    },
    {
      label: "Brand",
      bg: "var(--tl-brand-50)",
      border: "var(--tl-brand-200)",
      text: "var(--tl-brand-700)",
      dot: "var(--tl-brand-500)",
      note: "Feature labels, version tags",
    },
    {
      label: "Neutral",
      bg: "var(--tl-n-100)",
      border: "var(--tl-n-300)",
      text: "var(--tl-n-600)",
      dot: "var(--tl-n-400)",
      note: "Category labels, metadata",
    },
  ];

  const Badge = ({ label, bg, border, text, dot }) => (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 9999,
        padding: "3px 10px 3px 7px",
        fontFamily: "var(--tl-font)",
        fontSize: 11,
        fontWeight: 600,
        color: text,
        letterSpacing: "0.01em",
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: dot,
          flexShrink: 0,
        }}
      />
      {label}
    </span>
  );

  return (
    <section id="badges" style={{ paddingBottom: 72 }}>
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
        Badges &amp; Tags
      </h2>
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
        Severity badges use a colored dot + semantic background tint. The pill
        shape (border-radius 9999) distinguishes them from rectangular card
        labels. All badges use weight 600 at 11px.
      </p>

      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          Severity Badges
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {badges.map(({ label, bg, border, text, dot, note }) => (
            <div
              key={label}
              style={{ display: "flex", alignItems: "center", gap: 16 }}
            >
              <Badge label={label} bg={bg} border={border} text={text} dot={dot} />
              <span
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 12,
                  color: "var(--tl-n-500)",
                }}
              >
                {note}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* In context */}
      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          In Context — Issue Card Header
        </div>
        <div
          style={{
            background: "var(--tl-n-50)",
            border: "1px solid var(--tl-border)",
            borderRadius: 10,
            padding: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "var(--tl-font)",
                fontWeight: 700,
                fontSize: 14,
                color: "var(--tl-n-900)",
              }}
            >
              Missing quantified achievements
            </div>
            <div
              style={{
                fontFamily: "var(--tl-font)",
                fontSize: 12,
                color: "var(--tl-n-500)",
                marginTop: 4,
              }}
            >
              Work Experience · Product Operations Manager
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Badge
              label="High"
              bg="var(--tl-high-50)"
              border="var(--tl-high-200)"
              text="var(--tl-high-700)"
              dot="var(--tl-high-500)"
            />
            <Badge
              label="Content Clarity"
              bg="var(--tl-n-100)"
              border="var(--tl-n-300)"
              text="var(--tl-n-600)"
              dot="var(--tl-n-400)"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

// ── CARD SECTION ──────────────────────────────────────────────────────────────
const CardSection = () => {
  return (
    <section id="cards" style={{ paddingBottom: 72 }}>
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
        Cards
      </h2>
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
        Cards are the primary content container. Issue cards use a 4px
        left-border for instant severity scanning. Stat cards display
        monospace data values. All use border-radius 14px with a 1px border
        and tl-shadow-sm.
      </p>

      {/* Base card */}
      <div
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--tl-n-400)",
          marginBottom: 12,
        }}
      >
        Card Variants
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
        {/* Plain card */}
        <div
          style={{
            background: "var(--tl-surface)",
            border: "1px solid var(--tl-border)",
            borderRadius: 14,
            padding: 24,
            boxShadow: "var(--tl-shadow-sm)",
          }}
        >
          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontWeight: 700,
              fontSize: 14,
              color: "var(--tl-n-900)",
              marginBottom: 6,
            }}
          >
            Base Card
          </div>
          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 13,
              color: "var(--tl-text-muted)",
              lineHeight: 1.6,
            }}
          >
            Default container — white surface, 1px border, shadow-sm, 14px
            radius. Used for report sections and grouping related content.
          </div>
        </div>

        {/* Severity issue cards */}
        {[
          {
            sev: "High",
            border: "var(--tl-high-500)",
            bg: "var(--tl-high-50)",
            title: "Missing quantified achievements",
          },
          {
            sev: "Medium",
            border: "var(--tl-med-500)",
            bg: "var(--tl-med-50)",
            title: "Skills section lacks target-role keywords",
          },
          {
            sev: "Low",
            border: "var(--tl-low-500)",
            bg: "var(--tl-low-50)",
            title: "No recruiter-facing summary",
          },
        ].map(({ sev, border, bg, title }) => (
          <div
            key={sev}
            style={{
              background: "var(--tl-surface)",
              border: "1px solid var(--tl-border)",
              borderLeft: `4px solid ${border}`,
              borderRadius: 14,
              padding: 20,
              boxShadow: "var(--tl-shadow-xs)",
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: bg,
                border: `1px solid ${border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: "50%",
                  background: border,
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontWeight: 700,
                  fontSize: 13,
                  color: "var(--tl-n-900)",
                }}
              >
                {title}
              </div>
              <div
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginTop: 3,
                }}
              >
                Severity · {sev.toUpperCase()} · 4px left-border pattern
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Stat cards */}
      <div
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: "0.09em",
          textTransform: "uppercase",
          color: "var(--tl-n-400)",
          marginBottom: 12,
        }}
      >
        Stat Cards
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { label: "ATS Score", value: "72", unit: "/ 100", color: "var(--tl-brand-500)" },
          { label: "Issues Found", value: "8", unit: "total", color: "var(--tl-high-500)" },
          { label: "Est. After Fix", value: "91", unit: "/ 100", color: "var(--tl-low-600)" },
        ].map(({ label, value, unit, color }) => (
          <div
            key={label}
            style={{
              background: "var(--tl-surface)",
              border: "1px solid var(--tl-border)",
              borderRadius: 14,
              padding: 20,
              boxShadow: "var(--tl-shadow-sm)",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "var(--tl-font)",
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "var(--tl-n-400)",
                marginBottom: 8,
              }}
            >
              {label}
            </div>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 4 }}>
              <span
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 36,
                  fontWeight: 600,
                  color,
                  lineHeight: 1,
                }}
              >
                {value}
              </span>
              <span
                style={{
                  fontFamily: "var(--tl-mono)",
                  fontSize: 12,
                  color: "var(--tl-n-400)",
                }}
              >
                {unit}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

// ── INPUT SECTION ─────────────────────────────────────────────────────────────
const InputSection = () => {
  const [textValue, setTextValue] = useState("");
  const [selectValue, setSelectValue] = useState("product-operations");

  const inputBase = {
    fontFamily: "var(--tl-font)",
    fontSize: 13,
    color: "var(--tl-text)",
    background: "var(--tl-surface)",
    border: "1.5px solid var(--tl-border-strong)",
    borderRadius: 8,
    padding: "9px 12px",
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  };

  const labelStyle = {
    fontFamily: "var(--tl-font)",
    fontSize: 12,
    fontWeight: 600,
    color: "var(--tl-n-700)",
    marginBottom: 6,
    display: "block",
  };

  return (
    <section id="inputs" style={{ paddingBottom: 72 }}>
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
        Form Controls
      </h2>
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
        Input fields, selects, checkboxes, and textareas. All use border-radius
        8px, 1.5px border with border-strong color, and transition to
        brand-300 on focus.
      </p>

      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
          marginBottom: 24,
          display: "flex",
          flexDirection: "column",
          gap: 20,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 4,
          }}
        >
          Input Types
        </div>

        {/* Text input */}
        <div>
          <label style={labelStyle}>Job Title</label>
          <input
            type="text"
            placeholder="e.g. Product Operations Manager"
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            style={inputBase}
          />
        </div>

        {/* Select */}
        <div>
          <label style={labelStyle}>Target Role Category</label>
          <select
            value={selectValue}
            onChange={(e) => setSelectValue(e.target.value)}
            style={{ ...inputBase, appearance: "none" }}
          >
            <option value="product-operations">Product Operations</option>
            <option value="product-management">Product Management</option>
            <option value="engineering">Engineering</option>
            <option value="design">Design</option>
          </select>
        </div>

        {/* Textarea */}
        <div>
          <label style={labelStyle}>Job Description (paste here)</label>
          <textarea
            placeholder="Paste the target job description to unlock keyword matching…"
            rows={4}
            style={{ ...inputBase, resize: "vertical", lineHeight: 1.6 }}
          />
        </div>

        {/* Checkboxes */}
        <div>
          <label style={{ ...labelStyle, marginBottom: 10 }}>
            Export Options
          </label>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {[
              "Include original vs. rewritten comparison",
              "Show ATS check results",
              "Show score breakdown by section",
            ].map((opt) => (
              <label
                key={opt}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  fontFamily: "var(--tl-font)",
                  fontSize: 13,
                  color: "var(--tl-n-700)",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  defaultChecked={opt.includes("ATS")}
                  style={{ accentColor: "var(--tl-brand-500)", width: 14, height: 14 }}
                />
                {opt}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Input states */}
      <div
        style={{
          background: "var(--tl-surface)",
          border: "1px solid var(--tl-border)",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 20,
          }}
        >
          States
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginBottom: 4,
                }}
              >
                Default
              </div>
              <input
                type="text"
                placeholder="Placeholder text"
                style={inputBase}
                readOnly
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginBottom: 4,
                }}
              >
                Focused
              </div>
              <input
                type="text"
                defaultValue="Resume fix workspace"
                style={{
                  ...inputBase,
                  borderColor: "var(--tl-brand-400)",
                  boxShadow: "0 0 0 3px var(--tl-brand-100)",
                }}
                readOnly
              />
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginBottom: 4,
                }}
              >
                Error
              </div>
              <input
                type="text"
                defaultValue="invalid-email"
                style={{
                  ...inputBase,
                  borderColor: "var(--tl-high-500)",
                  boxShadow: "0 0 0 3px var(--tl-high-100)",
                }}
                readOnly
              />
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 10,
                  color: "var(--tl-n-400)",
                  marginBottom: 4,
                }}
              >
                Disabled
              </div>
              <input
                type="text"
                defaultValue="Not available"
                disabled
                style={{
                  ...inputBase,
                  background: "var(--tl-n-100)",
                  color: "var(--tl-n-400)",
                  cursor: "not-allowed",
                }}
                readOnly
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
