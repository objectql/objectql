"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const createFile_1 = require("./commands/createFile");
const validate_1 = require("./commands/validate");
const ObjectIndex_1 = require("./services/ObjectIndex");
const ObjectDefinitionProvider_1 = require("./providers/ObjectDefinitionProvider");
const ObjectCompletionProvider_1 = require("./providers/ObjectCompletionProvider");
const constants_1 = require("./utils/constants");
let objectIndex;
/**
 * Extension activation function
 * Called when VSCode activates the extension
 */
function activate(context) {
    console.log('ObjectQL extension is now active!');
    // Initialize Services
    objectIndex = new ObjectIndex_1.ObjectIndex();
    // Register Commands
    context.subscriptions.push(vscode.commands.registerCommand('objectql.newObject', () => (0, createFile_1.createNewFile)(context, 'object')), vscode.commands.registerCommand('objectql.newValidation', () => (0, createFile_1.createNewFile)(context, 'validation')), vscode.commands.registerCommand('objectql.newPermission', () => (0, createFile_1.createNewFile)(context, 'permission')), vscode.commands.registerCommand('objectql.newWorkflow', () => (0, createFile_1.createNewFile)(context, 'workflow')), vscode.commands.registerCommand('objectql.validateSchema', validate_1.validateCurrentFile));
    // Register Providers
    const selector = { language: constants_1.LANGUAGES.YAML, scheme: constants_1.SCHEMES.FILE };
    context.subscriptions.push(vscode.languages.registerDefinitionProvider(selector, new ObjectDefinitionProvider_1.ObjectDefinitionProvider(objectIndex)), vscode.languages.registerCompletionItemProvider(selector, new ObjectCompletionProvider_1.ObjectCompletionProvider(objectIndex), ' '));
    // Clean up
    context.subscriptions.push(objectIndex);
    // Show welcome message on first activation
    const hasShownWelcome = context.globalState.get('objectql.hasShownWelcome', false);
    if (!hasShownWelcome) {
        showWelcomeMessage(context);
    }
}
/**
 * Extension deactivation function
 */
function deactivate() {
    if (objectIndex) {
        objectIndex.dispose();
    }
    console.log('ObjectQL extension is now deactivated');
}
/**
 * Show welcome message
 */
function showWelcomeMessage(context) {
    vscode.window.showInformationMessage('Welcome to ObjectQL! Create your first object definition with "ObjectQL: New Object Definition" command.', 'Get Started', 'Documentation').then((selection) => {
        if (selection === 'Get Started') {
            vscode.commands.executeCommand('objectql.newObject');
        }
        else if (selection === 'Documentation') {
            vscode.env.openExternal(vscode.Uri.parse('https://github.com/objectstack-ai/objectql'));
        }
    });
    context.globalState.update('objectql.hasShownWelcome', true);
}
//# sourceMappingURL=extension.js.map