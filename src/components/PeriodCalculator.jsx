import { useState, useEffect } from "react";
import "./PeriodCalculator.css";

const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };
const fmt = (d) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
const fmtFull = (d) => d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });

const Calendar = ({ hl, month, setMonth }) => {
  const mNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const y = month.getFullYear(), m = month.getMonth();
  const first = new Date(y, m, 1).getDay();
  const total = new Date(y, m + 1, 0).getDate();
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="cal">
      <div className="cal-top">
        <button onClick={() => setMonth(new Date(y, m - 1))} className="cal-btn">‹</button>
        <span>{mNames[m]} {y}</span>
        <button onClick={() => setMonth(new Date(y, m + 1))} className="cal-btn">›</button>
      </div>
      <div className="cal-g">
        {["S","M","T","W","T","F","S"].map((d,i) => <div key={i} className="cal-w">{d}</div>)}
        {Array.from({length:first}).map((_,i)=><div key={`b${i}`} className="cal-c"/>)}
        {Array.from({length:total},(_,i)=>i+1).map(d=>{
          const dt = new Date(y,m,d), iso = dt.toISOString().split("T")[0];
          const cls = ["cal-c"];
          if(hl.np&&hl.pe){const s=new Date(hl.np+"T00:00:00"),e=new Date(hl.pe+"T00:00:00");if(dt>=s&&dt<=e)cls.push("period")}
          if(hl.fs&&hl.fe){const s=new Date(hl.fs+"T00:00:00"),e=new Date(hl.fe+"T00:00:00");if(dt>=s&&dt<=e)cls.push("fertile")}
          if(hl.ov===iso)cls.push("ovu");
          if(hl.np===iso)cls.push("nxt");
          if(iso===today)cls.push("now");
          return <div key={d} className={cls.join(" ")}>{d}</div>;
        })}
      </div>
    </div>
  );
};

const PeriodCalculator = () => {
  const [lp, setLp] = useState("");
  const [cl, setCl] = useState(28);
  const [pl, setPl] = useState(5);
  const [res, setRes] = useState(null);
  const [cm, setCm] = useState(new Date());
  const [busy, setBusy] = useState(false);
  const [ready, setReady] = useState(false);
  const [modal, setModal] = useState(null);

  useEffect(() => { requestAnimationFrame(() => setReady(true)); }, []);

  const go = () => {
    if (!lp) return;
    setBusy(true);
    setTimeout(() => {
      const d = new Date(lp);
      const np = addDays(d, cl), pe = addDays(np, pl - 1), ov = addDays(np, -14), fs = addDays(ov, -5), fe = addDays(ov, 1);
      setRes({
        np: np.toISOString().split("T")[0], pe: pe.toISOString().split("T")[0],
        ov: ov.toISOString().split("T")[0],
        fs: fs.toISOString().split("T")[0], fe: fe.toISOString().split("T")[0],
        npF: fmtFull(np), peF: fmtFull(pe), ovF: fmtFull(ov), fsF: fmt(fs), feF: fmt(fe),
        days: Math.max(0, Math.ceil((np - new Date()) / 864e5)),
      });
      setCm(new Date(fs.getFullYear(), fs.getMonth(), 1));
      setBusy(false);
    }, 500);
  };

  const hl = res ? { np: res.np, pe: res.pe, ov: res.ov, fs: res.fs, fe: res.fe } : {};

  return (
    <div className={`root ${ready ? "on" : ""}`}>
      <section className="hero">
        <h1 className="hero-title">Know your body,<br/><span className="hero-italic">own your rhythm.</span></h1>
        <p className="hero-desc">Predict your period, ovulation, and fertile window.</p>
      </section>

      <div className="shell">
        {/* Left */}
        <div className="pan-l">
          <div className="brand">cycle tracker<span className="dot-pink">.</span></div>

          <label className="lab lab-down">Last period</label>
          <input type="date" value={lp} onChange={e=>setLp(e.target.value)} className="date-inp"/>

          <div className="sl-wrap">
            <div className="sl-h"><label className="lab">Cycle length</label><span className="sl-v">{cl}d</span></div>
            <input type="range" min="21" max="35" value={cl} onChange={e=>setCl(+e.target.value)} className="sl"/>
          </div>

          <div className="sl-wrap">
            <div className="sl-h"><label className="lab">Period length</label><span className="sl-v">{pl}d</span></div>
            <input type="range" min="2" max="10" value={pl} onChange={e=>setPl(+e.target.value)} className="sl"/>
          </div>

          <button className="go-btn" onClick={go} disabled={busy||!lp}>
            {busy ? "Calculating…" : "Predict Next Cycle"}
          </button>
        </div>

        {/* Right */}
        <div className="pan-r">
          {res ? (
            <div className="pan-r-content">
              <div className="rows">
                <div className="row row-hero">
                  <div className="row-dot red"/>
                  <div className="row-txt">
                    <span className="row-lab">Next Period</span>
                    <span className="row-date">{res.npF}</span>
                  </div>
                  <span className="row-badge">{res.days}d away</span>
                </div>
                <div className="row">
                  <div className="row-dot blue"/>
                  <div className="row-txt">
                    <span className="row-lab">Ovulation</span>
                    <span className="row-date">{res.ovF}</span>
                  </div>
                </div>
                <div className="row">
                  <div className="row-dot green"/>
                  <div className="row-txt">
                    <span className="row-lab">Fertile Window</span>
                    <span className="row-date">{res.fsF} — {res.feF}</span>
                  </div>
                </div>
              </div>
              <Calendar hl={hl} month={cm} setMonth={setCm}/>
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-ring"/>
              <p>Enter your last period to<br/>see predictions</p>
            </div>
          )}
        </div>
      </div>

      {modal && (
        <div className="modal-bg" onClick={()=>setModal(null)}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <button className="modal-close" onClick={()=>setModal(null)}>✕</button>
            {modal==="privacy" && <>
              <h2 className="modal-title">Your Privacy</h2>
              <p>We don't collect any data. Everything you enter stays right here in your browser. There are no accounts, no servers, no cookies, and no third-party tracking. Your cycle information never leaves your device — period.</p>
            </>}
            {modal==="terms" && <>
              <h2 className="modal-title">Terms of Use</h2>
              <p>This tool provides estimates based on average cycle patterns and is not a substitute for medical advice. Predictions may not be accurate for everyone. Always consult a healthcare professional for medical concerns.</p>
            </>}
            {modal==="about" && <>
              <h2 className="modal-title">About cycle.</h2>
              <p>A simple, private period tracker. Built with care to help you understand your body better. No accounts, no data collection — just you and your cycle.</p>
            </>}
          </div>
        </div>
      )}
    </div>
  );
};

export default PeriodCalculator;
