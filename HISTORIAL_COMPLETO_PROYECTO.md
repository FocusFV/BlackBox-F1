# 🏎️ Historia y Bitácora Completa de Evolución · Blackbox F1
> **Desde el Inicio:** 5 de Junio de 2026 – 13 de Noviembre de 2026  
> **Total de Versiones / Commits:** 225 commits en `main`  
> **Evolución:** v1.0.0 (Concepto Dashboard) ➔ v2.0 (Multistream & Rust) ➔ v3.0 (SignalR & Standings) ➔ v4.0.0 (Pit-Wall Profesional) ➔ v4.1.0 (Cloudflare Edge, PWA Nativa & Modo Simulación FIA)  
> **Dominio Oficial:** [blackboxf1.com](https://blackboxf1.com)

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
  - **Corrección del Reloj de Qualy:** Nuevo `clockParser` para `MM:SS:cc`, cuenta regresiva fluida a 1s para Q1, Q2 y Q3, y compensación de 5 horas UTC.
  - **Traducción y Subtítulos de Radios con IA:** Transcripción automática de audios de ingenieros y pilotos al español.
  - **Sistema VersionGuard:** Aviso flotante de nuevos despliegues en producción para recarga sin fricción.

---

## 🏆 Fase 5: Consolidación, Madurez y Desbloqueo Progresivo (1 de Noviembre 2026)
*4 commits · 1 de Noviembre de 2026*

Durante la jornada del Gran Premio de México, se consolidaron detalles clave de precisión y sincronización:
- **Autenticación Dual de WebSockets con F1_TOKEN:** La conexión ahora viaja blindada tanto por Header Bearer como por Query Param, manteniéndose activa incluso durante banderas rojas.
- **Diferenciación de Qualy vs. Carrera:** Separación de eliminaciones de clasificación (Q1/Q2) de los abandonos en carrera (`DNF · RETIRADO`), mostrando vuelta exacta del abandono.
- **Erradicación de Autos Fantasma:** Los coches en pista se representan con coordenadas GPS vivas recibidas del feed oficial.
- **Parque Cerrado Ultra-Inteligente:**
  - Desbloqueo progresivo de botones: los botones de sesiones futuras no se muestran si la sesión no fue corrida, eliminando cualquier confusión o muestra de carreras de semanas anteriores.
  - Erradicación del fallback a EE.UU. e integración directa con OpenF1 para ver los resultados de México al instante de caer la bandera a cuadros.
- **Sincronización Inteligente de YouTube:** Los resúmenes oficiales se clasifican dinámicamente según el día de actividad (Viernes prácticas, Sábado qualy, Domingo carrera).

---

## 📱 Fase 6: Progressive Web App (PWA) de Alto Rendimiento & Puntuación PWABuilder (4 de Noviembre 2026)
*5 commits · 4 de Noviembre de 2026*

Transformación de Blackbox F1 en una aplicación nativa instalable para Android, iOS y escritorio:
- **Manifest PWA Completo:** Identificadores únicos de aplicación, orientación portrait-primary, temas oscuros y badges deportivos.
- **Iconos Adaptativos Maskable:** Generación de iconos adaptativos en resoluciones 192x192 y 512x512 para Google Play y APK exportable.
- **Service Worker Avanzado:** Caché predictivo de fuentes tipográficas Geist, estilos y trazados de circuitos.
- **Soporte de Edge Side Panel y `launch_handler: focus-existing`:** Reutilización de ventanas abiertas sin duplicar pestañas.
- **Auditoría de Rendimiento en React 19:** Depuración de render cycles e integración de Vercel Speed Insights.

---

## 🏁 Fase 7: Telemetría GPS 60 FPS, Planimetría 4K y Sincronización en Vivo de Interlagos (7 al 8 de Noviembre 2026)
*21 commits · 7 al 8 de Noviembre de 2026*

Perfeccionamiento de la telemetría en vivo durante el Gran Premio de São Paulo (Interlagos):
- **Descompresión DEFLATE Nativa de Posiciones:** Decodificación en tiempo real de `Position.z` y `CarData.z` con raw DEFLATE en [`inflate.ts`](file:///c:/Users/fvill/Downloads/f1-dash-main/f1-dash-main/dashboard/src/lib/inflate.ts), logrando 60 FPS puros en el mapa 2D.
- **Planimetría Oficial 2D con Curvas Numeradas:** Numeración automática de cada vértice y curva oficial de los 24 circuitos de la FIA.
- **Backdrops 4K Aéreos Satelitales:** Integración de fotografías satelitales nítidas en alta resolución de Interlagos y Las Vegas Strip Circuit.
- **Lógica de Banderas y Reloj Maestro:**
  - Retención exacta del cronómetro bajo bandera roja (`Flag 5`) sin saltos hacia adelante.
  - Detección precisa de bandera a cuadros (`Chequered flag`) sin falsas banderas rojas posteriores en Q1, Q2 y Q3.
  - Banderas flameantes con animaciones CSS fluidas.
- **Grilla de Partida Oficial vs. Tiempos de Clasificación:** Selector para alternar entre los tiempos cronometrados de Qualy y la Grilla Oficial con penalizaciones aplicadas por los comisarios deportivos.
- **Corte de Q1 para 22 Autos:** Ajuste del umbral de eliminación a P17 para la grilla ampliada de 2026.

---

## ☁️ Fase 8: Migración a Cloudflare Workers & Lanzamiento de `blackboxf1.com` (8 de Noviembre 2026)
*17 commits · 8 de Noviembre de 2026*

Superación de los límites de cuota de Vercel y paso a infraestructura global de nivel empresarial:
- **Migración a Cloudflare Workers con OpenNext:**
  - Configuración de `@opennextjs/cloudflare` v1.20 y Wrangler v4 para compilación orientada a V8 Isolates de Cloudflare.
  - Creación de `.npmrc` con `include=dev` y estandarización a `npm@10.9.0` para despliegues limpios.
  - Soporte de variables de entorno con fallbacks resilientes en Zod (`env.ts`).
- **Dominio Propio Internacional `blackboxf1.com`:**
  - Delegación de Nameservers a Cloudflare con enrutamiento Edge mundial, SSL/TLS universal y tiempos de respuesta inferiores a 50 ms.
- **Reconciliación de Puntos y Standings 2026:**
  - Alineación de tablas oficiales de Pilotos y Constructores 2026, desempates en FP3 y deltas de qualy.

---

## 🎨 Fase 9: Pulido Integral de UX Móvil, Parque Cerrado Inteligente y Rediseño de Home (9 al 12 de Noviembre 2026)
*19 commits · 9 al 12 de Noviembre de 2026*

Auditoría exhaustiva sobre dispositivos móviles y modernización estética de la página de aterrizaje:
- **Optimización Responsive Móvil:**
  - Corrección de truncamiento de nombres en la torre de tiempos y modales de pilotos.
  - Eliminación de desbordamientos horizontales en pestañas de sesión y tarjetas de calendario.
  - Restricción del radar meteorológico a zoom máximo 7 para prevenir errores de teselas satelitales.
  - Incorporación de avatares y banderas de rookies (Doohan, Bortoleto, Antonelli, Hadjar, Lindblad, Bearman).
- **Parque Cerrado Inteligente:**
  - Transición automática nocturna de los miércoles hacia el GP venidero.
  - Caché de sesión en memoria para evitar reseteos de datos al recargar la página.
- **Rediseño Limpio de la Home (`/`):**
  - Supresión del contador de cuenta regresiva en la portada.
  - Simplificación de accesos directos a únicamente dos botones esenciales: *"Ingresar a la Telemetría"* y *"Donar / Apoyar"*.
  - Retiro de botones inferiores en las tarjetas explicativas para mantener un diseño visualmente sobrio y equilibrado.

---

## 🧪 Fase 10: Suite de Simulación FIA en Vivo para QA & Aislamiento de Entornos (12 al 13 de Noviembre 2026)
*14 commits · 12 al 13 de Noviembre de 2026*

Creación del entorno de pruebas dinámico en tiempo real para verificar el comportamiento de toda la web en condiciones de carrera antes de las sesiones oficiales:
- **Blindaje y Token Secreto:**
  - Activación restringida exclusivamente mediante token criptográfico de alta entropía (`sim_sec_e8d2c4b7a1f930_pitwall2026` o variable de entorno), bloqueando accesos no autorizados.
  - Clausura definitiva de rutas demo públicas (`/dashboard/demo` cerrada con código 404).
- **HUD Secreto de Simulación (`SecretSimulationHUD`):**
  - **Torre de Telemetría Dinámica:** 22 monoplazas en pista con tiempos de vuelta (S1, S2, S3), deltas en verde estables y consistentes.
  - **Simulación de Sobrepasos:** Intercambio milimétrico de posiciones en pista con herencia de delta (+0.380s) y emisión simultánea del cartel oficial en Race Control.
  - **Forzado de Banderas (Verde / VSC):** Congelamiento de deltas y sectores a ~40s bajo Virtual Safety Car; reanudación inmediata a bandera verde con aviso *"Pista habilitada · Bandera verde"*.
  - **Radios de Equipo con Transcripción en Español:** Mensajes contextuales de pilotos (Colapinto, Hamilton, Verstappen, Norris) con etiqueta `SIM LIVE`, auto-cierre determinístico a los 12 segundos colapsando a fila compacta con botón `[Abrir]`, y persistencia libre de duplicados o fantasmas.
  - **Avance Manual de Vueltas:** Botón `[+1 Vta]` para pruebas de paso de vuelta exacto (28 → 29).
  - **Persistencia entre Páginas y Recargas:** La simulación mantiene vuelta, orden, estado y gaps al navegar por `/dashboard`, `/dashboard/standings`, `/dashboard/weather`, `/dashboard/track-map` y `/streams`.
  - **Desbloqueo de `/streams` en Simulación:** Acceso habilitado sin avisos de motores apagados.
  - **Desplazamiento Dinámico de Navbar:** La barra de navegación se mueve hacia abajo (`top: 48px`) cuando el HUD está expandido, garantizando que el enlace *"Panel"* y todo el menú superior sean 100% cliqueables.
  - **Botón `[Detener]`:** Limpieza total de sesión y restauración instantánea del sitio a su estado normal.
- **Aislamiento Perfecto entre Modo Normal y Modo Simulación:**
  - **Modo Normal:** El SSR y el primer pintado arrancan de inmediato en el **Gran Premio de Las Vegas** (bandera USA, Práctica 1, circuito Las Vegas Strip clave 152, clima oficial de Nevada `36.1147, -115.173`).
  - **Modo Simulación:** Todos los módulos se sincronizan coherentemente con el **Gran Premio de la Ciudad de México 2026** (Autódromo Hermanos Rodríguez, clave 65, bandera mexicana).

---

## 📈 Resumen Estadístico Histórico Global

```
Total de Commits en main: 225
Días de Desarrollo:       162 días (5 de Junio – 13 de Noviembre de 2026)
Dominio Oficial:          https://blackboxf1.com
Infraestructura:          Cloudflare Workers (Edge Global) + Render (Rust/Docker WebSockets)
Lenguajes / Stacks:       TypeScript, Next.js 16 (App Router), React 19, Tailwind CSS v4,
                          Zustand, Motion, Rust (Axum), WebSockets, Web Workers (pako), MapLibre GL
Módulos Creados:          Telemetría en Vivo 60 FPS, Multistream Satelital, Parque Cerrado Inteligente,
                          Control Meteorológico Radar Doppler, Grilla de Partida Oficial FIA,
                          Campeonatos Históricos (1950-2026), Modo Circuito 2D, Radios con IA,
                          TV Sync Anti-Spoilers, HUD Secreto de Simulación FIA
```

---
*Este documento constituye la memoria técnica oficial y completa de Blackbox F1.*
