import {readdirSync,readFileSync,mkdirSync,writeFileSync} from 'node:fs';
import path from 'node:path';

const types={'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.otf':'font/otf','.txt':'text/plain; charset=utf-8','.json':'application/json','.xml':'application/xml'};
const assets={};
function walk(dir){
  for(const entry of readdirSync(dir,{withFileTypes:true})){
    if(entry.name.startsWith('.')||entry.name.startsWith('__')||entry.name==='server')continue;
    const file=path.join(dir,entry.name);
    if(entry.isDirectory()){walk(file);continue;}
    const extension=path.extname(entry.name);
    if(!types[extension])continue;
    const encoding=extension==='.otf'?'base64':'utf8';
    assets[path.relative('dist',file)]=[types[extension],encoding,readFileSync(file,encoding)];
  }
}
walk('dist');
const league=readFileSync('worker/league.mjs','utf8');
const worker=readFileSync('worker/site.mjs','utf8');
mkdirSync('dist/server',{recursive:true});
writeFileSync('dist/server/index.js',`const siteAssets=${JSON.stringify(assets)};\n${league}\n${worker}`);
console.log(`Packaged ${Object.keys(assets).length} web assets and the World League Worker.`);
