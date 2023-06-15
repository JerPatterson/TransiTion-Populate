import fetch from 'node-fetch'
import { readFile } from './file.mjs';
import { AGENCY } from './agency_specific.const.mjs'

export async function shapePopulate() {
    let shapes = await readFile("./assets/shapes.txt", "shape_id");
    shapes.pop();

    //   shape_id: string;
    //   shape_pt_lat: number;
    //   shape_pt_lon: number;
    //   shape_pt_sequence: number;
    //   shape_dist_traveled: number;

    shapes = shapes.map((elem) => {
        return {
            shape_id: elem.shape_id.replace('MARS23', ''),
            shape_pt_lat: parseFloat(elem.shape_pt_lat),
            shape_pt_lon: parseFloat(elem.shape_pt_lon),
            shape_pt_sequence: Number(elem.shape_pt_sequence),
            shape_dist_traveled: Number(elem.shape_dist_traveled),
        }
    });

    const chunkSize = 500;
    for (let i = 0; i < shapes.length / chunkSize; ++i) {
        const response = await fetch(`http:/127.0.0.1:3000/shapes/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json', 'data-type': 'json' },
            body: JSON.stringify(shapes.slice(i * chunkSize, Math.min((i + 1) * chunkSize), shapes.length)),
        });
        await new Promise(r => setTimeout(r, 100));
        console.log(`Chunk #${i}`);
        console.log(response.status);
    }
}

await shapePopulate();
