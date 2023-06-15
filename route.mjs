import fetch from 'node-fetch'
import { readFile } from './file.mjs';
import { AGENCY } from './agency_specific.const.mjs'

export async function routePopulate() {
    const routes = await readFile("./assets/routes.txt", "route_id");
    routes.pop();

    // route_id: string;
    // agency_id: string;  
    // route_short_name: string;  
    // route_long_name: string;  
    // route_desc: string;  
    // route_type: number;  
    // route_url: string;  
    // route_color: string;  
    // route_text_color: string;  
    // route_sort_order: number;  
    // continuous_pickup: number;  
    // continuous_drop_off: number;  
    // wheelchair_boarding: number;

    routes.forEach(async (route) => {
        const newRoute = {
            ...route,
            route_id: route.route_id.replace('MARS23', ''),
            route_type: Number(route.route_type),
            route_sort_order: Number(route.route_sort_order),
            continuous_pickup: Number(route.continuous_pickup),
            continuous_drop_off: Number(route.continuous_drop_off),
            wheelchair_boarding: route.wheelchair_boarding === '1' ? 1 : 2,
            night_only: route.night === '1',
        }

        const response = await fetch(`http:/127.0.0.1:3000/routes/${AGENCY}`, {
            method: 'PUT',
            headers: { 'Content-type': 'application/json' },
            body: JSON.stringify(newRoute)
        });

        console.log(response.status);
    })
}

await routePopulate();
