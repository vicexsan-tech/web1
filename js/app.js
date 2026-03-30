$(document).ready(function () {
    //init()
});

// ---- Config inicial ----

const homeLonLat = [-2.00, 40.8000]; // Madrid (lon, lat)
const homeZoom = 10;

// Vista
const view = new ol.View({
    center: ol.proj.fromLonLat(homeLonLat),
    zoom: homeZoom
});

// ---- BASEMAPS ----
// CARTO Dark Gray
const darkGrayLayer = new ol.layer.Tile({
  source: new ol.source.XYZ({
    url: 'https://{a-c}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attributions: '© OpenStreetMap © CARTO'
  }),
  visible: false
});

// OSM estándar
const osmLayer = new ol.layer.Tile({
    source: new ol.source.OSM(),
    visible: false
});
  
// CARTO Light Gray
const lightGrayLayer = new ol.layer.Tile({
    source: new ol.source.XYZ({
        url: 'https://{a-c}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
        attributions: '© OpenStreetMap © CARTO'
    }),
    visible: true
});

// Mapa
const map = new ol.Map({
    target: 'map',
    layers: [
        osmLayer,
        lightGrayLayer,
        darkGrayLayer
    ],
    view: view
});

// CAPAS

// Placeholder: configuración de capa WMS publicada en GeoServer
const gsWmsTramoVial = {
    id: 'rt_tramo_vial_wms',
    title: 'RT Tramo Vial (WMS tiles)',
    workspaceLayer: 'geovis10:rt_tramo_vial',
    wmsUrl: 'https://geovisualizacion3d.com/geoserver/geovis03/wms',
    visible: false,
    params: {
      'LAYERS': 'geovis10:rt_tramo_vial',
      'TILED': true
    },
    wmsVersion: '1.1.1'
};
// Capa WMS (tiles) desde GeoServer
const tramoVialWmsLayer = new ol.layer.Tile({
    visible: gsWmsTramoVial.visible,
    source: new ol.source.TileWMS({
      url: gsWmsTramoVial.wmsUrl,
      params: {
        ...gsWmsTramoVial.params,
        'VERSION': gsWmsTramoVial.wmsVersion,
        'FORMAT': 'image/png',
        'TRANSPARENT': true
      },
      serverType: 'geoserver',
      transition: 0 // opcional: evita "fade" al refrescar tiles
    })
});

map.addLayer(tramoVialWmsLayer);

// Placeholder: configuración de capa WFS publicada en GeoServer
const gsWfsTramoVial = {
    id: 'rt_tramo_vial_wfs',
    title: 'RT Tramo Vial (WFS - GeoJSON)',
    typeName: 'ne:rt_tramo_vial',
    wfsUrl: 'https://geovisualizacion3d.com/geoserver/ne/wfs',
    visible: false,
    wfsVersion: '2.0.0',
    outputFormat: 'application/json',
    srsName: 'EPSG:3857' // para que encaje con el visor (OSM)
};


// COnfig WMS (geojson)
const tramoVialWfsSource = new ol.source.Vector({
    format: new ol.format.GeoJSON(),
    url: function (extent) {
      // extent llega en EPSG:3857 (CRS del mapa)
      const params = new URLSearchParams({
        service: 'WFS',
        version: gsWfsTramoVial.wfsVersion,
        request: 'GetFeature',
        typeName: gsWfsTramoVial.typeName,
        outputFormat: gsWfsTramoVial.outputFormat,
        srsName: gsWfsTramoVial.srsName,
        bbox: extent.join(',') + ',' + gsWfsTramoVial.srsName
      });
      
      return gsWfsTramoVial.wfsUrl + '?' + params.toString();
    },
    strategy: ol.loadingstrategy.bbox
});

//Style
const tramoVialWfsStyle = new ol.style.Style({
    stroke: new ol.style.Stroke({
      width: 2
    })
});

//Capa WMS (geojson) desde GeoServer
const tramoVialWfsLayer = new ol.layer.Vector({
    source: tramoVialWfsSource,
    visible: gsWfsTramoVial.visible,
    style: tramoVialWfsStyle
});
  

//EJEMPLO ANALISIS ESPACIAL

const GEOSERVER_WMS_URL = 'https://geovisualizacion3d.com/geoserver/ne/wms';

// Nombres publicados en GeoServer (workspace:layer)
const LIVE_STATIONS_LAYER = 'ne:vw_estacionffcc_live';
const LIVE_BUFFER_LAYER   = 'ne:vw_estacionffcc_live_buf500m';

// ---- UI helpers ----
function setStatus(msg) {
  $('#status').text(msg);
}

// 1) Buffer 500m (recomendado dibujarlo debajo de los puntos)
const estacionesBufferWms = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: GEOSERVER_WMS_URL,
      params: {
        'LAYERS': LIVE_BUFFER_LAYER,
        'TILED': true,
        'VERSION': '1.1.1',
        'FORMAT': 'image/png',
        'TRANSPARENT': true
      },
      serverType: 'geoserver',
      transition: 0
    })
});
  
// 2) Estaciones live (puntos)
const estacionesLiveWms = new ol.layer.Tile({
    visible: false,
    source: new ol.source.TileWMS({
      url: GEOSERVER_WMS_URL,
      params: {
        'LAYERS': LIVE_STATIONS_LAYER,
        'TILED': true,
        'VERSION': '1.1.1',
        'FORMAT': 'image/png',
        'TRANSPARENT': true
      },
      serverType: 'geoserver',
      transition: 0
    })
});

const arbolesWms = new ol.layer.Tile({
  visible: false,
  source: new ol.source.TileWMS({
    url: 'https://geovisualizacion3d.com/geoserver/geovis03/wms',  // ← CAMBIA ESTO
    params: {
      'LAYERS': 'geovis03:arboles',  // ← CAMBIA ESTO
      'TILED': true,
      'VERSION': '1.1.1',
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver'
  })
});

map.addLayer(arbolesWms);

const comarcaWms = new ol.layer.Tile({
  visible: false,
  source: new ol.source.TileWMS({
    url: 'https://geovisualizacion3d.com/geoserver/geovis03/wms',  // ← CAMBIA ESTO
    params: {
      'LAYERS': 'geovis03:comarca',  // ← CAMBIA ESTO
      'TILED': true,
      'VERSION': '1.1.1',
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver'
  })
});

map.addLayer(comarcaWms);

const arbolesInterseccionWms = new ol.layer.Tile({
  visible: false,
  source: new ol.source.TileWMS({
    url: 'https://geovisualizacion3d.com/geoserver/geovis03/wms',
    params: {
      'LAYERS': 'geovis03:arboles_interseccion',
      'TILED': true,
      'VERSION': '1.1.1',
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver'
  })
});

map.addLayer(arbolesInterseccionWms);

// Añadir al mapa (buffer debajo, puntos encima)
map.addLayer(estacionesBufferWms);
map.addLayer(estacionesLiveWms);

const provinciasWms = new ol.layer.Tile({
  visible: false,
  source: new ol.source.TileWMS({
    url: 'https://geovisualizacion3d.com/geoserver/geovis03/wms',
    params: {
      'LAYERS': 'geovis03:provincias',
      'TILED': true,
      'VERSION': '1.1.1',
      'FORMAT': 'image/png',
      'TRANSPARENT': true
    },
    serverType: 'geoserver'
  })
});

map.addLayer(provinciasWms);


function setEstacionesLiveVisible(isVisible) {
    estacionesLiveWms.setVisible(Boolean(isVisible));
}
  
  function setEstacionesBufferVisible(isVisible) {
    estacionesBufferWms.setVisible(Boolean(isVisible));
}

function changeBasemap(type) {
    // Apagar todas
    osmLayer.setVisible(false);
    lightGrayLayer.setVisible(false);
    darkGrayLayer.setVisible(false);
  
    // Encender la seleccionada
    if (type === 'osm') {
      osmLayer.setVisible(true);
    }
  
    if (type === 'light') {
      lightGrayLayer.setVisible(true);
    }
  
    if (type === 'dark') {
      darkGrayLayer.setVisible(true);
    }
    console.log("Basemap cambiado a:", type);
}

function changeRoadLayer(type) {
    // Opcion por defecto, elimina cualquier filtro
    cqlfilter = null;
    if (type ==1) {
        cqlfilter = "calzada = 1";
    } else if(type == 2) {
        cqlfilter = "calzada = 2";
    }
    tramoVialWmsLayer.getSource().updateParams({
    'CQL_FILTER': cqlfilter
    });
}

function setTramoVialWmsVisible(isVisible) {
    tramoVialWmsLayer.setVisible(Boolean(isVisible));
}

function refreshWmsLayer(layer) {
    const source = layer.getSource();
  
    source.updateParams({
      '_refresh': Date.now()
    });
}
// ---- Eventos UI (jQuery) ----
$('#btn-home').on('click', function () {
  view.animate({ center: ol.proj.fromLonLat(homeLonLat), zoom: homeZoom, duration: 400 });
  setStatus('Home');
});

$('#btn-refresh').on('click', function () {
    refreshWmsLayer(estacionesLiveWms);
    refreshWmsLayer(estacionesBufferWms);
});

$('#toggle-arboles').on('click', function () {
    const isActive = $('#toggle-arboles').is(':checked');
    arbolesWms.setVisible(Boolean(isActive));
});

$('#arboles-select').on('change', function () {
  const especie = $(this).val();

  let cql = null;

  if (especie !== "null") {
    cql = `especie = '${especie}'`;
  }

  arbolesWms.getSource().updateParams({
    'CQL_FILTER': cql
  });
});

$('#toggle-comarca').on('click', function () {
  const isActive = $(this).is(':checked');
  comarcaWms.setVisible(isActive);
});

$('#toggle-arboles-interseccion').on('click', function () {
  const isActive = $(this).is(':checked');
  arbolesInterseccionWms.setVisible(isActive);
});

$('#toggle-provincias').on('click', function () {
  const isActive = $(this).is(':checked');
  provinciasWms.setVisible(isActive);
});

$('#basemap-select').on('change', function () {
    const selectedValue = $(this).val();
    changeBasemap(selectedValue);
});

// ---- Eventos del mapa ----
map.on('singleclick', function (evt) {
    const coord3857 = evt.coordinate;
    const coord4326 = ol.proj.toLonLat(coord3857);

    $('#info').html(
        `<b>Coordenadas</b><br>` +
        `EPSG:3857: ${coord3857.map(v => v.toFixed(2)).join(', ')}<br>` +
        `EPSG:4326: ${coord4326.map(v => v.toFixed(6)).join(', ')}`
    );

    setStatus('Click capturado');
});
function init(){ 
}
function WFSTest(){
    map.addLayer(tramoVialWfsLayer);
    tramoVialWfsLayer.setVisible(Boolean(true))
}