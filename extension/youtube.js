const button=document.createElement('button');
button.textContent='Český přepis';
Object.assign(button.style,{position:'fixed',bottom:'85px',right:'12px',zIndex:'2147483647',background:'#172027',color:'white',padding:'12px 18px',border:'0',borderRadius:'12px',fontSize:'15px'});
document.documentElement.append(button);
button.onclick=async()=>{button.disabled=true;try{
const nodes=document.querySelectorAll('ytd-transcript-segment-renderer .segment-text, ytm-transcript-segment-renderer .segment-text, transcript-segment-view-model .segment-text');
const text=Array.from(nodes).map(n=>n.textContent.trim()).filter(Boolean).join('\n');
if(!text){alert('Nejprve otevřete na YouTube Zobrazit přepis. Pokud není dostupný, rozšíření jej nemůže získat.');return}
await browser.storage.local.set({pendingTranscript:{text,url:location.href}});
window.open('https://video-transcript-plum.vercel.app/?companion=1','_blank');
}catch(e){alert('Předání přepisu selhalo.')}finally{button.disabled=false}};
