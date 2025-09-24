const NICE = { lat: 43.6961, lon: 7.2656 };
const MARSEILLE = { lat: 43.2965, lon: 5.3698 };
const map = L.map('map').setView([NICE.lat, NICE.lon], 8);

L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg", {
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a>',
    maxZoom: 18
}).addTo(map);

const nmLine = L.polyline([[NICE.lat, NICE.lon],[MARSEILLE.lat, MARSEILLE.lon]], {color:'blue', weight:2, dashArray:'6 4'}).addTo(map).bindPopup('Nice ↔ Marseille');