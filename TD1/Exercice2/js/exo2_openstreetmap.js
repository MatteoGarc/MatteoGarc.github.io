var map = L.map('map').setView([51.505, -0.09], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap'
    }).addTo(map);

var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
    var crd = pos.coords;

    var latitude = crd.latitude;
    var longitude = crd.longitude

    map.setView([latitude, longitude], 13);
    L.marker([latitude, longitude]).addTo(map).bindPopup("Position actuelle");

    const niceCoords = [43.6961, 7.2656];
    L.marker(niceCoords).addTo(map).bindPopup("Nice");

    const bermudes = [
      [25.774, -80.19],
      [18.466, -66.118],
      [32.321, -64.757]
    ];

    L.polygon(bermudes, {
      color: "red",
      weight: 3,
      fillOpacity: 0.1
    }).addTo(map).bindPopup("Triangle des Bermudes");
}

function error(err) {
  console.warn(`ERREUR (${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);