#!/usr/bin/env node
/**
 * 導入済みのmattpocock/skillsとチートシートのデータを突き合わせ、追随が必要な箇所を報告する。
 *
 * 使い方:
 *   node scripts/check-sync.mjs                 差分を報告する（差分があれば終了コード1）
 *   node scripts/check-sync.mjs --accept        見直し済みとして全スキルの現在のハッシュを記録する
 *   node scripts/check-sync.mjs --accept a b    指定したスキルだけ記録する
 *
 * 導入先は npx skills（vercel-labs/skills）の既定 ~/.agents を見る。
 * 別の場所を使う場合は環境変数 SKILLS_HOME で指定する。
 */
import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const SOURCE = "mattpocock/skills";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DATA_FILE = join(ROOT, "data", "cheatsheet.js");
const HASH_FILE = join(ROOT, "data", "source-hashes.json");
const SKILLS_HOME = process.env.SKILLS_HOME ?? join(homedir(), ".agents");
const LOCK_FILE = join(SKILLS_HOME, ".skill-lock.json");
const SKILLS_DIR = join(SKILLS_HOME, "skills");

/** 失敗を明示して終了する。 */
function fail(message) {
  console.error(`エラー: ${message}`);
  process.exit(2);
}

/** ロックファイルから mattpocock/skills 由来のスキル名を集める。 */
function installedSkills() {
  if (!existsSync(LOCK_FILE)) fail(`ロックファイルがありません: ${LOCK_FILE}`);
  const lock = JSON.parse(readFileSync(LOCK_FILE, "utf8"));
  if (!lock.skills || typeof lock.skills !== "object") fail(`ロックファイルに skills がありません: ${LOCK_FILE}`);
  return Object.entries(lock.skills)
    .filter(([, v]) => v.source === SOURCE)
    .map(([name]) => name)
    .sort();
}

/** data/cheatsheet.js を評価して window.CHEATSHEET を取り出す。 */
function loadData() {
  const sandbox = { window: {} };
  vm.runInNewContext(readFileSync(DATA_FILE, "utf8"), sandbox, { filename: DATA_FILE });
  if (!sandbox.window.CHEATSHEET) fail(`${DATA_FILE} が window.CHEATSHEET を定義していません`);
  return sandbox.window.CHEATSHEET;
}

/**
 * スキルディレクトリの内容ハッシュ。
 * 他ハーネス向けメタデータ（agents/）は説明内容に関係しないので除く。
 */
function hashSkill(name) {
  const dir = join(SKILLS_DIR, name);
  if (!existsSync(join(dir, "SKILL.md"))) fail(`SKILL.md がありません: ${dir}`);
  const files = [];
  const walk = (d) => {
    for (const entry of readdirSync(d).sort()) {
      if (entry === "agents" || entry === ".DS_Store") continue;
      const p = join(d, entry);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  };
  walk(dir);
  const h = createHash("sha256");
  for (const f of files) {
    h.update(relative(dir, f));
    h.update("\0");
    h.update(readFileSync(f));
    h.update("\0");
  }
  return h.digest("hex");
}

function readHashes() {
  return existsSync(HASH_FILE) ? JSON.parse(readFileSync(HASH_FILE, "utf8")) : {};
}

function accept(names, installed, data) {
  const targets = names.length > 0 ? names : installed;
  for (const name of targets) {
    if (!installed.includes(name)) fail(`${SOURCE} から導入されていないスキルです: ${name}`);
    if (!data.skills[name]) fail(`データに未収録のスキルです（先に data/cheatsheet.js へ追加する）: ${name}`);
  }
  const hashes = readHashes();
  for (const name of targets) hashes[name] = hashSkill(name);
  const sorted = Object.fromEntries(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)));
  writeFileSync(HASH_FILE, `${JSON.stringify(sorted, null, 2)}\n`);
  console.log(`記録しました（${targets.length}件）: ${relative(ROOT, HASH_FILE)}`);
}

function check(installed, data) {
  const hashes = readHashes();
  const inData = Object.keys(data.skills).sort();
  const missing = installed.filter((n) => !data.skills[n]);
  const removed = inData.filter((n) => !installed.includes(n));
  const unrecorded = installed.filter((n) => data.skills[n] && !hashes[n]);
  const changed = installed.filter((n) => data.skills[n] && hashes[n] && hashes[n] !== hashSkill(n));

  const report = (title, items, hint) => {
    if (items.length === 0) return;
    console.log(`\n${title}（${items.length}件）: ${hint}`);
    for (const n of items) console.log(`  - ${n}  ${join(SKILLS_DIR, n, "SKILL.md")}`);
  };
  report("未収録", missing, "導入済みだがデータに無い。data/cheatsheet.js に追加する");
  report("導入なし", removed, "データにあるが導入されていない。削除するか導入状況を確認する");
  report("未確認", unrecorded, "データにあるがハッシュが未記録。記述を確認してから --accept する");
  report("変更あり", changed, "前回の記録から内容が変わった。記述を見直してから --accept する");

  if (missing.length + removed.length + unrecorded.length + changed.length === 0) {
    console.log(`差分なし（${installed.length}スキル）`);
    return 0;
  }
  return 1;
}

const args = process.argv.slice(2);
const installed = installedSkills();
const data = loadData();
if (args[0] === "--accept") {
  accept(args.slice(1), installed, data);
} else if (args.length === 0) {
  process.exit(check(installed, data));
} else {
  fail(`不明な引数です: ${args.join(" ")}`);
}
