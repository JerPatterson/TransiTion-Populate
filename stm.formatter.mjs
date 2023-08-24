import { Formatter } from './formatter.mjs';
import { STM_HEADSIGNS } from './stm.headsigns.mjs';

const NIGHT_ROUTE_COLOR = '626466';
const EXPRESS_ROUTE_COLOR = 'd92f80';
const NAVETTE_ROUTE_COLOR = '7b287c';

export class STMFormatter extends Formatter {
    getAgencies() {
        const agencies = super.getAgencies();

        return agencies.map((agency) => {
            return {
                ...agency,
                agency_name: 'Société de transport de Montréal',
            }
        })
    }

    getRoutes() {
        const routes = super.getRoutes();

        return routes.map((route) => {
            return {
                ...route,
                continuous_pickup: 1,
                continuous_drop_off: 1,
                route_color: this.#getRouteColor(route),
                route_text_color: this.#getRouteTextColor(route),
                night_only: this.#isNightRoute(route.route_id) ? 1 : 0,
            }
        });
    }

    getTrips() {
        const trips = super.getTrips();

        return trips.map((trip, i) => {
            return {
                ...trip,
                bikes_allowed: 2,
                trip_headsign: this.#updateTripHeadsign(
                    trip.trip_headsign,
                    trip.note_fr,
                    i,
                ),
            }
        });
    }


    #getRouteColor(route) {
        if (this.#isNightRoute(route.route_id)) return NIGHT_ROUTE_COLOR;
        if (this.#isExpressRoute(route.route_id)) return EXPRESS_ROUTE_COLOR;
        if (this.#isNavetteRoute(route.route_id)) return NAVETTE_ROUTE_COLOR;
        return route.route_color;
    }

    #getRouteTextColor(route) {
        if (this.#isNightRoute(route.route_id)) return 'ffffff';
        if (this.#isNavetteRoute(route.route_id)) return 'ffffff';
        return '000000';
    }
    
    #isNightRoute(routeId) {
        return routeId.length === 3 && routeId[0] === '3';
    }

    #isExpressRoute(routeId) {
        return routeId.length === 3 && routeId[0] === '4';
    }

    #isNavetteRoute(routeId) {
        return routeId.length === 3 && ['7', '8', '9'].includes(routeId[0])
    }

    #updateTripHeadsign(headsign, note) {
        let headsigns = this.#deepcopy(STM_HEADSIGNS.get(headsign));
        if (note) {
            const wantedWords = note.toLowerCase().split(' ');
            headsigns = headsigns.sort((a, b) => this.#getWantedWordsDifference(wantedWords, a, b));
        }

        return headsigns.shift();
    }

    #deepcopy(array) {
        return JSON.parse(JSON.stringify(array));
    }

    #getWantedWordsDifference(wantedWords, sentenceA, sentenceB) {
        return this.#getWantedWordsCount(wantedWords, sentenceB)
            - this.#getWantedWordsCount(wantedWords, sentenceA);
    }

    #getWantedWordsCount(wantedWords, sentence) {
        let count = 0;
        sentence.toLowerCase()
            .replace('(', '')
            .replace(')', '')
            .split(' ')
            .forEach((word) => {
                if (wantedWords.includes(word)) ++count;
            });

        return count;
    }
}
