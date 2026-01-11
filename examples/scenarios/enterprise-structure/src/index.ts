/**
 * Enterprise Structure Example - Main Entry Point
 * 
 * This demonstrates how to organize metadata for large-scale ObjectQL applications
 * using a modular, domain-driven structure.
 */

import { ObjectQL } from '@objectql/core';
import { KnexDriver } from '@objectql/driver-knex';
import path from 'path';

/**
 * Initialize ObjectQL with enterprise structure
 */
export async function initializeApp() {
  const app = new ObjectQL({
    datasources: {
      default: new KnexDriver({
        client: 'sqlite3',
        connection: {
          filename: path.join(__dirname, '../data/enterprise.db'),
        },
        useNullAsDefault: true,
      }),
    },
  });

  // Load metadata from all modules
  // ObjectQL will automatically discover and merge all .object.yml files
  await app.connect();
  
  // Register objects from each module
  // In a real application, you might use dynamic imports or a plugin system
  await registerCoreObjects(app);
  await registerCRMModule(app);
  await registerHRModule(app);
  await registerFinanceModule(app);
  await registerProjectModule(app);
  await registerExtensions(app);

  return app;
}

/**
 * Register core objects (foundation layer)
 */
async function registerCoreObjects(app: ObjectQL) {
  // Load objects from core/objects/
  // user, organization, attachment
}

/**
 * Register CRM module
 */
async function registerCRMModule(app: ObjectQL) {
  // Load objects from modules/crm/objects/
  // crm_account, crm_contact, crm_opportunity, crm_lead
}

/**
 * Register HR module
 */
async function registerHRModule(app: ObjectQL) {
  // Load objects from modules/hr/objects/
  // hr_employee, hr_department, hr_position, hr_timesheet
}

/**
 * Register Finance module
 */
async function registerFinanceModule(app: ObjectQL) {
  // Load objects from modules/finance/objects/
  // finance_invoice, finance_payment, finance_expense, finance_budget
}

/**
 * Register Project module
 */
async function registerProjectModule(app: ObjectQL) {
  // Load objects from modules/project/objects/
  // project_project, project_task, project_milestone, project_timesheet_entry
}

/**
 * Register extensions (override layer)
 */
async function registerExtensions(app: ObjectQL) {
  // Load extensions from extensions/
  // These will merge with existing objects
}

/**
 * Example usage
 */
async function main() {
  const app = await initializeApp();
  
  console.log('✅ ObjectQL initialized with enterprise structure');
  console.log('📦 Modules loaded:');
  console.log('   - Core (user, organization, attachment)');
  console.log('   - CRM (account, contact, opportunity, lead)');
  console.log('   - HR (employee, department, position, timesheet)');
  console.log('   - Finance (invoice, payment, expense, budget)');
  console.log('   - Project (project, task, milestone, timesheet_entry)');
  
  // Example query: Get all active employees
  const employees = await app.find({
    object: 'hr_employee',
    filters: [['status', '=', 'active']],
    limit: 10,
  });
  
  console.log(`\n👥 Found ${employees.length} active employees`);
  
  await app.disconnect();
}

// Run if executed directly
if (require.main === module) {
  main().catch(console.error);
}

export default initializeApp;
