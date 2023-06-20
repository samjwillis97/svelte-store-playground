var gt=Object.defineProperty;var vt=(t,e,r)=>e in t?gt(t,e,{enumerable:!0,configurable:!0,writable:!0,value:r}):t[e]=r;var ce=(t,e,r)=>(vt(t,typeof e!="symbol"?e+"":e,r),r);import{J as dt,S as bt,i as mt,s as _t,k as s,q as y,a as m,l as u,m as d,r as w,h as a,c as _,n as i,b as ee,G as n,K as Y,L as M,M as U,H as lt,N as Et,I as rt,e as ot,O as yt,u as wt}from"../chunks/index.826d2e79.js";import{w as ft}from"../chunks/index.afe0d78c.js";const Tt=5,It=500;let pt={retryCount:5,retryBackoffTime:100};function kt(){return pt}function Lt(t){pt=t}const ne=new Map;function St(t,e){const r=ne.get(t);if(r)return Je(t),r.store;console.log(`creating: ${t}`);const l=Ct(e);return ne.set(t,l),Ue(l,e),ne.get(t).store}function Ue(t,e,r=0){console.log("executing fn"),r<Tt&&e().then(l=>At(t,l)).catch(()=>{t.store.update(l=>(l.isError=!0,l)),r=r+1,console.log(`retry: ${r}`),setTimeout(()=>{Ue(t,e,r)},r*It)})}function Je(t){if(console.log(`refreshing: ${t}`),!ne.has(t))return;const e=ne.get(t);e.store.update(r=>(r.isLoading=!0,r)),Ue(e,e.function)}class Vt{constructor(e,r,l){ce(this,"key");ce(this,"fn");ce(this,"optimisticMutateFn");ce(this,"isLoading",!1);ce(this,"isError",!1);this.key=e,this.fn=r,this.optimisticMutateFn=l}mutate(){this.isLoading=!0,this.isError=!1,console.log(`mutating v2 ${this.key}`);const e=ne.get(this.key),r=dt(e.store).data,l=JSON.parse(JSON.stringify(r));if(this.optimisticMutateFn&&r){const o=this.optimisticMutateFn(r);e.store.update(f=>(f.data=o,f))}this.fn().then(()=>{e&&Je(this.key),this.isLoading=!1}).catch(()=>{this.isError=!0,this.isLoading=!1,console.log(`error mutating: ${this.key}`),this.optimisticMutateFn&&e.store.update(o=>(o.data=l,o))}).finally(()=>{this.isLoading=!1})}}function Rt(t,e,r){const l=new Vt(t,e,r);return ft(l)}function He(t,e,r){console.log(`mutating ${t}`);const l=ne.get(t),o=dt(l.store).data,f=JSON.parse(JSON.stringify(o));if(r&&o){const c=r(o);l.store.update(p=>(p.data=c,p))}e().then(()=>{l&&Je(t)}).catch(()=>{console.log(`error mutating: ${t}`),r&&l.store.update(c=>(c.data=f,c))})}function Ct(t){return{function:t,store:ft({isLoading:!0,isError:!1,data:void 0})}}function At(t,e){return t.store.update(r=>(r.isLoading=!1,r.isError=!1,r.data=e,r)),t}async function we(t){return new Promise(e=>setTimeout(e,t*1e3))}let W=[],Z={failureRate:.5,sleepTime:.25};function Ot(){return Z}function Bt(t){Z=t}async function Nt(){if(await we(Z.sleepTime),Te())throw new Error("unable to get");return console.log("service: get"),console.log(W),JSON.parse(JSON.stringify(W))}async function ht(){if(await we(Z.sleepTime),Te())throw new Error("unable to add");return W.push(W.length.toString()),console.log("service: add"),console.log(W),!0}async function xt(){if(await we(Z.sleepTime),Te())throw new Error("unable to deleteAll");return W=[],console.log("service: deleteAll"),console.log(W),!0}async function Ft(t){if(await we(Z.sleepTime),Te())throw new Error("unable to deleteItem");const e=W.findIndex(r=>r===t);return e!==-1&&W.splice(e,1),console.log("service: deleteOne"),console.log(W),!0}function Te(){return console.log(Z.failureRate),Math.random()<Z.failureRate}function Dt(){return St("todos",Nt)}function Pt(){return Rt("todos",ht,t=>{if(t)return t.push(t==null?void 0:t.length.toString()),t})}function Mt(){He("todos",ht,t=>{if(t)return t.push(t==null?void 0:t.length.toString()),t})}function Ut(t){He("todos",async()=>await Ft(t))}function Jt(){He("todos",xt)}function nt(t,e,r){const l=t.slice();return l[19]=e[r],l}function it(t){let e,r;return{c(){e=s("p"),r=y("Adder Loading,")},l(l){e=u(l,"P",{});var o=d(e);r=w(o,"Adder Loading,"),o.forEach(a)},m(l,o){ee(l,e,o),n(e,r)},d(l){l&&a(e)}}}function at(t){let e,r;return{c(){e=s("p"),r=y("Error Adding,")},l(l){e=u(l,"P",{});var o=d(e);r=w(o,"Error Adding,"),o.forEach(a)},m(l,o){ee(l,e,o),n(e,r)},d(l){l&&a(e)}}}function Ht(t){let e,r;return{c(){e=s("p"),r=y("Waiting For Input...")},l(l){e=u(l,"P",{});var o=d(e);r=w(o,"Waiting For Input..."),o.forEach(a)},m(l,o){ee(l,e,o),n(e,r)},d(l){l&&a(e)}}}function qt(t){let e,r;return{c(){e=s("p"),r=y("Fetching Items,")},l(l){e=u(l,"P",{});var o=d(e);r=w(o,"Fetching Items,"),o.forEach(a)},m(l,o){ee(l,e,o),n(e,r)},d(l){l&&a(e)}}}function st(t){let e,r;return{c(){e=s("p"),r=y("Error Occured Fetching - Retrying")},l(l){e=u(l,"P",{});var o=d(e);r=w(o,"Error Occured Fetching - Retrying"),o.forEach(a)},m(l,o){ee(l,e,o),n(e,r)},d(l){l&&a(e)}}}function ut(t){let e,r=t[5].data,l=[];for(let o=0;o<r.length;o+=1)l[o]=ct(nt(t,r,o));return{c(){for(let o=0;o<l.length;o+=1)l[o].c();e=ot()},l(o){for(let f=0;f<l.length;f+=1)l[f].l(o);e=ot()},m(o,f){for(let c=0;c<l.length;c+=1)l[c]&&l[c].m(o,f);ee(o,e,f)},p(o,f){if(f&32){r=o[5].data;let c;for(c=0;c<r.length;c+=1){const p=nt(o,r,c);l[c]?l[c].p(p,f):(l[c]=ct(p),l[c].c(),l[c].m(e.parentNode,e))}for(;c<l.length;c+=1)l[c].d(1);l.length=r.length}},d(o){yt(l,o),o&&a(e)}}}function ct(t){let e,r,l,o=t[19]+"",f,c,p,b,B,N,g,$,k,A,Q;function te(){return t[16](t[19])}return{c(){e=s("div"),r=s("div"),l=s("p"),f=y(o),c=m(),p=s("div"),b=s("button"),B=y("info"),N=m(),g=s("button"),$=y("delete"),k=m(),this.h()},l(v){e=u(v,"DIV",{class:!0});var L=d(e);r=u(L,"DIV",{});var S=d(r);l=u(S,"P",{class:!0});var J=d(l);f=w(J,o),J.forEach(a),S.forEach(a),c=_(L),p=u(L,"DIV",{class:!0});var j=d(p);b=u(j,"BUTTON",{class:!0});var x=d(b);B=w(x,"info"),x.forEach(a),N=_(j),g=u(j,"BUTTON",{class:!0});var H=d(g);$=w(H,"delete"),H.forEach(a),j.forEach(a),k=_(L),L.forEach(a),this.h()},h(){i(l,"class","text-xl"),b.disabled=!0,i(b,"class","py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700 disabled:bg-blue-200"),i(g,"class","py-2 px-4 rounded text-white bg-red-500 hover:bg-red-700"),i(p,"class","flex flex-row gap-2.5"),i(e,"class","w-96 border shadow rounded px-5 py-5 flex flex-row gap-2.5 justify-between items-center")},m(v,L){ee(v,e,L),n(e,r),n(r,l),n(l,f),n(e,c),n(e,p),n(p,b),n(b,B),n(p,N),n(p,g),n(g,$),n(e,k),A||(Q=M(g,"click",te),A=!0)},p(v,L){t=v,L&32&&o!==(o=t[19]+"")&&wt(f,o)},d(v){v&&a(e),A=!1,Q()}}}function Wt(t){let e,r,l,o,f,c,p,b,B,N,g,$,k,A,Q,te,v,L,S,J,j,x,H,le,Ie,ke,F,Le,z,re,Se,Ve,D,Re,P,G,Ce,fe,Ae,K,Oe,pe,Be,oe,Ne,xe,E,de,Fe,De,he,ge,ve,Pe,ie,Me,qe,V=t[4].isLoading&&it(),R=t[4].isError&&at();function We(h,T){if(h[5].isLoading)return qt;if(!h[5].isError)return Ht}let ae=We(t),O=ae&&ae(t),C=t[5].isError&&st(),I=t[5].data&&t[5].data.length>0&&ut(t);return{c(){e=s("div"),r=s("div"),l=s("div"),o=s("h3"),f=y("Service Configuration"),c=m(),p=s("div"),b=s("label"),B=y("Failure Rate"),N=m(),g=s("input"),$=m(),k=s("div"),A=s("label"),Q=y("Sleep Time (ms)"),te=m(),v=s("input"),L=m(),S=s("div"),J=s("h3"),j=y("Store Configuration"),x=m(),H=s("div"),le=s("label"),Ie=y("Retry Count"),ke=m(),F=s("input"),Le=m(),z=s("div"),re=s("label"),Se=y("Retry Back Off (ms)"),Ve=m(),D=s("input"),Re=m(),P=s("div"),G=s("button"),Ce=y("Add Item"),Ae=m(),K=s("button"),Oe=y("Add Item 2"),Be=m(),oe=s("button"),Ne=y("Clear All"),xe=m(),E=s("div"),de=s("p"),Fe=y("Current Status:"),De=m(),V&&V.c(),he=m(),R&&R.c(),ge=m(),O&&O.c(),ve=m(),C&&C.c(),Pe=m(),ie=s("div"),I&&I.c(),this.h()},l(h){e=u(h,"DIV",{class:!0});var T=d(e);r=u(T,"DIV",{class:!0});var be=d(r);l=u(be,"DIV",{class:!0});var se=d(l);o=u(se,"H3",{class:!0});var $e=d(o);f=w($e,"Service Configuration"),$e.forEach(a),c=_(se),p=u(se,"DIV",{class:!0});var me=d(p);b=u(me,"LABEL",{class:!0,for:!0});var je=d(b);B=w(je,"Failure Rate"),je.forEach(a),N=_(me),g=u(me,"INPUT",{id:!0,placeholder:!0,type:!0,class:!0}),me.forEach(a),$=_(se),k=u(se,"DIV",{class:!0});var _e=d(k);A=u(_e,"LABEL",{class:!0,for:!0});var Ge=d(A);Q=w(Ge,"Sleep Time (ms)"),Ge.forEach(a),te=_(_e),v=u(_e,"INPUT",{id:!0,placeholder:!0,type:!0,class:!0}),_e.forEach(a),se.forEach(a),L=_(be),S=u(be,"DIV",{class:!0});var ue=d(S);J=u(ue,"H3",{class:!0});var Ke=d(J);j=w(Ke,"Store Configuration"),Ke.forEach(a),x=_(ue),H=u(ue,"DIV",{class:!0});var Ee=d(H);le=u(Ee,"LABEL",{class:!0,for:!0});var Qe=d(le);Ie=w(Qe,"Retry Count"),Qe.forEach(a),ke=_(Ee),F=u(Ee,"INPUT",{id:!0,placeholder:!0,type:!0,class:!0}),Ee.forEach(a),Le=_(ue),z=u(ue,"DIV",{class:!0});var ye=d(z);re=u(ye,"LABEL",{class:!0,for:!0});var ze=d(re);Se=w(ze,"Retry Back Off (ms)"),ze.forEach(a),Ve=_(ye),D=u(ye,"INPUT",{id:!0,placeholder:!0,type:!0,class:!0}),ye.forEach(a),ue.forEach(a),be.forEach(a),Re=_(T),P=u(T,"DIV",{class:!0});var X=d(P);G=u(X,"BUTTON",{class:!0});var Xe=d(G);Ce=w(Xe,"Add Item"),Xe.forEach(a),Ae=_(X),K=u(X,"BUTTON",{class:!0});var Ye=d(K);Oe=w(Ye,"Add Item 2"),Ye.forEach(a),Be=_(X),oe=u(X,"BUTTON",{class:!0});var Ze=d(oe);Ne=w(Ze,"Clear All"),Ze.forEach(a),xe=_(X),E=u(X,"DIV",{class:!0});var q=d(E);de=u(q,"P",{});var et=d(de);Fe=w(et,"Current Status:"),et.forEach(a),De=_(q),V&&V.l(q),he=_(q),R&&R.l(q),ge=_(q),O&&O.l(q),ve=_(q),C&&C.l(q),q.forEach(a),X.forEach(a),Pe=_(T),ie=u(T,"DIV",{});var tt=d(ie);I&&I.l(tt),tt.forEach(a),T.forEach(a),this.h()},h(){i(o,"class","text-xl"),i(b,"class","block text-gray-700 text-sm font-bold mb-2"),i(b,"for","serviceFailureRate"),i(g,"id","serviceFailureRate"),i(g,"placeholder","Failure Rate"),i(g,"type","number"),i(g,"class","w-full shadow appearance-none border rounded px-3 py-2 text-gray"),i(p,"class","w-full"),i(A,"class","block text-gray-700 text-sm font-bold mb-2"),i(A,"for","serviceSleepTime"),i(v,"id","serviceSleepTime"),i(v,"placeholder","Sleep Time"),i(v,"type","number"),i(v,"class","w-full shadow appearance-none border rounded px-3 py-2 text-gray"),i(k,"class","w-full"),i(l,"class","flex flex-col w-full gap-2.5"),i(J,"class","text-xl"),i(le,"class","block text-gray-700 text-sm font-bold mb-2"),i(le,"for","storeRetryCount"),i(F,"id","storeRetryCount"),i(F,"placeholder","Retry Count"),i(F,"type","number"),i(F,"class","w-full shadow appearance-none border rounded px-3 py-2 text-gray"),i(H,"class","w-full"),i(re,"class","block text-gray-700 text-sm font-bold mb-2"),i(re,"for","serviceSleepTime"),i(D,"id","storeRetryBackoff"),i(D,"placeholder","Back Off (ms)"),i(D,"type","number"),i(D,"class","w-full shadow appearance-none border rounded px-3 py-2 text-gray"),i(z,"class","w-full"),i(S,"class","flex flex-col w-full gap-2.5"),i(r,"class","flex flex-row gap-5 w-full"),G.disabled=fe=t[5].isLoading,i(G,"class","py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700"),K.disabled=pe=t[4].isLoading,i(K,"class","py-2 px-4 rounded text-white bg-blue-500 hover:bg-blue-700"),i(oe,"class","py-2 px-4 rounded text-white bg-red-500 hover:bg-red-700"),i(E,"class","flex flex-row gap-1"),i(P,"class","flex flex-row gap-2.5 items-center w-full"),i(e,"class","flex flex-col gap-5 p-10 items-center")},m(h,T){ee(h,e,T),n(e,r),n(r,l),n(l,o),n(o,f),n(l,c),n(l,p),n(p,b),n(b,B),n(p,N),n(p,g),Y(g,t[0]),n(l,$),n(l,k),n(k,A),n(A,Q),n(k,te),n(k,v),Y(v,t[1]),n(r,L),n(r,S),n(S,J),n(J,j),n(S,x),n(S,H),n(H,le),n(le,Ie),n(H,ke),n(H,F),Y(F,t[2]),n(S,Le),n(S,z),n(z,re),n(re,Se),n(z,Ve),n(z,D),Y(D,t[3]),n(e,Re),n(e,P),n(P,G),n(G,Ce),n(P,Ae),n(P,K),n(K,Oe),n(P,Be),n(P,oe),n(oe,Ne),n(P,xe),n(P,E),n(E,de),n(de,Fe),n(E,De),V&&V.m(E,null),n(E,he),R&&R.m(E,null),n(E,ge),O&&O.m(E,null),n(E,ve),C&&C.m(E,null),n(e,Pe),n(e,ie),I&&I.m(ie,null),Me||(qe=[M(g,"input",t[12]),M(g,"change",t[6]),M(v,"input",t[13]),M(v,"change",t[6]),M(F,"input",t[14]),M(F,"change",t[7]),M(D,"input",t[15]),M(D,"change",t[7]),M(G,"click",t[10]),M(K,"click",t[11]),M(oe,"click",Jt)],Me=!0)},p(h,[T]){T&1&&U(g.value)!==h[0]&&Y(g,h[0]),T&2&&U(v.value)!==h[1]&&Y(v,h[1]),T&4&&U(F.value)!==h[2]&&Y(F,h[2]),T&8&&U(D.value)!==h[3]&&Y(D,h[3]),T&32&&fe!==(fe=h[5].isLoading)&&(G.disabled=fe),T&16&&pe!==(pe=h[4].isLoading)&&(K.disabled=pe),h[4].isLoading?V||(V=it(),V.c(),V.m(E,he)):V&&(V.d(1),V=null),h[4].isError?R||(R=at(),R.c(),R.m(E,ge)):R&&(R.d(1),R=null),ae!==(ae=We(h))&&(O&&O.d(1),O=ae&&ae(h),O&&(O.c(),O.m(E,ve))),h[5].isError?C||(C=st(),C.c(),C.m(E,null)):C&&(C.d(1),C=null),h[5].data&&h[5].data.length>0?I?I.p(h,T):(I=ut(h),I.c(),I.m(ie,null)):I&&(I.d(1),I=null)},i:lt,o:lt,d(h){h&&a(e),V&&V.d(),R&&R.d(),O&&O.d(),C&&C.d(),I&&I.d(),Me=!1,Et(qe)}}}function $t(t,e,r){let l,o,f=Ot(),c=f.failureRate,p=f.sleepTime,b=kt(),B=b.retryCount,N=b.retryBackoffTime;function g(){f.failureRate=U(c),f.sleepTime=U(p),Bt(f)}function $(){b.retryCount=U(B),b.retryBackoffTime=U(N),Lt(b)}let k=Dt();rt(t,k,x=>r(5,o=x));let A=Pt();rt(t,A,x=>r(4,l=x));function Q(){console.log("add button"),Mt()}function te(){l.mutate()}function v(){c=U(this.value),r(0,c)}function L(){p=U(this.value),r(1,p)}function S(){B=U(this.value),r(2,B)}function J(){N=U(this.value),r(3,N)}return[c,p,B,N,l,o,g,$,k,A,Q,te,v,L,S,J,x=>Ut(x)]}class Qt extends bt{constructor(e){super(),mt(this,e,$t,Wt,_t,{})}}export{Qt as component};
