# 📋 Bitácora Integral de Mejoras y Evolución · Blackbox F1
> **Período:** 25 de Octubre de 2026 – 1 de Noviembre de 2026  
> **Versión del Proyecto:** v4.0.0 → v4.0.7  
> **Área:** Telemetría en Tiempo Real, Ingestión F1 TV, Parque Cerrado, Streams, UI Pit-Wall y Motor de Datos

---

## 📅 Domingo, 1 de Noviembre de 2026
*Fin de semana del Gran Premio de la Ciudad de México · Carrera Oficial y Post-Carrera*

### 1. 🏁 Parque Cerrado Ultra-Inteligente y Sincronización Progresiva
- **Desbloqueo Progresivo de Sesiones:** Los botones de navegación (`FP1`, `FP2`, `FP3`, `QUALY`, `CARRERA` / `SQ`, `SPRINT`) ahora se habilitan **únicamente si la sesión ya fue completada en pista**.
  - Evita confusiones los sábados por la mañana: si no se corrió la FP3 o la Qualy, los botones permanecen ocultos y nunca muestran resultados de semanas anteriores.
  - Al arrancar el fin de semana solo está disponible `FP1`. Se van liberando cronológicamente a medida que concluye cada tanda.
- **Supresión Definitiva del Fallback a EE.UU.:**
  - Durante un fin de semana de Gran Premio activo, se bloqueó estrictamente la consulta a `/current/last/` en Jolpica/Ergast (que era la causante de que se mostrara el GP de Austin al terminar la carrera en México).
  - La bandera, cabecera y circuito se mantienen invariables en el Gran Premio en curso.
- **Integración Nativa de Resultados OpenF1:**
  - Si los servidores de Jolpica tardan en subir las tablas oficiales tras la bandera a cuadros, la app consulta directamente OpenF1, permitiendo ver de inmediato la clasificación real del GP de México (*P1 Max Verstappen, P2 Lewis Hamilton, P3 Kimi Antonelli, P4 Charles Leclerc, P5 Lando Norris... y Franco Colapinto en P8 con puntos oficiales*).

### 2. 📺 Feed de Resúmenes de YouTube por Etapa del Fin de Semana
- **Filtro Automático por Día de Actividad:**
  - **Viernes:** Muestra exclusivamente resúmenes de Prácticas Libres 1 y 2 (o Shootout).
  - **Sábado:** Desbloquea Libres 3, Sprint y Clasificación oficial.
  - **Domingo y Post-Carrera:** Presenta la parrilla completa incluyendo la Carrera principal.
- **Detección Dinámica de GP:** Se erradicó la búsqueda fija de Austin; ahora detecta automáticamente el Gran Premio que se está corriendo.

### 3. 🔐 Autenticación Robusta con F1 TV Token
- **Soporte Dual para F1_TOKEN:** La conexión por WebSocket con el backend ahora autentica el token de suscriptor tanto en el encabezado `Authorization: Bearer <token>` como por parámetro seguro de URL (`?token=<token>`).
- **Resistencia ante Banderas Rojas y Reconexiones:** Garantiza que si la sesión se suspende temporalmente o se reinicia la transmisión oficial, la telemetría no se desconecte ni arroje errores de credenciales caducadas.

### 4. 🛰️ Telemetría de Carrera vs. Qualy y Erradicación de Autos Fantasma
- **Diferenciación de Estados:** La columna de telemetría diferencia claramente las eliminaciones de Qualy (corte en Q1/Q2) de los abandonos en Carrera (`DNF · RETIRADO`), mostrando la vuelta de abandono exacta.
- **Filtro Estricto de Posiciones en Mapa 2D:** Se eliminaron las posiciones simuladas o congeladas al costado del circuito; los autos en pista solo se dibujan con coordenadas GPS vivas recibidas del feed oficial.

---

## 📅 Sábado, 31 de Octubre de 2026
*Fin de semana del Gran Premio de la Ciudad de México · Libres 3 y Clasificación*

### 1. ⏱️ Cronómetro Oficial de Clasificación y Corrección de Duración
- **Nuevo Parser de Reloj (`clockParser`):** Solución al error que calculaba 348 minutos debido a desfases de zonas horarias en Moment.js. Ahora soporta nativamente el formato `MM:SS:cc` oficial de la FOM.
- **Cuenta Regresiva Fluida a 1s:** Implementación de cálculo dinámico para Q1 (18:00), Q2 (15:00) y Q3 (12:00) con tictac continuo cuando el stream de WebSocket entra en silencio de telemetría.
- **Compensación de 5 horas UTC:** Sincronización milimétrica con la hora local de México y el reloj maestro de la FIA.
- **Badge Oficial F1 TV:** Incorporación del distintivo dorado con el tiempo de sesión restante.

### 2. 🎙️ Subtítulos y Traducción en Vivo de Radios de Equipo
- **Traductor Inteligente de Radios:** Procesamiento de audios oficiales de cabina (Team Radios) con traducción automática al español de las comunicaciones de ingenieros y pilotos.
- **Filtro de Pilotos en Carrera:** Visualización destacada en el banner inferior de mensajes clave de incidentes, estrategias y quejas de tráfico.

### 3. 🛡️ Sistema VersionGuard (Actualizaciones en Vivo)
- **Detección de Nuevos Despliegues en Render:** Monitoreo ligero cada 60 segundos del hash de versión en `/api/version`.
- **Notificación Flotante con Recarga Suave:** Si sube una nueva actualización a producción, muestra un pill superior discreto para recargar sin interrumpir la visualización activa.

### 4. 🗺️ Gestión de Autos en Boxes y Ventana Pre-Sesión
- **Indicador Lumínico PISTA / BOX:** Diferenciación en tiempo real de pilotos rodando vs. estacionados en el garaje.
- **Congelamiento de Mapa al Final de Sesión:** Evita saltos bruscos o autos flotantes cuando cae la bandera a cuadros.
- **Ventana de Pre-Sesión de 5 Minutos:** Animación con fundido cinemático previo al inicio de tanda.

### 5. 💳 Modal de Soporte y Donaciones
- **Integración de Alias y CVU Argentino:** Incorporación de transferencia bancaria directa (Mercado Pago / Banco) con botón de copiado en un clic y código QR para la comunidad de Argentina.
- **Enlace Directo de PayPal:** Conexión sin comisiones ocultas para soporte internacional.

---

## 📅 Viernes, 30 de Octubre de 2026
*Inicio del Gran Premio de México · Prácticas Libres 1 y 2*

### 1. 📡 Arquitectura de Transmisiones con Auto-Failover
- **Red de Espejos Multi-Dominio:** Implementación de servidores espejo automáticos (`.sbs`, `.st`, `.click`) para transmisiones de Fox Sports, Disney+, ESPN y DAZN.
- **Auto-Recuperación Inteligente (7.5s):** Si una señal experimenta corte o buffering, el reproductor conmuta al siguiente mirror disponible de forma transparente.
- **Botón de Salto Manual:** Control para que el usuario pueda alternar manualmente de servidor si un enlace se satura.

### 2. 🇦🇷 Señal Onboard Exclusiva de Franco Colapinto
- **Canal Dedicado Colapinto:** Rutas dinámicas para la cámara a bordo del auto #43 de Alpine con sincronización de audio ambiente.

### 3. 🛠️ Optimización de Build en Render
- **Eliminación del Fallo de Rust:** Resolución del error de compilación en el entorno de Render eliminando dependencias nativas innecesarias, reduciendo el tiempo de build a la mitad.

---

## 📅 Jueves, 29 de Octubre de 2026
*Seguridad y Optimización de Plataforma*

### 1. 🔒 Blindaje y Privacidad de Rutas Sensibles
- **Protección Anti-Scraping e Indexación:** Inclusión de directivas estrictas `noindex, nofollow, nosnippet, noarchive` en la ruta `/streams` y en el archivo `robots.txt` para garantizar la estabilidad y privacidad de las señales de transmisión.

---

## 📅 Miércoles, 28 de Octubre de 2026
*Reestructuración de Telemetría 2026 y Cockpit*

### 1. 🏎️ Actualización Completa a Grilla 2026 (22 Pilotos)
- **Nuevos Asientos Confirmados:**
  - Franco Colapinto en **Alpine F1 Team** (#43) con los nuevos colores rosa BWT y azul.
  - Sergio Pérez en **Cadillac F1 Team** (#11) con diseño gris titán y negro.
- **Telemetría Integral de los 22 Autos:** Soporte de posiciones, cronometrajes y deltas para todos los competidores sin recortes.

### 2. ⚡ Reemplazo de MOM por Sistema BOOST y Cápsulas Pit-Wall
- **Métrica BOOST:** Sustitución del término ambiguo "MOM" por el sistema oficial de despliegue de potencia auxiliar 2026 (BOOST).
- **Sectores S1, S2 y S3 en Cápsulas Pit-Wall:**
  - Formato visual unificado: fondo oscuro, números monoespaciados de alta legibilidad y código de colores oficial (Púrpura = Récord absoluto, Verde = Mejor personal, Amarillo = Sin mejora).
  - Etiquetas técnicas en español: `FRE` (Freno), `ACE` (Acelerador) y `RPM` (Revoluciones por minuto).

### 3. 🎮 Simulador y Modo Demo Secreto
- **Ruta `/dashboard/demo`:** Aislamiento de un entorno offline que reproduce la telemetría viva de los 22 autos a velocidad real para pruebas de interfaz y diseño en días sin actividad.

---

## 📅 Lunes, 26 de Octubre de 2026
*Módulo de Campeonatos Históricos, Modo Circuito Cinematográfico y Ergonomía*

### 1. 🏆 Módulo de Campeonatos FIA Históricos (1950 – 2026)
- **Historia Completa de la F1:** Visualización interactiva de todas las temporadas de la historia (desde 1950 hasta 2026).
- **Modales con Desglose Carrera por Carrera:** Historial detallado de puntos, victorias, podios y abandonos de cada piloto y constructor.
- **Retratos y Monos de Época:** Fotografías con indumentaria oficial y logos vectoriales históricos de cada escudería.

### 2. 🛰️ Modo Circuito Cinematográfico Aéreo (React Portal)
- **Visualización 2D Panorámica:** Renderizado a pantalla completa del trazado vectorial con línea de largada/meta iluminada, flecha de sentido de giro en blanco brillante y dock inferior con métricas clave (longitud, curvas, récord de vuelta y piloto poseedor con su mono oficial).
- **Activación Táctil:** Acceso mediante un solo toque en la cabecera tanto en dispositivos móviles como en pantallas de escritorio.

### 3. 🌙 Ajustes Avanzados, Temas de Oro y Wake Lock
- **Wake Lock Automático:** Mantiene encendida la pantalla de teléfonos y tablets de forma permanente mientras la telemetría esté activa.
- **Temas de Oro y Ámbar Pit-Wall:** Paleta de colores optimizada para pantallas OLED que reduce el consumo de batería y el cansancio visual.
- **Respuesta Háptica (Vibración):** Confirmación táctil sutil en móviles al cambiar de pestaña o alternar vistas.

---

## 📅 Domingo, 25 de Octubre de 2026
*Lanzamiento de Blackbox v4.0.0 · Migración a SignalR Core*

### 1. ⚡ Migración del Motor de Ingestión en Vivo a SignalR Core
- **Protocolo Moderno de F1 Live Timing:** Transición completa desde el backend legacy hacia SignalR Core con WebSockets bidireccionales de baja latencia.
- **Descompresión en Web Worker (`pako`):** Descompresión de paquetes masivos de telemetría en segundo plano sin congelar la interfaz de usuario en momentos de alto tráfico.

### 2. 📺 Sincronización TV (TV Sync HUD)
- **Ajuste de Delay para TV:** Control deslizante y preajustes rápidos (+45s, +60s) para sincronizar la telemetría milisegundo a milisegundo con la señal televisiva en vivo.
- **Modal Cara a Cara (Head-to-Head):** Comparativa directa entre dos pilotos seleccionados (tiempos, sectores, compuestos de neumáticos y vidas de goma).

### 3. 🏁 Rediseño Total de Parque Cerrado
- **Fin de las Tarjetas Gigantes:** Transformación a lista compacta unificada de P1 a P20 con integración de banderas nacionales de pilotos, logos oficiales de equipos y tiempos oficiales de sector.

---

## 📊 Resumen Cuantitativo de la Semana

| Métrica | Impacto |
| :--- | :--- |
| **Commits Desplegados** | **37 commits** a producción en `main` |
| **Tiempo de Carga de Telemetría** | Reducción de ~3.2s a **instantáneo (Web Worker + Cache)** |
| **Compatibilidad de Pilotos** | Ampliado a **22 pilotos oficiales de la temporada 2026** |
| **Estabilidad de Streams** | Red de **3 dominios espejo con conmutación en 7.5s** |
| **Cobertura de Circuitos** | **24 trazados oficiales** en alta definición vectorial |
| **Precisión de Parque Cerrado** | **0% caídas al GP anterior**; sincronización real por día |

---
*Documento generado automáticamente como registro técnico de evolución del proyecto.*
