import { Command } from 'commander';
import { registerLifecycleCommands } from './register/lifecycle';
import { registerScaffoldCommands } from './register/scaffold';
import { registerDatabaseCommands } from './register/database';
import { registerAiCommands } from './register/ai';
import { registerToolsCommands } from './register/tools';
import { registerI18nCommands } from './register/i18n';

const program = new Command();

program
  .name('objectql')
  .description('ObjectQL CLI tool - The ObjectStack AI Protocol Interface')
  .version('1.5.0');

// Register all command groups
registerLifecycleCommands(program);
registerScaffoldCommands(program);
registerDatabaseCommands(program);
registerAiCommands(program);
registerToolsCommands(program);
registerI18nCommands(program);

program.parse(process.argv);
