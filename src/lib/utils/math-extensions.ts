/**
 * @fileoverview Mathematical Extensions for AI Systems
 * 
 * Provides additional mathematical functions needed by AI systems
 * including sigmoid, tanh, and other activation functions.
 * 
 * @author SILEXAR AI Team - Mathematical Division
 * @version 2040.1.0 - MATHEMATICAL SUPREMACY
 */

declare global {
  interface Math {
    sigmoid(x: number): number;
    tanh(x: number): number;
  }
}

// Extend Math object with sigmoid function
Math.sigmoid = function(x: number): number {
  return 1 / (1 + Math.exp(-x));
};

// Ensure tanh is available (it should be native in modern environments)
if (!Math.tanh) {
  Math.tanh = function(x: number): number {
    const e2x = Math.exp(2 * x);
    return (e2x - 1) / (e2x + 1);
  };
}

export {};