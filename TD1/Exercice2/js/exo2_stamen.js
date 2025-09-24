const NICE = { lat: 43.6961, lon: 7.2656 };
const MARSEILLE = { lat: 43.2965, lon: 5.3698 };
const map = L.map('map').setView([NICE.lat, NICE.lon], 8);
let geoJsonLayers = [];
let routeLayer = null;

L.tileLayer("https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}.jpg?api_key=eed6a6b4-d171-43e4-8215-e5f8490b4245", {
    attribution: '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/about" target="_blank">OpenStreetMap</a>',
    maxZoom: 18
}).addTo(map);

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

// Formule de Haversine
function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

async function loadGeoJson() {
    try {
        const geoJsonSources = [
            'https://geo.api.gouv.fr/departements/13/communes?format=geojson'
        ];
        
        for (let source of geoJsonSources) {
            try {
                const response = await fetch(source);
                const geoJsonData = await response.json();
                
                const geoJsonLayer = L.geoJSON(geoJsonData, {
                    style: {
                        color: '#ff6b6b',
                        weight: 2,
                        opacity: 0.8,
                        fillOpacity: 0.3
                    },
                    onEachFeature: function(feature, layer) {
                        if (feature.properties) {
                            let popupContent = '<div><strong>Données GeoJSON</strong><br>';
                            for (let key in feature.properties) {
                                popupContent += `<strong>${key}:</strong> ${feature.properties[key]}<br>`;
                            }
                            popupContent += '</div>';
                            layer.bindPopup(popupContent);
                        }
                    }
                });
                
                geoJsonLayer.addTo(map);
                geoJsonLayers.push(geoJsonLayer);

                return;
                
            } catch (error) {
                console.log(`Erreur avec la source: ${source}`);
            }
        }
        
        throw new Error("Aucune source GeoJSON accessible");
        
    } catch (error) {
        alert("Impossible de charger les données GeoJSON: " + error.message);
    }
}

async function calculateRoute(lat, lon) {
    
    try {
        const start = `${lon},${lat}`;
        const end = `${MARSEILLE.lon},${MARSEILLE.lat}`;
        
        const response = await fetch(
            `https://router.project-osrm.org/route/v1/driving/${start};${end}?overview=full&geometries=geojson`
        );
        
        const data = await response.json();
        
        if (data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const coordinates = route.geometry.coordinates.map(coord => [coord[1], coord[0]]);
            
            if (routeLayer) {
                map.removeLayer(routeLayer);
            }
            
            routeLayer = L.polyline(coordinates, {
                color: '#28a745',
                weight: 4,
                opacity: 0.8
            }).bindPopup(`🛣️ Route calculée<br>Distance: ${(route.distance / 1000).toFixed(2)} km<br>Durée: ${Math.round(route.duration / 60)} min`);
            
            routeLayer.addTo(map);
        }
        
    } catch (error) {
        alert("Erreur lors du calcul de route: " + error.message);
    }
}

function success(pos) {
    var crd = pos.coords;
    var latitude = crd.latitude;
    var longitude = crd.longitude;
    var accuracy = crd.accuracy;

    L.marker([latitude, longitude]).addTo(map).bindPopup("Position actuelle");

    L.circle([latitude, longitude], {
        radius: accuracy,
        color: '#4facfe',
        fillColor: '#4facfe',
        fillOpacity: 0.2,
        weight: 2
    }).addTo(map).bindPopup(`Précision: ${accuracy.toFixed(0)}m`);

    L.marker(MARSEILLE).addTo(map).bindPopup('Marseille');
    L.marker(NICE).addTo(map).bindPopup('Nice');
    L.polyline([[NICE.lat, NICE.lon], [MARSEILLE.lat, MARSEILLE.lon]], {color:'blue',weight:2, dashArray:'6 4'}).addTo(map).bindPopup('Nice ↔ Marseille');

    var distanceToMarseille = calculateDistance(
        latitude, longitude,
        MARSEILLE.lat, MARSEILLE.lon
    );

    document.getElementById("distance").innerText = distanceToMarseille.toFixed(3);

    loadGeoJson();
    calculateRoute(latitude, longitude);
}

function error(err) {
  console.warn(`ERREUR (${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);