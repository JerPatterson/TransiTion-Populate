import fs from 'fs';
import { LINE_DELIMITER, VALUE_DELIMITER } from './constants.mjs';
import { GTFSParser } from './gtfs-parser.mjs';

const newServiceIds = new Set(
    (await new GTFSParser().getContent('./assets/stm/calendar.txt'))
        .filter((service) => Date.now() < service.end_date)
        .map((service) => service.service_id)
);

const serviceLines = fs.readFileSync('./assets/stm/calendar.txt')
    .toLocaleString()
    .split(LINE_DELIMITER)
    .slice(1, -1)
    .filter((line) => newServiceIds.has(line.split(VALUE_DELIMITER)[0]));


fs.writeFileSync(
    './assets/stm/calendar.txt',
    'service_id,monday,tuesday,wednesday,thursday,friday,saturday,sunday,start_date,end_date\n'
);

serviceLines.forEach((line) => {
    fs.writeFileSync(
        './assets/stm/calendar.txt',
        line + '\n',
        { flag: 'a+' },
    );
});

const tripLines = fs.readFileSync('./assets/stm/trips.txt')
    .toLocaleString()
    .split(LINE_DELIMITER)
    .slice(1, -1)
    .filter((line) => newServiceIds.has(line.split(VALUE_DELIMITER)[1]));

fs.writeFileSync(
    './assets/stm/trips.txt',
    'route_id,service_id,trip_id,trip_headsign,direction_id,shape_id,wheelchair_accessible,note_fr,note_en\n'
);

tripLines.forEach((line) => {
    fs.writeFileSync(
        './assets/stm/trips.txt',
        line + '\n',
        { flag: 'a+' },
    );
});

const newTripIds = new Set(
    (await new GTFSParser().getContent('./assets/stm/trips.txt'))
        .filter((trip) => newServiceIds.has(trip.service_id))
        .map((trip) => trip.trip_id)
);

const timeLines = fs.readFileSync('./assets/stm/stop_times.txt')
    .toLocaleString()
    .split(LINE_DELIMITER)
    .slice(1, -1)
    .filter((line) => newTripIds.has(line.split(VALUE_DELIMITER)[0]));

fs.writeFileSync(
    './assets/stm/stop_times.txt',
    'trip_id,arrival_time,departure_time,stop_id,stop_sequence\n'
);

timeLines.forEach((line) => {
    fs.writeFileSync(
        './assets/stm/stop_times.txt',
        line + '\n',
        { flag: 'a+' },
    );
});
