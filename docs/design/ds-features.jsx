// ── ds-features.jsx ──────────────────────────────────────────────────────────
// Feature Components: Score, Upload, Issue, ATS, Header, and Resume Fix stubs
// Loaded by design-system.html via Babel standalone (UMD, no import/export)
// All hooks are available as globals: useState, useEffect, useRef

// ResumeFixTask: turns an IssueItem into an actionable task.
// RewriteSuggestion: shows AI-generated alternative wording.
// BeforeAfterDiff: compares original and revised resume text.
// FixProgressPanel: tracks handled issues, score estimate, and export readiness.
// JobMatchPreview: previews the future JD matching workflow.

const resumeFixIssues = [
  {
    id: "issue-quantified-impact",
    priority: 1,
    severity: "high",
    category: "Content Clarity",
    title: "Missing quantified achievements",
    affectedSection: "Work Experience · Product Operations Manager",
    reason: "Six bullets describe responsibilities but do not show scope, outcome, or measurable business impact.",
    originalText: "Managed weekly support operations and helped improve team workflow.",
    suggestions: [
      { id: "rewrite-impact", label: "Outcome-driven", text: "Led weekly support operations for a 9-person team, reducing unresolved ticket backlog by 23% over one quarter." },
      { id: "rewrite-ats", label: "ATS-friendly", text: "Managed support operations, workflow optimization, ticket triage, and cross-functional process improvements for a 9-person team." }
    ],
    status: "open"
  },
  {
    id: "issue-keyword-gap",
    priority: 2,
    severity: "medium",
    category: "Keywords",
    title: "Skills section lacks target-role keywords",
    affectedSection: "Skills",
    reason: "The skills list misses common product operations terms used in target roles.",
    originalText: "Operations, reporting, communication, support.",
    suggestions: [
      { id: "rewrite-keywords", label: "Role-aligned", text: "Product operations, ticket triage, workflow automation, KPI reporting, stakeholder communication, process improvement." }
    ],
    status: "open"
  },
  {
    id: "issue-summary",
    priority: 3,
    severity: "low",
    category: "Missing Sections",
    title: "No recruiter-facing summary",
    affectedSection: "Top of resume",
    reason: "The resume starts with work history and does not quickly frame role, domain, and value.",
    originalText: "",
    suggestions: [
      { id: "rewrite-summary", label: "Concise summary", text: "Product operations specialist with 5 years of experience improving support workflows, reporting systems, and cross-functional execution for SaaS teams." }
    ],
    status: "open"
  }
];

// ── SHARED HELPERS (local to features) ───────────────────────────────────────

const FeatSectionTitle = ({ children }) => (
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

const FeatSectionDesc = ({ children }) => (
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

const FeatBlock = ({ children, style }) => (
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

const FeatLabel = ({ children }) => (
  <div
    style={{
      fontFamily: "var(--tl-font)",
      fontSize: 10,
      fontWeight: 700,
      letterSpacing: "0.09em",
      textTransform: "uppercase",
      color: "var(--tl-n-400)",
      marginBottom: 16,
    }}
  >
    {children}
  </div>
);

// ── SCORE SECTION ─────────────────────────────────────────────────────────────
const ScoreSection = () => {
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setAnimated(true), 100);
    return () => clearTimeout(t);
  }, []);

  const score = 72;
  const size = 180;
  const strokeW = 14;
  const r = (size - strokeW) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  // Arc goes from 210° to 330° (270° sweep = 75% of circle as the track)
  // We use a simpler approach: full circle with stroke-dashoffset
  const fillRatio = animated ? score / 100 : 0;
  const dashOffset = circumference * (1 - fillRatio);

  const scoreColor =
    score >= 80
      ? "var(--tl-low-500)"
      : score >= 60
      ? "var(--tl-med-500)"
      : "var(--tl-high-500)";

  const variants = [
    { score: 91, label: "Excellent", color: "var(--tl-low-500)" },
    { score: 72, label: "Fair", color: "var(--tl-med-500)" },
    { score: 44, label: "Needs Work", color: "var(--tl-high-500)" },
  ];

  const MiniRing = ({ score: s, label, color }) => {
    const miniSize = 80;
    const miniSW = 7;
    const miniR = (miniSize - miniSW) / 2;
    const miniC = 2 * Math.PI * miniR;
    const miniOffset = miniC * (1 - s / 100);
    return (
      <div style={{ textAlign: "center" }}>
        <svg width={miniSize} height={miniSize} viewBox={`0 0 ${miniSize} ${miniSize}`}>
          <circle
            cx={miniSize / 2}
            cy={miniSize / 2}
            r={miniR}
            stroke="var(--tl-n-200)"
            strokeWidth={miniSW}
            fill="none"
          />
          <circle
            cx={miniSize / 2}
            cy={miniSize / 2}
            r={miniR}
            stroke={color}
            strokeWidth={miniSW}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={miniC}
            strokeDashoffset={animated ? miniOffset : miniC}
            style={{
              transition: "stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)",
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
          <text
            x={miniSize / 2}
            y={miniSize / 2 + 5}
            textAnchor="middle"
            fontFamily="var(--tl-mono)"
            fontSize="14"
            fontWeight="600"
            fill={color}
          >
            {s}
          </text>
        </svg>
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 11,
            color: "var(--tl-n-500)",
            marginTop: 4,
          }}
        >
          {label}
        </div>
      </div>
    );
  };

  return (
    <section id="score" style={{ paddingBottom: 72 }}>
      <FeatSectionTitle>Score Display</FeatSectionTitle>
      <FeatSectionDesc>
        An animated SVG ring fills from 0 on mount. Score color is semantic:
        green for 80+, amber for 60–79, red below 60. The JetBrains Mono
        numeral sits in the ring center. Three size variants are shown.
      </FeatSectionDesc>

      <FeatBlock>
        <FeatLabel>Primary Score Ring — 72 / 100</FeatLabel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 48,
            flexWrap: "wrap",
          }}
        >
          {/* Main ring */}
          <div style={{ position: "relative", width: size, height: size }}>
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
              {/* Track */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                stroke="var(--tl-n-200)"
                strokeWidth={strokeW}
                fill="none"
              />
              {/* Fill */}
              <circle
                cx={cx}
                cy={cy}
                r={r}
                stroke={scoreColor}
                strokeWidth={strokeW}
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{
                  transition: "stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)",
                  transformOrigin: "center",
                  transform: "rotate(-90deg)",
                }}
              />
              {/* Score numeral */}
              <text
                x={cx}
                y={cy - 6}
                textAnchor="middle"
                fontFamily="var(--tl-mono)"
                fontSize="42"
                fontWeight="600"
                fill={scoreColor}
              >
                {score}
              </text>
              <text
                x={cx}
                y={cy + 18}
                textAnchor="middle"
                fontFamily="var(--tl-font)"
                fontSize="11"
                fontWeight="600"
                fill="var(--tl-n-400)"
                letterSpacing="0.06em"
              >
                ATS SCORE
              </text>
            </svg>
          </div>

          {/* Metadata */}
          <div>
            <div
              style={{
                fontFamily: "var(--tl-font)",
                fontSize: 13,
                color: "var(--tl-n-600)",
                lineHeight: 1.7,
                maxWidth: 280,
              }}
            >
              <strong style={{ color: "var(--tl-n-900)" }}>72 / 100</strong> — Fair.
              The resume passes basic ATS parsing but has 3 issues that reduce
              its match rate. Estimated score after fixes: <strong style={{ color: "var(--tl-low-600)" }}>91</strong>.
            </div>
            <div
              style={{
                marginTop: 16,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {[
                { label: "Keywords", pct: 58, color: "var(--tl-high-500)" },
                { label: "Format", pct: 88, color: "var(--tl-low-500)" },
                { label: "Content", pct: 70, color: "var(--tl-med-500)" },
              ].map(({ label, pct, color }) => (
                <div key={label}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: 3,
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "var(--tl-font)",
                        fontSize: 11,
                        color: "var(--tl-n-600)",
                      }}
                    >
                      {label}
                    </span>
                    <span
                      style={{
                        fontFamily: "var(--tl-mono)",
                        fontSize: 11,
                        color,
                      }}
                    >
                      {pct}%
                    </span>
                  </div>
                  <div
                    style={{
                      height: 5,
                      background: "var(--tl-n-200)",
                      borderRadius: 9999,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: animated ? `${pct}%` : "0%",
                        background: color,
                        borderRadius: 9999,
                        transition: "width 1s cubic-bezier(0.4,0,0.2,1) 0.3s",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </FeatBlock>

      <FeatBlock>
        <FeatLabel>Score Variants — Semantic Color Scale</FeatLabel>
        <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
          {variants.map((v) => (
            <MiniRing key={v.score} {...v} />
          ))}
        </div>
      </FeatBlock>
    </section>
  );
};

// ── UPLOAD SECTION ────────────────────────────────────────────────────────────
const UploadSection = () => {
  const [uploadState, setUploadState] = useState("idle");

  const states = ["idle", "dragging", "uploading", "success", "error"];

  const stateConfig = {
    idle: {
      border: "var(--tl-border-strong)",
      bg: "var(--tl-surface)",
      iconColor: "var(--tl-n-300)",
      label: "Drop your resume here",
      sub: "PDF · DOCX · TXT · up to 5MB",
      btnLabel: "Choose File",
    },
    dragging: {
      border: "var(--tl-brand-400)",
      bg: "var(--tl-brand-50)",
      iconColor: "var(--tl-brand-400)",
      label: "Release to upload",
      sub: "Looks good — drop it!",
      btnLabel: null,
    },
    uploading: {
      border: "var(--tl-brand-300)",
      bg: "var(--tl-n-50)",
      iconColor: "var(--tl-brand-500)",
      label: "Uploading…",
      sub: "resume_v3_final.pdf · 142 KB",
      btnLabel: null,
    },
    success: {
      border: "var(--tl-low-500)",
      bg: "var(--tl-low-50)",
      iconColor: "var(--tl-low-500)",
      label: "Resume uploaded",
      sub: "resume_v3_final.pdf · 142 KB · Ready to analyze",
      btnLabel: "Analyze Resume",
    },
    error: {
      border: "var(--tl-high-500)",
      bg: "var(--tl-high-50)",
      iconColor: "var(--tl-high-500)",
      label: "Upload failed",
      sub: "File exceeds 5MB limit. Please try a smaller file.",
      btnLabel: "Try Again",
    },
  };

  const cfg = stateConfig[uploadState];

  return (
    <section id="upload" style={{ paddingBottom: 72 }}>
      <FeatSectionTitle>Upload Zone</FeatSectionTitle>
      <FeatSectionDesc>
        Five interaction states: idle, dragging, uploading, success, and
        error. The border color, background tint, and icon color shift
        semantically with each state. Click the state pills below to preview.
      </FeatSectionDesc>

      {/* State switcher */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, flexWrap: "wrap" }}>
        {states.map((s) => (
          <button
            key={s}
            onClick={() => setUploadState(s)}
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 11,
              fontWeight: 600,
              padding: "4px 12px",
              borderRadius: 9999,
              border: `1px solid ${uploadState === s ? "var(--tl-brand-400)" : "var(--tl-border)"}`,
              background:
                uploadState === s ? "var(--tl-brand-50)" : "var(--tl-surface)",
              color:
                uploadState === s ? "var(--tl-brand-700)" : "var(--tl-n-500)",
              cursor: "pointer",
              textTransform: "capitalize",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <FeatBlock>
        <FeatLabel>Upload Zone — State: {uploadState}</FeatLabel>
        {/* Drop area */}
        <div
          style={{
            border: `2px dashed ${cfg.border}`,
            borderRadius: 14,
            background: cfg.bg,
            padding: "48px 32px",
            textAlign: "center",
            transition: "all 0.18s ease",
          }}
        >
          {/* Icon */}
          <div style={{ marginBottom: 16, display: "flex", justifyContent: "center" }}>
            {uploadState === "uploading" ? (
              <svg
                width="40"
                height="40"
                viewBox="0 0 40 40"
                fill="none"
                style={{ animation: "tl-spin 1s linear infinite" }}
              >
                <circle
                  cx="20"
                  cy="20"
                  r="16"
                  stroke="var(--tl-n-200)"
                  strokeWidth="4"
                />
                <path
                  d="M20 4 A16 16 0 0 1 36 20"
                  stroke={cfg.iconColor}
                  strokeWidth="4"
                  strokeLinecap="round"
                />
              </svg>
            ) : uploadState === "success" ? (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="var(--tl-low-100)" />
                <path
                  d="M12 20 L18 26 L28 14"
                  stroke={cfg.iconColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            ) : uploadState === "error" ? (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="20" r="18" fill="var(--tl-high-100)" />
                <path
                  d="M14 14 L26 26 M26 14 L14 26"
                  stroke={cfg.iconColor}
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect
                  x="8"
                  y="10"
                  width="24"
                  height="28"
                  rx="4"
                  stroke={cfg.iconColor}
                  strokeWidth="2.5"
                  fill="none"
                />
                <path
                  d="M20 26 L20 18 M16 22 L20 18 L24 22"
                  stroke={cfg.iconColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 14 L20 8 L26 14"
                  stroke={cfg.iconColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            )}
          </div>

          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--tl-n-800)",
              marginBottom: 6,
            }}
          >
            {cfg.label}
          </div>
          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 12,
              color: "var(--tl-n-500)",
              marginBottom: 20,
            }}
          >
            {cfg.sub}
          </div>

          {cfg.btnLabel && (
            <button
              style={{
                fontFamily: "var(--tl-font)",
                fontSize: 13,
                fontWeight: 600,
                padding: "9px 20px",
                borderRadius: 8,
                border: "none",
                background:
                  uploadState === "success"
                    ? "var(--tl-low-600)"
                    : uploadState === "error"
                    ? "var(--tl-high-500)"
                    : "var(--tl-brand-600)",
                color: "white",
                cursor: "pointer",
                boxShadow: "var(--tl-shadow-sm)",
              }}
            >
              {cfg.btnLabel}
            </button>
          )}
        </div>
      </FeatBlock>
    </section>
  );
};

// ── ISSUE SECTION ─────────────────────────────────────────────────────────────
const IssueSection = () => {
  const [expanded, setExpanded] = useState("issue-quantified-impact");

  const sevConfig = {
    high: {
      border: "var(--tl-high-500)",
      bg: "var(--tl-high-50)",
      text: "var(--tl-high-700)",
      dot: "var(--tl-high-500)",
      badgeBorder: "var(--tl-high-200)",
      label: "High",
    },
    medium: {
      border: "var(--tl-med-500)",
      bg: "var(--tl-med-50)",
      text: "var(--tl-med-700)",
      dot: "var(--tl-med-500)",
      badgeBorder: "var(--tl-med-200)",
      label: "Medium",
    },
    low: {
      border: "var(--tl-low-500)",
      bg: "var(--tl-low-50)",
      text: "var(--tl-low-700)",
      dot: "var(--tl-low-500)",
      badgeBorder: "var(--tl-low-200)",
      label: "Low",
    },
  };

  return (
    <section id="issues" style={{ paddingBottom: 72 }}>
      <FeatSectionTitle>Issue Item</FeatSectionTitle>
      <FeatSectionDesc>
        Each issue uses a 4px left-border for at-a-glance severity. Clicking
        expands to reveal the reason, original text, and rewrite suggestions.
        Data comes from the resumeFixIssues sample array defined in this file.
      </FeatSectionDesc>

      <FeatBlock>
        <FeatLabel>Issue Cards — {resumeFixIssues.length} Issues</FeatLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {resumeFixIssues.map((issue) => {
            const sev = sevConfig[issue.severity];
            const isOpen = expanded === issue.id;
            return (
              <div
                key={issue.id}
                style={{
                  border: "1px solid var(--tl-border)",
                  borderLeft: `4px solid ${sev.border}`,
                  borderRadius: 12,
                  background: "var(--tl-surface)",
                  overflow: "hidden",
                  boxShadow: "var(--tl-shadow-xs)",
                }}
              >
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : issue.id)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    width: "100%",
                    padding: "14px 18px",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {/* Priority */}
                  <div
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: 6,
                      background: sev.bg,
                      border: `1px solid ${sev.badgeBorder}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      fontFamily: "var(--tl-mono)",
                      fontSize: 10,
                      fontWeight: 700,
                      color: sev.text,
                    }}
                  >
                    {issue.priority}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontFamily: "var(--tl-font)",
                        fontWeight: 700,
                        fontSize: 13,
                        color: "var(--tl-n-900)",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {issue.title}
                    </div>
                    <div
                      style={{
                        fontFamily: "var(--tl-font)",
                        fontSize: 11,
                        color: "var(--tl-n-500)",
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {issue.affectedSection}
                    </div>
                  </div>

                  {/* Badge */}
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 5,
                      background: sev.bg,
                      border: `1px solid ${sev.badgeBorder}`,
                      borderRadius: 9999,
                      padding: "2px 9px 2px 6px",
                      fontFamily: "var(--tl-font)",
                      fontSize: 10,
                      fontWeight: 700,
                      color: sev.text,
                      flexShrink: 0,
                    }}
                  >
                    <span
                      style={{
                        width: 5,
                        height: 5,
                        borderRadius: "50%",
                        background: sev.dot,
                      }}
                    />
                    {sev.label}
                  </span>

                  {/* Chevron */}
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 14 14"
                    fill="none"
                    style={{
                      flexShrink: 0,
                      transition: "transform 0.15s",
                      transform: isOpen ? "rotate(180deg)" : "none",
                    }}
                  >
                    <path
                      d="M3 5 L7 9 L11 5"
                      stroke="var(--tl-n-400)"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Expanded body */}
                {isOpen && (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      borderTop: "1px solid var(--tl-border)",
                    }}
                  >
                    {/* Reason */}
                    <div
                      style={{
                        paddingTop: 14,
                        fontFamily: "var(--tl-font)",
                        fontSize: 13,
                        color: "var(--tl-n-600)",
                        lineHeight: 1.65,
                        marginBottom: 14,
                      }}
                    >
                      {issue.reason}
                    </div>

                    {/* Original text */}
                    {issue.originalText && (
                      <div
                        style={{
                          background: "var(--tl-n-50)",
                          border: "1px solid var(--tl-border)",
                          borderRadius: 8,
                          padding: "10px 14px",
                          fontFamily: "var(--tl-mono)",
                          fontSize: 12,
                          color: "var(--tl-n-600)",
                          lineHeight: 1.6,
                          marginBottom: 14,
                        }}
                      >
                        <span
                          style={{
                            fontFamily: "var(--tl-font)",
                            fontSize: 9,
                            fontWeight: 700,
                            letterSpacing: "0.07em",
                            textTransform: "uppercase",
                            color: "var(--tl-n-400)",
                            display: "block",
                            marginBottom: 6,
                          }}
                        >
                          Original
                        </span>
                        {issue.originalText}
                      </div>
                    )}

                    {/* Suggestions */}
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
                      Suggestions
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {issue.suggestions.map((sug) => (
                        <div
                          key={sug.id}
                          style={{
                            background: "var(--tl-brand-50)",
                            border: "1px solid var(--tl-brand-200)",
                            borderRadius: 8,
                            padding: "10px 14px",
                          }}
                        >
                          <div
                            style={{
                              fontFamily: "var(--tl-font)",
                              fontSize: 10,
                              fontWeight: 700,
                              color: "var(--tl-brand-600)",
                              marginBottom: 4,
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                            }}
                          >
                            {sug.label}
                          </div>
                          <div
                            style={{
                              fontFamily: "var(--tl-font)",
                              fontSize: 13,
                              color: "var(--tl-n-700)",
                              lineHeight: 1.6,
                            }}
                          >
                            {sug.text}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FeatBlock>
    </section>
  );
};

// ── ATS SECTION ───────────────────────────────────────────────────────────────
const ATSSection = () => {
  const checks = [
    { id: "parsing", label: "File parsed successfully", status: "pass", note: "PDF text extraction — no scan/image pages detected" },
    { id: "contact", label: "Contact information present", status: "pass", note: "Name, email, LinkedIn, location found" },
    { id: "sections", label: "Standard section headers", status: "pass", note: "Experience, Education, Skills — recognized by common ATS" },
    { id: "keywords", label: "Target-role keyword density", status: "fail", note: "Skills section missing: product operations, workflow automation, KPI reporting" },
    { id: "formatting", label: "Consistent date formatting", status: "warn", note: "Mix of 'Jan 2022' and '2022-01' formats found in experience section" },
    { id: "bullets", label: "Bullet point structure", status: "pass", note: "All bullets start with action verbs — good ATS readability" },
    { id: "length", label: "Resume length", status: "warn", note: "2.1 pages — consider trimming to 2 pages for senior roles" },
    { id: "fonts", label: "Font compatibility", status: "pass", note: "Standard serif/sans — no embedded non-standard fonts detected" },
  ];

  const statusConfig = {
    pass: {
      icon: "✓",
      bg: "var(--tl-low-50)",
      border: "var(--tl-low-200)",
      iconBg: "var(--tl-low-500)",
      text: "var(--tl-low-700)",
      label: "Pass",
    },
    fail: {
      icon: "✕",
      bg: "var(--tl-high-50)",
      border: "var(--tl-high-200)",
      iconBg: "var(--tl-high-500)",
      text: "var(--tl-high-700)",
      label: "Fail",
    },
    warn: {
      icon: "!",
      bg: "var(--tl-med-50)",
      border: "var(--tl-med-200)",
      iconBg: "var(--tl-med-500)",
      text: "var(--tl-med-700)",
      label: "Warn",
    },
  };

  const counts = checks.reduce(
    (acc, c) => ({ ...acc, [c.status]: (acc[c.status] || 0) + 1 }),
    {}
  );

  return (
    <section id="ats" style={{ paddingBottom: 72 }}>
      <FeatSectionTitle>ATS Checks</FeatSectionTitle>
      <FeatSectionDesc>
        Each ATS check shows a Pass / Warn / Fail status with a colored icon
        container. The note provides human-readable context. Checks are
        grouped in a card with a summary count row at the top.
      </FeatSectionDesc>

      <FeatBlock>
        {/* Summary row */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 20,
            flexWrap: "wrap",
          }}
        >
          {Object.entries(statusConfig).map(([key, cfg]) => (
            <div
              key={key}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: cfg.bg,
                border: `1px solid ${cfg.border}`,
                borderRadius: 8,
                padding: "6px 14px",
              }}
            >
              <span
                style={{
                  width: 18,
                  height: 18,
                  borderRadius: 5,
                  background: cfg.iconBg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontSize: 10,
                  fontWeight: 800,
                  fontFamily: "var(--tl-mono)",
                }}
              >
                {cfg.icon}
              </span>
              <span
                style={{
                  fontFamily: "var(--tl-font)",
                  fontSize: 12,
                  fontWeight: 700,
                  color: cfg.text,
                }}
              >
                {counts[key] || 0} {cfg.label}
              </span>
            </div>
          ))}
        </div>

        <FeatLabel>Check Results</FeatLabel>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {checks.map((check) => {
            const cfg = statusConfig[check.status];
            return (
              <div
                key={check.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 12,
                  padding: "10px 14px",
                  background: cfg.bg,
                  border: `1px solid ${cfg.border}`,
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 6,
                    background: cfg.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 11,
                    fontWeight: 800,
                    fontFamily: "var(--tl-mono)",
                    flexShrink: 0,
                    marginTop: 1,
                  }}
                >
                  {cfg.icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontFamily: "var(--tl-font)",
                      fontWeight: 700,
                      fontSize: 13,
                      color: "var(--tl-n-900)",
                      marginBottom: 2,
                    }}
                  >
                    {check.label}
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--tl-font)",
                      fontSize: 12,
                      color: "var(--tl-n-600)",
                      lineHeight: 1.5,
                    }}
                  >
                    {check.note}
                  </div>
                </div>
                <span
                  style={{
                    fontFamily: "var(--tl-mono)",
                    fontSize: 9,
                    fontWeight: 700,
                    color: cfg.text,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    flexShrink: 0,
                    marginTop: 3,
                  }}
                >
                  {cfg.label}
                </span>
              </div>
            );
          })}
        </div>
      </FeatBlock>
    </section>
  );
};

// ── HEADER SECTION ────────────────────────────────────────────────────────────
const HeaderSection = () => {
  return (
    <section id="header" style={{ paddingBottom: 72 }}>
      <FeatSectionTitle>Page Header</FeatSectionTitle>
      <FeatSectionDesc>
        The TalentLens page header shows the logomark + wordmark, a
        breadcrumb trail, and a sticky topbar with blur/glass treatment. Two
        patterns are shown: the app shell topbar and a full-bleed page hero
        header.
      </FeatSectionDesc>

      {/* App Shell Topbar replica */}
      <FeatBlock style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            padding: "16px 20px 0",
          }}
        >
          App Shell Topbar — Sticky / Blur
        </div>
        <div
          style={{
            background: "rgba(255,255,255,0.92)",
            backdropFilter: "blur(12px)",
            borderBottom: "1px solid var(--tl-border)",
            padding: "0 24px",
            height: 52,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            margin: "12px 0 0",
          }}
        >
          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 13,
              color: "var(--tl-n-500)",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <span>TalentLens DS</span>
            <span style={{ color: "var(--tl-n-300)" }}>›</span>
            <span>Feature Components</span>
            <span style={{ color: "var(--tl-n-300)" }}>›</span>
            <span style={{ color: "var(--tl-n-800)", fontWeight: 600 }}>
              Page Header
            </span>
          </div>
          <div
            style={{
              fontFamily: "var(--tl-mono)",
              fontSize: 11,
              color: "var(--tl-n-400)",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span>Plus Jakarta Sans · JetBrains Mono</span>
            <span>·</span>
            <span style={{ color: "var(--tl-brand-500)", fontWeight: 600 }}>
              Indigo + Teal
            </span>
          </div>
        </div>
      </FeatBlock>

      {/* Full hero header */}
      <FeatBlock style={{ padding: 0, overflow: "hidden" }}>
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.09em",
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            padding: "16px 20px 12px",
          }}
        >
          Full Page Hero Header
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, var(--tl-brand-900) 0%, var(--tl-brand-700) 100%)",
            padding: "40px 32px 36px",
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 28,
            }}
          >
            <svg
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="32" height="32" rx="7" fill="var(--tl-brand-500)" />
              <circle cx="16" cy="16" r="10.5" stroke="white" strokeWidth="2.5" fill="none" />
              <line
                x1={16 + 10.5 * Math.cos(Math.PI / 4) * 0.7}
                y1={16 + 10.5 * Math.sin(Math.PI / 4) * 0.7}
                x2={16 + 10.5 * Math.cos(Math.PI / 4) * 1.3}
                y2={16 + 10.5 * Math.sin(Math.PI / 4) * 1.3}
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <circle cx="16" cy="16" r="3.5" fill="rgba(255,255,255,0.22)" />
            </svg>
            <span
              style={{
                fontFamily: "var(--tl-font)",
                fontWeight: 800,
                fontSize: 18,
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              TalentLens
            </span>
            <span
              style={{
                fontFamily: "var(--tl-mono)",
                fontSize: 10,
                color: "var(--tl-n-500)",
                marginLeft: 4,
              }}
            >
              v1.0
            </span>
          </div>

          {/* Title */}
          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 32,
              fontWeight: 800,
              color: "white",
              letterSpacing: "-0.03em",
              lineHeight: 1.15,
              marginBottom: 10,
            }}
          >
            Resume Diagnosis
            <br />
            <span style={{ color: "var(--tl-accent-300, oklch(0.762 0.112 192))" }}>
              AI-Powered Fix Workspace
            </span>
          </div>

          <div
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 14,
              color: "var(--tl-text-subtle)",
              lineHeight: 1.6,
              maxWidth: 460,
              marginBottom: 24,
            }}
          >
            3 issues found · ATS score 72 / 100 · Estimated score after fix: 91
          </div>

          {/* CTA */}
          <div style={{ display: "flex", gap: 10 }}>
            <button
              style={{
                fontFamily: "var(--tl-font)",
                fontWeight: 700,
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 8,
                border: "none",
                background: "white",
                color: "var(--tl-brand-700)",
                cursor: "pointer",
                boxShadow: "var(--tl-shadow-md)",
              }}
            >
              Start Fixing Issues
            </button>
            <button
              style={{
                fontFamily: "var(--tl-font)",
                fontWeight: 600,
                fontSize: 13,
                padding: "10px 20px",
                borderRadius: 8,
                border: "1px solid var(--tl-border)",
                background: "transparent",
                color: "var(--tl-n-400)",
                cursor: "pointer",
              }}
            >
              View Full Report
            </button>
          </div>
        </div>
      </FeatBlock>
    </section>
  );
};

// ── RESUME FIX COMPONENTS ─────────────────────────────────────────────────────

// RewriteSuggestion — selectable AI rewrite option button
const RewriteSuggestion = ({ suggestion, selected, onSelect }) => (
  <button
    type="button"
    onClick={onSelect}
    style={{
      textAlign: "left",
      width: "100%",
      display: "block",
      border: selected
        ? "2px solid var(--tl-brand-500)"
        : "1px solid var(--tl-border)",
      background: selected ? "var(--tl-brand-50)" : "var(--tl-n-50)",
      borderRadius: 10,
      padding: "14px 16px",
      cursor: "pointer",
      minHeight: 44,
    }}
  >
    <div
      style={{
        fontFamily: "var(--tl-mono)",
        fontSize: 11,
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: selected ? "var(--tl-brand-600)" : "var(--tl-text-muted)",
        marginBottom: 8,
      }}
    >
      {suggestion.label}
    </div>
    <p
      style={{
        fontFamily: "var(--tl-font)",
        fontSize: 13,
        lineHeight: 1.6,
        color: "var(--tl-text)",
        margin: 0,
      }}
    >
      {suggestion.text}
    </p>
  </button>
);

// BeforeAfterDiff — side-by-side original vs revised text
const BeforeAfterDiff = ({ before, after }) => (
  <div style={{ overflowX: "auto" }}>
    <div
      className="fix-diff"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 16,
      }}
    >
      {/* Before panel */}
      <div
        style={{
          background: "white",
          border: "1px solid var(--tl-border)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--tl-n-400)",
            marginBottom: 10,
          }}
        >
          Before
        </div>
        <p
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--tl-text-muted)",
            fontStyle: before ? "normal" : "italic",
            margin: 0,
          }}
        >
          {before || "No original text provided."}
        </p>
      </div>

      {/* After panel */}
      <div
        style={{
          background: "var(--tl-brand-50)",
          border: "1px solid var(--tl-brand-200)",
          borderRadius: 10,
          padding: 16,
        }}
      >
        <div
          style={{
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--tl-brand-600)",
            marginBottom: 10,
          }}
        >
          After
        </div>
        <p
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            lineHeight: 1.6,
            color: "var(--tl-text)",
            fontWeight: 500,
            margin: 0,
          }}
        >
          {after}
        </p>
      </div>
    </div>
  </div>
);

// ResumeFixTask — main actionable task card for a single issue
const ResumeFixTask = ({ issue, onApply, onDismiss }) => {
  const [selectedSuggestionId, setSelectedSuggestionId] = useState(null);
  const [appliedText, setAppliedText] = useState(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const severityColor =
    issue.severity === "high"
      ? "var(--tl-high-500)"
      : issue.severity === "medium"
      ? "var(--tl-med-500)"
      : "var(--tl-low-500)";

  const severityBadgeStyle =
    issue.severity === "high"
      ? { background: "var(--tl-high-50)", color: "var(--tl-high-500)" }
      : issue.severity === "medium"
      ? { background: "var(--tl-med-50)", color: "var(--tl-med-500)" }
      : { background: "var(--tl-low-50)", color: "var(--tl-low-500)" };

  const handleApply = () => {
    const selected = issue.suggestions.find((s) => s.id === selectedSuggestionId);
    if (!selected) return;
    setAppliedText(selected.text);
    onApply?.(issue.id, selected.text);
  };

  const handleDismiss = () => {
    setDone(true);
    onDismiss?.(issue.id);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(appliedText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }).catch(() => {});
  };

  if (done) {
    return (
      <div
        style={{
          background: "white",
          borderRadius: 12,
          border: "1px solid var(--tl-border)",
          borderLeft: `4px solid ${severityColor}`,
          padding: "16px 24px",
          boxShadow: "var(--tl-shadow-sm)",
          marginBottom: 16,
          opacity: 0.5,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <span
          style={{
            fontSize: 16,
            color: "var(--tl-low-500)",
            fontWeight: 700,
          }}
        >
          ✓
        </span>
        <span
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            color: "var(--tl-low-500)",
            fontWeight: 600,
          }}
        >
          Issue handled
        </span>
        <span
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            color: "var(--tl-text-muted)",
            marginLeft: 4,
          }}
        >
          · {issue.title}
        </span>
      </div>
    );
  }

  return (
    <div
      style={{
        background: "white",
        borderRadius: 12,
        border: "1px solid var(--tl-border)",
        borderLeft: `4px solid ${severityColor}`,
        padding: "20px 24px",
        boxShadow: "var(--tl-shadow-sm)",
        marginBottom: 16,
      }}
    >
      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 12,
        }}
      >
        {/* Left: priority badge + title */}
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 22,
              height: 22,
              background: "var(--tl-brand-500)",
              color: "white",
              fontFamily: "var(--tl-mono)",
              fontSize: 11,
              fontWeight: 700,
              borderRadius: "50%",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: 10,
              flexShrink: 0,
            }}
          >
            {issue.priority}
          </div>
          <span
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 15,
              fontWeight: 700,
              color: "var(--tl-text)",
            }}
          >
            {issue.title}
          </span>
        </div>

        {/* Right: severity badge */}
        <span
          style={{
            padding: "3px 10px",
            borderRadius: 9999,
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            flexShrink: 0,
            marginLeft: 12,
            ...severityBadgeStyle,
          }}
        >
          {issue.severity}
        </span>
      </div>

      {/* Meta row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--tl-mono)",
          fontSize: 11,
          color: "var(--tl-text-subtle)",
          marginBottom: 12,
        }}
      >
        <span>›</span>
        <span>{issue.affectedSection}</span>
      </div>

      {/* Reason */}
      <p
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 13,
          color: "var(--tl-text-muted)",
          lineHeight: 1.6,
          margin: "0 0 16px",
        }}
      >
        {issue.reason}
      </p>

      {/* Original text */}
      {issue.originalText && (
        <div style={{ marginBottom: 16 }}>
          <div
            style={{
              fontFamily: "var(--tl-mono)",
              fontSize: 10,
              textTransform: "uppercase",
              color: "var(--tl-n-400)",
              marginBottom: 6,
            }}
          >
            Original
          </div>
          <div
            style={{
              background: "var(--tl-n-50)",
              borderLeft: "3px solid var(--tl-n-300)",
              padding: "10px 14px",
              borderRadius: "0 6px 6px 0",
              fontFamily: "var(--tl-font)",
              fontSize: 13,
              color: "var(--tl-text-muted)",
              lineHeight: 1.5,
            }}
          >
            {issue.originalText}
          </div>
        </div>
      )}

      {/* Rewrite suggestions */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            color: "var(--tl-n-400)",
            marginBottom: 8,
          }}
        >
          AI Rewrite Options
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {issue.suggestions.map((sug) => (
            <RewriteSuggestion
              key={sug.id}
              suggestion={sug}
              selected={selectedSuggestionId === sug.id}
              onSelect={() =>
                setSelectedSuggestionId(
                  selectedSuggestionId === sug.id ? null : sug.id
                )
              }
            />
          ))}
        </div>
      </div>

      {/* Before/After diff (shown after applying) */}
      {appliedText && (
        <div style={{ marginBottom: 16 }}>
          <BeforeAfterDiff before={issue.originalText} after={appliedText} />
        </div>
      )}

      {/* Action row */}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        {/* Apply button */}
        <button
          type="button"
          onClick={handleApply}
          disabled={selectedSuggestionId === null}
          style={{
            background: "var(--tl-brand-500)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: "9px 18px",
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            fontWeight: 600,
            cursor: selectedSuggestionId === null ? "default" : "pointer",
            opacity: selectedSuggestionId === null ? 0.4 : 1,
          }}
        >
          Apply
        </button>

        {/* Mark Done button */}
        <button
          type="button"
          onClick={handleDismiss}
          style={{
            background: "transparent",
            border: "1px solid var(--tl-border)",
            borderRadius: 8,
            padding: "9px 18px",
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            fontWeight: 500,
            color: "var(--tl-text-muted)",
            cursor: "pointer",
          }}
        >
          Mark Done
        </button>

        {/* Copy bullet button (only after applying) */}
        {appliedText && (
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: "transparent",
              border: "1px solid var(--tl-border)",
              borderRadius: 8,
              padding: "9px 18px",
              fontFamily: "var(--tl-font)",
              fontSize: 13,
              fontWeight: 500,
              color: copied ? "var(--tl-low-500)" : "var(--tl-text-muted)",
              cursor: "pointer",
            }}
          >
            {copied ? "Copied!" : "Copy bullet"}
          </button>
        )}
      </div>
    </div>
  );
};

// ── FIX PROGRESS PANEL ───────────────────────────────────────────────────────
const FixProgressPanel = ({ tasks, onDone }) => {
  const handledCount = tasks.filter((t) => t.status === "handled").length;
  const highRemaining = tasks.filter(
    (t) => t.severity === "high" && t.status !== "handled"
  ).length;
  const allDone = handledCount === tasks.length;

  const estimatedScore = Math.min(100, 72 + handledCount * 4);

  // SVG arc for score ring
  const size = 96;
  const r = 38;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference * (1 - estimatedScore / 100);

  const progressPct = tasks.length > 0 ? (handledCount / tasks.length) * 100 : 0;

  const countRows = [
    { label: "Issues found", value: tasks.length },
    { label: "Handled", value: handledCount },
    { label: "High priority remaining", value: highRemaining },
  ];

  return (
    <div
      style={{
        background: "white",
        border: "1px solid var(--tl-border)",
        borderRadius: 14,
        padding: "20px 24px",
        boxShadow: "var(--tl-shadow-md)",
      }}
    >
      {/* Section 1 — Score Ring */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: 20 }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="var(--tl-n-100)"
            strokeWidth={8}
            fill="none"
          />
          {/* Progress arc */}
          <circle
            cx={cx}
            cy={cy}
            r={r}
            stroke="var(--tl-brand-500)"
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            style={{
              transition: "stroke-dashoffset 0.6s ease",
              transformOrigin: "center",
              transform: "rotate(-90deg)",
            }}
          />
          {/* Score numeral */}
          <text
            x={cx}
            y={cy + 7}
            textAnchor="middle"
            fontFamily="var(--tl-mono)"
            fontSize="20"
            fontWeight="700"
            fill="var(--tl-brand-500)"
          >
            {estimatedScore}
          </text>
        </svg>
        <div
          style={{
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            color: "var(--tl-n-400)",
            marginTop: 6,
          }}
        >
          Estimated score
        </div>
      </div>

      {/* Section 2 — Issue Counts */}
      <div style={{ marginBottom: 16 }}>
        {countRows.map(({ label, value }, idx) => (
          <div
            key={label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: idx < countRows.length - 1 ? "1px solid var(--tl-n-100)" : "none",
            }}
          >
            <span
              style={{
                fontFamily: "var(--tl-font)",
                fontSize: 13,
                color: "var(--tl-text-muted)",
              }}
            >
              {label}
            </span>
            <span
              style={{
                fontFamily: "var(--tl-mono)",
                fontSize: 13,
                fontWeight: 700,
                color: "var(--tl-text)",
              }}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Section 3 — Progress Bar */}
      <div style={{ marginBottom: 16 }}>
        <div
          style={{
            fontFamily: "var(--tl-mono)",
            fontSize: 10,
            textTransform: "uppercase",
            letterSpacing: "0.09em",
            color: "var(--tl-n-400)",
            marginBottom: 8,
          }}
        >
          Progress
        </div>
        <div
          style={{
            height: 6,
            background: "var(--tl-n-100)",
            borderRadius: 3,
          }}
        >
          <div
            style={{
              height: 6,
              width: `${progressPct}%`,
              background: "var(--tl-brand-500)",
              borderRadius: 3,
              transition: "width 0.4s ease",
            }}
          />
        </div>
      </div>

      {/* Section 4 — Guard copy */}
      <p
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 11,
          color: "var(--tl-text-subtle)",
          lineHeight: 1.5,
          marginTop: 16,
          marginBottom: 0,
        }}
      >
        Estimated score reflects resolved diagnostic issues, not hiring probability.
      </p>

      {/* Section 5 — Export readiness */}
      {allDone ? (
        <button
          type="button"
          onClick={() => onDone ? onDone() : alert("Resume saved!")}
          style={{
            marginTop: 16,
            width: "100%",
            background: "var(--tl-brand-500)",
            color: "white",
            border: "none",
            borderRadius: 8,
            padding: 10,
            fontFamily: "var(--tl-font)",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Save Fixed Resume
        </button>
      ) : (
        <div
          style={{
            fontFamily: "var(--tl-font)",
            fontSize: 12,
            color: "var(--tl-text-subtle)",
            textAlign: "center",
            marginTop: 12,
          }}
        >
          Fix remaining issues to unlock export
        </div>
      )}
    </div>
  );
};

// ── RESUME FIX WORKSPACE SECTION (demo) ──────────────────────────────────────
const ResumeFixWorkspaceSection = () => {
  const [tasks, setTasks] = useState(resumeFixIssues);

  const handleApply = (id, text) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, appliedText: text, status: "handled" } : t))
    );
  };

  const handleDismiss = (id) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "handled" } : t))
    );
  };

  return (
    <section id="fix-workspace" style={{ display: "flex", gap: 24, alignItems: "flex-start", paddingBottom: 72 }}>
      {/* Left column — tasks */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ marginBottom: 24 }}>
          <h2
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 24,
              fontWeight: 800,
              color: "var(--tl-n-900)",
              marginBottom: 8,
              letterSpacing: "-0.01em",
            }}
          >
            Resume Fix Workspace
          </h2>
          <p
            style={{
              fontFamily: "var(--tl-font)",
              fontSize: 14,
              color: "var(--tl-text-muted)",
              lineHeight: 1.6,
            }}
          >
            Work through each diagnostic issue with AI-assisted rewrites.
          </p>
        </div>
        {tasks.map((issue) => (
          <ResumeFixTask
            key={issue.id}
            issue={issue}
            onApply={handleApply}
            onDismiss={handleDismiss}
          />
        ))}
      </div>

      {/* Right column — progress panel */}
      <div style={{ width: 280, flexShrink: 0, position: "sticky", top: 72 }}>
        <FixProgressPanel tasks={tasks} />
      </div>
    </section>
  );
};

// ── PROGRESS PANEL ISOLATED DEMO ─────────────────────────────────────────────
const ProgressPanelSection = () => {
  const [tasks, setTasks] = useState([
    ...resumeFixIssues.slice(0, 1).map((t) => ({ ...t, status: "handled" })),
    ...resumeFixIssues.slice(1),
  ]);

  return (
    <section id="progress-panel">
      <h2
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 24,
          fontWeight: 800,
          color: "var(--tl-n-900)",
          marginBottom: 8,
        }}
      >
        Fix Progress Panel
      </h2>
      <p
        style={{
          fontFamily: "var(--tl-font)",
          fontSize: 14,
          color: "var(--tl-text-muted)",
          lineHeight: 1.6,
          marginBottom: 32,
        }}
      >
        Shows score estimate, issue counts, progress, and export readiness.
      </p>
      <div style={{ maxWidth: 300 }}>
        <FixProgressPanel tasks={tasks} />
      </div>
    </section>
  );
};

const JobMatchPreview = () => (
  <div
    style={{
      background: "var(--tl-surface)",
      border: "2px dashed var(--tl-brand-300)",
      borderRadius: 14,
      padding: 36,
      textAlign: "center",
      marginTop: 24,
    }}
  >
    <div
      style={{
        fontFamily: "var(--tl-font)",
        fontSize: 16,
        fontWeight: 800,
        color: "var(--tl-brand-700)",
        letterSpacing: "-0.01em",
        marginBottom: 8,
      }}
    >
      JobMatchPreview
    </div>
    <div
      style={{
        fontFamily: "var(--tl-font)",
        fontSize: 13,
        color: "var(--tl-n-500)",
        lineHeight: 1.65,
        maxWidth: 380,
        margin: "0 auto",
      }}
    >
      Previews the future JD matching workflow — keyword overlap chart, match
      percentage ring, and gap analysis table.
    </div>
  </div>
);
