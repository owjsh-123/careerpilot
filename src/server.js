import http from 'node:http';import {readFile} from 'node:fs/promises';import {fileURLToPath} from 'node:url';import {dirname,join,extname} from 'node:path';
import {db,getSettings,saveSettings,allJobs} from './db.js';
import {addJob,updateJob,refreshScores,stats,seedSamples,scoreJob,statuses} from './core.js';import {fetchLiveJobs} from './sources.js';
const root=join(dirname(fileURLToPath(import.meta.url)),'../public');
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json'};
function send(res,status,data){res.writeHead(status,{'content-type':'application/json; charset=utf-8','cache-control':'no-store'});res.end(JSON.stringify(data));}
async function body(req){let chunks=[],size=0;for await(const c of req){size+=c.length;if(size>150000)throw Error('Request too large');chunks.push(c);}return JSON.parse(Buffer.concat(chunks).toString()||'{}');}
export function createServer(){return http.createServer(async(req,res)=>{
 try{
 const url=new URL(req.url,'http://localhost');const p=url.pathname;
 if(p.startsWith('/api/')){
 if(req.method==='GET'&&p==='/api/jobs'){const jobs=allJobs();const status=url.searchParams.get('status'),search=(url.searchParams.get('q')||'').toLowerCase();return send(res,200,jobs.filter(j=>(!status||j.status===status)&&(!search||[j.title,j.company,j.location,...j.tags].join(' ').toLowerCase().includes(search))));}
 if(req.method==='GET'&&p==='/api/stats')return send(res,200,stats());
 if(req.method==='GET'&&p==='/api/settings')return send(res,200,getSettings());
 if(req.method==='PUT'&&p==='/api/settings'){const settings=saveSettings(await body(req));refreshScores();return send(res,200,settings);}
 if(req.method==='POST'&&p==='/api/jobs')return send(res,201,addJob(await body(req)));
 const m=p.match(/^\/api\/jobs\/(\d+)$/);
 if(m&&req.method==='PATCH'){const updated=updateJob(Number(m[1]),await body(req));return send(res,updated?200:404,updated||{error:'Not found'});}
 if(m&&req.method==='DELETE'){const r=db.prepare('DELETE FROM jobs WHERE id=?').run(Number(m[1]));return send(res,r.changes?200:404,{deleted:!!r.changes});}
 if(req.method==='POST'&&p==='/api/demo')return send(res,200,{added:seedSamples()});
 if(req.method==='POST'&&p==='/api/fetch'){const data=await body(req);return send(res,200,await fetchLiveJobs(data));}
 if(req.method==='GET'&&p==='/api/export'){const jobs=allJobs();const cols=['id','title','company','location','work_type','status','score','url','notes'];const quote=v=>'"'+String(v??'').replace(/"/g,'""')+'"';res.writeHead(200,{'content-type':'text/csv; charset=utf-8','content-disposition':'attachment; filename="careerpilot-jobs.csv"'});return res.end([cols.join(','),...jobs.map(j=>cols.map(c=>quote(j[c])).join(','))].join('\n'));}
 return send(res,404,{error:'Unknown route'});
 }
 if(req.method!=='GET')return send(res,405,{error:'Method not allowed'});
 const file=p==='/'?'index.html':p.slice(1);
 if(!['index.html','app.js','style.css','icon.svg'].includes(file))return send(res,404,{error:'Not found'});
 const content=await readFile(join(root,file));res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream','cache-control':'no-cache'});res.end(content);
 }catch(e){send(res,e.message==='Request too large'?413:400,{error:e.message});}
 });}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const host=process.env.HOST||'127.0.0.1',port=Number(process.env.PORT||3000);
 createServer().listen(port,host,()=>console.log(`CareerPilot running at http://${host}:${port}`));
}
