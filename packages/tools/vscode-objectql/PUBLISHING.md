# Publishing the VSCode Extension

This guide explains how to publish the ObjectQL VSCode extension to the Visual Studio Code Marketplace using the automated GitHub Actions workflow.

## Prerequisites

### 1. Visual Studio Code Publisher Account

You need a publisher account to publish extensions:

1. Visit [Visual Studio Marketplace](https://marketplace.visualstudio.com/manage)
2. Sign in with your Azure DevOps account (or create one)
3. Create a publisher if you don't have one
4. Note your publisher ID (must match the `publisher` field in `package.json`)

### 2. Personal Access Token (PAT)

Create a PAT for publishing:

1. Go to [Azure DevOps](https://dev.azure.com/)
2. Click on User Settings → Personal Access Tokens
3. Create a new token with:
   - **Organization:** All accessible organizations
   - **Expiration:** Set appropriate expiration date
   - **Scopes:** Select `Marketplace` → `Manage`
4. Copy the token (you won't be able to see it again)

### 3. Configure GitHub Secret

Add the PAT as a GitHub repository secret:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `VSCE_PAT`
5. Value: Paste your Personal Access Token
6. Click "Add secret"

## Publishing Methods

### Method 1: Manual Workflow Dispatch (Recommended)

This method allows you to publish on-demand through the GitHub Actions UI:

1. Go to the repository on GitHub
2. Click on "Actions" tab
3. Select "Publish VSCode Extension" workflow
4. Click "Run workflow" button
5. Configure options:
   - **Version:** Leave empty to use current version, or specify a version (e.g., `2.0.1`)
   - **Dry run:** Check to only package (test build) without publishing
6. Click "Run workflow"

**Use Cases:**
- **Test Build:** Enable "Dry run" to package and download the VSIX for local testing
- **Regular Release:** Leave defaults to publish the current version
- **Version Bump:** Specify a new version to update and publish

### Method 2: Git Tag-based Release

Automatically publish when you create a version tag:

```bash
# Create and push a tag for the VSCode extension
git tag vscode-v2.0.1
git push origin vscode-v2.0.1
```

This will:
- Automatically build and publish the extension
- Create a GitHub Release with the VSIX file attached
- Make the extension available on the VSCode Marketplace

## Workflow Steps

The automated workflow performs the following steps:

1. **Environment Setup**
   - Checkout repository
   - Setup Node.js 20
   - Install pnpm
   - Cache dependencies

2. **Build**
   - Install all monorepo dependencies
   - Build the entire monorepo
   - Compile the VSCode extension TypeScript code

3. **Package**
   - Run `vsce package` to create the `.vsix` file
   - Upload VSIX as GitHub Actions artifact (available for 30 days)

4. **Publish** (skipped if dry run)
   - Authenticate with VSCE_PAT
   - Publish to VSCode Marketplace using `vsce publish`

5. **Release** (for git tags only)
   - Create GitHub Release
   - Attach VSIX file to the release
   - Generate release notes

## Version Management

The extension version is managed in `packages/tools/vscode-objectql/package.json`:

```json
{
  "name": "vscode-objectql",
  "version": "2.0.0",
  ...
}
```

### Updating the Version

**Option 1: Manual (before triggering workflow)**
```bash
cd packages/tools/vscode-objectql
npm version patch  # 2.0.0 → 2.0.1
npm version minor  # 2.0.0 → 2.1.0
npm version major  # 2.0.0 → 3.0.0
git add package.json
git commit -m "chore(vscode): bump version to X.Y.Z"
git push
```

**Option 2: Automatic (via workflow input)**

When running the workflow manually, you can specify the version in the input field, and the workflow will update `package.json` before publishing.

## Testing Before Publishing

Always test the extension locally before publishing:

### 1. Build Locally

```bash
# From repository root
pnpm install
pnpm run build

# Navigate to extension directory
cd packages/tools/vscode-objectql

# Compile TypeScript
pnpm run compile

# Package the extension
pnpm run package
```

This creates a `.vsix` file in the `packages/tools/vscode-objectql` directory.

### 2. Install in VSCode

1. Open VSCode
2. Go to Extensions view (Ctrl+Shift+X / Cmd+Shift+X)
3. Click the "..." menu → "Install from VSIX..."
4. Select the generated `.vsix` file
5. Test all features

### 3. Dry Run with Workflow

Use the workflow with "Dry run" enabled to test the CI/CD build:

1. Run workflow with dry run option checked
2. Download the VSIX artifact from the workflow run
3. Install and test in VSCode

## Troubleshooting

### "VSCE_PAT secret is not set"

**Problem:** The workflow cannot find the authentication token.

**Solution:** 
1. Verify the secret is named exactly `VSCE_PAT`
2. Check it exists in Settings → Secrets and variables → Actions
3. Ensure it has not expired

### "Error: Failed request: Unauthorized (401)"

**Problem:** The PAT is invalid or has expired.

**Solution:**
1. Generate a new PAT in Azure DevOps
2. Update the `VSCE_PAT` secret in GitHub
3. Ensure the PAT has `Marketplace: Manage` scope

### "Error: Publisher name does not match"

**Problem:** The publisher in `package.json` doesn't match your VSCode Marketplace publisher.

**Solution:**
1. Check your publisher ID at https://marketplace.visualstudio.com/manage
2. Update the `publisher` field in `packages/tools/vscode-objectql/package.json`
3. Commit and push the change

### "Extension already exists with version X.Y.Z"

**Problem:** You're trying to publish a version that already exists.

**Solution:**
1. Increment the version number in `package.json`
2. Or specify a new version when running the workflow

## Best Practices

1. **Version Strategy**
   - Use semantic versioning (MAJOR.MINOR.PATCH)
   - Increment PATCH for bug fixes
   - Increment MINOR for new features
   - Increment MAJOR for breaking changes

2. **Pre-release Testing**
   - Always test locally before publishing
   - Use dry run to validate the CI build
   - Review the packaged VSIX contents

3. **Changelog**
   - Update `CHANGELOG.md` before publishing
   - Document all changes since last release
   - Follow Keep a Changelog format

4. **Security**
   - Rotate PAT tokens regularly
   - Use repository secrets, never commit tokens
   - Set appropriate token expiration dates

5. **Release Notes**
   - Use git tags for automatic release notes
   - Write descriptive commit messages
   - Link to issues/PRs in commits

## Monitoring

After publishing:

1. **VSCode Marketplace**
   - Check https://marketplace.visualstudio.com/items?itemName=objectstack-ai.vscode-objectql
   - Verify the new version appears
   - Test installation via VSCode

2. **GitHub Release**
   - Check the Releases page for the new version
   - Verify VSIX file is attached
   - Review auto-generated release notes

3. **User Feedback**
   - Monitor marketplace reviews
   - Watch GitHub issues for bug reports
   - Check analytics for install/update metrics

## Related Documentation

- [VSCode Extension Publishing](https://code.visualstudio.com/api/working-with-extensions/publishing-extension)
- [vsce CLI Reference](https://github.com/microsoft/vscode-vsce)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
