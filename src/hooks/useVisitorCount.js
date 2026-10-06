import { useEffect, useState } from 'react';
const KEY = 'foodbingo:visitor-id:v1';
let requestPromise;
const valid = async (response) => {
  if (!response.ok || !(response.headers.get('content-type') || '').includes('application/json')) return null;
  const data = await response.json(); return Number.isFinite(data?.count) ? data.count : null;
};
const browserId = () => { try { let id = localStorage.getItem(KEY); if (!id && crypto?.randomUUID) { id = crypto.randomUUID(); localStorage.setItem(KEY, id); } return id; } catch { return null; } };
export default function useVisitorCount() {
 const [count,setCount]=useState(null); const [loading,setLoading]=useState(true); const [unavailable,setUnavailable]=useState(false);
 useEffect(()=>{ let alive=true; const id=browserId(); if(!id){setLoading(false);return undefined;} requestPromise ||= fetch('/api/visitors',{method:'POST',headers:{'Content-Type':'application/json'},credentials:'same-origin',body:JSON.stringify({browserId:id})}).then(valid).catch(()=>null); requestPromise.then(value=>{if(alive){setCount(value);setUnavailable(value === null);setLoading(false);}}); return()=>{alive=false;};},[]);
 return {count,loading,unavailable};
}