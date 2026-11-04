# 🏎️ Historia y Bitácora Completa de Evolución · Blackbox F1
> **Desde el Inicio:** 5 de Junio de 2026 – 1 de Noviembre de 2026  
> **Total de Versiones / Commits:** 150 commits en `main`  
> **Evolución:** v1.0.0 (Concepto Dashboard) ➔ v2.0 (Multistream & Rust) ➔ v3.0 (SignalR & Standings) ➔ v4.0.7 (Pit-Wall Profesional en Vivo)

---

## 🏛️ Fase 1: Génesis y Fundación de la Identidad Negro & Oro (Junio 2026)
*35 commits · 5 de Junio al 27 de Junio de 2026*

El proyecto nació el **5 de junio de 2026** bajo la premisa de crear un centro de comando de Fórmula 1 premium, oscuro, elegante y diseñado específicamente para fanáticos que buscaban algo superador a la interfaz básica oficial.

### 🌟 Hitos Principales de la Fase 1:
- **05/Jun/2026 (Commit Inicial `3325db5`):** Creación del repositorio bajo la estética *"F1 Dash Negro y Oro Premium"*. Primeras tarjetas con efecto de desenfoque de fondo (*backdrop-blur*) e identidad FocusFV.
- **13/Jun/2026:**
  - **Traducción Integral al Español:** Toda la terminología técnica de F1, paneles de configuración, Race Control y estados de pista se tradujeron al castellano para el público hispanohablante.
  - **Identidad de Escuderías y Pilotos:** Mapeo de logos vectoriales oficiales en alta resolución y banderas nacionales para los corredores (incorporando las banderas de Colapinto, Lawson, etc.).
  - **Módulo de Campeonato en Vivo:** Primera versión de la tabla de posiciones con integración de APIs externas de respaldo fuera de carrera.
  - **Calendario Oficial y Cuenta Regresiva:** Sincronización en UTC de los Grandes Premios con cálculo de inicio y finalización de cada ronda.
- **17/Jun/2026 – 20/Jun/2026:**
  - Resolución de bloqueos de CORS mediante proxies inversos y rewrites en Next.js.
  - Telemetría de pista fluida a 60 FPS con diseño responsivo.
  - Integración de analíticas y primera depuración del home.

---

## 🛰️ Fase 2: El Feed Satelital Multistream y Servidor Backend en Rust (Julio 2026)
*51 commits · 1 de Julio al 23 de Julio de 2026*

Durante julio, el proyecto dio un salto cuántico: dejó de ser solo un panel de tiempos para convertirse en una estación de transmisión satelital privada con soporte multimedia integrado.

### 🌟 Hitos Principales de la Fase 2:
- **01/Jul/2026:**
  - **Nacimiento de `/streams` (`54b7cc8`):** Implementación de la ruta privada para transmisiones satelitales en vivo (Fox Sports, Disney+, DAZN, ESPN).
  - Optimización táctil y gestual para que las transmisiones pudieran verse en celulares sin marcos molestos.
- **16/Jul/2026 – 18/Jul/2026:**
  - **Backend de Soporte en Rust (Axum):** Desarrollo e implementación de un microservicio en Rust para cachear videos oficiales de YouTube y manejar peticiones de alta concurrencia.
  - **Navbar Global con Efecto Fibra de Carbono:** Rediseño del encabezado con textura deportiva y desvanecimiento dinámico con scroll.
  - **Nacimiento de Parque Cerrado y WeatherInfo:** Primeras tarjetas de condiciones meteorológicas en tiempo real (temperatura de pista, aire, viento, humedad) y resultados post-carrera.
  - **Dockerización y Despliegue en la Nube:** Creación de imágenes Docker optimizadas para compilación de producción.

---

## ⚡ Fase 3: Modernización de Protocolos y Automatización de Calendario (Agosto 2026)
*2 commits · 22 de Agosto al 24 de Agosto de 2026*

Fase de investigación y preparación para la segunda mitad de la temporada:
- **22/Ago/2026:** Pruebas preliminares con el protocolo **SignalR** de la FOM y consumo de telemetría de doble autenticación.
- **24/Ago/2026:** Reestructuración de la biblioteca de calendarios F1 para adaptarse a formatos sprint y cambios de horarios.

---

## 🚀 Fase 4: La Gran Revolución v4.0 · Telemetría 2026, 24 Circuitos 2D e IA (Octubre 2026)
*58 commits · 21 de Octubre al 31 de Octubre de 2026*

La etapa de mayor innovación del software. El panel se transformó en una réplica visual de una consola de ingenieros de Pit-Wall de la Fórmula 1 moderna.

### 🌟 Hitos Principales de la Fase 4:
- **25/Oct/2026:**
  - **Lanzamiento de Blackbox v4.0.0:** Migración total de la ingestión en vivo al protocolo SignalR Core de F1 con WebSockets directos.
  - **Descompresión en Web Worker (`pako`):** Descarga del procesamiento pesado del hilo principal de JavaScript para evitar cualquier tildada de pantalla.
  - **TV Sync HUD:** Control de delay (+45s) para calibrar la telemetría al milisegundo exacto de la transmisión de televisión.
  - **Modo Circuito Interactivo 2D:** Creación de los 24 trazados vectoriales oficiales con sonido HUD estilo videojuego.
- **26/Oct/2026:**
  - **Circuito Cinematográfico a Pantalla Completa:** Portal React para proyectar el mapa del circuito con flecha blanca de sentido de giro, línea de meta iluminada y avatar del récord histórico de vuelta con su indumentaria de época.
  - **Campeonatos FIA Históricos (1950 – 2026):** Módulo interactivo con desglose de puntos carrera por carrera, logos retro y fotos reales con mono oficial.
  - **Temas de Oro Líquido OLED, Wake Lock Automático y Respuesta Háptica móvil.**
- **28/Oct/2026:**
  - **Parrilla 2026 Ampliada a 22 Autos:** Incorporación oficial de Franco Colapinto en Alpine (#43) y Checo Pérez en Cadillac (#11).
  - **Sectores S1, S2 y S3 en Cápsulas Pit-Wall:** Métricas en español (`FRE`, `ACE`, `RPM`) y adopción del sistema `BOOST` en reemplazo de "MOM".
  - **Ruta Secreta de Simulación:** Creación de `/dashboard/demo` con los 22 autos corriendo a velocidad real.
- **29/Oct/2026 – 30/Oct/2026:**
  - **Blindaje y Protección de Streams:** Directivas `noindex`, `nosnippet` y `robots.txt` para resguardo de servidores.
  - **Red de Espejos Multi-Dominio:** Auto-failover en 7.5s entre dominios (`.sbs`, `.st`, `.click`) y servidor Onboard exclusivo para Colapinto.
- **31/Oct/2026 (Clasificación GP de México):**
  - **Corrección del Reloj de Qualy:** Nuevo [`clockParser`](file:///c:/Users/fvill/Downloads/f1-dash-main/f1-dash-main/dashboard/src/lib/clockParser.ts) para `MM:SS:cc`, cuenta regresiva fluida a 1s para Q1, Q2 y Q3, y compensación de 5 horas UTC.
  - **Traducción y Subtítulos de Radios con IA:** Transcripción automática de audios de ingenieros y pilotos al español.
  - **Sistema VersionGuard:** Aviso flotante de nuevos despliegues en producción para recarga sin fricción.

---

## 🏆 Fase 5: Consolidación, Madurez y Desbloqueo Progresivo (Noviembre 2026)
*4 commits · 1 de Noviembre de 2026*

Durante la jornada del Gran Premio de México, se resolvieron los últimos detalles de precisión de datos y sincronización inteligente:
- **Autenticación Dual de WebSockets con F1_TOKEN:** La conexión ahora viaja blindada tanto por Header Bearer como por Query Param, manteniéndose activa incluso durante banderas rojas.
- **Diferenciación de Qualy vs. Carrera:** Separación de eliminaciones de clasificación (Q1/Q2) de los abandonos en carrera (`DNF · RETIRADO`), mostrando vuelta exacta del abandono.
- **Erradicación de Autos Fantasma:** Los coches en pista se representan con coordenadas GPS vivas recibidas del feed oficial.
- **Parque Cerrado Ultra-Inteligente:**
  - Desbloqueo progresivo de botones: los botones de sesiones futuras no se muestran si la sesión no fue corrida, eliminando cualquier confusión o muestra de carreras de semanas anteriores.
  - Erradicación del fallback a EE.UU. e integración directa con OpenF1 para ver los resultados de México al instante de caer la bandera a cuadros.
- **Sincronización Inteligente de YouTube:** Los resúmenes oficiales se clasifican dinámicamente según el día de actividad (Viernes prácticas, Sábado qualy, Domingo carrera).

---

## 📈 Resumen Estadístico Histórico

```
Total de Commits:       150
Días de Desarrollo:     150 días (5 de Junio – 1 de Noviembre de 2026)
Lenguajes / Stacks:     TypeScript, Next.js (App Router), React, Tailwind CSS, Rust (Axum), WebSockets, Web Workers
Módulos Creados:        Telemetría en Vivo, Streams Satelitales, Parque Cerrado, Calendario GP, 
                        Campeonatos FIA Históricos, Modo Circuito 2D, Radios con IA, TV Sync
```

---
*Este documento constituye la memoria técnica oficial de Blackbox F1.*
