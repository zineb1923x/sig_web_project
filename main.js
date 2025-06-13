let viewerCesium = null; // pour synchronisation

const map = new ol.Map({
  target: 'map',
  layers: [
    new ol.layer.Tile({ source: new ol.source.OSM() }),
    new ol.layer.Tile({
      source: new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/ehtp/wms',
        params: { 'LAYERS': 'ehtp:EHTP_', 'TILED': true },
        serverType: 'geoserver'
      }),
      opacity: 0.7
    })
  ],
  view: new ol.View({
    center: ol.proj.fromLonLat([-7.6501, 33.548]),
    zoom: 16
  })
});
function getLegendUrl(layerName) {
    return `http://localhost:8080/geoserver/ehtp/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetLegendGraphic&LAYER=${'ehtp:EHTP_'}&FORMAT=image/png`;
}
 
    const layers = { name: 'ehtp:EHTP_', label: 'Ehtp' };
// Générer la légende WMS et l’afficher
const legendContainer = document.getElementById("legend-content");

const legendItem = document.createElement("div");
legendItem.innerHTML = `
  <p><strong>${layers.label}</strong></p>
  <img src="${getLegendUrl(layers.name)}" alt="Légende indisponible" style="width: 100%;">
`;
legendContainer.appendChild(legendItem);


const scaleControl = new ol.control.ScaleLine({
  units: 'metric',
  target: document.getElementById('scale-line')
});
map.addControl(scaleControl);

const mousePositionElement = document.getElementById('mouse-position');
map.on('pointermove', function (event) {
  const coordinate = event.coordinate;
  const formatted = ol.coordinate.toStringXY(coordinate, 3);
  mousePositionElement.innerHTML = `Coordonnées : ${formatted}`;
});

async function initCesium() {
  Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGQ0OGJiYi0wY2E5LTQ3YjgtYWQxMi0zMmRhZDQyOWM3ZmYiLCJpZCI6MjkzODYyLCJpYXQiOjE3NDQ2MTg5NjR9.wfxuq2jBAOElFMqyHoTuG8JVl-CKg82jcKe4Gl2x3zM';

  const viewer = new Cesium.Viewer('cesiumContainer', {
    terrain: null,
    timeline: false,
    animation: false
  });

  viewerCesium = viewer; // lier pour synchronisation
  viewer.cesiumWidget.creditContainer.style.display = "none";

  const tileset = await Cesium.Cesium3DTileset.fromUrl('tileset.json', {
    maximumScreenSpaceError: 15,
    maximumNumberOfLoadedTiles: 10000,
    skipLevelOfDetail: true
  });

  viewer.scene.primitives.add(tileset);
  await viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 850));
  // Synchronisation Cesium → OpenLayers
viewer.camera.moveEnd.addEventListener(() => {
    const cartographic = Cesium.Cartographic.fromCartesian(viewer.camera.position);
    const lon = Cesium.Math.toDegrees(cartographic.longitude);
    const lat = Cesium.Math.toDegrees(cartographic.latitude);
  
    const olCenter = ol.proj.fromLonLat([lon, lat]);
  
    const height = cartographic.height;
    const olZoom = Math.log2(10000000 / height); // conversion d'altitude à zoom approx.
  
    map.getView().setCenter(olCenter);
    map.getView().setZoom(olZoom);
  });
  

}

initCesium();

// synchronisation OpenLayers -> Cesium
function syncCesiumWithOpenLayers() {
  if (!viewerCesium) return;
  const olView = map.getView();
  const center = olView.getCenter();
  const zoom = olView.getZoom();
  const [lon, lat] = ol.proj.toLonLat(center);
  const altitude = 10000000 / Math.pow(2, zoom);

  viewerCesium.camera.flyTo({
    destination: Cesium.Cartesian3.fromDegrees(lon, lat, altitude),
    orientation: {
      heading: 0,
      pitch: Cesium.Math.toRadians(-45),
      roll: 0
    },
    duration: 0.5
  });
}

map.getView().on('change:center', syncCesiumWithOpenLayers);
map.getView().on('change:resolution', syncCesiumWithOpenLayers);