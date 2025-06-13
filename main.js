
var map = new ol.Map({
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
        center: ol.proj.fromLonLat([-7.6501, 33.548]), // Casablanca
        zoom: 16
    })
});

function getLegendUrl(layerName) {
    return `http://localhost:8080/geoserver/ehtp/wms?SERVICE=WMS&VERSION=1.1.0&REQUEST=GetLegendGraphic&LAYER=${layerName}&FORMAT=image/png`;

}

const layers = [{ name: 'ehtp:EHTP_', label: 'Ehtp' }];
const legendContainer = document.getElementById("legend-content");
layers.forEach(layer => {
    let div = document.createElement("div");
    div.innerHTML = `
        <p><strong>${layer.label}</strong></p>
        <img src="${getLegendUrl(layer.name)}" alt="Légende indisponible" style="width: 100%;">
    `;
    legendContainer.appendChild(div);
});

const scaleControl = new ol.control.ScaleLine({
    units: 'metric',
    className: 'ol-scale-line',
    target: document.getElementById('scale-line')
});
map.addControl(scaleControl);

const mousePositionElement = document.getElementById('mouse-position');
map.on('pointermove', function (event) {
    const coordinate = event.coordinate;
    const formatted = ol.coordinate.toStringXY(coordinate, 3);
    mousePositionElement.innerHTML = 'Coordonnées : ${formatted}';
});

// === Ton code Cesium sans modification ===
async function initCesium() {
    Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI4OGQ0OGJiYi0wY2E5LTQ3YjgtYWQxMi0zMmRhZDQyOWM3ZmYiLCJpZCI6MjkzODYyLCJpYXQiOjE3NDQ2MTg5NjR9.wfxuq2jBAOElFMqyHoTuG8JVl-CKg82jcKe4Gl2x3zM';

    const viewer = new Cesium.Viewer('cesiumContainer', {
        terrain: null,
        timeline: false,
        animation: false,
    });

    viewer.cesiumWidget.creditContainer.style.display = "none";

    const tileset = await Cesium.Cesium3DTileset.fromUrl('tileset.json', {
        maximumScreenSpaceError: 15,
        maximumNumberOfLoadedTiles: 10000,
        skipLevelOfDetail: true,
    });

    const toolbar = document.createElement('div');
    toolbar.style.position = 'absolute';
    toolbar.style.top = '10px';
    toolbar.style.left = '10px';
    toolbar.style.padding = '10px';
    toolbar.style.backgroundColor = 'rgba(0,0,0,0.7)';
    toolbar.style.color = 'white';
    toolbar.style.zIndex = 100;
    toolbar.style.borderRadius = '5px';

    const button = document.createElement('button');
    button.innerText = "Measure Distance";
    toolbar.appendChild(button);

    const unitSelect = document.createElement('select');
    const option = document.createElement('option');
    option.value = 'meters';
    option.text = 'Meters';
    unitSelect.appendChild(option);
    toolbar.appendChild(unitSelect);

    document.body.appendChild(toolbar);
    viewer.scene.primitives.add(tileset);
    viewer.zoomTo(tileset, new Cesium.HeadingPitchRange(0, -0.5, 850));
    

}

// Appel immédiat
initCesium();