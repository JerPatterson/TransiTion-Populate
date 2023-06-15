import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stl';

export async function stopPopulate() {
    let stops = await readFile("./assets/stops.txt", "stop_id");
    stops.pop();

    // agency_id: string;  
    // stop_id: string;  
    // stop_code: string;  
    // stop_name: string;  
    // stop_desc: string;  
    // stop_lat: number;  
    // stop_lon: number;  
    // zone_id: string;  
    // stop_url: string;  
    // location_type: number;
    // parent_station: string;  
    // stop_timezone: string;  
    // wheelchair_boarding: number;  
    // level_id: string;  
    // platform_code: string;  
    // stop_shelter: boolean;  
    // stop_display: boolean;

    stops = stops.map((stop) => {
        return {
            ...stop,
            stop_id: stop.stop_id.replace('MARS23', '').replace('CP', ''),
            stop_lat: Number(stop.stop_lat),
            stop_lon: Number(stop.stop_lon),
            location_type: Number(stop.location_type),
            wheelchair_boarding: Number(stop.wheelchair_boarding),
            stop_shelter: stop.stop_abribus === '1',
            stop_display: stop.stop_display === '1',
        };
    });

    stops = stops.filter((stop, i) => i > 0 ? stop.stop_code !== stops[i - 1].stop_code : true);

    const chunkSize = 200;
    for (let i = 0; i < stops.length / chunkSize; ++i) {
        const response = await fetch(`http:/127.0.0.1:3000/stops/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 'data-type': 'json' },
            body: JSON.stringify(stops.slice(i * chunkSize, Math.min((i + 1) * chunkSize), stops.length)),
        });
        await new Promise(r => setTimeout(r, 100));
        console.log(`Chunk #${i}`);
        console.log(response.status);
    }
}

await stopPopulate();
