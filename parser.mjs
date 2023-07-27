import fs from 'fs';
import { AGENCY_ID, LINE_DELIMITER, VALUE_DELIMITER } from './constants.mjs';

export class Parser {
    #basePath = `./assets/${AGENCY_ID}`

    getAgencies() {
        return this.#readFile(`${this.#basePath}/agency.txt`);
    }

    getCalendarDates() {
        return this.#readFile(`${this.#basePath}/calendar_dates.txt`);
    }

    getCalendars() {
        return this.#readFile(`${this.#basePath}/calendar.txt`);
    }

    getRoutes() {
        return this.#readFile(`${this.#basePath}/routes.txt`);
    }

    getShapes() {
        return this.#readFile(`${this.#basePath}/shapes.txt`);
    }

    getStops() {
        return this.#readFile(`${this.#basePath}/stops.txt`);
    }

    getTimes() {
        return this.#readFile(`${this.#basePath}/stop_times.txt`);
    }

    getTrips() {
        return this.#readFile(`${this.#basePath}/trips.txt`);
    }

    #readFile(path) {
        const lines = this.#getFileLines(path);
        const params = lines[0].split(VALUE_DELIMITER);
        params[0] = this.#getFirstParamFromFilePath(path);

        return lines.slice(1, -1)
            .map((line) => {
                const result = {};

                const values = line.split(VALUE_DELIMITER);
                values.forEach((value, index) => {
                    result[params[index]] = value;
                });

                return this.#setAttributeTypes(path, result);
            });
    }

    #getFileLines(path) {
        return fs.readFileSync(path).toLocaleString().split(LINE_DELIMITER);
    }

    #getFirstParamFromFilePath(path) {
        const fileName = path.split('/').pop();
        switch (fileName) {
            case 'agency.txt':
                return 'agency_id';
            case 'calendar.txt':
            case 'calendar_dates.txt':
                return 'service_id';
            case 'routes.txt':
                return 'route_id';
            case 'shapes.txt':
                return 'shape_id';
            case 'stop_times.txt':
                return 'trip_id';
            case 'stops.txt':
                return 'stop_id';
            case 'trips.txt':
                return 'route_id';
        }
    }

    #setAttributeTypes(path, object) {
        const fileName = path.split('/').pop();
        switch (fileName) {
            case 'agency.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                };
            case 'calendar.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    monday: Number(object.monday),
                    tuesday: Number(object.tuesday),
                    wednesday: Number(object.wednesday),
                    thursday: Number(object.thursday),
                    friday: Number(object.friday),
                    saturday: Number(object.saturday),
                    sunday: Number(object.sunday),
                    start_date: this.#fomatDate(object.start_date).getTime(),
                    end_date: this.#fomatDate(object.end_date).getTime(),
                }
            case 'calendar_dates.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    date: this.#fomatDate(object.date).getTime(),
                    exception_type: Number(object.exception_type),
                };
            case 'routes.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    route_type: Number(object.route_type),
                    route_sort_order: Number(object.route_sort_order),
                    continuous_pickup: Number(object.continuous_pickup),
                    continuous_drop_off: Number(object.continuous_drop_off),
                    wheelchair_boarding: 0,
                    night_only: 0,
                };
            case 'shapes.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    shape_pt_lat: parseFloat(object.shape_pt_lat),
                    shape_pt_lon: parseFloat(object.shape_pt_lon),
                    shape_pt_sequence: Number(object.shape_pt_sequence),
                    shape_dist_traveled: parseFloat(object.shape_dist_traveled),
                };
            case 'stop_times.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    stop_sequence: Number(object.stop_sequence),
                    pickup_type: Number(object.pickup_type),
                    drop_off_type: Number(object.drop_off_type),
                    continuous_pickup: Number(object.continuous_pickup),
                    continuous_drop_off: Number(object.continuous_drop_off),
                    shape_dist_traveled: parseFloat(object.shape_dist_traveled),
                    timepoint: Number(object.timepoint),
                }
            case 'stops.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    stop_lat: Number(object.stop_lat),
                    stop_lon: Number(object.stop_lon),
                    location_type: Number(object.location_type),
                    wheelchair_boarding: Number(object.wheelchair_boarding),
                    stop_shelter: Number(object.stop_abribus),
                };
            case 'trips.txt':
                return {
                    ...object,
                    agency_id: AGENCY_ID,
                    direction_id: Number(object.direction_id),
                    wheelchair_accessible: Number(object.wheelchair_accessible),
                    bikes_allowed: Number(object.bikes_allowed),
                }
        }
    }

    #fomatDate(dateString) {
        const year = Number(dateString.slice(0, 4));
        const month = Number(dateString.slice(4, 6)) - 1;
        const date = Number(dateString.slice(6));

        return new Date(year, month, date);
    }
}
