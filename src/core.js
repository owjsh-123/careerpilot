import {db,getSettings,allJobs} from './db.js';
export const statuses=['new','saved','applied','interview','offer','rejected','archived'];
const terms=s=>String(s||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
export function scoreJob(job,settings=getSettings()){
 const content=`${job.title} ${job.description||''} ${(job.tags||[]).join(' ')}`.toLowerCase();
 const title=String(job.title).toLowerCase(); const loc=String(job.location||'').toLowerCase();
 const skills=terms(settings.keywords);const roles=terms(settings.targetRoles);const locations=terms(settings.locations);
 const matches=skills.filter(x=>content.includes(x));
 const roleMatch=roles.some(r=>title.includes(r));const locationMatch=locations.some(x=>loc.includes(x))||loc.includes('remote');
 const excluded=terms(settings.excluded).some(x=>title.includes(x));
 const intern=/intern|co-op|coop|student|new grad|junior/i.test(title);
 let score=Math.min(40,matches.length*8)+(roleMatch?25:0)+(locationMatch?20:0)+(intern?15:0)-(excluded?35:0);
 return {score:Math.max(0,Math.min(100,score)),matchingSkills:matches,roleMatch,locationMatch,intern,excluded};
}
export function normalizeJob(input,source='manual'){
 const title=String(input.title||'').trim().slice(0,200),company=String(input.company||'').trim().slice(0,160);
 if(!title||!company)throw Error('Job title and company are required');
 const url=String(input.url||'').trim().slice(0,1200);
 if(url&&!/^https?:\/\//i.test(url))throw Error('Job URL must start with http:// or https://');
 const tags=Array.isArray(input.tags)?input.tags.slice(0,25).map(x=>String(x).slice(0,60)):String(input.tags||'').split(',').map(x=>x.trim()).filter(Boolean);
 return {source,source_id:input.source_id?String(input.source_id).slice(0,250):null,title,company,
 location:String(input.location||'').slice(0,180),work_type:String(input.work_type||'Not specified').slice(0,60),
 url,description:String(input.description||'').slice(0,10000),tags};
}
export function addJob(input,source='manual'){
 const j=normalizeJob(input,source);const {score}=scoreJob(j);
 const existing=j.source_id?db.prepare('SELECT id FROM jobs WHERE source=? AND source_id=?').get(j.source,j.source_id):null;
 if(existing)return {id:existing.id,inserted:false};
 const r=db.prepare(`INSERT INTO jobs(source,source_id,title,company,location,work_type,url,description,tags,score)
 VALUES (?,?,?,?,?,?,?,?,?,?)`).run(j.source,j.source_id,j.title,j.company,j.location,j.work_type,j.url,j.description,JSON.stringify(j.tags),score);
 return {id:Number(r.lastInsertRowid),inserted:true};
}
export function updateJob(id,data){
 const old=db.prepare('SELECT * FROM jobs WHERE id=?').get(id);if(!old)return null;
 const status=data.status===undefined?old.status:data.status;if(!statuses.includes(status))throw Error('Invalid status');
 const notes=data.notes===undefined?old.notes:String(data.notes).slice(0,5000);
 db.prepare("UPDATE jobs SET status=?,notes=?,updated_at=datetime('now') WHERE id=?").run(status,notes,id);
 return db.prepare('SELECT * FROM jobs WHERE id=?').get(id);
}
export function refreshScores(){const stmt=db.prepare('UPDATE jobs SET score=? WHERE id=?');for(const j of allJobs())stmt.run(scoreJob(j).score,j.id);}
export function stats(){const jobs=allJobs();const counts=Object.fromEntries(statuses.map(s=>[s,jobs.filter(j=>j.status===s).length]));return {total:jobs.length,counts,highMatches:jobs.filter(j=>j.score>=70).length,averageScore:jobs.length?Math.round(jobs.reduce((s,j)=>s+j.score,0)/jobs.length):0};}
export const sampleJobs=[
 {title:'Software Engineering Intern',company:'Northstar Labs (sample)',location:'Montréal, Canada',work_type:'Hybrid',tags:['React','TypeScript','Testing'],description:'Collaborate with engineers on frontend and API features.'},
 {title:'Test Automation Intern',company:'Maple Software (sample)',location:'Remote, Canada',work_type:'Remote',tags:['Python','Testing','SQL'],description:'Build and maintain automated tests and quality dashboards.'},
 {title:'Junior Data Analyst',company:'Aurora Analytics (sample)',location:'Toronto, Canada',work_type:'Hybrid',tags:['Python','SQL'],description:'Analyze product usage and build reports.'},
 {title:'Senior Engineering Manager',company:'Summit Systems (sample)',location:'Vancouver, Canada',tags:['Node.js'],description:'Lead engineering teams.'}
];
export function seedSamples(){let added=0;for(const [i,j] of sampleJobs.entries()){if(addJob({...j,source_id:'sample-'+i},'sample').inserted)added++;}return added;}
