const {decode}=require('./png');
const D='C:/Program Files (x86)/Steam/steamapps/workshop/content/294100/3527486510/Textures/';
function ext(f){const {width:w,height:h,data}=decode(f);let t=h,b=-1,l=w,r=-1;for(let y=0;y<h;y++)for(let x=0;x<w;x++)if(data[(y*w+x)*4+3]>=128){t=Math.min(t,y);b=Math.max(b,y);l=Math.min(l,x);r=Math.max(r,x);}return {t,b,h,l,r};}
const fs=require('fs');
for(const body of ['Male','Female','Thin','Thin_Female','Fat','Fat_Female','Hulk','Hulk_Female']){
 const nk=ext(D+'Things/Pawn/Humanlike/Bodies/Naked_'+body+'_south.png');
 let o=body.padEnd(12)+' body '+nk.t+'-'+nk.b+' (h'+nk.h+')';
 for(const [k,n] of [['boxers','boxers'],['panties','panties'],['bra','bra']]){
  const f=D+'UWUnderwear/'+k+'/'+n+'_'+body+'_south.png';
  if(fs.existsSync(f)){const e=ext(f);o+=' | '+k+' '+e.t+'-'+e.b+' w'+(e.r-e.l+1);}
 }
 console.log(o);
}
