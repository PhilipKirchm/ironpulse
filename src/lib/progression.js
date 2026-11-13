// Reine Rechenfunktionen fuer Belastungssteuerung (keine React-Abhaengigkeit, daher testbar).
//
// Grundlagen:
//  - Session-RPE (Foster et al. 2001): Belastung = RPE (1-10) x Dauer in Minuten, Einheit "AU".
//  - 4-Wochen-Zyklus: 3 Aufbauwochen, Woche 4 = Deload (ca. 40 % weniger Belastung).
//  - Wochenweise Steigerung, begrenzt (Standard 12 %, max. 20 %) und anhand der RPE angepasst.
//  - Akut:Chronisch-Verhaeltnis (Gabbett 2016) als Warnhinweis bei zu schnellen Spruengen.
//  - Subjektives Wohlbefinden (Hooper-Index-artig) steuert das Tagesvolumen (Saw et al. 2016).

const DAY = 86400000;

export const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
export const round1 = (v) => Math.round(v * 10) / 10;

export const toNum = (v) => {
    const n = parseFloat(String(v ?? '').replace(',', '.'));
    return Number.isFinite(n) ? n : 0;
};

export const startOfWeekMon = (d) => {
    const x = new Date(d);
    x.setHours(0, 0, 0, 0);
    x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
    return x;
};

export const dateKey = (d) => {
    const x = new Date(d);
    const p = (n) => String(n).padStart(2, '0');
    return `${x.getFullYear()}-${p(x.getMonth() + 1)}-${p(x.getDate())}`;
};

// ---------- Einzelne Logs ----------
export const logVolume = (log) =>
    (log.exercises || []).reduce((sum, ex) =>
        sum + (ex.sets || []).reduce((s, set) => s + toNum(set.weight) * toNum(set.reps), 0), 0);

export const logDurationMin = (log) => (log.durationSec > 0 ? log.durationSec / 60 : null);

export const logLoadAU = (log) => {
    const dur = logDurationMin(log);
    return log.rpe > 0 && dur ? log.rpe * dur : null;
};

// ---------- Zyklus (Woche 1-4) ----------
export const cycleInfo = (date, cycleStart, length = 4) => {
    const a = startOfWeekMon(date);
    const b = startOfWeekMon(cycleStart || date);
    const weeks = Math.round((a - b) / (7 * DAY));
    const idx = ((weeks % length) + length) % length;
    return { week: idx + 1, length, isDeload: idx === length - 1 };
};

// ---------- Wochen-Zusammenfassung ----------
export function weeklySummaries(logs, now = new Date(), count = 8) {
    const cur = startOfWeekMon(now);
    const weeks = [];
    for (let i = count - 1; i >= 0; i--) {
        const s = new Date(cur);
        s.setDate(s.getDate() - 7 * i);
        weeks.push({ start: s, key: dateKey(s), sessions: 0, durationMin: 0, rated: 0, rpeSum: 0, loadAU: 0, volume: 0 });
    }
    (logs || []).forEach((l) => {
        const t = startOfWeekMon(l.date).getTime();
        const w = weeks.find((x) => x.start.getTime() === t);
        if (!w) return;
        w.sessions += 1;
        w.volume += logVolume(l);
        const dur = logDurationMin(l);
        if (dur) w.durationMin += dur;
        if (l.rpe > 0) { w.rated += 1; w.rpeSum += l.rpe; }
        const au = logLoadAU(l);
        if (au) w.loadAU += au;
    });
    weeks.forEach((w) => {
        w.avgRpe = w.rated ? round1(w.rpeSum / w.rated) : null;
        w.loadAU = Math.round(w.loadAU);
        w.volume = Math.round(w.volume);
        w.durationMin = Math.round(w.durationMin);
    });
    return weeks;
}

// ---------- Steigerung anhand RPE / Wohlbefinden ----------
export function adjustedProgression(basePct, avgRpe, wellnessAvgPct) {
    let p = clamp(basePct, 0, 20);
    let reason = null;
    if (avgRpe != null) {
        if (avgRpe >= 9) { p = Math.min(p, 5); reason = 'Letzte Woche war sehr hart (RPE ≥ 9) – nur kleine Steigerung.'; }
        else if (avgRpe <= 6) { p = Math.min(Math.round(p * 1.5), 20); reason = 'Letzte Woche war eher leicht (RPE ≤ 6) – du darfst etwas mehr steigern.'; }
    }
    if (wellnessAvgPct != null && wellnessAvgPct < 45) { p = 0; reason = 'Dein Wohlbefinden war zuletzt niedrig – Belastung halten und erholen.'; }
    return { pct: p, reason };
}

// ---------- Wochenziele ----------
// metric: 'loadAU' | 'volume'
export function targetsForMetric({ weeks, metric, now, cycleStart, basePct, wellnessAvgPct, length = 4 }) {
    const completed = weeks.slice(0, -1).map((w) => ({ ...w, info: cycleInfo(w.start, cycleStart, length) }));
    const cur = weeks[weeks.length - 1];
    const info = cycleInfo(now, cycleStart, length);
    const nextInfo = cycleInfo(new Date(startOfWeekMon(now).getTime() + 7 * DAY + DAY / 2), cycleStart, length);

    const loaded = [...completed].reverse().filter((w) => w[metric] > 0 && !w.info.isDeload);
    const lastLoaded = loaded[0] || null;
    if (!lastLoaded) return { current: null, next: null, reason: null, pct: null };

    const prev = completed[completed.length - 1];
    const peak = Math.max(...loaded.slice(0, 3).map((w) => w[metric]));
    // Chronische Belastung: Schnitt der letzten 4 Wochen, aber erst ab der ersten Woche mit Daten
    // (Wochen vor deinem ersten Training zaehlen nicht, Pausenwochen danach schon).
    const firstIdx = completed.findIndex((w) => w[metric] > 0);
    const chronicWeeks = completed.slice(Math.max(firstIdx, completed.length - 4));
    const chronic = chronicWeeks.reduce((s, w) => s + w[metric], 0) / Math.max(1, chronicWeeks.length);
    const { pct, reason } = adjustedProgression(basePct, lastLoaded.avgRpe, wellnessAvgPct);

    let current, note;
    if (info.isDeload) {
        current = peak * 0.6; note = 'Deload-Woche: ca. 40 % weniger als dein Höchstwert der letzten Wochen.';
    } else if (prev && prev.info.isDeload) {
        current = lastLoaded[metric]; note = 'Neuer Zyklus: zurück auf das Niveau vor dem Deload.';
    } else {
        current = lastLoaded[metric] * (1 + pct / 100);
        if (chronic > 0) current = Math.min(current, chronic * 1.3);
        note = `Steigerung um ${pct} % gegenüber der letzten Aufbauwoche.`;
    }

    let next;
    if (nextInfo.isDeload) next = Math.max(peak, info.isDeload ? 0 : current) * 0.6;
    else if (info.isDeload) next = lastLoaded[metric];
    else next = current * (1 + pct / 100);

    return { current: Math.round(current), next: Math.round(next), reason: reason || note, pct, note, isDeload: info.isDeload };
}

// Akut:Chronisch (diese Woche / Schnitt der 4 Vorwochen) – nur ein grober Hinweis
export function acuteChronic(weeks, metric = 'loadAU') {
    const cur = weeks[weeks.length - 1]?.[metric] || 0;
    const prev = weeks.slice(-5, -1);
    const first = prev.findIndex((w) => w[metric] > 0);
    if (first === -1 || !cur) return null;
    const used = prev.slice(first);
    const chronic = used.reduce((s, w) => s + w[metric], 0) / used.length;
    const ratio = Math.round((cur / chronic) * 100) / 100;
    return { ratio, caution: ratio > 1.3, high: ratio > 1.5 };
}

// ---------- Wohlbefinden ----------
export const wellnessScore = (w) => {
    if (!w) return null;
    const sum = ['sleep', 'energy', 'soreness', 'stress'].reduce((s, k) => s + toNum(w[k]), 0);
    return Math.round(((sum - 4) / 16) * 100);
};

export function readinessAdvice(scorePct) {
    if (scorePct == null) return null;
    if (scorePct >= 70) return { level: 'good', factor: 1, title: 'Gut erholt', text: 'Training wie geplant.' };
    if (scorePct >= 40) return { level: 'medium', factor: 0.8, title: 'Etwas angeschlagen', text: 'Reduziere das Volumen um ca. 20 % (zum Beispiel einen Satz weniger pro Übung) und bleib bei RPE 7–8.' };
    return { level: 'low', factor: 0.6, title: 'Schlecht erholt', text: 'Lieber Ruhetag oder nur eine leichte Einheit (ca. 40 % weniger Volumen, RPE ≤ 6).' };
}

export function wellnessAverage(wellness, now = new Date(), days = 7) {
    const scores = [];
    for (let i = 0; i < days; i++) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const s = wellnessScore((wellness || {})[dateKey(d)]);
        if (s != null) scores.push(s);
    }
    return scores.length >= 2 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : null;
}

// ---------- Vorschlag pro Uebung (Doppelte Progression, 8-12 Wdh.) ----------
const roundTo = (v, step) => Math.round(v / step) * step;
export const fmtKg = (n) => String(Math.round(n * 100) / 100).replace('.', ',');

export function suggestNext(lastSets, { factor = 1, deload = false, lastRpe = null, repMin = 8, repMax = 12 } = {}) {
    const sets = (lastSets || [])
        .map((s) => ({ w: toNum(s.weight), r: toNum(s.reps) }))
        .filter((s) => s.r > 0);
    if (sets.length === 0) return null;

    const topW = Math.max(...sets.map((s) => s.w));
    const atTop = sets.filter((s) => s.w === topW);
    const minReps = Math.min(...atTop.map((s) => s.r));
    const setCount = factor < 1 || deload ? Math.max(1, Math.round(sets.length * (deload ? 0.6 : factor))) : null;

    let weight = topW, reps = minReps, kind = 'reps';
    if (deload) {
        kind = 'deload';
    } else if (lastRpe != null && lastRpe >= 9.5) {
        kind = 'hold';
    } else if (minReps >= repMax) {
        if (topW > 0) { weight = roundTo(topW + Math.max(1.25, roundTo(topW * 0.025, 1.25)), 1.25); }
        reps = repMin; kind = 'weight';
    } else {
        reps = Math.min(repMax, minReps + 1);
    }

    const base = weight > 0 ? `${fmtKg(weight)} kg × ${reps}` : `${reps} Wdh.`;
    const label = { weight: 'Gewicht steigern', reps: '+1 Wdh.', hold: 'halten', deload: 'Deload' }[kind];
    return { weight, reps, kind, setCount, text: base, label };
}
