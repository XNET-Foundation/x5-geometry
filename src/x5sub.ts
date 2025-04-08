import { Point, Triangle } from './types';

/**
 * Tests if a point is inside a hexagon and returns the subdivision indices.
 * @param point - The point to test
 * @param hexVertices - Six vertices of the hex in right-hand rule order
 * @returns List of indices (e.g., [0, 1, 7, 31]) if inside, false if outside
 */
export function getHexSubdivisionIndices(point: Point, hexVertices: Point[]): number[] | false {
    // Validate input
    if (!point || typeof point.x !== 'number' || typeof point.y !== 'number') {
        throw new Error('Point must have numeric x and y coordinates.');
    }
    if (!Array.isArray(hexVertices) || hexVertices.length !== 6) {
        throw new Error('Expected exactly 6 vertices for the hexagon.');
    }
    for (const vertex of hexVertices) {
        if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
            throw new Error('Each vertex must have numeric x and y coordinates.');
        }
    }
    // Reorder hex vertices to ensure the first vertex is the rightmost one
    // This is important for consistent triangle subdivision indexing
    hexVertices = reorderVerticies(hexVertices);

    // Step 1: Compute the centroid and subdivide the hex into 6 triangles
    const { vertices: level1Vertices, triangles: level1Triangles } = subdivideHexToTriangles(hexVertices);

    // Step 2: Find which first-level triangle contains the point
    let level1Index = -1;
    for (let i = 0; i < level1Triangles.length; i++) {
        const [v0, v1, v2] = level1Triangles[i].map(idx => level1Vertices[idx]);
        if (isPointInsideTriangle(point, v0, v1, v2, true)) {
            level1Index = i + 1; // Map to indices 1–6
            break;
        }
    }

    // If the point is outside all triangles, it's outside the hex
    if (level1Index === -1) {
        return false;
    }

    // Step 3: Subdivide the containing triangle (Level 2: indices 7–30)
    const level1Triangle = level1Triangles[level1Index - 1].map(idx => level1Vertices[idx]);
    const { vertices: level2Vertices, triangles: level2Triangles } = subdivideTriangle(level1Triangle);

    // Find which second-level triangle contains the point
    let level2Index = -1;
    let level2Triangle: Point[] = [];
    for (let i = 0; i < level2Triangles.length; i++) {
        const [v0, v1, v2] = level2Triangles[i].map(idx => level2Vertices[idx]);
        if (isPointInsideTriangle(point, v0, v1, v2, true)) {
            level2Index = 7 + (level1Index - 1) * 4 + i; // Map to indices 7–30
            level2Triangle = [v0, v1, v2];
            break;
        }
    }

    // Step 4: Subdivide the second-level triangle (Level 3: indices 31–126)
    const { vertices: level3Vertices, triangles: level3Triangles } = subdivideTriangle(level2Triangle);

    // Find which third-level triangle contains the point
    let level3Index = -1;
    for (let i = 0; i < level3Triangles.length; i++) {
        const [v0, v1, v2] = level3Triangles[i].map(idx => level3Vertices[idx]);
        if (isPointInsideTriangle(point, v0, v1, v2, true)) {
            level3Index = 31 + (level2Index - 7) * 4 + i; // Map to indices 31–126
            break;
        }
    }

    // Return the full path of indices
    return [0, level1Index, level2Index, level3Index];
}

export function hexIndexToIndexArray(hexIndex: number): number[] {
    // Convert hex index to index array
    // The hexagon is divided into 6 triangles, each triangle is subdivided into 4 smaller triangles
    // The first level has 6 triangles, the second level has 24 triangles (4 for each of the 6 triangles),
    // and the third level has 96 triangles (4 for each of the 24 triangles)
    // The hex index is 0–126, and the index array is 0–5 for the first level,
    // 7–30 for the second level, and 31–126 for the third level

    // Check if the hexIndex is valid
    if (hexIndex < 0 || hexIndex > 126) {
        throw new Error('Hex index must be between 0 and 126.');
    }
    if (hexIndex === 0) {
        return [0];
    }
    if (hexIndex < 7) {
        const level1Index = hexIndex - 1; // Map to indices 0–5
        return [0, level1Index + 1];
    }
    if (hexIndex < 31) {
        const level2Index = hexIndex - 7; // Map to indices 0–24
        const level1Index = Math.floor(level2Index / 4); // Map to indices 0–5
        return [0, level1Index + 1, level2Index + 7];
    }
    const level3Index = hexIndex - 31; // Map to indices 0–96
    const level2Index = Math.floor(level3Index / 4); // Map to indices 0–24
    const level1Index = Math.floor(level2Index / 4); // Map to indices 0–5
    return [0, level1Index + 1, level2Index + 7, level3Index + 31];
}

export function hexIndexToVertices(hexIndex: number, hexVertices: Point[]): Point[] {
    // Convert hex index to hex or triangle vertices
    // The hexagon is divided into 6 triangles, each triangle is subdivided into 4 smaller triangles
    // The first level has 6 triangles, the second level has 24 triangles (4 for each of the 6 triangles),
    // and the third level has 96 triangles (4 for each of the 24 triangles)

    // Check if the hexIndex is valid
    if (hexIndex < 0 || hexIndex > 126) {
        throw new Error('Hex index must be between 0 and 126.');
    }
    // Check if the hexVertices are valid
    if (!Array.isArray(hexVertices) || hexVertices.length !== 6) {
        throw new Error('Expected exactly 6 vertices for the hexagon.');
    }
    for (const vertex of hexVertices) {
        if (typeof vertex.x !== 'number' || typeof vertex.y !== 'number') {
            throw new Error('Each vertex must have numeric x and y coordinates.');
        }
    }
    // Reorder hex vertices to ensure the first vertex is the rightmost one
    // This is important for consistent triangle subdivision indexing
    // This is done in the getHexSubdivisionIndices function
    hexVertices = reorderVerticies(hexVertices);
    const indexArray = hexIndexToIndexArray(hexIndex);

    // Step 1: Compute the centroid and subdivide the hex into 6 triangles
    const { vertices: level1Vertices, triangles: level1Triangles } = subdivideHexToTriangles(hexVertices);
    // Step 2: Find which first-level triangle contains the hexIndex
    if (indexArray.length === 1) {
        return hexVertices;
    }
    const level1Index = indexArray[1] - 1; // Map to indices 0–5
    const level1Triangle = level1Triangles[level1Index].map(idx => level1Vertices[idx]);

    if (indexArray.length === 2) {
        return level1Triangle;
    }

    const level2Index = indexArray[2] - 7; // Map to indices 0–24
    const level2IndexInTriangle = level2Index % 4; // Map to indices 0–3
    const { vertices: level2Vertices, triangles: level2Triangles } = subdivideTriangle(level1Triangle);
    const level2Triangle = level2Triangles[level2IndexInTriangle].map(idx => level2Vertices[idx]);

    if (indexArray.length === 3) {
        return level2Triangle;
    }

    const level3Index = indexArray[3] - 31; // Map to indices 0–96
    const level3IndexInTriangle = level3Index % 4; // Map to indices 0–3
    const { vertices: level3Vertices, triangles: level3Triangles } = subdivideTriangle(level2Triangle);
    const level3Triangle = level3Triangles[level3IndexInTriangle].map(idx => level3Vertices[idx]);
    return level3Triangle;
}

export function reorderVerticies(hexVertices: Point[]): Point[] {
    // function to reorder the vertices of a polygon to ensure that the first vertex is the
    // righmost one. If there are two vertices with the same x, the one with the
    // lowest y is the first one.

    let rightLower = hexVertices[0];
    let indexj = 0;
    for (let i = 1; i < hexVertices.length; i++) {
        if (hexVertices[i].x > rightLower.x || (hexVertices[i].x === rightLower.x && hexVertices[i].y < rightLower.y)) {
            rightLower = hexVertices[i];
            indexj = i;
        }
    }
    // reorder the hex vertices
    const newHexVertices: Point[] = [];
    for (let i = 0; i < hexVertices.length; i++) {
        newHexVertices.push(hexVertices[(indexj + i) % hexVertices.length]);
    }
    return newHexVertices;
}

/**
 * Subdivides a hexagon into 6 triangles by connecting the centroid to each vertex.
 * @param hexVertices - Six vertices in right-hand rule order.
 * @returns Object containing vertices and triangles
 */
export function subdivideHexToTriangles(hexVertices: Point[]): Triangle {
    // Compute the centroid
    const centroid: Point = { x: 0, y: 0 };
    for (const vertex of hexVertices) {
        centroid.x += vertex.x;
        centroid.y += vertex.y;
    }
    centroid.x /= 6;
    centroid.y /= 6;

    // Create the new vertex list (original 6 + centroid)
    const vertices = [...hexVertices, centroid];

    // Generate triangle indices in right-hand rule order
    const triangles: number[][] = [];
    for (let i = 0; i < 6; i++) {
        const nextVertex = (i + 1) % 6;
        triangles.push([i, nextVertex, 6]);
    }

    return { vertices, triangles };
}

/**
 * Subdivides a triangle into 4 smaller triangles.
 * @param triangleVertices - Three vertices of the triangle.
 * @returns Object containing vertices and triangles
 */
export function subdivideTriangle(triangleVertices: Point[]): Triangle {
    // reorder the vertices to ensure that the first vertex is the rightmost one
    triangleVertices = reorderVerticies(triangleVertices);

    // Compute midpoints of each edge
    const mid01: Point = {
        x: (triangleVertices[0].x + triangleVertices[1].x) / 2,
        y: (triangleVertices[0].y + triangleVertices[1].y) / 2
    };
    const mid12: Point = {
        x: (triangleVertices[1].x + triangleVertices[2].x) / 2,
        y: (triangleVertices[1].y + triangleVertices[2].y) / 2
    };
    const mid20: Point = {
        x: (triangleVertices[2].x + triangleVertices[0].x) / 2,
        y: (triangleVertices[2].y + triangleVertices[0].y) / 2
    };

    // New vertex list: original 3 + 3 midpoints
    const vertices = [...triangleVertices, mid01, mid12, mid20];

    // Define the 4 sub-triangles
    // Indices: 0, 1, 2 are the original vertices; 3, 4, 5 are mid01, mid12, mid20
    const triangles = [
        [3, 4, 5], // Central triangle
        [0, 3, 5], // Radial triangle 1
        [3, 1, 4], // Radial triangle 2
        [5, 4, 2]  // Radial triangle 3
    ];

    return { vertices, triangles };
}

/**
 * Determines if a point is inside a triangle
 * @param point - The point to test
 * @param v1 - First vertex of the triangle
 * @param v2 - Second vertex of the triangle
 * @param v3 - Third vertex of the triangle
 * @param includeBoundary - Whether to include points on the boundary
 * @returns True if the point is inside the triangle, false otherwise
 */
export function isPointInsideTriangle(point: Point, v1: Point, v2: Point, v3: Point, includeBoundary = true): boolean {
    const d1 = sign(point, v1, v2);
    const d2 = sign(point, v2, v3);
    const d3 = sign(point, v3, v1);

    const hasNeg = (d1 < 0) || (d2 < 0) || (d3 < 0);
    const hasPos = (d1 > 0) || (d2 > 0) || (d3 > 0);

    if (includeBoundary) {
        return !(hasNeg && hasPos);
    }
    return !(hasNeg || hasPos);
}

export function sign(p1: Point, p2: Point, p3: Point): number {
    return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
} 