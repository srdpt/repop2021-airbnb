mapboxgl.accessToken =
	"pk.eyJ1IjoidmUyMS1yZXBvcCIsImEiOiJja3V5aWJmMHYwcWllMnBxd3VxaHFybnQ4In0.wlK8ydjP221cgz4vRSXmkw";
const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/light-v10",
	center: [12.333526611328127, 45.43645118808819],
	zoom: 13,
});

const months = [
	null,
	"Jan",
	"Feb",
	"Mar",
	"Apr",
	"May",
	"Jun",
	"Jul",
	"Aug",
	"Sep",
	"Oct",
	"Nov",
	"Dec",
];

/**
 * A TimeCode object that handles generating different string representations needed for a given month/year combo
 * @param {Date} date Date object to construct the TimeCode from
 */
let TimeCode = class TimeCode {
	constructor(date) {
		this.month = date.getMonth() + 1;
		this.year = date.getFullYear();
		this.date = date;
	}

	getFilterCode() {
		return this.month < 10
			? `${this.year}-0${this.month}`
			: `${this.year}-${this.month}`;
	}

	getString() {
		let monthStr = months[this.month];

		return `${monthStr} ${this.year}`;
	}

	getTimeCode() {
		return `${this.year}-${this.month}`;
	}

	getSliderVal(){
		let year =  (this.date.getFullYear()-2016) * 12;
		let month = this.month+1

		return year+month
	}
};

/**
 * Generates and returns the HTML for the popup window on hover
 * @param {event} event The event object from the mousemove that contains the data used to gen the HTML
 * @returns {string} Popup HTML
 */
function popupHTML(event) {
	// return `<h1>${event.features[0].properties.beds} Beds</h1>`;
	return `<h1>${event.features[0].properties.accommodates} Beds</h1>`;
}

map.on("load", () => {
	let filterDate = ["==", ["string", ["get", "month_year"]], "2016-01"];
	document.getElementById("smallDate").innerText = getTimeCode(
		slider.value
	).getString();
	document.getElementById("largeDate").innerText = getTimeCode(
		slider.value
	).getString();

	window.selectedTime = getTimeCode(slider.value).getString();

	map.addLayer({
		id: "beds",
		type: "fill",
		source: {
			type: "geojson",
			data: "beds.geojson", // replace this with the url of your own geojson
		},
		paint: {
			"fill-color": [
				"interpolate",
				["linear"],
				// ["number", ["get", "beds"]],
				["number", ["get", "accommodates"]],
				0,
				"#04782E",
				20,
				"#00B040",
				40,
				"#FFF400",
				60,
				"#E1DA04",
				80,
				"#FF8C00",
				100,
				"#FF2800",
			],
			"fill-opacity": 0.75,
		},
		filter: ["all", filterDate],
	});

	function getTimeCode(sliderVal) {
		const monthIndex = sliderVal % 12 ? (sliderVal % 12).toString() : "12";
		const year = Math.floor(sliderVal / 12.1) + 16;
		const time = monthIndex < 10 ? new TimeCode(new Date(`20${year}-0${monthIndex}`)) : new TimeCode(new Date(`20${year}-${monthIndex}`))

		return time;
	}

	// update hour filter when the slider is dragged
	document.getElementById("slider").addEventListener("input", (event) => {
		let timeCode = getTimeCode(event.target.value);

		window.render(timeCode.getTimeCode());

		// update the map
		updateMap(timeCode.date);


	});
});

/**
 * Updates the map to a given Date
 * @param {Date} date Date to update the map to
 */
function updateMap(date) {
	// Make a TimeCode from the date given
	let timeCode = new TimeCode(date);

	//Generate the filter
	filter = [
		"==",
		["string", ["get", "month_year"]],
		timeCode.getFilterCode(),
	];

	map.setFilter("beds", ["all", filter]);

		// update text in the UI
	document.getElementById("smallDate").innerText = timeCode.getString();
	document.getElementById("largeDate").innerText = timeCode.getString();
	slider.value = timeCode.getSliderVal()
}

window.updateMap = updateMap;

//Hover popups
const popup = new mapboxgl.Popup({
	closeButton: false,
	closeOnClick: false,
});

map.on("mousemove", "beds", (event) => {
	map.getCanvas().style.cursor = "pointer";
	popup.setLngLat(event.lngLat).setHTML(popupHTML(event)).addTo(map);
});

map.on("mouseleave", "beds", (event) => {
	map.getCanvas().style.cursor = "";
	popup.remove();
});

//Animation
let interval = null;

document.getElementById("btnPlay").addEventListener("click", () => {
	interval = setInterval(() => {
		document.getElementById("slider").value =
			parseInt(document.getElementById("slider").value) + 1;
		document.getElementById("slider").dispatchEvent(new Event("input"));
	}, 1000);
});

document.getElementById("btnPause").addEventListener("click", () => {
	clearInterval(interval);
});
