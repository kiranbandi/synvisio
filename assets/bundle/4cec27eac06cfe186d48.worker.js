!function(e){var t={};function r(n){if(t[n])return t[n].exports;var o=t[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,r),o.l=!0,o.exports}r.m=e,r.c=t,r.d=function(e,t,n){r.o(e,t)||Object.defineProperty(e,t,{enumerable:!0,get:n})},r.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},r.t=function(e,t){if(1&t&&(e=r(e)),8&t)return e;if(4&t&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(r.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&t&&"string"!=typeof e)for(var o in e)r.d(n,o,function(t){return e[t]}.bind(null,o));return n},r.n=function(e){var t=e&&e.__esModule?function(){return e.default}:function(){return e};return r.d(t,"a",t),t},r.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)},r.p="",r(r.s=0)}([function(e,t,r){"use strict";function n(e,t={}){let{processScaffolds:r=!1}=t,n=!1,o=function(t){let r,n=new Map,o=new Map;return e.split("\n").forEach((function(e){let s=(r=e.split("\t"))[0],a=r[0].slice(0,2),i=parseInt(r[2]),c=parseInt(r[3]),u=r[1];if(s.length>=2&&s.length<=(t?25:4))if(n.set(u,{start:i,end:c,chromosomeId:s}),o.has(s)){var f=o.get(s);i<f.start&&(f.start=i),c>f.end&&(f.end=c),o.set(s,f)}else o.set(s,{start:i,end:c,speciesIdentifier:a})})),{genomeLibrary:n,chromosomeMap:o}},{chromosomeMap:s,genomeLibrary:a}=o(r);if(0==[...s.keys()].length&&!n){let e=o(!0);n=!0,s=e.chromosomeMap,a=e.genomeLibrary}return s.forEach(e=>{e.width=e.end-e.start}),{genomeLibrary:a,chromosomeMap:s,scaffoldBypassed:n}}r.r(t),r.d(t,"process",(function(){return n})),addEventListener("message",(function(e){var r,n=e.data,o=n.type,s=n.method,a=n.id,i=n.params;"RPC"===o&&s&&((r=t[s])?Promise.resolve().then((function(){return r.apply(t,i)})):Promise.reject("No such method")).then((function(e){postMessage({type:"RPC",id:a,result:e})})).catch((function(e){var t={message:e};e.stack&&(t.message=e.message,t.stack=e.stack,t.name=e.name),postMessage({type:"RPC",id:a,error:t})}))})),postMessage({type:"RPC",method:"ready"})}]);