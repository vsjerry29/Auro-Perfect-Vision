const fs = require('fs');
const path = require('path');

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Guard curMap.set(entryMod.resource, entryMod) after depModMap.set(entryMod.request, entryMod)
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

  // 3. Ensure validEntriesToTrace is passed to nodeFileTrace
  const cjsNftCall = '(0, _nft.nodeFileTrace)(entriesToTrace, {';
  const esmNftCall = 'nodeFileTrace(entriesToTrace, {';
  if (content.includes(cjsNftCall)) {
    content = content.replace(
      cjsNftCall,
      'const validEntriesToTrace = entriesToTrace.filter(p => p && typeof p === "string" && p.trim() !== "" && !p.startsWith("private-next-root-dir"));\n                    const result = await (0, _nft.nodeFileTrace)(validEntriesToTrace, {'
    );
    modified = true;
  } else if (content.includes(esmNftCall)) {
    content = content.replace(
      esmNftCall,
      'const validEntriesToTrace = entriesToTrace.filter(p => p && typeof p === "string" && p.trim() !== "" && !p.startsWith("private-next-root-dir"));\n                    const result = await nodeFileTrace(validEntriesToTrace, {'
    );
    modified = true;
  }

  // 4. Guard extraEntry iteration
  if (/for\s*\(const\s+extraEntry\s+of\s+curExtraEntries\.keys\(\)\)\s*\{(?!\s*if\s*\(!extraEntry)/.test(content)) {
    content = content.replace(
      /for\s*\(const\s+extraEntry\s+of\s+curExtraEntries\.keys\(\)\)\s*\{/g,
      'for (const extraEntry of curExtraEntries.keys()) { if (!extraEntry || typeof extraEntry !== "string" || extraEntry.trim() === "") continue;'
    );
    modified = true;
  }

  // 5. Clean up any lingering debug logs
  if (content.includes('[NFT TRACE]') || content.includes('entriesToTrace.json')) {
    content = content.replace(/console\.log\(`\[NFT TRACE\].*?\n/g, '');
    content = content.replace(/const _fs = require\('fs'\);\s*_fs\.writeFileSync\('entriesToTrace\.json'.*?\n/g, '');
    content = content.replace(/const sampleFiles = Array\.from\(fileList\).*?\n/g, '');
    content = content.replace(/_fs\.writeFileSync\('tracedFilesSample\.json'.*?\n/g, '');
    content = content.replace(/let ignoreCount = 0;[\s\S]*?return matched;\s*\};/g, 'const ignoreFn = (path) => isIgnoreMatcher(path);');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`[patch-next-trace] Applied trace optimization to ${filePath}`);
  } else {
    console.log(`[patch-next-trace] Already optimized: ${filePath}`);
  }
}

const cjsFile = path.resolve(__dirname, '../node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js');
const esmFile = path.resolve(__dirname, '../node_modules/next/dist/esm/build/webpack/plugins/next-trace-entrypoints-plugin.js');

patchFile(cjsFile);
patchFile(esmFile);
