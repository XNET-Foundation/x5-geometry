// Type definitions for XNet Geometry Package
// Created by Sint Connexa, 18 August 2022

// Geometry types
export type LatLon = [number, number];
export type Vector2D = [number, number];
export type HexGrid = [number, number];
export type HexGridExt = [number, number, number]; // subdivion

// Word processing types
export type GridIndex = [number, number];
export type GridIndexExt = [number, number, number]; // subdivision
export type ABCIndex = [number, number, number];
export type ABCIndexExt = [number, number, number, number]; //subdivision
export type WordMap = { [key: string]: number };
export type WordMapExt = { [key: string]: number }; 