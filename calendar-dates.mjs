import fetch from 'node-fetch'
import { readFile } from './file.mjs';

const AGENCY = 'stm';

export async function routePopulate() {
    const calendarDates = await readFile("./assets/calendar_dates.txt", "service_id");
    calendarDates.pop();

    // agency_id: string;
    // service_id: string;
    // date: Date;
    // exception_type: number;

    calendarDates.forEach(async (elem) => {
        const newCalendarDate = {
            ...elem,
            date: new Date(elem.date.slice(0, 4), Number(elem.date.slice(4, 6)) - 1, elem.date.slice(6)).getTime(),
            exception_type: Number(elem.exception_type),
        }
        
        console.log(newCalendarDate);

        const response = await fetch(`http:/127.0.0.1:3000/services/calendar/dates/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(newCalendarDate),
        });

        console.log(response.status);
    });
}

await routePopulate();
