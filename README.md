# Computational Geometry for XNET
Created by Sint Connexa, aka Rich DeVaul @xnet-mobile and @rdevaul

This folder is the home for the core [X5 Hex Grid](docs/X5.md)
libraries and some related tools and code conversions. X5 provides the
basis for the XNET hex grid system, and differs in important ways in
design and implementation from Uber's H3 system. See the [X5 Hex Grid
documentation](docs/X5.md) for more information.

This folder is also the home to computation geometry tools that are
used for the batch processing of geo data in order to build the maps
and dictionaries used by the XNET visualizer, and ultimately the
on-chain smart-contract implementations. 

## Contents
Here are some of the more interesting contents of this repo:

* [src/geom.ts](src/geom.ts) &mdash; the reference implementation for core X5
  hex mapping
* [src/words2index.ts](src/words2index.ts) &mdash; map X5 hex
  indices into three-word names, and vice versa.
* [python/zip2map.py](python/zip2map.py) &mdash; a
  [yapCAD](https://github.com/rdevaul/yapCAD)-based tool for
  generating hex tilings of zipcodes

* [LICENSE](LICENSE) &mdash; MIT license, which applies to all contents unless otherwise stated
* [docs](docs) &mdash; documentation home
* [assets](assets) &mdash; images and reference data
* [src](src) &mdash; TypeScript source code
* [python](python) &mdash; Python source code
* [output](output) &mdash; a working directory for the `zip2map.py` script

## Contact
For questions about this repo, please jump into the XNET discord
server at https://discord.gg/qJFJwkBZwj or email connexa@xnet.company

## NPM Package Usage

This repository is also available as an npm package for use in TypeScript/JavaScript projects. See [src/README.md](src/README.md) for detailed usage instructions.

### Features

- Hexagonal grid geometry calculations
- Word-to-index and index-to-word conversions
- Adjective and noun word lists
- GPS coordinate handling
- TypeScript support with full type definitions

### Installation

```bash
npm install xnet-geometry
```

### Usage

```typescript
import {
    // Geometry functions
    haversine,
    travel,
    grid2latLon,
    latLon2grid,
    
    // Word processing
    getAdjectiveIndex,
    getNounIndex,
    ij2string,
    string2ij
} from 'xnet-geometry';

// Calculate distance between two points
const distance = haversine(lat1, lon1, lat2, lon2);

// Convert grid coordinates to lat/lon
const [lat, lon] = grid2latLon(i, j);

// Convert lat/lon to grid coordinates
const [i, j] = latLon2grid(lat, lon);

// Convert grid coordinates to word string
const wordString = ij2string(i, j);

// Convert word string back to grid coordinates
const [i, j] = string2ij(wordString);

// Get word indices
const adjIndex = getAdjectiveIndex('beautiful');
const nounIndex = getNounIndex('dinosaur');
```

### API

#### Geometry Functions

- `haversine(lat1: number, lon1: number, lat2: number, lon2: number): number`
  - Calculate the great-circle distance between two points
- `travel(lat1: number, lon1: number, Δx: number, Δy: number): [number, number]`
  - Calculate new lat/lon coordinates after traveling a distance
- `grid2latLon(i: number, j: number, maxLat?: number, step?: number, offset?: number): [number, number]`
  - Convert grid coordinates to lat/lon
- `latLon2grid(lat: number, lon: number, maxLat?: number, step?: number, offset?: number): [number, number]`
  - Convert lat/lon to grid coordinates

#### Word Processing Functions

- `getAdjectiveIndex(word: string): number`
  - Get the index of an adjective in the word list
- `getNounIndex(word: string): number`
  - Get the index of a noun in the word list
- `ij2string(i: number, j: number): string`
  - Convert grid coordinates to a three-word string
- `string2ij(string: string): [number, number]`
  - Convert a three-word string back to grid coordinates

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contact
For questions about this repo, please jump into the XNET discord
server at https://discord.gg/qJFJwkBZwj or email connexa@xnet.company
