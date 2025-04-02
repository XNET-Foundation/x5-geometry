/**
 * Tests if a point is inside a hexagon and returns the subdivision indices.
 * @param {Object} point - The point to test, {x: number, y: number}.
 * @param {Array<Object>} hexVertices - Six vertices of the hex in right-hand rule order, [{x: number, y: number}, ...].
 * @returns {Array<number>|false} - List of indices (e.g., [0, 1, 7, 31]) if inside, false if outside.
 */
function getHexSubdivisionIndices(point, hexVertices) {
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
    const { vertices: level2Vertices, triangles: level2Triangles, baseOrientation } = subdivideTriangle(level1Triangle);

    // Find which second-level triangle contains the point
    let level2Index = -1;
    for (let i = 0; i < level2Triangles.length; i++) {
        const [v0, v1, v2] = level2Triangles[i].map(idx => level2Vertices[idx]);
        if (isPointInsideTriangle(point, v0, v1, v2, true)) {
            level2Index = 7 + (level1Index - 1) * 4 + i; // Map to indices 7–30
            break;
        }
    }

    // Step 4: Subdivide the second-level triangle (Level 3: indices 31–126)
    const level2Triangle = level2Triangles[level2Index - 7 - (level1Index - 1) * 4].map(idx => level2Vertices[idx]);
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

/**
 * Subdivides a hexagon into 6 triangles by connecting the centroid to each vertex.
 * @param {Array<Object>} hexVertices - Six vertices in right-hand rule order.
 * @returns {{vertices: Array<Object>, triangles: Array<Array<number>>}}
 */
function subdivideHexToTriangles(hexVertices) {
    // Compute the centroid
    let centroid = { x: 0, y: 0 };
    for (const vertex of hexVertices) {
        centroid.x += vertex.x;
        centroid.y += vertex.y;
    }
    centroid.x /= 6;
    centroid.y /= 6;

    // Create the new vertex list (original 6 + centroid)
    const vertices = [...hexVertices, centroid];

    // Generate triangle indices in right-hand rule order
    const triangles = [];
    for (let i = 0; i < 6; i++) {
        const nextVertex = (i + 1) % 6;
        triangles.push([i, nextVertex, 6]);
    }

    return { vertices, triangles };
}

/**
 * Subdivides a triangle into 4 smaller triangles.
 * @param {Array<Object>} triangleVertices - Three vertices of the triangle.
 * @returns {{vertices: Array<Object>, triangles: Array<Array<number>>, baseOrientation: string}}
 */
function subdivideTriangle(triangleVertices) {
    // Compute midpoints of each edge
    const mid01 = {
        x: (triangleVertices[0].x + triangleVertices[1].x) / 2,
        y: (triangleVertices[0].y + triangleVertices[1].y) / 2
    };
    const mid12 = {
        x: (triangleVertices[1].x + triangleVertices[2].x) / 2,
        y: (triangleVertices[1].y + triangleVertices[2].y) / 2
    };
    const mid20 = {
        x: (triangleVertices[2].x + triangleVertices[0].x) / 2,
        y: (triangleVertices[2].y + triangleVertices[0].y) / 2
    };

    // New vertex list: original 3 + 3 midpoints
    const vertices = [...triangleVertices, mid01, mid12, mid20];

    // Determine base orientation ("base down" or "base up")
    // We'll assume the triangle is "base down" if vertex 0 to 1 is the longest edge
    const edges = [
        Math.hypot(triangleVertices[1].x - triangleVertices[0].x, triangleVertices[1].y - triangleVertices[0].y), // 0-1
        Math.hypot(triangleVertices[2].x - triangleVertices[1].x, triangleVertices[2].y - triangleVertices[1].y), // 1-2
        Math.hypot(triangleVertices[0].x - triangleVertices[2].x, triangleVertices[0].y - triangleVertices[2].y)  // 2-0
    ];
    const longestEdge = edges.indexOf(Math.max(...edges));
    const baseOrientation = longestEdge === 0 ? 'baseDown' : 'baseUp';

    // Define the 4 sub-triangles
    // Indices: 0, 1, 2 are the original vertices; 3, 4, 5 are mid01, mid12, mid20
    const triangles = [
        [3, 4, 5], // Central triangle
        [0, 3, 5], // Radial triangle 1
        [3, 1, 4], // Radial triangle 2
        [5, 4, 2]  // Radial triangle 3
    ];

    // Adjust ordering based on orientation and right-hand rule
    if (baseOrientation === 'baseDown') {
        // For "base down", 0-1 is the base, so radial triangles are ordered starting from 0-3-5
        // Already in correct order: central (0), then 0-3-5 (1), 3-1-4 (2), 5-4-2 (3)
    } else {
        // For "base up", rotate the radial triangles to start from the top vertex
        triangles[1] = [5, 4, 2]; // Radial 1
        triangles[2] = [3, 1, 4]; // Radial 2
        triangles[3] = [0, 3, 5]; // Radial 3
    }

    return { vertices, triangles, baseOrientation };
}

/**
 * Tests whether a point lies inside a triangle using barycentric coordinates.
 * @param {Object} point - The point to test, {x: number, y: number}.
 * @param {Object} v0 - First vertex, {x: number, y: number}.
 * @param {Object} v1 - Second vertex, {x: number, y: number}.
 * @param {Object} v2 - Third vertex, {x: number, y: number}.
 * @param {boolean} [includeBoundary=true] - Whether to include boundary points.
 * @returns {boolean} - True if the point is inside (or on) the triangle.
 */
function isPointInsideTriangle(point, v0, v1, v2, includeBoundary = true) {
    const dX = point.x - v2.x;
    const dY = point.y - v2.y;
    const dX21 = v2.x - v1.x;
    const dY12 = v1.y - v2.y;
    const dX02 = v0.x - v2.x;
    const dY02 = v0.y - v2.y;

    const D = dY12 * dX02 + dX21 * dY02;
    if (D === 0) return false;

    const alpha = (dY12 * dX + dX21 * dY) / D;
    const beta = (dY02 * dX + dX02 * dY) / D;
    const gamma = 1.0 - alpha - beta;

    const threshold = includeBoundary ? 0 : Number.EPSILON;
    return alpha >= threshold && beta >= threshold && gamma >= threshold;
}

// // Example usage:
// const hexVertices = [
//     { x: 0, y: 2 },
//     { x: 1.732, y: 1 },
//     { x: 1.732, y: -1 },
//     { x: 0, y: -2 },
//     { x: -1.732, y: -1 },
//     { x: -1.732, y: 1 }
// ];

// const testPoint = { x: 0.5, y: 0.5 };
// console.log(getHexSubdivisionIndices(testPoint, hexVertices)); // e.g., [0, 1, 7, 31]
// console.log(getHexSubdivisionIndices({ x: 5, y: 5 }, hexVertices)); // false
