let tracks = [];

// Инициализация карты с экстентом на Москву
const map = L.map('map').setView([55.751244, 37.618423], 10);

// Добавление слоя карты 2ГИС
L.tileLayer('https://tile2.maps.2gis.com/tiles?x={x}&y={y}&z={z}&v=1', {
    maxZoom: 19,
    attribution: '© 2ГИС'
}).addTo(map);

document.getElementById('file-input').addEventListener('change', function(event) {
    const files = Array.from(event.target.files);
    if (files.length > 0) {
        document.getElementById('loading').style.display = 'block';
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const kmlText = e.target.result;
                parseKML(kmlText, file.name);
            };
            reader.readAsText(file);
        });
    }
});

function parseKML(kmlText, fileName) {
    const parser = new DOMParser();
    const kmlDoc = parser.parseFromString(kmlText, 'application/xml');
    const geojson = toGeoJSON.kml(kmlDoc);

    // Добавление KML данных на карту как GeoJSON слой
    const geoJsonLayer = L.geoJSON(geojson).addTo(map);

    // Получение границ (bounding box) загруженного слоя
    const bounds = geoJsonLayer.getBounds();
    map.fitBounds(bounds);

    // Подсчет длины трека и получение координат начала и конца
    const trackLength = calculateDistance(geojson);
    const startCoords = geojson.features[0].geometry.coordinates[0];
    const endCoords = geojson.features[0].geometry.coordinates.slice(-1)[0];
    tracks.push({ name: fileName, length: trackLength, startCoords, endCoords });

    if (tracks.length === document.getElementById('file-input').files.length) {
        document.getElementById('loading').style.display = 'none';
        document.getElementById('stats-btn').style.display = 'block';
    }
}

function calculateDistance(geojson) {
    let distance = 0;
    geojson.features.forEach(feature => {
        if (feature.geometry.type === 'LineString') {
            const coords = feature.geometry.coordinates;
            for (let i = 1; i < coords.length; i++) {
                distance += getDistance(
                    coords[i-1][1], coords[i-1][0],
                    coords[i][1], coords[i][0]
                );
            }
        }
    });
    return distance;
}

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // metres
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon1-lon2) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c;
    return d;
}

document.getElementById('stats-btn').addEventListener('click', function() {
    const tracksData = encodeURIComponent(JSON.stringify(tracks));
    window.location.href = `stats.html?tracks=${tracksData}`;
});

// Добавим код для обработки ресайза карты
const mapContainer = document.getElementById('map-container');
const resizeHandle = document.getElementById('map-resize-handle');

let isResizing = false;

resizeHandle.addEventListener('mousedown', function(e) {
    isResizing = true;
    document.addEventListener('mousemove', resizeMap);
    document.addEventListener('mouseup', stopResizing);
});

function resizeMap(e) {
    if (isResizing) {
        const width = e.clientX - mapContainer.offsetLeft;
        const height = e.clientY - mapContainer.offsetTop;
        mapContainer.style.width = `${width}px`;
        mapContainer.style.height = `${height}px`;
        map.invalidateSize();
    }
}

function stopResizing() {
    isResizing = false;
    document.removeEventListener('mousemove', resizeMap);
    document.removeEventListener('mouseup', stopResizing);
}
