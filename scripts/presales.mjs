#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {createHash,randomUUID} from 'node:crypto';
import {pathToFileURL} from 'node:url';
import {getDb,REPO_ROOT} from './lib/db.mjs';
import {parseCsv} from './lib/csv.mjs';
import {table} from './lib/format.mjs';

export const reads={
 'revenue-review':'SELECT * FROM revenue_review ORDER BY currency NULLS LAST',
 'win-review':'SELECT * FROM win_review ORDER BY engineer',
 evaluations:'SELECT code,account,name,engineer,status,due_date FROM evaluations ORDER BY code',
 'deal-review':'SELECT code,account,engineer,status,due_date,required_count,required_unproven,blockers,effort_minutes FROM scorecards ORDER BY due_date,code',
 attention:'SELECT * FROM attention ORDER BY due_date,code',
 'proof-plan':'SELECT * FROM proof_plan ORDER BY code,criterion',
 'product-gaps':'SELECT code,feature,owner,due_date,blocking,status FROM product_gaps ORDER BY due_date,code',
 'effort-review':'SELECT * FROM effort_review ORDER BY engineer,kind',
 compliance:'SELECT * FROM compliance ORDER BY code,rule',
 'source-freshness':'SELECT * FROM source_freshness ORDER BY source',
 imports:'SELECT id,source,exported_at,row_count,actor,created_at FROM imports ORDER BY created_at',
 audit:'SELECT e.code,a.action,a.actor,a.detail,a.created_at FROM audit a LEFT JOIN evaluations e ON e.id=a.evaluation_id ORDER BY a.created_at,a.id',
};
export const commands=[...Object.keys(reads),'help','weekly-review','detail','history','add','assign','plan','review','add-criterion','record-result','add-gap','resolve-gap','log','decide','reopen','draft-handover','import','export'];
const options=new Set(['value','currency','json','actor','code','account','name','engineer','due','purpose','retention-review','expected','mandatory','status','evidence','feature','owner','blocking','resolution','date','minutes','kind','note','file','map','source','exported-at','out','dry-run']);
function argsOf(argv){const opts={},pos=[];for(const a of argv){if(!a.startsWith('--'))pos.push(a);else{const i=a.indexOf('=');const k=a.slice(2,i<0?undefined:i);if(!options.has(k))throw Error(`Unknown option --${k}`);if(k in opts)throw Error(`Repeated option --${k}`);opts[k]=i<0?true:a.slice(i+1);}}return {opts,pos};}
const need=(o,k)=>{if(typeof o[k]!=='string'||!o[k].trim())throw Error(`Required --${k}=value`);return o[k].trim();};
function day(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s)||!Number.isFinite(Date.parse(s))||new Date(s).toISOString().slice(0,10)!==s)throw Error(`Invalid date: ${s}; use YYYY-MM-DD`);return s;}
const today=()=>new Date().toISOString().slice(0,10);
function observed(s){day(s);if(s>today())throw Error('Observed date cannot be in the future');return s;}
function bool(v,def=true){if(v===undefined)return def;if(v==='true')return true;if(v==='false')return false;throw Error('Boolean must be true or false');}
function choice(v,allowed){if(!allowed.includes(v))throw Error(`Expected one of ${allowed.join(', ')}`);return v;}
function valuePair(value,currency){if(value===undefined&&currency===undefined)return [null,null];if(typeof value!=='string'||!/^\d{1,12}(?:\.\d{1,2})?$/.test(value)||typeof currency!=='string'||!/^[A-Z]{3}$/.test(currency))throw Error('Value requires a nonnegative decimal and a three-letter currency');return [value,currency];}
const hash=s=>createHash('sha256').update(s).digest('hex');
export async function resolve(db,entity,term,parent=null){
 if(!term)throw Error(`Specify ${entity} id, code or name`);
 const name=entity==='evaluations'?'name':entity==='criteria'?'name':'feature';
 const rows=await db.query(`SELECT * FROM ${entity}${parent?' WHERE evaluation_id=$1':''}`,parent?[parent]:[]);
 const q=term.toLowerCase();const exact=rows.filter(r=>r.id===term||r.code?.toLowerCase()===q||r[name].toLowerCase()===q);
 const matches=exact.length?exact:rows.filter(r=>r.id.startsWith(term)||r[name].toLowerCase().includes(q)||r.code?.toLowerCase().includes(q)||r.account?.toLowerCase().includes(q));
 if(matches.length!==1)throw Error(`${matches.length?'Ambiguous':'No matching'} ${entity}: ${term}${matches.length?'\n'+matches.map(r=>`${r.id} | ${r.code||''} | ${r[name]}`).join('\n'):''}`);
 return matches[0];
}
async function audit(db,id,action,actor,detail){await db.query('INSERT INTO audit(evaluation_id,action,actor,detail) VALUES($1,$2,$3,$4)',[id,action,actor,JSON.stringify(detail)]);}
function active(e){if(e.status!=='active')throw Error('Reopen the evaluation before changing evidence, assignments or plans');}
async function pack(db,e){return {evaluation:e,criteria:await db.query('SELECT * FROM criteria WHERE evaluation_id=$1 ORDER BY name',[e.id]),gaps:await db.query('SELECT * FROM gaps WHERE evaluation_id=$1 ORDER BY created_at',[e.id]),activities:await db.query('SELECT * FROM activities WHERE evaluation_id=$1 ORDER BY occurred_on',[e.id])};}
function writePrivate(file,content){fs.mkdirSync(path.dirname(file),{recursive:true,mode:0o700});fs.writeFileSync(file,content,{mode:0o600});fs.chmodSync(file,0o600);return file;}

async function importElvance(db,o,actor){
 const csv=fs.readFileSync(need(o,'file'),'utf8');const mapping=JSON.parse(fs.readFileSync(need(o,'map'),'utf8'));
 const required=['source_id','code','account','name','engineer','due_date'];
 const permitted=[...required,'source_stage','value','currency'];
 if(!mapping||Array.isArray(mapping)||typeof mapping!=='object'||Object.keys(mapping).some(k=>!permitted.includes(k)))throw Error('Mapping contains an unsupported field');
 for(const k of required)if(typeof mapping[k]!=='string'||!mapping[k])throw Error(`Mapping requires ${k}`);
 const source=need(o,'source');const stamp=need(o,'exported-at');
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(stamp)||!Number.isFinite(Date.parse(stamp))||Date.parse(stamp)>Date.now())throw Error('exported-at must be an observed timestamp with a timezone');
 const rows=parseCsv(csv);if(!rows.length)throw Error('Import contains no rows');const ids=new Set(),codes=new Set(),records=[];
 for(const [i,row] of rows.entries()){
  const r={};for(const [field,header]of Object.entries(mapping)){if(!(header in row))throw Error(`Missing export column ${header}`);r[field]=row[header].trim();}
  for(const k of required)if(!r[k])throw Error(`Row ${i+2}: missing ${k}`);
  day(r.due_date);[r.value,r.currency]=valuePair(r.value||undefined,r.currency||undefined);r.source_id=source+':'+r.source_id;
  if(ids.has(r.source_id)||codes.has(r.code.toLowerCase()))throw Error(`Duplicate source id or code at row ${i+2}`);
  ids.add(r.source_id);codes.add(r.code.toLowerCase());r.raw=row;r.digest=hash(JSON.stringify({mapping,row}));
  const old=(await db.query('SELECT * FROM evaluations WHERE source_id=$1',[r.source_id]))[0];
  if(old&&old.source_hash!==r.digest)throw Error(`Changed source row ${r.code}; reconcile it explicitly, existing evidence will not be overwritten`);
  if(!old&&(await db.query('SELECT id FROM evaluations WHERE lower(code)=lower($1)',[r.code])).length)throw Error(`Code collision ${r.code}`);
  r.skip=!!old;records.push(r);
 }
 if(!o['dry-run']){
  for(const r of records.filter(r=>!r.skip)){
   const [e]=await db.query('INSERT INTO evaluations(code,account,name,engineer,due_date,source_id,source_stage,source_row,source_hash,value_amount,currency) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *',[r.code,r.account,r.name,r.engineer,r.due_date,r.source_id,r.source_stage||null,JSON.stringify(r.raw),r.digest,r.value,r.currency]);
   await audit(db,e.id,'import',actor,{source,exported_at:stamp,source_stage:r.source_stage||null});
  }
  if(records.some(r=>!r.skip))await db.query('INSERT INTO imports(source,exported_at,digest,original_csv,mapping,row_count,actor) VALUES($1,$2,$3,$4,$5,$6,$7)',[source,stamp,hash(csv),csv,JSON.stringify(mapping),rows.length,actor]);
 }
 return {dry_run:!!o['dry-run'],rows:rows.length,inserted:records.filter(r=>!r.skip).length,unchanged:records.filter(r=>r.skip).length,source_stage_policy:'Imported evaluations remain active until evidence is reviewed'};
}

export async function run(db,argv){
 const {opts:o,pos}=argsOf(argv);const [cmd='help',term,child]=pos;
 if(!commands.includes(cmd))throw Error(`Unknown command ${cmd}; run help`);
 if(cmd==='help')return commands.map(command=>({command}));
 if(reads[cmd])return db.query(reads[cmd]);
 if(cmd==='weekly-review'){const out={};for(const key of ['attention','deal-review','effort-review','revenue-review','win-review','compliance','source-freshness'])out[key]=await db.query(reads[key]);return out;}
 if(cmd==='detail'||cmd==='history'){const e=await resolve(db,'evaluations',term);return cmd==='detail'?pack(db,e):db.query('SELECT action,actor,detail,created_at FROM audit WHERE evaluation_id=$1 ORDER BY created_at,id',[e.id]);}
 if(cmd==='export'){
  const data={format:'presales-evaluations-v1',exported_at:new Date().toISOString()};
  await db.exec('BEGIN READ ONLY');try{for(const t of ['evaluations','criteria','gaps','activities','imports','audit'])data[t]=await db.query(`SELECT * FROM ${t} ORDER BY created_at,id`);}finally{await db.exec('ROLLBACK');}
  const file=path.resolve(need(o,'out'));writePrivate(file,JSON.stringify(data,null,2)+'\n');return {file,counts:Object.fromEntries(Object.entries(data).filter(([,v])=>Array.isArray(v)).map(([k,v])=>[k,v.length]))};
 }
 if(cmd==='draft-handover'){
  const e=await resolve(db,'evaluations',term);const data=await pack(db,e);
  const file=path.join(process.env.OUTPUT_DIR||REPO_ROOT,'drafts',`${e.id}-${randomUUID()}.md`);
  writePrivate(file,`# Draft evaluation handover: ${e.code}\n\nInternal draft, check accuracy and recipients before sharing.\n\n${JSON.stringify(data,null,2)}\n`);return {file,status:'draft, not sent'};
 }
 const actor=need(o,'actor');await db.exec('BEGIN');
 try{
  // Serialise application writes; prevents a result change racing a technical decision.
  await db.exec('LOCK TABLE evaluations IN SHARE ROW EXCLUSIVE MODE');
  let out;
  if(cmd==='import'){if(term!=='elvance')throw Error('Use import elvance');out=await importElvance(db,o,actor);}
  else if(cmd==='add'){
   const [e]=await db.query('INSERT INTO evaluations(code,account,name,engineer,due_date,purpose,value_amount,currency) VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',[need(o,'code'),need(o,'account'),need(o,'name'),need(o,'engineer'),day(need(o,'due')),need(o,'purpose'),...valuePair(o.value,o.currency)]);
   await audit(db,e.id,cmd,actor,e);out=e;
  }else{
   const e=await resolve(db,'evaluations',term);
   if(!['reopen','log','review'].includes(cmd))active(e);
   let detail={};
   if(cmd==='assign'){detail={engineer:need(o,'engineer')};await db.query('UPDATE evaluations SET engineer=$1 WHERE id=$2',[detail.engineer,e.id]);}
   else if(cmd==='plan'){detail={due_date:day(need(o,'due'))};await db.query('UPDATE evaluations SET due_date=$1 WHERE id=$2',[detail.due_date,e.id]);}
   else if(cmd==='review'){
    detail={purpose:need(o,'purpose'),retention_review:day(need(o,'retention-review')),reviewed_on:observed(need(o,'date')),note:need(o,'note')};
    if(detail.retention_review<=detail.reviewed_on)throw Error('Retention review must follow the accuracy review');
    await db.query('UPDATE evaluations SET purpose=$1,retention_review=$2,reviewed_on=$3 WHERE id=$4',[detail.purpose,detail.retention_review,detail.reviewed_on,e.id]);
   }else if(cmd==='add-criterion'){
    [detail]=await db.query('INSERT INTO criteria(evaluation_id,name,expected,mandatory) VALUES($1,$2,$3,$4) RETURNING *',[e.id,need(o,'name'),need(o,'expected'),bool(o.mandatory)]);
   }else if(cmd==='record-result'){
    const c=await resolve(db,'criteria',child,e.id);const status=choice(need(o,'status'),['passed','failed']);
    [detail]=await db.query('UPDATE criteria SET status=$1,evidence=$2,reviewer=$3,reviewed_on=$4 WHERE id=$5 RETURNING *',[status,need(o,'evidence'),actor,observed(need(o,'date')),c.id]);
   }else if(cmd==='add-gap'){
    [detail]=await db.query('INSERT INTO gaps(evaluation_id,feature,owner,due_date,blocking,evidence) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[e.id,need(o,'feature'),need(o,'owner'),day(need(o,'due')),bool(o.blocking),need(o,'evidence')]);
   }else if(cmd==='resolve-gap'){
    const g=await resolve(db,'gaps',child,e.id);
    if(g.status==='resolved')throw Error('Gap is already resolved');
    [detail]=await db.query("UPDATE gaps SET status='resolved',resolution=$1 WHERE id=$2 RETURNING *",[need(o,'resolution'),g.id]);
   }else if(cmd==='log'){
    const minutes=Number(need(o,'minutes'));if(!Number.isInteger(minutes)||minutes<=0||minutes>1440)throw Error('Minutes must be an integer from 1 to 1440');
    [detail]=await db.query('INSERT INTO activities(evaluation_id,engineer,occurred_on,minutes,kind,note,actor) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[e.id,need(o,'engineer'),observed(need(o,'date')),minutes,choice(need(o,'kind'),['discovery','demo','poc','review','handover']),need(o,'note'),actor]);
   }else if(cmd==='decide'){
    const status=choice(need(o,'status'),['technical-win','technical-loss','paused']);const note=need(o,'note');
    if(status==='technical-win'){
     const [s]=await db.query('SELECT * FROM scorecards WHERE id=$1',[e.id]);
     if(Number(s.required_count)===0||Number(s.required_unproven)>0||Number(s.blockers)>0)throw Error('Technical win requires mandatory criteria, all passed, and no open blocking gaps');
     if(!e.reviewed_on||String(e.reviewed_on)<new Date(Date.now()-14*86400000).toISOString().slice(0,10)||!e.purpose.trim()||!e.retention_review||String(e.retention_review)<=today())throw Error('Complete the accuracy and retention review before a technical win');
    }
    detail={status,note};await db.query('UPDATE evaluations SET status=$1,decision_note=$2,decision_by=$3,decision_at=now() WHERE id=$4',[status,note,actor,e.id]);
   }else if(cmd==='reopen'){
    if(e.status==='active')throw Error('Evaluation is already active');detail={previous_status:e.status,note:need(o,'note')};
    await db.query("UPDATE evaluations SET status='active',decision_note=NULL,decision_by=NULL,decision_at=NULL WHERE id=$1",[e.id]);
   }
   await audit(db,e.id,cmd,actor,detail);out={code:e.code,action:cmd,...detail};
  }
  await db.exec(o['dry-run']?'ROLLBACK':'COMMIT');return out;
 }catch(error){await db.exec('ROLLBACK');throw error;}
}
export function human(value){
 if(Array.isArray(value))return table(value,(value.length?Object.keys(value[0]):[]).map(key=>({key,label:key,width:75,format:v=>v===null?'':typeof v==='object'?JSON.stringify(v):String(v)})));
 return Object.entries(value).map(([key,v])=>`${key}\n${Array.isArray(v)?human(v):v&&typeof v==='object'?JSON.stringify(v,null,2):v}`).join('\n\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href){
 let db;try{db=await getDb();const result=await run(db,process.argv.slice(2));console.log(process.argv.includes('--json')?JSON.stringify(result,null,2):human(result));}
 catch(e){console.error(e.message);process.exitCode=1;}finally{if(db)await db.close();}
}
