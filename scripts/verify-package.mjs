import { cp, mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { spawn, spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const temporaryRoot = await mkdtemp(join(tmpdir(), 'cetha-package-'));

function run(command, args, cwd, options = {}) {
  const result = spawnSync(command, args, { cwd, encoding: 'utf8', stdio: 'pipe', ...options });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed\n${result.stdout}\n${result.stderr}`);
  }
  return result.stdout;
}

async function installAndBuild(name) {
  const fixture = join(temporaryRoot, name);
  await cp(join(root, 'tests', 'fixtures', name), fixture, { recursive: true });
  const manifestPath = join(fixture, 'package.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.dependencies['@charvesta/cetha'] = `file:${tarball}`;
  await writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  run('npm', ['install', '--package-lock=false', '--ignore-scripts', '--no-audit', '--no-fund'], fixture);
  run('npm', ['run', 'build'], fixture);
  return fixture;
}

try {
  run('npm', ['pack', './packages/cetha', '--pack-destination', temporaryRoot], root);
  const tarballName = (await readdir(temporaryRoot)).find((entry) => entry.endsWith('.tgz'));
  if (!tarballName) throw new Error('npm pack did not create a tarball');
  var tarball = join(temporaryRoot, tarballName);

  const staticFixture = await installAndBuild('static');
  const staticHtml = await readFile(join(staticFixture, 'dist', 'index.html'), 'utf8');
  if (!staticHtml.includes('Cetha static fixture')) throw new Error('Static fixture output is missing expected markup');
  if (staticHtml.includes('<script')) throw new Error('Presentational static fixture unexpectedly contains client JavaScript');

  const ssrFixture = await installAndBuild('node-ssr');
  const server = spawn('npm', ['run', 'start'], {
    cwd: ssrFixture,
    env: { ...process.env, HOST: '127.0.0.1', PORT: '4399' },
    detached: process.platform !== 'win32',
    stdio: 'ignore',
  });
  try {
    let response;
    for (let attempt = 0; attempt < 40; attempt += 1) {
      try {
        response = await fetch('http://127.0.0.1:4399/');
        if (response.ok) break;
      } catch {}
      await new Promise((resolveWait) => setTimeout(resolveWait, 250));
    }
    if (!response?.ok) throw new Error('SSR fixture did not return HTTP 200');
    const html = await response.text();
    if (!html.includes('Cetha SSR fixture')) throw new Error('SSR response is missing expected markup');
  } finally {
    if (server.exitCode === null && server.signalCode === null) {
      if (process.platform === 'win32') server.kill('SIGTERM');
      else process.kill(-server.pid, 'SIGTERM');

      await Promise.race([
        new Promise((resolveExit) => server.once('exit', resolveExit)),
        new Promise((resolveTimeout) => setTimeout(resolveTimeout, 5_000)),
      ]);
    }
  }

  process.stdout.write('Tarball verified in Astro 6 static and Astro 7 SSR fixtures.\n');
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}
