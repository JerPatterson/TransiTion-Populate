import { Formatter } from './formatter.mjs';

const PREFIX = 'AOUT23';
const STOP_PREFIX = 'CP';
const NIGHT_ROUTE_IDS = ['2E', '2O', '345S', '345N'];
const ACCESSIBLE_ROUTE_IDS = [
    '2E', '2O', '46S', '46N', '16E', '16O', '48E', '48O', '20E', '20O', 
    '50E', '50O', '24E', '24O', '60E', '60O', '33S', '33N', '63S', '63N',
    '39S', '39N', '66E', '66O', '40E', '40O', '70E', '70O', '41S', '41N',
    '73S', '73N', '43S', '43N', '45S', '45N', '902S', '902N', '360N',
];

export class STLFormatter extends Formatter {
    getAgencies() {
        const agencies = super.getAgencies();

        return agencies.map((agency) => {
            return {
                ...agency,
                agency_name: 'Société de transport de Laval',
            }
        })
    }

    getRoutes() {
        const routes = super.getRoutes();

        return routes.map((route) => {
            const routeId = route.route_id.replace(PREFIX, '');
            return {
                ...route,
                route_id: routeId,
                continuous_pickup: 1,
                continuous_drop_off: 1,
                night_only: this.#isNightRoute(routeId) ? 1 : 0,
                wheelchair_boarding: this.#isAccessibleRoute(routeId) ? 1 : 2,
                stop_ids: route.stop_ids.map((stopId) => stopId.replace(PREFIX, '').stopId.replace(STOP_PREFIX, '')),
            }
        });
    }

    getShapes() {
        const shapes = super.getShapes()

        return shapes.map((shape) => {
            return {
                ...shape,
                shape_id: shape.shape_id.replace(PREFIX, ''),
            }
        });
    }

    getStops() {
        const stops = super.getStops();

        return this.#makeStopsUnique(stops
            .map((stop) => {
                return {
                    ...stop,
                    stop_id: stop.stop_id.replace(PREFIX, '').replace(STOP_PREFIX, ''),
                    route_ids: stop.route_ids.map((routeId) => routeId.replace(PREFIX, '')),
                }
            })
        );
    }

    getTimes() {
        const times = super.getTimes();

        return times.map((time) => {
            return {
                ...time,
                trip_id: time.trip_id.replace(PREFIX, ''),
                stop_id: time.stop_id.replace(PREFIX, '').replace(STOP_PREFIX, ''),
            }
        });
    }
 
    getTrips() {
        const trips = super.getTrips();

        return trips.map((trip) => {
            return {
                ...trip,
                trip_id: trip.trip_id.replace(PREFIX, ''),
                route_id: trip.route_id.replace(PREFIX, ''),
                shape_id: trip.shape_id.replace(PREFIX, ''),
                direction_id: this.#getDirectionId(trip.route_id),
                bikes_allowed: 1,
            }
        });
    }

    #makeStopsUnique(stops) {
        const uniqueStopIds = new Set();
        return stops.filter((stop) => {
            if (uniqueStopIds.has(stop.stop_id)) return false;
            uniqueStopIds.add(stop.stop_id);
            return true;
        });
    }

    #isNightRoute(routeId) {
        return NIGHT_ROUTE_IDS.includes(routeId);
    }

    #isAccessibleRoute(routeId) {
        return ACCESSIBLE_ROUTE_IDS.includes(routeId);
    }

    #getDirectionId(routeId) {
        return ['S', 'O'].includes(routeId.split()[-1]) ? 1 : 0
    }
}
