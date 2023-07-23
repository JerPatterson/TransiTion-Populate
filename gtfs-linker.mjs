import { AGENCY_ID } from "./constants.mjs";
import { GTFSParser } from './gtfs-parser.mjs';

export class GTFSLinker {
    #fileParser = new GTFSParser();
    #baseFilePath = `./assets/${AGENCY_ID}`;

    async getRouteIdsByStopId() {
        const routeIdsByStopId = new Map();
        const stopIdsByRouteId = await this.getStopIdsByRouteId();
        stopIdsByRouteId.forEach((stopIds, routeId) => {
            [...stopIds].forEach((stopId) => {
                if (routeIdsByStopId.has(stopId)) {
                    const routeIdsFromStop = routeIdsByStopId.get(stopId);
                    routeIdsFromStop.push(routeId);
                    routeIdsByStopId.set(stopId, routeIdsFromStop);
                } else {
                    routeIdsByStopId.set(stopId, [routeId]);
                }
            });
        });

        return routeIdsByStopId;
    }

    async getStopIdsByRouteId() {
        const stopIdsByRouteId = new Map();
        const stopIdsByTripId = await this.#getStopIdsByTripId();
        const trips = await this.#fileParser.getContent(`${this.#baseFilePath}/trips.txt`);
        trips.forEach((trip) => {
            const routeId = trip.route_id;
            const stopIdsFromTrip = stopIdsByTripId.get(trip.trip_id);
            if (stopIdsByRouteId.has(routeId)) {
                const stopIdsFromRoute = stopIdsByRouteId.get(routeId);
                stopIdsByRouteId.set(routeId, new Set([...stopIdsFromRoute, ...stopIdsFromTrip]));
            } else {
                stopIdsByRouteId.set(routeId, new Set([...stopIdsFromTrip]));
            }
        });

        return stopIdsByRouteId;
    }

    async #getStopIdsByTripId() {
        const stopIdsByTripId = new Map();
        const times = await this.#fileParser.getContent(`${this.#baseFilePath}/stop_times.txt`);
        times.forEach((time) => {
            const tripId = time.trip_id;
            if (stopIdsByTripId.has(tripId)) {
                const stopIds = stopIdsByTripId.get(tripId);
                stopIds.add(time.stop_id);
                stopIdsByTripId.set(tripId, stopIds);
            } else {
                stopIdsByTripId.set(tripId, new Set([time.stop_id]));
            }
        });

        return stopIdsByTripId;
    }
}
