# Release Workflow Setup Guide

This guide explains how to configure the repository and organization settings required for the automated release workflow to function correctly.

## Problem

If you encounter the following error in the Release workflow:

```
GitHub Actions is not permitted to create or approve pull requests
```

This means the required repository setting is not enabled.

## Solution

GitHub has a security setting that controls whether GitHub Actions workflows can create pull requests. This setting must be enabled for the `changesets/action` to create release PRs automatically.

### For Organization Repositories

If your repository belongs to an organization (like `objectstack-ai/objectql`), you must enable the setting at **both** the organization and repository levels:

#### Step 1: Enable at Organization Level

1. Navigate to your organization settings:
   ```
   https://github.com/organizations/YOUR_ORG/settings/actions
   ```
   Replace `YOUR_ORG` with your organization name (e.g., `objectstack-ai`)

2. Under **Actions > General > Workflow permissions**:
   - Scroll down to find the section "Workflow permissions"
   - Check the box: **☑ Allow GitHub Actions to create and approve pull requests**
   - Click **Save**

> **Note:** You must be an organization owner to change these settings.

#### Step 2: Enable at Repository Level

After enabling at the organization level, enable it for the specific repository:

1. Navigate to your repository settings:
   ```
   https://github.com/YOUR_ORG/YOUR_REPO/settings/actions
   ```
   For this repo: `https://github.com/objectstack-ai/objectql/settings/actions`

2. Under **Actions > General > Workflow permissions**:
   - Check the box: **☑ Allow GitHub Actions to create and approve pull requests**
   - Click **Save**

> **Note:** This option may be grayed out until you enable it at the organization level first.

### For Personal Repositories

If your repository is under a personal account (not an organization):

1. Navigate to your repository settings:
   ```
   https://github.com/USERNAME/REPO/settings/actions
   ```

2. Under **Actions > General > Workflow permissions**:
   - Check the box: **☑ Allow GitHub Actions to create and approve pull requests**
   - Click **Save**

## How the Release Workflow Works

Once the settings are enabled:

1. **On merge to `main`**: The workflow runs automatically
2. **Changesets detected**: If there are `.changeset/*.md` files, the action:
   - Creates/updates a PR titled "Version Packages"
   - Updates CHANGELOG.md files
   - Bumps package.json versions
3. **Manual merge**: When you merge the "Version Packages" PR:
   - The workflow publishes packages to npm
   - Creates GitHub releases with tags

## Troubleshooting

### Error: "GitHub Actions is not permitted to create or approve pull requests"

**Cause**: The repository/organization setting is not enabled.

**Solution**: Follow the steps above to enable the setting.

### Error: "Resource not accessible by integration"

**Cause**: The workflow doesn't have sufficient permissions.

**Solution**: The workflow already has the correct permissions defined:
```yaml
permissions:
  contents: write
  issues: write
  pull-requests: write
```

If you still see this error, check that you haven't restricted the `GITHUB_TOKEN` permissions in your repository settings.

### The workflow runs but doesn't create a PR

**Cause**: There are no changesets to process.

**Solution**: Contributors should add changesets for their changes:
```bash
pnpm changeset
```

This creates a markdown file in `.changeset/` describing the change and version bump type.

## Security Considerations

Enabling "Allow GitHub Actions to create and approve pull requests" is safe when:

- ✅ Your workflow files (`.github/workflows/`) are protected by branch protection rules
- ✅ You review workflow changes in PRs before merging
- ✅ You trust the actions used in your workflows (we use official actions from `changesets`, `actions`, and `pnpm`)

The default `GITHUB_TOKEN` has limited scope and cannot:
- Push to protected branches without passing checks
- Bypass branch protection rules
- Access organization secrets beyond those explicitly granted

## Additional Resources

- [GitHub Docs: Managing GitHub Actions settings](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-github-actions-settings-for-a-repository)
- [Changesets Documentation](https://github.com/changesets/changesets)
- [GitHub Blog: Prevent Actions from creating PRs](https://github.blog/changelog/2022-05-03-github-actions-prevent-github-actions-from-creating-and-approving-pull-requests/)

## Quick Reference

| Level | URL Template | Required For |
|-------|-------------|--------------|
| **Organization** | `https://github.com/organizations/{ORG}/settings/actions` | Organization repos (enable first) |
| **Repository** | `https://github.com/{ORG}/{REPO}/settings/actions` | All repos (enable after org) |
| **Personal** | `https://github.com/{USER}/{REPO}/settings/actions` | Personal repos only |

---

**Last Updated**: January 2026  
**Maintainer**: ObjectStack AI Team
