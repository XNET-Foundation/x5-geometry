geom = require('../dist/geom.js');

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
        const { vertices: level2Vertices, triangles: level2Triangles} = subdivideTriangle(level1Triangle);

    // Find which second-level triangle contains the point
    let level2Index = -1;
    let level2Triangle = []
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

function hexIndexToIndexArray(hexIndex) {
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
    if(hexIndex === 0) {
        return [0];
    }
    if(hexIndex < 7) {
        const level1Index = hexIndex - 1; // Map to indices 0–5
        return [0, level1Index + 1];
    }
    if(hexIndex < 31) {
        const level2Index = hexIndex - 7; // Map to indices 0–24
        const level1Index = Math.floor(level2Index / 4); // Map to indices 0–5
        return [0, level1Index + 1, level2Index + 7];
    }
    const level3Index = hexIndex - 31; // Map to indices 0–96
    const level2Index = Math.floor(level3Index / 4); // Map to indices 0–24
    const level1Index = Math.floor(level2Index / 4); // Map to indices 0–5
    return [0, level1Index + 1, level2Index + 7, level3Index + 31];
}

function hexIndexToVertices(hexIndex, hexVertices) {
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
    indexArray = hexIndexToIndexArray(hexIndex);

    // Step 1: Compute the centroid and subdivide the hex into 6 triangles
    const { vertices: level1Vertices, triangles: level1Triangles } = subdivideHexToTriangles(hexVertices);
    // Step 2: Find which first-level triangle contains the hexIndex
    if(indexArray.length === 1) {
        return hexVertices;
    }
    const level1Index = indexArray[1] - 1; // Map to indices 0–5
    const level1Triangle = level1Triangles[level1Index].map(idx => level1Vertices[idx]);

    if(indexArray.length === 2) {
         return level1Triangle;
    }

    const level2Index = indexArray[2] - 7; // Map to indices 0–24
    const level2IndexInTriangle = level2Index % 4; // Map to indices 0–3
    const { vertices: level2Vertices, triangles: level2Triangles } = subdivideTriangle(level1Triangle);
    const level2Triangle = level2Triangles[level2IndexInTriangle].map(idx => level2Vertices[idx]);

    if(indexArray.length === 3) {
        return level2Triangle;
    }

    const level3Index = indexArray[3] - 31; // Map to indices 0–96
    const level3IndexInTriangle = level3Index % 4; // Map to indices 0–3
    const { vertices: level3Vertices, triangles: level3Triangles } = subdivideTriangle(level2Triangle);
    const level3Triangle = level3Triangles[level3IndexInTriangle].map(idx => level3Vertices[idx]);
    return level3Triangle;
}


function reorderVerticies(hexVertices) {
    // function to reorder the vertices of a polygon to ensure that the first vertex is the
    // righmost one. If there are two vertices with the same x, the one with the
    // lowest y is the first one.

    let rightLower = hexVertices[0];
    let indexj = 0;
    for(let i = 1; i < hexVertices.length; i++) {
        if (hexVertices[i].x > rightLower.x || hexVertices[i].x === rightLower.x && hexVertices[i].y < rightLower.y) {
            rightLower = hexVertices[i];
            indexj = i;
        }}
    // reorder the hex vertices
    let newHexVertices = [];
    for(let i = 0; i < hexVertices.length; i++) {
        newHexVertices.push(hexVertices[(indexj + i) % hexVertices.length]);
    }
    return newHexVertices;
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
 * @returns {{vertices: Array<Object>, triangles: Array<Array<number>>}}
 */
function subdivideTriangle(triangleVertices) {

    // reorder the vertices to ensure that the first vertex is the rightmost one
    triangleVertices = reorderVerticies(triangleVertices);

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
 * Tests whether a point lies inside a triangle using barycentric coordinates.
 * @param {Object} point - The point to test, {x: number, y: number}.
 * @param {Object} v0 - First vertex, {x: number, y: number}.
 * @param {Object} v1 - Second vertex, {x: number, y: number}.
 * @param {Object} v2 - Third vertex, {x: number, y: number}.
 * @param {boolean} [includeBoundary=true] - Whether to include boundary points.
 * @returns {boolean} - True if the point is inside (or on) the triangle.
 */
function isPointInsideTriangle(point, v1, v2, v3, includeBoundary = true) {
    // Extract coordinates for clarity
    const x = point.x;
    const y = point.y;
    const x1 = v1.x;
    const y1 = v1.y;
    const x2 = v2.x;
    const y2 = v2.y;
    const x3 = v3.x;
    const y3 = v3.y;

    // calculate signed area
    let D=(y2-y3)*(x1-x3) + (x3-x2)*(y1-y3);

    if (Math.abs(D) < Number.EPSILON) {
        return false;
    }
    // Calculate barycentric coordinates
    let alpha = ((y2-y3)*(x-x3) + (x3-x2)*(y-y3)) / D;
    let beta = ((y3-y1)*(x-x3) + (x1-x3)*(y-y3)) / D;
    let gamma = 1.0 - alpha - beta;
    // Check if point is inside the triangle using barycentric coordinates
    const threshold = includeBoundary ? 0 : Number.EPSILON;
    return alpha >= threshold && beta >= threshold && gamma >= threshold;
}

function extGrid2latLonVertices(i, j, hexIndex) {
    // This function will take an x5 i,j hex address and a hexIndex  and return the lat lon vertices of the
    // hexagon or triangle that corresponds to the i,j address and hexIndex.
    let hex = geom.grid2latLonHex(i,j);
    hex = hex.map(lst => {return {x: lst[1], y: lst[0]};});
    let vertices = hexIndexToVertices(hexIndex,hex);
    vertices = vertices.map(lst => {return {lat: lst.y, lon: lst.x};});
    return vertices;
}

function latLon2extGrid(lat, lon )  {
    let [i,j] = geom.latLon2grid(lat,lon);
    let hex = geom.grid2latLonHex(i,j);
    hex = hex.map(lst => {return {x: lst[1], y: lst[0]};});
    hexIndices = getHexSubdivisionIndices({x: lon, y: lat},hex);
    return { i: i, j: j, hexIndices: hexIndices  };
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
module.exports = {
    getHexSubdivisionIndices,
    hexIndexToIndexArray,
    hexIndexToVertices,
    reorderVerticies,
    isPointInsideTriangle,
    subdivideTriangle,
    extGrid2latLonVertices,
    latLon2extGrid

};

//export { getHexSubdivisionIndices, isPointInsideTriangle, subdivideTriangle };
