# 📋 Bitácora Integral de Mejoras y Evolución · Blackbox F1
> **Período:** 25 de Octubre de 2026 – 13 de Noviembre de 2026  
> **Versión del Proyecto:** v4.0.0 → v4.1.0  
> **Área:** Telemetría en Tiempo Real, Ingestión F1 TV, Parque Cerrado, Streams, UI Pit-Wall, PWA, Cloudflare Edge y Modo Simulación FIA  
> **Dominio:** [blackboxf1.com](https://blackboxf1.com)

---

## 📅 Jueves 12 y Viernes 13 de Noviembre de 2026
*Suite de Simulación FIA en Vivo para QA y Aislamiento de Entornos*

### 1. 🏎️ Modo de Simulación FIA en Vivo con Token Secreto
- **Activación Robusta y Segura:**
  - Acceso mediante token criptográfico de alta entropía (`sim_sec_e8d2c4b7a1f930_pitwall2026` o variable de entorno `NEXT_PUBLIC_SIMULATION_TOKEN`), bloqueando valores genéricos como `?test_mode=true`.
  - Clausura definitiva de rutas demo públicas (`/dashboard/demo` responde 404).
- **HUD Secreto de Simulación (`SecretSimulationHUD`):**
  - **Torre de Telemetría Dinámica:** 22 monoplazas en pista con tiempos de vuelta (S1, S2, S3), deltas en verde estables y consistentes.
  - **Simulación de Sobrepasos:** Intercambio milimétrico de posiciones con herencia de delta (+0.380s) y emisión sincronizada del cartel oficial en Race Control.
  - **Forzado de Banderas (Verde / VSC):** Congelamiento de deltas y sectores a ~40s bajo Virtual Safety Car; retorno fluido a bandera verde con aviso *"Pista habilitada · Bandera verde"*.
  - **Radios de Equipo con Transcripción en Español:** Mensajes de pilotos (Colapinto, Hamilton, Verstappen, Norris) con badge `SIM LIVE`, auto-cierre determinístico a los 12 segundos colapsando a fila compacta con botón `[Abrir]`, sin fantasmas ni duplicados.
  - **Avance Manual de Vueltas:** Botón `[+1 Vta]` para pruebas de paso de vuelta exacto (28 → 29).
  - **Persistencia entre Páginas y Recargas:** Mantiene vuelta, orden, estado y gaps al navegar por `/dashboard`, `/dashboard/standings`, `/dashboard/weather`, `/dashboard/track-map` y `/streams`.
  - **Desbloqueo de `/streams` en Simulación:** Acceso habilitado sin avisos de motores apagados.
  - **Desplazamiento Dinámico de Navbar:** La barra de navegación se mueve hacia abajo (`top: 48px`) cuando el HUD está expandido, permitiendo clics libres en el enlace *"Panel"*.
  - **Botón `[Detener]`:** Limpieza total de sesión en `sessionStorage` y restauración instantánea del sitio a su estado normal.

### 2. 🌍 Aislamiento Perfecto entre Modo Normal y Modo Simulación
- **Modo Normal (sin simulación):**
  - SSR y primer pintado arrancan de inmediato en el **Gran Premio de Las Vegas** (bandera USA, Práctica 1, circuito Las Vegas Strip clave 152, clima oficial de Nevada `36.1147, -115.173`).
  - Se erradicaron los flashes hacia México cuando no hay simulación activa.
- **Modo Simulación:**
  - Clima, bandera, trazado satelital (clave 65) y telemetría anclados al **Gran Premio de la Ciudad de México 2026** (Autódromo Hermanos Rodríguez).

---

## 📅 Miércoles, 11 de Noviembre de 2026
*Refactorización y Simplificación Visual de la Home*

### 1. 🏠 Página de Inicio Más Limpia y Directa
- **Retiro del Contador de Portada:** Supresión del cronómetro superior para priorizar la entrada inmediata al centro de comando.
- **Simplificación de Accesos Directos:** Reducción a únicamente dos botones principales: *"Ingresar a la Telemetría"* y *"Doname un Café"*.
- **Tarjetas Explicativas Sobrias:** Eliminación de los botones inferiores dentro de los tres módulos explicativos (*Telemetría y Tiempos*, *Campeonato Mundial*, *TV Sync*), manteniéndolas como tarjetas informativas de alto impacto visual.

---

## 📅 Lunes 9 y Martes 10 de Noviembre de 2026
*Auditoría Integral Mobile y Parque Cerrado Inteligente*

### 1. 📱 Perfeccionamiento Responsive Móvil
- **Torre de Tiempos:** Ajuste de nombres de pilotos para evitar recortes en pantallas de menos de 380px.
- **Pestañas de Sesión:** Corrección del scroll horizontal en modales y paneles laterales.
- **Radar de Lluvia:** Restricción a zoom máximo 7 en Open-Meteo para evitar fallos de renderizado de teselas satelitales.
- **Rookies 2026:** Inclusión de banderas nacionales y retratos para Doohan, Bortoleto, Antonelli, Hadjar, Lindblad y Bearman.

### 2. 🏁 Parque Cerrado y Grilla de Partida
- **Transición Automática de Miércoles:** Transición automática nocturna hacia el GP venidero.
- **Grilla Oficial vs. Clasificación:** Selector para alternar entre los tiempos cronometrados de Qualy y la Grilla Oficial con penalizaciones aplicadas por los comisarios deportivos.
- **Caché en Memoria:** Prevención de reseteo de resultados al recargar o alternar pestañas.

---

## 📅 Sábado 7 y Domingo 8 de Noviembre de 2026
*Telemetría GPS 60 FPS Pura, Planimetría 4K y Migración a Cloudflare Workers*

### 1. 🏎️ Motor de Posiciones GPS a 60 FPS
- **Decodificación DEFLATE Nativa:** Descompresión en tiempo real de `Position.z` y `CarData.z` con raw DEFLATE en `inflate.ts`, logrando 60 FPS fluidos en el mapa 2D.
- **Planimetría 2D con Curvas Numeradas:** Numeración automática de cada curva oficial de los 24 circuitos de la FIA.
- **Backdrops 4K Satelitales:** Fotografías aéreas en alta resolución para Interlagos y Las Vegas Strip Circuit.

### 2. ☁️ Despliegue en Cloudflare Workers & Dominio Oficial
- **Migración a Cloudflare Workers:** Compilación con `@opennextjs/cloudflare` v1.20 y Wrangler v4, superando el límite de peticiones de Vercel.
- **Lanzamiento de `blackboxf1.com`:** Enrutamiento Edge mundial con SSL/TLS automático y respuesta < 50 ms.

---

## 📅 Miércoles, 4 de Noviembre de 2026
*Progressive Web App (PWA) de Alto Rendimiento*

### 1. 📱 Soporte PWA Completo
- **Manifest y Service Worker:** Caché predictivo de fuentes Geist, estilos y trazados de circuitos.
- **Iconos Adaptativos Maskable:** Resoluciones 192x192 y 512x512 optimizadas para empaquetado APK en Android.
- **Integración de Vercel Speed Insights:** Monitoreo ligero de métricas web vitales.

---

## 📅 Domingo, 1 de Noviembre de 2026
*Fin de semana del Gran Premio de la Ciudad de México · Carrera Oficial y Post-Carrera*

### 1. 🏁 Parque Cerrado Ultra-Inteligente y Sincronización Progresiva
- **Desbloqueo Progresivo de Sesiones:** Los botones de navegación (`FP1`, `FP2`, `FP3`, `QUALY`, `CARRERA` / `SQ`, `SPRINT`) se habilitan únicamente si la sesión ya fue completada en pista.
- **Supresión Definitiva del Fallback a EE.UU.:** Bloqueo estricto de consultas `/current/last/` en Jolpica durante el fin de semana de carrera.
- **Integración Nativa de Resultados OpenF1:** Clasificación real inmediata post-carrera si Jolpica experimenta retrasos.

### 2. 📺 Feed de Resúmenes de YouTube por Etapa del Fin de Semana
- **Filtro Automático por Día de Actividad:**
  - **Viernes:** Prácticas Libres 1 y 2.
  - **Sábado:** Libres 3, Sprint y Clasificación.
  - **Domingo y Post-Carrera:** Carrera principal.

### 3. 🔐 Autenticación Robusta con F1 TV Token
- **Soporte Dual para F1_TOKEN:** Autenticación por Header Bearer y Query Param seguro.
- **Resistencia ante Banderas Rojas y Reconexiones.**

### 4. 🛰️ Telemetría de Carrera vs. Qualy y Erradicación de Autos Fantasma
- **Diferenciación de Estados:** Separación de eliminaciones de Qualy de abandonos en Carrera (`DNF · RETIRADO`).
- **Filtro Estricto de Posiciones en Mapa 2D:** Exclusivamente coordenadas GPS vivas.

---

## 📅 Sábado, 31 de Octubre de 2026
*Fin de semana del Gran Premio de la Ciudad de México · Libres 3 y Clasificación*

### 1. ⏱️ Cronómetro Oficial de Clasificación y Corrección de Duración
- **Nuevo Parser de Reloj (`clockParser`):** Soporte de formato `MM:SS:cc` oficial de la FOM con compensación UTC.
- **Cuenta Regresiva Fluida a 1s:** Cálculo para Q1 (18:00), Q2 (15:00) y Q3 (12:00) con tictac continuo.

### 2. 🎙️ Subtítulos y Traducción en Vivo de Radios de Equipo
- **Traductor Inteligente de Radios:** Procesamiento de audios de cabina con traducción automática al español.

### 3. 🛡️ Sistema VersionGuard (Actualizaciones en Vivo)
- **Monitoreo cada 60s en `/api/version`:** Aviso flotante discreto para recarga sin fricción.

---

## 📅 Viernes, 30 de Octubre de 2026
*Inicio del Gran Premio de México · Prácticas Libres 1 y 2*

### 1. 📡 Arquitectura de Transmisiones con Auto-Failover
- **Red de Espejos Multi-Dominio:** Espejos automáticos (`.sbs`, `.st`, `.click`) para Fox Sports, Disney+, ESPN y DAZN con auto-recuperación en 7.5s.
- **Canal Onboard Exclusivo de Franco Colapinto (#43).**

---

## 📅 Jueves, 29 de Octubre de 2026
*Seguridad y Optimización de Plataforma*

### 1. 🔒 Blindaje y Privacidad de Rutas Sensibles
- **Protección Anti-Scraping:** Directivas estrictas `noindex, nofollow, nosnippet, noarchive` en `/streams` y `robots.txt`.

---

## 📅 Miércoles, 28 de Octubre de 2026
*Reestructuración de Telemetría 2026 y Cockpit*

### 1. 🏎️ Actualización Completa a Grilla 2026 (22 Pilotos)
- Franco Colapinto en **Alpine F1 Team** (#43) y Checo Pérez en **Cadillac F1 Team** (#11).
- Telemetría integral de los 22 autos.

### 2. ⚡ Reemplazo de MOM por Sistema BOOST y Cápsulas Pit-Wall
- Sectores S1, S2 y S3 con métricas `FRE`, `ACE`, `RPM` y código oficial de colores FIA.

---

## 📅 Lunes, 26 de Octubre de 2026
*Módulo de Campeonatos Históricos, Modo Circuito Cinematográfico y Ergonomía*

### 1. 🏆 Módulo de Campeonatos FIA Históricos (1950 – 2026)
- Desglose carrera por carrera, retratos de época y monos oficiales.

### 2. 🛰️ Modo Circuito Cinematográfico Aéreo (React Portal)
- Visualización 2D panorámica con flecha blanca de sentido de giro y dock de récords de vuelta.

### 3. 🌙 Ajustes Avanzados, Temas de Oro y Wake Lock
- Wake Lock permanente y temas optimizados para pantallas OLED.

---

## 📅 Domingo, 25 de Octubre de 2026
*Lanzamiento de Blackbox v4.0.0 · Migración a SignalR Core*

### 1. ⚡ Migración a SignalR Core & Descompresión Web Worker (`pako`)
- WebSockets bidireccionales de baja latencia con procesamiento en segundo plano.

### 2. 📺 Sincronización TV (TV Sync HUD) & Cara a Cara
- Control de delay (+45s) y comparativa directa entre pilotos seleccionados.

---

## 📊 Resumen Cuantitativo Histórico

| Métrica | Impacto |
| :--- | :--- |
| **Commits en `main`** | **225 commits** |
| **Días de Evolución** | **162 días** continuos de desarrollo |
| **Rendimiento de Carga** | < 50 ms a nivel global vía **Cloudflare Workers Edge** |
| **Tasa de Refresco** | **60 FPS continuos** con Web Workers y raw DEFLATE |
| **Parrilla Oficial** | **22 monoplazas FIA 2026** completamente integrados |
| **Modo QA** | **Simulación FIA en tiempo real** con token secreto y persistencia total |

---
*Documento oficial de registro de cambios de Blackbox F1.*
