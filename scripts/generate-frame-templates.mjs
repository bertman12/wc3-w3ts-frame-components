/**
 * Regenerates src/models/frame-templates.json and the FrameTemplates const in src/models/FrameTemplates.ts
 * from the game's default frame definition files.
 *
 * Usage:
 *   npm run generate:frame-templates                 write both files
 *   npm run generate:frame-templates -- --check      exit 1 if either file is out of date, write nothing
 *   npm run generate:frame-templates -- --defs <dir> folder containing framedef.toc (default: _BlzFrameDefs/war3.w3mod/ui/framedef)
 *
 * Rules (see .copilot/skills/frame-definitions-parsing/SKILL.md):
 * - A template is a top-level (main) frame: `Frame "TYPE" "Name"` outside any braces. Child frames are skipped.
 * - loaded: declared in a file listed by framedef.toc, or listed in GUIDE_ONLY_LOADED. IncludeFile does not count.
 * - unloaded: declared only in files that are not listed by framedef.toc.
 * - A name loaded anywhere for a type is never also listed as unloaded for that type.
 * - sources (JSON only): every file declaring each name, loaded (toc) files first; the guide URL for GUIDE_ONLY_LOADED names.
 */
import { existsSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const jsonPath = join(repoRoot, "src", "models", "frame-templates.json");
const tsPath = join(repoRoot, "src", "models", "FrameTemplates.ts");

const GUIDE_URL = "https://www.hiveworkshop.com/threads/ui-list-default-mainframes.317884/";

/** Templates Tasyen's guide (GUIDE_URL, "UI: List - Default MainFrames") lists as Loaded that no default FDF file declares. */
const GUIDE_ONLY_LOADED = {
    GLUETEXTBUTTON: ["BrowserButton"],
};

/** Types kept in the JSON but left out of FrameTemplates.ts because no MonoFrame wraps them. */
const TS_EXCLUDED_TYPES = new Set(["BUTTON", "CONTROL", "SIMPLEBUTTON", "SIMPLECHECKBOX", "SIMPLEFRAME"]);

const PRINT_WIDTH = 250;

function parseArgs(argv) {
    const args = { check: false, defs: join(repoRoot, "_BlzFrameDefs", "war3.w3mod", "ui", "framedef") };
    for (let i = 0; i < argv.length; i++) {
        if (argv[i] === "--check") args.check = true;
        else if (argv[i] === "--defs") args.defs = resolve(argv[++i] ?? "");
        else throw new Error(`Unknown argument: ${argv[i]}`);
    }
    return args;
}

function listFdfFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name);
        if (entry.isDirectory()) files.push(...listFdfFiles(path));
        else if (entry.name.toLowerCase().endsWith(".fdf")) files.push(path);
    }
    return files;
}

/** Toc entries look like UI\FrameDef\Glue\DialogWar3.fdf; compare case-insensitively with forward slashes. */
const normalizeTocPath = (path) => path.trim().replaceAll("\\", "/").toLowerCase();

/** Returns the top-level frames of an FDF file in declaration order. */
function parseMainFrames(source) {
    const code = source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/[^\n]*/g, "");
    const token = /Frame\s+"([A-Za-z_]+)"\s+"([^"]+)"|"[^"\n]*"|\{|\}/g;
    const frames = [];
    let depth = 0;
    for (let match; (match = token.exec(code));) {
        if (match[0] === "{") depth++;
        else if (match[0] === "}") depth = Math.max(0, depth - 1);
        else if (match[1] !== undefined && depth === 0) frames.push({ type: match[1].toUpperCase(), name: match[2] });
    }
    return frames;
}

function buildTemplates(defsDir) {
    const tocPath = join(defsDir, "framedef.toc");
    if (!existsSync(tocPath)) {
        throw new Error(`framedef.toc not found in ${defsDir}. Extract war3.w3mod/ui/framedef from the game into _BlzFrameDefs or pass --defs <dir>.`);
    }
    const toc = readFileSync(tocPath, "latin1")
        .split(/\r?\n/)
        .filter((line) => line.trim() !== "");
    const tocOrder = new Map(toc.map((line, index) => [normalizeTocPath(line), index]));
    const tocKey = (file) => normalizeTocPath(join("ui", "framedef", relative(defsDir, file)).split(sep).join("/"));

    // Loaded files in game load order, then the rest alphabetically, so the output is deterministic.
    const files = listFdfFiles(defsDir)
        .map((file) => ({ file, order: tocOrder.get(tocKey(file)) }))
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity) || tocKey(a.file).localeCompare(tocKey(b.file)));

    const types = new Map();
    const entry = (type) => types.get(type) ?? types.set(type, { loaded: new Set(), unloaded: new Set(), sources: new Map() }).get(type);
    const addSource = (type, name, source) => {
        const sources = entry(type).sources;
        const list = sources.get(name) ?? sources.set(name, []).get(name);
        if (!list.includes(source)) list.push(source);
    };
    for (const { file, order } of files) {
        const source = sourcePath(defsDir, file);
        for (const { type, name } of parseMainFrames(readFileSync(file, "latin1"))) {
            entry(type)[order === undefined ? "unloaded" : "loaded"].add(name);
            addSource(type, name, source);
        }
    }
    for (const [type, names] of Object.entries(GUIDE_ONLY_LOADED)) {
        for (const name of names) {
            entry(type).loaded.add(name);
            addSource(type, name, GUIDE_URL);
        }
    }

    const result = {};
    for (const type of [...types.keys()].sort()) {
        const { loaded, unloaded, sources } = types.get(type);
        const names = [...loaded, ...[...unloaded].filter((name) => !loaded.has(name))];
        result[type] = {
            loaded: [...loaded],
            unloaded: names.slice(loaded.size),
            sources: Object.fromEntries(names.map((name) => [name, sources.get(name)])),
        };
    }
    return { templates: result, fileCount: files.length };
}

/** Path of an FDF file relative to war3.w3mod, e.g. ui/framedef/glue/scriptdialog.fdf. Swap / for \ to use it in a toc. */
const sourcePath = (defsDir, file) => ["ui", "framedef", ...relative(defsDir, file).split(sep)].join("/");

/** JSON.stringify with 4 spaces, but keeps each template's source list on one line. */
function renderJson(templates) {
    const json = JSON.stringify(templates, null, 4);
    return `${json.replace(/\[\n\s+("(?:ui\/|https:)[^"]*"(?:,\n\s+"[^"]*")*)\n\s+\]/g, (_, items) => `[${items.replace(/,\n\s+/g, ", ")}]`)}\n`;
}

/** Prints an array the way Prettier does with this repo's printWidth: one line if it fits, otherwise one item per line. */
function formatArray(indent, key, items) {
    const oneLine = `${indent}${key}: [${items.map((item) => JSON.stringify(item)).join(", ")}],`;
    if (oneLine.length <= PRINT_WIDTH) return oneLine;
    return [`${indent}${key}: [`, ...items.map((item) => `${indent}    ${JSON.stringify(item)},`), `${indent}],`].join("\n");
}

function renderTsConst(templates) {
    const body = Object.entries(templates)
        .filter(([type]) => !TS_EXCLUDED_TYPES.has(type))
        .map(([type, { loaded, unloaded }]) => [`    ${type}: {`, formatArray("        ", "loaded", loaded), formatArray("        ", "unloaded", unloaded), "    },"].join("\n"));
    return ["export const FrameTemplates = {", ...body, "} as const;"].join("\n");
}

function replaceTsConst(source, newConst) {
    const start = source.indexOf("export const FrameTemplates = {");
    const endMarker = "} as const;";
    const end = source.indexOf(endMarker, start);
    if (start < 0 || end < 0) throw new Error(`Could not find the FrameTemplates const in ${tsPath}.`);
    return source.slice(0, start) + newConst + source.slice(end + endMarker.length);
}

/** Compares ignoring line endings, since git may check files out with CRLF. */
const sameText = (a, b) => a.replace(/\r\n/g, "\n") === b.replace(/\r\n/g, "\n");

function main() {
    const args = parseArgs(process.argv.slice(2));
    const { templates, fileCount } = buildTemplates(args.defs);

    const json = renderJson(templates);
    const tsSource = readFileSync(tsPath, "utf8");
    const eol = tsSource.includes("\r\n") ? "\r\n" : "\n";
    const ts = replaceTsConst(tsSource.replace(/\r\n/g, "\n"), renderTsConst(templates)).replace(/\n/g, eol);
    const jsonOutput = existsSync(jsonPath) && readFileSync(jsonPath, "utf8").includes("\r\n") ? json.replace(/\n/g, "\r\n") : json;

    const outdated = [
        [jsonPath, jsonOutput],
        [tsPath, ts],
    ].filter(([path, content]) => !existsSync(path) || !sameText(readFileSync(path, "utf8"), content));

    const summary = Object.entries(templates)
        .map(([type, { loaded, unloaded }]) => `${type} ${loaded.length}/${unloaded.length}`)
        .join(", ");
    console.log(`Parsed ${fileCount} FDF files: ${Object.keys(templates).length} frame types (loaded/unloaded): ${summary}`);

    if (args.check) {
        if (outdated.length > 0) {
            console.error(`Out of date: ${outdated.map(([path]) => relative(repoRoot, path)).join(", ")}. Run npm run generate:frame-templates.`);
            process.exit(1);
        }
        console.log("Frame templates are up to date.");
        return;
    }
    for (const [path, content] of outdated) writeFileSync(path, content);
    console.log(outdated.length > 0 ? `Updated ${outdated.map(([path]) => relative(repoRoot, path)).join(", ")}.` : "Frame templates are already up to date.");
}

try {
    main();
} catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
}
