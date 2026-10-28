import {addJob} from './core.js';
function stripHtml(s){return String(s||'').replace(/<[^>]*>/g,' ').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();}
export async function fetchLiveJobs({keyword='intern',limit=30}={}){
 const q=String(keyword).slice(0,100);let results=[],errors=[];
 // Remotive is a public remote-jobs API. It may not have internship listings for every query.
 try{
 const url=`https://remotive.com/api/remote-jobs?search=${encodeURIComponent(q)}&limit=${Math.min(100,Math.max(1,Number(limit)||30))}`;
 const response=await fetch(url,{signal:AbortSignal.timeout(12000),headers:{'User-Agent':'CareerPilot/1.0'}});
 if(!response.ok)throw Error(`HTTP ${response.status}`);
 const body=await response.json();
 for(const x of (body.jobs||[]).slice(0,100)){
 const j={source_id:String(x.id),title:x.title,company:x.company_name||'Unknown',location:x.candidate_required_location||'Remote',work_type:x.job_type||'Remote',url:x.url,description:stripHtml(x.description).slice(0,10000),tags:x.tags||[]};
 try{const r=addJob(j,'remotive');results.push(r);}catch{}
 }
 }catch(e){errors.push(`Remotive: ${e.message}`);}
 return {source:'Remotive',found:results.length,added:results.filter(x=>x.inserted).length,duplicates:results.filter(x=>!x.inserted).length,errors,notice:'Live results depend on the third-party API. Not all listings are internships; review each posting before applying.'};
}
