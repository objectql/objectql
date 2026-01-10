import { ObjectQL } from '@objectql/core';
import * as path from 'path';

const db = new ObjectQL({
    connection: `sqlite://${path.join(__dirname, 'preset.sqlite3')}`,
    // Load the project-management capabilities as a preset
    presets: ['@example/project-management'],
    plugins: ['@example/plugin-audit']
});

export default db;
