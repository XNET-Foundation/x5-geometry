# XNET X5 TypeScript/JavaScript Implementation

This directory contains the TypeScript/JavaScript implementation of the X5 hex grid system, which is also available as an npm package.

## NPM Package Usage

This implementation is available as an npm package for use in TypeScript/JavaScript projects.

### Features

- Hexagonal grid geometry calculations
- Word-to-index and index-to-word conversions
- Adjective and noun word lists
- GPS coordinate handling
- TypeScript support with full type definitions

### Installation

```bash
npm install x5-geometry
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
} from 'x5-geometry';

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
