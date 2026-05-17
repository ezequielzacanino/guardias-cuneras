# 🏥 Guardias Cuneras

Herramienta web para automatizar la confección de cronogramas de guardias. El sistema resuelve el problema de asignación de turnos con un algoritmo metaheurístico que busca equidad.


## 🚀 Características Principales

*   **Algoritmo de Temple Simulado (Simulated Annealing):** Ejecuta hasta 9 millones de iteraciones para encontrar la configuración con menor varianza de carga.
*   **Gestión de Equidad:** Balancea automáticamente guardias, puntajes por dificultad de día y feriados.
*   **Restricciones de Descanso:** Bloqueo estricto de guardias consecutivas y penalización de "sanguchitos" (guardias alternadas por un solo día de descanso).
*   **Personalización de Pesos:** Interfaz para ajustar qué tan importante es la equidad vs. las preferencias individuales.
*   **Exportación Directa:** Descarga el cronograma como imagen (PNG) o genera un PDF.
*   **PWA Ready:** Instalable en celulares.

---

## 🧠 El Algoritmo de Asignación

El sistema utiliza **Simulated Annealing (SA)** para navegar un espacio de soluciones y evitar mínimos locales.

### 1. Clasificación de Carga 
Cada día recibe un peso ($score$) basado en folclore cunero:

| Tipo de Día | Etiqueta | Puntaje ($score$) |
| :--- | :--- | :--- |
| **Lunes** | Mon | $1.0$ |
| **Mar/Mié** | TueWed | $1.0$ |
| **Jueves** | Thu | $1.5$ |
| **Viernes** | Fri | $2.0$ |
| **Sábado** | Sat | $3.0$ |
| **Domingo** | Sun | $2.5$ |

> **Nota:** El sistema detecta automáticamente feriados puente y fines de semana largos, reasignando los pesos de forma dinámica (ej: un viernes feriado computa como un "Sábado").

### 2. Función de Costo y Varianza
El éxito del cronograma se mide mediante una función de costo global que busca minimizar la varianza matemática ($\sigma^2$) en múltiples dimensiones:

*   **Equidad de Puntaje:** Todos los residentes terminan el mes con una carga de "puntos" similar.
*   **Equidad de Turnos:** Distribución uniforme del número total de guardias.
*   **Equidad de Fines de Semana:** Intenta distribuir días de finde de forma equitativa.
*   **Jueves Feliz:** El algoritmo intenta que quien haga guardia un jueves no realice guardia el fin de semana inmediato.

### 3. Mecanismo de Optimización
1.  **Estado Inicial:** Se genera una solución aleatoria que cumple con las **Hard``` Constraints** (Vacaciones y prohibición de guardias consecutivas).
2.  **Perturbación:** El sistema realiza "swaps" (intercambios) y reemplazos estocásticos entre residentes.
3.  **Enfriamiento:** Acepta soluciones peores al inicio para explorar el espacio de búsqueda, volviéndose más estricto a medida que la "temperatura" baja, convergiendo en un óptimo global.

---

## 🛠️ Stack

*   **Framework:** React 18
*   **Estilos:** Tailwind CSS
*   **Iconografía:** Lucide-react
*   **Procesamiento:** Asynchronous Chunking (para no bloquear el thread principal de la UI durante el cálculo).
*   **Exportación:** Html2canvas

---

## 📖 Instalación y Uso

1. Clona el repositorio.
2. Instala las dependencias: `npm install`.
3. Inicia la aplicación: `npm start`.
4. Configura los nombres de los residentes, marca sus vacaciones en el calendario y presiona **"Generar Guardia"**.

---
*Nacido de la combinación entre vibe-coding y todo el amor que tengo por mi familia cunera* 🩺