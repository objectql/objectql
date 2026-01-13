const { ObjectQL } = require('@objectql/core');

class MockDriver {
    async init() {}
    async find() { return []; }
    async findOne() { return null; }
    async create() { return {}; }
    async update() { return 1; }
    async delete() { return 1; }
    async count() { return 0; }
    async execute() {}
}

const app = new ObjectQL({
    datasources: {
        default: new MockDriver()
    }
});

app.metadata.register('object', {
    type: 'object',
    id: 'user',
    content: {
        name: 'user',
        label: 'User',
        fields: {
            name: { type: 'text', label: 'Name' },
            email: { type: 'email', label: 'Email' }
        }
    }
});

console.log('Registered objects:');
const objects = app.metadata.list('object');
console.log(JSON.stringify(objects, null, 2));
