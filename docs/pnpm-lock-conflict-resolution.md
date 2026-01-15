# pnpm Lock File Merge Conflict Resolution

## Problem

When multiple developers work on the same repository and modify dependencies in parallel, merging branches often results in conflicts in the `pnpm-lock.yaml` file. These conflicts can be tedious to resolve manually.

## Solution

This repository includes an **automated merge driver** for `pnpm-lock.yaml` that resolves conflicts automatically by regenerating the lockfile using `pnpm install`.

## How It Works

1. **`.gitattributes`**: Configures Git to use a custom merge driver for `pnpm-lock.yaml`
2. **`scripts/pnpm-merge-driver.sh`**: The merge driver script that automatically runs `pnpm install --lockfile-only` to regenerate the lockfile when conflicts occur
3. **Git configuration**: Local git config that points to the merge driver script

## Setup Instructions

### For Developers

After cloning this repository, run the setup script once:

```bash
./scripts/setup-merge-driver.sh
```

This will configure your local Git repository to use the automatic merge driver for `pnpm-lock.yaml`.

### What Happens During a Merge?

When you merge a branch that has conflicting changes in `pnpm-lock.yaml`:

1. Git detects the conflict and invokes the custom merge driver
2. The merge driver runs `pnpm install --lockfile-only` to regenerate the lockfile
3. The newly generated lockfile incorporates dependencies from both branches
4. The merge completes automatically without manual intervention

### Example Workflow

```bash
# Start merging a branch
git merge feature-branch

# If there's a pnpm-lock.yaml conflict:
# ✅ The merge driver automatically resolves it
# ✅ pnpm install is run to regenerate the lockfile
# ✅ The merge completes successfully

# Verify the changes
git diff --cached pnpm-lock.yaml

# Commit the merge
git commit
```

### Important Notes

⚠️ **Prerequisites:**
- You must have `pnpm` installed and available in your PATH
- The repository enforces `pnpm >= 10.0.0` (see `package.json` engines field)

⚠️ **Package.json Conflicts:**
- If there are conflicts in `package.json` files, you must resolve those manually **before** the merge driver can successfully regenerate `pnpm-lock.yaml`
- The merge driver will fail if `pnpm install` fails due to invalid `package.json` files

⚠️ **Review After Merge:**
- Always review the regenerated `pnpm-lock.yaml` to ensure dependencies are correct
- Run tests after merging to verify everything works as expected

## Manual Resolution (Fallback)

If the automatic merge driver fails or if you prefer manual resolution:

1. Resolve any `package.json` conflicts first
2. Accept either version of `pnpm-lock.yaml` (doesn't matter which)
3. Run `pnpm install` to regenerate the lockfile
4. Stage and commit the regenerated lockfile:

```bash
# After resolving package.json conflicts
pnpm install

# Stage the regenerated lockfile
git add pnpm-lock.yaml

# Complete the merge
git commit
```

## Version Consistency

To prevent lockfile conflicts caused by different pnpm versions, this repository:

- Specifies `packageManager: "pnpm@10.0.0"` in `package.json`
- Requires `pnpm >= 10.0.0` in the `engines` field
- Uses `pnpm@10` in GitHub Actions CI

All developers should use the same major version of pnpm. Consider using [Corepack](https://nodejs.org/api/corepack.html) to automatically use the correct pnpm version:

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

## Troubleshooting

### "pnpm is not installed"

Install pnpm globally:

```bash
npm install -g pnpm@10
```

Or use Corepack:

```bash
corepack enable
corepack prepare pnpm@10.0.0 --activate
```

### Merge driver not being invoked

1. Verify the merge driver is configured:
   ```bash
   git config --local merge.pnpm-merge-driver.driver
   ```

2. Re-run the setup script:
   ```bash
   ./scripts/setup-merge-driver.sh
   ```

3. Check that `.gitattributes` exists and contains the merge driver configuration:
   ```bash
   cat .gitattributes
   ```

### Merge driver fails

1. Check that you have no `package.json` conflicts remaining
2. Try running `pnpm install` manually to see the error
3. Resolve any dependency issues
4. Continue the merge manually (see "Manual Resolution" above)

## CI/CD Integration

The GitHub Actions workflows in this repository already use pnpm@10 consistently. No additional CI configuration is needed.

## References

- [pnpm - Working with Git](https://pnpm.io/git)
- [Git Attributes - Custom Merge Drivers](https://git-scm.com/docs/gitattributes#_defining_a_custom_merge_driver)
- [Automating Lockfile Merge Conflicts](https://blog.aspect.build/easier-merges-on-lockfiles)
