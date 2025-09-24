var options = {
  enableHighAccuracy: true,
  timeout: 5000,
  maximumAge: 0,
};

function success(pos) {
  var crd = pos.coords;

  var latitude = document.getElementById("latitude");
  latitude.innerText = crd.latitude;

  var longitude = document.getElementById("longitude");
  longitude.innerText = crd.longitude;

  var altitude = document.getElementById("altitude");
  altitude.innerText = crd.altitude;

  var precision = document.getElementById("precision");
  precision.innerText = crd.accuracy;

  var vitesse = document.getElementById("vitesse");
  vitesse.innerText = crd.speed;

  var date = document.getElementById("date");
  date.innerText = new Date(pos.timestamp).toLocaleString();
}

function error(err) {
  console.warn(`ERREUR (${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);