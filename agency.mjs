import fetch from 'node-fetch'
import { readFile } from './file.mjs';

export async function agencyPopulate() {
    const resAgency = await readFile("./assets/agency.txt", "agency_id");
    resAgency.pop();

    resAgency.forEach(async (agency) => {
        const response = await fetch('http:/127.0.0.1:3000/agencies', {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(agency)
        });

        console.log(response.status);
    })
}

await agencyPopulate();
