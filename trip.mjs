import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stl';

export async function stopPopulate() {
    const trips = await readFile("./assets/trips.txt", "route_id");
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

    trips.map(async (trip) => {
        return {
            ...trip,
            direction_id: Number(trip.direction_id),
            wheelchair_accessible: Number(trip.wheelchair_boarding),
            bikes_allowed: Number(trip.bikes_allowed),
        }
    })

    const chunkSize = 500;
    for (let i = 0; i < trips.length / chunkSize; ++i) {
        await fetch(`http:/127.0.0.1:3000/trips/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 'data-type': 'json' },
            body: JSON.stringify(trips.slice(i * chunkSize, Math.min((i + 1) * chunkSize), trips.length)),
        });
        await new Promise(r => setTimeout(r, 100));
        console.log(`Chunk #${i}`)
    }
}

await stopPopulate();