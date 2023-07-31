import { AGENCY_ID } from "./constants.mjs";
import { Filler } from "./filler.mjs";
import { Formatter } from "./formatter.mjs";
import { STLFormatter } from "./stl.formatter.mjs";
import { STMFormatter } from "./stm.formatter.mjs";

class Pipeline {
    #filler;

    constructor() {
        this.#filler = new Filler(this.#getFormatter());
    }

    async start() {
        console.log(`Going to populate the DB with '${AGENCY_ID}' static GTFS data...`);
        await this.#delay();

        // await this.#filler.sendAgencies();
        // await this.#filler.sendCalendars();
        // await this.#filler.sendCalendarDates();
        // await this.#filler.sendRoutes();
        // await this.#filler.sendStops();
        // await this.#filler.sendShapes();
        await this.#filler.sendTrips();
        // await this.#filler.sendTimes();
    }

    #getFormatter() {
        switch (AGENCY_ID) {
            case 'stl':
                return new STLFormatter();
            case 'stm':
                return new STMFormatter();
            default:
                return new Formatter();
        }
    }

    async #delay() {
        return new Promise(r => setTimeout(r, 200));
    }
}

await new Pipeline().start();
