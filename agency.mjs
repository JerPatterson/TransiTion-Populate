import fetch from 'node-fetch'
import fs from 'fs'

const LINE_DELIMITER = '\r\n';
const VALUE_DELIMITER = ',';

async function readFile(path, firstParam) {
    const content = fs.readFileSync(path).toLocaleString();
    const parameters = content.split(LINE_DELIMITER, 1)[0].split(VALUE_DELIMITER);
    parameters[0] = firstParam;

    return content.split(LINE_DELIMITER).slice(1).map((line) => {
        const result = Object();
        line.split(VALUE_DELIMITER).forEach((value, index) => {
        result[parameters[index]] = value;
        });
        return result;
    });
}

const resAgency = await readFile("./assets/agency.txt", "agency_id");
resAgency.pop();

resAgency.forEach(async (agency) => {
    const response = await fetch('http:/127.0.0.1:3000/agencies', {
        method: 'PUT',
        headers: { 'Content-type': 'application/json' },
        body: JSON.stringify(agency)
    });

    console.log(response);
})

