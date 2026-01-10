import { ObjectQL } from '../src';
import { MockDriver } from './utils';

describe('ObjectQL Hooks', () => {
    let app: ObjectQL;
    let driver: MockDriver;

    beforeEach(async () => {
        driver = new MockDriver();
        app = new ObjectQL({
            datasources: {
                default: driver
            },
            objects: {
                'post': {
                    name: 'post',
                    fields: {
                        title: { type: 'text' },
                        status: { type: 'text' }
                    }
                }
            }
        });
        await app.init();
    });

    it('should trigger beforeFind and modify query', async () => {
        const repo = app.createContext({}).object('post');
        
        let hookTriggered = false;
        app.on('beforeFind', 'post', async (ctx) => {
            hookTriggered = true;
            ctx.query = { ...ctx.query, filters: [['status', '=', 'published']] };
        });

        // Mock driver find to check query
        const spyFind = jest.spyOn(driver, 'find');

        await repo.find({});
        
        expect(hookTriggered).toBe(true);
        expect(spyFind).toHaveBeenCalledWith('post', { filters: [['status', '=', 'published']] }, expect.any(Object));
    });

    it('should trigger afterCreate and return result', async () => {
        const repo = app.createContext({ userId: 'u1' }).object('post');
        
        app.on('afterCreate', 'post', async (ctx) => {
            if (ctx.result) {
                ctx.result.augmented = true;
            }
        });

        const created = await repo.create({ title: 'New Post' });
        
        expect(created.id).toBeDefined();
        expect(created.created_by).toBe('u1');
        expect(created.augmented).toBe(true);
    });
});
