import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stl';

export async function timesPopulate() {
    let times = await readFile("./assets/stop_times.txt", "trip_id");
    times.pop();

    // trip_id: string;  
    // arrival_time: string;  
    // departure_time: string;  
    // stop_id: string;  
    // stop_sequence: number;  
    // stop_headsign: string;  
    // pickup_type: number;  
    // drop_off_type: number;  
    // continuous_pickup: number;  
    // continuous_drop_off: number;  
    // shape_dist_traveled: number;  
    // timepoint: number;

    times = times.map((time) => {
        return {
            ...time,
            trip_id: time.trip_id.replace('MARS23', ''),
            stop_id: time.stop_id.replace('MARS23', '').replace('CP', ''),
            stop_sequence: Number(time.stop_sequence),
            pickup_type: Number(time.pickup_type),
            drop_off_type: Number(time.drop_off_type),
            continuous_pickup: Number(time.continuous_pickup),
            continuous_drop_off: Number(time.continuous_drop_off),
            shape_dist_traveled: Number(time.shape_dist_traveled),
            timepoint: Number(time.timepoint),
        };
    });

    const chunkSize = 200;
    for (let i = 284; i < times.length / chunkSize; ++i) {
        const response = await fetch(`http:/127.0.0.1:3000/times/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 'data-type': 'json' },
            body: JSON.stringify(times.slice(i * chunkSize, Math.min((i + 1) * chunkSize), times.length)),
        });
        await new Promise(r => setTimeout(r, 300));
        console.log(`Chunk #${i}`);
        console.log(response.status);
    }
}

await timesPopulate();
