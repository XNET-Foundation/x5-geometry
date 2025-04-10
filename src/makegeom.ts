import { Point } from './types';
import { hexIndexToIndexArray, hexIndexToVertices } from './x5sub';

const testHex: Point[] = [
    { x: 1.0, y: 0 },
    { x: 0.5, y: 0.866 },
    { x: -0.5, y: 0.866 },
    { x: -1.0, y: 0 },
    { x: -0.5, y: -0.866 },
    { x: 0.5, y: -0.866 }
];

const tris: Point[][] = [];

for (let i = 1; i < 127; i++) {
    const hexIndex = i;
    const result = hexIndexToIndexArray(hexIndex);
    tris.push(hexIndexToVertices(hexIndex, testHex));
}

const jsonString = JSON.stringify(tris);
console.log(jsonString); 