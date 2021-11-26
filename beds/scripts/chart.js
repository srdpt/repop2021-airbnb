// set the dimensions and margins of the graph
const margin = { top: 10, right: 30, bottom: 30, left: 60 },
	width = 400 - margin.left - margin.right,
	height = 400 - margin.top - margin.bottom;

// append the svg object to the body of the page
const svg = d3
	.select("#chart")
	.append("svg")
	.attr("width", width + margin.left + margin.right)
	.attr("height", height + margin.top + margin.bottom)
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top})`);

//Read the data
d3.csv("totalBeds.csv").then(
	// Now I can use this dataset:
	function (data) {
		let bisector = d3.bisector((d) => {
			return new Date(d.key_0);
		}).center;

		// Add X axis --> it is a date format
		const xAxis = d3
			.scaleTime()
			.domain(
				d3.extent(data, function (d) {
					return new Date(d.key_0);
				})
			)
			.range([0, width]);
		svg.append("g")
			.attr("transform", `translate(0, ${height})`)
			.call(d3.axisBottom(xAxis));

		// Add Y axis
		const yAxis = d3
			.scaleLinear()
			.domain([
				0,
				d3.max(data, function (d) {
					return +d.accommodates;
				}),
			])
			.range([height, 0]);
		svg.append("g").call(d3.axisLeft(yAxis));

		// Add the line
		svg.append("path")
			.datum(data)
			.attr("class", "line")
			.attr("fill", "none")
			.attr("stroke", "red")
			.attr("stroke-width", 3)
			.attr(
				"d",
				d3
					.line()
					.x(function (d) {
						return xAxis(new Date(d.key_0));
					})
					.y(function (d) {
						return yAxis(d.accommodates);
					})
			);

		//Empty circle to be replaced
		svg.append("circle").attr("class", "circle");

		function render(timeCode) {
			let circle = d3
				.select(".circle")
				.data([data[bisector(data, new Date(timeCode))]]);

			circle.enter().append("circle");

			circle
				.attr("class", "circle")
				.attr("fill", "blue")
				.attr("cx", function (d) {
					return xAxis(new Date(timeCode));
				})
				.attr("cy", function (d) {
					return yAxis(d.accommodates);
				})
				.attr("r", function (d) {
					return 7;
				});

			circle.exit().remove();
		}

		//Chart Hover handler
		d3.select("#chart").on("mousemove", (e) => {
			var pos = d3.pointer(e, svg.node());
			var x = pos[0];
			var time = xAxis.invert(x);

			//Earliest data we have
			if (
				time >= new Date("2016-01") &&
				time < new Date(data[data.length - 1].key_0) 
			) {
				render(time);

				//Fix for hover issue. Possible to hover over a peak, but show data for the month before
				//This essentially rounds to the nearest month
				if(time.getDate() > 15){
					time.setMonth(time.getMonth()+1)
				}

				window.updateMap(time)
			}
		});

		window.render = render;
	}
);
