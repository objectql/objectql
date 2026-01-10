import { ObjectConfig, ObjectRegistry } from '@objectql/types';

export function registerObjectHelper(metadata: ObjectRegistry, object: ObjectConfig) {
    // Normalize fields
    if (object.fields) {
        for (const [key, field] of Object.entries(object.fields)) {
            if (!field.name) {
                field.name = key;
            }
        }
    }
    metadata.register('object', {
        type: 'object',
        id: object.name,
        content: object
    });
}

export function getConfigsHelper(metadata: ObjectRegistry): Record<string, ObjectConfig> {
    const result: Record<string, ObjectConfig> = {};
    const objects = metadata.list<ObjectConfig>('object');
    for (const obj of objects) {
        result[obj.name] = obj;
    }
    return result;
}
