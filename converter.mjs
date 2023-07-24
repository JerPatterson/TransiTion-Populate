import { AGENCY_ID } from "./constants.mjs";
import { STM_HEADSIGNS } from "./stm.mjs";

export const GTFSConverter = new Map();

const defaultShapesConverter = (shapes) => {
    const shapesByShapeId = new Map();
        shapes.forEach((shape) => {
            const shapeId = shape.shape_id;
            if (shapesByShapeId.has(shapeId)) {
                const shapesFromShapeId = shapesByShapeId.get(shapeId);
                shapesByShapeId.set(shapeId, shapesFromShapeId.concat([{
                    shape_pt_lat: shape.shape_pt_lat,
                    shape_pt_lon: shape.shape_pt_lon,
                    shape_pt_sequence: shape.shape_pt_sequence,
                    shape_dist_traveled: shape.shape_dist_traveled,
                }]));
            } else {
                shapesByShapeId.set(shapeId, [{
                    shape_pt_lat: shape.shape_pt_lat,
                    shape_pt_lon: shape.shape_pt_lon,
                    shape_pt_sequence: shape.shape_pt_sequence,
                    shape_dist_traveled: shape.shape_dist_traveled,
                }]);
            }
        });
        
        const arrayStyleShapes = [];
        shapesByShapeId.forEach((arrayStyleShape, shape_id) => {
            let totalDistance = 0;
            arrayStyleShapes.push({
                agency_id: AGENCY_ID,
                shape_id: shape_id,
                shapes: arrayStyleShape[0].shape_dist_traveled ?
                    arrayStyleShape :
                    arrayStyleShape.map((value, index, array) => {
                        if (index) totalDistance += computeDistanceFromDegrees(
                            array[index - 1].shape_pt_lat,
                            array[index - 1].shape_pt_lon,
                            value.shape_pt_lat,
                            value.shape_pt_lon
                        );
                        return {
                            ...value,
                            shape_dist_traveled: totalDistance,
                        }
                    }),
            })
        });

        return arrayStyleShapes;
}

const computeDistanceFromDegrees = (aLatitude, aLongitude, bLatitude, bLongitude) => {
    const LAT_DEGREE_TO_KM = 110.574;
    const LON_DEGREE_TO_KM = 111.320;
    const averageLatitute = (aLatitude + bLatitude) / 2;
    return Math.sqrt(
        Math.pow((aLatitude - bLatitude) * LAT_DEGREE_TO_KM, 2)
        + Math.pow((aLongitude - bLongitude)  * LON_DEGREE_TO_KM
            * Math.cos(averageLatitute * Math.PI / 180), 2)
    );
}


// Société de transport de Laval:
const stlPrefix = 'JUIN23';
const stlNightRoutes = ['2E', '2O', '345S', '345N'];
const stlAccessibleRoutes = [
    '2E', '2O', '46S', '46N', '16E', '16O', 
    '48E', '48O', '20E', '20O', '50E', '50O',
    '24E', '24O', '60E', '60O', '33S', '33N',
    '63S', '63N', '39S', '39N', '66E', '66O',
    '40E', '40O', '70E', '70O', '41S', '41N',
    '73S', '73N', '43S', '43N', '45S', '45N',
    '902S', '902N', '360N',
];

GTFSConverter.set('stl', {
    agency: (agencies) => {
        return agencies.map((agency) => {
            return {
                ...agency,
                agency_name: 'Société de transport de Laval'
            }
        })
    },

    calendar: (calendar) => calendar,
    calendarDates: (calendarDates) => calendarDates,
    
    routes: (routes) => {
        return routes.map((route) => {
            const routeId = route.route_id.replace(stlPrefix, '');
            return {
                ...route,
                route_id: routeId,
                continuous_pickup: 1,
                continuous_drop_off: 1,
                night_only: stlNightRoutes.includes(routeId) ? 1 : 0,
                wheelchair_boarding: stlAccessibleRoutes.includes(routeId) ? 1 : 0,
            }
        });
    },

    shapes: (shapes) => {
        return defaultShapesConverter(shapes).map((shape) => {
            return {
                ...shape,
                shape_id: shape.shape_id.replace(stlPrefix, ''),
            }
        });
    },

    stops: (stops) => {
        return stops.map((stop) => {
            return {
                ...stop,
                stop_id: stop.stop_id.replace(stlPrefix, '').replace('CP', ''),
            }
        })
    },

    times: (times) => {
        return times.map((time) => {
            return {
                ...time,
                trip_id: time.trip_id.replace(stlPrefix, ''),
                stop_id: time.stop_id.replace(stlPrefix, '').replace('CP', ''),
            }
        });
    },

    trips: (trips) => {
        return trips.map((trip) => {
            const routeId = trip.route_id.replace(stlPrefix, '');
            return {
                ...trip,
                trip_id: trip.trip_id.replace(stlPrefix, ''),
                route_id: routeId,
                direction_id: ['S', 'O'].includes(routeId[-1]) ? 1 : 0,
                bikes_allowed: 1,
                wheelchair_boarding: stlAccessibleRoutes.includes(routeId) ? 1 : 0,
            }
        });
    },
});


// Société de transport de Montréal:
const stmNightRouteFilter = (routeId) => routeId.length === 3 && routeId[0] === '3';
const stmExpressRouteFilter = (routeId) => routeId.length === 3 && routeId[0] === '4';
const stmNavetteRouteFilter = (routeId) => routeId.length === 3 && ['7', '8', '9'].includes(routeId[0]);

GTFSConverter.set('stm', {
    agency: (agencies) => agencies,
    calendar: (calendar) => calendar,
    calendarDates: (calendarDates) => calendarDates,
    
    routes: (routes) => {
        return routes.map((route) => {
            const routeId = route.route_id;
            return {
                ...route,
                route_id: routeId,
                continuous_pickup: 1,
                continuous_drop_off: 1,
                route_color: (() => {
                    if (stmNightRouteFilter(routeId)) return '626466';
                    if (stmExpressRouteFilter(routeId)) return 'd92f80';
                    if (stmNavetteRouteFilter(routeId)) return '7b287c';
                    return route.route_color;
                })(),
                rout_text_color: (() => {
                    if (stmNightRouteFilter(routeId)) return 'ffffff';
                    if (stmNavetteRouteFilter(routeId)) return 'ffffff';
                    return '000000';
                })(),
                night_only: stmNightRouteFilter(routeId) ? 1 : 0,
            }
        });
    },

    shapes: (shapes) => {
        return defaultShapesConverter(shapes);
    },

    stops: (stops) => stops,
    times: (times) => times,

    trips: (trips) => {
        return trips.map((trip, i) => {
            return {
                ...trip,
                trip_headsign: (() => {
                    const headsigns = STM_HEADSIGNS.get(trip.trip_headsign);
                    if (trip.note_fr) {
                        const wantedWords = trip.note_fr.toLowerCase().split(' ');
                        return JSON.parse(JSON.stringify(headsigns)).sort((a, b) => {
                            let aCount = 0;
                            a.toLowerCase()
                                .replace('(', '')
                                .replace(')', '')
                                .split(' ')
                                .forEach((word) => {
                                    if (wantedWords.includes(word)) aCount += 1;
                                });

                            let bCount = 0;
                            b.toLowerCase()
                                .replace('(', '')
                                .replace(')', '')
                                .split(' ')
                                .forEach((word) => {
                                    if (wantedWords.includes(word)) bCount += 1;
                                });

                            return bCount - aCount;
                        })[0];
                    } else {
                        if (i === 65841) console.log(headsigns);
                        return headsigns[0];
                    }
                })()
            }
        });
    },
});
