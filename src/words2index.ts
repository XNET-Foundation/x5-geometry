// convert an i,j index or combined index into a unique three word
// name, and vice versa.
// Created by Sint Connexa on Wed Sep 21 15:37:42 PDT 2022

import { nouns } from './nouns';
import { adjectives } from './adjectives';
import { GridIndex, ABCIndex, WordMap } from './types';

// convert two grid index values to a packed 32 bit integer
export function ij2idx(i: number, j: number): number {
    // parameter safety checks
    i = Number(i) >>> 0;		// forced unsigned number
    j = Number(j) >>> 0;		// same
    
    if ((i >> 16) > 0)
	throw 'i index out of range: ' + String(i);
    if ((j >> 16) > 0)
	throw 'j index out of range: ' + String(j);
    
    return (i << 16) + j;
}

export function idx2ij(idx: number): GridIndex {
    // parameter safety checks
    idx = Number(idx) >>> 0;	// forced unsigned number
    return [ (idx >> 16), idx & (2 **16-1) ];
}

// convert a packed 32 bit index into a, b, and c subranges
export function idx2abc(idx: number): ABCIndex {
    // parameter safety checks
    idx = Number(idx) >>> 0;	// forced unsigned number
    
    const c = idx & (2 ** 11-1); // 11 bits
    const b = (idx >> 11) & (2 ** 10-1); // 10 bits
    const a = (idx >> 21 );	// 11 bits left
    return [a,  // 11 bits
	    b,  // 10 bits
	    c]; // 11 bits
}

export function abc2idx(abc: ABCIndex): number {
    const a = Number(abc[0]) >>> 0;
    const b = Number(abc[1]) >>> 0;
    const c = Number(abc[2]) >>> 0;

    if ((a >> 11) > 0)
	throw 'param a out of range: ' + a;
    if ((b >> 10) > 0)
	throw 'param b out of range: ' + b;
    if ((c >> 11) > 0)
	throw 'param c out of range: ' + c;
    
    return c + (b << 11) + (a << 21);
}

// This function assumes that two arrays, `adjectives` and `nouns` have
// been declared in the present scope with at least 2^10 and 2^11
// elements in each, respectively

export function abc2string(abc: ABCIndex): string {
    const a = Number(abc[0]) >>> 0;
    const b = Number(abc[1]) >>> 0;
    const c = Number(abc[2]) >>> 0;

    if ((a >> 11) > 0)
	throw 'param a out of range: ' + a;
    if ((b >> 10) > 0)
	throw 'param b out of range: ' + b;
    if ((c >> 11) > 0)
	throw 'param c out of range: ' + c;

    return nouns[a] + '-' + adjectives[b] + '-' + nouns[c];
}

// given an array containing unique strings, produce an object with
// those strings as keys and the original array indices as values
function makeInverse(wordArray: string[]): WordMap {
    const rtn: WordMap = {};
    for (let i = 0; i < wordArray.length; i++) {
        rtn[wordArray[i]] = i;
    }
    return rtn;
}

let nounIdx: WordMap | null = null;
let adjectIdx: WordMap | null = null;

// map a word to an index in the noun array. If the inverse mapping
// is null, build it first.
export function noun2ind(wrd: string): number {
    const mapobj = nounIdx == null ? nounIdx = makeInverse(nouns)
          : nounIdx;
    return mapobj[wrd];
}
    
// map a word to an index in the adjective array. If the inverse mapping
// is null, build it first.
export function adject2ind(wrd: string): number {
    const mapobj = adjectIdx == null ? adjectIdx = makeInverse(adjectives)
          : adjectIdx;
    return mapobj[wrd];
}    

export function string2abc(hexname: string): ABCIndex {
    const words = hexname.split("-");
    const a = noun2ind(words[0]);
    const b = adject2ind(words[1]);
    const c = noun2ind(words[2]);
    return [a,b,c];
}

export const ij2string = (i: number, j: number): string => 
    abc2string(idx2abc(ij2idx(i,j)));

export const string2ij = (string: string): GridIndex => 
    idx2ij(abc2idx(string2abc(string))); 