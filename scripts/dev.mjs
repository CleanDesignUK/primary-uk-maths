import {createServer} from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
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
    // Read current source assets for browser QA; the Worker still owns API behaviour.
    if(['GET','HEAD'].includes(incoming.method)&&!previewUrl.pathname.startsWith('/api/')){
      const root=resolve('dist');
      let file=resolve(root,'.'+decodeURIComponent(previewUrl.pathname));
      if(file===root||file.startsWith(root+sep)){
        try{
          if((await stat(file)).isDirectory())file=resolve(file,'index.html');
          const body=await readFile(file);
          const types={'.html':'text/html','.css':'text/css','.mjs':'text/javascript','.js':'text/javascript','.svg':'image/svg+xml','.json':'application/json','.jpg':'image/jpeg','.png':'image/png','.woff2':'font/woff2'};
          outgoing.writeHead(200,{'Content-Type':types[extname(file)]||'application/octet-stream','Cache-Control':'no-store'});
          outgoing.end(incoming.method==='HEAD'?undefined:body);return;
        }catch{ /* The Worker provides redirects and 404s for missing static routes. */ }
      }
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
