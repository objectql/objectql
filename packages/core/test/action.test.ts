import { ObjectQL } from '../src';
import { MockDriver } from './utils';

describe('ObjectQL Actions', () => {
    let app: ObjectQL;
    let driver: MockDriver;

    beforeEach(async () => {
        driver = new MockDriver();
        app = new ObjectQL({
            datasources: {
                default: driver
            },
            objects: {
                'invoice': {
                    name: 'invoice',
                    fields: {
                        amount: { type: 'number' },
                        status: { type: 'text' }
                    },
                    actions: {
                        'pay': {
                            label: 'Pay Invoice',
                            params: {
                                method: { type: 'text' }
                            }
                        }
                    }
                }
            }
        });
        await app.init();
    });

    it('should register and execute an action', async () => {
        const repo = app.createContext({}).object('invoice');
        
        let actionCalled = false;
        app.registerAction('invoice', 'pay', async (ctx) => {
            actionCalled = true;
            expect(ctx.objectName).toBe('invoice');
            expect(ctx.actionName).toBe('pay');
            expect(ctx.id).toBe('inv-123');
            expect(ctx.params.method).toBe('credit_card');
            return { success: true, paid: true };
        });

        const result = await repo.execute('pay', 'inv-123', { method: 'credit_card' });
        
        expect(actionCalled).toBe(true);
        expect(result.success).toBe(true);
    });

    it('should throw error if action not registered', async () => {
        const repo = app.createContext({}).object('invoice');
        await expect(repo.execute('refund', '1', {})).rejects.toThrow("Action 'refund' not found for object 'invoice'");
    });
});
