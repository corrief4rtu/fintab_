import React, { useState, useCallback, useMemo, useContext, createContext, useRef } from "react";

// Migrate localStorage from old "spendly_" prefix to "fintab_"
['transactions','budgets','settings','plans','dark'].forEach(k => {
  const old = localStorage.getItem(`spendly_${k}`);
  if (old && !localStorage.getItem(`fintab_${k}`)) {
    localStorage.setItem(`fintab_${k}`, old);
  }
  if (old) localStorage.removeItem(`spendly_${k}`);
});

// ─── THEME ────────────────────────────────────────────────────────────────────

const T_LIGHT = {
  outer:"#E5E5EA", phone:"#FFFFFF", bg:"#FFFFFF", bg2:"#F2F2F7", bg3:"#E5E5EA",
  card:"linear-gradient(135deg,#1C1C1E 0%,#2C2C2E 100%)",
  text:"#1C1C1E", text2:"#8E8E93", text3:"#C7C7CC",
  border:"rgba(0,0,0,0.05)", border2:"rgba(0,0,0,0.07)",
  accent:"#007AFF", green:"#30D158", red:"#FF453A", orange:"#FF9F0A",
  tabbar:"rgba(255,255,255,0.96)", tabbarBorder:"rgba(0,0,0,0.07)",
  shadow:"0 1px 4px rgba(0,0,0,0.06)", statusBg:"#FFFFFF", isDark:false,
};
const T_DARK = {
  outer:"#000000", phone:"#1C1C1E", bg:"#1C1C1E", bg2:"#2C2C2E", bg3:"#000000",
  card:"linear-gradient(135deg,#2C2C2E 0%,#3A3A3C 100%)",
  text:"#FFFFFF", text2:"#8E8E93", text3:"#48484A",
  border:"rgba(255,255,255,0.08)", border2:"rgba(255,255,255,0.06)",
  accent:"#0A84FF", green:"#30D158", red:"#FF453A", orange:"#FF9F0A",
  tabbar:"rgba(28,28,30,0.96)", tabbarBorder:"rgba(255,255,255,0.07)",
  shadow:"0 2px 8px rgba(0,0,0,0.5)", statusBg:"#1C1C1E", isDark:true,
};
const ThemeCtx = createContext(T_LIGHT);
const useTheme = () => useContext(ThemeCtx);

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const EXP_CATS = [
  { name:"Food & Drink",  icon:"🍽",  color:"#FF6B6B" },
  { name:"Transport",     icon:"🚗",  color:"#4ECDC4" },
  { name:"Housing",       icon:"🏠",  color:"#45B7D1" },
  { name:"Personal Care", icon:"💆",  color:"#96CEB4" },
  { name:"Shopping",      icon:"🛍",  color:"#FFEAA7" },
  { name:"Lifestyle",     icon:"🎯",  color:"#DDA0DD" },
  { name:"Subscriptions", icon:"📱",  color:"#98D8C8" },
  { name:"Education",     icon:"🎓",  color:"#F7DC6F" },
  { name:"Finance",       icon:"💸",  color:"#82E0AA" },
  { name:"Other",         icon:"🎁",  color:"#F0B27A" },
];

const INC_CATS = [
  { name:"Salary",         icon:"💰", color:"#30D158" },
  { name:"Freelance",      icon:"💻", color:"#32ADE6" },
  { name:"Rent Income",    icon:"🏘",  color:"#45B7D1" },
  { name:"Dividends",      icon:"📈", color:"#34C759" },
  { name:"Bonus",          icon:"🏆", color:"#FF9F0A" },
  { name:"Parents Help",   icon:"🤝", color:"#AF52DE" },
  { name:"Pocket Money",   icon:"🎁", color:"#FF6B6B" },
  { name:"Transfer",       icon:"💸", color:"#5AC8FA" },
  { name:"Investment",     icon:"🏦", color:"#64D2FF" },
  { name:"Other Income",   icon:"✨", color:"#FECC02" },
];

const QUOTES = [
  { text:"A budget is telling your money where to go instead of wondering where it went.", author:"Dave Ramsey" },
  { text:"Do not save what is left after spending; spend what is left after saving.", author:"Warren Buffett" },
  { text:"Beware of little expenses; a small leak will sink a great ship.", author:"Benjamin Franklin" },
  { text:"It's not your salary that makes you rich, it's your spending habits.", author:"Charles Jaffe" },
  { text:"Money is a terrible master but an excellent servant.", author:"P.T. Barnum" },
  { text:"Wealth consists not in having great possessions, but in having few wants.", author:"Epictetus" },
  { text:"Every time you borrow money, you're robbing your future self.", author:"Nathan W. Morris" },
  { text:"Financial freedom is available to those who learn about it and work for it.", author:"Robert Kiyosaki" },
  { text:"The goal isn't more money. The goal is living life on your terms.", author:"Chris Brogan" },
  { text:"Never spend your money before you have it.", author:"Thomas Jefferson" },
  { text:"The real measure of wealth is how much you'd be worth if you lost all your money.", author:"Unknown" },
  { text:"An investment in knowledge pays the best interest.", author:"Benjamin Franklin" },
  { text:"Rich people have small TVs and big libraries; poor people have small libraries and big TVs.", author:"Zig Ziglar" },
  { text:"If you buy things you do not need, soon you will have to sell things you need.", author:"Warren Buffett" },
  { text:"Wealth is not about having a lot of money; it's about having a lot of options.", author:"Chris Rock" },
  { text:"Stop buying things you don't need, to impress people you don't like.", author:"Dave Ramsey" },
  { text:"Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.", author:"Dave Ramsey" },
  { text:"It's not what you make, it's what you keep that determines wealth.", author:"Unknown" },
  { text:"Before you speak, listen. Before you write, think. Before you spend, earn.", author:"William Arthur Ward" },
  { text:"Too many people spend money they haven't earned to buy things they don't want to impress people they don't like.", author:"Will Rogers" },
  { text:"You can't pour from an empty cup. Spend on what restores you.", author:"Life Balance" },
  { text:"Rest, travel, experience — these are not expenses. They are investments in your story.", author:"Life Balance" },
  { text:"Mental health is not a luxury. Invest in yourself without guilt.", author:"Wellbeing First" },
  { text:"Self-care is not selfish. You cannot serve from an empty vessel.", author:"Eleanor Brown" },
  { text:"The best investment is in yourself. The more you learn, the more you earn.", author:"Benjamin Franklin" },
  { text:"Track every dirham. Your future self will thank you.", author:"Smart Money" },
  { text:"Budget is not a cage. It's a map.", author:"Smart Money" },
  { text:"Spend less than you earn. Invest the difference. Repeat.", author:"Smart Money" },
  { text:"The best financial tool is awareness, not restriction.", author:"Financial Wisdom" },
  { text:"One coffee out won't break you. Ten daily habits might.", author:"Mindful Spending" },
  { text:"A dollar saved is a dollar earned — but only if you know where it went.", author:"Financial Wisdom" },
  { text:"What gets measured gets managed.", author:"Peter Drucker" },
  { text:"Small daily improvements are the key to staggering long-term results.", author:"Robin Sharma" },
  { text:"The secret to getting ahead is getting started.", author:"Mark Twain" },
  { text:"Success is the sum of small efforts, repeated day in and day out.", author:"Robert Collier" },
  { text:"Compound interest is the eighth wonder of the world.", author:"Albert Einstein" },
  { text:"Price is what you pay. Value is what you get.", author:"Warren Buffett" },
  { text:"The best time to plant a tree was 20 years ago. The second best time is now.", author:"Chinese Proverb" },
  { text:"Formal education will make you a living. Self-education will make you a fortune.", author:"Jim Rohn" },
  { text:"Time is more valuable than money. You can get more money, but you cannot get more time.", author:"Jim Rohn" },
  { text:"Don't work for money; make money work for you.", author:"Robert Kiyosaki" },
  { text:"Never depend on a single income. Make investment to create a second source.", author:"Warren Buffett" },
  { text:"Spend extravagantly on the things you love, and cut costs mercilessly on the things you don't.", author:"Ramit Sethi" },
  { text:"A wise person should have money in their head, but not in their heart.", author:"Jonathan Swift" },
  { text:"Wealth is the ability to fully experience life.", author:"Henry David Thoreau" },
  { text:"The art is not in making money, but in keeping it.", author:"Proverb" },
  { text:"He who buys what he does not need, steals from himself.", author:"Swedish Proverb" },
  { text:"Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.", author:"Ayn Rand" },
  { text:"The secret of getting rich is living well below your means.", author:"Unknown" },
  { text:"Financial success is a mindset, not a bank balance.", author:"Unknown" },
  { text:"Frugality is the foundation of all virtues.", author:"Ben Franklin" },
  { text:"You must gain control over your money or the lack of it will forever control you.", author:"Dave Ramsey" },
  { text:"The more you learn, the more you earn.", author:"Warren Buffett" },
  { text:"Money grows on the tree of persistence.", author:"Japanese Proverb" },
  { text:"Wealth is built one decision at a time.", author:"Unknown" },
  { text:"Every pound you save today is two pounds you'll have tomorrow.", author:"Unknown" },
  { text:"A good financial plan is a road map that shows us exactly how the choices we make today will affect our future.", author:"Alexa Von Tobel" },
  { text:"The habit of saving is itself an education; it fosters every virtue, teaches self-denial.", author:"T.T. Munger" },
  { text:"Manage your spending by paying yourself first.", author:"George Clason" },
  { text:"In the middle of every difficulty lies opportunity.", author:"Albert Einstein" },
  { text:"Diligence is the mother of good luck.", author:"Benjamin Franklin" },
];

const MONTH_NAMES  = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const CURRENCIES   = ["AED","USD","EUR","GBP","RUB","KZT","TRY","SAR"];

const DEFAULT_SETTINGS = { name:"Daniil", currency:"AED", monthlyBudgetLimit:12000, darkMode:false };
const DEFAULT_BUDGETS  = [
  { category:"Food & Drink",  limit:2000 },
  { category:"Transport",     limit:500  },
  { category:"Lifestyle",     limit:800  },
  { category:"Shopping",      limit:1000 },
  { category:"Personal Care", limit:500  },
];

// ─── HOOK ─────────────────────────────────────────────────────────────────────

function useLocalStorage(key, init) {
  const [val, setVal] = useState(() => {
    try { const r = localStorage.getItem(key); return r !== null ? JSON.parse(r) : init; }
    catch { return init; }
  });
  const set = useCallback((v) => {
    setVal(prev => {
      const next = typeof v === "function" ? v(prev) : v;
      try { localStorage.setItem(key, JSON.stringify(next)); } catch {}
      return next;
    });
  }, [key]);
  return [val, set];
}

// ─── UTILS ────────────────────────────────────────────────────────────────────

const getCat     = n => EXP_CATS.find(c => c.name === n) ?? EXP_CATS[EXP_CATS.length - 1];
const getIncCat  = n => INC_CATS.find(c => c.name === n) ?? INC_CATS[INC_CATS.length - 1];
const uid        = () => Date.now().toString(36) + Math.random().toString(36).slice(2);
const greeting   = () => { const h = new Date().getHours(); return h<12?"morning":h<17?"afternoon":"evening"; };

function getDailyQuote() {
  const d = new Date();
  const day = Math.floor((d - new Date(d.getFullYear(),0,0)) / 86400000);
  return QUOTES[day % QUOTES.length];
}

function formatTime(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit",hour12:false});
}

function formatDate(iso) {
  const d   = new Date(iso);
  const now = new Date();
  const t0  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const tx  = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const tm  = formatTime(iso);
  if (tx === t0)          return `Today, ${tm}`;
  if (tx === t0-86400000) return `Yesterday, ${tm}`;
  return `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}, ${tm}`;
}

function filterByMonth(txs, y, m) {
  return txs.filter(t => { const d = new Date(t.date); return d.getFullYear()===y && d.getMonth()===m; });
}

function filterByPeriod(txs, periodType, year, month) {
  if (periodType === "month") return filterByMonth(txs, year, month);
  const q = Math.floor(month / 3);
  const ms = [q*3, q*3+1, q*3+2];
  return txs.filter(t => { const d = new Date(t.date); return d.getFullYear()===year && ms.includes(d.getMonth()); });
}

function groupByDate(txs) {
  const now = new Date();
  const t0  = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const map = new Map();
  [...txs].sort((a,b) => new Date(b.date)-new Date(a.date)).forEach(tx => {
    const d   = new Date(tx.date);
    const day = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const lbl = day===t0 ? "Today" : day===t0-86400000 ? "Yesterday"
      : `${d.getDate()} ${SHORT_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    if (!map.has(lbl)) map.set(lbl, []);
    map.get(lbl).push(tx);
  });
  return [...map.entries()];
}

function generateInsights(txs, budgets, y, m, currency) {
  const ins  = [];
  const cur  = filterByMonth(txs, y, m);
  let pm=m-1, py=y; if(pm<0){pm=11;py--;}
  const prev = filterByMonth(txs, py, pm);

  // Budget overruns
  budgets.forEach(b => {
    if (!b.limit) return;
    const spent = cur.filter(t=>t.type==="expense"&&t.category===b.category).reduce((s,t)=>s+Math.abs(t.amount),0);
    if (!spent) return;
    const pct = Math.round(((spent-b.limit)/b.limit)*100);
    if (pct > 40) {
      ins.push({ icon:"⚠️", color:"#FF453A",
        text:`${b.category} exceeded budget by ${pct}%. Worth reviewing your spending here.` });
    } else if (pct > 10) {
      ins.push({ icon:"💙", color:"#007AFF",
        text:`${b.category} is ${pct}% over budget. A little extra is fine — you deserve it sometimes.` });
    }
  });

  // Salary increase
  const curSal  = cur.filter(t=>t.category==="Salary").reduce((s,t)=>s+t.amount,0);
  const prevSal = prev.filter(t=>t.category==="Salary").reduce((s,t)=>s+t.amount,0);
  if (curSal > prevSal && prevSal > 0) {
    const pct = Math.round(((curSal-prevSal)/prevSal)*100);
    ins.push({ icon:"🎉", color:"#30D158",
      text:`Congrats on the salary increase! ${pct}% more than last month.` });
  }

  // Total spending went down
  const curExp  = cur.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0);
  const prevExp = prev.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0);
  if (prevExp > 0 && curExp < prevExp * 0.9) {
    const pct = Math.round(((prevExp-curExp)/prevExp)*100);
    ins.push({ icon:"📉", color:"#30D158",
      text:`Expenses down ${pct}% vs last month. Great financial discipline!` });
  }

  // More saved this month
  const curInc  = cur.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const prevInc = prev.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const curSaved = curInc - curExp, prevSaved = prevInc - prevExp;
  if (prevSaved > 0 && curSaved > prevSaved && prev.length > 0) {
    ins.push({ icon:"📈", color:"#30D158",
      text:`You saved more this month than last month. Keep it up!` });
  }

  if (ins.length === 0 && cur.length > 0)
    ins.push({ icon:"✅", color:"#30D158", text:"Everything looks balanced this month. Keep it up!" });
  if (cur.length === 0)
    ins.push({ icon:"💡", color:"#8E8E93", text:"No transactions yet this month. Add some to see insights." });

  return ins;
}

function getPlanProgress(plan, txs) {
  const { category, action, value, periodType, periodYear, periodMonth } = plan;
  const getCatSpent = arr =>
    category === "__all__"
      ? arr.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0)
      : arr.filter(t=>t.type==="expense"&&t.category===category).reduce((s,t)=>s+Math.abs(t.amount),0);

  const cur = filterByPeriod(txs, periodType, periodYear, periodMonth);
  const current = getCatSpent(cur);

  if (action === "limit") {
    const target = value;
    return { current, target, hasBaseline:true, pct: target>0 ? Math.round(current/target*100) : 0 };
  }

  // reduce: need previous period
  let pY=periodYear, pM=periodMonth;
  if (periodType==="month") { pM--; if(pM<0){pM=11;pY--;} }
  else { pM-=3; if(pM<0){pM+=12;pY--;} }
  const prev    = filterByPeriod(txs, periodType, pY, pM);
  const baseline = getCatSpent(prev);
  if (!baseline) return { current, target:null, hasBaseline:false, pct:null };
  const target = baseline * (1 - value/100);
  return { current, target, hasBaseline:true, pct: target>0 ? Math.round(current/target*100) : (current>0?999:0) };
}

function parseCSV(text) {
  const lines = text.trim().split("\n");
  if (lines.length < 2) return [];
  const results = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = [];
    let cur = "", inQ = false;
    for (const ch of lines[i] + ",") {
      if (ch === '"') { inQ = !inQ; }
      else if (ch === "," && !inQ) { cols.push(cur.trim()); cur = ""; }
      else { cur += ch; }
    }
    if (cols.length < 5) continue;
    const [dateStr, name, category, type, amtStr] = cols;
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) continue;
    const amount = parseFloat(amtStr);
    if (isNaN(amount)) continue;
    const ec = EXP_CATS.find(c => c.name === category);
    const ic = INC_CATS.find(c => c.name === category);
    const icon = ec?.icon ?? ic?.icon ?? "💰";
    results.push({
      id: uid(),
      name: name || "",
      category,
      icon,
      amount: type === "income" ? amount : -amount,
      date: date.toISOString(),
      type: type === "income" ? "income" : "expense",
    });
  }
  return results;
}

// ─── MONTH NAVIGATOR ─────────────────────────────────────────────────────────

function MonthNavigator({ year, month, onChange }) {
  const th = useTheme();
  const now = new Date();
  const isCur = year===now.getFullYear() && month===now.getMonth();
  const prev = () => month===0 ? onChange(year-1,11) : onChange(year,month-1);
  const next = () => { if(isCur)return; month===11 ? onChange(year+1,0) : onChange(year,month+1); };
  const btn  = (dis) => ({ background:th.bg2, border:"none", borderRadius:8, width:28, height:28,
    cursor:dis?"default":"pointer", fontSize:15, display:"flex", alignItems:"center",
    justifyContent:"center", opacity:dis?0.3:1, flexShrink:0, color:th.text });
  return (
    <div style={{ display:"flex", alignItems:"center", gap:5 }}>
      <button style={btn(false)} onClick={prev}>‹</button>
      <span style={{ fontSize:12, fontWeight:600, color:th.text, minWidth:66, textAlign:"center" }}>
        {SHORT_MONTHS[month]} {year}
      </span>
      <button style={btn(isCur)} onClick={next}>›</button>
    </div>
  );
}

// ─── ADD TRANSACTION MODAL ────────────────────────────────────────────────────

function AddTransactionModal({ defaultType, currency, onAdd, onClose }) {
  const th = useTheme();
  const [type,  setType]  = useState(defaultType);
  const [amount,setAmount]= useState("");
  const [name,  setName]  = useState("");
  const [cat,   setCat]   = useState(EXP_CATS[0].name);
  const [incCat,setIncCat]= useState(INC_CATS[0].name);
  const [date,  setDate]  = useState(() => {
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}T${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`;
  });

  const valid = amount && parseFloat(amount) > 0;

  const save = () => {
    if (!valid) return;
    if (type === "income") {
      const ic = getIncCat(incCat);
      onAdd({ id:uid(), name:name.trim(), category:incCat, icon:ic.icon,
        amount:parseFloat(amount), date:new Date(date).toISOString(), type:"income" });
    } else {
      const ec = getCat(cat);
      onAdd({ id:uid(), name:name.trim(), category:cat, icon:ec.icon,
        amount:-parseFloat(amount), date:new Date(date).toISOString(), type:"expense" });
    }
    onClose();
  };

  const cats = type === "income" ? INC_CATS : EXP_CATS;
  const selCat = type === "income" ? incCat : cat;
  const setSelCat = type === "income" ? setIncCat : setCat;

  return (
    <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:th.bg, borderRadius:"24px 24px 0 0",
        padding:"20px 20px 36px", maxHeight:"88vh", overflowY:"auto", width:"100%" }}>
        <div style={{ width:36, height:4, background:th.bg3, borderRadius:2, margin:"0 auto 18px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:20, fontWeight:700, margin:0, color:th.text }}>New Transaction</h3>
          <button onClick={onClose} style={{ background:th.bg2, border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center",
            justifyContent:"center", color:th.text }}>✕</button>
        </div>

        {/* Type toggle */}
        <div style={{ display:"flex", background:th.bg2, borderRadius:12, padding:3, marginBottom:16 }}>
          {["expense","income"].map(t => (
            <button key={t} onClick={() => setType(t)} style={{ flex:1, padding:"10px", border:"none",
              borderRadius:10, background:type===t ? (t==="expense"?th.red:th.green) : "transparent",
              color:type===t?"white":th.text2, fontSize:14, fontWeight:600, cursor:"pointer" }}>
              {t==="expense" ? "− Expense" : "+ Income"}
            </button>
          ))}
        </div>

        {/* Amount */}
        <div style={{ background:th.bg2, borderRadius:16, padding:"14px 18px", marginBottom:12,
          display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:20, fontWeight:700, color:th.text2 }}>{currency}</span>
          <input type="number" inputMode="decimal" placeholder="0.00" value={amount}
            onChange={e=>setAmount(e.target.value)} autoFocus
            style={{ flex:1, background:"none", border:"none", fontSize:30, fontWeight:700,
              color:th.text, outline:"none", fontFamily:"inherit", minWidth:0 }} />
        </div>

        {/* Description (optional) */}
        <input type="text"
          placeholder={type==="income" ? "Note (optional)" : "Description (optional)"}
          value={name} onChange={e=>setName(e.target.value)}
          style={{ width:"100%", background:th.bg2, border:"none", borderRadius:14,
            padding:"14px 16px", fontSize:15, color:th.text, outline:"none",
            fontFamily:"inherit", boxSizing:"border-box", marginBottom:12 }} />

        {/* Date */}
        <input type="datetime-local" value={date} onChange={e=>setDate(e.target.value)}
          style={{ width:"100%", background:th.bg2, border:"none", borderRadius:14,
            padding:"14px 16px", fontSize:14, color:th.text, outline:"none",
            fontFamily:"inherit", boxSizing:"border-box", marginBottom:16,
            colorScheme: th.isDark ? "dark" : "light" }} />

        {/* Category */}
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 10px", letterSpacing:0.5 }}>CATEGORY</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:8, marginBottom:18 }}>
          {cats.map(c => (
            <button key={c.name} onClick={() => setSelCat(c.name)}
              style={{ background: selCat===c.name ? c.color+"35" : th.bg2,
                border:`2px solid ${selCat===c.name ? c.color : "transparent"}`,
                borderRadius:12, padding:"10px 4px", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <span style={{ fontSize:20 }}>{c.icon}</span>
              <span style={{ fontSize:9, color:th.text, fontWeight:500, lineHeight:1.2,
                textAlign:"center" }}>{c.name.split(" ")[0]}</span>
            </button>
          ))}
        </div>

        <button onClick={save} disabled={!valid}
          style={{ width:"100%", background:type==="expense"?th.red:th.green, border:"none",
            borderRadius:16, padding:"16px", color:"white", fontSize:16, fontWeight:700,
            cursor:valid?"pointer":"default", opacity:valid?1:0.45 }}>
          Save {type==="expense" ? "Expense" : "Income"}
        </button>
      </div>
    </div>
  );
}

// ─── SET BUDGET MODAL ─────────────────────────────────────────────────────────

function SetBudgetModal({ budgets, currency, onSave, onClose }) {
  const th = useTheme();
  const [local, setLocal] = useState(() =>
    EXP_CATS.slice(0,9).map(c => ({ category:c.name, limit: budgets.find(b=>b.category===c.name)?.limit??0 }))
  );
  const upd = (cat,v) => setLocal(p => p.map(b => b.category===cat ? {...b,limit:parseFloat(v)||0} : b));

  return (
    <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:th.bg, borderRadius:"24px 24px 0 0",
        padding:"20px 20px 36px", maxHeight:"85vh", overflowY:"auto", width:"100%" }}>
        <div style={{ width:36, height:4, background:th.bg3, borderRadius:2, margin:"0 auto 18px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontSize:20, fontWeight:700, margin:0, color:th.text }}>Set Budgets</h3>
          <button onClick={onClose} style={{ background:th.bg2, border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center",
            justifyContent:"center", color:th.text }}>✕</button>
        </div>
        {local.map(b => {
          const c = getCat(b.category);
          return (
            <div key={b.category} style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12 }}>
              <div style={{ width:36, height:36, borderRadius:10, background:c.color+"25",
                display:"flex", alignItems:"center", justifyContent:"center", fontSize:18, flexShrink:0 }}>{c.icon}</div>
              <span style={{ flex:1, fontSize:14, fontWeight:500, color:th.text }}>{b.category}</span>
              <div style={{ display:"flex", alignItems:"center", background:th.bg2, borderRadius:12,
                padding:"8px 12px", gap:4 }}>
                <input type="number" placeholder="0" value={b.limit||""}
                  onChange={e=>upd(b.category,e.target.value)}
                  style={{ width:72, background:"none", border:"none", fontSize:15, fontWeight:600,
                    outline:"none", fontFamily:"inherit", textAlign:"right", color:th.text }} />
                <span style={{ fontSize:12, color:th.text2 }}>{currency}</span>
              </div>
            </div>
          );
        })}
        <button onClick={() => { onSave(local.filter(b=>b.limit>0)); onClose(); }}
          style={{ width:"100%", background:th.accent, border:"none", borderRadius:16, padding:"16px",
            color:"white", fontSize:16, fontWeight:700, cursor:"pointer", marginTop:8 }}>
          Save Budgets
        </button>
      </div>
    </div>
  );
}

// ─── ADD PLAN MODAL ───────────────────────────────────────────────────────────

function AddPlanModal({ currency, onAdd, onClose, curYear, curMonth }) {
  const th = useTheme();
  const [category,  setCat]   = useState("__all__");
  const [action,    setAct]   = useState("reduce");
  const [value,     setVal]   = useState("");
  const [periodType,setPType] = useState("month");
  const [pYear,     setPYear] = useState(curYear);
  const [pMonth,    setPMonth]= useState(curMonth);
  const [note,      setNote]  = useState("");

  const allCats = [{ name:"__all__", icon:"📊", color:"#007AFF", label:"All Expenses" },
    ...EXP_CATS.map(c=>({...c,label:c.name}))];
  const selCat = allCats.find(c=>c.name===category) ?? allCats[0];
  const valid  = value && parseFloat(value) > 0;

  const quarterLabel = (y,m) => `Q${Math.floor(m/3)+1} ${y}`;
  const monthOptions = Array.from({length:12},(_,i)=>({ y:curYear, m:i }));

  const save = () => {
    if (!valid) return;
    onAdd({ id:uid(), category, action, value:parseFloat(value),
      periodType, periodYear:pYear, periodMonth:pMonth, note:note.trim(),
      createdAt:new Date().toISOString() });
    onClose();
  };

  return (
    <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:th.bg, borderRadius:"24px 24px 0 0",
        padding:"20px 20px 36px", maxHeight:"88vh", overflowY:"auto", width:"100%" }}>
        <div style={{ width:36, height:4, background:th.bg3, borderRadius:2, margin:"0 auto 18px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontSize:20, fontWeight:700, margin:0, color:th.text }}>Add Goal</h3>
          <button onClick={onClose} style={{ background:th.bg2, border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center",
            justifyContent:"center", color:th.text }}>✕</button>
        </div>

        {/* Category */}
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 8px", letterSpacing:.5 }}>CATEGORY</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:7, marginBottom:16 }}>
          {allCats.map(c=>(
            <button key={c.name} onClick={()=>setCat(c.name)}
              style={{ background:category===c.name ? c.color+"30" : th.bg2,
                border:`2px solid ${category===c.name?c.color:"transparent"}`,
                borderRadius:12, padding:"9px 4px", cursor:"pointer",
                display:"flex", flexDirection:"column", alignItems:"center", gap:3 }}>
              <span style={{ fontSize:18 }}>{c.icon}</span>
              <span style={{ fontSize:8, color:th.text, fontWeight:500, textAlign:"center", lineHeight:1.2 }}>
                {c.name==="__all__"?"All":c.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>

        {/* Action + value */}
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 8px", letterSpacing:.5 }}>GOAL</p>
        <div style={{ display:"flex", gap:8, marginBottom:16 }}>
          <div style={{ display:"flex", background:th.bg2, borderRadius:12, padding:3, flex:1 }}>
            {[["reduce","Reduce by"],["limit","Keep under"]].map(([v,l])=>(
              <button key={v} onClick={()=>setAct(v)}
                style={{ flex:1, padding:"9px 4px", border:"none", borderRadius:10,
                  background:action===v?th.accent:"transparent",
                  color:action===v?"white":th.text2, fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {l}
              </button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", background:th.bg2, borderRadius:12,
            padding:"0 12px", gap:4, flexShrink:0 }}>
            <input type="number" placeholder={action==="reduce"?"20":""} value={value}
              onChange={e=>setVal(e.target.value)} style={{ width:60, background:"none", border:"none",
                fontSize:16, fontWeight:700, outline:"none", fontFamily:"inherit",
                textAlign:"right", color:th.text }} />
            <span style={{ fontSize:13, color:th.text2, fontWeight:600 }}>{action==="reduce"?"%":currency}</span>
          </div>
        </div>

        {/* Period type */}
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 8px", letterSpacing:.5 }}>PERIOD</p>
        <div style={{ display:"flex", background:th.bg2, borderRadius:12, padding:3, marginBottom:12 }}>
          {[["month","Month"],["quarter","Quarter"]].map(([v,l])=>(
            <button key={v} onClick={()=>setPType(v)}
              style={{ flex:1, padding:"9px", border:"none", borderRadius:10,
                background:periodType===v?th.accent:"transparent",
                color:periodType===v?"white":th.text2, fontSize:13, fontWeight:600, cursor:"pointer" }}>
              {l}
            </button>
          ))}
        </div>

        {/* Period picker */}
        {periodType === "month" ? (
          <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:16 }}>
            {monthOptions.map(({y,m})=>(
              <button key={m} onClick={()=>{setPYear(y);setPMonth(m);}}
                style={{ padding:"7px 12px", borderRadius:10, border:"none",
                  background:pYear===y&&pMonth===m?th.accent:th.bg2,
                  color:pYear===y&&pMonth===m?"white":th.text, fontSize:12,
                  fontWeight:500, cursor:"pointer" }}>
                {SHORT_MONTHS[m]}
              </button>
            ))}
          </div>
        ) : (
          <div style={{ display:"flex", gap:6, marginBottom:16 }}>
            {[0,3,6,9].map(qm=>(
              <button key={qm} onClick={()=>{setPYear(curYear);setPMonth(qm);}}
                style={{ flex:1, padding:"9px 4px", borderRadius:10, border:"none",
                  background:pMonth===qm&&pYear===curYear?th.accent:th.bg2,
                  color:pMonth===qm&&pYear===curYear?"white":th.text,
                  fontSize:12, fontWeight:600, cursor:"pointer" }}>
                {quarterLabel(curYear,qm)}
              </button>
            ))}
          </div>
        )}

        {/* Note */}
        <input type="text" placeholder="Note (optional)" value={note} onChange={e=>setNote(e.target.value)}
          style={{ width:"100%", background:th.bg2, border:"none", borderRadius:14,
            padding:"12px 16px", fontSize:14, color:th.text, outline:"none",
            fontFamily:"inherit", boxSizing:"border-box", marginBottom:16 }} />

        <button onClick={save} disabled={!valid}
          style={{ width:"100%", background:th.accent, border:"none", borderRadius:16, padding:"16px",
            color:"white", fontSize:16, fontWeight:700,
            cursor:valid?"pointer":"default", opacity:valid?1:0.45 }}>
          Save Goal
        </button>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

// ─── TRANSACTION DETAIL MODAL ────────────────────────────────────────────────

function TransactionDetailModal({ tx, currency, onDelete, onClose }) {
  const th = useTheme();
  return (
    <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:th.bg, borderRadius:"24px 24px 0 0",
        padding:"20px 20px 40px", width:"100%" }}>
        <div style={{ width:36, height:4, background:th.bg3, borderRadius:2, margin:"0 auto 20px" }} />
        <div style={{ display:"flex", flexDirection:"column", alignItems:"center", marginBottom:18 }}>
          <div style={{ width:64, height:64, borderRadius:20, background:th.bg2,
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:32, marginBottom:10,
            boxShadow:th.shadow }}>{tx.icon}</div>
          <p style={{ fontSize:18, fontWeight:700, color:th.text, margin:0 }}>{tx.category}</p>
          <p style={{ fontSize:12, color:tx.type==="income"?th.green:th.red, margin:"4px 0 0",
            fontWeight:600, letterSpacing:.3 }}>{tx.type==="income" ? "INCOME" : "EXPENSE"}</p>
        </div>
        <div style={{ background:th.bg2, borderRadius:16, padding:"14px 20px", marginBottom:10, textAlign:"center" }}>
          <p style={{ fontSize:11, color:th.text2, margin:"0 0 4px", letterSpacing:.5 }}>AMOUNT</p>
          <p style={{ fontSize:34, fontWeight:700, color:tx.type==="income"?th.green:th.red, margin:0, letterSpacing:-1 }}>
            {tx.type==="income"?"+":"−"}{Math.abs(tx.amount).toLocaleString()} {currency}
          </p>
        </div>
        {tx.name && (
          <div style={{ background:th.bg2, borderRadius:16, padding:"14px 18px", marginBottom:10 }}>
            <p style={{ fontSize:11, color:th.text2, margin:"0 0 5px", letterSpacing:.5 }}>DESCRIPTION</p>
            <p style={{ fontSize:15, color:th.text, margin:0, lineHeight:1.5, wordBreak:"break-word" }}>{tx.name}</p>
          </div>
        )}
        <div style={{ background:th.bg2, borderRadius:16, padding:"14px 18px", marginBottom:20 }}>
          <p style={{ fontSize:11, color:th.text2, margin:"0 0 5px", letterSpacing:.5 }}>DATE & TIME</p>
          <p style={{ fontSize:15, color:th.text, margin:0 }}>
            {new Date(tx.date).toLocaleDateString("en-US",{weekday:"long",year:"numeric",month:"long",day:"numeric"})}
          </p>
          <p style={{ fontSize:13, color:th.text2, margin:"3px 0 0" }}>
            {new Date(tx.date).toLocaleTimeString("en-US",{hour:"2-digit",minute:"2-digit"})}
          </p>
        </div>
        <button onClick={()=>{onDelete(tx.id);onClose();}}
          style={{ width:"100%", background:th.red, border:"none", borderRadius:14, padding:"15px",
            color:"white", fontSize:16, fontWeight:600, cursor:"pointer" }}>
          🗑 Delete Transaction
        </button>
      </div>
    </div>
  );
}

// ─── HOME SCREEN ──────────────────────────────────────────────────────────────

function HomeScreen({ transactions, year, month, onMonthChange, settings, onAddExpense, onAddIncome }) {
  const th      = useTheme();
  const monthTx = filterByMonth(transactions, year, month);
  const income  = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expense = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0);
  const balance = income - expense;
  const recent  = [...transactions].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5);
  const quote   = getDailyQuote();
  const cur     = settings.currency;

  return (
    <div style={{ padding:"0 0 24px" }}>
      <div style={{ padding:"18px 20px 0", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <p style={{ fontSize:13, color:th.text2, margin:0 }}>Good {greeting()},</p>
          <h2 style={{ fontSize:22, fontWeight:700, margin:"2px 0 0", color:th.text }}>{settings.name} 👋</h2>
        </div>
        <MonthNavigator year={year} month={month} onChange={onMonthChange} />
      </div>

      {/* Balance card */}
      <div style={{ margin:"14px 20px 0", background:th.card, borderRadius:20, padding:"20px",
        position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", bottom:-20, left:-20, width:80, height:80,
          borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <p style={{ fontSize:12, color:"rgba(255,255,255,0.5)", margin:0, letterSpacing:.5 }}>
          {SHORT_MONTHS[month].toUpperCase()} {year} · BALANCE
        </p>
        <p style={{ fontSize:34, fontWeight:700, color:"white", margin:"6px 0 16px", letterSpacing:-1 }}>
          {balance.toLocaleString()} <span style={{ fontSize:16, fontWeight:400, opacity:.6 }}>{cur}</span>
        </p>
        <div style={{ display:"flex", alignItems:"stretch" }}>
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#30D158" }} />
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>Income</p>
            </div>
            <p style={{ fontSize:16, fontWeight:600, color:"#30D158", margin:0 }}>+{income.toLocaleString()} {cur}</p>
          </div>
          <div style={{ width:1, background:"rgba(255,255,255,0.15)", margin:"0 18px", flexShrink:0 }} />
          <div style={{ display:"flex", flexDirection:"column" }}>
            <div style={{ display:"flex", alignItems:"center", gap:5, marginBottom:3 }}>
              <div style={{ width:7, height:7, borderRadius:"50%", background:"#FF453A" }} />
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.5)", margin:0 }}>Expenses</p>
            </div>
            <p style={{ fontSize:16, fontWeight:600, color:"#FF453A", margin:0 }}>−{expense.toLocaleString()} {cur}</p>
          </div>
        </div>
      </div>

      {/* Quote */}
      <div style={{ margin:"12px 20px 0", background:th.bg2, borderRadius:14,
        padding:"14px 16px", borderLeft:`3px solid ${th.accent}` }}>
        <p style={{ fontSize:12, color:th.accent, margin:"0 0 5px", fontWeight:600, letterSpacing:.3 }}>💡 DAILY INSIGHT</p>
        <p style={{ fontSize:13, color:th.text, margin:"0 0 4px", fontStyle:"italic", lineHeight:1.5 }}>"{quote.text}"</p>
        <p style={{ fontSize:11, color:th.text2, margin:0 }}>— {quote.author}</p>
      </div>

      {/* Actions */}
      <div style={{ margin:"14px 20px 0", display:"flex", gap:10 }}>
        <button onClick={onAddExpense} style={{ flex:1, background:th.accent, borderRadius:14, border:"none",
          padding:"13px", color:"white", fontSize:14, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <span style={{ fontSize:17 }}>−</span> Add Expense
        </button>
        <button onClick={onAddIncome} style={{ flex:1, background:th.bg2, borderRadius:14, border:"none",
          padding:"13px", color:th.text, fontSize:14, fontWeight:600, cursor:"pointer",
          display:"flex", alignItems:"center", justifyContent:"center", gap:5 }}>
          <span style={{ fontSize:17 }}>+</span> Add Income
        </button>
      </div>

      {/* Recent */}
      <div style={{ margin:"20px 20px 0" }}>
        <h3 style={{ fontSize:17, fontWeight:600, margin:"0 0 10px", color:th.text }}>Recent</h3>
        {recent.length === 0 ? (
          <div style={{ background:th.bg2, borderRadius:16, padding:"28px 16px", textAlign:"center" }}>
            <p style={{ fontSize:30, margin:"0 0 6px" }}>💸</p>
            <p style={{ fontSize:14, color:th.text2, margin:0 }}>No transactions yet</p>
            <p style={{ fontSize:12, color:th.text3, margin:"3px 0 0" }}>Add your first expense above</p>
          </div>
        ) : (
          <div style={{ background:th.bg2, borderRadius:16, overflow:"hidden" }}>
            {recent.map((t,i) => (
              <div key={t.id} style={{ display:"flex", alignItems:"center", padding:"12px 14px",
                borderBottom:i<recent.length-1 ? `1px solid ${th.border}` : "none" }}>
                <div style={{ width:38, height:38, borderRadius:11, background:th.bg,
                  display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                  marginRight:10, boxShadow:th.shadow, flexShrink:0 }}>{t.icon}</div>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ fontSize:14, fontWeight:500, margin:0, color:th.text }}>{t.category}</p>
                  <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:2, flexWrap:"wrap" }}>
                    {t.name && <p style={{ fontSize:11, color:th.text2, margin:0, fontStyle:"italic",
                      overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", maxWidth:130 }}>{t.name}</p>}
                    {t.name && <span style={{ fontSize:11, color:th.text3, flexShrink:0 }}>·</span>}
                    <p style={{ fontSize:11, color:th.text2, margin:0, flexShrink:0 }}>{formatDate(t.date)}</p>
                  </div>
                </div>
                <p style={{ fontSize:15, fontWeight:600, margin:"0 0 0 8px",
                  color:t.type==="income"?th.green:th.text, flexShrink:0 }}>
                  {t.type==="income"?"+":"−"}{Math.abs(t.amount).toLocaleString()} {cur}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TRANSACTIONS SCREEN ──────────────────────────────────────────────────────

function TransactionsScreen({ transactions, year, month, onMonthChange, settings, onDelete, onDetail }) {
  const th = useTheme();
  const [filter,   setFilter]   = useState("All");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo,   setDateTo]   = useState("");
  const cur = settings.currency;

  const monthTx = filterByMonth(transactions, year, month);
  const filtered = monthTx.filter(t => {
    const d = new Date(t.date).toISOString().slice(0, 10);
    return (filter==="All" || (filter==="Income"?t.type==="income":t.type==="expense")) &&
      (!dateFrom || d >= dateFrom) &&
      (!dateTo   || d <= dateTo);
  });
  const groups = groupByDate(filtered);

  return (
    <div style={{ padding:"20px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <h2 style={{ fontSize:26, fontWeight:700, margin:0, color:th.text }}>Transactions</h2>
        <MonthNavigator year={year} month={month} onChange={onMonthChange} />
      </div>

      {/* Filter pills */}
      <div style={{ display:"flex", gap:7, marginBottom:12 }}>
        {["All","Expenses","Income"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)}
            style={{ padding:"7px 14px", borderRadius:20, border:"none",
              background:filter===f?th.accent:th.bg2,
              color:filter===f?"white":th.text, fontSize:13, fontWeight:500, cursor:"pointer" }}>{f}</button>
        ))}
      </div>

      {/* Date range filter */}
      <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:16 }}>
        <div style={{ flex:1, display:"flex", flexDirection:"column", gap:5 }}>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:th.text2, width:28, flexShrink:0 }}>From</span>
            <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)}
              style={{ flex:1, background:th.bg2, border:"none", borderRadius:10, padding:"9px 12px",
                fontSize:13, color:th.text, outline:"none", fontFamily:"inherit",
                colorScheme: th.isDark ? "dark" : "light" }} />
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:6 }}>
            <span style={{ fontSize:11, color:th.text2, width:28, flexShrink:0 }}>To</span>
            <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)}
              style={{ flex:1, background:th.bg2, border:"none", borderRadius:10, padding:"9px 12px",
                fontSize:13, color:th.text, outline:"none", fontFamily:"inherit",
                colorScheme: th.isDark ? "dark" : "light" }} />
          </div>
        </div>
        {(dateFrom || dateTo) && (
          <button onClick={()=>{setDateFrom("");setDateTo("");}}
            style={{ background:th.bg2, border:"none", borderRadius:10, padding:"9px 12px",
              color:th.text2, fontSize:13, cursor:"pointer", whiteSpace:"nowrap", alignSelf:"center" }}>
            Clear
          </button>
        )}
      </div>

      {groups.length === 0 ? (
        <div style={{ background:th.bg2, borderRadius:16, padding:"36px 16px", textAlign:"center" }}>
          <p style={{ fontSize:30, margin:"0 0 6px" }}>📋</p>
          <p style={{ fontSize:14, color:th.text2, margin:0 }}>No transactions found</p>
        </div>
      ) : (
        groups.map(([label, txs]) => (
          <div key={label} style={{ marginBottom:16 }}>
            <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 8px",
              letterSpacing:.5, textTransform:"uppercase" }}>{label}</p>
            <div style={{ background:th.bg2, borderRadius:16, overflow:"hidden" }}>
              {txs.map((t,i) => (
                <div key={t.id} onClick={()=>onDetail(t)}
                  style={{ display:"flex", alignItems:"center", padding:"12px 14px",
                    borderBottom:i<txs.length-1?`1px solid ${th.border}`:"none",
                    cursor:"pointer" }}>
                  <div style={{ width:40, height:40, borderRadius:12, background:th.bg,
                    display:"flex", alignItems:"center", justifyContent:"center", fontSize:20,
                    marginRight:12, boxShadow:th.shadow, flexShrink:0 }}>{t.icon}</div>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ fontSize:14, fontWeight:500, margin:0, color:th.text }}>{t.category}</p>
                    <div style={{ display:"flex", gap:4, alignItems:"center", marginTop:2 }}>
                      {t.name && <p style={{ fontSize:11, color:th.text2, margin:0, fontStyle:"italic",
                        overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap",
                        maxWidth:120 }}>{t.name}</p>}
                      {t.name && <span style={{ fontSize:10, color:th.text3, flexShrink:0 }}>·</span>}
                      <p style={{ fontSize:11, color:th.text2, margin:0, flexShrink:0 }}>{formatTime(t.date)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize:15, fontWeight:600, margin:"0 0 0 8px",
                    color:t.type==="income"?th.green:th.red, flexShrink:0 }}>
                    {t.type==="income"?"+":"−"}{Math.abs(t.amount).toLocaleString()} {cur}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ─── ANALYTICS SCREEN ────────────────────────────────────────────────────────

function AnalyticsScreen({ transactions, year, month, onMonthChange, settings, budgets }) {
  const th = useTheme();
  const monthTx = filterByMonth(transactions, year, month);
  const totalInc = monthTx.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const totalExp = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0);
  const cur      = settings.currency;

  const chartData = useMemo(() => Array.from({length:5},(_,i) => {
    let m=month-(4-i), y=year; while(m<0){m+=12;y--;}
    const txs = filterByMonth(transactions, y, m);
    return { label:SHORT_MONTHS[m],
      income:  txs.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),
      expenses:txs.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0) };
  }), [transactions,year,month]);

  const maxVal = Math.max(...chartData.map(d=>Math.max(d.income,d.expenses)),1);

  const byCategory = EXP_CATS.map(c => ({
    ...c, total: monthTx.filter(t=>t.type==="expense"&&t.category===c.name)
      .reduce((s,t)=>s+Math.abs(t.amount),0)
  })).filter(c=>c.total>0).sort((a,b)=>b.total-a.total);

  const now        = new Date();
  const daysInMon  = new Date(year,month+1,0).getDate();
  const daysPassed = (year===now.getFullYear()&&month===now.getMonth()) ? now.getDate() : daysInMon;

  let pm=month-1, py=year; if(pm<0){pm=11;py--;}
  const prevExp = filterByMonth(transactions,py,pm).filter(t=>t.type==="expense")
    .reduce((s,t)=>s+Math.abs(t.amount),0);
  const vsLast  = prevExp>0 ? Math.round(((totalExp-prevExp)/prevExp)*100) : null;

  const insights = useMemo(() => generateInsights(transactions,budgets,year,month,cur),
    [transactions,budgets,year,month]);

  return (
    <div style={{ padding:"20px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
        <h2 style={{ fontSize:26, fontWeight:700, margin:0, color:th.text }}>Analytics</h2>
        <MonthNavigator year={year} month={month} onChange={onMonthChange} />
      </div>

      {/* Stats row */}
      <div style={{ display:"flex", gap:10, marginBottom:14 }}>
        {[
          { label:"Avg/day", value:daysPassed>0 ? Math.round(totalExp/daysPassed).toLocaleString() : "0", sub:cur, color:th.text },
          { label:"Saved",   value:(totalInc-totalExp).toLocaleString(), sub:cur, color:totalInc-totalExp>=0?th.green:th.red },
          { label:"vs Last", value:vsLast===null?"—":`${vsLast>0?"+":""}${vsLast}%`, sub:"expenses", color:vsLast===null?th.text2:vsLast>0?th.red:th.green },
        ].map(({label,value,sub,color})=>(
          <div key={label} style={{ flex:1, background:th.bg2, borderRadius:14, padding:"14px 12px" }}>
            <p style={{ fontSize:11, color:th.text2, margin:"0 0 4px" }}>{label}</p>
            <p style={{ fontSize:18, fontWeight:700, color, margin:0 }}>{value}</p>
            <p style={{ fontSize:10, color:th.text2, margin:"2px 0 0" }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background:th.bg2, borderRadius:20, padding:"18px", marginBottom:14 }}>
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 14px", letterSpacing:.5 }}>INCOME VS EXPENSES</p>
        <div style={{ display:"flex", alignItems:"flex-end", height:110, justifyContent:"space-around", paddingBottom:6 }}>
          {chartData.map((d,i) => (
            <div key={i} style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4 }}>
              <div style={{ display:"flex", gap:3, alignItems:"flex-end" }}>
                <div style={{ width:16, background:th.green, borderRadius:"3px 3px 0 0",
                  height:`${Math.max(d.income/maxVal*90,d.income>0?3:0)}px`, opacity:.9 }} />
                <div style={{ width:16, background:th.red, borderRadius:"3px 3px 0 0",
                  height:`${Math.max(d.expenses/maxVal*90,d.expenses>0?3:0)}px`, opacity:.9 }} />
              </div>
              <p style={{ fontSize:10, color:th.text2, margin:0, fontWeight:500 }}>{d.label}</p>
            </div>
          ))}
        </div>
        <div style={{ display:"flex", gap:14, marginTop:6 }}>
          {[[th.green,"Income"],[th.red,"Expenses"]].map(([color,label])=>(
            <div key={label} style={{ display:"flex", alignItems:"center", gap:5 }}>
              <div style={{ width:9, height:9, borderRadius:2, background:color }} />
              <span style={{ fontSize:11, color:th.text2 }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* By category + avg/day per category */}
      {byCategory.length > 0 && (
        <div style={{ background:th.bg2, borderRadius:20, padding:"18px", marginBottom:14 }}>
          <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 14px", letterSpacing:.5 }}>
            BY CATEGORY · {SHORT_MONTHS[month].toUpperCase()} {year}
          </p>
          {byCategory.map(cat => {
            const pct    = totalExp>0 ? Math.round((cat.total/totalExp)*100) : 0;
            const avgDay = daysPassed>0 ? Math.round(cat.total/daysPassed) : 0;
            return (
              <div key={cat.name} style={{ marginBottom:14 }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:7 }}>
                    <span style={{ fontSize:15 }}>{cat.icon}</span>
                    <div>
                      <span style={{ fontSize:13, color:th.text, fontWeight:500 }}>{cat.name}</span>
                      <span style={{ fontSize:11, color:th.text2, marginLeft:6 }}>~{avgDay} {cur}/day</span>
                    </div>
                  </div>
                  <span style={{ fontSize:13, color:th.text, fontWeight:600 }}>{cat.total.toLocaleString()} {cur}</span>
                </div>
                <div style={{ background:th.border2, borderRadius:4, height:4, overflow:"hidden" }}>
                  <div style={{ width:`${pct}%`, height:"100%", background:cat.color, borderRadius:4 }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Auto insights */}
      <div style={{ background:th.bg2, borderRadius:20, padding:"18px" }}>
        <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 12px", letterSpacing:.5 }}>AUTO INSIGHTS</p>
        {insights.map((ins,i) => (
          <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
            marginBottom:i<insights.length-1?12:0, padding:i<insights.length-1?"0 0 12px 0":"0",
            borderBottom:i<insights.length-1?`1px solid ${th.border}`:"none" }}>
            <span style={{ fontSize:20, flexShrink:0 }}>{ins.icon}</span>
            <p style={{ fontSize:13, color:th.text, margin:0, lineHeight:1.5 }}>{ins.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── BUDGET SCREEN ────────────────────────────────────────────────────────────

function BudgetScreen({ transactions, year, month, onMonthChange, settings, onUpdateSettings, budgets, onOpenBudgetModal }) {
  const th       = useTheme();
  const [editLimit, setEditLimit] = useState(false);
  const [limitVal,  setLimitVal]  = useState(String(settings.monthlyBudgetLimit));
  const monthTx  = filterByMonth(transactions, year, month);
  const totalExp = monthTx.filter(t=>t.type==="expense").reduce((s,t)=>s+Math.abs(t.amount),0);
  const limit    = settings.monthlyBudgetLimit;
  const pctOver  = limit>0 ? Math.round((totalExp/limit)*100) : 0;
  const cur      = settings.currency;
  const now      = new Date();
  const daysLeft = (year===now.getFullYear()&&month===now.getMonth())
    ? new Date(year,month+1,0).getDate()-now.getDate() : 0;

  const bWithSpent = budgets.map(b => {
    const c     = getCat(b.category);
    const spent = monthTx.filter(t=>t.type==="expense"&&t.category===b.category).reduce((s,t)=>s+Math.abs(t.amount),0);
    return { ...b, ...c, spent };
  });

  return (
    <div style={{ padding:"20px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <h2 style={{ fontSize:26, fontWeight:700, margin:0, color:th.text }}>Budget</h2>
        <button onClick={onOpenBudgetModal}
          style={{ background:th.accent, border:"none", borderRadius:10, padding:"7px 13px",
            color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Set</button>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
        <p style={{ fontSize:13, color:th.text2, margin:0 }}>{MONTH_NAMES[month]} {year}</p>
        <MonthNavigator year={year} month={month} onChange={onMonthChange} />
      </div>

      {/* Overall */}
      <div style={{ background:th.bg2, borderRadius:20, padding:"18px", marginBottom:14 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
          <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:0, letterSpacing:.5 }}>MONTHLY LIMIT</p>
          <button onClick={()=>{setLimitVal(String(limit));setEditLimit(true);}}
            style={{ background:"none", border:"none", color:th.accent, fontSize:13, cursor:"pointer",
              fontWeight:600, padding:0 }}>Edit</button>
        </div>

        {editLimit ? (
          <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:10 }}>
            <input type="number" value={limitVal} onChange={e=>setLimitVal(e.target.value)} autoFocus
              style={{ flex:1, background:th.bg, border:`1px solid ${th.accent}`, borderRadius:10,
                padding:"9px 13px", fontSize:15, outline:"none", fontFamily:"inherit", color:th.text }} />
            <span style={{ fontSize:13, color:th.text2 }}>{cur}</span>
            <button onClick={()=>{onUpdateSettings({...settings,monthlyBudgetLimit:parseFloat(limitVal)||0});setEditLimit(false);}}
              style={{ background:th.accent, border:"none", borderRadius:10, padding:"9px 14px",
                color:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>Save</button>
          </div>
        ) : limit > 0 ? (
          <>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"baseline", marginBottom:9 }}>
              <span style={{ fontSize:24, fontWeight:700, color:th.text }}>
                {totalExp.toLocaleString()} <span style={{ fontSize:13, fontWeight:400, color:th.text2 }}>/ {limit.toLocaleString()}</span>
              </span>
              <span style={{ fontSize:14, fontWeight:700,
                color:pctOver>100?th.red:pctOver>80?th.orange:th.green }}>{pctOver}%</span>
            </div>
            <div style={{ background:th.border2, borderRadius:6, height:7, overflow:"hidden" }}>
              <div style={{ width:`${Math.min(pctOver,100)}%`, height:"100%", borderRadius:6,
                background:pctOver>100?th.red:"linear-gradient(90deg,#007AFF,#5856D6)" }} />
            </div>
            <p style={{ fontSize:12, color:th.text2, margin:"7px 0 0" }}>
              {Math.max(0,limit-totalExp).toLocaleString()} {cur} remaining{daysLeft>0?` · ${daysLeft} days left`:""}
            </p>
          </>
        ) : (
          <p style={{ fontSize:13, color:th.text2, margin:0 }}>Tap "Edit" to set a monthly limit.</p>
        )}
      </div>

      {/* Category budgets */}
      {bWithSpent.length === 0 ? (
        <div style={{ background:th.bg2, borderRadius:16, padding:"28px 16px", textAlign:"center" }}>
          <p style={{ fontSize:30, margin:"0 0 6px" }}>🎯</p>
          <p style={{ fontSize:14, color:th.text2, margin:0 }}>No category budgets yet</p>
          <p style={{ fontSize:12, color:th.text3, margin:"3px 0 0" }}>Tap "+ Set" to add limits</p>
        </div>
      ) : (
        <div style={{ background:th.bg2, borderRadius:20, overflow:"hidden" }}>
          {bWithSpent.map((b,i) => {
            const pct  = b.limit>0 ? Math.round((b.spent/b.limit)*100) : 0;
            const over = pct>100;
            return (
              <div key={b.category} style={{ padding:"14px",
                borderBottom:i<bWithSpent.length-1?`1px solid ${th.border}`:"none" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:7 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:9 }}>
                    <div style={{ width:34, height:34, borderRadius:10, background:th.bg,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:17,
                      boxShadow:th.shadow, flexShrink:0 }}>{b.icon}</div>
                    <div>
                      <p style={{ fontSize:13, fontWeight:500, margin:0, color:th.text }}>{b.category}</p>
                      <p style={{ fontSize:11, color:th.text2, margin:"2px 0 0" }}>
                        {b.spent.toLocaleString()} / {b.limit.toLocaleString()} {cur}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize:14, fontWeight:700, color:over?th.red:pct>80?th.orange:th.green }}>{pct}%</span>
                </div>
                <div style={{ background:th.border2, borderRadius:4, height:4, overflow:"hidden" }}>
                  <div style={{ width:`${Math.min(pct,100)}%`, height:"100%", borderRadius:4,
                    background:over?th.red:pct>80?th.orange:b.color }} />
                </div>
                {over && <p style={{ fontSize:11, color:th.red, margin:"5px 0 0", fontWeight:500 }}>
                  ⚠️ Over by {(b.spent-b.limit).toLocaleString()} {cur}
                </p>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── ACTION PLAN SCREEN ───────────────────────────────────────────────────────

function ActionPlanScreen({ transactions, plans, onAddPlan, onDeletePlan, settings, curYear, curMonth }) {
  const th = useTheme();
  const [showModal, setShowModal] = useState(false);
  const [expanded,  setExpanded]  = useState(null);
  const cur = settings.currency;

  const allCats = [{ name:"__all__", icon:"📊", label:"All Expenses" },
    ...EXP_CATS.map(c=>({...c,label:c.name}))];

  const getPeriodLabel = (p) => {
    if (p.periodType==="month") return `${MONTH_NAMES[p.periodMonth]} ${p.periodYear}`;
    const q = Math.floor(p.periodMonth/3)+1;
    return `Q${q} ${p.periodYear}`;
  };

  return (
    <div style={{ padding:"20px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
        <h2 style={{ fontSize:26, fontWeight:700, margin:0, color:th.text }}>Action Plan</h2>
        <button onClick={()=>setShowModal(true)}
          style={{ background:th.accent, border:"none", borderRadius:10, padding:"7px 13px",
            color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}>+ Add Goal</button>
      </div>
      <p style={{ fontSize:13, color:th.text2, margin:"0 0 20px" }}>Track your financial goals</p>

      {plans.length === 0 ? (
        <div style={{ background:th.bg2, borderRadius:16, padding:"36px 16px", textAlign:"center" }}>
          <p style={{ fontSize:36, margin:"0 0 8px" }}>📝</p>
          <p style={{ fontSize:15, color:th.text2, margin:0 }}>No goals yet</p>
          <p style={{ fontSize:12, color:th.text3, margin:"4px 0 0" }}>Tap "+ Add Goal" to create your first</p>
        </div>
      ) : (
        plans.map(plan => {
          const prog    = getPlanProgress(plan, transactions);
          const catInfo = allCats.find(c=>c.name===plan.category) ?? allCats[0];
          const isOver  = prog.pct !== null && prog.pct > 100;
          const onTrack = prog.pct !== null && prog.pct <= 100;

          const progressColor = !prog.hasBaseline ? th.text2
            : prog.pct === null ? th.text2
            : isOver ? th.red : prog.pct > 80 ? th.orange : th.green;

          const progressBarColor = !prog.hasBaseline ? th.text3
            : isOver ? th.red : prog.pct > 80 ? th.orange : th.green;

          return (
            <div key={plan.id} style={{ background:th.bg2, borderRadius:16, marginBottom:12, overflow:"hidden" }}>
              <div onClick={()=>setExpanded(expanded===plan.id?null:plan.id)}
                style={{ padding:"16px", cursor:"pointer" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:10 }}>
                  <div style={{ display:"flex", gap:10, alignItems:"center" }}>
                    <div style={{ width:36, height:36, borderRadius:10, background:th.bg,
                      display:"flex", alignItems:"center", justifyContent:"center", fontSize:18,
                      flexShrink:0, boxShadow:th.shadow }}>{catInfo.icon}</div>
                    <div>
                      <p style={{ fontSize:14, fontWeight:600, color:th.text, margin:0 }}>
                        {plan.category==="__all__"?"All Expenses":plan.category}
                      </p>
                      <p style={{ fontSize:12, color:th.text2, margin:"2px 0 0" }}>
                        {plan.action==="reduce" ? `Reduce by ${plan.value}%` : `Keep under ${plan.value.toLocaleString()} ${cur}`}
                        {" in "}{getPeriodLabel(plan)}
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize:13, fontWeight:700, color:progressColor }}>
                    {!prog.hasBaseline ? "No data" : prog.pct===null ? "—" : `${prog.pct}%`}
                  </span>
                </div>

                {prog.hasBaseline && prog.target !== null ? (
                  <>
                    <div style={{ background:th.border2, borderRadius:4, height:6, overflow:"hidden", marginBottom:6 }}>
                      <div style={{ width:`${Math.min(prog.pct??0,100)}%`, height:"100%",
                        background:progressBarColor, borderRadius:4 }} />
                    </div>
                    <div style={{ display:"flex", justifyContent:"space-between" }}>
                      <p style={{ fontSize:11, color:th.text2, margin:0 }}>
                        Spent {Math.round(prog.current).toLocaleString()} {cur}
                        {" / Target "}{Math.round(prog.target).toLocaleString()} {cur}
                      </p>
                      <p style={{ fontSize:11, fontWeight:600, color:progressColor, margin:0 }}>
                        {onTrack && !isOver ? "✅ On track" : isOver ? "⚠️ Off track" : ""}
                      </p>
                    </div>
                  </>
                ) : !prog.hasBaseline ? (
                  <p style={{ fontSize:12, color:th.text2, margin:0 }}>
                    Need previous period data to track progress.
                  </p>
                ) : null}

                {plan.note ? (
                  <p style={{ fontSize:12, color:th.text2, margin:"8px 0 0", fontStyle:"italic" }}>"{plan.note}"</p>
                ) : null}
              </div>

              {expanded === plan.id && (
                <div style={{ padding:"8px 16px 14px",
                  borderTop:`1px solid ${th.border}`,
                  background:th.isDark?"rgba(255,69,58,0.08)":"rgba(255,69,58,0.04)" }}>
                  <button onClick={()=>{onDeletePlan(plan.id);setExpanded(null);}}
                    style={{ background:th.red, border:"none", borderRadius:10, padding:"9px 18px",
                      color:"white", fontSize:13, fontWeight:600, cursor:"pointer" }}>
                    🗑 Delete Goal
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      {showModal && (
        <AddPlanModal currency={cur} onAdd={onAddPlan} onClose={()=>setShowModal(false)}
          curYear={curYear} curMonth={curMonth} />
      )}
    </div>
  );
}

// ─── SETTINGS SCREEN ─────────────────────────────────────────────────────────

function SettingsScreen({ settings, onUpdateSettings, onClearData, transactions, isDark, onToggleDark, onImport, onTutorial }) {
  const th = useTheme();
  const [editName,   setEditName]  = useState(false);
  const [nameVal,    setNameVal]   = useState(settings.name);
  const fileRef = useRef(null);

  const exportCSV = () => {
    const h = "Date,Name,Category,Type,Amount,Currency\n";
    const rows = transactions.map(t =>
      `"${new Date(t.date).toISOString()}","${t.name}","${t.category}","${t.type}",${Math.abs(t.amount)},"${settings.currency}"`
    ).join("\n");
    const blob = new Blob([h+rows],{type:"text/csv"});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href=url; a.download="fintab-export.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const importCSV = e => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const parsed = parseCSV(ev.target.result);
      if (parsed.length === 0) { alert("No valid transactions found in file."); return; }
      onImport(parsed);
      alert(`Imported ${parsed.length} transaction${parsed.length===1?"":"s"}.`);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const Toggle = ({ on, onToggle }) => (
    <div onClick={onToggle} style={{ width:48, height:28, borderRadius:14,
      background:on?th.accent:th.bg3, position:"relative", cursor:"pointer", flexShrink:0 }}>
      <div style={{ position:"absolute", top:3, left:on?23:3, width:22, height:22, borderRadius:"50%",
        background:"white", transition:"left .2s", boxShadow:"0 1px 4px rgba(0,0,0,0.2)" }} />
    </div>
  );

  const Row = ({ icon, iconBg, title, sub, right, onClick, titleColor }) => (
    <div onClick={onClick} style={{ padding:"13px 14px", display:"flex", alignItems:"center",
      cursor:onClick?"pointer":"default", borderBottom:`1px solid ${th.border}` }}>
      <div style={{ width:34, height:34, borderRadius:10, background:iconBg??th.bg,
        display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginRight:12,
        boxShadow:th.shadow, flexShrink:0 }}>{icon}</div>
      <div style={{ flex:1 }}>
        <p style={{ fontSize:14, fontWeight:500, margin:0, color:titleColor??th.text }}>{title}</p>
        {sub && <p style={{ fontSize:11, color:th.text2, margin:"2px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );

  return (
    <div style={{ padding:"20px 20px" }}>
      <h2 style={{ fontSize:26, fontWeight:700, margin:"0 0 20px", color:th.text }}>Settings</h2>

      {/* Appearance */}
      <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 7px", letterSpacing:.5 }}>APPEARANCE</p>
      <div style={{ background:th.bg2, borderRadius:16, marginBottom:18, overflow:"hidden" }}>
        <div style={{ padding:"13px 14px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:th.bg,
              display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, boxShadow:th.shadow }}>
              {isDark?"🌙":"☀️"}
            </div>
            <div>
              <p style={{ fontSize:14, fontWeight:500, margin:0, color:th.text }}>Dark Mode</p>
              <p style={{ fontSize:11, color:th.text2, margin:"2px 0 0" }}>{isDark?"On":"Off"}</p>
            </div>
          </div>
          <Toggle on={isDark} onToggle={onToggleDark} />
        </div>
      </div>

      {/* Profile */}
      <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 7px", letterSpacing:.5 }}>PROFILE</p>
      <div style={{ background:th.bg2, borderRadius:16, padding:"14px", marginBottom:18 }}>
        {editName ? (
          <div style={{ display:"flex", gap:8 }}>
            <input value={nameVal} onChange={e=>setNameVal(e.target.value)} autoFocus
              style={{ flex:1, background:th.bg, border:`1px solid ${th.accent}`, borderRadius:10,
                padding:"9px 13px", fontSize:15, outline:"none", fontFamily:"inherit", color:th.text }} />
            <button onClick={()=>{onUpdateSettings({...settings,name:nameVal});setEditName(false);}}
              style={{ background:th.accent, border:"none", borderRadius:10, padding:"9px 14px",
                color:"white", fontSize:14, fontWeight:600, cursor:"pointer" }}>Save</button>
          </div>
        ) : (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10 }}>
              <div style={{ width:38, height:38, borderRadius:"50%",
                background:"linear-gradient(135deg,#007AFF,#5856D6)",
                display:"flex", alignItems:"center", justifyContent:"center",
                color:"white", fontSize:15, fontWeight:700 }}>
                {settings.name[0]?.toUpperCase()}
              </div>
              <span style={{ fontSize:15, fontWeight:500, color:th.text }}>{settings.name}</span>
            </div>
            <button onClick={()=>{setNameVal(settings.name);setEditName(true);}}
              style={{ background:"none", border:"none", color:th.accent, fontSize:14, cursor:"pointer" }}>Edit</button>
          </div>
        )}
      </div>

      {/* Currency */}
      <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 7px", letterSpacing:.5 }}>CURRENCY</p>
      <div style={{ display:"flex", gap:7, marginBottom:18, flexWrap:"wrap" }}>
        {CURRENCIES.map(c=>(
          <button key={c} onClick={()=>onUpdateSettings({...settings,currency:c})}
            style={{ padding:"7px 13px", borderRadius:10,
              border:`2px solid ${settings.currency===c?th.accent:"transparent"}`,
              background:settings.currency===c ? (th.isDark?"#0A3A6B":"#EBF4FF") : th.bg2,
              color:settings.currency===c?th.accent:th.text, fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {c}
          </button>
        ))}
      </div>

      {/* Help */}
      <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 7px", letterSpacing:.5 }}>HELP</p>
      <div style={{ background:th.bg2, borderRadius:16, overflow:"hidden", marginBottom:18 }}>
        <Row icon="📖" iconBg="#E8F4FF" title="How to Use Fintab" sub="Feature guide for every tab"
          onClick={onTutorial} right={<span style={{ color:th.text3 }}>›</span>} />
      </div>

      {/* Data */}
      <p style={{ fontSize:12, fontWeight:600, color:th.text2, margin:"0 0 7px", letterSpacing:.5 }}>DATA</p>
      <div style={{ background:th.bg2, borderRadius:16, overflow:"hidden", marginBottom:20 }}>
        <Row icon="📊" title="Export to CSV" sub="Download all transactions"
          onClick={exportCSV} right={<span style={{ color:th.text3 }}>›</span>} />
        <Row icon="📥" title="Import CSV" sub="Restore data from backup"
          onClick={()=>fileRef.current?.click()} right={<span style={{ color:th.text3 }}>›</span>} />
        <input ref={fileRef} type="file" accept=".csv" onChange={importCSV}
          style={{ display:"none" }} />
        <div style={{ padding:"13px 14px", display:"flex", alignItems:"center", cursor:"pointer" }}
          onClick={()=>{ if(window.confirm("Clear all transactions? Cannot be undone.")) onClearData(); }}>
          <div style={{ width:34, height:34, borderRadius:10, background:"#FFE5E5",
            display:"flex", alignItems:"center", justifyContent:"center", fontSize:17, marginRight:12 }}>🗑</div>
          <div style={{ flex:1 }}>
            <p style={{ fontSize:14, fontWeight:500, margin:0, color:th.red }}>Clear All Data</p>
            <p style={{ fontSize:11, color:th.text2, margin:"2px 0 0" }}>Delete all transactions</p>
          </div>
          <span style={{ color:th.text3 }}>›</span>
        </div>
      </div>

      <div style={{ background:th.bg2, borderRadius:14, padding:"14px", textAlign:"center" }}>
        <p style={{ fontSize:12, color:th.text2, margin:0 }}>
          Fintab v1.0.0 · {transactions.length} transactions 🇦🇪
        </p>
      </div>
    </div>
  );
}

// ─── TUTORIAL MODAL ──────────────────────────────────────────────────────────

function TutorialModal({ onClose }) {
  const th = useTheme();
  const sections = [
    { icon:"🏠", title:"Home", tips:[
      "See your monthly balance, income & expenses at a glance",
      "Tap − Add Expense or + Add Income to record a transaction",
      "Recent transactions appear at the bottom of the screen",
      "Navigate months with the ‹ › arrows in the top right",
    ]},
    { icon:"📋", title:"History", tips:[
      "Browse all transactions grouped by date",
      "Filter by All / Expenses / Income using the pill buttons",
      "Set a From → To date range to narrow down results",
      "Tap any transaction row to open its full detail sheet",
      "Delete a transaction from the detail sheet",
    ]},
    { icon:"📊", title:"Stats", tips:[
      "See spending broken down by category with colored bars",
      "Check average spend per day for each category",
      "Auto-insights flag overruns, salary increases, and savings wins",
      "Comparisons are made against the previous month automatically",
    ]},
    { icon:"🎯", title:"Budget", tips:[
      "Set an overall monthly budget limit — tap the pencil icon",
      "The progress bar shows how much of the budget is used",
      "Tap Set Category Budgets to set limits per spending category",
    ]},
    { icon:"📝", title:"Plan", tips:[
      "Create financial goals to track over a month or quarter",
      "Choose to reduce spending by % or limit to a set amount",
      "The progress bar updates automatically from your transactions",
      "Tap + New Plan to add a goal",
    ]},
    { icon:"⚙️", title:"More", tips:[
      "Toggle Dark Mode in the Appearance section",
      "Edit your display name in the Profile section",
      "Switch currency — changes apply everywhere instantly",
      "Export to CSV to back up all your data",
      "Import CSV to restore data when switching phones",
    ]},
  ];
  return (
    <div style={{ position:"absolute", inset:0, zIndex:200, display:"flex", alignItems:"flex-end" }}>
      <div onClick={onClose} style={{ position:"absolute", inset:0, background:"rgba(0,0,0,0.5)" }} />
      <div style={{ position:"relative", background:th.bg, borderRadius:"24px 24px 0 0",
        padding:"20px 20px 36px", maxHeight:"86vh", overflowY:"auto", width:"100%",
        scrollbarWidth:"none" }}>
        <div style={{ width:36, height:4, background:th.bg3, borderRadius:2, margin:"0 auto 18px" }} />
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <h3 style={{ fontSize:20, fontWeight:700, margin:0, color:th.text }}>How to Use Fintab</h3>
          <button onClick={onClose} style={{ background:th.bg2, border:"none", borderRadius:"50%",
            width:32, height:32, cursor:"pointer", fontSize:15, display:"flex", alignItems:"center",
            justifyContent:"center", color:th.text }}>✕</button>
        </div>
        {sections.map(s => (
          <div key={s.title} style={{ background:th.bg2, borderRadius:16, padding:"14px 16px", marginBottom:10 }}>
            <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:8 }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <p style={{ fontSize:15, fontWeight:700, color:th.text, margin:0 }}>{s.title}</p>
            </div>
            {s.tips.map((tip, i) => (
              <div key={i} style={{ display:"flex", gap:8, marginBottom: i < s.tips.length-1 ? 5 : 0 }}>
                <span style={{ color:th.accent, fontSize:11, marginTop:2, flexShrink:0 }}>•</span>
                <p style={{ fontSize:13, color:th.text2, margin:0, lineHeight:1.45 }}>{tip}</p>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── APP ──────────────────────────────────────────────────────────────────────

const TABS = [
  { id:"home",         label:"Home",    icon:"🏠" },
  { id:"transactions", label:"History", icon:"📋" },
  { id:"analytics",   label:"Stats",   icon:"📊" },
  { id:"budget",      label:"Budget",  icon:"🎯" },
  { id:"plan",        label:"Plan",    icon:"📝" },
  { id:"settings",    label:"More",    icon:"⚙️" },
];

export default function App() {
  const [transactions, setTransactions] = useLocalStorage("fintab_transactions", []);
  const [budgets,      setBudgets]      = useLocalStorage("fintab_budgets",      DEFAULT_BUDGETS);
  const [settings,     setSettings]     = useLocalStorage("fintab_settings",     DEFAULT_SETTINGS);
  const [plans,        setPlans]        = useLocalStorage("fintab_plans",        []);
  const [isDark,       setIsDark]       = useLocalStorage("fintab_dark",         false);

  const [activeTab,    setActiveTab]    = useState("home");
  const [modal,        setModal]        = useState(null);
  const [detailTx,     setDetailTx]     = useState(null);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const now = new Date();
  const [curYear,  setCurYear]  = useState(now.getFullYear());
  const [curMonth, setCurMonth] = useState(now.getMonth());

  const theme = isDark ? T_DARK : T_LIGHT;
  const mc    = (y,m) => { setCurYear(y); setCurMonth(m); };
  const addTx = tx  => setTransactions(p => [tx,...p]);
  const delTx = id  => setTransactions(p => p.filter(t=>t.id!==id));
  const addPl = pl  => setPlans(p => [pl,...p]);
  const delPl = id  => setPlans(p => p.filter(pl=>pl.id!==id));

  const cp = { transactions, year:curYear, month:curMonth, onMonthChange:mc, settings };

  return (
    <ThemeCtx.Provider value={theme}>
      {/* Outer: fills viewport, shows theme color behind the app on desktop */}
      <div style={{ background:theme.outer, minHeight:"100dvh",
        fontFamily:"-apple-system,'SF Pro Text',BlinkMacSystemFont,sans-serif",
        display:"flex", justifyContent:"center" }}>

        {/* App shell: full-width on phone, max 480px centered on desktop */}
        <div style={{ width:"100%", maxWidth:480, minHeight:"100dvh",
          background:theme.bg, display:"flex", flexDirection:"column",
          position:"relative" }}>

          {/* iOS safe-area top (notch / Dynamic Island) */}
          <div style={{ height:"env(safe-area-inset-top, 0px)",
            background:theme.statusBg, flexShrink:0 }} />

          {/* Content */}
          <div style={{ flex:1, overflowY:"auto", scrollbarWidth:"none", background:theme.bg }}>
            {activeTab==="home"         && <HomeScreen {...cp} onAddExpense={()=>setModal("expense")} onAddIncome={()=>setModal("income")} />}
            {activeTab==="transactions" && <TransactionsScreen {...cp} onDelete={delTx} onDetail={setDetailTx} />}
            {activeTab==="analytics"    && <AnalyticsScreen {...cp} budgets={budgets} />}
            {activeTab==="budget"       && <BudgetScreen {...cp} budgets={budgets} onUpdateSettings={setSettings} onOpenBudgetModal={()=>setModal("budget")} />}
            {activeTab==="plan"         && <ActionPlanScreen transactions={transactions} plans={plans} onAddPlan={addPl} onDeletePlan={delPl} settings={settings} curYear={curYear} curMonth={curMonth} />}
            {activeTab==="settings"     && <SettingsScreen settings={settings} onUpdateSettings={setSettings} onClearData={()=>setTransactions([])} transactions={transactions} isDark={isDark} onToggleDark={()=>setIsDark(d=>!d)} onImport={txs=>setTransactions(p=>[...txs,...p])} onTutorial={()=>setTutorialOpen(true)} />}
          </div>

          {/* Tab bar — respects iOS home-indicator safe area at bottom */}
          <div style={{ background:theme.tabbar, backdropFilter:"blur(20px)",
            borderTop:`1px solid ${theme.tabbarBorder}`,
            paddingTop:8,
            paddingBottom:"max(16px, env(safe-area-inset-bottom, 16px))",
            display:"flex", flexShrink:0 }}>
            {TABS.map(tab=>(
              <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
                style={{ flex:1, background:"none", border:"none", padding:"3px 0", cursor:"pointer",
                  display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ fontSize:22, filter:activeTab===tab.id?"none":"grayscale(1) opacity(0.4)" }}>{tab.icon}</span>
                <span style={{ fontSize:10, fontWeight:activeTab===tab.id?600:400,
                  color:activeTab===tab.id?theme.accent:theme.text2 }}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Modals */}
          {(modal==="expense"||modal==="income") && (
            <AddTransactionModal defaultType={modal} currency={settings.currency}
              onAdd={addTx} onClose={()=>setModal(null)} />
          )}
          {modal==="budget" && (
            <SetBudgetModal budgets={budgets} currency={settings.currency}
              onSave={setBudgets} onClose={()=>setModal(null)} />
          )}
          {detailTx && (
            <TransactionDetailModal tx={detailTx} currency={settings.currency}
              onDelete={delTx} onClose={()=>setDetailTx(null)} />
          )}
          {tutorialOpen && (
            <TutorialModal onClose={()=>setTutorialOpen(false)} />
          )}
        </div>
      </div>
    </ThemeCtx.Provider>
  );
}
