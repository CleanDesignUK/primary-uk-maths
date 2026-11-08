// Keep this tab's selected player while accepting newer progress from another tab.
export function receiveProgress(current,incoming,round=null){
 const activeId=incoming.profiles.some(p=>p.id===current.activeId)?current.activeId:incoming.activeId;
 const before=current.profiles.find(p=>p.id===round?.profileId),after=incoming.profiles.find(p=>p.id===round?.profileId);
 return {data:{...incoming,activeId},roundRemoved:!!round&&!after,roundChanged:!!round&&JSON.stringify(before)!==JSON.stringify(after)};
}
