/**
 * Utility functions for server operations
 */

/**
 * Escapes special regex characters in a path string for use in RegExp
 * @param path - The path string to escape
 * @returns Escaped path string safe for use in RegExp
 */
export function escapeRegexPath(path: string): string {
    return path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Normalizes a path to ensure it starts with a forward slash
 * @param path - The path string to normalize
 * @returns Normalized path string starting with '/'
 */
export function normalizePath(path: string): string {
    return path.startsWith('/') ? path : `/${path}`;
}
