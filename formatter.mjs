import { AGENCY_ID } from "./constants.mjs";
import { Linker } from "./linker.mjs";
import { Parser } from "./parser.mjs";

const DEGREE_IN_HALF_A_CIRCLE = 180;
const LAT_DEGREE_TO_KM_CONSTANT = 110.574;
const LON_DEGREE_TO_KM_CONSTANT = 111.320;

export class Formatter {
    #parser = new Parser();
    #linker = new Linker();

    getAgencies() {
        const agencies = this.#parser.getAgencies();
        const networkExtent = this.#getAgencyNetworkExtent();
        return agencies.map((agency) => {
            return { ...agency, ...networkExtent }
        });
    }

    getCalendarDates() {
        const calendarDates = this.#parser.getCalendarDates();
        return calendarDates;
    }

    getCalendars() {
        const calendar = this.#parser.getCalendars();
        return calendar;
    }

    getRoutes() {
        const routes = this.#parser.getRoutes();
        const stopIdsByRouteId = this.#linker.getStopIdsByRouteId();
        return routes.map((route) => {
            return {
                ...route,
                stop_ids: stopIdsByRouteId.has(route.route_id) ? 
                    [...stopIdsByRouteId.get(route.route_id)] : [],
            };
        });
    }

    getShapes() {
        const shapes = this.#parser.getShapes();
        return this.#fomatShapes(shapes);
    }

    getStops() {
        const stops = this.#parser.getStops();
        const routeIdsByStopId = this.#linker.getRouteIdsByStopId();
        return stops.map((stop) => {
            return {
                ...stop,
                route_ids: routeIdsByStopId.has(stop.stop_id) ?
                    [...routeIdsByStopId.get(stop.stop_id)] : [],
            };
        });
    }

    getTimes() {
        return this.#parser.getTimes();
    }

    getTrips() {
        return this.#parser.getTrips();
    }


    #getAgencyNetworkExtent() {
        const shapes = this.#parser.getShapes();
        let min_lat = shapes[0].shape_pt_lat;
        let max_lat = shapes[0].shape_pt_lat;
        let min_lon = shapes[0].shape_pt_lon;
        let max_lon = shapes[0].shape_pt_lon;
        shapes.forEach((shape) => {
            if (min_lat > shape.shape_pt_lat) min_lat = shape.shape_pt_lat;
            else if (max_lat < shape.shape_pt_lat) max_lat = shape.shape_pt_lat;
            if (min_lon > shape.shape_pt_lon) min_lon = shape.shape_pt_lon;
            else if (max_lon < shape.shape_pt_lon) max_lon = shape.shape_pt_lon;
        });
    
        return { min_lat, max_lat, min_lon, max_lon };
    }


    #fomatShapes(shapes) {
        const shapesByShapeId = this.#getShapesByShapeIdMap(shapes);
        
        const formattedShapes = [];
        shapesByShapeId.forEach((shapes, shape_id) => {
            if (!shapes[shapes.length - 1].shape_dist_traveled)
                shapes = this.#computeShapesDistanceTraveled(shapes);

            formattedShapes.push({shape_id, agency_id: AGENCY_ID, shapes });
        });
    
        return formattedShapes;
    }

    #getShapesByShapeIdMap(shapes) {
        const shapesByShapeId = new Map();
        shapes.forEach((shape) => {
            const shapeId = shape.shape_id;
            const shapes = shapesByShapeId.has(shapeId) ? 
                shapesByShapeId.get(shapeId) : [];
            shapesByShapeId.set(shapeId, shapes.concat([this.#filterShape(shape)]));
        });

        return shapesByShapeId;
    }

    #filterShape(shape) {
        return {
            shape_pt_lat: shape.shape_pt_lat,
            shape_pt_lon: shape.shape_pt_lon,
            shape_pt_sequence: shape.shape_pt_sequence,
            shape_dist_traveled: shape.shape_dist_traveled,
        }
    }

    #computeShapesDistanceTraveled(shapes) {
        let shape_dist_traveled = 0;
        return shapes.map((shape, index, shapes) => {
            if (index)
                shape_dist_traveled += this.#getKilometersFromGeoDegrees(
                    { lat: shape.shape_pt_lat, lon: shape.shape_pt_lon },
                    { lat: shapes[index - 1].shape_pt_lat, lon: shapes[index - 1].shape_pt_lon },
                );

            return { ...shape, shape_dist_traveled }
        })
    }

    #getKilometersFromGeoDegrees(a, b) {
        return this.#getDistanceFromSides(
            (a.lat - b.lat) * LAT_DEGREE_TO_KM_CONSTANT,
            (a.lon - b.lon) * LON_DEGREE_TO_KM_CONSTANT
                * Math.cos(this.#getRadiansFromDegrees((a.lat + b.lat) / 2)),
        );
    }

    #getDistanceFromSides(adj, opp) {
        return Math.sqrt(Math.pow(adj, 2) + Math.pow(opp, 2));
    }

    #getRadiansFromDegrees(x) {
        return x * Math.PI / DEGREE_IN_HALF_A_CIRCLE;
    }
}
