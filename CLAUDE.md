# CLAUDE.md

Guía para trabajar en este repositorio. Léela antes de tocar el código.

## Qué es

**Guardias Cuneras** — herramienta web (PWA + app Android vía Capacitor) que genera
cronogramas de guardias médicas para residentes de pediatría, buscando que la carga
sea lo más **equitativa** posible. Todo el cálculo corre en el navegador (cliente),
no hay backend.

El reparto de turnos se resuelve con un algoritmo metaheurístico de
**Simulated Annealing (Temple Simulado)** que minimiza la varianza de carga entre
residentes en varias dimensiones a la vez.

## Stack y comandos

- **React 19** + **Vite 8**, **Tailwind CSS 4** (plugin `@tailwindcss/vite`), iconos `lucide-react`.
- **Capacitor 8** para empaquetar como app Android (`capacitor.config.json`, carpeta `android/`).
- Dependencias presentes pero hoy **no usadas** en `App.jsx`: `framer-motion`, `recharts`,
  `react-router-dom`, `@radix-ui/react-dialog`. `html2canvas` se carga por CDN en runtime
  (no es dependencia npm).

```bash
npm install      # instalar dependencias
npm run dev      # servidor de desarrollo Vite
npm run build    # build de producción a dist/
npm run preview  # previsualizar el build
npm run lint     # eslint
```

> El README dice `npm start`, pero el script real es `npm run dev`.

## Estructura

Casi todo vive en **un solo archivo**:

- `src/App.jsx` (~1700 líneas) — **toda** la app: estado, algoritmo, UI. Es el archivo
  central; cualquier cambio de lógica o interfaz pasa por acá.
- `src/main.jsx` — bootstrap de React, monta `<App />`.
- `src/index.css` — entrada de Tailwind.
- `index.html`, `vite.config.js`, `capacitor.config.json`, `eslint.config.js` — config.
- `public/assets/` — logo y recursos estáticos.
- `dist/`, `android/`, `node_modules/` — generados/empaquetado; no editar a mano.

No hay tests, ni routing, ni manejo de estado externo. Estado = `useState` dentro de `App`.

## Mapa de `App.jsx`

Constantes de dominio (arriba del archivo):

- `DAY_TYPES` — tipos de día y su `score` (dificultad): Lun/Mar-Mié=1, Jue=1.5, Vie=2,
  Dom=2.5, Sáb=3. **El sábado es el día más pesado.**
- `DEFAULT_WEIGHTS` — pesos de cada criterio de equidad para la función de costo.
- `RESIDENT_COLORS` — paleta por residente. `FUNNY_MESSAGES` — frases del loader.
- `HELP_TEXT` — instructivo que se muestra en el modal "Soy R1".
- `R4_W_*` y `applyRoleSwapByType` — pesos y helper del balance arriba/abajo de Modo R4.

Componente `App` (resto del archivo):

- **Estado de configuración**: `baseDate` (mes inicial), `numMonths`, `numResidents`,
  `residentsPerDay` (rpd), `r4Mode`, `holidays`, `preferences`, `residentNames`.
- **Estado de resultado**: `schedule`, `stats`, `violations`.
- **Preferencias remotas**: export/import de JSON para que cada residente cargue sus
  preferencias en su celular y el coordinador las junte (`exportBaseConfig`,
  `exportResidentPrefs`, `importBaseConfig`, `importPreferenceFiles`).
- **`generateScheduleAsync`** — el corazón. Ver abajo.
- **`buildFinalSchedule`** — convierte la mejor matriz hallada en `schedule`/`stats`/`violations`
  para la UI, y detecta violaciones (días seguidos, sanguchitos/triples, jueves feliz, etc.).
- **Render**: 4 pestañas — `config`, `calendar`, `stats`, `weights`. `renderCalendarMonth`
  dibuja un mes (modo editor o modo resultado).

## El algoritmo (`generateScheduleAsync`)

Es async y trocea el trabajo (`await setTimeout(0)` cada `CHUNK_SIZE` iteraciones) para no
congelar la UI; reporta progreso por `generationProgress`/`generationStatus`.

1. **Timeline**: arma el array de días del período. Calcula `effectiveType` por día y
   **reasigna pesos por feriados puente** (un viernes feriado computa como sábado, etc.).
2. **Matrices de preferencias**: `vacMat` (vacaciones = restricción dura), `dontMat`
   (no quiere), `wantMat` (quiere). `vacMat` también bloquea asignaciones.
3. **Estado SA** (`buildInitialState`): contadores por residente — `shiftC` (total),
   `scoreC`, por tipo (`monC`, `tuewedC`, `thuC`, `satC`, `sunC`), `sandwichC`, `prefC`,
   `happyThuC`. En Modo R4 se suman contadores arriba/abajo por tipo.
4. **`updateResidentMetrics`** recalcula desde cero las métricas de un residente.
   **`computeTotalCost`** suma `varianza(dimensión) * peso` de cada criterio (la función
   objetivo a minimizar) más penalidades de preferencia/jueves-feliz.
5. **Ciclo SA**: `NUM_RESTARTS` reinicios × `ITERS_PER_RESTART` iteraciones. En cada paso
   propone un movimiento (replace / swap / reparación de sanguchito / equidad de turnos /
   role-swap de R4), aplica con `doMove` (devuelve rollback), y acepta según
   `delta < 0 || random < exp(-delta/temp)` (criterio de Metropolis con enfriamiento).
   Guarda el mejor global.

**Restricciones duras** (nunca se violan): vacaciones (`vacMat`) y **no guardias en días
consecutivos** (`isValidInsertion` exige separación > 1 día).

**Sanguchito** = dos guardias separadas por un solo día libre (gap = 2 días). **Triple** =
tres seguidas con ese patrón; es crítico. **Jueves feliz** = quien hace jueves no debería
tener guardia el fin de semana inmediato.

## Modo R4 (importante)

Al activarlo, fuerza `residentsPerDay = 2` y crea **dos roles por día**:

- **slot 0 = "Arriba"** (guardia en sala).
- **slot 1 = "Abajo"** (guardia en externa).

Además de la equidad entre residentes, el algoritmo balancea **dentro de cada residente**
los roles arriba/abajo, tanto en total como por tipo de día (pesos `R4_W_*`), usando
movimientos extra de "role swap" (random y targeted al peor desequilibrio). Las stats
muestran dos filas por residente (Arriba / Abajo).

### "Recuperando rotación" (anulación de meses por residente)

Solo en Modo R4. Algunos R4 arrancan tarde sus guardias (están atrasados en la rotación).
La UI permite **anular uno o más meses** a cada residente desde el editor del calendario
(modo "Recuperando rotación", matriz residente × mes).

Efecto sobre el algoritmo:

1. Los días del/los mes(es) anulado(s) se marcan **no disponibles** para ese residente
   (como vacaciones → restricción dura, no se le asignan guardias ese mes).
2. **Antes** de correr el SA se calcula el **promedio de guardias por mes** y se le
   **descuenta** del objetivo de equidad: a un residente con `k` meses anulados se le
   resta `promedioMensual * k` de su total esperado. Esto se implementa comparando
   `contador + descuento` en la varianza (helper `varAdj`), de modo que el residente
   anulado termina con menos guardias **sin** que el optimizador intente "compensarlo".
   El descuento se aplica de forma proporcional a todas las dimensiones de carga
   (total, score, por tipo de día, y arriba/abajo de R4) para que no se contrarresten.

Estado: `r4AnnulledMonths` = `{ [resId]: ['YYYY-MM', ...] }` (clave de mes absoluta,
estable ante cambios de mes inicial / período).

## Convenciones y notas

- **Idioma**: UI, comentarios y nombres de dominio en **español** (rioplatense, jerga
  médica pediátrica). Mantener el tono.
- Estilos con **clases Tailwind inline**; no hay CSS modules. Seguir la estética existente
  (tarjetas redondeadas, acento naranja `orange-600`, fondo `gray-50`).
- El código prioriza rendimiento del SA: arrays tipados (`Uint8Array`), updates
  incrementales con rollback. Cuidado al tocar `computeTotalCost`/`doMove`/`updateResidentMetrics`:
  se llaman millones de veces. Cambios ahí deben preservar performance.
- Exportación: PNG vía `html2canvas` (CDN, nodo `#calendar-export-node`) y PDF vía
  `window.print()`.
- Es vibe-coding con cariño por la "familia cunera": hay mensajes y chistes internos.
  Está bien, no los borres sin motivo.
</content>
</invoke>
