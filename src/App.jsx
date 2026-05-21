import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Settings, Users, AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Info, CalendarDays, Filter, Smartphone, Download, Printer, Sliders, Activity, HelpCircle, X } from 'lucide-react';

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

const HELP_TEXT = `
**¿Qué hace la app?**
Genera el cronograma de guardias de forma automática, intentando que la carga sea lo más equitativa posible entre todos los residentes.

**Pasos para usarla:**

1. **Configuración general** – Elegí el mes de inicio, cuántos meses querés generar, cuántos residentes son y cuántos hacen guardia por día. Podés ponerle nombre a cada uno.

2. **Feriados** – En el calendario del editor, marcar "Marcar Feriados" y tocá los días que correspondan. La app los va a tratar distinto al resto (por ejemplo, un viernes feriado cuenta como sábado en dificultad).

3. **Preferencias personales** – Acá hay dos maneras de cargarlas. La manual requiere elegir resi por resi e ir cargando preferencias (se pueden cargar vacaciones, días que prefieren estar de guardia y días que prefieren no estar). También se puede usar el botón "Preferencias remotas" para que cada uno llene sus preferencias en su propio celular y se las mande al que coordine las guardias para hacer el proceso más ameno

4. **Generá el cronograma** – Apretá el botón de abajo de todo. El algoritmo corre 9 millones de iteraciones buscando la solución más equitativa. Tarda entre 10 y 30 segundos según el dispositivo.

5. **Revisá los resultados** – En la pestaña **Calendario** vas a ver el cronograma mes a mes. En **Estadísticas** podés ver los combos y comparar.

6. **Exportar** – Podés descargar el calendario como imagen PNG o imprimirlo como PDF. (está medio pedorro esto todavía)

**¿Soy R2 Cesac, cómo debería hacer las guardias?**
Como ejemplo, para generar cronograma de guardias de R2 de Cesac, deberían: 1. Poner período a generar (normalmente 4 meses). 2. Poner número total de resis (10-12?). 3. Poner cantidad de resis por día (3 habitualmente). Eso lo dejaría configurado para R2 (todavía no contempla que no se pisen resis del mismo Cesac, proximamente)

**Modo R4** – Activa un segundo slot por día con roles diferenciados: guardias en sala "Arriba" y guardias en externa "Abajo"

**Prioridades** – Si querés darle más importancia a ciertos criterios, ajustá los sliders en la pestaña "Prioridades" antes de generar.
`;

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

const calcVariance = (arr) => {
  const R = arr.length;
  if (R === 0) return 0;
  let sum = 0;
  for (let i = 0; i < R; i++) sum += arr[i];
  const mean = sum / R;
  let v = 0;
  for (let i = 0; i < R; i++) v += (arr[i] - mean) ** 2;
  return v / R;
};

const HelpContent = ({ text }) => {
  const lines = text.trim().split('\n');
  return (
    <div className="text-sm text-gray-700 space-y-2 leading-relaxed">
      {lines.map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.startsWith('**') && line.endsWith('**') && !line.slice(2).includes('**'))
          return <p key={i} className="font-extrabold text-slate-800 text-base mt-3">{line.slice(2, -2)}</p>;
        if (/^\d+\./.test(line)) {
          const parts = line.replace(/^\d+\.\s*/, '').split(/\*\*(.*?)\*\*/g);
          return (
            <div key={i} className="flex gap-2">
              <span className="font-extrabold text-orange-600 shrink-0">{line.match(/^\d+/)[0]}.</span>
              <p>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>
            </div>
          );
        }
        const parts = line.split(/\*\*(.*?)\*\*/g);
        if (parts.length > 1)
          return <p key={i}>{parts.map((p, j) => j % 2 === 1 ? <strong key={j}>{p}</strong> : p)}</p>;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
};

// ─── Pesos para el balance arriba/abajo por tipo de día (R4) ─────────────────
// Valores altos para forzar equidad intraresi. Días de mayor carga pesan más.
const R4_W_TOTAL = 40000;
const R4_W_MON   = 25000;
const R4_W_TUE   = 25000;
const R4_W_THU   = 45000;
const R4_W_FRI   = 50000;
const R4_W_SAT   = 65000;  // máximo: es el día más pesado del cronograma
const R4_W_SUN   = 55000;

// Aplica/revierte un role-swap incremental sobre los contadores por tipo
const applyRoleSwapByType = (state, r, dt, sign) => {
  // sign = +1 → r gana un arriba de tipo dt y pierde un abajo
  // sign = -1 → r pierde un arriba de tipo dt y gana un abajo
  if (dt === 'mon')    { state.arrMonC[r] += sign; state.abjMonC[r] -= sign; }
  if (dt === 'tuewed') { state.arrTueC[r] += sign; state.abjTueC[r] -= sign; }
  if (dt === 'thu')    { state.arrThuC[r] += sign; state.abjThuC[r] -= sign; }
  if (dt === 'fri')    { state.arrFriC[r] += sign; state.abjFriC[r] -= sign; }
  if (dt === 'sat')    { state.arrSatC[r] += sign; state.abjSatC[r] -= sign; }
  if (dt === 'sun')    { state.arrSunC[r] += sign; state.abjSunC[r] -= sign; }
};

export default function App() {
  const [baseDate, setBaseDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [numMonths, setNumMonths] = useState(1);
  const [numResidents, setNumResidents] = useState(5);
  const [residentsPerDay, setResidentsPerDay] = useState(1);
  const [r4Mode, setR4Mode] = useState(false);

  const [holidays, setHolidays] = useState([]);
  const [preferences, setPreferences] = useState({});
  const [residentNames, setResidentNames] = useState({});

  const getResName      = (id) => residentNames[id]?.trim() || `Residente ${id+1}`;
  const getShortResName = (id) => residentNames[id]?.trim() || `Res. ${id+1}`;

  const [configDate, setConfigDate]     = useState(new Date(baseDate));
  const [configMode, setConfigMode]     = useState('holidays');
  const [prefSubMode, setPrefSubMode]   = useState('dontWant');
  const [selectedResId, setSelectedResId] = useState(0);

  const [schedule, setSchedule]           = useState({});
  const [stats, setStats]                 = useState([]);
  const [violations, setViolations]       = useState([]);
  const [activeTab, setActiveTab]         = useState('config');
  const [resultMonthOffset, setResultMonthOffset] = useState(0);
  const [isExporting, setIsExporting]     = useState(false);
  const [weights, setWeights]             = useState(DEFAULT_WEIGHTS);

  const [isGenerating, setIsGenerating]         = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus]   = useState('');

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstallMsg, setShowInstallMsg] = useState(false);
  const [showHelpModal, setShowHelpModal]   = useState(false);

  const [prefImportLog,   setPrefImportLog]   = useState([]);
  const [remoteMode,      setRemoteMode]      = useState('coordinator'); // 'coordinator' | 'resident'
  const [showRemotePanel, setShowRemotePanel] = useState(false);

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
      const rp   = prev[resId] || { vacation: [], want: [], dontWant: [] };
      const vac  = rp.vacation.filter(d => d !== dateStr);
      const want = rp.want.filter(d => d !== dateStr);
      const dont = rp.dontWant.filter(d => d !== dateStr);
      if (prefSubMode === 'vacation' && !rp.vacation.includes(dateStr)) vac.push(dateStr);
      if (prefSubMode === 'want'     && !rp.want.includes(dateStr))     want.push(dateStr);
      if (prefSubMode === 'dontWant' && !rp.dontWant.includes(dateStr)) dont.push(dateStr);
      return { ...prev, [resId]: { vacation: vac.sort(), want: want.sort(), dontWant: dont.sort() } };
    });
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  PREFERENCIAS REMOTAS
  // ═══════════════════════════════════════════════════════════════════════════

  const isDateInRange = (dateStr) => {
    const start = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
    const end   = new Date(baseDate.getFullYear(), baseDate.getMonth() + numMonths, 0);
    const d     = new Date(dateStr + 'T00:00:00');
    return !isNaN(d.getTime()) && d >= start && d <= end;
  };

  const exportBaseConfig = () => {
    const data = {
      version: 1, type: 'guardias-config', appName: 'Guardias Cuneras',
      startYear: baseDate.getFullYear(), startMonth: baseDate.getMonth(),
      numMonths, numResidents,
      residentNames: Object.fromEntries(Array.from({length: numResidents}, (_, i) => [i, getResName(i)]))
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `formulario-guardias-${baseDate.toLocaleString('es-ES',{month:'long',year:'numeric'}).replace(/\s/g,'-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportResidentPrefs = (resId) => {
    const rp = preferences[resId] || { vacation: [], want: [], dontWant: [] };
    const data = {
      version: 1, type: 'guardias-prefs',
      residentName: getResName(resId), residentIndex: resId,
      startYear: baseDate.getFullYear(), startMonth: baseDate.getMonth(),
      numMonths,
      preferences: { vacation: rp.vacation||[], want: rp.want||[], dontWant: rp.dontWant||[] }
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `preferencias_${getResName(resId).replace(/\s+/g,'_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importBaseConfig = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.version !== 1 || data.type !== 'guardias-config')
          return alert('Archivo inválido. Necesitás usar el formulario exportado desde Guardias Cuneras.');
        setBaseDate(new Date(data.startYear, data.startMonth, 1));
        setNumMonths(data.numMonths);
        setNumResidents(data.numResidents);
        const names = {};
        Object.entries(data.residentNames).forEach(([k,v]) => { names[parseInt(k)] = v; });
        setResidentNames(names);
        alert(`✓ Configuración cargada: ${data.numResidents} residentes, ${data.numMonths} mes(es).`);
      } catch { alert('Error al leer el archivo. ¿Está corrupto?'); }
    };
    reader.readAsText(file);
  };

  const importPreferenceFiles = async (files) => {
    const log      = [];
    const newPrefs = {...preferences};
    for (const file of files) {
      try {
        const text = await file.text();
        const data = JSON.parse(text);
        if (data.version !== 1 || data.type !== 'guardias-prefs') {
          log.push({status:'error', file:file.name, msg:'No es un archivo de preferencias de Guardias Cuneras.'});
          continue;
        }
        let resId = Array.from({length: numResidents}, (_,i) => i)
          .find(i => getResName(i).trim().toLowerCase() === data.residentName.trim().toLowerCase());
        if (resId === undefined && data.residentIndex >= 0 && data.residentIndex < numResidents)
          resId = data.residentIndex;
        if (resId === undefined) {
          log.push({status:'error', file:file.name,
            msg:`No se encontró al residente "${data.residentName}". Verificá que el nombre coincida.`});
          continue;
        }
        const prefs    = data.preferences || {};
        const filtered = {
          vacation: (prefs.vacation||[]).filter(isDateInRange),
          want:     (prefs.want||[]).filter(isDateInRange),
          dontWant: (prefs.dontWant||[]).filter(isDateInRange),
        };
        const dropped = ((prefs.vacation?.length||0)+(prefs.want?.length||0)+(prefs.dontWant?.length||0))
                      - (filtered.vacation.length + filtered.want.length + filtered.dontWant.length);
        newPrefs[resId] = filtered;
        log.push({status: dropped>0?'warn':'ok', file:file.name, resName:getResName(resId),
          counts:{vac:filtered.vacation.length, want:filtered.want.length, dont:filtered.dontWant.length},
          dropped, msg: dropped>0 ? `${dropped} fecha${dropped>1?'s':''} fuera del período ignorada${dropped>1?'s':''}.` : null });
      } catch {
        log.push({status:'error', file:file.name, msg:'Error al leer el archivo (¿está corrupto o no es JSON?)'});
      }
    }
    setPreferences(newPrefs);
    setPrefImportLog(log);
  };

  // ═══════════════════════════════════════════════════════════════════════════
  //  ALGORITMO — SA + R4 con balance arriba/abajo por tipo de día
  // ═══════════════════════════════════════════════════════════════════════════
  const generateScheduleAsync = async () => {
    setIsGenerating(true);
    setGenerationProgress(0);
    setGenerationStatus('Analizando configuración base...');
    await new Promise(r => setTimeout(r, 50));

    // ── [1] PREPARAR TIMELINE ──────────────────────────────────────────────
    const timeline = [];
    for (let i = 0; i < numMonths; i++) {
      const cm  = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
      const y   = cm.getFullYear(), m = cm.getMonth();
      const dim = new Date(y, m+1, 0).getDate();
      for (let d = 1; d <= dim; d++) {
        const dateStr   = toDateStr(y, m, d);
        const dow       = new Date(y, m, d).getDay();
        const isWeekend = dow === 0 || dow === 6;
        const isHol     = holidays.includes(dateStr);
        timeline.push({ dateStr, dow, isWeekend, isHol, isWorkday: !isWeekend && !isHol, effectiveType: null });
      }
    }

    for (let i = 0; i < timeline.length; i++) {
      const day = timeline[i];
      if      (day.dow === 0)                  day.effectiveType = 'sun';
      else if (day.dow === 6)                  day.effectiveType = 'sat';
      else if (day.dow === 5)                  day.effectiveType = 'fri';
      else if (day.dow === 4)                  day.effectiveType = 'thu';
      else if (day.dow === 2 || day.dow === 3) day.effectiveType = 'tuewed';
      else                                     day.effectiveType = 'mon';
    }

    for (let i = 0; i < timeline.length; i++) {
      const day  = timeline[i];
      if (!day.isHol) continue;
      const prev = i > 0 ? timeline[i-1] : null;
      const pp   = i > 1 ? timeline[i-2] : null;
      if (day.dow === 5) {
        day.effectiveType = 'sat';
        if (prev) prev.effectiveType = 'fri';
        if (pp)   pp.effectiveType   = 'thu';
      } else if (day.dow === 1) {
        day.effectiveType = 'sun';
        if (prev) prev.effectiveType = 'sat';
      } else if (day.dow >= 2 && day.dow <= 4) {
        day.effectiveType = 'sun';
        if (prev) prev.effectiveType = 'fri';
      }
    }

    const N        = timeline.length;
    const R        = numResidents;
    const rpd      = residentsPerDay;
    const isR4     = r4Mode;
    const typeArr  = timeline.map(t => t.effectiveType);
    const scoreArr = typeArr.map(t => DAY_TYPES[t].score);

    const vacMat   = Array.from({length: R}, () => new Uint8Array(N));
    const dontMat  = Array.from({length: R}, () => new Uint8Array(N));
    const wantMat  = Array.from({length: R}, () => new Uint8Array(N));
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
    const isThu       = new Uint8Array(N);
    const isFri       = new Uint8Array(N);
    const isSat       = new Uint8Array(N);
    const isSun       = new Uint8Array(N);
    const isFriSatSun = new Uint8Array(N);
    for (let d = 0; d < N; d++) {
      if (typeArr[d] === 'mon')    isMon[d]    = 1;
      if (typeArr[d] === 'tuewed') isTueWed[d] = 1;
      if (typeArr[d] === 'thu')    isThu[d]    = 1;
      if (typeArr[d] === 'fri')    isFri[d]    = 1;
      if (typeArr[d] === 'sat')    isSat[d]    = 1;
      if (typeArr[d] === 'sun')    isSun[d]    = 1;
      if (['fri','sat','sun'].includes(typeArr[d])) isFriSatSun[d] = 1;
    }

    // ── [2] HELPERS DEL ALGORITMO ──────────────────────────────────────────

    const isValidInsertion = (r, d, currentDayList, ignoreD = -1) => {
      if (vacMat[r][d]) return false;
      for (let i = 0; i < currentDayList.length; i++) {
        const wd = currentDayList[i];
        if (wd === ignoreD) continue;
        if (Math.abs(wd - d) <= 1) return false;
      }
      return true;
    };

    // Recalcula TODAS las métricas de un residente desde cero
    const updateResidentMetrics = (r, state, mat) => {
      const dl = state.dayList[r];
      dl.sort((a, b) => a - b);

      let score = 0, mon = 0, tuewed = 0, thu = 0, sat = 0, sun = 0;
      let sandwich = 0, pref = 0, thuPen = 0, missedWant = totalWant[r];
      let arribaCount = 0, abajoCount = 0;
      let arrMon=0, abjMon=0, arrTue=0, abjTue=0;
      let arrThu=0, abjThu=0, arrFri=0, abjFri=0;
      let arrSat=0, abjSat=0, arrSun=0, abjSun=0;

      for (let i = 0; i < dl.length; i++) {
        const d = dl[i];
        score += scoreArr[d];
        if (isMon[d])    mon++;
        if (isTueWed[d]) tuewed++;
        if (isThu[d])    thu++;
        if (isSat[d])    sat++;
        if (isSun[d])    sun++;
        if (i > 0 && dl[i] - dl[i-1] === 2) sandwich++;
        if (dontMat[r][d]) pref += weights.prefDontWant;
        if (wantMat[r][d]) missedWant--;

        if (isThu[d]) {
          for (let j = i+1; j < dl.length; j++) {
            if (dl[j] - d <= 3 && isFriSatSun[dl[j]]) { thuPen++; break; }
            if (dl[j] - d > 3) break;
          }
        }

        if (isR4 && mat) {
          const isArr = mat[d].indexOf(r) === 0;
          if (isArr) {
            arribaCount++;
            if (isMon[d])    arrMon++;
            if (isTueWed[d]) arrTue++;
            if (isThu[d])    arrThu++;
            if (isFri[d])    arrFri++;
            if (isSat[d])    arrSat++;
            if (isSun[d])    arrSun++;
          } else {
            abajoCount++;
            if (isMon[d])    abjMon++;
            if (isTueWed[d]) abjTue++;
            if (isThu[d])    abjThu++;
            if (isFri[d])    abjFri++;
            if (isSat[d])    abjSat++;
            if (isSun[d])    abjSun++;
          }
        }
      }

      pref += missedWant * weights.prefWant;

      state.shiftC[r] = dl.length;   state.scoreC[r]    = score;
      state.monC[r]   = mon;          state.tuewedC[r]   = tuewed;
      state.thuC[r]   = thu;          state.satC[r]      = sat;
      state.sunC[r]   = sun;          state.sandwichC[r] = sandwich;
      state.prefC[r]  = pref;         state.happyThuC[r] = thuPen;

      if (isR4) {
        state.arribaC[r] = arribaCount; state.abajoC[r]  = abajoCount;
        state.arrMonC[r] = arrMon;      state.abjMonC[r] = abjMon;
        state.arrTueC[r] = arrTue;      state.abjTueC[r] = abjTue;
        state.arrThuC[r] = arrThu;      state.abjThuC[r] = abjThu;
        state.arrFriC[r] = arrFri;      state.abjFriC[r] = abjFri;
        state.arrSatC[r] = arrSat;      state.abjSatC[r] = abjSat;
        state.arrSunC[r] = arrSun;      state.abjSunC[r] = abjSun;
      }
    };

    const computeTotalCost = (state) => {
      let cost = 0;
      cost += calcVariance(state.shiftC)   * weights.shiftEquity;
      cost += calcVariance(state.scoreC)   * weights.scoreEquity;
      cost += calcVariance(state.monC)     * weights.monEquity;
      cost += calcVariance(state.tuewedC)  * weights.tuewedEquity;
      cost += calcVariance(state.thuC)     * weights.thuEquity;
      cost += calcVariance(state.satC)     * weights.satEquity;
      cost += calcVariance(state.sunC)     * weights.sunEquity;

      cost += calcVariance(state.sandwichC) * weights.sandwichEquity;
      let totSandwich = 0;
      for (let i = 0; i < R; i++) {
        totSandwich += state.sandwichC[i];
        cost += state.prefC[i];
        cost += state.happyThuC[i] * weights.happyThu;
      }
      cost += totSandwich * weights.sandwichTotal;

      if (isR4) {
        // Equidad de totales entre residentes
        cost += calcVariance(state.arribaC) * 25000;
        cost += calcVariance(state.abajoC)  * 25000;

        // Balance intraresi: arriba vs abajo por tipo de día
        // Usamos diff² con pesos según dificultad del día
        for (let r = 0; r < R; r++) {
          const dTotal = state.arribaC[r] - state.abajoC[r];
          cost += dTotal * dTotal * R4_W_TOTAL;

          const dMon = state.arrMonC[r] - state.abjMonC[r];
          const dTue = state.arrTueC[r] - state.abjTueC[r];
          const dThu = state.arrThuC[r] - state.abjThuC[r];
          const dFri = state.arrFriC[r] - state.abjFriC[r];
          const dSat = state.arrSatC[r] - state.abjSatC[r];
          const dSun = state.arrSunC[r] - state.abjSunC[r];

          cost += dMon * dMon * R4_W_MON;
          cost += dTue * dTue * R4_W_TUE;
          cost += dThu * dThu * R4_W_THU;
          cost += dFri * dFri * R4_W_FRI;
          cost += dSat * dSat * R4_W_SAT;
          cost += dSun * dSun * R4_W_SUN;
        }
      }
      return cost;
    };

    // Aplica movimientos y retorna rollback
    const doMove = (mat, state, moves) => {
      const involved = new Set();
      for (const m of moves) { involved.add(m.oldR); involved.add(m.newR); }

      const backup = {};
      for (const r of involved) {
        backup[r] = {
          dl: [...state.dayList[r]],
          shift: state.shiftC[r],   score: state.scoreC[r],
          mon:   state.monC[r],     tuewed: state.tuewedC[r],
          thu:   state.thuC[r],     sat: state.satC[r],
          sun:   state.sunC[r],     sandwich: state.sandwichC[r],
          pref:  state.prefC[r],    happyThu: state.happyThuC[r],
          ...(isR4 ? {
            arriba: state.arribaC[r],  abajo: state.abajoC[r],
            arrMon: state.arrMonC[r],  abjMon: state.abjMonC[r],
            arrTue: state.arrTueC[r],  abjTue: state.abjTueC[r],
            arrThu: state.arrThuC[r],  abjThu: state.abjThuC[r],
            arrFri: state.arrFriC[r],  abjFri: state.abjFriC[r],
            arrSat: state.arrSatC[r],  abjSat: state.abjSatC[r],
            arrSun: state.arrSunC[r],  abjSun: state.abjSunC[r],
          } : {})
        };
      }

      for (const m of moves) {
        mat[m.d][m.s] = m.newR;
        state.dayList[m.oldR] = state.dayList[m.oldR].filter(x => x !== m.d);
        state.dayList[m.newR].push(m.d);
      }
      for (const r of involved) updateResidentMetrics(r, state, mat);

      return function rollback() {
        for (const m of moves) mat[m.d][m.s] = m.oldR;
        for (const r of involved) {
          state.dayList[r]    = backup[r].dl;
          state.shiftC[r]     = backup[r].shift;    state.scoreC[r]    = backup[r].score;
          state.monC[r]       = backup[r].mon;       state.tuewedC[r]   = backup[r].tuewed;
          state.thuC[r]       = backup[r].thu;       state.satC[r]      = backup[r].sat;
          state.sunC[r]       = backup[r].sun;       state.sandwichC[r] = backup[r].sandwich;
          state.prefC[r]      = backup[r].pref;      state.happyThuC[r] = backup[r].happyThu;
          if (isR4) {
            state.arribaC[r]  = backup[r].arriba;    state.abajoC[r]    = backup[r].abajo;
            state.arrMonC[r]  = backup[r].arrMon;    state.abjMonC[r]   = backup[r].abjMon;
            state.arrTueC[r]  = backup[r].arrTue;    state.abjTueC[r]   = backup[r].abjTue;
            state.arrThuC[r]  = backup[r].arrThu;    state.abjThuC[r]   = backup[r].abjThu;
            state.arrFriC[r]  = backup[r].arrFri;    state.abjFriC[r]   = backup[r].abjFri;
            state.arrSatC[r]  = backup[r].arrSat;    state.abjSatC[r]   = backup[r].abjSat;
            state.arrSunC[r]  = backup[r].arrSun;    state.abjSunC[r]   = backup[r].abjSun;
          }
        }
      };
    };

    // ── Generación inicial: aleatorio + balance de roles por tipo ─────────
    const generateValidInit = () => {
      for (let attempt = 0; attempt < 5000; attempt++) {
        const mat     = Array.from({length: N}, () => []);
        const dayList = Array.from({length: R}, () => []);
        let valid = true;

        for (let d = 0; d < N; d++) {
          const available = [];
          for (let r = 0; r < R; r++) {
            if (!vacMat[r][d] && !dayList[r].includes(d - 1)) available.push(r);
          }
          available.sort(() => Math.random() - 0.5);
          for (let s = 0; s < rpd; s++) {
            if (available.length === 0) { valid = false; break; }
            const chosen = available.shift();
            mat[d].push(chosen);
            dayList[chosen].push(d);
          }
          if (!valid) break;
        }
        if (!valid) continue;

        // Post-init R4: para cada residente, alternar roles por tipo de día
        // Así la solución inicial ya tiene balance ~50/50 antes del SA
        if (isR4) {
          // Trackear arriba Y abajo por residente por tipo de día
          const roleByType = Array.from({length: R}, () => ({
            mon:    {arr:0, abj:0}, tuewed: {arr:0, abj:0},
            thu:    {arr:0, abj:0}, fri:    {arr:0, abj:0},
            sat:    {arr:0, abj:0}, sun:    {arr:0, abj:0}
          }));
          for (let d = 0; d < N; d++) {
            if (mat[d].length < 2) continue;
            const dt = typeArr[d];
            const r0 = mat[d][0], r1 = mat[d][1];
            // score = arriba - abajo para este tipo; el más bajo necesita arriba
            const s0 = roleByType[r0][dt].arr - roleByType[r0][dt].abj;
            const s1 = roleByType[r1][dt].arr - roleByType[r1][dt].abj;
            if (s1 < s0) {
              // r1 necesita arriba más que r0 → swap
              mat[d][0] = r1; mat[d][1] = r0;
              roleByType[r1][dt].arr++;
              roleByType[r0][dt].abj++;
            } else if (s0 === s1) {
              // empate → desempatar por total global (arriba - abajo de todos los tipos)
              const tot0 = roleByType[r0].mon.arr - roleByType[r0].mon.abj +
              roleByType[r0].tuewed.arr - roleByType[r0].tuewed.abj +
              roleByType[r0].thu.arr - roleByType[r0].thu.abj +
              roleByType[r0].fri.arr - roleByType[r0].fri.abj +
              roleByType[r0].sat.arr - roleByType[r0].sat.abj +
              roleByType[r0].sun.arr - roleByType[r0].sun.abj;
              const tot1 = roleByType[r1].mon.arr - roleByType[r1].mon.abj +
              roleByType[r1].tuewed.arr - roleByType[r1].tuewed.abj +
              roleByType[r1].thu.arr - roleByType[r1].thu.abj +
              roleByType[r1].fri.arr - roleByType[r1].fri.abj +
              roleByType[r1].sat.arr - roleByType[r1].sat.abj +
              roleByType[r1].sun.arr - roleByType[r1].sun.abj;
              if (tot1 < tot0) {
                mat[d][0] = r1; mat[d][1] = r0;
                roleByType[r1][dt].arr++; roleByType[r0][dt].abj++;
              } else {
                roleByType[r0][dt].arr++; roleByType[r1][dt].abj++;
              }
            } else {
              roleByType[r0][dt].arr++;
              roleByType[r1][dt].abj++;
            }
          }
        }
        return mat;  
      }  
      return null;
    };

    // ── [3] ESTADO SA ──────────────────────────────────────────────────────
    const buildInitialState = () => ({
      dayList:    Array.from({length: R}, () => []),
      shiftC:     new Array(R).fill(0),  scoreC:    new Array(R).fill(0),
      monC:       new Array(R).fill(0),  tuewedC:   new Array(R).fill(0),
      thuC:       new Array(R).fill(0),  satC:      new Array(R).fill(0),
      sunC:       new Array(R).fill(0),  sandwichC: new Array(R).fill(0),
      prefC:      new Array(R).fill(0),  happyThuC: new Array(R).fill(0),
      ...(isR4 ? {
        arribaC: new Array(R).fill(0),  abajoC:  new Array(R).fill(0),
        arrMonC: new Array(R).fill(0),  abjMonC: new Array(R).fill(0),
        arrTueC: new Array(R).fill(0),  abjTueC: new Array(R).fill(0),
        arrThuC: new Array(R).fill(0),  abjThuC: new Array(R).fill(0),
        arrFriC: new Array(R).fill(0),  abjFriC: new Array(R).fill(0),
        arrSatC: new Array(R).fill(0),  abjSatC: new Array(R).fill(0),
        arrSunC: new Array(R).fill(0),  abjSunC: new Array(R).fill(0),
      } : {})
    });

    // ── [4] CICLO SA PRINCIPAL ─────────────────────────────────────────────
    const NUM_RESTARTS      = 6;
    const ITERS_PER_RESTART = 1500000;
    const CHUNK_SIZE        = 50000;

    let globalBestMat  = null;
    let globalBestCost = Infinity;

    for (let restart = 1; restart <= NUM_RESTARTS; restart++) {
      const randomMsg = FUNNY_MESSAGES[Math.floor(Math.random() * FUNNY_MESSAGES.length)];
      setGenerationStatus(`${randomMsg} (Reinicio ${restart}/${NUM_RESTARTS})`);

      const mat = generateValidInit();
      if (!mat) {
        alert("Imposible encontrar una configuración válida con las vacaciones actuales. Revisa que haya suficientes residentes disponibles.");
        setIsGenerating(false);
        return;
      }

      const state = buildInitialState();
      for (let d = 0; d < N; d++)
        for (let s = 0; s < rpd; s++) state.dayList[mat[d][s]].push(d);
      for (let r = 0; r < R; r++) updateResidentMetrics(r, state, mat);

      let currentCost = computeTotalCost(state);
      let bestMat     = mat.map(r => [...r]);
      let bestCost    = currentCost;

      const T0    = 20000;
      const Tf    = 0.1;
      const alpha = Math.pow(Tf / T0, 1 / ITERS_PER_RESTART);
      let temp    = T0;

      for (let iter = 0; iter < ITERS_PER_RESTART; iter++) {
        if (iter % CHUNK_SIZE === 0) {
          const progress = ((restart - 1) * ITERS_PER_RESTART + iter) / (NUM_RESTARTS * ITERS_PER_RESTART) * 100;
          setGenerationProgress(progress);
          await new Promise(r => setTimeout(r, 0));
        }

        const moveType    = Math.random();
        let moves         = null;
        let didRoleSwap   = false;

        // ── R4 Role Swaps: 28% total ──────────────────────────────────────
        // [0.72, 0.82) = 10% random swap
        // [0.82, 1.00) = 18% targeted swap (ataca el peor desequilibrio intraresi)
        if (isR4 && moveType >= 0.72) {

          if (moveType >= 0.82) {
            // ── TARGETED ROLE SWAP ──────────────────────────────────────
            // Encuentra el residente con el peor desequilibrio arriba/abajo
            // para un tipo de día específico
            let worstR = -1, worstDt = null, worstSign = 0, worstDiff = 0;  
            for (let r = 0; r < R; r++) {
              const checks = [
                ['mon',    state.arrMonC[r] - state.abjMonC[r]],
                ['tuewed', state.arrTueC[r] - state.abjTueC[r]],
                ['thu',    state.arrThuC[r] - state.abjThuC[r]],
                ['fri',    state.arrFriC[r] - state.abjFriC[r]],
                ['sat',    state.arrSatC[r] - state.abjSatC[r]],
                ['sun',    state.arrSunC[r] - state.abjSunC[r]],
              ];
              for (const [dt, diff] of checks) {
                if (Math.abs(diff) > worstDiff) {
                  worstDiff = Math.abs(diff); worstR = r; worstDt = dt; worstSign = Math.sign(diff);
                }
              }
            }

            if (worstR !== -1) {
              // Slot excesivo: si worstSign>0 tiene demasiados arriba (slot 0), si <0 demasiados abajo (slot 1)
              const excessSlot = worstSign > 0 ? 0 : 1;
              // Buscar un día del tipo worstDt donde worstR esté en el slot excesivo
              const dl = state.dayList[worstR];
              const startIdx = Math.floor(Math.random() * dl.length);
              for (let k = 0; k < dl.length; k++) {
                const d = dl[(startIdx + k) % dl.length];
                if (typeArr[d] === worstDt && mat[d].length === 2 && mat[d].indexOf(worstR) === excessSlot) {
                  const r0 = mat[d][0], r1 = mat[d][1];
                  const dt = typeArr[d];
                  // Aplicar swap
                  mat[d][0] = r1; mat[d][1] = r0;
                  state.arribaC[r0]--; state.abajoC[r0]++;
                  state.arribaC[r1]++; state.abajoC[r1]--;
                  applyRoleSwapByType(state, r0, dt, -1);
                  applyRoleSwapByType(state, r1, dt, +1);

                  const newCost = computeTotalCost(state);
                  const delta   = newCost - currentCost;
                  if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
                    currentCost = newCost;
                    if (newCost < bestCost) { bestCost = newCost; bestMat = mat.map(row => [...row]); }
                  } else {
                    mat[d][0] = r0; mat[d][1] = r1;
                    state.arribaC[r0]++; state.abajoC[r0]--;
                    state.arribaC[r1]--; state.abajoC[r1]++;
                    applyRoleSwapByType(state, r0, dt, +1);
                    applyRoleSwapByType(state, r1, dt, -1);
                  }
                  didRoleSwap = true;
                  break;
                }
              }
            }

          } else {
            // ── RANDOM ROLE SWAP ────────────────────────────────────────
            const d = Math.floor(Math.random() * N);
            if (mat[d].length === 2) {
              const r0 = mat[d][0], r1 = mat[d][1];
              const dt = typeArr[d];
              mat[d][0] = r1; mat[d][1] = r0;
              state.arribaC[r0]--; state.abajoC[r0]++;
              state.arribaC[r1]++; state.abajoC[r1]--;
              applyRoleSwapByType(state, r0, dt, -1);
              applyRoleSwapByType(state, r1, dt, +1);

              const newCost = computeTotalCost(state);
              const delta   = newCost - currentCost;
              if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
                currentCost = newCost;
                if (newCost < bestCost) { bestCost = newCost; bestMat = mat.map(row => [...row]); }
              } else {
                mat[d][0] = r0; mat[d][1] = r1;
                state.arribaC[r0]++; state.abajoC[r0]--;
                state.arribaC[r1]--; state.abajoC[r1]++;
                applyRoleSwapByType(state, r0, dt, +1);
                applyRoleSwapByType(state, r1, dt, -1);
              }
            }
            didRoleSwap = true;
          }
        }

        if (!didRoleSwap) {
          // Umbrales distintos según modo (R4 reserva 28% para role swaps)
          const t0 = isR4 ? 0.28 : 0.40;
          const t1 = isR4 ? 0.52 : 0.70;
          const t2 = isR4 ? 0.62 : 0.85;

          if (moveType < t0) {
            // Replace
            const d     = Math.floor(Math.random() * N);
            const s     = Math.floor(Math.random() * rpd);
            const r_old = mat[d][s];
            const r_new = Math.floor(Math.random() * R);
            if (r_old !== r_new && !mat[d].includes(r_new) && isValidInsertion(r_new, d, state.dayList[r_new]))
              moves = [{d, s, oldR: r_old, newR: r_new}];
          } else if (moveType < t1) {
            // Swap
            const d1 = Math.floor(Math.random() * N), s1 = Math.floor(Math.random() * rpd);
            const d2 = Math.floor(Math.random() * N), s2 = Math.floor(Math.random() * rpd);
            if (d1 !== d2) {
              const r1 = mat[d1][s1], r2 = mat[d2][s2];
              if (r1 !== r2 && !mat[d1].includes(r2) && !mat[d2].includes(r1))
                if (isValidInsertion(r1, d2, state.dayList[r1], d1) && isValidInsertion(r2, d1, state.dayList[r2], d2))
                  moves = [{d: d1, s: s1, oldR: r1, newR: r2}, {d: d2, s: s2, oldR: r2, newR: r1}];
            }
          } else if (moveType < t2) {
            // Targeted sandwich repair
            const candidates = [];
            for (let r = 0; r < R; r++) if (state.sandwichC[r] > 0) candidates.push(r);
            if (candidates.length > 0) {
              const r  = candidates[Math.floor(Math.random() * candidates.length)];
              const dl = state.dayList[r];
              for (let i = 1; i < dl.length; i++) {
                if (dl[i] - dl[i-1] === 2) {
                  const targetD = Math.random() < 0.5 ? dl[i] : dl[i-1];
                  const s       = mat[targetD].indexOf(r);
                  const r_new   = Math.floor(Math.random() * R);
                  if (r_new !== r && !mat[targetD].includes(r_new) && isValidInsertion(r_new, targetD, state.dayList[r_new])) {
                    moves = [{d: targetD, s, oldR: r, newR: r_new}]; break;
                  }
                }
              }
            }
          } else {
            // Targeted shift equity
            let maxR = 0, minR = 0;
            for (let r = 1; r < R; r++) {
              if (state.shiftC[r] > state.shiftC[maxR]) maxR = r;
              if (state.shiftC[r] < state.shiftC[minR]) minR = r;
            }
            if (maxR !== minR && state.shiftC[maxR] > state.shiftC[minR]) {
              const dl = state.dayList[maxR];
              if (dl.length > 0) {
                const d = dl[Math.floor(Math.random() * dl.length)];
                const s = mat[d].indexOf(maxR);
                if (!mat[d].includes(minR) && isValidInsertion(minR, d, state.dayList[minR]))
                  moves = [{d, s, oldR: maxR, newR: minR}];
              }
            }
          }
        }

        if (moves) {
          const rollback = doMove(mat, state, moves);
          const newCost  = computeTotalCost(state);
          const delta    = newCost - currentCost;
          if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
            currentCost = newCost;
            if (newCost < bestCost) { bestCost = newCost; bestMat = mat.map(row => [...row]); }
          } else {
            rollback();
          }
        }

        temp *= alpha;
      }

      if (bestCost < globalBestCost) { globalBestCost = bestCost; globalBestMat = bestMat; }
    }

    setGenerationProgress(100);
    setGenerationStatus('Configuración óptima encontrada');
    setTimeout(() => buildFinalSchedule(globalBestMat, timeline), 500);
  };

  const buildFinalSchedule = (bestMatrix, timeline) => {
    const R   = numResidents;
    const rpd = residentsPerDay;
    const finalSchedule = {};
    const finalStats = Array.from({length: R}, (_, i) => ({
      id: i, totalShifts: 0, score: 0, shiftDays: [],
      counts: { mon: 0, tuewed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
      sandwiches: 0, triples: 0,
      ...(r4Mode ? {
        arribaCounts: { mon: 0, tuewed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
        abajoCounts:  { mon: 0, tuewed: 0, thu: 0, fri: 0, sat: 0, sun: 0 },
        arribaTotal: 0, abajoTotal: 0, arribaScore: 0, abajoScore: 0
      } : {})
    }));

    for (let d = 0; d < bestMatrix.length; d++) {
      const dateStr  = timeline[d].dateStr;
      finalSchedule[dateStr] = [];
      for (let s = 0; s < rpd; s++) {
        const rId      = bestMatrix[d][s];
        const dayType  = timeline[d].effectiveType;
        const dayScore = DAY_TYPES[dayType].score;
        finalStats[rId].shiftDays.push(d);
        finalStats[rId].totalShifts++;
        finalStats[rId].score += dayScore;
        finalStats[rId].counts[dayType]++;
        if (r4Mode) {
          if (s === 0) {
            finalStats[rId].arribaCounts[dayType]++;
            finalStats[rId].arribaTotal++;
            finalStats[rId].arribaScore += dayScore;
          } else {
            finalStats[rId].abajoCounts[dayType]++;
            finalStats[rId].abajoTotal++;
            finalStats[rId].abajoScore += dayScore;
          }
        }
        finalSchedule[dateStr].push({ resId: rId, isSandwich: false, isTriple: false, slot: s });
      }
    }

    const newViolations = [];
    for (let r = 0; r < R; r++) {
      const days = finalStats[r].shiftDays.sort((a,b) => a-b);
      for (let i = 0; i < days.length; i++) {
        const dIdx = days[i];
        if (i > 0 && days[i] - days[i-1] === 1)
          newViolations.push(`🔥 Pérdida de derechos laborales: ${timeline[dIdx].dateStr} — ${getResName(r)} trabaja días seguidos.`);
        if (i > 0 && days[i] - days[i-1] === 2) {
          let isTrip = false;
          if (i > 1 && days[i-1] - days[i-2] === 2) {
            isTrip = true; finalStats[r].triples++;
            newViolations.push(`CRÍTICO: ${timeline[dIdx].dateStr} - Triple sanguchito a ${getResName(r)}.`);
          } else {
            finalStats[r].sandwiches++;
          }
          const entry = finalSchedule[timeline[dIdx].dateStr].find(e => e.resId === r);
          if (entry) { entry.isSandwich = !isTrip; entry.isTriple = isTrip; }
        }
        if (timeline[dIdx].effectiveType === 'thu' && i < days.length-1 && days[i+1] - dIdx <= 3)
          if (['fri','sat','sun'].includes(timeline[days[i+1]].effectiveType))
            newViolations.push(`Problemita: ${timeline[days[i+1]].dateStr} - No se pudo respetar Jueves Felíz de ${getResName(r)}.`);
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

  // ═══════════════════════════════════════════════════════════════════════════
  //  RENDER HELPERS
  // ═══════════════════════════════════════════════════════════════════════════
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
            const day       = i+1;
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
                  className={`min-h-[60px] p-1 border-r border-b border-gray-100 relative transition-colors flex items-start justify-start ${btnCls}`}>
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
                        {r4Mode && <span className={`text-[10px] font-extrabold px-1 rounded ${ri.slot === 0 ? 'bg-sky-600 text-white' : 'bg-emerald-600 text-white'}`}>{ri.slot === 0 ? '↑ Arriba' : '↓ Abajo'}</span>}
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

  const capitalize      = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const resultViewDate  = new Date(baseDate.getFullYear(), baseDate.getMonth() + resultMonthOffset, 1);

  // ═══════════════════════════════════════════════════════════════════════════
  //  JSX
  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans p-4 md:p-8 relative">

      {/* ── MODAL AYUDA ── */}
      {showHelpModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[85vh]">
            <div className="flex items-center justify-between p-5 border-b border-gray-200 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-orange-100 rounded-full flex items-center justify-center">
                  <HelpCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 text-lg leading-tight">¿Cómo usar la app?</h3>
                  <p className="text-xs text-gray-400 font-medium">Instructivo</p>
                </div>
              </div>
              <button onClick={() => setShowHelpModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto flex-1 p-5"><HelpContent text={HELP_TEXT} /></div>
            <div className="p-5 border-t border-gray-200 shrink-0">
              <button onClick={() => setShowHelpModal(false)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-extrabold text-base transition-all shadow-md hover:shadow-lg">
                ¡Entendí! 👊
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── PROGRESS MODAL ── */}
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
            <a href="https://github.com/ezequielzacanino/guardias-cuneras" target="_blank" rel="noopener noreferrer" className="shrink-0">
              <img src="/assets/logo-app.png" alt="Logo Guardias Cuneras" className="w-16 h-16 md:w-[72px] md:h-[72px] rounded-full object-cover border-2 border-white shadow-md hover:opacity-90 transition-opacity" />
            </a>
            <div className="flex flex-col">
              <h1 className="text-xl md:text-3xl font-extrabold tracking-tight text-orange-500 uppercase">GUARDIAS CUNERAS</h1>
              <span className="text-xs md:text-sm text-gray-400 mt-1">By Zaca · Algoritmo de equidad por varianza total</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowHelpModal(true)}
              className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 border border-slate-500 text-gray-200 hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <HelpCircle className="w-4 h-4 text-orange-400" />
              <span className="hidden sm:inline">Soy R1</span>
            </button>
            <button onClick={handleInstallAndroid}
              className="flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
              <Smartphone className="w-4 h-4" /> Instalar App
            </button>
          </div>
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
                    disabled={r4Mode}
                    className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg font-medium text-gray-800 outline-none focus:border-orange-500 disabled:opacity-50 disabled:cursor-not-allowed">
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

              {/* ── PREFERENCIAS REMOTAS ── */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <button
                  onClick={() => setShowRemotePanel(v => !v)}
                  className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center shrink-0">
                      <Download className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-bold text-gray-800">Preferencias remotas</p>
                      <p className="text-xs text-gray-500 mt-0.5">Que cada residente marque sus días desde su propio dispositivo y te mande el archivo</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform shrink-0 ${showRemotePanel ? 'rotate-90' : ''}`} />
                </button>

                {showRemotePanel && (
                  <div className="border-t border-gray-200 p-5 space-y-5 animate-in fade-in slide-in-from-top-1 duration-200">

                    {/* Mode toggle */}
                    <div className="flex bg-gray-100 p-1 rounded-lg w-full max-w-xs">
                      <button onClick={() => setRemoteMode('coordinator')}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${remoteMode==='coordinator' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Voy a coordinar
                      </button>
                      <button onClick={() => setRemoteMode('resident')}
                        className={`flex-1 py-1.5 text-sm font-semibold rounded-md transition-all ${remoteMode==='resident' ? 'bg-white text-indigo-700 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        Voy a cargar preferencias
                      </button>
                    </div>

                    {remoteMode === 'coordinator' && (
                      <div className="space-y-5">

                        {/* Step 1 */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                          <p className="text-sm font-bold text-indigo-800 mb-1">① Mandá el formulario al equipo</p>
                          <p className="text-xs text-indigo-600 mb-3">Descargá un archivo con el período y los nombres. Mandáselo al grupo de WhatsApp para que cada uno lo importe en su celular.</p>
                          <button onClick={exportBaseConfig}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            <Download className="w-4 h-4" /> Descargar formulario base
                          </button>
                        </div>

                        {/* Step 2 */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                          <p className="text-sm font-bold text-emerald-800 mb-1">② Importá las preferencias recibidas</p>
                          <p className="text-xs text-emerald-600 mb-3">Seleccioná todos los archivos <code className="bg-emerald-100 px-1 rounded">preferencias_*.json</code> que te mandaron. Podés elegir varios a la vez.</p>
                          <label className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer w-fit">
                            <Users className="w-4 h-4" /> Cargar archivos de preferencias
                            <input type="file" accept=".json" multiple className="hidden"
                              onChange={(e) => importPreferenceFiles(Array.from(e.target.files))} />
                          </label>

                          {prefImportLog.length > 0 && (
                            <div className="mt-4 space-y-2">
                              <p className="text-xs font-bold text-gray-600 uppercase tracking-wide">Resultado de la importación</p>
                              {prefImportLog.map((entry, i) => (
                                <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border text-sm ${
                                  entry.status==='ok'   ? 'bg-green-50 border-green-200' :
                                  entry.status==='warn' ? 'bg-amber-50 border-amber-200' :
                                                          'bg-red-50 border-red-200'}`}>
                                  <span className="text-lg shrink-0">
                                    {entry.status==='ok' ? '✅' : entry.status==='warn' ? '⚠️' : '❌'}
                                  </span>
                                  <div>
                                    <p className="font-bold text-gray-800">{entry.resName || entry.file}</p>
                                    {entry.counts && (
                                      <p className="text-xs text-gray-600 mt-0.5">
                                        {entry.counts.vac} vacaciones · {entry.counts.want} quiere estar · {entry.counts.dont} no quiere estar
                                      </p>
                                    )}
                                    {entry.msg && <p className="text-xs text-amber-700 mt-0.5">{entry.msg}</p>}
                                    {entry.status==='error' && <p className="text-xs text-red-600 mt-0.5">{entry.msg}</p>}
                                  </div>
                                </div>
                              ))}
                              <p className="text-xs text-gray-500 pt-1">
                                {prefImportLog.filter(e=>e.status!=='error').length} de {prefImportLog.length} archivos importados correctamente. Las preferencias ya están cargadas en el editor de abajo.
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {remoteMode === 'resident' && (
                      <div className="space-y-4">

                        {/* Step 1: import config */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4">
                          <p className="text-sm font-bold text-indigo-800 mb-1">① Importá el formulario que te mandó el resi que va a coordinar las guardias</p>
                          <p className="text-xs text-indigo-600 mb-3">El resi elegido para coordinar las guardias te mandó un archivo <code className="bg-indigo-100 px-1 rounded">formulario-guardias-*.json</code>. Importalo para que la app quede configurada con el período correcto y los nombres del equipo.</p>
                          <label className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-sm cursor-pointer w-fit">
                            <Download className="w-4 h-4" /> Cargar formulario del coordinador
                            <input type="file" accept=".json" className="hidden"
                              onChange={(e) => e.target.files[0] && importBaseConfig(e.target.files[0])} />
                          </label>
                        </div>

                        {/* Step 2: mark + export */}
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                          <p className="text-sm font-bold text-amber-800 mb-1">② Marcá tus preferencias y exportalas</p>
                          <p className="text-xs text-amber-700 mb-3">Usá el editor de abajo: seleccioná tu nombre, elegí el tipo de preferencia y tocá los días. Cuando termines, descargá tu archivo y mandáselo al coordinador.</p>
                          <div className="flex flex-wrap gap-2">
                            {Array.from({length: numResidents}).map((_, i) => {
                              const rp = preferences[i] || { vacation: [], want: [], dontWant: [] };
                              const total = (rp.vacation?.length||0) + (rp.want?.length||0) + (rp.dontWant?.length||0);
                              return (
                                <button key={i} onClick={() => exportResidentPrefs(i)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition-colors shadow-sm">
                                  <Download className="w-3 h-3" />
                                  {getResName(i)}
                                  {total > 0 && <span className="bg-white text-amber-700 rounded-full px-1.5 text-[10px] font-extrabold">{total}</span>}
                                </button>
                              );
                            })}
                          </div>
                          <p className="text-xs text-amber-600 mt-2">El número en cada botón indica cuántos días marcaste.</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                  <div>
                    <h2 className="text-lg font-bold !text-[#222222] flex items-center gap-2"><Filter className="w-5 h-5 text-orange-600"/> Editor del Calendario Base</h2>
                    <p className="text-sm text-gray-500 mt-1">Configura feriados y bloqueos personales por mes.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { const next = !r4Mode; setR4Mode(next); if (next) setResidentsPerDay(2); }}
                      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all ${r4Mode ? 'bg-sky-50 border-sky-400 text-sky-700' : 'bg-white border-gray-300 text-gray-600 hover:border-gray-400'}`}>
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 transition-all ${r4Mode ? 'bg-sky-500 border-sky-500' : 'border-gray-400'}`}>
                        {r4Mode && <svg viewBox="0 0 12 12" className="w-2.5 h-2.5"><polyline points="2,6 5,9 10,4" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                      </div>
                      Modo R4
                    </button>
                    <div className="flex items-center gap-2 bg-slate-100 p-1.5 rounded-lg border border-slate-200">
                      <button onClick={() => setConfigDate(new Date(configDate.getFullYear(), configDate.getMonth()-1, 1))} className="p-1 hover:bg-slate-200 rounded"><ChevronLeft className="w-4 h-4"/></button>
                      <span className="min-w-[120px] text-center font-semibold text-sm">{capitalize(configDate.toLocaleString('es-ES', {month:'short', year:'numeric'}))}</span>
                      <button onClick={() => setConfigDate(new Date(configDate.getFullYear(), configDate.getMonth()+1, 1))} className="p-1 hover:bg-slate-200 rounded"><ChevronRight className="w-4 h-4"/></button>
                    </div>
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
                {residentsPerDay > numResidents
                  ? 'Error: Pide más residentes por día que el total disponible'
                  : <><CalendarDays className="w-6 h-6"/> GENERAR GUARDIAS ÓPTIMAS</>}
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
                      <h2 className="text-2xl font-extrabold !text-gray-800">{capitalize(resultViewDate.toLocaleString('es-ES', {month:'long', year:'numeric'}))}</h2>
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
                    <h2 className="text-xl font-bold !text-[#222222] flex items-center gap-2"><Activity className="w-6 h-6 text-orange-600"/> Balance y Equidad de los combos</h2>
                    <p className="text-sm text-gray-500 mt-1">Análisis de los resultados de la optimización</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-100 text-gray-600 text-xs uppercase tracking-wider font-bold">
                          <th className="p-4 border-b">Residente</th>
                          {r4Mode && <th className="p-4 border-b text-center text-sky-700">Rol</th>}
                          <th className="p-4 border-b text-center text-indigo-700">LUN</th>
                          <th className="p-4 border-b text-center text-indigo-700">Ma/Mi</th>
                          <th className="p-4 border-b text-center text-indigo-700">JUE</th>
                          <th className="p-4 border-b text-center">VIE</th>
                          <th className="p-4 border-b text-center text-rose-700">SÁB</th>
                          <th className="p-4 border-b text-center text-rose-700">DOM</th>
                          <th className="p-4 border-b text-center bg-gray-200 text-gray-800">TOTAL</th>
                          <th className="p-4 border-b text-center bg-orange-100 text-orange-800">SCORE</th>
                          {!r4Mode && <th className="p-4 border-b text-center text-amber-700 bg-amber-50">SANGUCHES</th>}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 text-sm">
                        {stats.sort((a,b) => b.score - a.score).map((s) => (
                          r4Mode ? (
                            <React.Fragment key={s.id}>
                              {/* ── FILA ARRIBA ── */}
                              <tr className="hover:bg-sky-50/40 transition-colors border-b-0">
                                <td className="p-4 font-bold" style={{borderBottom:'none'}}>
                                  <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 rounded-full shrink-0 ${RESIDENT_COLORS[s.id % RESIDENT_COLORS.length].split(' ')[0]}`}/>
                                    <div className="flex flex-col">
                                      <span>{getResName(s.id)}</span>
                                      <span className="text-[10px] text-gray-400 font-normal">{s.sandwiches} sanguche{s.sandwiches !== 1 ? 's' : ''}{s.triples > 0 ? ` (+${s.triples}T)` : ''}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4" style={{borderBottom:'none'}}><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-sky-100 text-sky-700">↑ Arriba</span></td>
                                <td className="p-4 text-center font-bold text-indigo-600"  style={{borderBottom:'none'}}>{s.arribaCounts.mon}</td>
                                <td className="p-4 text-center font-bold text-indigo-600"  style={{borderBottom:'none'}}>{s.arribaCounts.tuewed}</td>
                                <td className="p-4 text-center font-bold text-indigo-600"  style={{borderBottom:'none'}}>{s.arribaCounts.thu}</td>
                                <td className="p-4 text-center font-medium text-blue-600"  style={{borderBottom:'none'}}>{s.arribaCounts.fri}</td>
                                <td className="p-4 text-center font-bold text-rose-600"    style={{borderBottom:'none'}}>{s.arribaCounts.sat}</td>
                                {/* ← FIX: era s.arribaTotal por error, ahora correctamente s.arribaCounts.sun */}
                                <td className="p-4 text-center font-bold text-rose-500"    style={{borderBottom:'none'}}>{s.arribaCounts.sun}</td>
                                <td className="p-4 text-center font-extrabold bg-sky-50"   style={{borderBottom:'none'}}>{s.arribaTotal}</td>
                                <td className="p-4 text-center font-extrabold bg-orange-50 text-orange-700" style={{borderBottom:'none'}}>{s.arribaScore.toFixed(1)}</td>
                              </tr>
                              {/* ── FILA ABAJO ── */}
                              <tr className="hover:bg-emerald-50/40 transition-colors">
                                <td className="p-4 text-gray-400 text-xs font-medium pl-9">└</td>
                                <td className="p-4"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">↓ Abajo</span></td>
                                <td className="p-4 text-center font-bold text-indigo-600">{s.abajoCounts.mon}</td>
                                <td className="p-4 text-center font-bold text-indigo-600">{s.abajoCounts.tuewed}</td>
                                <td className="p-4 text-center font-bold text-indigo-600">{s.abajoCounts.thu}</td>
                                <td className="p-4 text-center font-medium text-blue-600">{s.abajoCounts.fri}</td>
                                <td className="p-4 text-center font-bold text-rose-600">{s.abajoCounts.sat}</td>
                                <td className="p-4 text-center font-bold text-rose-500">{s.abajoCounts.sun}</td>
                                <td className="p-4 text-center font-extrabold bg-emerald-50">{s.abajoTotal}</td>
                                <td className="p-4 text-center font-extrabold bg-orange-50 text-orange-700">{s.abajoScore.toFixed(1)}</td>
                              </tr>
                            </React.Fragment>
                          ) : (
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
                          )
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 bg-gray-50 border-t border-gray-200 text-xs text-gray-500 flex flex-col gap-1">
                    <p><strong>Score (Dificultad):</strong> Lunes/Mar/Mié = 1 | Jueves = 1.5 | Viernes = 2 | Domingo = 2.5 | Sábado = 3</p>
                    <p><strong>Modo R4:</strong> el algoritmo balancea arriba/abajo tanto en total como por tipo de día dentro de cada residente. En períodos cortos (1 mes) con pocos días de un tipo, puede quedar diferencia de ±1 que es matemáticamente inevitable.</p>
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
                  <WeightSlider label="Equidad Guardias Totales" value={weights.shiftEquity}    onChange={v => setWeights({...weights, shiftEquity: v})}    desc="Fuerza a que todos tengan la misma cantidad." max={100000}/>
                  <WeightSlider label="Equidad de Score Final"   value={weights.scoreEquity}    onChange={v => setWeights({...weights, scoreEquity: v})}    desc="Nivela suma de dificultad (Sábado=3, Lunes=1)." max={50000}/>
                  <WeightSlider label="Equidad Sanguchitos"      value={weights.sandwichEquity} onChange={v => setWeights({...weights, sandwichEquity: v})} desc="Castiga que uno tenga muchos y otro pocos." max={100000}/>
                  <WeightSlider label="Equidad de Lunes"         value={weights.monEquity}      onChange={v => setWeights({...weights, monEquity: v})}      desc="Prioriza misma cantidad de Lunes." max={100000}/>
                  <WeightSlider label="Equidad Martes/Miérc."    value={weights.tuewedEquity}   onChange={v => setWeights({...weights, tuewedEquity: v})}   desc="Prioriza misma cantidad de Martes y Miércoles." max={100000}/>
                  <WeightSlider label="Equidad de Jueves"        value={weights.thuEquity}      onChange={v => setWeights({...weights, thuEquity: v})}      desc="Prioriza misma cantidad de Jueves." max={100000}/>
                  <WeightSlider label="Equidad de Sábados"       value={weights.satEquity}      onChange={v => setWeights({...weights, satEquity: v})}      desc="Prioriza misma cantidad de Sábados." max={100000}/>
                  <WeightSlider label="Equidad de Domingos"      value={weights.sunEquity}      onChange={v => setWeights({...weights, sunEquity: v})}      desc="Prioriza misma cantidad de Domingos." max={100000}/>
                  <WeightSlider label="Sanguchitos Totales"      value={weights.sandwichTotal}  onChange={v => setWeights({...weights, sandwichTotal: v})}  desc="Presiona para que en general haya muy pocos." max={50000}/>
                  <WeightSlider label="Respetar 'No estar'"      value={weights.prefDontWant}   onChange={v => setWeights({...weights, prefDontWant: v})}   desc="Penalidad por asignar en día indeseado." max={20000}/>
                  <WeightSlider label="Respetar 'Quiero estar'"  value={weights.prefWant}       onChange={v => setWeights({...weights, prefWant: v})}       desc="Penalidad por NO asignar en día pedido." max={20000}/>
                  <WeightSlider label="Respetar Jueves Felíz"    value={weights.happyThu}       onChange={v => setWeights({...weights, happyThu: v})}       desc="Castigo por dar fin de semana a quien hizo el Jueves previo." max={20000}/>
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