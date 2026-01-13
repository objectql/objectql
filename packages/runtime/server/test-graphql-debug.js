const { ObjectQL } = require('@objectql/core');
const { createGraphQLHandler } = require('./dist/adapters/graphql');
const http = require('http');

class MockDriver {
    data = {
        user: [
            { _id: '1', name: 'Alice', email: 'alice@example.com' },
        ]
    };
    async init() {}
    async find(objectName) { 
        return this.data[objectName] || []; 
    }
    async findOne(objectName, id) { 
        const items = this.data[objectName] || [];
        const found = items.find(item => item._id === String(id));
        console.log('findOne called:', {objectName, id, found});
        return found || null;
    }
    async create(objectName, data) { 
        const newItem = { _id: '999', ...data };
        console.log('create called:', {objectName, data, newItem});
        return newItem;
    }
    async update() { return 1; }
    async delete() { return 1; }
    async count() { return 1; }
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

const handler = createGraphQLHandler(app);
const server = http.createServer(handler);

server.listen(3456, async () => {
    console.log('Test server listening on port 3456');
    
    // Test query
    const query = '{ user(id: "1") { id name email } }';
    
    const response = await fetch('http://localhost:3456/api/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
    });
    
    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));
    
    server.close();
});
