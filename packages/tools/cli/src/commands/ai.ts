/**
 * AI-powered commands for application generation and validation.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import chalk from 'chalk';
import OpenAI from 'openai';
import { Validator } from '@objectql/core';
import { ObjectConfig, AnyValidationRule, ValidationContext } from '@objectql/types';
import { glob } from 'fast-glob';

/**
 * System prompt for ObjectQL metadata generation
 */
const OBJECTQL_SYSTEM_PROMPT = `You are an expert ObjectQL architect. Your role is to generate valid ObjectQL metadata definitions in YAML format.

ObjectQL is a metadata-driven framework for building enterprise applications. Follow these guidelines:

1. **Object Definitions** (*.object.yml):
   - Use standard field types: text, number, boolean, select, date, datetime, lookup, currency, email, phone, url, textarea, formula
   - For relationships, use type: lookup with reference_to: <object_name>
   - Include required: true for mandatory fields
   - Add validation rules inline for field-level validation
   - Use clear, business-friendly labels

2. **Validation Rules** (*.validation.yml):
   - Support types: field, cross_field, business_rule, state_machine, unique, dependency, custom
   - Include clear error messages
   - Add ai_context to explain business intent
   - Use severity levels: error, warning, info

3. **Best Practices**:
   - Keep names lowercase with underscores (snake_case)
   - Use descriptive labels for UI display
   - Add helpful descriptions and help text
   - Include reasonable validation constraints
   - Consider user experience in field ordering

4. **File Naming Convention**:
   - Objects: <object_name>.object.yml (name is inferred from filename)
   - Validations: <object_name>.validation.yml
   - Forms: <form_name>.form.yml
   - Views: <view_name>.view.yml
   - Pages: <page_name>.page.yml

Generate clean, well-structured YAML that follows ObjectQL metadata standards.`;

/**
 * Validation system prompt
 */
const VALIDATION_SYSTEM_PROMPT = `You are an expert ObjectQL metadata validator. Your role is to:

1. Validate YAML structure and syntax
2. Check compliance with ObjectQL metadata specifications
3. Identify potential business logic issues
4. Suggest improvements for data modeling
5. Verify relationships and dependencies
6. Check for security and performance concerns

Provide constructive feedback with:
- Severity level (error, warning, info)
- Specific location in the file
- Clear explanation of the issue
- Suggested fix when possible`;

interface GenerateOptions {
    description: string;
    output?: string;
    type?: 'basic' | 'complete' | 'custom';
}

interface ValidateOptions {
    path: string;
    fix?: boolean;
    verbose?: boolean;
}

interface ChatOptions {
    initialPrompt?: string;
}

/**
 * Generate application metadata using AI
 */
export async function aiGenerate(options: GenerateOptions): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error(chalk.red('Error: OPENAI_API_KEY environment variable is not set.'));
        console.log(chalk.yellow('\nPlease set your OpenAI API key:'));
        console.log(chalk.cyan('  export OPENAI_API_KEY=your-api-key-here'));
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey });
    const outputDir = options.output || './src';

    console.log(chalk.blue('🤖 ObjectQL AI Generator\n'));
    console.log(chalk.gray(`Description: ${options.description}`));
    console.log(chalk.gray(`Output directory: ${outputDir}\n`));

    // Prepare the prompt based on type
    let systemPrompt = OBJECTQL_SYSTEM_PROMPT;
    let userPrompt = '';

    switch (options.type) {
        case 'basic':
            userPrompt = `Generate a minimal ObjectQL application for: ${options.description}

Include:
- 2-3 core objects with essential fields
- Basic relationships between objects
- Simple validation rules

Output format: Provide each file separately with clear filename headers.`;
            break;

        case 'complete':
            userPrompt = `Generate a complete ObjectQL enterprise application for: ${options.description}

Include:
- All necessary objects with comprehensive fields
- Relationships and lookups
- Validation rules with business logic
- Forms for data entry
- Views for data display
- Initial data (optional)

Output format: Provide each file separately with clear filename headers.`;
            break;

        default:
            userPrompt = `Generate ObjectQL metadata for: ${options.description}

Analyze the requirements and create appropriate objects, fields, relationships, and validation rules.

Output format: Provide each file separately with clear filename headers.`;
    }

    console.log(chalk.yellow('⏳ Generating metadata...'));

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: userPrompt }
            ],
            temperature: 0.7,
            max_tokens: 4000,
        });

        const response = completion.choices[0]?.message?.content;
        if (!response) {
            throw new Error('No response from AI');
        }

        // Parse the response and extract YAML files
        const files = parseAIResponse(response);

        if (files.length === 0) {
            console.log(chalk.yellow('\n⚠️  No valid metadata files generated. Response:'));
            console.log(response);
            return;
        }

        // Create output directory if it doesn't exist
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Write files
        console.log(chalk.green('\n✅ Generated files:'));
        for (const file of files) {
            const filePath = path.join(outputDir, file.filename);
            const fileDir = path.dirname(filePath);
            
            if (!fs.existsSync(fileDir)) {
                fs.mkdirSync(fileDir, { recursive: true });
            }

            fs.writeFileSync(filePath, file.content);
            console.log(chalk.green(`  ✓ ${file.filename}`));
        }

        console.log(chalk.blue(`\n📁 Files written to: ${outputDir}`));
        console.log(chalk.gray('\nNext steps:'));
        console.log(chalk.cyan('  1. Review the generated files'));
        console.log(chalk.cyan('  2. Run: objectql ai validate <path>'));
        console.log(chalk.cyan('  3. Test with: objectql serve'));

    } catch (error) {
        console.error(chalk.red('\n❌ Error generating metadata:'));
        if (error instanceof Error) {
            console.error(chalk.red(error.message));
        }
        process.exit(1);
    }
}

/**
 * Validate metadata files using AI
 */
export async function aiValidate(options: ValidateOptions): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error(chalk.red('Error: OPENAI_API_KEY environment variable is not set.'));
        console.log(chalk.yellow('\nNote: AI validation requires OpenAI API key.'));
        console.log(chalk.yellow('Falling back to basic validation...\n'));
        await basicValidate(options);
        return;
    }

    const openai = new OpenAI({ apiKey });

    console.log(chalk.blue('🔍 ObjectQL AI Validator\n'));

    // Find all metadata files
    const patterns = [
        '**/*.object.yml',
        '**/*.validation.yml',
        '**/*.form.yml',
        '**/*.view.yml',
        '**/*.page.yml',
        '**/*.action.yml',
    ];

    const files = await glob(patterns, {
        cwd: options.path,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    if (files.length === 0) {
        console.log(chalk.yellow('No metadata files found.'));
        return;
    }

    console.log(chalk.gray(`Found ${files.length} metadata file(s)\n`));

    let errorCount = 0;
    let warningCount = 0;

    for (const filePath of files) {
        const relativePath = path.relative(options.path, filePath);
        console.log(chalk.cyan(`\n📄 ${relativePath}`));

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            
            // First, validate YAML syntax
            try {
                yaml.load(content);
            } catch (yamlError) {
                console.log(chalk.red(`  ❌ YAML syntax error: ${yamlError instanceof Error ? yamlError.message : 'Unknown error'}`));
                errorCount++;
                continue;
            }

            // Use AI to validate
            const validationPrompt = `Validate this ObjectQL metadata file:

Filename: ${relativePath}

Content:
\`\`\`yaml
${content}
\`\`\`

Check for:
1. Compliance with ObjectQL metadata specifications
2. Business logic consistency
3. Data model best practices
4. Potential security issues
5. Performance considerations

Provide feedback in this format:
- [SEVERITY] Location: Issue description
  Fix: Suggested fix

Where SEVERITY is: ERROR, WARNING, or INFO`;

            const completion = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    { role: 'system', content: VALIDATION_SYSTEM_PROMPT },
                    { role: 'user', content: validationPrompt }
                ],
                temperature: 0.3,
                max_tokens: 1500,
            });

            const feedback = completion.choices[0]?.message?.content || 'No feedback provided';

            // Parse and display feedback
            const lines = feedback.split('\n');
            let hasIssues = false;

            for (const line of lines) {
                if (line.includes('[ERROR]')) {
                    console.log(chalk.red(`  ${line}`));
                    errorCount++;
                    hasIssues = true;
                } else if (line.includes('[WARNING]')) {
                    console.log(chalk.yellow(`  ${line}`));
                    warningCount++;
                    hasIssues = true;
                } else if (line.includes('[INFO]')) {
                    console.log(chalk.blue(`  ${line}`));
                    hasIssues = true;
                } else if (line.trim() && hasIssues) {
                    console.log(chalk.gray(`  ${line}`));
                }
            }

            if (!hasIssues) {
                console.log(chalk.green('  ✓ No issues found'));
            }

        } catch (error) {
            console.log(chalk.red(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            errorCount++;
        }
    }

    // Summary
    console.log(chalk.blue('\n' + '='.repeat(60)));
    console.log(chalk.blue('Validation Summary:'));
    console.log(chalk.gray(`  Files checked: ${files.length}`));
    
    if (errorCount > 0) {
        console.log(chalk.red(`  Errors: ${errorCount}`));
    }
    if (warningCount > 0) {
        console.log(chalk.yellow(`  Warnings: ${warningCount}`));
    }
    if (errorCount === 0 && warningCount === 0) {
        console.log(chalk.green('  ✓ All files validated successfully!'));
    }

    if (errorCount > 0) {
        process.exit(1);
    }
}

/**
 * Basic validation without AI (fallback)
 */
async function basicValidate(options: ValidateOptions): Promise<void> {
    const patterns = [
        '**/*.object.yml',
        '**/*.validation.yml',
    ];

    const files = await glob(patterns, {
        cwd: options.path,
        absolute: true,
        ignore: ['**/node_modules/**', '**/dist/**', '**/build/**'],
    });

    if (files.length === 0) {
        console.log(chalk.yellow('No metadata files found.'));
        return;
    }

    console.log(chalk.gray(`Found ${files.length} metadata file(s)\n`));

    let errorCount = 0;
    const validator = new Validator({ language: 'en' });

    for (const filePath of files) {
        const relativePath = path.relative(options.path, filePath);
        console.log(chalk.cyan(`📄 ${relativePath}`));

        try {
            const content = fs.readFileSync(filePath, 'utf-8');
            const data = yaml.load(content) as any;

            // Validate YAML structure
            if (!data || typeof data !== 'object') {
                console.log(chalk.red('  ❌ Invalid YAML structure'));
                errorCount++;
                continue;
            }

            // Validate based on file type
            if (filePath.endsWith('.validation.yml')) {
                if (!data.rules || !Array.isArray(data.rules)) {
                    console.log(chalk.yellow('  ⚠️  No validation rules found'));
                } else {
                    console.log(chalk.green(`  ✓ ${data.rules.length} validation rule(s) found`));
                }
            } else if (filePath.endsWith('.object.yml')) {
                if (!data.fields || typeof data.fields !== 'object') {
                    console.log(chalk.red('  ❌ No fields defined'));
                    errorCount++;
                } else {
                    const fieldCount = Object.keys(data.fields).length;
                    console.log(chalk.green(`  ✓ ${fieldCount} field(s) defined`));
                }
            }

        } catch (error) {
            console.log(chalk.red(`  ❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`));
            errorCount++;
        }
    }

    console.log(chalk.blue('\n' + '='.repeat(60)));
    if (errorCount === 0) {
        console.log(chalk.green('✓ Basic validation passed'));
    } else {
        console.log(chalk.red(`❌ Found ${errorCount} error(s)`));
        process.exit(1);
    }
}

/**
 * Interactive AI chat for metadata assistance
 */
export async function aiChat(options: ChatOptions): Promise<void> {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        console.error(chalk.red('Error: OPENAI_API_KEY environment variable is not set.'));
        process.exit(1);
    }

    const openai = new OpenAI({ apiKey });

    console.log(chalk.blue('💬 ObjectQL AI Assistant\n'));
    console.log(chalk.gray('Ask me anything about ObjectQL metadata, data modeling, or best practices.'));
    console.log(chalk.gray('Type "exit" to quit.\n'));

    const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout,
    });

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: OBJECTQL_SYSTEM_PROMPT }
    ];

    if (options.initialPrompt) {
        messages.push({ role: 'user', content: options.initialPrompt });
    }

    const askQuestion = () => {
        readline.question(chalk.cyan('You: '), async (input: string) => {
            if (input.toLowerCase() === 'exit') {
                console.log(chalk.blue('\nGoodbye! 👋'));
                readline.close();
                return;
            }

            if (!input.trim()) {
                askQuestion();
                return;
            }

            messages.push({ role: 'user', content: input });

            try {
                const completion = await openai.chat.completions.create({
                    model: 'gpt-4',
                    messages: messages,
                    temperature: 0.7,
                });

                const response = completion.choices[0]?.message?.content || 'No response';
                messages.push({ role: 'assistant', content: response });

                console.log(chalk.green('\nAssistant: ') + response + '\n');
            } catch (error) {
                console.error(chalk.red('\nError: ') + (error instanceof Error ? error.message : 'Unknown error') + '\n');
            }

            askQuestion();
        });
    };

    askQuestion();
}

/**
 * Parse AI response and extract YAML files
 */
function parseAIResponse(response: string): Array<{ filename: string; content: string }> {
    const files: Array<{ filename: string; content: string }> = [];
    
    // Pattern 1: Files with explicit headers like "# filename.object.yml" or "File: filename.object.yml"
    const fileBlockPattern = /(?:^|\n)(?:#|File:)\s*([a-zA-Z0-9_-]+\.[a-z]+\.yml)\s*\n```(?:yaml|yml)?\n([\s\S]*?)```/gi;
    let match;
    
    while ((match = fileBlockPattern.exec(response)) !== null) {
        files.push({
            filename: match[1],
            content: match[2].trim(),
        });
    }

    // Pattern 2: Generic code blocks without explicit filenames
    if (files.length === 0) {
        const codeBlockPattern = /```(?:yaml|yml)\n([\s\S]*?)```/g;
        let blockIndex = 0;
        
        while ((match = codeBlockPattern.exec(response)) !== null) {
            const content = match[1].trim();
            // Try to infer filename from content
            const nameMatch = content.match(/^#?\s*([a-zA-Z0-9_-]+)\.(?:object|validation|form|view|page)\.yml/m);
            const filename = nameMatch ? nameMatch[1] : `generated_${blockIndex}.object.yml`;
            
            files.push({
                filename,
                content,
            });
            blockIndex++;
        }
    }

    return files;
}
