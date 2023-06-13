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
            monday: elem.monday === '1',
            tuesday: elem.tuesday === '1',
            wednesday: elem.wednesday === '1',
            thursday: elem.thursday === '1',
            friday: elem.friday === '1',
            saturday: elem.saturday === '1',
            sunday: elem.sunday === '1',
            start_date: new Date(elem.start_date.slice(0, 4), Number(elem.start_date.slice(4, 6)) - 1, elem.start_date.slice(6)).getTime(),
            end_date: new Date(elem.end_date.slice(0, 4), Number(elem.end_date.slice(4, 6)) - 1, elem.end_date.slice(6)).getTime(),
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
