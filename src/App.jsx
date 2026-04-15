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

// ── Storage (localStorage for deployed app) ───────────────────────────────────
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
        balance: 0, activated: false, tasksCompleted: 0, points: 0,
        referrals: 0, joinedAt: Date.now(), activity: [], lastCheckin: null,
      };
      users[form.phone] = newUser;
      // NOTE: Referral bonus is NOT credited here — it is credited only when
      // the referred user's account is activated (payment confirmed by admin).
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
function ActivationModal({ user, onClose }) {
  const [paid, setPaid] = useState(false);

  function handlePayClick() {
    setPaid(true);
    window.open(PAYMENT_LINK, "_blank", "noreferrer");
  }

  return (
    <div style={S.overlay}>
      <div style={S.modal}>
        <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 6 }}>🔓 Activate Account</div>
        <p style={{ color: COLORS.muted, fontSize: 13, marginBottom: 20 }}>
          Pay KSH {ACTIVATION_FEE} once to unlock all earning features. Your account will be activated within{" "}
          <strong style={{ color: COLORS.accent }}>1–2 hours</strong> after your payment is confirmed.
        </p>

        <div style={{ ...S.card, background: "#0d1424", marginBottom: 16 }}>
          <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 4 }}>Payment Amount</div>
          <div style={{ fontSize: 28, fontWeight: 800, color: COLORS.gold }}>KSH {ACTIVATION_FEE}</div>
        </div>

        {!paid ? (
          <>
            <button style={{ ...S.accentBtn, width: "100%", marginBottom: 10 }} onClick={handlePayClick}>
              💳 Pay KSH {ACTIVATION_FEE} via Lipwa →
            </button>
            <button
              style={{ color: COLORS.muted, background: "none", border: "none", cursor: "pointer", width: "100%", fontSize: 13 }}
              onClick={onClose}
            >
              Cancel
            </button>
          </>
        ) : (
          <div style={{ background: `${COLORS.accent}11`, border: `1px solid ${COLORS.accent}44`, borderRadius: 12, padding: "16px", textAlign: "center" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>⏳</div>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6, color: COLORS.accent }}>Payment Submitted</div>
            <p style={{ fontSize: 13, color: COLORS.muted, margin: "0 0 14px" }}>
              Complete the payment on the Lipwa page. Once your M-Pesa transaction is confirmed on our end,
              your account will be activated within <strong style={{ color: COLORS.text }}>1–2 hours</strong>.
            </p>
            <div style={{ fontSize: 12, color: COLORS.muted, marginBottom: 14 }}>
              Need help? WhatsApp us at{" "}
              <strong style={{ color: COLORS.text }}>+254700000000</strong>
            </div>
            <button style={{ ...S.ghostBtn, width: "100%" }} onClick={onClose}>
              Close
            </button>
          </div>
        )}
      </div>
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
        <div style={{ ...S.card, background: "linear-gradient(135deg,#1a0e2a,#2a1a40)", border: `1px solid ${COLORS.gold}44`, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 15, color: COLORS.gold, marginBottom: 4 }}>⚡ Activate to Earn</div>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 14px" }}>Pay KSH {ACTIVATION_FEE} once to start withdrawing your earnings.</p>
          <button style={{ ...S.accentBtn, padding: "11px 22px" }} onClick={onActivate}>PAY & ACTIVATE</button>
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
          <button style={{ ...S.accentBtn, padding: "8px 14px", fontSize: 12 }} onClick={() => { navigator.clipboard.writeText(refLink).catch(() => {}); }}>Copy</button>
        </div>
        <div style={{ background: `${COLORS.accent}11`, border: `1px solid ${COLORS.accent}33`, borderRadius: 10, padding: "10px 14px", fontSize: 13 }}>
          🎁 Earn <strong style={{ color: COLORS.accent }}>KSH {REFERRAL_BONUS}</strong> for every friend who registers <em>and activates</em> their account with your link!
        </div>
      </div>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div style={S.cardTitle}>🎯 Tasks Preview</div>
          <button style={{ ...S.ghostBtn, padding: "6px 12px", fontSize: 12 }} onClick={() => onTabChange("tasks")}>View All</button>
        </div>
        {[
          { icon: "📅", name: "Daily Check-in", reward: 5, color: "#22c55e" },
          { icon: "🧠", name: "Trivia Quiz", reward: 15, color: "#f59e0b" },
          { icon: "💬", name: "Chat to Earn", reward: 10, color: "#818cf8" },
        ].map((t) => (
          <div key={t.name} style={S.taskCard}>
            <div style={{ ...S.taskIcon, background: `${t.color}22` }}>{t.icon}</div>
            <div style={{ flex: 1 }}><div style={{ fontWeight: 700, fontSize: 14 }}>{t.name}</div><div style={{ color: COLORS.muted, fontSize: 12 }}>Earn KSH {t.reward}</div></div>
            <span style={S.badge(t.color)}>+{t.reward}</span>
          </div>
        ))}
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>📈 Level Progress</div>
        <div style={{ fontSize: 13, color: COLORS.muted, marginBottom: 6 }}>Level 1 · {user.points}/100 points</div>
        <div style={S.progressBar}><div style={S.progressFill(pct)} /></div>
        <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 6, textAlign: "right" }}>{pct}%</div>
      </div>
      <div style={S.card}>
        <div style={S.cardTitle}>⚡ Recent Activity</div>
        {(user.activity || []).length === 0
          ? <div style={{ color: COLORS.muted, fontSize: 13 }}>No activity yet. Complete tasks to get started!</div>
          : (user.activity || []).slice(0, 5).map((a, i) => (
            <div key={i} style={{ borderBottom: i < 4 ? `1px solid ${COLORS.cardBorder}` : "none", padding: "8px 0", fontSize: 13, color: COLORS.muted }}>{a.text}</div>
          ))}
      </div>
    </div>
  );
}

// ── Tasks ─────────────────────────────────────────────────────────────────────
function Tasks({ user, onUserUpdate, toast }) {
  const [activeTask, setActiveTask] = useState(null);
  const [quizQ, setQuizQ] = useState(null);
  const [quizAns, setQuizAns] = useState(null);
  const [quizResult, setQuizResult] = useState(null);
  const [chatInput, setChatInput] = useState("");
  const [chatMsgs, setChatMsgs] = useState([{ role: "assistant", content: "Hey! I'm your EarnHub AI. Chat with me to earn KSH 10! Ask me anything." }]);
  const [chatEarned, setChatEarned] = useState(false);
  const [chatLoading, setChatLoading] = useState(false);

  const QUIZ = [
    { q: "What is the capital of Kenya?", opts: ["Mombasa", "Nairobi", "Kisumu", "Nakuru"], ans: 1 },
    { q: "How many counties are in Kenya?", opts: ["42", "47", "48", "50"], ans: 1 },
    { q: "What currency does Kenya use?", opts: ["Shilling", "Dollar", "Rand", "Franc"], ans: 0 },
    { q: "Which lake borders western Kenya?", opts: ["Lake Nakuru", "Lake Turkana", "Lake Victoria", "Lake Bogoria"], ans: 2 },
    { q: "What does M-Pesa stand for?", opts: ["Mobile Phone", "Mobile Pesa", "Mobile Money", "Mobile Pay"], ans: 1 },
    { q: "Who is on the Kenyan 1000 shilling note?", opts: ["Kenyatta", "Kibaki", "Uhuru", "Moi"], ans: 0 },
    { q: "What year did Kenya gain independence?", opts: ["1960", "1961", "1963", "1965"], ans: 2 },
  ];

  function updateUser(updates) {
    const users = loadData("users") || {};
    const updated = { ...user, ...updates };
    users[user.phone] = updated;
    saveData("users", users);
    onUserUpdate(updated);
    return updated;
  }

  function doCheckin() {
    if (!user.activated) { toast("Activate your account first!"); return; }
    const today = new Date().toDateString();
    if (user.lastCheckin === today) { toast("Already checked in today!"); return; }
    updateUser({ balance: user.balance + 5, tasksCompleted: user.tasksCompleted + 1, points: user.points + 5, lastCheckin: today, activity: [{ text: "Daily check-in +KSH 5 ✅", at: Date.now() }, ...(user.activity || []).slice(0, 19)] });
    toast("✅ Check-in! +KSH 5");
  }

  function startQuiz() {
    if (!user.activated) { toast("Activate your account first!"); return; }
    setQuizQ(QUIZ[Math.floor(Math.random() * QUIZ.length)]);
    setQuizAns(null); setQuizResult(null); setActiveTask("quiz");
  }

  function submitQuiz() {
    if (quizAns === null) return;
    const correct = quizAns === quizQ.ans;
    setQuizResult(correct);
    if (correct) {
      updateUser({ balance: user.balance + 15, tasksCompleted: user.tasksCompleted + 1, points: user.points + 15, activity: [{ text: "Trivia Quiz correct! +KSH 15 🧠", at: Date.now() }, ...(user.activity || []).slice(0, 19)] });
      toast("🧠 Correct! +KSH 15");
    } else {
      toast("❌ Wrong. Try again!");
    }
  }

  async function sendChat() {
    if (!user.activated) { toast("Activate your account first!"); return; }
    if (!chatInput.trim() || chatLoading) return;
    const newMsgs = [...chatMsgs, { role: "user", content: chatInput }];
    setChatMsgs(newMsgs); setChatInput(""); setChatLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json", "anthropic-dangerous-direct-browser-access": "true" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: "You are EarnHub AI, a friendly assistant for a Kenyan earning platform. Keep responses short (2-3 sentences), helpful and encouraging.",
          messages: newMsgs.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await res.json();
      const reply = data.content?.[0]?.text || "Thanks for chatting! 😊";
      setChatMsgs([...newMsgs, { role: "assistant", content: reply }]);
      if (!chatEarned) {
        setChatEarned(true);
        updateUser({ balance: user.balance + 10, tasksCompleted: user.tasksCompleted + 1, points: user.points + 10, activity: [{ text: "Chat to Earn +KSH 10 💬", at: Date.now() }, ...(user.activity || []).slice(0, 19)] });
        toast("💬 Chat bonus! +KSH 10");
      }
    } catch {
      setChatMsgs([...newMsgs, { role: "assistant", content: "Sorry, something went wrong. Try again!" }]);
    }
    setChatLoading(false);
  }

  const today = new Date().toDateString();

  return (
    <div style={S.page}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Available Tasks</div>

      {!user.activated && (
        <div style={{ ...S.card, background: "linear-gradient(135deg,#1a0e2a,#2a1a40)", border: `1px solid ${COLORS.red}55`, marginBottom: 20, textAlign: "center" }}>
          <div style={{ fontSize: 36, marginBottom: 8 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.red, marginBottom: 6 }}>Account Not Activated</div>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>
            You must pay the KSH {ACTIVATION_FEE} activation fee before you can access tasks or earn money.
            Tasks are only available to paid, activated members.
          </p>
          <div style={{ fontSize: 12, color: COLORS.muted }}>Go to the Dashboard and tap <strong style={{ color: COLORS.gold }}>PAY & ACTIVATE</strong> to get started.</div>
        </div>
      )}

      {[
        { icon: "📅", name: "Daily Check-in", desc: "Come back every day", reward: 5, color: "#22c55e", done: user.lastCheckin === today, action: doCheckin, btnLabel: user.lastCheckin === today ? "✓ Done" : "Check In" },
        { icon: "🧠", name: "Trivia Quiz", desc: "Answer correctly to earn", reward: 15, color: "#f59e0b", done: false, action: startQuiz, btnLabel: "Start" },
        { icon: "💬", name: "Chat to Earn", desc: "Chat with AI once per day", reward: 10, color: "#818cf8", done: chatEarned, action: () => setActiveTask("chat"), btnLabel: chatEarned ? "✓ Earned" : "Chat" },
        { icon: "👥", name: "Refer Friends", desc: "Unlimited — earn per referral", reward: REFERRAL_BONUS, color: "#a78bfa", done: false, action: () => { navigator.clipboard.writeText(`${window.location.origin}?ref=${user.refCode}`).catch(() => {}); toast("Referral link copied! 🔗"); }, btnLabel: "Copy Link" },
      ].map((t) => (
        <div key={t.name} style={S.taskCard}>
          <div style={{ ...S.taskIcon, background: `${t.color}22` }}>{t.icon}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700 }}>{t.name}</div>
            <div style={{ color: COLORS.muted, fontSize: 12 }}>{t.desc}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={S.badge(t.color)}>+KSH {t.reward}</div>
            <button
              style={{ ...S.accentBtn, padding: "7px 14px", fontSize: 12, marginTop: 6, display: "block", opacity: (t.done || !user.activated) ? 0.45 : 1, cursor: !user.activated ? "not-allowed" : "pointer" }}
              onClick={user.activated ? t.action : () => toast("🔒 Activate your account first!")}
            >
              {!user.activated ? "🔒 Locked" : t.btnLabel}
            </button>
          </div>
        </div>
      ))}

      {activeTask === "quiz" && quizQ && (
        <div style={S.overlay}>
          <div style={S.modal}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 16 }}>🧠 Trivia Quiz</div>
            <div style={{ fontSize: 15, marginBottom: 18, lineHeight: 1.5 }}>{quizQ.q}</div>
            {quizQ.opts.map((o, i) => (
              <div key={i} onClick={() => !quizResult && setQuizAns(i)} style={{ padding: "11px 14px", borderRadius: 10, marginBottom: 8, cursor: "pointer", border: `2px solid ${quizAns === i ? COLORS.accent : COLORS.cardBorder}`, background: quizResult !== null ? (i === quizQ.ans ? "#22c55e22" : quizAns === i ? "#ff475722" : COLORS.card) : quizAns === i ? `${COLORS.accent}22` : COLORS.card, fontSize: 14, transition: "all 0.2s" }}>{o}</div>
            ))}
            {quizResult !== null
              ? <button style={{ ...S.accentBtn, width: "100%", marginTop: 8 }} onClick={() => setActiveTask(null)}>Close</button>
              : <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
                  <button style={{ ...S.accentBtn, flex: 1, opacity: quizAns === null ? 0.5 : 1 }} onClick={submitQuiz} disabled={quizAns === null}>Submit</button>
                  <button style={S.ghostBtn} onClick={() => setActiveTask(null)}>Cancel</button>
                </div>}
          </div>
        </div>
      )}

      {activeTask === "chat" && (
        <div style={S.overlay}>
          <div style={{ ...S.modal, display: "flex", flexDirection: "column", height: "70vh" }}>
            <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 12 }}>💬 Chat to Earn</div>
            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6, paddingBottom: 8 }}>
              {chatMsgs.map((m, i) => <div key={i} style={S.chatBubble(m.role === "user")}>{m.content}</div>)}
              {chatLoading && <div style={{ ...S.chatBubble(false), color: COLORS.muted }}>Typing…</div>}
            </div>
            <div style={{ display: "flex", gap: 8, paddingTop: 10, borderTop: `1px solid ${COLORS.cardBorder}` }}>
              <input style={{ ...S.input, marginBottom: 0, flex: 1 }} value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Type a message…" />
              <button style={{ ...S.accentBtn, padding: "0 16px", fontSize: 18 }} onClick={sendChat}>↑</button>
            </div>
            <button style={{ ...S.ghostBtn, width: "100%", marginTop: 8 }} onClick={() => setActiveTask(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Earnings ──────────────────────────────────────────────────────────────────
function Earnings({ user, onUserUpdate, toast }) {
  const [phone, setPhone] = useState(user.phone);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const MIN = 500;

  async function withdraw() {
    const amt = parseFloat(amount);
    if (!user.activated) { toast("Activate your account first!"); return; }
    if (isNaN(amt) || amt < MIN) { toast(`Min withdrawal: KSH ${MIN}`); return; }
    if (amt > user.balance) { toast("Insufficient balance"); return; }
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    const users = loadData("users") || {};
    users[user.phone].balance -= amt;
    users[user.phone].activity = [{ text: `Withdrawal KSH ${amt} to ${phone} 💸`, at: Date.now() }, ...(users[user.phone].activity || []).slice(0, 19)];
    saveData("users", users);
    onUserUpdate({ ...users[user.phone] });
    toast("✅ Withdrawal request submitted!");
    setAmount("");
    setLoading(false);
  }

  return (
    <div style={S.page}>
      <div style={{ fontWeight: 800, fontSize: 20, marginBottom: 16 }}>Earnings & Withdrawal</div>

      {!user.activated ? (
        <div style={{ ...S.card, background: "linear-gradient(135deg,#1a0e2a,#2a1a40)", border: `1px solid ${COLORS.red}55`, textAlign: "center", padding: 32 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>🔒</div>
          <div style={{ fontWeight: 800, fontSize: 17, color: COLORS.red, marginBottom: 8 }}>Withdrawal Locked</div>
          <p style={{ color: COLORS.muted, fontSize: 13, margin: "0 0 16px" }}>
            You must activate your account with the KSH {ACTIVATION_FEE} payment before you can withdraw earnings.
          </p>
          <div style={{ fontSize: 12, color: COLORS.muted }}>
            Go to the <strong style={{ color: COLORS.gold }}>Dashboard</strong> and tap <strong style={{ color: COLORS.gold }}>PAY & ACTIVATE</strong>.
          </div>
        </div>
      ) : (
        <>
          <div style={S.statGrid}>
            <div style={S.statCard}><span style={S.statValue}>KSH {user.balance.toFixed(2)}</span><span style={S.statLabel}>Available</span></div>
            <div style={S.statCard}><span style={{ ...S.statValue, color: "#a78bfa" }}>{user.referrals}</span><span style={S.statLabel}>Referrals</span></div>
          </div>
          <div style={S.card}>
            <div style={S.cardTitle}>💸 Withdraw via M-Pesa</div>
            <label style={S.label}>M-Pesa Phone</label>
            <input style={S.input} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XXXXXXXX" />
            <label style={S.label}>Amount (KSH)</label>
            <input style={S.input} type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={`Min KSH ${MIN}`} />
            <button style={{ ...S.accentBtn, width: "100%", opacity: loading ? 0.7 : 1 }} onClick={withdraw} disabled={loading}>
              {loading ? "Processing…" : "Request Withdrawal →"}
            </button>
            <div style={{ fontSize: 12, color: COLORS.muted, marginTop: 10, textAlign: "center" }}>Min KSH {MIN} · Processed within 24 hours</div>
          </div>
        </>
      )}

      <div style={S.card}>
        <div style={S.cardTitle}>📊 Earning Rates</div>
        {[
          { label: "Daily Check-in", value: "KSH 5/day", icon: "📅" },
          { label: "Trivia Quiz", value: "KSH 15/correct", icon: "🧠" },
          { label: "Chat to Earn", value: "KSH 10/day", icon: "💬" },
          { label: "Refer a Friend", value: `KSH ${REFERRAL_BONUS}/person`, icon: "👥" },
        ].map((r) => (
          <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${COLORS.cardBorder}`, fontSize: 13 }}>
            <div>{r.icon} {r.label}</div>
            <span style={S.badge(COLORS.accent)}>{r.value}</span>
          </div>
        ))}
        <div style={{ fontSize: 11, color: COLORS.muted, marginTop: 10, padding: "8px", background: "#0d1424", borderRadius: 8 }}>
          ℹ️ Referral bonus of KSH {REFERRAL_BONUS} is credited only after your referred friend completes their activation payment.
        </div>
      </div>
    </div>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [showActivation, setShowActivation] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const toast = useCallback((msg) => setToastMsg(msg), []);

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
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&display=swap'); @keyframes toastIn{from{opacity:0;transform:translateX(-50%) translateY(20px)}to{opacity:1;transform:translateX(-50%) translateY(0)}} *{box-sizing:border-box} body{margin:0}`}</style>
      <div style={S.app}>
        <nav style={S.nav}>
          <div style={S.logo}>💰 EarnHub</div>
          <div style={S.navLinks}>
            {["dashboard", "tasks", "earnings"].map((t) => (
              <button key={t} style={S.navBtn(tab === t)} onClick={() => setTab(t)}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
            <button style={S.dangerBtn} onClick={logout}>Out</button>
          </div>
        </nav>
        <div style={S.hero}>
          <div style={S.heroTitle}>Welcome, {user.name.split(" ")[0]}! 👋</div>
          <div style={S.heroSub}>{user.activated ? "Your account is active. Keep earning! 🚀" : "Activate your account to start withdrawing."}</div>
          {user.activated ? <span style={S.badge("#22c55e")}>✓ Account Active</span> : <button style={S.accentBtn} onClick={() => setShowActivation(true)}>PAY & ACTIVATE</button>}
        </div>

        {tab === "dashboard" && <Dashboard user={user} onActivate={() => setShowActivation(true)} onTabChange={setTab} />}
        {tab === "tasks" && <Tasks user={user} onUserUpdate={setUser} toast={toast} />}
        {tab === "earnings" && <Earnings user={user} onUserUpdate={setUser} toast={toast} />}

        {showActivation && <ActivationModal user={user} onClose={() => setShowActivation(false)} />}
        {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
      </div>
    </>
  );
}
