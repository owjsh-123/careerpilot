import {allJobs,getSettings,saveSettings} from './db.js';import {addJob,updateJob,refreshScores,stats,seedSamples,statuses} from './core.js';import {fetchLiveJobs} from './sources.js';
const [cmd,...args]=process.argv.slice(2);const opts=Object.fromEntries(args.filter(x=>x.startsWith('--')).map(x=>{const [k,...v]=x.slice(2).split('=');return [k,v.join('=')||'true']}));
function help(){console.log(`CareerPilot CLI — Omar Eshatti
Commands:
  npm run cli -- list [--status=applied] [--query=react]
  npm run cli -- add --title="QA Intern" --company="Example" --location="Montreal" --url="https://example.com"
  npm run cli -- update 1 --status=applied --notes="Applied on Monday"
  npm run cli -- delete 1
  npm run cli -- fetch --keyword="software intern" --limit=30
  npm run cli -- demo
  npm run cli -- stats
  npm run cli -- settings
  npm run cli -- configure --keywords="React,Python" --locations="Canada,Remote"
  npm run cli -- export [--file=jobs.csv]
`);}
try{switch(cmd){
 case 'list':{let a=allJobs();if(opts.status)a=a.filter(j=>j.status===opts.status);if(opts.query)a=a.filter(j=>JSON.stringify(j).toLowerCase().includes(opts.query.toLowerCase()));console.table(a.map(({id,title,company,location,status,score})=>({id,title,company,location,status,score})));break;}
 case 'add':console.log(addJob(opts));break;
 case 'update':{const result=updateJob(Number(args[0]),opts);console.log(result||'Not found');break;}
 case 'delete':{const {db}=await import('./db.js');console.log(db.prepare('DELETE FROM jobs WHERE id=?').run(Number(args[0])).changes?'Deleted':'Not found');break;}
 case 'fetch':console.log(await fetchLiveJobs({keyword:opts.keyword||'intern',limit:opts.limit||30}));break;
 case 'demo':console.log(`${seedSamples()} sample jobs added`);break;
 case 'stats':console.log(stats());break;
 case 'settings':console.log(getSettings());break;
 case 'configure':console.log(saveSettings(opts));refreshScores();break;
 case 'export':{const {writeFileSync}=await import('node:fs');const cols=['id','title','company','location','status','score','url','notes'];const q=v=>'"'+String(v??'').replace(/"/g,'""')+'"';const file=opts.file||'careerpilot-jobs.csv';writeFileSync(file,[cols.join(','),...allJobs().map(j=>cols.map(c=>q(j[c])).join(','))].join('\n'));console.log(`Exported to ${file}`);break;}
 default:help();
}}catch(e){console.error('Error:',e.message);process.exitCode=1;}
