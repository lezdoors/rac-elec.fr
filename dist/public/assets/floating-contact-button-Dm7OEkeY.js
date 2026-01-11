import{r as n,j as e,P as u,X as b}from"./index-5UuvGylF.js";import{P as h}from"./phone-call-LyDiU042.js";function y(){const[t,o]=n.useState(!1),[s,x]=n.useState(!1);n.useEffect(()=>{const a=()=>x(window.innerWidth<768);return a(),window.addEventListener("resize",a),()=>window.removeEventListener("resize",a)},[]);const r=n.useCallback(a=>{a.target.closest("[data-floating-contact]")||o(!1)},[]);n.useEffect(()=>(t&&document.addEventListener("click",r),()=>document.removeEventListener("click",r)),[t,r]);const i=n.useCallback(a=>{a.key==="Escape"&&t&&o(!1)},[t]);n.useEffect(()=>(document.addEventListener("keydown",i),()=>document.removeEventListener("keydown",i)),[i]);const p=a=>{a.stopPropagation(),o(!t)},l=s?52:56,c=s?22:24,d=s?20:32,m=s?200:240,f=()=>{const a=document.getElementById("contact-section")||document.getElementById("formulaire-raccordement");a?a.scrollIntoView({behavior:"smooth"}):window.location.href="/raccordement-enedis#formulaire-raccordement",o(!1)};return e.jsxs(e.Fragment,{children:[t&&e.jsx("div",{className:"fixed inset-0 z-[9998] transition-opacity duration-200",style:{backgroundColor:"rgba(0, 0, 0, 0.05)"},onClick:()=>o(!1),"aria-hidden":"true"}),e.jsxs("div",{"data-floating-contact":!0,className:"fixed z-[9999]",style:{bottom:`${d}px`,right:`${d}px`},children:[t&&e.jsxs("div",{role:"menu","aria-expanded":"true",className:"absolute bottom-[72px] right-0 bg-white rounded-xl border border-gray-200 p-2 transition-all duration-300 ease-out",style:{minWidth:`${m}px`,boxShadow:"0 8px 32px rgba(0, 0, 0, 0.12)",animation:"slideUp 0.3s ease-out"},children:[e.jsxs("a",{href:"tel:0970709570",role:"menuitem","aria-label":"Appeler le 09 70 70 95 70","data-testid":"contact-option-phone",className:"flex items-center gap-3 px-4 py-[14px] rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#3B82F6] hover:-translate-x-0.5 mb-1 no-underline",onClick:()=>o(!1),children:[e.jsx(u,{size:20,className:"text-[#3B82F6] flex-shrink-0"}),e.jsx("span",{className:"text-[15px] font-semibold text-[#1F2937]",children:"09 70 70 95 70"})]}),e.jsxs("button",{role:"menuitem","aria-label":"Demander un rappel gratuit","data-testid":"contact-option-callback",className:"w-full flex items-center gap-3 px-4 py-[14px] rounded-lg border border-transparent cursor-pointer transition-all duration-200 hover:bg-[#F9FAFB] hover:border-[#3B82F6] hover:-translate-x-0.5 bg-transparent",onClick:f,children:[e.jsx(h,{size:20,className:"text-[#3B82F6] flex-shrink-0"}),e.jsx("span",{className:"text-[15px] font-medium text-[#1F2937]",children:"Rappel gratuit"})]})]}),e.jsx("button",{onClick:p,"aria-label":"Options de contact","aria-expanded":t,"data-testid":"floating-contact-button",className:"relative flex items-center justify-center rounded-full cursor-pointer transition-all duration-200 ease-out hover:scale-105 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#3B82F6] focus-visible:ring-offset-2",style:{width:`${l}px`,height:`${l}px`,background:"linear-gradient(135deg, #1E3A8A 0%, #1E40AF 100%)",boxShadow:t?"0 6px 28px rgba(30, 58, 138, 0.4)":"0 4px 20px rgba(30, 58, 138, 0.3)",animation:t?"none":"subtleGlow 4s ease-in-out infinite"},children:e.jsx("div",{className:"transition-transform duration-300 ease-out",style:{transform:t?"rotate(180deg)":"rotate(0deg)"},children:t?e.jsx(b,{size:c,className:"text-white"}):e.jsx(u,{size:c,className:"text-white"})})})]}),e.jsx("style",{children:`
        @keyframes subtleGlow {
          0%, 100% {
            box-shadow: 0 4px 20px rgba(30, 58, 138, 0.3);
          }
          50% {
            box-shadow: 0 6px 28px rgba(30, 58, 138, 0.5);
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `})]})}export{y as F};
