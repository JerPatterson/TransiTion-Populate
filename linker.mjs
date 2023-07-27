import { Parser } from './parser.mjs';

export class Linker {
    #parser = new Parser();

    getRouteIdsByStopId() {
        const routeIdsByStopId = new Map();
        
        this.getStopIdsByRouteId()
            .forEach((stopIds, routeId) => {
                [...stopIds].forEach((stopId) => {
                    const routeIds = routeIdsByStopId.has(stopId) ?
                        routeIdsByStopId.get(stopId) : [];
                    routeIdsByStopId.set(stopId, routeIds.concat([routeId]))
                });
            });

        return routeIdsByStopId;
    }

    getStopIdsByRouteId() {
        const stopIdsByRouteId = new Map();
        const stopIdsByTripId = this.#getStopIdsByTripId();

        this.#parser.getTrips().forEach((trip) => {
            if (!stopIdsByTripId.has(trip.trip_id)) return;
            const stopIdsFromTrip = stopIdsByTripId.get(trip.trip_id);
        
            const routeId = trip.route_id;
            const stopIds = stopIdsByRouteId.has(routeId) ?
                new Set([...stopIdsFromTrip, ...stopIdsByRouteId.get(routeId)]) : stopIdsFromTrip;
            stopIdsByRouteId.set(routeId, stopIds);
        });

        return stopIdsByRouteId;
    }

    #getStopIdsByTripId() {
        const stopIdsByTripId = new Map();

        this.#parser.getTimes().forEach((time) => {
            const tripId = time.trip_id;
            const stopIds = stopIdsByTripId.has(tripId) ?
                stopIdsByTripId.get(tripId) : new Set();
            stopIds.add(time.stop_id);
            stopIdsByTripId.set(tripId, stopIds);
        });

        return stopIdsByTripId;
    }
}
