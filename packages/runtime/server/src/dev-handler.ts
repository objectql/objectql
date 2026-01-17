import { IncomingMessage, ServerResponse } from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { ObjectQLError } from '@objectql/types';
import { ErrorCode } from './types';

/**
 * Send JSON response
 */
function sendJSON(res: ServerResponse, statusCode: number, data: any) {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = statusCode;
    res.end(JSON.stringify(data));
}

/**
 * Read request body as JSON
 */
function readBody(req: IncomingMessage): Promise<any> {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => {
            if (!body) return resolve({});
            try {
                resolve(JSON.parse(body));
            } catch (e) {
                reject(new Error('Invalid JSON'));
            }
        });
        req.on('error', reject);
    });
}

/**
 * Options for createDevHandler
 */
export interface DevHandlerOptions {
    /** Base directory for file operations (defaults to process.cwd()) */
    baseDir?: string;
    /** Enable dev mode (must be explicitly enabled) */
    enabled?: boolean;
    /** Allowed file extensions for editing */
    allowedExtensions?: string[];
}

/**
 * File tree node structure
 */
interface FileNode {
    name: string;
    path: string;
    type: 'file' | 'directory';
    extension?: string;
    size?: number;
    modified?: string;
    children?: FileNode[];
}

/**
 * Creates a development environment HTTP handler for ObjectQL
 * 
 * Endpoints:
 * - GET    /api/dev/files              - List files in directory tree
 * - GET    /api/dev/files/:path        - Read file content
 * - PUT    /api/dev/files/:path        - Update file content
 * - POST   /api/dev/files              - Create new file
 * - DELETE /api/dev/files/:path        - Delete file
 * - GET    /api/dev/metadata           - Get ObjectQL metadata (objects, apps)
 * 
 * Security: This handler should ONLY be enabled in development mode
 */
export function createDevHandler(options?: DevHandlerOptions) {
    const baseDir = options?.baseDir || process.cwd();
    const enabled = options?.enabled ?? false; // Default to false for security
    const allowedExtensions = options?.allowedExtensions || [
        '.yml', '.yaml', '.ts', '.js', '.json', '.md', 
        '.txt', '.object.yml', '.validation.yml', '.permission.yml', 
        '.hook.ts', '.action.ts', '.app.yml'
    ];

    return async (req: IncomingMessage, res: ServerResponse) => {
        try {
            // Security check: only allow in dev mode
            if (!enabled) {
                sendJSON(res, 403, {
                    error: {
                        code: ErrorCode.FORBIDDEN,
                        message: 'Dev handler is only available in development mode'
                    }
                });
                return;
            }

            // CORS headers
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
            res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

            if (req.method === 'OPTIONS') {
                res.statusCode = 200;
                res.end();
                return;
            }

            const url = req.url || '';
            const method = req.method || 'GET';

            // Parse URL path
            const match = url.match(/^\/api\/dev\/([^?]+)(\?.*)?$/);
            if (!match) {
                sendJSON(res, 404, {
                    error: {
                        code: ErrorCode.NOT_FOUND,
                        message: 'Invalid dev API endpoint'
                    }
                });
                return;
            }

            const [, endpoint, queryString] = match;

            // Route handling
            if (endpoint.startsWith('files')) {
                await handleFileOperations(method, endpoint, req, res, baseDir, allowedExtensions);
            } else if (endpoint === 'metadata') {
                await handleMetadata(method, req, res, baseDir);
            } else {
                sendJSON(res, 404, {
                    error: {
                        code: ErrorCode.NOT_FOUND,
                        message: `Unknown endpoint: ${endpoint}`
                    }
                });
            }

        } catch (error: any) {
            console.error('[DevHandler] Error:', error);
            sendJSON(res, 500, {
                error: {
                    code: ErrorCode.INTERNAL_ERROR,
                    message: error.message || 'Internal server error'
                }
            });
        }
    };
}

/**
 * Handle file operations
 */
async function handleFileOperations(
    method: string,
    endpoint: string,
    req: IncomingMessage,
    res: ServerResponse,
    baseDir: string,
    allowedExtensions: string[]
) {
    const pathMatch = endpoint.match(/^files(?:\/(.+))?$/);
    if (!pathMatch) {
        sendJSON(res, 400, {
            error: {
                code: ErrorCode.INVALID_REQUEST,
                message: 'Invalid file path'
            }
        });
        return;
    }

    const relativePath = pathMatch[1] ? decodeURIComponent(pathMatch[1]) : '';

    switch (method) {
        case 'GET':
            if (relativePath) {
                await readFile(relativePath, res, baseDir);
            } else {
                await listFiles(res, baseDir, allowedExtensions);
            }
            break;

        case 'PUT':
            if (!relativePath) {
                sendJSON(res, 400, {
                    error: {
                        code: ErrorCode.INVALID_REQUEST,
                        message: 'File path is required'
                    }
                });
                return;
            }
            await updateFile(relativePath, req, res, baseDir, allowedExtensions);
            break;

        case 'POST':
            await createFile(req, res, baseDir, allowedExtensions);
            break;

        case 'DELETE':
            if (!relativePath) {
                sendJSON(res, 400, {
                    error: {
                        code: ErrorCode.INVALID_REQUEST,
                        message: 'File path is required'
                    }
                });
                return;
            }
            await deleteFile(relativePath, res, baseDir, allowedExtensions);
            break;

        default:
            sendJSON(res, 405, {
                error: {
                    code: ErrorCode.INVALID_REQUEST,
                    message: 'Method not allowed'
                }
            });
    }
}

/**
 * List files in directory tree
 */
async function listFiles(res: ServerResponse, baseDir: string, allowedExtensions: string[]) {
    try {
        const srcDir = path.join(baseDir, 'src');
        
        if (!fs.existsSync(srcDir)) {
            sendJSON(res, 404, {
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'Source directory not found'
                }
            });
            return;
        }

        const tree = await buildFileTree(srcDir, srcDir, allowedExtensions);
        
        sendJSON(res, 200, {
            baseDir: srcDir,
            tree
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Build file tree recursively
 */
async function buildFileTree(
    dirPath: string,
    baseDir: string,
    allowedExtensions: string[]
): Promise<FileNode[]> {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true });
    const nodes: FileNode[] = [];

    for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
        }

        const fullPath = path.join(dirPath, entry.name);
        const relativePath = path.relative(baseDir, fullPath);
        const stats = fs.statSync(fullPath);

        if (entry.isDirectory()) {
            const children = await buildFileTree(fullPath, baseDir, allowedExtensions);
            nodes.push({
                name: entry.name,
                path: relativePath,
                type: 'directory',
                modified: stats.mtime.toISOString(),
                children
            });
        } else if (entry.isFile()) {
            const ext = path.extname(entry.name);
            // Only include allowed file types
            if (allowedExtensions.some(allowed => entry.name.endsWith(allowed))) {
                nodes.push({
                    name: entry.name,
                    path: relativePath,
                    type: 'file',
                    extension: ext,
                    size: stats.size,
                    modified: stats.mtime.toISOString()
                });
            }
        }
    }

    return nodes;
}

/**
 * Read file content
 */
async function readFile(relativePath: string, res: ServerResponse, baseDir: string) {
    try {
        const fullPath = path.join(baseDir, 'src', relativePath);
        
        // Security check: ensure path is within baseDir
        const normalizedPath = path.normalize(fullPath);
        const normalizedBase = path.normalize(path.join(baseDir, 'src'));
        
        if (!normalizedPath.startsWith(normalizedBase)) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Access denied: path outside allowed directory'
                }
            });
            return;
        }

        if (!fs.existsSync(fullPath)) {
            sendJSON(res, 404, {
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'File not found'
                }
            });
            return;
        }

        const content = fs.readFileSync(fullPath, 'utf-8');
        const stats = fs.statSync(fullPath);

        sendJSON(res, 200, {
            path: relativePath,
            content,
            size: stats.size,
            modified: stats.mtime.toISOString(),
            extension: path.extname(relativePath)
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Update file content
 */
async function updateFile(
    relativePath: string,
    req: IncomingMessage,
    res: ServerResponse,
    baseDir: string,
    allowedExtensions: string[]
) {
    try {
        const body = await readBody(req);
        
        if (!body.content && body.content !== '') {
            sendJSON(res, 400, {
                error: {
                    code: ErrorCode.INVALID_REQUEST,
                    message: 'Content is required'
                }
            });
            return;
        }

        const fullPath = path.join(baseDir, 'src', relativePath);
        
        // Security checks
        const normalizedPath = path.normalize(fullPath);
        const normalizedBase = path.normalize(path.join(baseDir, 'src'));
        
        if (!normalizedPath.startsWith(normalizedBase)) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Access denied: path outside allowed directory'
                }
            });
            return;
        }

        // Check file extension
        const ext = path.extname(relativePath);
        if (!allowedExtensions.some(allowed => relativePath.endsWith(allowed))) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: `File type not allowed: ${ext}`
                }
            });
            return;
        }

        if (!fs.existsSync(fullPath)) {
            sendJSON(res, 404, {
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'File not found'
                }
            });
            return;
        }

        // Write file
        fs.writeFileSync(fullPath, body.content, 'utf-8');
        const stats = fs.statSync(fullPath);

        sendJSON(res, 200, {
            path: relativePath,
            message: 'File updated successfully',
            size: stats.size,
            modified: stats.mtime.toISOString()
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Create new file
 */
async function createFile(
    req: IncomingMessage,
    res: ServerResponse,
    baseDir: string,
    allowedExtensions: string[]
) {
    try {
        const body = await readBody(req);
        
        if (!body.path) {
            sendJSON(res, 400, {
                error: {
                    code: ErrorCode.INVALID_REQUEST,
                    message: 'Path is required'
                }
            });
            return;
        }

        const fullPath = path.join(baseDir, 'src', body.path);
        
        // Security checks
        const normalizedPath = path.normalize(fullPath);
        const normalizedBase = path.normalize(path.join(baseDir, 'src'));
        
        if (!normalizedPath.startsWith(normalizedBase)) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Access denied: path outside allowed directory'
                }
            });
            return;
        }

        // Check file extension
        if (!allowedExtensions.some(allowed => body.path.endsWith(allowed))) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: `File type not allowed: ${path.extname(body.path)}`
                }
            });
            return;
        }

        if (fs.existsSync(fullPath)) {
            sendJSON(res, 409, {
                error: {
                    code: ErrorCode.CONFLICT,
                    message: 'File already exists'
                }
            });
            return;
        }

        // Create directory if needed
        const dir = path.dirname(fullPath);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // Write file
        fs.writeFileSync(fullPath, body.content || '', 'utf-8');
        const stats = fs.statSync(fullPath);

        sendJSON(res, 201, {
            path: body.path,
            message: 'File created successfully',
            size: stats.size,
            modified: stats.mtime.toISOString()
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Delete file
 */
async function deleteFile(
    relativePath: string,
    res: ServerResponse,
    baseDir: string,
    allowedExtensions: string[]
) {
    try {
        const fullPath = path.join(baseDir, 'src', relativePath);
        
        // Security checks
        const normalizedPath = path.normalize(fullPath);
        const normalizedBase = path.normalize(path.join(baseDir, 'src'));
        
        if (!normalizedPath.startsWith(normalizedBase)) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: 'Access denied: path outside allowed directory'
                }
            });
            return;
        }

        // Check file extension
        if (!allowedExtensions.some(allowed => relativePath.endsWith(allowed))) {
            sendJSON(res, 403, {
                error: {
                    code: ErrorCode.FORBIDDEN,
                    message: `File type not allowed: ${path.extname(relativePath)}`
                }
            });
            return;
        }

        if (!fs.existsSync(fullPath)) {
            sendJSON(res, 404, {
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'File not found'
                }
            });
            return;
        }

        // Delete file
        fs.unlinkSync(fullPath);

        sendJSON(res, 200, {
            path: relativePath,
            message: 'File deleted successfully'
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Handle metadata endpoint - returns ObjectQL metadata
 */
async function handleMetadata(
    method: string,
    req: IncomingMessage,
    res: ServerResponse,
    baseDir: string
) {
    if (method !== 'GET') {
        sendJSON(res, 405, {
            error: {
                code: ErrorCode.INVALID_REQUEST,
                message: 'Method not allowed'
            }
        });
        return;
    }

    try {
        const srcDir = path.join(baseDir, 'src');
        
        if (!fs.existsSync(srcDir)) {
            sendJSON(res, 404, {
                error: {
                    code: ErrorCode.NOT_FOUND,
                    message: 'Source directory not found'
                }
            });
            return;
        }

        // Find all object files
        const objectFiles = findFilesRecursive(srcDir, '.object.yml');
        const validationFiles = findFilesRecursive(srcDir, '.validation.yml');
        const permissionFiles = findFilesRecursive(srcDir, '.permission.yml');
        const appFiles = findFilesRecursive(srcDir, '.app.yml');
        const hookFiles = findFilesRecursive(srcDir, '.hook.ts');
        const actionFiles = findFilesRecursive(srcDir, '.action.ts');

        sendJSON(res, 200, {
            objects: objectFiles.map(f => path.relative(srcDir, f)),
            validations: validationFiles.map(f => path.relative(srcDir, f)),
            permissions: permissionFiles.map(f => path.relative(srcDir, f)),
            apps: appFiles.map(f => path.relative(srcDir, f)),
            hooks: hookFiles.map(f => path.relative(srcDir, f)),
            actions: actionFiles.map(f => path.relative(srcDir, f)),
            total: {
                objects: objectFiles.length,
                validations: validationFiles.length,
                permissions: permissionFiles.length,
                apps: appFiles.length,
                hooks: hookFiles.length,
                actions: actionFiles.length
            }
        });

    } catch (error: any) {
        sendJSON(res, 500, {
            error: {
                code: ErrorCode.INTERNAL_ERROR,
                message: error.message
            }
        });
    }
}

/**
 * Find files recursively by extension
 */
function findFilesRecursive(dir: string, extension: string): string[] {
    const results: string[] = [];
    
    if (!fs.existsSync(dir)) {
        return results;
    }

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        // Skip hidden files and node_modules
        if (entry.name.startsWith('.') || entry.name === 'node_modules') {
            continue;
        }

        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
            results.push(...findFilesRecursive(fullPath, extension));
        } else if (entry.isFile() && entry.name.endsWith(extension)) {
            results.push(fullPath);
        }
    }
    
    return results;
}
