import { chromium } from '/workspace/mabhiyoza-site/node_modules/playwright/index.mjs';
const b = await chromium.launch();
for (const [n,w,h,m] of [['desktop',1440,900,false],['mobile',390,844,true]]) {
  const p = await (await b.newContext({viewport:{width:w,height:h},isMobile:m})).newPage(); const bad=[];
  p.on('response',r=>{if(r.status()>=400)bad.push(r.url())});
  await p.goto('https://qyvn.github.io/mabhiyoza-site/',{waitUntil:'networkidle'});
  await p.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,100))}});
  const broken=await p.evaluate(()=>[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src));
  console.log(n,'imgs',await p.evaluate(()=>document.images.length),'broken',broken,'4xx',bad);
  await p.evaluate(()=>scrollTo(0,0)); await p.waitForTimeout(300);
  await p.screenshot({path:`screenshots/live-${n}.png`}); await p.screenshot({path:`screenshots/live-${n}-full.png`,fullPage:true});
}
await b.close();
