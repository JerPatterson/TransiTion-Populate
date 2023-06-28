import fetch from 'node-fetch'
import { readFile } from './file.mjs';
import { AGENCY } from './agency_specific.const.mjs'

export async function stopPopulate() {
    let trips = await readFile("./assets/trips.txt", "route_id");
    trips.pop();

    // route_id: string;  
    // service_id: string;  
    // trip_id: string;  
    // trip_headsign: string;  
    // trip_short_name: string;  
    // direction_id: number;  
    // block_id: string;  
    // shape_id: string;  
    // wheelchair_accessible: number;  
    // bikes_allowed: number;

    trips = trips.map((trip) => {
        return {
            ...trip,
            route_id: trip.route_id.replace('JUIN23', ''),
            shape_id: trip.shape_id.replace('JUIN23', ''),
            direction_id: Number(trip.direction_id),
            wheelchair_accessible: Number(trip.wheelchair_boarding),
            bikes_allowed: Number(trip.bikes_allowed),
        }
    });

    const chunkSize = 10000;
    for (let i = 0; i < trips.length / chunkSize; ++i) {
        const response = await fetch(`http:/127.0.0.1:3000/trips/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 'data-type': 'json' },
            body: JSON.stringify(trips.slice(i * chunkSize, Math.min((i + 1) * chunkSize), trips.length)),
        });
        await new Promise(r => setTimeout(r, 1000));
        console.log(`Chunk #${i}`);
        console.log(response.status);
    }
}

await stopPopulate();
