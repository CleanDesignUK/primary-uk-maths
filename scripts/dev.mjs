import {createServer} from 'node:http';
import {execFileSync} from 'node:child_process';
import {previewDatabase} from './preview-db.mjs';

execFileSync(process.execPath,['scripts/build-worker.mjs'],{stdio:'inherit'});
const {default:worker}=await import('../dist/server/index.js');
const DB=previewDatabase();
const portArgument=process.argv.indexOf('--port');
const port=Number(process.env.PORT||(portArgument>=0?process.argv[portArgument+1]:4173));
createServer(async (incoming,outgoing)=>{
  try{
    const previewUrl=new URL(incoming.url,`http://${incoming.headers.host}`);
    if(previewUrl.pathname==='/__phone/'){
      const width=Math.max(320,Math.min(480,Number(previewUrl.searchParams.get('width'))||390));
      const skill=previewUrl.searchParams.get('skill')||'';
      const page=['home','tables','locker','league','world'].includes(previewUrl.searchParams.get('page'))?previewUrl.searchParams.get('page'):'home';
      const entry='/play/'+(skill?'?skill='+encodeURIComponent(skill):'')+'#'+page;
      outgoing.writeHead(200,{'Content-Type':'text/html; charset=utf-8'});
      outgoing.end(`<!doctype html><html lang="en"><title>Phone preview</title><body style="margin:0;background:#dce6d5"><iframe title="Phone preview" src="${entry}" style="display:block;width:${width}px;height:844px;border:0"></iframe></body></html>`);
      return;
    }
    const parts=[];
    for await(const chunk of incoming)parts.push(chunk);
    const method=incoming.method||'GET';
    const request=new Request(`http://${incoming.headers.host}${incoming.url}`,{method,headers:incoming.headers,body:['GET','HEAD'].includes(method)?undefined:Buffer.concat(parts)});
    const response=await worker.fetch(request,{DB});
    outgoing.writeHead(response.status,Object.fromEntries(response.headers));
    outgoing.end(Buffer.from(await response.arrayBuffer()));
  }catch(error){outgoing.writeHead(500);outgoing.end(error.message);}
}).listen(port,'0.0.0.0',()=>console.log(`Matchday preview listening on ${port}`));
