import { geom, x5sub } from 'x5-geometry';

// Example usage of the geometry functions
const point1 = { lat: 37.7749, lon: -122.4194 }; // San Francisco
const point2 = { lat: 34.0522, lon: -118.2437 }; // Los Angeles

// Calculate distance using haversine formula
const distance = geom.haversine(
    point1.lat,
    point1.lon,
    point2.lat,
    point2.lon
);
console.log('Distance between San Francisco and Los Angeles:', distance / 1000, 'km');

// Example of hex grid subdivision
const hexVertices = [
    { x: 1, y: 0 },
    { x: 0.5, y: 0.866 },
    { x: -0.5, y: 0.866 },
    { x: -1, y: 0 },
    { x: -0.5, y: -0.866 },
    { x: 0.5, y: -0.866 }
];
const subdivision = x5sub.getHexSubdivisionIndices({ x: 0, y: 0 }, hexVertices);
console.log('Hex subdivision for center point:', subdivision);
