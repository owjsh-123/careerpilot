import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
export const dbPath = resolve(process.env.DB_PATH || './data/careerpilot.sqlite');
mkdirSync(dirname(dbPath), {recursive:true});
export const db = new DatabaseSync(dbPath);
db.exec(`PRAGMA journal_mode=WAL;
CREATE TABLE IF NOT EXISTS jobs (
 id INTEGER PRIMARY KEY AUTOINCREMENT, source TEXT NOT NULL DEFAULT 'manual', source_id TEXT,
 title TEXT NOT NULL, company TEXT NOT NULL, location TEXT NOT NULL DEFAULT '',
 work_type TEXT NOT NULL DEFAULT 'Not specified', url TEXT NOT NULL DEFAULT '',
 description TEXT NOT NULL DEFAULT '', tags TEXT NOT NULL DEFAULT '[]',
 status TEXT NOT NULL DEFAULT 'new', notes TEXT NOT NULL DEFAULT '',
 score INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL DEFAULT (datetime('now')),
 updated_at TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(source,source_id)
);
CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS jobs_status_idx ON jobs(status);
`);
export function getSettings(){const rows=db.prepare('SELECT key,value FROM settings').all();const v=Object.fromEntries(rows.map(r=>[r.key,r.value]));return {keywords:v.keywords||'JavaScript,TypeScript,React,Node.js,SQL,Python,Testing',locations:v.locations||'Montreal,Montréal,Canada,Remote',targetRoles:v.targetRoles||'Software Engineer,QA,Test Automation,Data Analyst,Intern',excluded:v.excluded||'Senior,Staff,Principal,Director',...v};}
export function saveSettings(data){const stmt=db.prepare('INSERT INTO settings(key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value');for(const k of ['keywords','locations','targetRoles','excluded'])if(typeof data[k]==='string')stmt.run(k,data[k].slice(0,1000));return getSettings();}
export function allJobs(){return db.prepare('SELECT * FROM jobs ORDER BY updated_at DESC,id DESC').all().map(j=>({...j,tags:JSON.parse(j.tags||'[]')}));}
