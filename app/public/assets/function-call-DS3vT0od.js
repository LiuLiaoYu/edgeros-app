import{c as I,d as B,k as v,S as T,ak as z,a as l,X as O,al as M,m as p,n as k,am as N,M as w,W as L,L as j,T as U,an as A,i as E,K as C,ao as V,J as q,r as D,a0 as H}from"./index-bxAwNUOc.js";import{P as J,u as K}from"./index-DDy8tDK5.js";let d=0;function W(e){e?(d||document.body.classList.add("van-toast--unclickable"),d++):d&&(d--,d||document.body.classList.remove("van-toast--unclickable"))}const[X,c]=I("toast"),_=["show","overlay","teleport","transition","overlayClass","overlayStyle","closeOnClickOverlay","zIndex"],F={icon:String,show:Boolean,type:p("text"),overlay:Boolean,message:k,iconSize:k,duration:N(2e3),position:p("middle"),teleport:[String,Object],wordBreak:String,className:w,iconPrefix:String,transition:p("van-fade"),loadingType:String,forbidClick:Boolean,overlayClass:w,overlayStyle:Object,closeOnClick:Boolean,closeOnClickOverlay:Boolean,zIndex:k};var G=B({name:X,props:F,emits:["update:show"],setup(e,{emit:t,slots:n}){let i,o=!1;const r=()=>{const a=e.show&&e.forbidClick;o!==a&&(o=a,W(o))},u=a=>t("update:show",a),g=()=>{e.closeOnClick&&u(!1)},f=()=>clearTimeout(i),m=()=>{const{icon:a,type:s,iconSize:h,iconPrefix:x,loadingType:P}=e;if(a||s==="success"||s==="fail")return l(L,{name:a||s,size:h,class:c("icon"),classPrefix:x},null);if(s==="loading")return l(j,{class:c("loading"),size:h,type:P},null)},S=()=>{const{type:a,message:s}=e;if(n.message)return l("div",{class:c("text")},[n.message()]);if(U(s)&&s!=="")return a==="html"?l("div",{key:0,class:c("text"),innerHTML:String(s)},null):l("div",{class:c("text")},[s])};return v(()=>[e.show,e.forbidClick],r),v(()=>[e.show,e.type,e.message,e.duration],()=>{f(),e.show&&e.duration>0&&(i=setTimeout(()=>{u(!1)},e.duration))}),T(r),z(r),()=>l(J,O({class:[c([e.position,e.wordBreak==="normal"?"break-normal":e.wordBreak,{[e.type]:!e.icon}]),e.className],lockScroll:!1,onClick:g,onClosed:f,"onUpdate:show":u},M(e,_)),{default:()=>[m(),S()]})}});function Q(){const e=E({show:!1}),t=o=>{e.show=o},n=o=>{C(e,o,{transitionAppear:!0}),t(!0)},i=()=>t(!1);return K({open:n,close:i,toggle:t}),{open:n,close:i,state:e,toggle:t}}function R(e){const t=A(e),n=document.createElement("div");return document.body.appendChild(n),{instance:t.mount(n),unmount(){t.unmount(),document.body.removeChild(n)}}}const Y={icon:"",type:"text",message:"",className:"",overlay:!1,onClose:void 0,onOpened:void 0,duration:2e3,teleport:"body",iconSize:void 0,iconPrefix:void 0,position:"middle",transition:"van-fade",forbidClick:!1,loadingType:void 0,overlayClass:"",overlayStyle:void 0,closeOnClick:!1,closeOnClickOverlay:!1};let y=[],Z=!1,b=C({},Y);const $=new Map;function ee(e){return q(e)?e:{message:e}}function ne(){const{instance:e,unmount:t}=R({setup(){const n=D(""),{open:i,state:o,close:r,toggle:u}=Q(),g=()=>{},f=()=>l(G,O(o,{onClosed:g,"onUpdate:show":u}),null);return v(n,m=>{o.message=m}),H().render=f,{open:i,close:r,message:n}}});return e}function te(){if(!y.length||Z){const e=ne();y.push(e)}return y[y.length-1]}function ie(e={}){if(!V)return{};const t=te(),n=ee(e);return t.open(C({},b,$.get(n.type||b.type),n)),t}export{ie as s};
