#!/usr/bin/env node
/**
 * Test script to verify namespace functionality
 */
const path = require('path');

// Use built files from the dist directories
const { ObjectQL } = require(path.join(__dirname, '../packages/foundation/core/dist'));
const { SqlDriver } = require(path.join(__dirname, '../packages/drivers/sql/dist'));
const { ObjectLoader } = require(path.join(__dirname, '../packages/foundation/platform-node/dist'));

async function testNamespace() {
    console.log('Testing Package Namespace Feature...\n');
    
    // Create ObjectQL instance
    const db = new ObjectQL({
        datasources: {
            default: new SqlDriver({
                client: 'sqlite3',
                connection: { filename: ':memory:' },
                useNullAsDefault: true
            })
        }
    });

    // Create loader with namespace configuration
    const loader = new ObjectLoader(db.metadata, {
        '@example/audit-log': 'audit'
    });

    // Load the audit-log plugin
    const pluginDir = path.join(__dirname, '../examples/plugins/audit-log/src');
    loader.load(pluginDir, '@example/audit-log');

    // Check if objects were loaded with namespace
    const configs = db.getConfigs();
    
    console.log('Loaded Objects:');
    Object.keys(configs).forEach(name => {
        const obj = configs[name];
        console.log(`  - ${name}`);
        if (obj.namespace) {
            console.log(`    Namespace: ${obj.namespace}`);
        }
        if (obj.fields) {
            const lookupFields = Object.entries(obj.fields)
                .filter(([_, field]) => field.type === 'lookup')
                .map(([name, field]) => ({ name, reference_to: field.reference_to }));
            if (lookupFields.length > 0) {
                console.log('    Lookup Fields:');
                lookupFields.forEach(f => {
                    console.log(`      ${f.name} -> ${f.reference_to}`);
                });
            }
        }
    });

    // Verify namespace was applied
    const hasAuditNote = 'audit__note' in configs;
    const hasPlainNote = 'note' in configs;
    
    console.log('\nVerification:');
    console.log(`  ✓ Object 'audit__note' exists: ${hasAuditNote}`);
    console.log(`  ✓ Object 'note' (without namespace) does NOT exist: ${!hasPlainNote}`);
    
    if (hasAuditNote) {
        const auditNote = configs['audit__note'];
        console.log(`  ✓ Namespace property set: ${auditNote.namespace === 'audit'}`);
        console.log(`  ✓ Label unchanged: ${auditNote.label}`);
    }
    
    if (hasAuditNote && hasPlainNote) {
        console.error('\n❌ FAIL: Both namespaced and non-namespaced objects exist!');
        process.exit(1);
    } else if (hasAuditNote) {
        console.log('\n✅ SUCCESS: Namespace feature working correctly!');
    } else {
        console.error('\n❌ FAIL: Expected object not found!');
        process.exit(1);
    }
}

testNamespace().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
