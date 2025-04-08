
x5sub = require('./x5sub.js');

testHex = [ {x: 1.0, y: 0},
            {x: 0.5, y: 0.866},
            {x: -0.5, y: 0.866},
            {x: -1.0, y: 0},
            {x: -0.5, y: -0.866},
            {x: 0.5, y: -0.866}];

tris = []

for (i = 1; i< 127; i++) {
    let hexIndex = i;
    let result = x5sub.hexIndexToIndexArray(hexIndex);
    tris.push(x5sub.hexIndexToVertices(hexIndex, testHex));
}
jsonString = JSON.stringify(tris);
console.log(jsonString);
