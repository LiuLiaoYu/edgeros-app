import{K as z,a2 as X,n as k,C as y,M as L,j as q,ar as J,as as R,at as ee,k as g,au as oe,s as N,r as P,c as p,d as K,l as $,a as d,Z as M,av as te,T as j,aw as F,ax as G,w as H,m as T,O as ne,S as ae,ay as se,Q as le,az as ce,F as re,aA as ie,X as B,p as ue,aB as de,aC as fe,_ as ve,W as ye}from"./index-CnDVkyK8.js";import{u as E}from"./use-scope-id-Dssc9r5O.js";function me(e){const o=X();o&&z(o.proxy,e)}const he={show:Boolean,zIndex:k,overlay:y,duration:k,teleport:[String,Object],lockScroll:y,lazyRender:y,beforeClose:Function,overlayStyle:Object,overlayClass:L,transitionAppear:Boolean,closeOnClickOverlay:y};let h=0;const _="van-overflow-hidden";function Ie(e,o){const n=q(),f="01",a="10",c=r=>{n.move(r);const v=n.deltaY.value>0?a:f,S=oe(r.target,e.value),{scrollHeight:m,offsetHeight:O,scrollTop:C}=S;let i="11";C===0?i=O>=m?"00":"01":C+O>=m&&(i="10"),i!=="11"&&n.isVertical()&&!(parseInt(i,2)&parseInt(v,2))&&N(r,!0)},s=()=>{document.addEventListener("touchstart",n.start),document.addEventListener("touchmove",c,{passive:!1}),h||document.body.classList.add(_),h++},l=()=>{h&&(document.removeEventListener("touchstart",n.start),document.removeEventListener("touchmove",c),h--,h||document.body.classList.remove(_))},x=()=>o()&&s(),I=()=>o()&&l();J(x),R(I),ee(I),g(o,r=>{r?s():l()})}function U(e){const o=P(!1);return g(e,n=>{n&&(o.value=n)},{immediate:!0}),n=>()=>o.value?n():null}const[Oe,Ce]=p("overlay"),we={show:Boolean,zIndex:k,duration:k,className:L,lockScroll:y,lazyRender:y,customStyle:Object};var ke=K({name:Oe,props:we,setup(e,{slots:o}){const n=P(),f=U(()=>e.show||!e.lazyRender),a=s=>{e.lockScroll&&N(s,!0)},c=f(()=>{var s;const l=z(te(e.zIndex),e.customStyle);return j(e.duration)&&(l.animationDuration=`${e.duration}s`),F(d("div",{ref:n,style:l,class:[Ce(),e.className]},[(s=o.default)==null?void 0:s.call(o)]),[[G,e.show]])});return $("touchmove",a,{target:n}),()=>d(M,{name:"van-fade",appear:!0},{default:c})}});const Pe=H(ke),xe=z({},he,{round:Boolean,position:T("center"),closeIcon:T("cross"),closeable:Boolean,transition:String,iconPrefix:String,closeOnPopstate:Boolean,closeIconPosition:T("top-right"),safeAreaInsetTop:Boolean,safeAreaInsetBottom:Boolean}),[Se,D]=p("popup");var be=K({name:Se,inheritAttrs:!1,props:xe,emits:["open","close","opened","closed","keydown","update:show","clickOverlay","clickCloseIcon"],setup(e,{emit:o,attrs:n,slots:f}){let a,c;const s=P(),l=P(),x=U(()=>e.show||!e.lazyRender),I=ne(()=>{const t={zIndex:s.value};if(j(e.duration)){const u=e.position==="center"?"animationDuration":"transitionDuration";t[u]=`${e.duration}s`}return t}),r=()=>{a||(a=!0,s.value=e.zIndex!==void 0?+e.zIndex:ie(),o("open"))},v=()=>{a&&fe(e.beforeClose,{done(){a=!1,o("close"),o("update:show",!1)}})},S=t=>{o("clickOverlay",t),e.closeOnClickOverlay&&v()},m=()=>{if(e.overlay)return d(Pe,B({show:e.show,class:e.overlayClass,zIndex:s.value,duration:e.duration,customStyle:e.overlayStyle,role:e.closeOnClickOverlay?"button":void 0,tabindex:e.closeOnClickOverlay?0:void 0},E(),{onClick:S}),{default:f["overlay-content"]})},O=t=>{o("clickCloseIcon",t),v()},C=()=>{if(e.closeable)return d(ye,{role:"button",tabindex:0,name:e.closeIcon,class:[D("close-icon",e.closeIconPosition),ve],classPrefix:e.iconPrefix,onClick:O},null)};let i;const Y=()=>{i&&clearTimeout(i),i=setTimeout(()=>{o("opened")})},Z=()=>o("closed"),V=t=>o("keydown",t),W=x(()=>{var t;const{round:u,position:w,safeAreaInsetTop:b,safeAreaInsetBottom:Q}=e;return F(d("div",B({ref:l,style:I.value,role:"dialog",tabindex:0,class:[D({round:u,[w]:w}),{"van-safe-area-top":b,"van-safe-area-bottom":Q}],onKeydown:V},n,E()),[(t=f.default)==null?void 0:t.call(f),C()]),[[G,e.show]])}),A=()=>{const{position:t,transition:u,transitionAppear:w}=e,b=t==="center"?"van-fade":`van-popup-slide-${t}`;return d(M,{name:u||b,appear:w,onAfterEnter:Y,onAfterLeave:Z},{default:W})};return g(()=>e.show,t=>{t&&!a&&(r(),n.tabindex===0&&ue(()=>{var u;(u=l.value)==null||u.focus()})),!t&&a&&(a=!1,o("close"))}),me({popupRef:l}),Ie(l,()=>e.show&&e.lockScroll),$("popstate",()=>{e.closeOnPopstate&&(v(),c=!1)}),ae(()=>{e.show&&r()}),se(()=>{c&&(o("update:show",!0),c=!1)}),R(()=>{e.show&&e.teleport&&(v(),c=!0)}),le(de,()=>e.show),()=>e.teleport?d(ce,{to:e.teleport},{default:()=>[m(),A()]}):d(re,null,[m(),A()])}});const ge=H(be);export{ge as P,me as u};