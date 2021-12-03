//DOM Stuff
const btnIsochrone = document.getElementById("btnIsochrone");
const btnTravel = document.getElementById("btnTravel");

const viewIsochrone = document.getElementById("viewIsochrone");
const viewTravel = document.getElementById("viewTravel");

const btnFive = document.getElementById("btnFive");
const btnTen = document.getElementById("btnTen");
const btnFifteen = document.getElementById("btnFifteen");

const inputStart = document.getElementById("inputStart");
const inputEnd = document.getElementById("inputEnd");

const btnCalculate = document.getElementById("btnCalculate");

const txtCalculated = document.getElementById("txtCalculated");

const btnTransit = document.getElementById("btnTransit");
const btnDrive = document.getElementById("btnDrive");

const btnWalk = document.getElementById("btnWalk");
const btnDriveIso = document.getElementById("btnDriveIso");

//default selectedTime
let selectedTime = btnFive;
let selectedService = btnIsochrone;
let minutes = 5;

let markers = [];
let numMarkers = 0;

let startDestination = 0;
let endDestination = 0;

let isTransit = true;
let isoWalk = true;

function setBtnClicked(clickedBtn, oldBtn, isTime) {
  clickedBtn.classList.add("btnSelected");

  if (oldBtn != null) oldBtn.classList.remove("btnSelected");

  if (isTime) {
    selectedTime = clickedBtn;
  }
}

function removeMarkers() {
  markers.forEach((marker) => {
    marker.remove();
  });

  markers = [];
  txtCalculated.innerHTML = "";

  inputStart.value = "";
  inputEnd.value = "";
}

function initMap() {
  console.log("google maps");
}

async function getTime(isTransit) {
  const origin = {
    lat: markers[0].getLngLat().lat,
    lng: markers[0].getLngLat().lng,
  };
  const destination = {
    lat: markers[1].getLngLat().lat,
    lng: markers[1].getLngLat().lng,
  };

  const request = {
    origins: [origin],
    destinations: [destination],
    travelMode: isTransit
      ? google.maps.TravelMode.TRANSIT
      : google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.IMPERIAL,
    avoidHighways: false,
    avoidTolls: false,
  };

  var service = new google.maps.DistanceMatrixService();
  service.getDistanceMatrix(request, (response, status) => {
    if (status == "OK") {
      let results = response.rows[0].elements;
      txtCalculated.innerHTML = `${results[0].duration.text}`;
      results.forEach((route) => {
        console.log(route);
      });
    }
  });

  //data.durations[0][1] is time in seconds
  // txtCalculated.innerHTML = `${Math.round(
  //     data.durations[0][1] / 60
  // )} minutes`;
}

//Click Listeners

btnCalculate.addEventListener("click", () => {
  getTime(isTransit);
});

btnIsochrone.addEventListener("click", () => {
  setBtnClicked(btnIsochrone, btnTravel, false);
  selectedService = btnIsochrone;

  //Switch to Isochrone View
  viewIsochrone.classList.remove("hidden");
  viewTravel.classList.add("hidden");

  if (map.getLayer("circle") != null) {
    map.setLayoutProperty("circle", "visibility", "visible");
    map.setLayoutProperty("isoLayer", "visibility", "visible");
  }

  removeMarkers();
});

btnTravel.addEventListener("click", () => {
  setBtnClicked(btnTravel, btnIsochrone, false);
  selectedService = btnTravel;

  //Switch to travel View
  viewTravel.classList.remove("hidden");
  viewIsochrone.classList.add("hidden");

  if (map.getLayer("circle") != null) {
    map.setLayoutProperty("circle", "visibility", "none");
    map.setLayoutProperty("isoLayer", "visibility", "none");
  }
});

btnFive.addEventListener("click", () => {
  setBtnClicked(btnFive, selectedTime, true);
  minutes = 5;
});

btnTen.addEventListener("click", () => {
  setBtnClicked(btnTen, selectedTime, true);
  minutes = 10;
});

btnFifteen.addEventListener("click", () => {
  setBtnClicked(btnFifteen, selectedTime, true);
  minutes = 15;
});

btnTransit.addEventListener("click", () => {
  setBtnClicked(btnTransit, btnDrive, false);
  isTransit = true;
});

btnDrive.addEventListener("click", () => {
  setBtnClicked(btnDrive, btnTransit, false);
  isTransit = false;
});

btnWalk.addEventListener("click", () => {
  setBtnClicked(btnWalk, btnDriveIso, false);
  isoWalk = true;
});

btnDriveIso.addEventListener("click", () => {
  setBtnClicked(btnDriveIso, btnWalk, false);
  isoWalk = false;
});

function setDestination(isStart, lngLat) {
  if (isStart) {
    inputStart.value = lngLat;
    startDestination = lngLat;
  } else {
    endDestination = lngLat;
    inputEnd.value = lngLat;
  }
}

//Mapbox Stuff
const urlBase = "https://api.mapbox.com";

mapboxgl.accessToken =
  "pk.eyJ1IjoidmUyMS1yZXBvcCIsImEiOiJja3V5aWJmMHYwcWllMnBxd3VxaHFybnQ4In0.wlK8ydjP221cgz4vRSXmkw";
const map = new mapboxgl.Map({
  container: "map", // container ID
  style: "mapbox://styles/mapbox/light-v10", // style URL
  center: [12.333204857358027, 45.4358916330558], // starting position [lng, lat]
  zoom: 14, // starting zoom
});

map.on("load", () => {
  map.addSource("points", {
    type: "geojson",
    data: "isochrones.geojson", // replace this with the url of your own geojson
  });

  map.addLayer({
    id: "circle",
    type: "circle",
    source: "points",
    paint: {
      "circle-color": "#4264fb",
      "circle-radius": 8,
      "circle-stroke-width": 2,
      "circle-stroke-color": "#ffffff",
    },
  });

  map.addSource("iso", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer(
    {
      id: "isoLayer",
      type: "fill",
      source: "iso",
      layout: {},
      paint: {
        "fill-color": "#5a3fc0",
        "fill-opacity": 0.3,
      },
    },
    "poi-label"
  );

  map.on("click", (e) => {
    console.log(`A click event has occurred at ${e.lngLat}`);
    if (selectedService == btnTravel && markers.length < 2) {
      if (markers.length == 0) {
        inputStart.value = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(
          6
        )}`;
        console.log(e.lngLat);
      } else {
        inputEnd.value = `${e.lngLat.lat.toFixed(6)}, ${e.lngLat.lng.toFixed(
          6
        )}`;
      }

      markers.push(
        new mapboxgl.Marker({
          color: "#ff0000",
        })
          .setLngLat(e.lngLat)
          .addTo(map)
      );
    }
  });

  map.on("click", "circle", (e) => {
    map.flyTo({
      center: e.features[0].geometry.coordinates,
    });
    getIso(
      e.features[0].geometry.coordinates[0],
      e.features[0].geometry.coordinates[1],
      minutes,
      isoWalk
    );
  });

  // Change the cursor to a pointer when the it enters a feature in the 'circle' layer.
  map.on("mouseenter", "circle", () => {
    map.getCanvas().style.cursor = "pointer";
  });

  // Change it back to a pointer when it leaves.
  map.on("mouseleave", "circle", () => {
    map.getCanvas().style.cursor = "";
  });

  // Set up a marker that you can use to show the query's coordinates
  const marker = new mapboxgl.Marker({
    color: "#314ccd",
  });

  // Create a LngLat object to use in the marker initialization
  // https://docs.mapbox.com/mapbox-gl-js/api/#lnglat
  //   const lngLat = {
  //     lon: lon,
  //     lat: lat
  //   };

  // Create a function that sets up the Isochrone API query then makes a fetch call
  async function getIso(lon, lat, minutes, isoWalk) {
      let url = ""
    if (isoWalk) {
      url = `${urlBase}/isochrone/v1/mapbox/walking/${lon},${lat}?contours_minutes=${minutes}&polygons=true&denoise=1&generalize=0&access_token=${mapboxgl.accessToken}`;
    }
    else{
      url = `${urlBase}/isochrone/v1/mapbox/driving/${lon},${lat}?contours_minutes=${minutes}&polygons=true&denoise=1&generalize=0&access_token=${mapboxgl.accessToken}`;
    }
    // let url = `https://api.geoapify.com/v1/isoline?lat=${lat}&lon=${lon}&type=time&mode=approximated_transit&range=${minutes*60}&apiKey=70ee900e49ad44c094ee98182bd4e277`

    const query = await fetch(url, { method: "GET" });
    const data = await query.json();
    // Set the 'iso' source's data to what's returned by the API query
    map.getSource("iso").setData(data);
    marker.setLngLat({ lon: lon, lat: lat });
  }
});
