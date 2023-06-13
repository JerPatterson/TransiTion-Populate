import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stl';

export async function calendarPopulate() {
    const calendar = await readFile("./assets/calendar.txt", "service_id");
    calendar.pop();

    // agency_id: string;
    // service_id: string;
    // monday: boolean;
    // tuesday: boolean;
    // wednesday: boolean;
    // thursday: boolean;
    // friday: boolean;
    // saturday: boolean;
    // sunday: boolean;
    // start_date: Date;
    // end_date: Date;

    calendar.forEach(async (elem) => {
        const newCalendar = {
            ...elem,
            monday: Boolean(elem.monday),
            tuesday: Boolean(elem.tuesday),
            wednesday: Boolean(elem.wednesday),
            thursday: Boolean(elem.thursday),
            friday: Boolean(elem.friday),
            saturday: Boolean(elem.saturday),
            sunday: Boolean(elem.sunday),
            start_date: new Date(elem.start_date.slice(0, 4), Number(elem.start_date.slice(4, 6)) - 1, elem.start_date.slice(6)),
            end_date: new Date(elem.end_date.slice(0, 4), Number(elem.end_date.slice(4, 6)) - 1, elem.end_date.slice(6)),
        }

        const response = await fetch(`http:/127.0.0.1:3000/services/calendar/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(newCalendar)
        });

        console.log(response.status);
    })
}

await calendarPopulate();
