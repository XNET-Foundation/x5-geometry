// XNet Geometry Package
// Core functionality for XNet's hexagonal mapping system and word processing utilities
// Created by Sint Connexa, 18 August 2022

import * as adjectives from './adjectives';
import * as nouns from './nouns';
import * as geom from './geom';
import * as words2index from './words2index';
import * as x5sub from './x5sub';

// Re-export all modules
export {
    adjectives,
    nouns,
    geom,
    words2index,
    x5sub
};

// Re-export commonly used functions from adjectives
export const {
    getAdjectiveIndex,
    getAdjectiveByIndex,
    isAdjective,
    getRandomAdjective
} = adjectives;

// Re-export commonly used functions from nouns
export const {
    getNounIndex,
    getNounByIndex,
    isNoun,
    getRandomNoun
} = nouns;

// Re-export commonly used functions from geom
export const {
    haversine,
    travel,
    gpsDiff,
    sigmaTest,
    vec2add,
    vec2scale,
    latLon2ab,
    ab2latLon,
    grid2latLon,
    ab2grid,
    latLon2grid,
    grid2latLonHex
} = geom;

// Re-export commonly used functions from words2index
export const {
    ij2idx,
    idx2ij,
    idx2abc,
    abc2idx,
    abc2string,
    noun2ind,
    adject2ind,
    string2abc,
    ij2string,
    string2ij
} = words2index;

// Re-export commonly used functions from x5sub
export const {
    getHexSubdivisionIndices,
    hexIndexToIndexArray,
    hexIndexToVertices,
    reorderVerticies,
    subdivideTriangle,
    isPointInsideTriangle,
    subdivideHexToTriangles,
    sign
} = x5sub;

// Re-export types
export type {
    LatLon,
    Vector2D,
    HexGrid,
    GridIndex,
    ABCIndex,
    WordMap,
    Point,
    Triangle
} from './types';

// Re-export all public functions from geom.ts, words2index.ts, and x5sub.ts
export * from './geom';
export * from './words2index';
export * from './x5sub'; 