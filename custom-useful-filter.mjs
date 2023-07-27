import fs from 'fs';
import { AGENCY_ID, LINE_DELIMITER, VALUE_DELIMITER } from './constants.mjs';
import { GTFSParser } from './gtfs-parser.mjs';

const newServiceIds = new Set(
    (await new GTFSParser().getContent(`./assets/${AGENCY_ID}/calendar.txt`))
        .filter((service) => Date.now() < service.end_date)
        .map((service) => service.service_id)
);

const serviceFile = fs.readFileSync(`./assets/${AGENCY_ID}/calendar.txt`)
    .toLocaleString()
    .split(LINE_DELIMITER);

const serviceParams = serviceFile.shift();
const serviceLines = serviceFile.filter(
    (line) => newServiceIds.has(line.split(VALUE_DELIMITER)[serviceParams.indexOf('service_id')])
);


fs.writeFileSync(
    `./assets/${AGENCY_ID}/calendar.txt`,
    `${serviceParams}\n`
);

serviceLines.forEach((line) => {
    fs.writeFileSync(
        `./assets/${AGENCY_ID}/calendar.txt`,
        line + '\n',
        { flag: 'a+' },
    );
});

const tripFile = fs.readFileSync(`./assets/${AGENCY_ID}/trips.txt`)
    .toLocaleString()
    .split(LINE_DELIMITER);

const tripParams = tripFile.shift();
const tripLines = tripFile.filter(
    (line) => newServiceIds.has(line.split(VALUE_DELIMITER)[tripParams.indexOf('service_id')])
);

fs.writeFileSync(
    `./assets/${AGENCY_ID}/trips.txt`,
    `${tripParams}\n`
);

tripLines.forEach((line) => {
    fs.writeFileSync(
        `./assets/${AGENCY_ID}/trips.txt`,
        line + '\n',
        { flag: 'a+' },
    );
});

const newTripIds = new Set(
    (await new GTFSParser().getContent(`./assets/${AGENCY_ID}/trips.txt`))
        .filter((trip) => newServiceIds.has(trip.service_id))
        .map((trip) => trip.trip_id)
);

const timeFile = fs.readFileSync(`./assets/${AGENCY_ID}/stop_times.txt`)
    .toLocaleString()
    .split(LINE_DELIMITER);

const timeParams = timeFile.shift();
const timeLines = timeFile.filter(
    (line) => newTripIds.has(line.split(VALUE_DELIMITER)[timeParams.indexOf('trip_id')])
);

fs.writeFileSync(
    `./assets/${AGENCY_ID}/stop_times.txt`,
    `${timeParams}\n`
);

timeLines.forEach((line) => {
    fs.writeFileSync(
        `./assets/${AGENCY_ID}/stop_times.txt`,
        line + '\n',
        { flag: 'a+' },
    );
});
