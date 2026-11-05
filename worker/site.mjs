// build-worker embeds the checked-in static assets and the World League handler.
export default {
  async fetch(request,env){
    const url=new URL(request.url);
    if(url.pathname.startsWith('/api/world/')){
      try{return await worldRequest(request,env);}
      catch(error){console.error('World League request failed',error.message);return json({error:'World League is taking a breather. Try again shortly.'},503);}
    }
    if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
    let key;
    try{key=decodeURIComponent(url.pathname).slice(1);}catch{return new Response('Invalid address',{status:400});}
    if(!key||key.endsWith('/'))key+='index.html';
    let asset=siteAssets[key];
    if(!asset&&siteAssets[`${key}/index.html`])return Response.redirect(`${url.origin}${url.pathname}/${url.search}`,308);
    if(!asset||!Object.hasOwn(siteAssets,key))return new Response('Page not found',{status:404});
    const [type,encoding,content]=asset;
    const body=encoding==='base64'?Uint8Array.from(atob(content),letter=>letter.charCodeAt(0)):content;
    return new Response(request.method==='HEAD'?null:body,{headers:{'Content-Type':type,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'}});
  }
};
