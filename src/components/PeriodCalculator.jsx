import React, { useState } from "react";
import "./PeriodCalculator.css";

const addDays = (date, days) => {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
};

const Calendar = ({ highlightDates, currentMonth, setCurrentMonth }) => {
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonth = () => setCurrentMonth(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentMonth(new Date(year, month + 1, 1));

  const blanks = Array(firstDay).fill(null);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">←</button>
        <h4>{monthNames[month]} {year}</h4>
        <button onClick={nextMonth} className="nav-btn">→</button>
      </div>
      <div className="calendar-grid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => (
          <div key={d} className="day-name">{d}</div>
        ))}
        {blanks.map((_, i) => <div key={`b-${i}`} className="day empty" />)}
        {days.map(day => {
          const dateObj = new Date(year, month, day);
          const iso = dateObj.toISOString().split('T')[0];
          const classes = ["day"];
          if (highlightDates.periods.includes(iso)) classes.push("period-day");
          if (highlightDates.fertileStart && highlightDates.fertileEnd) {
            const start = new Date(highlightDates.fertileStart);
            const end = new Date(highlightDates.fertileEnd);
            if (dateObj >= start && dateObj <= end) classes.push("fertile-day");
          }
          if (highlightDates.ovulation === iso) classes.push("ovulation-day");
          if (highlightDates.nextPeriod === iso) classes.push("next-period");
          return <div key={day} className={classes.join(" ")}>{day}</div>;
        })}
      </div>
    </div>
  );
};

const PeriodCalculator = () => {
  const [lastPeriod, setLastPeriod] = useState("");
  const [cycleLength, setCycleLength] = useState(28);
  const [periodLength, setPeriodLength] = useState(5);
  const [results, setResults] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [loading, setLoading] = useState(false);

  const calculate = () => {
    if (!lastPeriod) return;
    setLoading(true);

    setTimeout(() => {
      const lastDate = new Date(lastPeriod);
      const nextPeriodDate = addDays(lastDate, cycleLength);
      const ovulationDate = addDays(nextPeriodDate, -14);
      const fertileStartDate = addDays(ovulationDate, -5);
      const fertileEndDate = addDays(ovulationDate, 1);

      setResults({
        nextPeriodISO: nextPeriodDate.toISOString().split("T")[0],
        ovulationISO: ovulationDate.toISOString().split("T")[0],
        fertileStartISO: fertileStartDate.toISOString().split("T")[0],
        fertileEndISO: fertileEndDate.toISOString().split("T")[0],
      });

      setCurrentMonth(new Date(nextPeriodDate.getFullYear(), nextPeriodDate.getMonth(), 1));
      setLoading(false);
    }, 300);
  };

  const periodDates = lastPeriod ? [lastPeriod] : [];

  const highlightDates = {
    periods: periodDates,
    nextPeriod: results?.nextPeriodISO || null,
    ovulation: results?.ovulationISO || null,
    fertileStart: results?.fertileStartISO || null,
    fertileEnd: results?.fertileEndISO || null,
  };

  return (
    <div className="calculator-container">
      <div className="glass-card">
        <div className="left-column">
          <h1 className="title">Cycle Tracker</h1>

          <div className="input-group">
            <label className="label-text">Last Period Start</label>
            <input
              type="date"
              placeholder="dd/mm/yyyy"
              value={lastPeriod}
              onChange={(e) => setLastPeriod(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="input-group">
            <label className="label-text">
              Cycle Length: <span className="label-value">{cycleLength} days</span>
            </label>
            <input
              type="range"
              min="21"
              max="35"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="slider"
            />
          </div>

          <div className="input-group">
            <label className="label-text">
              Period Length: <span className="label-value">{periodLength} days</span>
            </label>
            <input
              type="range"
              min="2"
              max="10"
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              className="slider"
            />
          </div>

          <button onClick={calculate} className="calc-btn" disabled={loading}>
            {loading ? "Predicting…" : "Predict Next Cycle"}
          </button>
        </div>

        <div className="right-column">
          <Calendar
            highlightDates={highlightDates}
            currentMonth={currentMonth}
            setCurrentMonth={setCurrentMonth}
          />

          <div className="calendar-legend">
            <div className="legend-item"><span className="legend-dot period-dot"></span> Period</div>
            <div className="legend-item"><span className="legend-dot fertile-dot"></span> Fertile window</div>
            <div className="legend-item"><span className="legend-dot ovulation-dot"></span> Ovulation</div>
            <div className="legend-item"><span className="legend-dot next-dot"></span> Next period</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PeriodCalculator;