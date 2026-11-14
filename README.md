# ARES NAV — APEX SPACE CODE
Simulación educativa en español para NASA Space Apps, **Interplanetary Survival Guide: Martian Map**. Proyecto sin publicar.

## Demo
1. Abrir `/`: mapa global Viking VIS y pestaña Explorar. Arrastrar, usar rueda/pinza, zoom, Vista global; buscar `Jezero` o `18.4447, 77.4508`.
2. Elegir Jezero; abrir Misión y **Cargar misión de ejemplo**: dos tripulantes, supuestos editables marcados Datos de demostración.
3. Cambiar destino a latitud `18.462`, longitud `77.479`; mantener regreso a base; Simular misión. Resultado esperado con parada: alrededor de **3,78 km**, **1,89 h**, **4,11 h** de margen.
4. Abrir Asistente y preguntar qué recorrido recomienda. Cita cálculos y procedencia, reconoce datos faltantes. Un cambio compatible queda pendiente de aplicación; no se modifica la misión automáticamente.
5. Importar datos: descargar plantilla CSV, cargar archivo, asignar columnas, validar filas y aplicar. Repetir con JSON completo o GeoJSON FeatureCollection (Point para ciencia, Polygon para peligros).
6. Vaciar tasa de agua: resultado **Sin datos**. Cambiar destino a `-50, 180`: aproximación geodésica y terreno sin evaluar; alertas de recursos y tiempo.
7. Exportar misión/resultados JSON. El borrador persiste en este navegador.
En móvil, pestañas en panel inferior y Ver mapa/Abrir panel; mismos pasos.

## Fuentes e integraciones
- [NASA Mars Trek API](https://trek.nasa.gov/tiles/apidoc/trekAPI.html?body=mars): catálogo consultado y capabilities XML leídas en el navegador. CRS marciano 104905, coordenadas planetocéntricas y longitud este; sin reproyección terrestre.
- Viking `Mars_Viking_MDIM21_ClrMosaic_global_232m`: teselas JPEG HTTP 200 verificadas en vista previa, fondo debajo del detalle.
- CTX `CTX_beta01_uncontrolled_5m_Caltech`: capabilities NASA anuncian servicio de teselas `https://astro.arcgis.com/arcgis/rest/services/OnMars/CTX/MapServer/tile/{TileMatrix}/{TileRow}/{TileCol}`; teselas renderizadas verificadas por separado. Se respetan tamaños 512 y matrices XML. Disponible al acercarse; no usar como elevación.
- HiRISE `JEZ_hirise_soc_006_orthoMosaic_25cm_Eqc_latTs0_lon0_first_dd`: PNG HTTP 200 en Jezero; cobertura **77,2229331…77,583964 E**, **18,3067994…18,669315 N**. Fondo Viking se conserva fuera de cobertura.
- MOLA `Mars_MGS_MOLA_ClrShade_merge_global_463m`: opcional, 54 teselas HTTP 200 en prueba global. Relieve visual, no DEM numérico.
- [Caltech Murray Lab CTX](https://murray-lab.caltech.edu/CTX/): referencia del mosaico. Acceso directo desde sandbox no verificado por problema de certificado TLS del sitio; el mosaico se accede mediante el endpoint anunciado por NASA, verificado en navegador.
- Imágenes de destinos: miniaturas NASA del producto correspondiente almacenadas a través del servicio de assets. No imágenes sintéticas.
- Lovable Cloud AI: Gateway SDK, `openai/gpt-6-astra`, función servidor con métricas recalculadas; respuesta real IA verificada en escritorio y móvil. Falla final devuelve recomendaciones etiquetadas por reglas. No se publica ni se agregan cuentas.

## Cálculos y límites
Radio medio **3.389,5 km**; Haversine y interpolación esférica, normalización [-180,180), cruce de antimeridiano sin vuelta larga. Tiempo = distancia / velocidad; recursos = tiempo × tripulación × tasa por persona/hora. Agua L, oxígeno kg, energía kWh. Margen = máximo - tiempo; reserva = máximo × porcentaje. Costos solo con precios disponibles; parciales si no se proporcionan todos los precios. Equipo y carga se registran pero no modelan fatiga. No se incluye tiempo de muestreo ni pausas.

A* usa una red numérica explícita importada en JSON: `nodes: [{id,name,lat,lon,neighbors:[id],elevation?,risk?}]`. Los nodos deben cubrir extremos de cada tramo a ≤100 m. Riesgo no negativo; costo seguro penaliza riesgo, elevación en metros penaliza cambios verticales. Sin conexión/cobertura no se inventa camino: geodésica punteada. Opciones: corto sin paradas; ciencia con paradas; menor riesgo con red. No hay DEM ni cuadrícula oficial instalada; cuadrículas CSV deben convertirse a red de nodos JSON con vecinos, no se interpretan como terreno automáticamente. No calcula pendientes de imágenes ni certifica transitabilidad. Polígonos de peligro importados se contrastan con puntos muestreados del recorrido; ausencia de intersección no garantiza seguridad.

## Verificación
`bunx vitest run src/test/mission.test.ts src/test/app-routing.test.tsx`: 13 pruebas (radio, longitudes, antimeridiano, dos tripulantes, regreso, tasas faltantes, cambio de coordenadas, límites, importación, costos, A* y ruta inicial).
Playwright: flujo completo escritorio **1280×1800**, móvil **390×844**, recomendación IA real, misión CSV aplicada y simulada, destino fuera de terreno, agua sin tasa; sin errores de página ni desbordamiento horizontal. Capas Viking, HiRISE, CTX y MOLA verificadas por separado. Las solicitudes externas pueden fallar: estado visible en Capas, se conserva cualquier fondo disponible.
