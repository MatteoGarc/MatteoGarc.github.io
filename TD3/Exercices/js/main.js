import * as THREE from 'three';

// ===================== Fonctions =====================

function latLonToCartesian(lat, lon, radius = 1) {
    const phi = THREE.MathUtils.degToRad(90 - lat);
    const theta = THREE.MathUtils.degToRad(lon + 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

function addMarker3d(lat, lon, color = 0xff0000, size = 0.02, textureUrl = null) {
    let material;
    if (textureUrl) {
        const flagTexture = new THREE.TextureLoader().load(textureUrl);
        material = new THREE.MeshBasicMaterial({ map: flagTexture });
    } else {
        material = new THREE.MeshBasicMaterial({ color });
    }

    const marker = new THREE.Mesh(new THREE.SphereGeometry(size, 16, 16), material);
    marker.userData = { lat, lon };
    const pos = latLonToCartesian(lat, lon, 1.01);
    marker.position.copy(pos);
    sphere.add(marker);
    clickableObjects.push(marker);
    return marker;
}

function centerEarthOn(lat, lon) {
    const latRad = THREE.MathUtils.degToRad(lat);
    const lonRad = THREE.MathUtils.degToRad(lon + 90);

    gsap.to(sphere.rotation, {
        y: -lonRad,
        x: latRad,
        z: 0,
        duration: 1.2,
        ease: "power2.out"
    });
}

function cartesianToLatLon(position) {
    const inverseMatrix = new THREE.Matrix4();
    inverseMatrix.copy(sphere.matrixWorld).invert();
    const localPoint = position.clone().applyMatrix4(inverseMatrix);
    
    localPoint.normalize();
    
    const lat = THREE.MathUtils.radToDeg(Math.asin(localPoint.y));
    const lon = THREE.MathUtils.radToDeg(Math.atan2(-localPoint.z, localPoint.x)) - 180;
    
    return { lat, lon };
}

// ====================== THREEJS ======================

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
camera.position.z = 2;
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth/2, window.innerHeight/2 );

var div = document.getElementById("map3d");
div.appendChild( renderer.domElement );

const geometry = new THREE.SphereGeometry(1, 128, 128); 
const textureLoader = new THREE.TextureLoader();
const earthTexture = textureLoader.load("public/earth.png");
const material = new THREE.MeshPhongMaterial({map: earthTexture});
const sphere = new THREE.Mesh( geometry, material );
scene.add(sphere);

fetch("https://restcountries.com/v3.1/all?fields=name,latlng,flags")
    .then((res) => {
        if (!res.ok) throw new Error(`HTTP error ${res.status}`);
        return res.json();
    })
    .then((countries) => {
        countries.forEach((country) => {
            if (country.latlng && country.flags?.png) {
                const [lat, lon] = country.latlng;
                addMarker3d(lat, lon, 0xffffff, 0.025, country.flags.png);
            }
        });
    })
    .catch((err) => console.error("Erreur REST Countries:", err));

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableObjects = [sphere];

renderer.domElement.addEventListener('click', (event) => {
    const rect = renderer.domElement.getBoundingClientRect();

    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(clickableObjects);

    if (intersects.length > 0) {
        const obj = intersects[0].object;
        if (obj.userData.lat !== undefined && obj.userData.lon !== undefined) {
            const { lat, lon } = obj.userData;
            map.setView([lat, lon], 4);
        } 
        else if (obj === sphere) {
            const intersectionPoint = intersects[0].point;
            const { lat, lon } = cartesianToLatLon(intersectionPoint);
            map.setView([lat, lon + 180], 4);
        }
    }
});

function animate() {
    renderer.render( scene, camera );
}

renderer.setAnimationLoop( animate );

// ====================== LEAFLET ======================

var map = L.map('map');

map.on('click', function(e) {
    const { lat, lng } = e.latlng;
    centerEarthOn(lat, lng);
});

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
    const { latitude, longitude } = pos.coords;

    map.setView([latitude, longitude], 6);
    L.marker([latitude, longitude]).addTo(map).bindPopup("Position actuelle").on('click', () => centerEarthOn(latitude, longitude));
    addMarker3d(latitude, longitude, 0x00ff00, 0.03);
    centerEarthOn(latitude, longitude);
}

function error(err) {
    console.warn(`ERREUR (${err.code}): ${err.message}`);
}

navigator.geolocation.getCurrentPosition(success, error, options);