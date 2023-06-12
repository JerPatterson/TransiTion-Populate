import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stl';

export async function stopPopulate() {
    const stops = await readFile("./assets/stops.txt", "stop_id");
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

    stops.forEach(async (stop) => {
        const newStop = {
            ...stop,
            stop_lat: Number(stop.stop_lat),
            stop_lon: Number(stop.stop_lon),
            location_type: Number(stop.location_type),
            wheelchair_boarding: Number(stop.wheelchair_boarding),
            stop_shelter: Boolean(stop.stop_abribus),
            stop_display: Boolean(stop.stop_display),
        }

        const response = await fetch(`http:/127.0.0.1:3000/stops/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(newStop)
        });

        console.log(response.status);
    })
}

await stopPopulate();
