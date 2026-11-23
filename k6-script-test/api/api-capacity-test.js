import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';
import exec from 'k6/execution';
import { BASE_URL, TEST_EMAIL, TEST_PASSWORD, THINK_TIME_SECONDS } from '../browser/config.js';

const maxVus=Math.max(1,Math.min(100,Number(__ENV.MAX_VUS||20)));
const step=Math.max(1,Math.min(maxVus,Number(__ENV.VUS_STEP||5)));
const duration=__ENV.STAGE_DURATION||'30s';
const target=(__ENV.TEST_API||'all').toLowerCase();
const writeOrders=(__ENV.INCLUDE_ORDER_WRITE||'false').toLowerCase()==='true';
const p95Limit=Number(__ENV.MAX_P95_MS||500);
const errorLimit=Number(__ENV.MAX_ERROR_RATE||0.01);
// Ramp to each VU level, then hold it for the configured duration.
const stages=[];
for(let v=step;v<maxVus;v+=step) {
  stages.push({duration:'10s',target:v});
  stages.push({duration,target:v});
}
if(!stages.length || stages[stages.length-1].target!==maxVus) {
  stages.push({duration:'10s',target:maxVus});
  stages.push({duration,target:maxVus});
}
stages.push({duration:'15s',target:0});

export const apiSuccess=new Rate('api_success');
export const apiDuration=new Trend('api_duration_ms',true);
export const apiFailures=new Counter('api_failures');
export const options={scenarios:{api_capacity:{executor:'ramping-vus',startVUs:0,stages,gracefulRampDown:'10s',gracefulStop:'30s'}},thresholds:{api_success:[{threshold:`rate>=${1-errorLimit}`,abortOnFail:false}],api_duration_ms:[{threshold:`p(95)<${p95Limit}`,abortOnFail:false}]}};

const jsonHeaders={'Content-Type':'application/json'};
const timeout=__ENV.HTTP_TIMEOUT||'30s';
const tags=name=>({endpoint:name,vus_level:String(exec.instance.vusActive||0)});
const parse=r=>{try{return r.json()}catch(_){return null}};
function findToken(o){if(!o||typeof o!=='object')return null;for(const k of ['token','accessToken','access_token','jwt'])if(typeof o[k]==='string'&&o[k].length>10)return o[k];for(const v of Object.values(o)){const t=findToken(v);if(t)return t}return null}
function getProducts(o){if(Array.isArray(o))return o;if(!o||typeof o!=='object')return[];for(const k of ['products','data','items','results']){if(Array.isArray(o[k]))return o[k];if(o[k]&&typeof o[k]==='object')for(const n of ['products','items','results'])if(Array.isArray(o[k][n]))return o[k][n]}return[]}
function validate(name,r,statuses,bodyOk=true){const statusOk=statuses.includes(r.status),ok=statusOk&&bodyOk,t=tags(name);apiSuccess.add(ok,t);apiDuration.add(r.timings.duration,t);if(!ok)apiFailures.add(1,t);check(r,{[name+' status']:()=>statusOk,[name+' response body']:()=>bodyOk})}
export function setup(){
 if(!TEST_EMAIL||!TEST_PASSWORD)throw new Error('Set TEST_EMAIL and TEST_PASSWORD environment variables/GitHub Secrets.');
 const r=http.post(`${BASE_URL}/api/auth/login`,JSON.stringify({email:TEST_EMAIL,password:TEST_PASSWORD}),{headers:jsonHeaders,timeout,tags:{endpoint:'setup_login'}});
 if(r.status<200||r.status>=300)throw new Error(`Setup login failed HTTP ${r.status}`);
 const token=findToken(parse(r));if(!token)throw new Error('Login response token not found. Expected token/accessToken/access_token/jwt.');
 const auth={...jsonHeaders,Authorization:`Bearer ${token}`};
 const pr=http.get(`${BASE_URL}/api/products`,{headers:auth,timeout,tags:{endpoint:'setup_products'}});
 const list=getProducts(parse(pr));const product=list.find(x=>x&&(x.id!==undefined||x.productId!==undefined||x.product_id!==undefined));
 return {token,productId:product?(product.id??product.productId??product.product_id):null};
}
export default function(data){
 const auth={...jsonHeaders,Authorization:`Bearer ${data.token}`},vu=String(exec.instance.vusActive||0);
 if(target==='all'||target==='login'){const r=http.post(`${BASE_URL}/api/auth/login`,JSON.stringify({email:TEST_EMAIL,password:TEST_PASSWORD}),{headers:jsonHeaders,timeout,tags:{endpoint:'login',vus_level:vu}});validate('login',r,[200],Boolean(findToken(parse(r))))}
 if(target==='all'||target==='products'){const r=http.get(`${BASE_URL}/api/products`,{headers:auth,timeout,tags:{endpoint:'products',vus_level:vu}});validate('products',r,[200],getProducts(parse(r)).length>0)}
 if(target==='all'||target==='me'){const r=http.get(`${BASE_URL}/api/auth/me`,{headers:auth,timeout,tags:{endpoint:'me',vus_level:vu}});validate('me',r,[200],parse(r)!==null)}
 if((target==='all'||target==='orders')&&writeOrders){
  if(data.productId===null)throw new Error('No product ID found for POST /api/orders.');
  const r=http.post(`${BASE_URL}/api/orders`,JSON.stringify({payment:__ENV.ORDER_PAYMENT||'QRIS',shipping:__ENV.ORDER_SHIPPING||'reguler',items:[{productId:data.productId,qty:1}]}),{headers:auth,timeout,tags:{endpoint:'orders_write',vus_level:vu}});
  const body=parse(r);validate('orders_write',r,[201],Boolean(body&&body.id));
 }
 if(THINK_TIME_SECONDS>0)sleep(THINK_TIME_SECONDS);
}
