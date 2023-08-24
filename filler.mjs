import fetch from "node-fetch";
import { AGENCY_ID } from "./constants.mjs";
import { Formatter } from "./formatter.mjs";

const SKIP_LINES = '\n\n\n'

export class Filler {
    #formatter = new Formatter();
    #serverURL = 'http://127.0.0.1:3000';

    constructor(formatter) {
        this.#formatter = formatter;
    }

    async sendAgencies() {
        const agencies = this.#formatter.getAgencies();
        console.log('\n\nSending agency.txt...')
        await this.#sendDataByObj(`agencies`, agencies);
    }

    async sendCalendarDates() {
        const calendarDates = this.#formatter.getCalendarDates();
        console.log('\n\nSending calendar_dates.txt...')
        await this.#sendDataByObj(`services/calendar/dates/${AGENCY_ID}`, calendarDates);
    }

    async sendCalendars() {
        const calendars = this.#formatter.getCalendars();
        console.log('\n\nSending calendar.txt...')
        await this.#sendDataByObj(`services/calendar/${AGENCY_ID}`, calendars);
    }

    async sendRoutes() {
        const routes = this.#formatter.getRoutes();
        console.log('\n\nSending routes.txt...')
        await this.#sendDataByObj(`routes/${AGENCY_ID}`, routes);
    }

    async sendShapes() {
        const shapes = this.#formatter.getShapes();
        console.log('\n\nSending shapes.txt...')
        await this.#sendDataByObj(`shapes/${AGENCY_ID}`, shapes)
    }

    async sendStops() {
        const stops = this.#formatter.getStops();
        console.log('\n\nSending stops.txt...')
        await this.#sendDataByChunk(`stops/${AGENCY_ID}`, stops);
    }

    async sendTimes() {
        const times = this.#formatter.getTimes();
        console.log('\n\nSending stop_times.txt...')
        await this.#sendDataByChunk(`times/${AGENCY_ID}`, times);
    }

    async sendTrips() {
        const trips = this.#formatter.getTrips();
        console.log('\n\nSending trips.txt...');
        await this.#sendDataByChunk(`trips/${AGENCY_ID}`, trips);
    }


    async #sendDataByObj(route, objects) {
        let errorReport = SKIP_LINES;
        const lastIndex = objects.length - 1;

        await Promise.all(objects.map(async (object, index) => {
            const response = await this.#sendData(route, object);
            if (response.ok) {
                console.log(`${index}/${lastIndex} -> OK`);
            } else {
                const errorText = `${index}/${lastIndex} -> ${response.status} : ${response.statusText}`;
                errorReport += errorReport + '\n';
                console.log(errorText);
            }

            return response;
        }));

        errorReport = '\nDone. ' + (errorReport.length === SKIP_LINES.length ? 'Everything worked' : 'Errors occured.');
        console.log(errorReport);
    }

    async #sendDataByChunk(route, objects, chunkSize) {
        if (!chunkSize) chunkSize = 300;

        let errorReport = SKIP_LINES;
        const lastIndex = Math.ceil(objects.length / chunkSize) - 1;

        for (let i = 0; i <= lastIndex; ++i) {
            let chunk = objects.slice(i * chunkSize, Math.min((i + 1) * chunkSize), objects.length);
            let response = await this.#sendData(route, chunk);

            if (response.ok) {
                console.log(`${i}/${lastIndex} -> OK`);
            } else {
                const errorText = `${i}/${lastIndex} -> ${response.status} : ${response.statusText}`;
                errorReport += errorReport + '\n';
                console.log(errorText);
            }

            await this.#delay();
        }

        errorReport = '\nDone. ' + (errorReport.length === SKIP_LINES.length ? 'Everything worked' : 'Errors occured.');
        console.log(errorReport);
    }

    async #sendData(route, data) {
        return fetch(`${this.#serverURL}/${route}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(data),
        });
    }

    async #delay() {
        return new Promise(r => setTimeout(r, 200));
    }
}
