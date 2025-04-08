// test code for hex dgeometry subdivision
//import { getHexSubdivisionIndices, isPointInsideTriangle, subdivideTriangle } from '../x5sub';
x5sub = require('../x5sub');

const testPoint1 = { x: 0.01, y: 0.01 };
const testPoint2 = { x: 0.5, y: 0.5 };

describe('extended geometry tests', () => {
        test('testing reordering hex vertices', () => {
                expect(typeof x5sub.reorderVerticies).toBe('function');
                let vertices = [
                        { x: 0, y: 2 },
                        { x: 1.732, y: 1 },
                        { x: 1.732, y: -1 },
                        { x: 0, y: -2 },
                        { x: -1.732, y: -1 },
                        { x: -1.732, y: 1 }
                ];
                vertices.reverse();
                let result = x5sub.reorderVerticies(vertices);
                expect(result).toHaveLength(6);
                expect(result[0].x).toEqual(1.732);
                expect(result[0].y).toEqual(-1);
        });
        test('testing hexIndexToIndexArray', () => {
                expect(typeof x5sub.hexIndexToIndexArray).toBe('function');
                let hexIndex = 62;
                let result = x5sub.hexIndexToIndexArray(hexIndex);
                expect(result).toHaveLength(4);
                expect(result[0]).toEqual(0);
                expect(result[1]).toEqual(2);
                expect(result[2]).toEqual(14);
                expect(result[3]).toEqual(62);
        });
        test('testing isPointInsideTriangle', () => {
                expect(typeof x5sub.isPointInsideTriangle).toBe('function');
                let triangle = [
                        { x: 0, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 1 }
                ];
                p1 = { x: 0.35, y: 0.25 };
                p2 = { x: 1.5, y: 0.5 };
                p3 = {x: 0.5, y: 0.5 };
                console.log("point triangle test" + x5sub.isPointInsideTriangle(p1, triangle[0], triangle[1], triangle[2]));
                expect(x5sub.isPointInsideTriangle(p1, triangle[0], triangle[1], triangle[2])).toBe(true);
                expect(x5sub.isPointInsideTriangle(p2, triangle[0], triangle[1], triangle[2])).toBe(false);
                expect(x5sub.isPointInsideTriangle(p3, triangle[0], triangle[1], triangle[2],true)).toBe(true);
                expect(x5sub.isPointInsideTriangle(p3, triangle[0], triangle[1], triangle[2],false)).toBe(false);

        });
        test('subdivideTriangle', () => {
                expect(typeof x5sub.subdivideTriangle).toBe('function');
                let triangle = [
                        { x: 0, y: 0 },
                        { x: 1, y: 0 },
                        { x: 0, y: 1 }
                ];
                let { vertices, triangles } = x5sub.subdivideTriangle(triangle);
                expect(vertices).toHaveLength(6);
                expect(triangles).toHaveLength(4);
                expect(vertices[0].x).toEqual(1);
                expect(vertices[0].y).toEqual(0);
                expect(vertices[1].x).toEqual(0);
                expect(vertices[1].y).toEqual(1);
                expect(vertices[2].x).toEqual(0);
                expect(vertices[2].y).toEqual(0);
                expect(vertices[3].x).toEqual(0.5);
                expect(vertices[3].y).toEqual(0.5);
                expect(vertices[4].x).toEqual(0);
                expect(vertices[4].y).toEqual(0.5);
                expect(vertices[5].x).toEqual(0.5);
                expect(vertices[5].y).toEqual(0);
                expect(triangles[0]).toEqual([3, 4, 5]);
                expect(triangles[1]).toEqual([0, 3, 5]);
                expect(triangles[2]).toEqual([3, 1, 4]);
                expect(triangles[3]).toEqual([5, 4, 2]);
        });
        test('getHexSubdivisionIndices', () => {
                expect(typeof x5sub.getHexSubdivisionIndices).toBe('function');
                let hexVertices = [
                        { x: 0, y: 2 },
                        { x: 1.732, y: 1 },
                        { x: 1.732, y: -1 },
                        { x: 0, y: -2 },
                        { x: -1.732, y: -1 },
                        { x: -1.732, y: 1 }
                ];
                hexVertices.reverse();
                console.log(hexVertices);
                console.log( x5sub.getHexSubdivisionIndices(testPoint1, hexVertices));
                expect(Array.isArray(x5sub.getHexSubdivisionIndices(testPoint1, hexVertices))).toBe(true);
                expect(x5sub.getHexSubdivisionIndices(testPoint1, hexVertices)).toHaveLength(4);
                expect(x5sub.getHexSubdivisionIndices(testPoint1, hexVertices)).toEqual([0, 2, 14, 62]);
                expect(x5sub.getHexSubdivisionIndices({ x: 5, y: 5 }, hexVertices)).toBe(false);
        });
});
