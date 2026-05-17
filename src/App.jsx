import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Settings, Users, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, CalendarDays, Filter, Smartphone, Download, Printer, Sliders, Activity } from 'lucide-react';

const DAY_TYPES = {
  mon:    { label: 'Lunes',    score: 1   },
  tuewed: { label: 'Mar/Mié',  score: 1   },
  thu:    { label: 'Jueves',   score: 1.5 },
  fri:    { label: 'Viernes',  score: 2   },
  sat:    { label: 'Sábado',   score: 3   },
  sun:    { label: 'Domingo',  score: 2.5 }
};

const RESIDENT_COLORS = [
  'bg-blue-200 text-blue-800 border-blue-300',
  'bg-emerald-200 text-emerald-800 border-emerald-300',
  'bg-purple-200 text-purple-800 border-purple-300',
  'bg-amber-200 text-amber-800 border-amber-300',
  'bg-rose-200 text-rose-800 border-rose-300',
  'bg-cyan-200 text-cyan-800 border-cyan-300',
  'bg-fuchsia-200 text-fuchsia-800 border-fuchsia-300',
  'bg-lime-200 text-lime-800 border-lime-300',
  'bg-orange-200 text-orange-800 border-orange-300',
  'bg-indigo-200 text-indigo-800 border-indigo-300',
  'bg-teal-200 text-teal-800 border-teal-300',
  'bg-pink-200 text-pink-800 border-pink-300',
  'bg-yellow-200 text-yellow-800 border-yellow-300',
  'bg-sky-200 text-sky-800 border-sky-300',
  'bg-violet-200 text-violet-800 border-violet-300',
];

const DEFAULT_WEIGHTS = {
  sandwichEquity: 20000,
  sandwichTotal:  10000,
  shiftEquity:    25000,
  scoreEquity:    15000,
  monEquity:      10000,
  tuewedEquity:   10000,
  thuEquity:      10000,
  satEquity:      15000,
  sunEquity:      15000,
  prefDontWant:   3000,
  prefWant:       3000,
  happyThu:       5000
};

const FUNNY_MESSAGES = [
  "Calculando Twobags...",
  "Aspirando ECNE...",
  "Pesando pañales para el balance...",
  "Sirviendo pescapollo...",
  "Intentando calcular pasaje de gamma...",
  "Iniciando lloradita para interconsultor...",
  "Traduciendo evoluciones de oftalmo...",
  "Corrigiendo diabéticos...",
  "Regalándole comida al social...",
  "Colocando vía intraósea en bebuchi con GEA...",
  "Vendiéndole el bronquiolo a UTIP...",
  "SIGEHANDO ingreso de las 4am...",
  "Llegando tarde a curso superior...",
  "Recopilando antecedentes de paciente de Sandra...",
  "Interconsultando a nefro a escondidas en CEM4...",
  "Contando control de salud...",
  "Habilitando cateter del NFAR...",
  "Revisando epicrisis...",
  "Percentilando ingreso a último momento...",
  "Actualizando IPASS...",
  "Actualizando indicaciones...",
  "Preparando mate para el pase...",
  "Realizando recuento de sociales...",
  "Preparando lora para el convulsivo...",
  "Iniciando discusión con enfermería...",
  "Interrogando medio para TBC...",
  "Evolucionando carpetas...",
  "Convenciendo a cirugía para colocación de vía...",
  "Comenzando pase con infecto...",
  "Despertándo al décimo...",
  "Peleleando febril sin foco...",
  "Cambiando goteo de PHP...",
  "Tramitando CUD...",
  "Transfundiendo pelados...",
  "Esperando a que se vaya la planta...",
  "Colocando monitor...",
  "Realizando hisopados de vigilancia...",
  "Contándole el ingreso a un R3 dormido...",
  "Recordando nombre del R4...",
  "Indicando claritro a bronquiolo con Rx normal...",
  "Revisando cultivos...",
  "Esperando resultado de las químicas...",
  "Intentando llegar al Ferrer...",
  "Limpiando CAFO..."
];

const WeightSlider = ({ label, value, onChange, desc, max }) => (
  <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 flex flex-col justify-center shadow-sm">
    <div className="flex justify-between items-center mb-1">
      <span className="font-bold text-gray-700 text-sm">{label}</span>
      <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-extrabold">{value} pts</span>
    </div>
    <p className="text-xs text-gray-500 mb-4 min-h-[32px]">{desc}</p>
    <input type="range" min="0" max={max} step="1000" value={value}
      onChange={(e) => onChange(parseInt(e.target.value))}
      className="w-full accent-orange-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer" />
    <div className="flex justify-between text-[10px] text-gray-400 mt-2 font-medium">
      <span>0 (Ignorar)</span><span>{max} (Crítico)</span>
    </div>
  </div>
);

const toDateStr = (y, m, d) => `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;

// Función auxiliar para calcular varianza matemática
const calcVariance = (arr) => {
  const R = arr.length;
  if (R === 0) return 0;
  let sum = 0;
  for (let i = 0; i < R; i++) sum += arr[i];
  const mean = sum / R;
  let variance = 0;
  for (let i = 0; i < R; i++) variance += (arr[i] - mean) ** 2;
  return variance / R;
};

export default function App() {
  const [baseDate, setBaseDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [numMonths, setNumMonths] = useState(1);
  const [numResidents, setNumResidents] = useState(5);
  const [residentsPerDay, setResidentsPerDay] = useState(1);

  const [holidays, setHolidays] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [residentNames, setResidentNames] = useState({});

  const getResName = (id) => residentNames[id]?.trim() || `Residente ${id+1}`;
  const getShortResName = (id) => residentNames[id]?.trim() || `Res. ${id+1}`;

  const [configDate, setConfigDate] = useState(new Date(baseDate));
  const [configMode, setConfigMode] = useState('holidays');
  const [prefSubMode, setPrefSubMode] = useState('dontWant');
  const [selectedResId, setSelectedResId] = useState(0);

  const [schedule, setSchedule] = useState({});
  const [stats, setStats] = useState([]);
  const [violations, setViolations] = useState([]);
  const [activeTab, setActiveTab] = useState('config');
  const [resultMonthOffset, setResultMonthOffset] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [weights, setWeights] = useState(DEFAULT_WEIGHTS);
  
  // UI de Progreso Asíncrono
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallMsg, setShowInstallMsg] = useState(false);

  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallAndroid = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setDeferredPrompt(null);
    } else {
      setShowInstallMsg(true);
      setTimeout(() => setShowInstallMsg(false), 5000);
    }
  };

  const exportAsImage = () => {
    setIsExporting(true);
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    script.onload = () => {
      const element = document.getElementById('calendar-export-node');
      window.html2canvas(element, { scale: 2, backgroundColor: '#ffffff' }).then(canvas => {
        const link = document.createElement('a');
        link.download = 'guardias-cuneras.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
        setIsExporting(false);
      });
    };
    document.body.appendChild(script);
  };

  const printAsPDF = () => window.print();

  const toggleHoliday = (dateStr) =>
    setHolidays(prev => prev.includes(dateStr) ? prev.filter(d => d !== dateStr) : [...prev, dateStr].sort());

  const togglePreference = (resId, dateStr) => {
    setPreferences(prev => {
      const rp = prev[resId] || { vacation: [], want: [], dontWant: [] };
      const vac  = rp.vacation.filter(d => d !== dateStr);
      const want = rp.want.filter(d => d !== dateStr);
      const dont = rp.dontWant.filter(d => d !== dateStr);
      if (prefSubMode === 'vacation' && !rp.vacation.includes(dateStr)) vac.push(dateStr);
      if (prefSubMode === 'want'     && !rp.want.includes(dateStr))     want.push(dateStr);
      if (prefSubMode === 'dontWant' && !rp.dontWant.includes(dateStr)) dont.push(dateStr);
      return { ...prev, [resId]: { vacation: vac.sort(), want: want.sort(), dontWant: dont.sort() } };
    });
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  ALGORITMO v6 — EQUIDAD POR VARIANZA (TODOS LOS DÍAS) + HARD CONSTRAINTS
  // ─────────────────────────────────────────────────────────────────────────
  const generateScheduleAsync = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Analizando configuración base...');
    
    // Dejamos que React renderice el modal
    await new Promise(r => setTimeout(r, 50));

    // ── [1] PREPARAR TIMELINE Y DATOS BASE ────────────────────────────
    const timeline = [];
    for (let i = 0; i < numMonths; i++) {
      const cm = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const y = cm.getFullYear(), m = cm.getMonth();
      const dim = new Date(y, m+1, 0).getDate();
      for (let d = 1; d <= dim; d++) {
        const dateStr = toDateStr(y, m, d);
        const dow = new Date(y, m, d).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isHol = holidays.includes(dateStr);
        timeline.push({ dateStr, dow, isWeekend, isHol, isWorkday: !isWeekend && !isHol, effectiveType: null });
      }
    }

    // 1. Asignar el tipo de día por defecto a TODOS los días de la línea de tiempo
    for (let i = 0; i < timeline.length; i++) {
      const day = timeline[i];
      if      (day.dow === 0)                  day.effectiveType = 'sun';
      else if (day.dow === 6)                  day.effectiveType = 'sat';
      else if (day.dow === 5)                  day.effectiveType = 'fri';
      else if (day.dow === 4)                  day.effectiveType = 'thu';
      else if (day.dow === 2 || day.dow === 3) day.effectiveType = 'tuewed';
      else                                     day.effectiveType = 'mon';
    }

    // 2. Aplicar las reglas estrictas de feriados (sobreescriben los defectos)
    for (let i = 0; i < timeline.length; i++) {
      const day = timeline[i];
      if (!day.isHol) continue;

      const prev = i > 0 ? timeline[i-1] : null;
      const pp   = i > 1 ? timeline[i-2] : null;

      if (day.dow === 5) {
        // Viernes feriado
        day.effectiveType = 'sat';
        if (prev) prev.effectiveType = 'fri'; // Jueves anterior = Viernes
        if (pp)   pp.effectiveType = 'thu';   // Miércoles anterior = Jueves (Aplica para Jueves Feliz)
      } else if (day.dow === 1) {
        // Lunes feriado
        day.effectiveType = 'sun';
        if (prev) prev.effectiveType = 'sat'; // Domingo anterior = Sábado
        // El martes (day.dow === 2) posterior ya es 'tuewed' por defecto, no se toca.
      } else if (day.dow >= 2 && day.dow <= 4) {
        // Martes, Miércoles o Jueves feriado
        day.effectiveType = 'sun';
        if (prev) prev.effectiveType = 'fri'; // Día previo = Viernes (el anterior no cambia a Jueves)
      }
    }

    const N = timeline.length;
    const R = numResidents;
    const rpd = residentsPerDay;
    const typeArr  = timeline.map(t => t.effectiveType);
    const scoreArr = typeArr.map(t => DAY_TYPES[t].score);

    const vacMat  = Array.from({length: R}, () => new Uint8Array(N));
    const dontMat = Array.from({length: R}, () => new Uint8Array(N));
    const wantMat = Array.from({length: R}, () => new Uint8Array(N));
    const totalWant = new Array(R).fill(0);

    for (let r = 0; r < R; r++) {
      const p = preferences[r] || { vacation: [], want: [], dontWant: [] };
      for (let d = 0; d < N; d++) {
        const ds = timeline[d].dateStr;
        if (p.vacation.includes(ds))  vacMat[r][d]  = 1;
        if (p.dontWant.includes(ds))  dontMat[r][d] = 1;
        if (p.want.includes(ds))      { wantMat[r][d] = 1; totalWant[r]++; }
      }
    }

    const isMon       = new Uint8Array(N);
    const isTueWed    = new Uint8Array(N);
    const isSat       = new Uint8Array(N);
    const isSun       = new Uint8Array(N);
    const isThu       = new Uint8Array(N);
    const isFriSatSun = new Uint8Array(N);
    for (let d = 0; d < N; d++) {
      if (typeArr[d] === 'mon') isMon[d] = 1;
      if (typeArr[d] === 'tuewed') isTueWed[d] = 1;
      if (typeArr[d] === 'sat') isSat[d] = 1;
      if (typeArr[d] === 'sun') isSun[d] = 1;
      if (typeArr[d] === 'thu') isThu[d] = 1;
      if (['fri','sat','sun'].includes(typeArr[d])) isFriSatSun[d] = 1;
    }

    // ── [2] CORE DEL ALGORITMO: ESTADO Y COSTOS INCREMENTALES ─────────
    
    // Comprueba de forma absoluta que la inserción sea válida (Hard Constraints)
    const isValidInsertion = (r, d, currentDayList, ignoreD = -1) => {
      if (vacMat[r][d]) return false;
      for (let i = 0; i < currentDayList.length; i++) {
        let wd = currentDayList[i];
        if (wd === ignoreD) continue;
        if (Math.abs(wd - d) <= 1) return false; // Bloquea días consecutivos
      }
      return true;
    };

    // Actualiza métricas de un residente específico (O(1) amortizado por N bajo)
    const updateResidentMetrics = (r, state) => {
      let dl = state.dayList[r];
      dl.sort((a,b) => a - b);
      
      let score = 0, mon = 0, tuewed = 0, thu = 0, sat = 0, sun = 0, sandwich = 0, pref = 0, thuPen = 0;
      let missedWant = totalWant[r];

      for (let i = 0; i < dl.length; i++) {
        let d = dl[i];
        score += scoreArr[d];
        if (isMon[d]) mon++;
        if (isTueWed[d]) tuewed++;
        if (isThu[d]) thu++;
        if (isSat[d]) sat++;
        if (isSun[d]) sun++;
        if (i > 0 && dl[i] - dl[i-1] === 2) sandwich++;
        if (dontMat[r][d]) pref += weights.prefDontWant;
        if (wantMat[r][d]) missedWant--;
        
        // Jueves feliz (si hace jueves, no debería hacer vie/sab/dom siguientes)
        if (isThu[d]) {
          for (let j = i+1; j < dl.length; j++) {
            if (dl[j] - d <= 3 && isFriSatSun[dl[j]]) { thuPen++; break; }
            if (dl[j] - d > 3) break;
          }
        }
      }
      
      pref += missedWant * weights.prefWant;
      
      state.shiftC[r] = dl.length;
      state.scoreC[r] = score;
      state.monC[r] = mon;
      state.tuewedC[r] = tuewed;
      state.thuC[r] = thu;
      state.satC[r] = sat;
      state.sunC[r] = sun;
      state.sandwichC[r] = sandwich;
      state.prefC[r] = pref;
      state.happyThuC[r] = thuPen;
    };

    const computeTotalCost = (state) => {
      let cost = 0;
      // Varianza matemática para equidad absoluta
      cost += calcVariance(state.shiftC) * weights.shiftEquity;
      cost += calcVariance(state.scoreC) * weights.scoreEquity;
      
      // Equidad por tipo de día
      cost += calcVariance(state.monC) * weights.monEquity;
      cost += calcVariance(state.tuewedC) * weights.tuewedEquity;
      cost += calcVariance(state.thuC) * weights.thuEquity;
      cost += calcVariance(state.satC) * weights.satEquity;
      cost += calcVariance(state.sunC) * weights.sunEquity;
      
      // Sanguchitos: Penaliza equidad Y cantidad total
      cost += calcVariance(state.sandwichC) * weights.sandwichEquity;
      let totSandwich = 0;
      for(let i=0; i<R; i++) {
        totSandwich += state.sandwichC[i];
        cost += state.prefC[i];
        cost += state.happyThuC[i] * weights.happyThu;
      }
      cost += totSandwich * weights.sandwichTotal;
      
      return cost;
    };

    // Función universal para aplicar movimientos matemáticos exactos y crear su Rollback
    const doMove = (mat, state, moves) => {
      let involved = new Set();
      for (let m of moves) { involved.add(m.oldR); involved.add(m.newR); }
      
      let backup = {};
      for (let r of involved) {
        backup[r] = {
          dl: [...state.dayList[r]], shift: state.shiftC[r], score: state.scoreC[r],
          mon: state.monC[r], tuewed: state.tuewedC[r], thu: state.thuC[r],
          sat: state.satC[r], sun: state.sunC[r], sandwich: state.sandwichC[r],
          pref: state.prefC[r], happyThu: state.happyThuC[r]
        };
      }
      
      for (let m of moves) {
        mat[m.d][m.s] = m.newR;
        state.dayList[m.oldR] = state.dayList[m.oldR].filter(x => x !== m.d);
        state.dayList[m.newR].push(m.d);
      }
      
      for (let r of involved) updateResidentMetrics(r, state);
      
      return function rollback() {
        for (let m of moves) mat[m.d][m.s] = m.oldR;
        for (let r of involved) {
          state.dayList[r] = backup[r].dl;
          state.shiftC[r] = backup[r].shift;
          state.scoreC[r] = backup[r].score;
          state.monC[r] = backup[r].mon;
          state.tuewedC[r] = backup[r].tuewed;
          state.thuC[r] = backup[r].thu;
          state.satC[r] = backup[r].sat;
          state.sunC[r] = backup[r].sun;
          state.sandwichC[r] = backup[r].sandwich;
          state.prefC[r] = backup[r].pref;
          state.happyThuC[r] = backup[r].happyThu;
        }
      };
    };

    // Generador Estricto Inicial: Garantiza 0 reglas duras rotas
    const generateValidInit = () => {
      for (let attempt = 0; attempt < 5000; attempt++) {
        let mat = Array.from({length: N}, () => []);
        let dayList = Array.from({length: R}, () => []);
        let valid = true;
        
        for (let d = 0; d < N; d++) {
          let available = [];
          for (let r = 0; r < R; r++) {
            if (!vacMat[r][d] && !dayList[r].includes(d - 1)) {
              available.push(r);
            }
          }
          available.sort(() => Math.random() - 0.5);
          
          for (let s = 0; s < rpd; s++) {
            if (available.length === 0) { valid = false; break; }
            let chosen = available.shift();
            mat[d].push(chosen);
            dayList[chosen].push(d);
          }
          if (!valid) break;
        }
        if (valid) return mat;
      }
      return null;
    };

    // ── [3] CICLO PRINCIPAL: SA + REINICIOS ASÍNCRONOS ────────────────
    const NUM_RESTARTS = 6;
    const ITERS_PER_RESTART = 1500000; // 9 Millones en total
    const CHUNK_SIZE = 50000;

    let globalBestMat = null;
    let globalBestCost = Infinity;

    for (let restart = 1; restart <= NUM_RESTARTS; restart++) {
      const randomMsg = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
      setGenerationStatus(`${randomMsg} (Reinicio ${restart}/${NUM_RESTARTS})`);
      
      let mat = generateValidInit();
      if (!mat) {
        alert("Imposible encontrar una configuración válida con las vacaciones actuales. Revisa que haya suficientes residentes disponibles.");
        setIsGenerating(false);
        return;
      }

      let state = {
        dayList: Array.from({length: R}, () => []),
        shiftC: new Array(R).fill(0), scoreC: new Array(R).fill(0),
        monC: new Array(R).fill(0), tuewedC: new Array(R).fill(0), thuC: new Array(R).fill(0),
        satC: new Array(R).fill(0), sunC: new Array(R).fill(0),
        sandwichC: new Array(R).fill(0), prefC: new Array(R).fill(0),
        happyThuC: new Array(R).fill(0)
      };

      for (let d = 0; d < N; d++) {
        for (let s = 0; s < rpd; s++) {
          state.dayList[mat[d][s]].push(d);
        }
      }
      for (let r = 0; r < R; r++) updateResidentMetrics(r, state);

      let currentCost = computeTotalCost(state);
      let bestMat = mat.map(r => [...r]);
      let bestCost = currentCost;

      let T0 = 20000;
      let Tf = 0.1;
      let alpha = Math.pow(Tf / T0, 1 / ITERS_PER_RESTART);
      let temp = T0;

      for (let iter = 0; iter < ITERS_PER_RESTART; iter++) {
        // Yield al UI Thread para no congelar la PC
        if (iter % CHUNK_SIZE === 0) {
          const progress = ((restart - 1) * ITERS_PER_RESTART + iter) / (NUM_RESTARTS * ITERS_PER_RESTART) * 100;
          setGenerationProgress(progress);
          await new Promise(r => setTimeout(r, 0));
        }

        let moveType = Math.random();
        let moves = null;

        if (moveType < 0.40) {
          // Replace
          let d = Math.floor(Math.random() * N);
          let s = Math.floor(Math.random() * rpd);
          let r_old = mat[d][s];
          let r_new = Math.floor(Math.random() * R);
          if (r_old !== r_new && !mat[d].includes(r_new) && isValidInsertion(r_new, d, state.dayList[r_new])) {
            moves = [{d, s, oldR: r_old, newR: r_new}];
          }
        } else if (moveType < 0.70) {
          // Swap
          let d1 = Math.floor(Math.random() * N);
          let s1 = Math.floor(Math.random() * rpd);
          let d2 = Math.floor(Math.random() * N);
          let s2 = Math.floor(Math.random() * rpd);
          if (d1 !== d2) {
            let r1 = mat[d1][s1], r2 = mat[d2][s2];
            if (r1 !== r2 && !mat[d1].includes(r2) && !mat[d2].includes(r1)) {
              if (isValidInsertion(r1, d2, state.dayList[r1], d1) && isValidInsertion(r2, d1, state.dayList[r2], d2)) {
                moves = [{d: d1, s: s1, oldR: r1, newR: r2}, {d: d2, s: s2, oldR: r2, newR: r1}];
              }
            }
          }
        } else if (moveType < 0.85) {
          // Targeted Sandwich Repair
          let candidates = [];
          for (let r=0; r<R; r++) if (state.sandwichC[r] > 0) candidates.push(r);
          if (candidates.length > 0) {
            let r = candidates[Math.floor(Math.random() * candidates.length)];
            let dl = state.dayList[r];
            for (let i=1; i<dl.length; i++) {
              if (dl[i] - dl[i-1] === 2) {
                let targetD = Math.random() < 0.5 ? dl[i] : dl[i-1];
                let s = mat[targetD].indexOf(r);
                let r_new = Math.floor(Math.random() * R);
                if (r_new !== r && !mat[targetD].includes(r_new) && isValidInsertion(r_new, targetD, state.dayList[r_new])) {
                  moves = [{d: targetD, s, oldR: r, newR: r_new}];
                  break;
                }
              }
            }
          }
        } else {
          // Targeted Shift Equity
          let maxR = 0, minR = 0;
          for (let r=1; r<R; r++) {
            if (state.shiftC[r] > state.shiftC[maxR]) maxR = r;
            if (state.shiftC[r] < state.shiftC[minR]) minR = r;
          }
          if (maxR !== minR && state.shiftC[maxR] > state.shiftC[minR]) {
            let dl = state.dayList[maxR];
            if (dl.length > 0) {
              let d = dl[Math.floor(Math.random() * dl.length)];
              let s = mat[d].indexOf(maxR);
              if (!mat[d].includes(minR) && isValidInsertion(minR, d, state.dayList[minR])) {
                moves = [{d, s, oldR: maxR, newR: minR}];
              }
            }
          }
        }

        if (moves) {
          let rollback = doMove(mat, state, moves);
          let newCost = computeTotalCost(state);
          let delta = newCost - currentCost;
          
          if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            currentCost = newCost;
            if (newCost < bestCost) {
              bestCost = newCost;
              bestMat = mat.map(row => [...row]);
            }
          } else {
            rollback(); // Revertir O(1)
          }
        }

        temp *= alpha;
      }

      if (bestCost < globalBestCost) {
        globalBestCost = bestCost;
        globalBestMat = bestMat;
      }
    }

    setGenerationProgress(100);
    setGenerationStatus('Configuración óptima encontrada');
    
    setTimeout(() => buildFinalSchedule(globalBestMat, timeline), 500);
  };

  const buildFinalSchedule = (bestMatrix, timeline) => {
    const R = numResidents;
    const rpd = residentsPerDay;
    const finalSchedule = {};
    const finalStats = Array.from({length: R}, (_, i) => ({
      id: i, totalShifts: 0, score: 0, shiftDays: [],
      counts: { mon: 0, tuewed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      sandwiches: 0, triples: 0
    }));

    for (let d = 0; d < bestMatrix.length; d++) {
      const dateStr = timeline[d].dateStr;
      finalSchedule[dateStr] = [];
      for (let s = 0; s < rpd; s++) {
        const rId = bestMatrix[d][s];
        finalStats[rId].shiftDays.push(d);
        finalStats[rId].totalShifts++;
        finalStats[rId].score += DAY_TYPES[timeline[d].effectiveType].score;
        finalStats[rId].counts[timeline[d].effectiveType]++;
        finalSchedule[dateStr].push({ resId: rId, isSandwich: false, isTriple: false });
      }
    }

    const newViolations = [];
    for (let r = 0; r < R; r++) {
      const days = finalStats[r].shiftDays.sort((a,b) => a-b);
      for (let i = 0; i < days.length; i++) {
        const dIdx = days[i];
        if (i > 0 && days[i] - days[i-1] === 1)
          newViolations.push(`🔥 Pérdida de derechos laborales: ${timeline[dIdx].dateStr} — ${getResName(r)} trabaja días seguidos (No debería ocurrir).`);

        if (i > 0 && days[i] - days[i-1] === 2) {
          let isTrip = false;
          if (i > 1 && days[i-1] - days[i-2] === 2) {
            isTrip = true;
            finalStats[r].triples++;
            newViolations.push(`CRÍTICO: ${timeline[dIdx].dateStr} - Le cabe triple sanguchito a ${getResName(r)}.`);
          } else {
            finalStats[r].sandwiches++;
          }
          const entry = finalSchedule[timeline[dIdx].dateStr].find(e => e.resId === r);
          if (entry) { entry.isSandwich = !isTrip; entry.isTriple = isTrip; }
        }

        if (timeline[dIdx].effectiveType === 'thu' && i < days.length-1 && days[i+1] - dIdx <= 3) {
          if (['fri','sat','sun'].includes(timeline[days[i+1]].effectiveType))
            newViolations.push(`Problemita: ${timeline[days[i+1]].dateStr} - No se pudo respetar Jueves Felíz de ${getResName(r)}.`);
        }
      }

      const rPrefs = preferences[r] || { vacation: [], want: [], dontWant: [] };
      for (const dw of rPrefs.dontWant) {
        const di = timeline.findIndex(t => t.dateStr === dw);
        if (di !== -1 && bestMatrix[di].includes(r))
          newViolations.push(`Aviso: ${dw} — Ignorada preferencia 'NO Estar' de ${getResName(r)}.`);
      }
    }

    setSchedule(finalSchedule);
    setStats(finalStats);
    setViolations(newViolations);
    setResultMonthOffset(0);
    setIsGenerating(false);
    setActiveTab('calendar');
  };

  // ─────────────────────────────────────────────────────────────────────────
  //  RENDER HELPERS
  // ─────────────────────────────────────────────────────────────────────────
  const renderCalendarMonth = (targetDate, isConfig = false) => {
    const y = targetDate.getFullYear(), m = targetDate.getMonth();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const firstDay    = new Date(y, m, 1).getDay();

    return (
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm mt-4">
        <div className="grid grid-cols-7 border-b border-gray-200 bg-gray-50">
          {['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].map(d => (
            <div key={d} className="py-2 text-center text-xs md:text-sm font-semibold text-gray-600 border-r last:border-r-0">{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-fr">
          {Array.from({length: firstDay}).map((_, i) => (
            <div key={`e${i}`} className="min-h-[60px] border-r border-b border-gray-100 bg-gray-50/30" />
          ))}
          {Array.from({length: daysInMonth}).map((_, i) => {
            const day = i+1;
            const dateStr   = toDateStr(y, m, day);
            const isHol     = holidays.includes(dateStr);
            const isWeekend = new Date(y, m, day).getDay() === 0 || new Date(y, m, day).getDay() === 6;

            if (isConfig) {
              const rp         = preferences[selectedResId] || { vacation: [], want: [], dontWant: [] };
              const isVac      = configMode === 'preferences' && rp.vacation.includes(dateStr);
              const isWant     = configMode === 'preferences' && rp.want.includes(dateStr);
              const isDontWant = configMode === 'preferences' && rp.dontWant.includes(dateStr);
              let btnCls = 'bg-white hover:bg-gray-100 text-gray-700';
              if (configMode === 'holidays' && isHol) btnCls = 'bg-rose-500 text-white shadow-sm';
              else if (isVac)      btnCls = 'bg-slate-800 text-white';
              else if (isWant)     btnCls = 'bg-orange-100 text-orange-900 border border-orange-400';
              else if (isDontWant) btnCls = 'bg-amber-100 text-amber-900 border border-amber-400';

              return (
                <button key={day}
                  onClick={() => configMode === 'holidays' ? toggleHoliday(dateStr) : togglePreference(selectedResId, dateStr)}
                  className={`min-h-[60px] p-1 border-r border-b border-gray-100 relative transition-colors flex items-start justify-start ${btnCls}`}
                >
                  <span className={`text-xs font-bold ${(!isHol && !isVac && !isWant && !isDontWant && isWeekend) ? 'text-rose-500' : ''}`}>{day}</span>
                  {isHol && configMode === 'preferences' && <span className="absolute bottom-1 left-1 text-[9px] bg-rose-100 text-rose-600 px-1 rounded font-bold">FER</span>}
                  {isVac      && <span className="absolute bottom-1 right-1 text-[9px] bg-slate-600 text-white px-1 rounded font-bold">VAC</span>}
                  {isWant     && <span className="absolute bottom-1 right-1 text-[9px] bg-orange-500 text-white px-1 rounded font-bold">SI</span>}
                  {isDontWant && <span className="absolute bottom-1 right-1 text-[9px] bg-amber-500 text-white px-1 rounded font-bold">NO</span>}
                </button>
              );
            } else {
              const resInfos = schedule[dateStr] || [];
              return (
                <div key={day} className={`min-h-[100px] border-r border-b border-gray-100 p-1 md:p-2 flex flex-col relative transition-colors hover:bg-gray-50 ${isHol ? 'bg-rose-50/30' : ''}`}>
                  <span className={`text-sm font-medium mb-1 ${isWeekend || isHol ? 'text-rose-500' : 'text-gray-500'}`}>
                    {day} {isHol && <span className="hidden md:inline text-[10px] uppercase bg-rose-100 text-rose-600 px-1 rounded ml-1">Feriado</span>}
                  </span>
                  <div className="flex flex-col gap-1 mt-auto">
                    {resInfos.map((ri, idx) => (
                      <div key={idx} className={`p-1 md:p-1.5 rounded-md border text-xs md:text-sm font-bold text-center shadow-sm flex flex-col gap-0.5 ${RESIDENT_COLORS[ri.resId % RESIDENT_COLORS.length]} ${ri.isTriple ? 'ring-2 ring-red-500 ring-offset-1' : ''}`}>
                        <span className="truncate" title={getResName(ri.resId)}>{getShortResName(ri.resId)}</span>
                        {ri.isTriple   && <span className="bg-red-600 text-white text-[9px] px-1 rounded animate-pulse font-extrabold uppercase shadow-sm">⚠ TRIPLE ⚠</span>}
                        {ri.isSandwich && <span className="bg-amber-500 text-white text-[9px] px-1 rounded font-semibold">Sanguche</span>}
                      </div>
                    ))}
                  </div>
                </div>
              );
            }
          })}
        </div>
      </div>
    );
  };

  const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const resultViewDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + resultMonthOffset, 1);

  // ─────────────────────────────────────────────────────────────────────────
  //  JSX
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8 relative">
      
      {/* ── PROGRESS MODAL OVERLAY ── */}
      {isGenerating && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full shadow-2xl flex flex-col items-center text-center">
            <Activity className="w-16 h-16 text-orange-600 mb-4 animate-bounce" />
            <h3 className="text-2xl font-extrabold text-slate-800 mb-2">Calculando Guardias</h3>
            <p className="text-sm text-slate-500 font-medium mb-6">Que el niño cruz los acompañe</p>
            
            <div className="w-full bg-gray-200 rounded-full h-3 mb-2 overflow-hidden">
              <div className="bg-orange-600 h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${generationProgress}%` }}></div>
            </div>
            
            <div className="flex justify-between w-full text-xs font-bold text-gray-400 mb-4">
              <span>0%</span>
              <span className="text-orange-600">{generationProgress.toFixed(1)}%</span>
              <span>100%</span>
            </div>
            
            <p className="text-sm font-semibold text-slate-700 bg-orange-50 px-4 py-2 rounded-lg w-full border border-orange-100">{generationStatus}</p>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">

        {/* Header */}
        <div className="bg-slate-800 text-white p-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shrink-0 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-12 h-12 md:w-14 md:h-14">
                <rect x="25" y="20" width="20" height="25" fill="#f26322"/>
                <rect x="55" y="20" width="20" height="25" fill="#f26322"/>
                <rect x="25" y="55" width="20" height="25" fill="#f26322"/>
                <rect x="55" y="55" width="20" height="25" fill="#f26322"/>
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-orange-500 uppercase">GUARDIAS CUNERAS</h1>
              <span className="text-xs md:text-sm text-gray-400 mt-1">By Zaca · Algoritmo de equidad por varianza total</span>
            </div>
          </div>
          <button onClick={handleInstallAndroid}
            className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
            <Smartphone className="w-4 h-4" /> Instalar App
          </button>
        </div>

        {showInstallMsg && (
          <div className="bg-blue-600 text-white text-center text-sm py-2 px-4">
            Para instalar en Android: menú de Chrome (3 puntitos) → "Añadir a la pantalla de inicio".
          </div>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50/50 overflow-x-auto whitespace-nowrap scrollbar-hide">
          {[
            { id: 'config',   icon: Settings,    label: 'Configuración' },
            { id: 'calendar', icon: CalendarIcon, label: 'Calendario'    },
            { id: 'stats',    icon: Users,        label: 'Estadísticas'  },
            { id: 'weights',  icon: Sliders,      label: 'Prioridades'   },
          ].map(({ id, icon: Icon, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={`flex-1 shrink-0 py-3 px-6 text-sm font-medium flex items-center justify-center gap-2 transition-colors
                ${activeTab === id ? 'border-b-2 border-orange-500 text-orange-700 bg-white' : 'text-gray-500 hover:text-gray-700'}`}>
              <Icon className="w-4 h-4" /> {label}
            </button>
          ))}
        </div>

        <div className="p-6">

          {/* ── CONFIG TAB ── */}
          {activeTab === 'config' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Mes de Inicio</label>
                  <div className="flex items-center gap-2 bg-gray-50 p-2 rounded-lg border border-gray-200">
                    <button onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth()-1, 1))} className="p-1 hover:text-orange-600"><ChevronLeft className="w-5 h-5"/></button>
                    <span className="flex-1 text-center font-semibold text-gray-800">{capitalize(baseDate.toLocaleString('es-ES', {month:'long', year:'numeric'}))}</span>
                    <button onClick={() => setBaseDate(new Date(baseDate.getFullYear(), baseDate.getMonth()+1, 1))} className="p-1 hover:text-orange-600"><ChevronRight className="w-5 h-5"/></button>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Período a Generar</label>
                  <select value={numMonths} onChange={(e) => setNumMonths(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 outline-none focus:border-orange-500">
                    {[1,2,3,4,5,6,7,8,9,10,11,12].map(n => <option key={n} value={n}>{n} {n===1?'Mes':'Meses'}</option>)}
                  </select>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Número total de resis</label>
                  <select value={numResidents}
                    onChange={(e) => { const v = parseInt(e.target.value); setNumResidents(v); if (selectedResId >= v) setSelectedResId(0); }}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 outline-none focus:border-orange-500">
                    {Array.from({ length: 36 }, (_, i) => i + 2).map(n => (
                      <option key={n} value={n}>{n} Residentes</option>
                    ))}
                  </select>
                </div>
                <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                  <label className="block text-sm font-bold text-gray-700 mb-2">Resis por Día</label>
                  <select value={residentsPerDay} onChange={(e) => setResidentsPerDay(parseInt(e.target.value))}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 outline-none focus:border-orange-500">
                    {[1,2,3].map(n => <option key={n} value={n}>{n} Residente{n>1?'s':''}</option>)}
                  </select>
                </div>
              </div>

              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  <Users className="w-5 h-5 text-orange-600"/> Nombres del equipazo
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {Array.from({length: numResidents}).map((_, i) => {
                    const borderCls = RESIDENT_COLORS[i % RESIDENT_COLORS.length].split(' ')[2];
                    return (
                      <input key={i} type="text" placeholder={`Residente ${i+1}`}
                        value={residentNames[i] || ''}
                        onChange={(e) => setResidentNames(prev => ({...prev, [i]: e.target.value}))}
                        className={`w-full p-2 text-sm font-medium bg-gray-50 border-y border-r border-l-4 rounded outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white placeholder-gray-400 transition-colors ${borderCls}`} />
                    );
                  })}
                </div>
              </div>

              {/* Config calendar */}
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold !text-[#222222] flex items-center gap-2"><Filter className="w-5 h-5 text-orange-600"/> Editor del Calendario Base</h2>
                    <p className="text-sm text-gray-500 mt-1">Configura feriados y bloqueos personales por mes.</p>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                    <button onClick={() => setConfigDate(new Date(configDate.getFullYear(), configDate.getMonth()-1, 1))} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft className="w-4 h-4"/></button>
                    <span className="min-w-[120px] text-center font-semibold text-sm">{capitalize(configDate.toLocaleString('es-ES', {month:'short', year:'numeric'}))}</span>
                    <button onClick={() => setConfigDate(new Date(configDate.getFullYear(), configDate.getMonth()+1, 1))} className="p-1 hover:bg-slate-200 rounded"><ChevronRight className="w-4 h-4"/></button>
                  </div>
                </div>

                <div className="flex flex-col md:flex-row gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                  <div className="flex bg-white rounded-lg p-1 border border-gray-200 shadow-sm w-full md:w-auto">
                    <button onClick={() => setConfigMode('holidays')}
                      className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all ${configMode === 'holidays' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                      1. Marcar Feriados
                    </button>
                    <button onClick={() => setConfigMode('preferences')}
                      className={`flex-1 md:flex-none px-4 py-2 text-sm font-semibold rounded-md transition-all ${configMode === 'preferences' ? 'bg-indigo-100 text-indigo-700 shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}>
                      2. Marcar Preferencias
                    </button>
                  </div>
                  {configMode === 'preferences' && (
                    <div className="flex flex-col gap-2 animate-in fade-in w-full md:w-auto bg-white p-2 rounded-lg border border-gray-200">
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-gray-600">Para:</span>
                        <select value={selectedResId} onChange={(e) => setSelectedResId(parseInt(e.target.value))}
                          className="flex-1 md:flex-none p-1.5 text-sm bg-gray-50 border border-gray-300 rounded-md outline-none focus:border-indigo-500 font-semibold">
                          {Array.from({length: numResidents}).map((_, i) => (
                            <option key={i} value={i}>{getResName(i)}</option>
                          ))}
                        </select>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <button onClick={() => setPrefSubMode('vacation')} className={`text-xs px-2 py-1.5 rounded-md font-bold transition-colors ${prefSubMode==='vacation'?'bg-slate-800 text-white shadow-sm':'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>Vacaciones</button>
                        <button onClick={() => setPrefSubMode('want')}     className={`text-xs px-2 py-1.5 rounded-md font-bold transition-colors ${prefSubMode==='want'?'bg-orange-500 text-white shadow-sm':'bg-orange-50 text-orange-700 hover:bg-orange-100'}`}>Prefiere Estar</button>
                        <button onClick={() => setPrefSubMode('dontWant')} className={`text-xs px-2 py-1.5 rounded-md font-bold transition-colors ${prefSubMode==='dontWant'?'bg-amber-500 text-white shadow-sm':'bg-amber-50 text-amber-700 hover:bg-amber-100'}`}>No Estar</button>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500 italic mt-2 mb-1">
                  {configMode === 'holidays' ? '* Click en un día para marcarlo como feriado.' : '* Elegir el tipo de preferencia arriba y hacer click en el calendario.'}
                </p>
                {renderCalendarMonth(configDate, true)}
              </div>

              <button onClick={generateScheduleAsync}
                disabled={isGenerating || residentsPerDay > numResidents}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 disabled:bg-gray-400 text-white rounded-xl font-extrabold text-lg transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-3 mt-6">
                {residentsPerDay > numResidents ? (
                  'Error: Pide más residentes por día que el total disponible'
                ) : (
                  <><CalendarDays className="w-6 h-6"/> GENERAR GUARDIAS ÓPTIMAS </>
                )}
              </button>
            </div>
          )}

          {/* ── CALENDAR TAB ── */}
          {activeTab === 'calendar' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {Object.keys(schedule).length === 0 ? (
                <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-lg font-medium text-gray-600">Aún no hay calendario generado.</p>
                  <button onClick={() => setActiveTab('config')} className="mt-4 text-orange-600 font-bold hover:underline">Ir a configurar</button>
                </div>
              ) : (
                <div className="bg-white p-4 md:p-6 rounded-xl border border-gray-200 shadow-sm" id="calendar-export-node">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                      <h2 className="text-2xl font-extrabold text-gray-800">{capitalize(resultViewDate.toLocaleString('es-ES', {month:'long', year:'numeric'}))}</h2>
                      <p className="text-sm text-gray-500 font-medium">Calendario generado con mejor configuración obtenida</p>
                    </div>
                    <div className="flex items-center gap-2 w-full md:w-auto">
                      {numMonths > 1 && (
                        <div className="flex items-center gap-1 bg-slate-100 p-1.5 rounded-lg border border-slate-200 mr-2 flex-1 md:flex-none justify-center">
                          <button onClick={() => setResultMonthOffset(Math.max(0, resultMonthOffset-1))} disabled={resultMonthOffset===0} className="p-1 hover:bg-white disabled:opacity-50 rounded"><ChevronLeft className="w-4 h-4"/></button>
                          <span className="text-xs font-bold px-2">{resultMonthOffset+1} / {numMonths}</span>
                          <button onClick={() => setResultMonthOffset(Math.min(numMonths-1, resultMonthOffset+1))} disabled={resultMonthOffset===numMonths-1} className="p-1 hover:bg-white disabled:opacity-50 rounded"><ChevronRight className="w-4 h-4"/></button>
                        </div>
                      )}
                      <button onClick={printAsPDF} className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors border border-gray-300" title="Imprimir PDF"><Printer className="w-4 h-4"/></button>
                      <button onClick={exportAsImage} disabled={isExporting} className="p-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors shadow-sm flex items-center gap-2 font-semibold text-sm">
                        {isExporting ? <span className="animate-pulse">Exportando...</span> : <><Download className="w-4 h-4"/><span className="hidden md:inline">Descargar Imagen</span></>}
                      </button>
                    </div>
                  </div>

                  {renderCalendarMonth(resultViewDate, false)}

                  <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6" data-html2canvas-ignore>
                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                      <h4 className="font-bold text-sm text-gray-700 mb-3 flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500"/> Leyenda</h4>
                      <div className="flex flex-wrap gap-2">
                        {Array.from({length: numResidents}).map((_, i) => (
                          <div key={i} className={`text-xs px-2 py-1 rounded font-bold border ${RESIDENT_COLORS[i % RESIDENT_COLORS.length]}`}>{getShortResName(i)}</div>
                        ))}
                      </div>
                    </div>
                    {violations.length > 0 && (
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200">
                        <h4 className="font-bold text-sm text-rose-800 mb-2 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Alertas y Desvíos Menores</h4>
                        <div className="max-h-[120px] overflow-y-auto text-xs text-rose-700 space-y-1 font-medium pr-2">
                          {violations.map((v, i) => <div key={i} className="flex gap-2"><span>•</span><span>{v}</span></div>)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── STATS TAB ── */}
          {activeTab === 'stats' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {stats.length === 0 ? (
                <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-300 rounded-xl">
                  <Info className="w-12 h-12 text-gray-400 mx-auto mb-4"/>
                  <p className="text-lg font-medium text-gray-600">Genera un calendario para ver el análisis de equidad.</p>
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                  <div className="p-6 bg-slate-50 border-b border-gray-200">
                    <h2 className="text-xl font-bold !text-[#222222] flex items-center gap-2"><Activity className="w-6 h-6 text-orange-600"/> Balance y Equidad de los combos </h2>
                    <p className="text-sm text-gray-500 mt-1">Análisis de los resultados de la optimización</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider font-bold">
                          <th className="p-4 border-b">Residente</th>
                          <th className="p-4 border-b text-center text-indigo-700">LUN</th>
                          <th className="p-4 border-b text-center text-indigo-700">Ma/Mi</th>
                          <th className="p-4 border-b text-center text-indigo-700">JUE</th>
                          <th className="p-4 border-b text-center">VIE</th>
                          <th className="p-4 border-b text-center text-rose-700">SÁB</th>
                          <th className="p-4 border-b text-center text-rose-700">DOM</th>
                          <th className="p-4 border-b text-center bg-gray-200 text-gray-800">TOTAL</th>
                          <th className="p-4 border-b text-center bg-orange-100 text-orange-800">SCORE</th>
                          <th className="p-4 border-b text-center text-amber-700 bg-amber-50">SANGUCHES</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {stats.sort((a,b) => b.score - a.score).map((s) => (
                          <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                            <td className="p-4 font-bold flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${RESIDENT_COLORS[s.id % RESIDENT_COLORS.length].split(' ')[0]}`}/>
                              {getResName(s.id)}
                            </td>
                            <td className="p-4 text-center font-bold text-indigo-600">{s.counts.mon}</td>
                            <td className="p-4 text-center font-bold text-indigo-600">{s.counts.tuewed}</td>
                            <td className="p-4 text-center font-bold text-indigo-600">{s.counts.thu}</td>
                            <td className="p-4 text-center font-medium text-blue-600">{s.counts.fri}</td>
                            <td className="p-4 text-center font-bold text-rose-600">{s.counts.sat}</td>
                            <td className="p-4 text-center font-bold text-rose-500">{s.counts.sun}</td>
                            <td className="p-4 text-center font-extrabold bg-gray-100">{s.totalShifts}</td>
                            <td className="p-4 text-center font-extrabold bg-orange-50 text-orange-700">{s.score.toFixed(1)}</td>
                            <td className="p-4 text-center font-bold text-amber-600 bg-amber-50/30">
                              {s.sandwiches} {s.triples > 0 ? <span className="text-red-600">(+{s.triples} T)</span> : ''}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex flex-col gap-1">
                    <p><strong>Score (Dificultad):</strong> Lunes/Mar/Mié = 1 | Jueves = 1.5 | Viernes = 2 | Domingo = 2.5 | Sábado = 3</p>
                    <p><strong>Versión acutal:</strong> El algoritmo busca entre millones de configuraciones aquella que logre satisfacer todos los requerimientos. En algunas circunstancias es matemáticamente imposible, por lo que el algoritmo realizará algún sacrificio (no respetar un jueves felíz, poner un sanguchito, etc). Que tan permisivo es el algoritmo con estos sacrificios puede configurarse desde "Prioridades". Algunas cosas como "estar de guardia 48hs" directamente no son posibles y la app tirará error si no se puede satisfacer.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── WEIGHTS TAB ── */}
          {activeTab === 'weights' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h2 className="text-xl font-bold !text-[#222222] flex items-center gap-2"><Sliders className="w-6 h-6 text-orange-600"/> Ajuste de Prioridades</h2>
                    <p className="text-sm text-gray-500 mt-1">Poner valores altos para minimizar desigualdad (error cuadrático).</p>
                  </div>
                  <button onClick={() => setWeights(DEFAULT_WEIGHTS)} className="px-4 py-2 w-full md:w-auto bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-lg transition-colors border border-slate-300">
                    Restablecer Valores
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <WeightSlider label="Equidad Guardias Totales" value={weights.shiftEquity}     onChange={v => setWeights({...weights, shiftEquity: v})}    desc="Fuerza a que todos tengan la misma cantidad." max={100000}/>
                  <WeightSlider label="Equidad de Score Final"   value={weights.scoreEquity}     onChange={v => setWeights({...weights, scoreEquity: v})}    desc="Nivela suma de dificultad (Sábado=3, Lunes=1)." max={50000}/>
                  <WeightSlider label="Equidad Sanguchitos"      value={weights.sandwichEquity}  onChange={v => setWeights({...weights, sandwichEquity: v})} desc="Castiga que uno tenga muchos y otro pocos." max={100000}/>
                  
                  <WeightSlider label="Equidad de Lunes"         value={weights.monEquity}       onChange={v => setWeights({...weights, monEquity: v})}      desc="Prioriza misma cantidad de Lunes." max={100000}/>
                  <WeightSlider label="Equidad Martes/Miérc."    value={weights.tuewedEquity}    onChange={v => setWeights({...weights, tuewedEquity: v})}   desc="Prioriza misma cantidad de Martes y Miércoles." max={100000}/>
                  <WeightSlider label="Equidad de Jueves"        value={weights.thuEquity}       onChange={v => setWeights({...weights, thuEquity: v})}      desc="Prioriza misma cantidad de Jueves." max={100000}/>
                  
                  <WeightSlider label="Equidad de Sábados"       value={weights.satEquity}       onChange={v => setWeights({...weights, satEquity: v})}      desc="Prioriza misma cantidad de Sábados." max={100000}/>
                  <WeightSlider label="Equidad de Domingos"      value={weights.sunEquity}       onChange={v => setWeights({...weights, sunEquity: v})}      desc="Prioriza misma cantidad de Domingos." max={100000}/>
                  <WeightSlider label="Sanguchitos Totales"      value={weights.sandwichTotal}   onChange={v => setWeights({...weights, sandwichTotal: v})}  desc="Presiona para que en general haya muy pocos." max={50000}/>
                  
                  <WeightSlider label="Respetar 'No estar'"      value={weights.prefDontWant}    onChange={v => setWeights({...weights, prefDontWant: v})}   desc="Penalidad por asignar en día indeseado." max={20000}/>
                  <WeightSlider label="Respetar 'Quiero estar'"  value={weights.prefWant}        onChange={v => setWeights({...weights, prefWant: v})}       desc="Penalidad por NO asignar en día pedido." max={20000}/>
                  <WeightSlider label="Respetar Jueves Felíz"       value={weights.happyThu}        onChange={v => setWeights({...weights, happyThu: v})}       desc="Castigo por dar fin de semana a quien hizo el Jueves previo." max={20000}/>
                </div>
                <div className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-lg flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5"/>
                  <div className="text-sm text-emerald-800 font-medium">
                    <strong>Zaca:</strong> En primera instancia no es necesario tocar parámetros, debería funcionar bien así. Respetar "No quiero estar" puede aumentarse para usar como día libre en R4. Equidad de lunes puede aumentarse en invierno, o bajarse para R2 de CEM6, donde no influye tanto.
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}