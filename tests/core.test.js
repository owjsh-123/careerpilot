import test from 'node:test';import assert from 'node:assert/strict';
import {scoreJob,normalizeJob} from '../src/core.js';
const settings={keywords:'React,TypeScript,SQL',locations:'Montreal,Canada,Remote',targetRoles:'Software Engineer,QA,Intern',excluded:'Senior,Director'};
test('well matched internship scores highly',()=>{const r=scoreJob({title:'Software Engineer Intern',location:'Remote, Canada',tags:['React','TypeScript'],description:'SQL'},settings);assert.equal(r.score,84);});
test('senior roles receive penalty',()=>{const a=scoreJob({title:'Senior Software Engineer',location:'Canada',tags:['React']},settings);const b=scoreJob({title:'Software Engineer Intern',location:'Canada',tags:['React']},settings);assert.ok(a.score<b.score);});
test('invalid external URL rejected',()=>assert.throws(()=>normalizeJob({title:'Job',company:'Firm',url:'javascript:alert(1)'})));
test('job requires title and company',()=>assert.throws(()=>normalizeJob({title:'',company:'Firm'})));
