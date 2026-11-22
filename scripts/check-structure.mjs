// Enforces the repository structure rules in AGENTS.md §1.
// Checks every tracked file plus untracked files Git does not ignore.
// When AGENTS.md approves a new location, update the allowlists here too.
import { execFileSync } from 'node:child_process';
import { error, log } from 'node:console';
import { existsSync, readFileSync } from 'node:fs';
import process from 'node:process';

const rootEntries = new Set([
  '.editorconfig',
  '.gitattributes',
  '.github',
  '.gitignore',
  '.nvmrc',
  '.prettierignore',
  '.prettierrc',
  'AGENTS.md',
  'CLAUDE.md',
  'README.md',
  'apps',
  'docs',
  'eslint.config.mjs',
  'infra',
  'package.json',
  'packages',
  'pnpm-lock.yaml',
  'pnpm-workspace.yaml',
  'scripts',
]);
const apps = new Set(['admin', 'backend', 'restaurant-pos', 'student-app']);
const webApps = new Set(['admin', 'restaurant-pos', 'student-app']);
const packages = new Set([
  'config',
  'contracts',
  'shared-types',
  'ui',
  'validation',
]);
const infraDirs = new Set(['docker', 'deployment']);

const appRootFiles = new Set([
  '.env.example',
  'README.md',
  'package.json',
  'tsconfig.json',
  'tsconfig.build.json',
]);
const backendRootFiles = new Set(['nest-cli.json', 'prisma.config.ts']);
const webRootFiles = new Set([
  'next.config.ts',
  'next-env.d.ts',
  'postcss.config.mjs',
]);
const backendDirs = new Set(['src', 'prisma', 'test']);
const webDirs = new Set(['src', 'public']);
const packageRootFiles = new Set(['package.json', 'tsconfig.json']);

const kebab = /^[a-z0-9]+(-[a-z0-9]+)*$/;
const nextRouteDir = /^(\(.+\)|\[.+\]|@[a-z0-9-]+|_[a-z0-9-]+)$/;
const kebabTsFile = /^[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+(-[a-z0-9]+)*)*\.tsx?$/;
const forbiddenName =
  /(\.(old|bak|orig|tmp)$|\bcopy\b| \(\d+\)|^(temp|tmp|scratch|playground|misc)$|^package-lock\.json$|^yarn\.lock$)/i;

const problems = [];
const report = (path, rule) => problems.push(`${path}: ${rule}`);

function checkFile(path) {
  const parts = path.split('/');
  const [top, second, third] = parts;
  const name = parts.at(-1);

  if (!rootEntries.has(top)) {
    return report(path, 'not an allowed root entry (AGENTS.md §1.2)');
  }
  for (const part of parts) {
    if (forbiddenName.test(part)) {
      return report(path, 'copy, scratch or foreign lockfile (AGENTS.md §1.8)');
    }
  }
  if (name === 'pnpm-workspace.yaml' && parts.length > 1) {
    return report(path, 'nested workspace file (AGENTS.md §1.8)');
  }
  if (name === 'README.md' && parts.length > 2) {
    const allowed =
      parts.length === 3 && (top === 'apps' || path === 'packages/README.md');
    if (!allowed)
      return report(path, 'README only at app or repo level (AGENTS.md §1.8)');
  }
  if (parts.length === 1) return;

  if (top === 'apps') {
    if (!apps.has(second)) {
      return report(path, `unknown app "${second}" (AGENTS.md §1.3)`);
    }
    if (parts.length === 3) {
      const extra = second === 'backend' ? backendRootFiles : webRootFiles;
      if (!appRootFiles.has(name) && !extra.has(name)) {
        return report(path, 'file not allowed at app root (AGENTS.md §1.3)');
      }
    } else {
      const dirs = webApps.has(second) ? webDirs : backendDirs;
      if (!dirs.has(third)) {
        return report(
          path,
          `folder "${third}" not allowed in apps/${second} (AGENTS.md §1.3)`,
        );
      }
    }
  }
  if (top === 'packages' && parts.length > 2) {
    if (!packages.has(second)) {
      return report(path, `unknown package "${second}" (AGENTS.md §1.4)`);
    }
    if (parts.length === 3 && !packageRootFiles.has(name)) {
      return report(path, 'file not allowed at package root (AGENTS.md §1.4)');
    }
    if (parts.length > 3 && !['src', 'typescript'].includes(third)) {
      return report(
        path,
        `folder "${third}" not allowed in a package (AGENTS.md §1.4)`,
      );
    }
  }
  if (top === 'infra' && !infraDirs.has(second)) {
    return report(
      path,
      'infra holds only docker/ and deployment/ (AGENTS.md §1.5)',
    );
  }
  if (top === 'scripts' && (parts.length > 2 || !name.endsWith('.mjs'))) {
    return report(
      path,
      'scripts/ is a flat folder of .mjs files (AGENTS.md §1.5)',
    );
  }
  if (
    top === 'docs' &&
    (parts.length > 2 || !/^\d{2}_[A-Z_]+\.md$/.test(name))
  ) {
    return report(path, 'docs/ holds only NN_NAME.md specs (AGENTS.md §1.5)');
  }

  // Naming inside app and package source folders (AGENTS.md §1.7).
  const inSource = (top === 'apps' || top === 'packages') && third === 'src';
  if (inSource) {
    const isMigration = path.startsWith('apps/backend/prisma/migrations/');
    for (const dir of parts.slice(3, -1)) {
      if (!isMigration && !kebab.test(dir) && !nextRouteDir.test(dir)) {
        return report(
          path,
          `folder "${dir}" is not kebab-case (AGENTS.md §1.7)`,
        );
      }
    }
    if (/\.tsx?$/.test(name) && !kebabTsFile.test(name)) {
      return report(
        path,
        'TypeScript file name is not kebab-case (AGENTS.md §1.7)',
      );
    }
  }
}

const files = execFileSync(
  'git',
  ['ls-files', '--cached', '--others', '--exclude-standard'],
  { encoding: 'utf8' },
)
  .split('\n')
  .filter((path) => path && existsSync(path));

for (const path of files) checkFile(path);

// Dependency direction (AGENTS.md §1.3, §1.4): apps → packages only.
const appNames = [...apps].map((app) => `@um-food/${app}`);
for (const path of files.filter((file) =>
  /^(apps|packages)\/[^/]+\/package\.json$/.test(file),
)) {
  const manifest = JSON.parse(readFileSync(path, 'utf8'));
  const deps = Object.keys({
    ...manifest.dependencies,
    ...manifest.devDependencies,
    ...manifest.peerDependencies,
  });
  for (const dep of deps.filter((name) => appNames.includes(name))) {
    report(
      path,
      `depends on app ${dep}; share code through packages/ (AGENTS.md §1.3)`,
    );
  }
  if (path === 'apps/backend/package.json' && deps.includes('@um-food/ui')) {
    report(path, 'backend must not depend on @um-food/ui (AGENTS.md §1.4)');
  }
}

if (problems.length) {
  error(`FAIL Repository structure (${problems.length} problem(s)):`);
  for (const problem of problems) error(`  ${problem}`);
  error(
    'Fix the location, or get approval and update AGENTS.md §1 and this script.',
  );
  process.exitCode = 1;
} else {
  log(`PASS Repository structure (${files.length} files)`);
}
