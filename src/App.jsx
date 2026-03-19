import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────
const SUPABASE_URL = "https://icgstmzwyyikdmqqdinn.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImljZ3N0bXp3eXlpa2RtcXFkaW5uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzAwNjEsImV4cCI6MjA4OTQ0NjA2MX0.7d-4Ilu8NOHpAf1lp6OMoZQkHSmUTyiSx0MM62Gu6ik";
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ── Constants ─────────────────────────────────────────────────────
const MAX_DAILY = 3;

const HORSE_STAGES = [
  { min: 0,   label: "小馬",   emoji: "🐴", size: 80,  desc: "剛出生的小馬駒" },
  { min: 30,  label: "中馬",   emoji: "🐎", size: 110, desc: "正在茁壯成長" },
  { min: 60,  label: "大馬",   emoji: "🦄", size: 140, desc: "英姿煥發的駿馬" },
  { min: 100, label: "肌肉馬", emoji: "🏇", size: 170, desc: "稱霸草原的傳說之馬！" },
];

function getStage(total) {
  for (let i = HORSE_STAGES.length - 1; i >= 0; i--) {
    if (total >= HORSE_STAGES[i].min) return HORSE_STAGES[i];
  }
  return HORSE_STAGES[0];
}

function getNextStage(total) {
  for (let s of HORSE_STAGES) {
    if (total < s.min) return s;
  }
  return null;
}

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

// ── Global CSS ────────────────────────────────────────────────────
const GLOBAL_STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;900&family=Lato:wght@300;400;700&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --gold: #C9A84C;
  --gold-light: #E8CC7A;
  --gold-pale: #FDF6E3;
  --gold-border: #D4AF57;
  --white: #FFFFFF;
  --off-white: #FAFAF8;
  --text-dark: #2C2416;
  --text-mid: #6B5A2E;
  --shadow-gold: rgba(201,168,76,0.18);
}

body {
  font-family: 'Lato', sans-serif;
  background: var(--off-white);
  color: var(--text-dark);
  min-height: 100vh;
}

.pf { font-family: 'Playfair Display', serif; }

::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: var(--gold-pale); }
::-webkit-scrollbar-thumb { background: var(--gold-border); border-radius: 3px; }

@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-8px); }
}
@keyframes munch {
  0%,100% { transform: scale(1) rotate(0deg); }
  25%     { transform: scale(1.1) rotate(-3deg); }
  75%     { transform: scale(1.05) rotate(2deg); }
}
@keyframes slideInUp {
  from { opacity:0; transform: translateY(30px); }
  to   { opacity:1; transform: translateY(0); }
}
@keyframes hayFly {
  0%   { opacity:1; transform: translate(0,0) rotate(0deg) scale(1); }
  100% { opacity:0; transform: translate(-120px,-80px) rotate(-30deg) scale(0.3); }
}
@keyframes sparkle {
  0%,100% { opacity:0; transform:scale(0); }
  50%     { opacity:1; transform:scale(1); }
}
@keyframes levelUp {
  0%   { opacity:0; transform: scale(0.5) translateY(20px); }
  60%  { transform: scale(1.15) translateY(-10px); }
  100% { opacity:1; transform: scale(1) translateY(0); }
}
@keyframes progressFill { from { width: 0%; } }
@keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
@keyframes spin {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
`;

// ── UI Helpers ────────────────────────────────────────────────────
function GoldDivider() {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:12, margin:"16px 0" }}>
      <div style={{ flex:1, height:1, background:"linear-gradient(to right, transparent, var(--gold-border))" }} />
      <span style={{ color:"var(--gold)", fontSize:14 }}>✦</span>
      <div style={{ flex:1, height:1, background:"linear-gradient(to left, transparent, var(--gold-border))" }} />
    </div>
  );
}

function Spinner() {
  return (
    <div style={{ textAlign:"center", padding:"40px 0" }}>
      <div style={{
        display:"inline-block", width:32, height:32,
        border:"3px solid var(--gold-pale)",
        borderTop:"3px solid var(--gold)",
        borderRadius:"50%",
        animation:"spin 0.8s linear infinite",
      }} />
      <p style={{ color:"var(--text-mid)", fontSize:13, marginTop:12 }}>載入中...</p>
    </div>
  );
}

// ── Horse Display ─────────────────────────────────────────────────
function HorseDisplay({ totalHay, isMunching, isLevelingUp }) {
  const stage = getStage(totalHay);
  const next  = getNextStage(totalHay);
  const pct   = next
    ? Math.round(((totalHay - stage.min) / (next.min - stage.min)) * 100)
    : 100;

  return (
    <div style={{
      background: "linear-gradient(160deg, #EAF6FF 0%, #F0FAE8 50%, #FFFBF0 100%)",
      borderRadius: 24, padding: "32px 24px 24px",
      textAlign: "center",
      border: "1.5px solid var(--gold-border)",
      boxShadow: "0 8px 32px var(--shadow-gold)",
      position: "relative", overflow: "hidden",
    }}>
      <div style={{
        position:"absolute", top:0, left:0, right:0, bottom:0,
        background: "radial-gradient(ellipse at 70% 20%, rgba(255,255,255,0.6) 0%, transparent 60%)",
        pointerEvents:"none",
      }} />
      <div style={{
        display:"inline-block",
        background: "linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
        color:"#fff", fontSize:12, fontWeight:700, letterSpacing:2,
        padding:"4px 16px", borderRadius:20, marginBottom:12,
        textTransform:"uppercase",
        boxShadow:"0 2px 8px rgba(201,168,76,0.4)",
      }}>
        {stage.label}
      </div>
      <div style={{
        fontSize: stage.size, lineHeight:1, margin:"8px 0",
        animation: isLevelingUp
          ? "levelUp 0.8s cubic-bezier(.34,1.56,.64,1) forwards"
          : isMunching ? "munch 0.4s ease-in-out 3"
          : "float 3s ease-in-out infinite",
        display:"inline-block",
        filter:"drop-shadow(0 8px 16px rgba(0,0,0,0.12))",
      }}>
        {stage.emoji}
      </div>
      <p className="pf" style={{ color:"var(--text-mid)", fontSize:15, fontStyle:"italic", marginTop:4 }}>
        {stage.desc}
      </p>
      <GoldDivider />
      <div style={{ marginTop:4 }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
          <span style={{ fontSize:12, color:"var(--text-mid)", fontWeight:700, letterSpacing:1 }}>
            總草堆 {totalHay}
          </span>
          {next
            ? <span style={{ fontSize:12, color:"var(--gold)" }}>距離{next.label}還差 {next.min - totalHay} 堆</span>
            : <span style={{ fontSize:12, color:"var(--gold)", fontWeight:700 }}>✨ 已達最高等級！</span>
          }
        </div>
        <div style={{
          height:10, background:"rgba(201,168,76,0.15)",
          borderRadius:10, overflow:"hidden",
          border:"1px solid rgba(201,168,76,0.3)",
        }}>
          <div style={{
            height:"100%", width:`${pct}%`,
            background:"linear-gradient(90deg, var(--gold) 0%, var(--gold-light) 100%)",
            borderRadius:10,
            animation:"progressFill 1s ease-out",
            transition:"width 0.6s ease",
          }} />
        </div>
      </div>
    </div>
  );
}

// ── Hay Animation ─────────────────────────────────────────────────
function HayAnimation({ active }) {
  const emojis = ["🌾","🌿","🍀","🌱"];
  if (!active) return null;
  return (
    <div style={{ position:"fixed", top:0, left:0, right:0, bottom:0, pointerEvents:"none", zIndex:999 }}>
      {emojis.map((e,i) => (
        <div key={i} style={{
          position:"absolute", left:`${35+i*8}%`, top:"55%",
          fontSize:28+i*4,
          animation:`hayFly 0.9s ${i*0.1}s ease-in forwards`,
        }}>{e}</div>
      ))}
      {[...Array(6)].map((_,i) => (
        <div key={`sp${i}`} style={{
          position:"absolute", left:`${30+i*7}%`, top:"50%",
          fontSize:18,
          animation:`sparkle 0.6s ${i*0.08}s ease-in-out forwards`,
        }}>✨</div>
      ))}
    </div>
  );
}

// ── Feed Form ─────────────────────────────────────────────────────
function FeedForm({ onFeed, remainingToday, loading }) {
  const [recipient, setRecipient] = useState("");
  const [shaking, setShaking]     = useState(false);

  function handleSubmit() {
    if (!recipient.trim()) {
      setShaking(true);
      setTimeout(()=>setShaking(false), 500);
      return;
    }
    onFeed(recipient.trim());
    setRecipient("");
  }

  const exhausted = remainingToday <= 0;

  return (
    <div style={{
      background:"var(--white)", borderRadius:20, padding:"24px",
      border:"1.5px solid var(--gold-border)",
      boxShadow:"0 4px 20px var(--shadow-gold)",
    }}>
      <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:16 }}>
        <span style={{ fontSize:28 }}>🌾</span>
        <div>
          <h3 className="pf" style={{ color:"var(--gold)", fontSize:18, fontWeight:700 }}>餵草堆給馬</h3>
          <p style={{ fontSize:12, color:"var(--text-mid)" }}>
            今日剩餘次數：
            {[...Array(MAX_DAILY)].map((_,i)=>(
              <span key={i} style={{ fontSize:14, marginLeft:2 }}>
                {i < remainingToday ? "🌾" : "⬜"}
              </span>
            ))}
          </p>
        </div>
      </div>

      {exhausted ? (
        <div style={{
          textAlign:"center", padding:"20px",
          color:"var(--text-mid)", fontSize:14,
          background:"var(--gold-pale)", borderRadius:12,
        }}>
          <div style={{ fontSize:32, marginBottom:8 }}>🌙</div>
          今天的草堆已用完，明天再來餵馬吧！
        </div>
      ) : (
        <>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:12, color:"var(--text-mid)", fontWeight:700, letterSpacing:1, display:"block", marginBottom:6 }}>
              開發對象名稱 *
            </label>
            <input
              type="text"
              value={recipient}
              onChange={e=>setRecipient(e.target.value)}
              onKeyDown={e=>e.key==="Enter"&&handleSubmit()}
              placeholder="輸入開發對象的名字"
              maxLength={20}
              disabled={loading}
              style={{
                width:"100%", padding:"12px 16px", borderRadius:10,
                border:`1.5px solid ${shaking&&!recipient?"#e74c3c":"var(--gold-border)"}`,
                fontSize:15, color:"var(--text-dark)",
                background:"var(--gold-pale)", outline:"none",
                fontFamily:"'Lato', sans-serif",
                transition:"border-color 0.2s",
                opacity: loading ? 0.6 : 1,
              }}
            />
            {shaking && !recipient && (
              <p style={{ color:"#e74c3c", fontSize:12, marginTop:5 }}>請輸入開發對象名稱 🌾</p>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={loading}
            style={{
              width:"100%", padding:"12px",
              background:"linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
              color:"#fff", border:"none", borderRadius:12,
              fontSize:15, fontWeight:700,
              cursor: loading ? "not-allowed" : "pointer",
              fontFamily:"'Playfair Display', serif", letterSpacing:1,
              boxShadow:"0 4px 16px rgba(201,168,76,0.4)",
              opacity: loading ? 0.7 : 1,
              transition:"transform 0.15s",
            }}
          >
            {loading ? "送出中..." : "🌾 送出草堆"}
          </button>
        </>
      )}
    </div>
  );
}

// ── Leaderboard ───────────────────────────────────────────────────
function Leaderboard({ scores, currentUser }) {
  const sorted = [...scores].sort((a,b)=>b.score-a.score);
  const medals = ["🥇","🥈","🥉"];
  return (
    <div style={{
      background:"var(--white)", borderRadius:20, padding:"24px",
      border:"1.5px solid var(--gold-border)",
      boxShadow:"0 4px 20px var(--shadow-gold)",
    }}>
      <h3 className="pf" style={{ color:"var(--gold)", fontSize:18, fontWeight:700, marginBottom:16 }}>
        🏆 貢獻排行榜
      </h3>
      {sorted.length === 0 ? (
        <p style={{ color:"var(--text-mid)", fontSize:14, textAlign:"center", padding:"20px 0" }}>
          還沒有人餵過馬，快來第一個吧！
        </p>
      ) : (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {sorted.map((s,i) => {
            const isMe = s.name === currentUser;
            return (
              <div key={s.name} style={{
                display:"flex", alignItems:"center", gap:12,
                padding:"10px 14px", borderRadius:12,
                background: isMe
                  ? "linear-gradient(135deg, rgba(201,168,76,0.15) 0%, rgba(232,204,122,0.08) 100%)"
                  : i===0 ? "rgba(255,215,0,0.06)" : "rgba(0,0,0,0.02)",
                border: isMe ? "1.5px solid var(--gold-border)" : "1.5px solid transparent",
                animation:`slideInUp 0.4s ${i*0.07}s both`,
              }}>
                <span style={{ fontSize:20, width:28, textAlign:"center" }}>
                  {medals[i] || `${i+1}`}
                </span>
                <span style={{ flex:1, fontSize:14, fontWeight: isMe?700:400, color: isMe?"var(--gold)":"var(--text-dark)" }}>
                  {s.name} {isMe && <span style={{ fontSize:11, opacity:0.7 }}>(我)</span>}
                </span>
                <span style={{
                  fontSize:13, fontWeight:700,
                  color: i===0?"#C9A84C":i===1?"#A0A0A0":i===2?"#CD7F32":"var(--text-mid)",
                }}>
                  {s.score} 堆
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Recent Activity ───────────────────────────────────────────────
function RecentActivity({ history }) {
  if (!history.length) return null;
  return (
    <div style={{
      background:"var(--white)", borderRadius:20, padding:"20px 24px",
      border:"1.5px solid var(--gold-border)",
      boxShadow:"0 4px 20px var(--shadow-gold)",
    }}>
      <h3 className="pf" style={{ color:"var(--gold)", fontSize:16, fontWeight:700, marginBottom:12 }}>
        📋 最近的餵食紀錄
      </h3>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {history.slice(0,5).map((h,i) => (
          <div key={i} style={{
            fontSize:13, color:"var(--text-mid)",
            padding:"8px 12px", background:"var(--gold-pale)",
            borderRadius:10, borderLeft:"3px solid var(--gold)",
            animation:`fadeIn 0.3s ${i*0.05}s both`,
          }}>
            <strong style={{ color:"var(--text-dark)" }}>{h.fed_by}</strong>
            {" 餵食了 "}
            <strong style={{ color:"var(--gold)" }}>{h.recipient}</strong>
            <span style={{ fontSize:11, opacity:0.5, marginLeft:8 }}>
              {new Date(h.fed_at).toLocaleDateString("zh-TW", { month:"numeric", day:"numeric", hour:"2-digit", minute:"2-digit" })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Login Page ────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [name, setName]   = useState("");
  const [error, setError] = useState("");

  function handleEnter() {
    if (!name.trim()) { setError("請輸入你的名字 🐴"); return; }
    onLogin(name.trim());
  }

  return (
    <div style={{
      minHeight:"100vh",
      background:"linear-gradient(145deg, #FFFDF5 0%, #F5F0E8 40%, #EAF6FF 100%)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:24, position:"relative", overflow:"hidden",
    }}>
      <div style={{
        position:"absolute", top:"-10%", right:"-5%", width:300, height:300,
        background:"radial-gradient(circle, rgba(201,168,76,0.12) 0%, transparent 70%)",
        borderRadius:"50%",
      }} />
      <div style={{
        position:"absolute", bottom:"-5%", left:"-8%", width:400, height:400,
        background:"radial-gradient(circle, rgba(122,182,72,0.08) 0%, transparent 70%)",
        borderRadius:"50%",
      }} />
      <div style={{
        background:"var(--white)", borderRadius:28, padding:"48px 40px",
        maxWidth:400, width:"100%",
        border:"1.5px solid var(--gold-border)",
        boxShadow:"0 20px 60px var(--shadow-gold)",
        textAlign:"center", position:"relative",
        animation:"slideInUp 0.6s cubic-bezier(.34,1.56,.64,1)",
      }}>
        <div style={{ fontSize:72, animation:"float 3s ease-in-out infinite", display:"inline-block", marginBottom:8 }}>
          🐴
        </div>
        <h1 className="pf" style={{
          fontSize:28, fontWeight:900,
          background:"linear-gradient(135deg, var(--gold) 0%, #A07830 100%)",
          WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          marginBottom:6,
        }}>草原上的馬</h1>
        <p style={{ color:"var(--text-mid)", fontSize:14, marginBottom:28, fontStyle:"italic" }}>
          一起餵養我們的團隊之馬
        </p>
        <GoldDivider />
        <div style={{ marginTop:20, marginBottom:8 }}>
          <input
            type="text"
            placeholder="輸入你的名字"
            value={name}
            onChange={e=>setName(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleEnter()}
            style={{
              width:"100%", padding:"14px 18px", borderRadius:14,
              border:`1.5px solid ${error?"#e74c3c":"var(--gold-border)"}`,
              fontSize:16, color:"var(--text-dark)",
              background:"var(--gold-pale)", outline:"none", textAlign:"center",
              fontFamily:"'Playfair Display', serif", letterSpacing:1,
            }}
          />
          {error && <p style={{ color:"#e74c3c", fontSize:12, marginTop:6 }}>{error}</p>}
        </div>
        <button
          onClick={handleEnter}
          style={{
            width:"100%", marginTop:16, padding:"14px",
            background:"linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
            color:"#fff", border:"none", borderRadius:14,
            fontSize:16, fontWeight:700, cursor:"pointer",
            fontFamily:"'Playfair Display', serif", letterSpacing:1.5,
            boxShadow:"0 6px 24px rgba(201,168,76,0.4)",
            transition:"transform 0.15s",
          }}
          onMouseEnter={e=>e.target.style.transform="translateY(-2px)"}
          onMouseLeave={e=>e.target.style.transform="translateY(0)"}
        >
          進入草原 →
        </button>
        <p style={{ fontSize:11, color:"var(--text-mid)", marginTop:16, opacity:0.7 }}>
          每天最多可以餵食 {MAX_DAILY} 次草堆
        </p>
      </div>
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────
export default function App() {
  const [user, setUser]               = useState(null);
  const [totalHay, setTotalHay]       = useState(0);
  const [scores, setScores]           = useState([]);
  const [fedToday, setFedToday]       = useState(0);
  const [history, setHistory]         = useState([]);
  const [isMunching, setMunching]     = useState(false);
  const [isLeveling, setLeveling]     = useState(false);
  const [showHay, setShowHay]         = useState(false);
  const [toast, setToast]             = useState(null);
  const [loading, setLoading]         = useState(false);
  const [initLoading, setInitLoading] = useState(false);

  function showToast(msg, color="#C9A84C") {
    setToast({ msg, color });
    setTimeout(()=>setToast(null), 2800);
  }

  async function loadData(userName) {
    setInitLoading(true);
    try {
      const { data: horse } = await supabase
        .from("horse_state").select("total_hay").eq("id", 1).single();
      if (horse) setTotalHay(horse.total_hay);

      const { data: users } = await supabase
        .from("users").select("name, score").order("score", { ascending: false });
      if (users) setScores(users);

      const { data: logs } = await supabase
        .from("feed_logs").select("*").order("fed_at", { ascending: false }).limit(10);
      if (logs) setHistory(logs);

      const { count } = await supabase
        .from("feed_logs")
        .select("*", { count:"exact", head:true })
        .eq("fed_by", userName)
        .gte("fed_at", `${todayStr()}T00:00:00`)
        .lte("fed_at", `${todayStr()}T23:59:59`);
      setFedToday(count ?? 0);

    } catch(e) {
      showToast("⚠️ 載入資料失敗，請重新整理", "#e74c3c");
    }
    setInitLoading(false);
  }

  async function handleLogin(name) {
    setUser(name);
    await loadData(name);
  }

  async function handleFeed(recipient) {
    if (fedToday >= MAX_DAILY || loading) return;
    const prevStage = getStage(totalHay);
    setLoading(true);

    try {
      const newTotal = totalHay + 1;

      const { error: e1 } = await supabase
        .from("horse_state").update({ total_hay: newTotal }).eq("id", 1);
      if (e1) throw e1;

      const myScore = (scores.find(s=>s.name===user)?.score ?? 0) + 1;
      const { error: e2 } = await supabase
        .from("users").upsert({ name: user, score: myScore }, { onConflict: "name" });
      if (e2) throw e2;

      const { error: e3 } = await supabase
        .from("feed_logs").insert({ fed_by: user, recipient });
      if (e3) throw e3;

      setShowHay(true);
      setTimeout(()=>{
        setShowHay(false);
        setMunching(true);
        setTotalHay(newTotal);
        setFedToday(f => f + 1);
        setScores(prev => {
          const exists = prev.find(s=>s.name===user);
          const updated = exists
            ? prev.map(s => s.name===user ? {...s, score: s.score+1} : s)
            : [...prev, { name:user, score:1 }];
          return updated.sort((a,b)=>b.score-a.score);
        });
        setHistory(prev => [{ fed_by:user, recipient, fed_at: new Date().toISOString() }, ...prev]);
        setTimeout(()=>setMunching(false), 1200);

        const newStage = getStage(newTotal);
        if (newStage.label !== prevStage.label) {
          setTimeout(()=>{
            setLeveling(true);
            showToast(`🎉 馬進化了！變成${newStage.label}！`, "#7AB648");
            setTimeout(()=>setLeveling(false), 900);
          }, 400);
        } else {
          showToast(`🌾 成功餵食！開發對象：${recipient}`, "#C9A84C");
        }
      }, 700);

    } catch(err) {
      showToast("❌ 送出失敗，請再試一次", "#e74c3c");
    }
    setLoading(false);
  }

  if (!user) return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <LoginPage onLogin={handleLogin} />
    </>
  );

  const myScore   = scores.find(s=>s.name===user)?.score ?? 0;
  const remaining = Math.max(0, MAX_DAILY - fedToday);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>
      <HayAnimation active={showHay} />

      {toast && (
        <div style={{
          position:"fixed", top:20, left:"50%", transform:"translateX(-50%)",
          background:"var(--white)", border:`1.5px solid ${toast.color}`,
          color:toast.color, padding:"12px 24px", borderRadius:40,
          fontSize:14, fontWeight:700,
          boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
          zIndex:1000, animation:"slideInUp 0.4s cubic-bezier(.34,1.56,.64,1)",
          whiteSpace:"nowrap",
        }}>
          {toast.msg}
        </div>
      )}

      <header style={{
        background:"var(--white)", borderBottom:"1.5px solid var(--gold-border)",
        padding:"14px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        boxShadow:"0 2px 12px var(--shadow-gold)",
        position:"sticky", top:0, zIndex:100,
      }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:24 }}>🐴</span>
          <span className="pf" style={{
            fontSize:18, fontWeight:700,
            background:"linear-gradient(135deg, var(--gold) 0%, #A07830 100%)",
            WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
          }}>草原上的馬</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{
            background:"var(--gold-pale)", borderRadius:20,
            padding:"4px 12px", fontSize:13,
            border:"1px solid var(--gold-border)",
            color:"var(--gold)", fontWeight:700,
          }}>✦ {user}</div>
          <button
            onClick={()=>{ setUser(null); setScores([]); setHistory([]); setFedToday(0); setTotalHay(0); }}
            style={{
              background:"transparent", border:"1px solid var(--gold-border)",
              color:"var(--text-mid)", borderRadius:20,
              padding:"4px 12px", fontSize:12, cursor:"pointer",
            }}
          >登出</button>
        </div>
      </header>

      <main style={{ maxWidth:480, margin:"0 auto", padding:"20px 16px 60px", display:"flex", flexDirection:"column", gap:16 }}>
        <div style={{
          background:"linear-gradient(135deg, var(--gold) 0%, var(--gold-light) 100%)",
          borderRadius:16, padding:"14px 20px",
          display:"flex", alignItems:"center", justifyContent:"space-between",
          boxShadow:"0 4px 16px rgba(201,168,76,0.35)",
        }}>
          <div>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.8)", letterSpacing:1, marginBottom:2 }}>我的累積貢獻</p>
            <p className="pf" style={{ fontSize:26, fontWeight:900, color:"#fff", lineHeight:1 }}>
              {myScore} <span style={{ fontSize:14, fontWeight:400 }}>草堆</span>
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.8)", letterSpacing:1, marginBottom:2 }}>今日剩餘</p>
            <p style={{ fontSize:22, lineHeight:1 }}>
              {[...Array(MAX_DAILY)].map((_,i)=>(
                <span key={i}>{i < remaining ? "🌾" : "🩶"}</span>
              ))}
            </p>
          </div>
        </div>

        {initLoading ? <Spinner /> : (
          <>
            <HorseDisplay totalHay={totalHay} isMunching={isMunching} isLevelingUp={isLeveling} />
            <FeedForm onFeed={handleFeed} remainingToday={remaining} loading={loading} />
            <RecentActivity history={history} />
            <Leaderboard scores={scores} currentUser={user} />
            <div style={{
              background:"var(--white)", borderRadius:20, padding:"20px 24px",
              border:"1.5px solid var(--gold-border)",
              boxShadow:"0 4px 20px var(--shadow-gold)",
            }}>
              <h3 className="pf" style={{ color:"var(--gold)", fontSize:16, fontWeight:700, marginBottom:12 }}>
                📜 成長里程碑
              </h3>
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {HORSE_STAGES.map((s,i) => {
                  const reached = totalHay >= s.min;
                  return (
                    <div key={i} style={{
                      display:"flex", alignItems:"center", gap:12,
                      padding:"8px 12px", borderRadius:10,
                      background: reached ? "rgba(201,168,76,0.08)" : "transparent",
                      opacity: reached ? 1 : 0.5,
                    }}>
                      <span style={{ fontSize:24 }}>{s.emoji}</span>
                      <div style={{ flex:1 }}>
                        <span style={{ fontSize:13, fontWeight:700, color: reached?"var(--gold)":"var(--text-mid)" }}>
                          {s.label}
                        </span>
                        <span style={{ fontSize:12, color:"var(--text-mid)", marginLeft:8 }}>
                          {s.min === 0 ? "起始" : `累積 ${s.min} 草堆`}
                        </span>
                      </div>
                      {reached && <span style={{ fontSize:14 }}>✅</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </main>
    </>
  );
}
