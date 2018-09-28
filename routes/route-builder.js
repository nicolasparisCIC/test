const _ = require('underscore'),
	moment = require('moment');

const avgSpeedInKmh = 60,
	reportScheduleInMins = 15;


const routeFile = process.argv[2];
//console.log('Parsing %s', routeFile);

const routeData = require('./' + routeFile);
let allData = [];
_.each(routeData, (legData) => {
	allData = allData.concat(computeLeg(legData));
});

console.log('%j', allData);

function computeLeg(legData) {

	// Make sure computed route exists
	let computedRoute;
	try {
		computedRoute = require('./' + legData.start + '-' + legData.end + '.json');
	} catch (e) {
		console.error('No computed route exists between %s and %s, aborting', legData.start, legData.end);
		process.exit(-1);
		return;
	}
	let data = [];

	// Lets go
	const wayPoints = computedRoute.response.route[0].shape;

	const distanceInKms = computedRoute.response.route[0].summary.distance;

	// There should be
	//const nbOfPoints = Math.floor((distanceInKms / avgSpeedInKmh) * (60 / reportScheduleInMins) + 1) - 2;

	// Keep first, last and re-arrange in between
	const first = wayPoints.shift(),
		last = wayPoints.pop();

	let filteredWayPoints = [first];
	wayPoints.forEach((val, i) => {
		if (i % 3 === 0) {
			filteredWayPoints.push(val);
		}
	});
	filteredWayPoints.push(last);


	//console.log('Found %d way points between %s and %s', wayPoints.length, legData.start, legData.end);

	const wayPointDate = toDate(legData.startDate);

	// Add some random data (+/- 5 mins)
	wayPointDate.setMinutes(wayPointDate.getMinutes() + (Math.random() * 10) - 5);
	_.each(filteredWayPoints, (wayPoint) => {
		const latLng = wayPoint.split(',');
		let status;
		if (legData.startStatus && legData.startStatus.marker !== 'green') {
			status = legData.startStatus;
		} else {
			status = {
				"marker": "blue",
				"description": "En transit"
			};
		}
		data.push({
			"lat": parseFloat(latLng[0]) + (Math.random() * 0.04) - 0.02,
			"lng": parseFloat(latLng[1]) + (Math.random() * 0.04) - 0.02,
			"date": fromDate(wayPointDate),
			"status": status
		});

		wayPointDate.setMinutes(wayPointDate.getMinutes() + legData.durationBetweenPointsInMins);
		// wayPointDate.setSeconds(wayPointDate.getSeconds() + (60 * Math.random()) - 30);
	});

	// Finally set status
	if (legData.startSite) {
		data[0].site = legData.startSite;
	}
	if (legData.startStatus) {
		data[0].status = legData.startStatus;
	}
	if (legData.endSite) {
		data[data.length - 1].site = legData.endSite;
	}
	if (legData.endStatus) {
		data[data.length - 1].status = legData.endStatus;
	}

	return data;
}


function toDate(dateString) {
	const m = moment(dateString, 'DD/MM/YYYY HH:mm');
	if (!m.isValid()) {
		throw new Error('Invalid date ' + dateString);
	}
	return m.toDate();
}

function fromDate(date) {
	return moment(date).format('DD/MM/YYYY HH:mm');
}