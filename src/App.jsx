import { useState, useEffect, useCallback, useRef } from "react";

const COLORS = {
  bg: "#0a0e1a",
  card: "#111827",
  cardBorder: "#1e2d45",
  accent: "#00d4aa",
  accentDark: "#00a882",
  gold: "#f5c518",
  red: "#ff4757",
  text: "#e8f0fe",
  muted: "#6b7a99",
  navBg: "#0d1424",
};

const ACTIVATION_FEE = 500;
const REFERRAL_BONUS = 20;

// ── CONFIGURATION ────────────────────────────────────────────────────────────
// 1. Replace with your REAL key from https://payment.intasend.com
const INTASEND_PUBLIC_KEY = "ISPubKey_live_ca26ac0e-ad9b-4079-bc91-bf0b64257b17"; 
const INTASEND_LIVE = false; // Set to true when ready for real money

// ── Storage ──────────────────────────────────────────────────────────────────
function loadData(key) {
  try {
    const v = localStorage.getItem(key);
    return v ? JSON.parse(v) : null;
  } catch { return null; }
}
function saveData(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
}

function uid() {
  return Math.random().toString(36).slice(2, 9).toUpperCase();
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = {
  app: { minHeight: "100vh", background: COLORS.bg, fontFamily: "'Sora', sans-serif", color: COLORS.text, overflowX: "hidden" },
  nav: { background: COLORS.navBg, borderBottom: `1px solid ${COLORS.cardBorder}`, padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 },
  logo: { fontWeight: 800, fontSize: 22, background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  navLinks: { display: "flex", gap: 6 },
  navBtn: (active) => ({ padding: "6px 12px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, background: active ? COLORS.accent : "transparent", color: active ? "#000" : COLORS.muted }),
  hero: { background: `linear-gradient(135deg, #0f2027, #203a43)`, borderBottom: `1px solid ${COLORS.cardBorder}`, padding: "36px 20px", textAlign: "center" },
  heroTitle: { fontSize: 26, fontWeight: 800, margin: "0 0 8px", background: `linear-gradient(135deg, #fff, ${COLORS.accent})`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  accentBtn: { background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`, color: "#000", border: "none", borderRadius: 12, padding: "12px 28px", fontSize: 15, fontWeight: 800, cursor: "pointer", boxShadow: `0 4px 20px ${COLORS.accent}44` },
  dangerBtn: { background: COLORS.red, color: "#fff", border: "none", borderRadius: 10, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" },
  ghostBtn: { background: "transparent", border: `1px solid ${COLORS.cardBorder}`, color: COLORS.text, borderRadius: 10, padding: "9px 18px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  page: { maxWidth: 480, margin: "0 auto", padding: "20px 16px 80px" },
  card: { background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 16, padding: "20px", marginBottom: 16 },
  cardTitle: { fontWeight: 700, fontSize: 16, marginBottom: 14 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  statCard: { background: `linear-gradient(135deg, ${COLORS.card}, #162030)`, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "16px", textAlign: "center" },
  statValue: { fontSize: 24, fontWeight: 800, color: COLORS.accent, display: "block" },
  statLabel: { fontSize: 11, color: COLORS.muted, textTransform: "uppercase", marginTop: 4 },
  input: { width: "100%", background: "#0d1424", border: `1px solid ${COLORS.cardBorder}`, borderRadius: 10, padding: "11px 14px", color: COLORS.text, fontSize: 14, marginBottom: 10 },
  label: { fontSize: 12, color: COLORS.muted, marginBottom: 4, display: "block", fontWeight: 600 },
  badge: (color) => ({ display: "inline-block", background: `${color}22`, color, border: `1px solid ${color}55`, borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700 }),
  taskCard: { background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 14, padding: "16px", marginBottom: 12, display: "flex", alignItems: "center", gap: 14 },
  taskIcon: { width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 },
  progressBar: { height: 6, borderRadius: 3, background: COLORS.cardBorder, overflow: "hidden", marginTop: 8 },
  progressFill: (pct) => ({ height: "100%", width: `${pct}%`, background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold})`, transition: "width 0.5s" }),
  chatBubble: (isUser) => ({ maxWidth: "78%", alignSelf: isUser ? "flex-end" : "flex-start", background: isUser ? COLORS.accent : "#162030", color: isUser ? "#000" : COLORS.text, borderRadius: 12, padding: "10px 14px", fontSize: 13.5, marginBottom: 4 }),
  refBox: { background: "#0d1424", border: `1px dashed ${COLORS.accent}55`, borderRadius: 10, padding: "12px 14px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  refCode: { fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: COLORS.accent },
  toast: { position: "fixed", bottom: 30, left: "50%", transform: "translateX(-50%)", background: COLORS.accent, color: "#000", fontWeight: 700, padding: "10px 22px", borderRadius: 12, zIndex: 9999 },
  overlay: { position: "fixed", inset: 0, background: "#000a", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 },
  modal: { background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`, borderRadius: 20, padding: 28, width: "100%", maxWidth: 420 },
};

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ msg, onDone }) {
  useEffect(() => { const t = setTimeout(onDone, 2400); return () => clearTimeout(t); }, [onDone]);
  return <div style={S.toast}>{msg}</div>;
}

// ── Auth Screen ───────────────────────────────────────────────────────────────
function AuthScreen({ onAuth, toast }) {
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", phone: "", password: "", ref: "" });
  const [loading, setLoading] = useState(false);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setLoading(true);
    const users = loadData("users") || {};
    if (mode === "register") {
      if (!form.name || !form.phone || !form.password) { toast("Fill all fields"); setLoading(false); return; }
      if (users[form.phone]) { toast("Phone already registered"); setLoading(false); return; }
      const newUser = {
        name: form.name, phone: form.phone, password: form.password,
        refCode: uid(), referredBy: form.ref || null,
        balance: 0, activated: false, tasksCompleted: 0, points: 0,
        referrals: 0, activity: [], joinedAt: Date.now()
      };
      users[form.phone] = newUser;
      saveData("users", users);
      onAuth(newUser);
    } else {
      const u = users[form.phone];
      if (!u || u.password !== form.password) { toast("Invalid credentials"); setLoading(false); return; }
      onAuth(u);
    }
    setLoading(false);
  }

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ marginBottom: 32, textAlign: "center" }}><div style={{ ...S.logo, fontSize: 36 }}>💰 EarnHub</div></div>
      <div style={{ ...S.card, width: "100%", maxWidth: 400 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {["login", "register"].map((m) => (
            <button key={m} style={{ ...S.navBtn(mode === m), flex: 1, padding: "10px" }} onClick={() => setMode(m)}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>
        {mode === "register" && <><label style={S.label}>Full Name</label><input style={S.input} value={form.name} onChange={handle("name")} /></>}
        <label style={S.label}>Phone Number</label>
        <input style={S.input} value={form.phone} onChange={handle("phone")} placeholder="0712345678" />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" value={form.password} onChange={handle("password")} />
        <button style={{ ...S.accentBtn, width: "100%" }} onClick={submit} disabled={loading}>{loading ? "..." : mode === "login" ? "Login" : "Join Now"}</button>
      </div>
    </div>
  );
}

// ── IntaSend SDK loader ──────────────────────────────────────────────────────
function loadIntaSendSDK() {
  return new Promise((resolve, reject) => {
    if (window.IntaSend) return resolve();
    const s = document.createElement("script");
    s.src = "https://unpkg.com/intasend-inlinejs-sdk@1.0.4/build/intasend-inline.js";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.head.appendChild(s);
  });
}

// ── Activation Modal (FIXED) ──────────────────────────────────────────────────
function ActivationModal({ user, onClose, onActivated }) {
  const [step, setStep] = useState("confirm"); 
  const [errorMsg, setErrorMsg] = useState("");
  const btnRef = useRef(null);

  const phone254 = user.phone.startsWith("0") ? "254" + user.phone.slice(1) : user.phone;

  useEffect(() => {
    if (step !== "awaiting") return;
    
    loadIntaSendSDK().then(() => {
      // FIXED: Used the constant INTASEND_PUBLIC_KEY instead of the undefined variable
      const instance = new window.IntaSend({
        publicAPIKey: INTASEND_PUBLIC_KEY,
        live: INTASEND_LIVE,
      })
      .on("COMPLETE", () => doActivate())
      .on("FAILED", () => { setErrorMsg("Payment failed. Please try again."); setStep("failed"); });

      setTimeout(() => { if (btnRef.current) btnRef.current.click(); }, 500);
    }).catch(() => {
      setErrorMsg("Could not load payment SDK. Check your connection.");
      setStep("failed");
    });
  }, [step]);

  function doActivate() {
    const users = loadData("users") || {};
    const updated = { ...user, activated: true, activity: [{ text: "Account activated ✅", at: Date.now() }, ...user.activity] };
    if (user.referredBy) {
        const referrer = Object.values(users).find(u => u.refCode === user.referredBy);
        if (referrer) {
            referrer.balance += REFERRAL_BONUS;
            referrer.referrals += 1;
            users[referrer.phone] = referrer;
        }
    }
    users[user.phone] = updated;
    saveData("users", users);
    onActivated(updated);
    setStep("success");
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        {step === "confirm" && (
          <>
            <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 10 }}>🔓 Activate Account</div>
            <p style={{ color: COLORS.muted, fontSize: 13 }}>Pay KSH {ACTIVATION_FEE} via M-Pesa to unlock earnings.</p>
            <button style={{ ...S.accentBtn, width: "100%", marginTop: 20 }} onClick={() => setStep("awaiting")}>📱 Pay via M-Pesa</button>
            <button style={{ background: "none", border: "none", color: COLORS.muted, width: "100%", marginTop: 10 }} onClick={onClose}>Cancel</button>
          </>
        )}
        {step === "awaiting" && (
          <div style={{ textAlign: "center" }}>
            <button ref={btnRef} className="intaSendPayButton" data-amount={ACTIVATION_FEE} data-currency="KES" data-method="M-PESA" data-phone_number={phone254} data-first_name={user.name} data-api_ref={`EH-${user.phone}`} style={{ display: "none" }}>Pay</button>
            <div style={{ fontSize: 40 }}>⏳</div>
            <p>Waiting for M-Pesa... Check your phone for the PIN prompt.</p>
          </div>
        )}
        {step === "success" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 50 }}>🎉</div>
            <h3>Activated!</h3>
            <button style={S.accentBtn} onClick={onClose}>Start Earning</button>
          </div>
        )}
        {step === "failed" && (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>❌</div>
            <div style={{ color: COLORS.red, fontWeight: 700 }}>{errorMsg}</div>
            <button style={{ ...S.accentBtn, width: "100%", marginTop: 15 }} onClick={() => setStep("confirm")}>Try Again</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Dashboard Components ──────────────────────────────────────────────────────
function Dashboard({ user, onActivate }) {
  return (
    <div style={S.page}>
      {!user.activated && (
        <div style={{ ...S.card, background: "linear-gradient(135deg,#1a0e2a,#2a1a40)" }}>
          <div style={{ color: COLORS.gold, fontWeight: 700 }}>⚡ Activation Required</div>
          <p style={{ fontSize: 13 }}>Unlock your earnings and start withdrawing.</p>
          <button style={S.accentBtn} onClick={onActivate}>PAY & ACTIVATE</button>
        </div>
      )}
      <div style={S.statGrid}>
        <div style={S.statCard}><span style={S.statValue}>KSH {user.balance}</span><span style={S.statLabel}>Balance</span></div>
        <div style={S.statCard}><span style={S.statValue}>{user.referrals}</span><span style={S.statLabel}>Referrals</span></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>🔗 Your Referral Code</div>
        <div style={S.refBox}><span style={S.refCode}>{user.refCode}</span></div>
        <p style={{ fontSize: 12, color: COLORS.muted }}>Earn KSH {REFERRAL_BONUS} per active referral.</p>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [showActivation, setShowActivation] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);

  const toast = (msg) => setToastMsg(msg);

  if (!user) return <><AuthScreen onAuth={setUser} toast={toast} />{toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}</>;

  return (
    <div style={S.app}>
      <nav style={S.nav}>
        <div style={S.logo}>💰 EarnHub</div>
        <div style={S.navLinks}>
          <button style={S.navBtn(tab === "dashboard")} onClick={() => setTab("dashboard")}>Home</button>
          <button style={S.dangerBtn} onClick={() => setUser(null)}>Exit</button>
        </div>
      </nav>
      
      <div style={S.hero}>
        <div style={S.heroTitle}>Hello, {user.name.split(" ")[0]}!</div>
        <p style={S.heroSub}>{user.activated ? "Verified Account ✓" : "Account Limited"}</p>
      </div>

      {tab === "dashboard" && <Dashboard user={user} onActivate={() => setShowActivation(true)} />}

      {showActivation && <ActivationModal user={user} onClose={() => setShowActivation(false)} onActivated={(u) => { setUser(u); setShowActivation(false); toast("🎉 Activated!"); }} />}
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </div>
  );
}
