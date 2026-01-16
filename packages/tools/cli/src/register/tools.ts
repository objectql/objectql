import { Command } from 'commander';
import { doctorCommand, validateCommand } from '../commands/doctor';
import { startRepl } from '../commands/repl';
import { test } from '../commands/test';
import { lint } from '../commands/lint';
import { format } from '../commands/format';

export function registerToolsCommands(program: Command) {
    program
        .command('doctor')
        .description('Check environment and configuration health')
        .action(async () => {
            await doctorCommand();
        });

    program
        .command('validate')
        .description('Validate all metadata files')
        .option('-d, --dir <path>', 'Directory to validate', '.')
        .action(async (options) => {
            await validateCommand(options);
        });

    program
        .command('repl')
        .description('Start interactive REPL')
        .option('-c, --config <path>', 'Path to objectql.config.ts')
        .action(async (options) => {
            await startRepl(options.config);
        });

    program
        .command('test')
        .description('Run tests')
        .action(async (options) => {
            await test(options);
        });

    program
        .command('lint')
        .description('Lint metadata files')
        .action(async (options) => {
            await lint(options);
        });

    program
        .command('format')
        .description('Format metadata files')
        .action(async (options) => {
            await format(options);
        });
}
