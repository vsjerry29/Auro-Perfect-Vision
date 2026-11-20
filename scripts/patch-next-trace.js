const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

function validateSyntax(filePath) {
  try {
    execFileSync(process.execPath, ['-c', filePath], { stdio: 'pipe' });
    return true;
  } catch (err) {
    const errorMsg = err.stderr ? err.stderr.toString() : err.message;
    console.error(`[patch-next-trace] FATAL: Syntax validation failed for ${filePath}:\n${errorMsg}`);
    return false;
  }
}

function patchFile(filePath, isCjs) {
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-next-trace] File not found: ${filePath}`);
    return;
  }

  const originalContent = fs.readFileSync(filePath, 'utf8');
  let content = originalContent;
  let modified = false;

  // 1. Guard curMap.set(entryMod.resource, entryMod) against undefined/empty resource
  if (/depModMap\.set\(entryMod\.request,\s*entryMod\);\s*curMap\.set\(entryMod\.resource,\s*entryMod\);/.test(content)) {
    content = content.replace(
      /depModMap\.set\(entryMod\.request,\s*entryMod\);\s*curMap\.set\(entryMod\.resource,\s*entryMod\);/g,
      'depModMap.set(entryMod.request, entryMod);\n                                        if (entryMod.resource) { curMap.set(entryMod.resource, entryMod); }'
    );
    modified = true;
  }

  // 2. Filter extra entries when pushing to entriesToTrace
  if (content.includes('entriesToTrace.push(...curExtraEntries.keys());')) {
    content = content.replace(
      'entriesToTrace.push(...curExtraEntries.keys());',
      'for (const k of curExtraEntries.keys()) { if (k && typeof k === "string" && k.trim() !== "") entriesToTrace.push(k); }'
    );
    modified = true;
  }

  // 3. Fix nodeFileTrace call argument — replace ONLY function call argument, keeping "const result = await" intact
  const cjsNftCall = '(0, _nft.nodeFileTrace)(entriesToTrace, {';
  const cjsReplacement =
    '(0, _nft.nodeFileTrace)(entriesToTrace.filter((p) => typeof p === "string" && p.trim() !== "" && !p.startsWith("private-next-root-dir")), {';

  const esmNftCall = 'nodeFileTrace(entriesToTrace, {';
  const esmReplacement =
    'nodeFileTrace(entriesToTrace.filter((p) => typeof p === "string" && p.trim() !== "" && !p.startsWith("private-next-root-dir")), {';

  if (isCjs) {
    if (content.includes('validEntriesToTrace')) {
      // Clean up previous corrupted replacement
      content = content.replace(
        /(?:const result = await\s+)?(?:const validEntriesToTrace[\s\S]*?)(?:const result = await\s+)?\(0, _nft\.nodeFileTrace\)\(validEntriesToTrace,\s*\{/g,
        `const result = await ${cjsReplacement}`
      );
      modified = true;
    } else if (content.includes(cjsNftCall)) {
      content = content.replace(cjsNftCall, cjsReplacement);
      modified = true;
    } else if (!content.includes(cjsReplacement)) {
      console.error(`[patch-next-trace] ERROR: Target CJS nodeFileTrace call pattern not found in ${filePath}`);
      process.exit(1);
    }
  } else {
    // ESM
    if (content.includes('validEntriesToTrace')) {
      // Clean up previous corrupted replacement
      content = content.replace(
        /(?:const result = await\s+)?(?:const validEntriesToTrace[\s\S]*?)(?:const result = await\s+)?nodeFileTrace\(validEntriesToTrace,\s*\{/g,
        `const result = await ${esmReplacement}`
      );
      modified = true;
    } else if (content.includes(esmNftCall)) {
      content = content.replace(esmNftCall, esmReplacement);
      modified = true;
    } else if (!content.includes(esmReplacement)) {
      console.error(`[patch-next-trace] ERROR: Target ESM nodeFileTrace call pattern not found in ${filePath}`);
      process.exit(1);
    }
  }

  // 4. Set moduleSyncCatchall: false to prevent catastrophic directory crawl
  if (content.includes('moduleSyncCatchall: true')) {
    content = content.replace(/moduleSyncCatchall:\s*true/g, 'moduleSyncCatchall: false');
    modified = true;
  } else if (!content.includes('moduleSyncCatchall: false')) {
    console.error(`[patch-next-trace] ERROR: moduleSyncCatchall setting not found in ${filePath}`);
    process.exit(1);
  }

  // 5. Boundary check in ignoreFn — does not exclude legitimate runtime dependencies
  const boundaryReplacement =
    'const ignoreFn = (path) => { if (typeof path !== "string") return false; if (path.startsWith("..")) return true; if ((path.includes(":") || path.startsWith("/") || path.startsWith("\\\\")) && this.tracingRoot && !path.startsWith(this.tracingRoot)) return true; return isIgnoreMatcher(path); };';

  if (content.includes('const ignoreFn = (path) => isIgnoreMatcher(path);')) {
    content = content.replace('const ignoreFn = (path) => isIgnoreMatcher(path);', boundaryReplacement);
    modified = true;
  } else if (content.includes('const ignoreFn = (path)=>{') && !content.includes(boundaryReplacement)) {
    content = content.replace(
      /const ignoreFn = \(path\)\s*=>\s*\{[\s\S]*?return isIgnoreMatcher\(path\);\s*\};/g,
      boundaryReplacement
    );
    modified = true;
  } else if (content.includes('const ignoreFn = (path) => (typeof path === "string" && this.tracingRoot && !path.startsWith(this.tracingRoot)) || isIgnoreMatcher(path);')) {
    content = content.replace(
      'const ignoreFn = (path) => (typeof path === "string" && this.tracingRoot && !path.startsWith(this.tracingRoot)) || isIgnoreMatcher(path);',
      boundaryReplacement
    );
    modified = true;
  }

  // 6. Guard extraEntry iteration
  if (/for\s*\(const\s+extraEntry\s+of\s+curExtraEntries\.keys\(\)\)\s*\{(?!\s*if\s*\(!extraEntry)/.test(content)) {
    content = content.replace(
      /for\s*\(const\s+extraEntry\s+of\s+curExtraEntries\.keys\(\)\)\s*\{/g,
      'for (const extraEntry of curExtraEntries.keys()) { if (!extraEntry || typeof extraEntry !== "string" || extraEntry.trim() === "") continue;'
    );
    modified = true;
  }

  // Write and validate syntax
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    if (!validateSyntax(filePath)) {
      // Revert immediately
      fs.writeFileSync(filePath, originalContent, 'utf8');
      console.error(`[patch-next-trace] Reverted changes to ${filePath} due to syntax check failure.`);
      process.exit(1);
    }
    console.log(`[patch-next-trace] Successfully applied and validated patch for ${filePath}`);
  } else {
    // Verify existing file is syntactically valid
    if (!validateSyntax(filePath)) {
      console.error(`[patch-next-trace] File ${filePath} failed syntax check.`);
      process.exit(1);
    }
    console.log(`[patch-next-trace] Already patched and verified: ${filePath}`);
  }
}

const cjsFile = path.resolve(__dirname, '../node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js');
const esmFile = path.resolve(__dirname, '../node_modules/next/dist/esm/build/webpack/plugins/next-trace-entrypoints-plugin.js');

patchFile(cjsFile, true);
patchFile(esmFile, false);
