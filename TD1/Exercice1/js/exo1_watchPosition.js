var id, target, options;

function success(pos) {
  var crd = pos.coords;

  var latitude = document.getElementById("latitude2");
  latitude.innerText = crd.latitude;

  var longitude = document.getElementById("longitude2");
  longitude.innerText = crd.longitude;

  var altitude = document.getElementById("altitude2");
  altitude.innerText = crd.altitude;

  var precision = document.getElementById("precision2");
  precision.innerText = crd.accuracy;

  var vitesse = document.getElementById("vitesse2");
  vitesse.innerText = crd.speed;

  var date = document.getElementById("date2");
  date.innerText = new Date(pos.timestamp).toLocaleString();
}

function error(err) {
  console.warn("ERROR(" + err.code + "): " + err.message);
}

target = {
  latitude: 0,
  longitude: 0,
};

options = {
  enableHighAccuracy: false,
  timeout: 5000,
  maximumAge: 0,
};

id = navigator.geolocation.watchPosition(success, error, options);