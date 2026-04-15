import { useState, useEffect, useCallback } from "react";

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

const ACTIVATION_FEE = 1;
const REFERRAL_BONUS = 20;
const PAYMENT_LINK = "https://lipwa.link/7762";
// CHANGE THIS: Set your own phone number as the admin
const ADMIN_PHONE = "0111385747"; 

// ── Storage ───────────────────────────────────────────────────────────────────
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
  app: {
    minHeight: "100vh",
    background: COLORS.bg,
    fontFamily: "'Sora', 'Segoe UI', sans-serif",
    color: COLORS.text,
    overflowX: "hidden",
  },
  nav: {
    background: COLORS.navBg,
    borderBottom: `1px solid ${COLORS.cardBorder}`,
    padding: "0 20px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    height: 60,
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  logo: {
    fontWeight: 800,
    fontSize: 22,
    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.gold})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  navLinks: { display: "flex", gap: 6 },
  navBtn: (active) => ({
    padding: "6px 12px",
    borderRadius: 8,
    border: "none",
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    background: active ? COLORS.accent : "transparent",
    color: active ? "#000" : COLORS.muted,
    transition: "all 0.2s",
  }),
  hero: {
    background: `linear-gradient(135deg, #0f2027 0%, #203a43 50%, #0f2027 100%)`,
    borderBottom: `1px solid ${COLORS.cardBorder}`,
    padding: "36px 20px",
    textAlign: "center",
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    margin: "0 0 8px",
    background: `linear-gradient(135deg, #fff, ${COLORS.accent})`,
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSub: { fontSize: 14, color: COLORS.muted, marginBottom: 20 },
  accentBtn: {
    background: `linear-gradient(135deg, ${COLORS.accent}, ${COLORS.accentDark})`,
    color: "#000",
    border: "none",
    borderRadius: 12,
    padding: "12px 28px",
    fontSize: 15,
    fontWeight: 800,
    cursor: "pointer",
    boxShadow: `0 4px 20px ${COLORS.accent}44`,
    transition: "transform 0.15s",
    letterSpacing: 0.3,
  },
  dangerBtn: {
    background: COLORS.red,
    color: "#fff",
    border: "none",
    borderRadius: 10,
    padding: "6px 12px",
    fontSize: 12,
    fontWeight: 700,
    cursor: "pointer",
  },
  ghostBtn: {
    background: "transparent",
    border: `1px solid ${COLORS.cardBorder}`,
    color: COLORS.text,
    borderRadius: 10,
    padding: "9px 18px",
    fontSize: 13,
    fontWeight: 600,
    cursor: "pointer",
  },
  page: { maxWidth: 480, margin: "0 auto", padding: "20px 16px 80px" },
  card: {
    background: COLORS.card,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 16,
    padding: "20px",
    marginBottom: 16,
  },
  cardTitle: { fontWeight: 700, fontSize: 16, marginBottom: 14 },
  statGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 },
  statCard: {
    background: `linear-gradient(135deg, ${COLORS.card}, #162030)`,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 14,
    padding: "16px",
    textAlign: "center",
  },
  statValue: { fontSize: 24, fontWeight: 800, color: COLORS.accent, display: "block" },
  statLabel: { fontSize: 11, color: COLORS.muted, textTransform: "uppercase", letterSpacing: 0.5, marginTop: 4 },
  input: {
    width: "100%",
    background: "#0d1424",
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 10,
    padding: "11px 14px",
    color: COLORS.text,
    fontSize: 14,
    outline: "none",
    boxSizing: "border-box",
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: COLORS.muted,
    marginBottom: 4,
    display: "block",
    fontWeight: 600,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  badge: (color) => ({
    display: "inline-block",
    background: `${color}22`,
    color,
    border: `1px solid ${color}55`,
    borderRadius: 6,
    padding: "2px 8px",
    fontSize: 11,
    fontWeight: 700,
  }),
  taskCard: {
    background: COLORS.card,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 14,
    padding: "16px",
    marginBottom: 12,
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  taskIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 22,
    flexShrink: 0,
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    background: COLORS.cardBorder,
    overflow: "hidden",
    marginTop: 8,
  },
  progressFill: (pct) => ({
    height: "100%",
    width: `${pct}%`,
    background: `linear-gradient(90deg, ${COLORS.accent}, ${COLORS.gold})`,
    borderRadius: 3,
    transition: "width 0.5s",
  }),
  chatBubble: (isUser) => ({
    maxWidth: "78%",
    alignSelf: isUser ? "flex-end" : "flex-start",
    background: isUser ? COLORS.accent : "#162030",
    color: isUser ? "#000" : COLORS.text,
    borderRadius: isUser ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
    padding: "10px 14px",
    fontSize: 13.5,
    lineHeight: 1.5,
    marginBottom: 4,
    border: isUser ? "none" : `1px solid ${COLORS.cardBorder}`,
    fontWeight: isUser ? 600 : 400,
  }),
  refBox: {
    background: "#0d1424",
    border: `1px dashed ${COLORS.accent}55`,
    borderRadius: 10,
    padding: "12px 14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  refCode: { fontFamily: "monospace", fontSize: 18, fontWeight: 800, color: COLORS.accent, letterSpacing: 2 },
  toast: {
    position: "fixed",
    bottom: 30,
    left: "50%",
    transform: "translateX(-50%)",
    background: COLORS.accent,
    color: "#000",
    fontWeight: 700,
    padding: "10px 22px",
    borderRadius: 12,
    fontSize: 13,
    zIndex: 9999,
    boxShadow: `0 4px 20px ${COLORS.accent}66`,
    animation: "toastIn 0.3s ease",
    whiteSpace: "nowrap",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#000a",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    background: COLORS.card,
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: 20,
    padding: 28,
    width: "100%",
    maxWidth: 420,
  },
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) { setForm((f) => ({ ...f, ref })); setMode("register"); }
  }, []);

  async function submit() {
    setLoading(true);
    if (mode === "register") {
      if (!form.name || !form.phone || !form.password) { toast("Fill all fields"); setLoading(false); return; }
      const users = loadData("users") || {};
      if (users[form.phone]) { toast("Phone already registered"); setLoading(false); return; }
      const refCode = uid();
      const newUser = {
        name: form.name, phone: form.phone, password: form.password,
        refCode, referredBy: form.ref || null,
        balance: 0, activated: false, status: "inactive", tasksCompleted: 0, points: 0,
        referrals: 0, joinedAt: Date.now(), activity: [], lastCheckin: null,
      };
      users[form.phone] = newUser;
      saveData("users", users);
      toast("Account created! Welcome 🎉");
      onAuth(newUser);
    } else {
      await new Promise(r => setTimeout(r, 400));
      const users = loadData("users") || {};
      const u = users[form.phone];
      if (!u || u.password !== form.password) { toast("Invalid credentials"); setLoading(false); return; }
      onAuth(u);
    }
    setLoading(false);
  }

  return (
    <div style={{ ...S.app, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 20 }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); @keyframes toastIn { from{opacity:0;transform:translateX(-50%) translateY(20px)} to{opacity:1;transform:translateX(-50%) translateY(0)} } *{box-sizing:border-box} body{margin:0}`}</style>
      <div style={{ marginBottom: 32, textAlign: "center" }}>
        <div style={{ ...S.logo, fontSize: 36, marginBottom: 8 }}>💰 EarnHub</div>
        <p style={{ color: COLORS.muted, fontSize: 13, margin: 0 }}>Complete tasks. Earn real KSH.</p>
      </div>
      <div style={{ ...S.card, width: "100%", maxWidth: 400, padding: 28 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 22 }}>
          {["login", "register"].map((m) => (
            <button key={m} style={{ ...S.navBtn(mode === m), flex: 1, padding: "10px 0", fontSize: 14, borderRadius: 10 }} onClick={() => setMode(m)}>
              {m === "login" ? "Sign In" : "Create Account"}
            </button>
          ))}
        </div>
        {mode === "register" && (<><label style={S.label}>Full Name</label><input style={S.input} placeholder="John Mwangi" value={form.name} onChange={handle("name")} /></>)}
        <label style={S.label}>Phone Number</label>
        <input style={S.input} placeholder="0712345678" value={form.phone} onChange={handle("phone")} />
        <label style={S.label}>Password</label>
        <input style={S.input} type="password" placeholder="••••••••" value={form.password} onChange={handle("password")} />
        {mode === "register" && (<><label style={S.label}>Referral Code (optional)</label><input style={S.input} placeholder="ABC1234" value={form.ref} onChange={handle("ref")} /></>)}
        <button style={{ ...S.accentBtn, width: "100%", marginTop: 6, opacity: loading ? 0.7 : 1 }} onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign In →" : "Create Account →"}
        </button>
      </div>
      <p style={{ color: COLORS.muted, fontSize: 12, marginTop: 16, textAlign: "center" }}>Min withdrawal: KSH 500 · Activation fee: KSH {ACTIVATION_FEE}</p>
    </div>
  );
}

// ── Activation Modal ──────────────────────────────────────────────────────────
function ActivationModal({ user, onUserUpdate, onClose }) {
  const [isPending, setIsPending] = useState(user.status === "pending");

  function handlePayClick() {
    const users = loadData("users") || {};
    users[user.phone].status = "pending";
    saveData("users", users);
    onUserUpdate(users[user.phone]);
    setIsPending(true);
    window.open(PAYMENT_LINK, "_blank", "noreferrer");
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>🔓 Activate Account</div>
        {!isPending ? (
          <>
            <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>
              Pay KSH {ACTIVATION_FEE} once to unlock all earning features.
            </p>
            <div style={{ ...S.card, background: "#0d1424", marginBottom: 16 }}>
              <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 4 }}>Payment Amount</div>
              <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.gold }}>KSH {ACTIVATION_FEE}</div>
            </div>
            <button style={{ ...S.accentBtn, width: "100%", marginBottom: 10 }} onClick={handlePayClick}>
              💳 Pay KSH {ACTIVATION_FEE} via Lipwa →
            </button>
            <button style={{ ...S.ghostBtn, width: "100%" }} onClick={onClose}>Cancel</button>
          </>
        ) : (
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 700, color: COLORS.accent }}>Awaiting Verification</div>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: "14px 0" }}>
              Our team is verifying your payment. Your account will be activated within 1–2 hours.
            </p>
            <button style={{ ...S.ghostBtn, width: "100%" }} onClick={onClose}>Close</button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Admin Panel (Hidden) ─────────────────────────────────────────────────────
function AdminPanel({ onRefresh }) {
  const users = loadData("users") || {};
  const pending = Object.values(users).filter(u => u.status === "pending");

  function approve(phone) {
    const u = users[phone];
    u.status = "active";
    u.activated = true;
    // Credit referral bonus to the inviter
    if (u.referredBy) {
      const all = Object.values(users);
      const inviter = all.find(x => x.refCode === u.referredBy);
      if (inviter) {
        inviter.balance += REFERRAL_BONUS;
        inviter.referrals += 1;
        inviter.activity = [{ text: `Referral Bonus +KSH ${REFERRAL_BONUS} (from ${u.name})`, at: Date.now() }, ...inviter.activity];
      }
    }
    saveData("users", users);
    onRefresh();
  }

  return (
    <div style={S.page}>
      <div style={S.cardTitle}>👑 Admin Verification ({pending.length})</div>
      {pending.length === 0 && <p style={{ color: COLORS.muted }}>No pending payments.</p>}
      {pending.map(u => (
        <div key={u.phone} style={S.taskCard}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{u.name}</div>
            <div style={{ fontSize: 12, color: COLORS.muted }}>{u.phone}</div>
          </div>
          <button style={{ ...S.accentBtn, padding: "6px 12px", fontSize: 12 }} onClick={() => approve(u.phone)}>APPROVE</button>
        </div>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({ user, onActivate, onTabChange }) {
  const refLink = `${window.location.origin}${window.location.pathname}?ref=${user.refCode}`;
  const pct = Math.min(100, Math.round((user.points / 100) * 100));

  return (
    <div style={S.page}>
      {!user.activated && (
        <div style={{ ...S.card, background: user.status === "pending" ? "#162030" : "linear-gradient(135deg,#1a0e2a,#2a1a40)", border: `1px solid ${COLORS.gold}44`, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.gold, marginBottom: 4 }}>
            {user.status === "pending" ? "⏳ Verification in Progress" : "⚡ Activate to Earn"}
          </div>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 14px" }}>
            {user.status === "pending" ? "We are confirming your M-Pesa transaction." : `Pay KSH ${ACTIVATION_FEE} once to start withdrawing.`}
          </p>
          <button style={{ ...S.accentBtn, padding: "11px 22px" }} onClick={onActivate}>
            {user.status === "pending" ? "VIEW STATUS" : "PAY & ACTIVATE"}
          </button>
        </div>
      )}
      <div style={S.statGrid}>
        <div style={S.statCard}><span style={S.statValue}>KSH {user.balance.toFixed(2)}</span><span style={S.statLabel}>Balance</span></div>
        <div style={S.statCard}><span style={{ ...S.statValue, color: COLORS.gold }}>{user.tasksCompleted}</span><span style={S.statLabel}>Tasks Done</span></div>
        <div style={S.statCard}><span style={{ ...S.statValue, color: "#a78bfa" }}>{user.referrals}</span><span style={S.statLabel}>Referrals</span></div>
        <div style={S.statCard}><span style={{ ...S.statValue, color: COLORS.gold }}>{user.points}</span><span style={S.statLabel}>Points</span></div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>🔗 Your Referral Link</div>
        <div style={S.refBox}>
          <div><div style={{ fontSize: 11, color: COLORS.muted, marginBottom: 2 }}>Your Code</div><div style={S.refCode}>{user.refCode}</div></div>
          <button style={{ ...S.accentBtn, padding: "8px 14px", fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(refLink); }}>Copy</button>
        </div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>⚡ Recent Activity</div>
        {(!user.activity || user.activity.length === 0)
          ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No activity yet.</div>
          : user.activity.slice(0, 5).map((a, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? `1px solid ${COLORS.cardBorder}` : "none", padding: "8px 0", fontSize: 13, color: COLORS.muted }}>{a.text}</div>
          ))}
      </div>
    </div>
  );
}

// ── Tasks & Earnings (Shortened for brevity - Same logic, locked if !user.activated) ────────
// ... (Keep your Tasks and Earnings components from your original code)

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [showActivation, setShowActivation] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toast = useCallback((msg) => setToastMsg(msg), []);

  const refreshUser = useCallback(() => {
    if (!user) return;
    const users = loadData("users") || {};
    if (users[user.phone]) setUser(users[user.phone]);
  }, [user]);

  useEffect(() => {
    const phone = sessionStorage.getItem("eh_phone");
    if (phone) {
      const users = loadData("users") || {};
      if (users[phone]) setUser(users[phone]);
    }
  }, []);

  function handleAuth(u) {
    sessionStorage.setItem("eh_phone", u.phone);
    setUser(u);
  }

  function logout() {
    sessionStorage.removeItem("eh_phone");
    setUser(null);
    setTab("dashboard");
  }

  if (!user) return (
    <>
      <AuthScreen onAuth={handleAuth} toast={toast} />
      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  );

  return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); *{box-sizing:border-box} body{margin:0}`}</style>
      <div style={S.app}>
        <nav style={S.nav}>
          <div style={S.logo}>💰 EarnHub</div>
          <div style={S.navLinks}>
            {["dashboard", "tasks", "earnings"].map((t) => (
              <button key={t} style={S.navBtn(tab === t)} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            {user.phone === ADMIN_PHONE && (
              <button style={S.navBtn(tab === "admin")} onClick={() => setTab("admin")}>Admin</button>
            )}
            <button style={S.dangerBtn} onClick={logout}>Out</button>
          </div>
        </nav>

        {tab === "dashboard" && <Dashboard user={user} onActivate={() => setShowActivation(true)} onTabChange={setTab} />}
        {tab === "tasks" && <Tasks user={user} onUserUpdate={setUser} toast={toast} />}
        {tab === "earnings" && <Earnings user={user} onUserUpdate={setUser} toast={toast} />}
        {tab === "admin" && user.phone === ADMIN_PHONE && <AdminPanel onRefresh={refreshUser} />}

        {showActivation && <ActivationModal user={user} onUserUpdate={setUser} onClose={() => setShowActivation(false)} />}
        {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
      </div>
    </>
  );
}
