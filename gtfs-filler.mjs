import fetch from "node-fetch";
import { AGENCY_ID } from "./constants.mjs";
import { GTFSFileParser } from "./gtfs-parser.mjs";

export class GTFSFiller {
    #fileParser = new GTFSFileParser();
    #baseFilePath = `./assets/${AGENCY_ID}`;
    #serverURL = 'http://127.0.0.1:3000';

    async sendAgencies() {
        const agencies = await this.#fileParser.getContent(`${this.#baseFilePath}/agency.txt`);
        await this.#sendDataByObj(`agencies/${AGENCY_ID}`, agencies);
        console.log('Done');
    }

    async sendCalendarDates() {
        const calendarDates = await this.#fileParser.getContent(`${this.#baseFilePath}/calendar_dates.txt`);
        await this.#sendDataByObj(`services/calendar/dates/${AGENCY_ID}`, calendarDates);
        console.log('Done');
    }

    async sendCalendars() {
        const calendars = await this.#fileParser.getContent(`${this.#baseFilePath}/calendar.txt`);
        await this.#sendDataByObj(`services/calendar/${AGENCY_ID}`, calendars);
        console.log('Done');
    }

    async sendRoutes() {
        const routes = await this.#fileParser.getContent(`${this.#baseFilePath}/routes.txt`);
        await this.#sendDataByObj(`routes/${AGENCY_ID}`, routes);
        console.log('Done');
    }

    async sendShapes() {
        const chunkSize = 500;
        const shapes = await this.#fileParser.getContent(`${this.#baseFilePath}/shapes.txt`);
        await this.#sendDataByChunk(`shapes/${AGENCY_ID}`, shapes, chunkSize);
        console.log('Done');
    }

    async sendTimes() {
        const times = await this.#fileParser.getContent(`${this.#baseFilePath}/stop_times.txt`);
        await this.#sendDataByChunk(`times/${AGENCY_ID}`, times);
        console.log('Done');
    }

    async sendStops() {
        const stops = await this.#fileParser.getContent(`${this.#baseFilePath}/stops.txt`);
        await this.#sendDataByChunk(`stops/${AGENCY_ID}`, stops);
        console.log('Done');
    }

    async sendTrips() {
        const trips = await this.#fileParser.getContent(`${this.#baseFilePath}/trips.txt`);
        await this.#sendDataByChunk(`trips/${AGENCY_ID}`, trips);
        console.log('Done');
    }

    async #sendDataByObj(route, objects) {
        await Promise.all(objects.map(async (object, index) => {
            const response = await this.#sendData(route, object);
            if (!response.ok) console.log(`${index} -> ${response.status}`);
            return response;
        }));
    }

    async #sendDataByChunk(route, objects, chunkSize) {
        if (!chunkSize) chunkSize = 300;
        for (let i = 0; i < objects.length / chunkSize; ++i) {
            let chunk = objects.slice(i * chunkSize, Math.min((i + 1) * chunkSize), objects.length);
            let response = await this.#sendData(route, chunk);
            if (!response.ok) console.log(`${index} -> ${response.status}`);
            await this.#delay();
        }
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

await new GTFSFiller().sendAgencies();