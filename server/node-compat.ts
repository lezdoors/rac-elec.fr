/**
 * Node.js 18/20 Compatibility Layer
 * 
 * Provides polyfills for Node.js 20+ features used in the codebase
 * to ensure production deployment works with Node.js 18.x
 * 
 * CRITICAL: This fixes the production deployment failure caused by
 * import.meta.dirname usage which doesn't exist in Node.js 18.x
 */

import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

/**
 * Polyfill for import.meta.dirname (Node.js 20.11+)
 * Falls back to manual path resolution for Node.js 18.x
 */
export function getMetaDirname(importMetaUrl: string): string {
  // Try native import.meta.dirname first (Node.js 20.11+)
  if (typeof (import.meta as any).dirname !== 'undefined') {
    return (import.meta as any).dirname;
  }
  
  // Fallback for Node.js 18.x
  return dirname(fileURLToPath(importMetaUrl));
}

/**
 * Get current file directory using compatibility method
 */
export const __dirname = getMetaDirname(import.meta.url);

console.log('🔧 Node.js Compatibility Layer loaded - Supporting Node.js 18.x+ for production deployment');