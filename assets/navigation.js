/* Maths unified navigation: strand -> topic -> subtopic. */
(()=>{"use strict";
const source=document.currentScript;if(!source)return;
const root=new URL("../",source.src),url=p=>new URL(p,root).href;
const L=(label,path)=>({label,path}),T=(label,home,rest=[])=>({label,home,items:[L("Overview",home),...rest]});
const strands=[
{label:"Number",home:"number/index.html",topics:[
 T("Sets","number/sets/index.html",[L("Sets explorer","apps/sets/index.html"),L("Listing and notation","apps/sets/list-and-notation.html"),L("Number sets","apps/sets/number-sets.html"),L("Venn diagrams","apps/sets/number-venn.html"),L("Universal set and complement","apps/sets/universal-complement.html"),L("Problem solving","apps/sets/venn-problem-solving.html")]),
 T("Sequences","number/sequences/index.html",[L("Linear sequences","apps/linear-sequences/index.html"),L("Graph explorer","apps/linear-sequences/graph.html"),L("Algebra sequences","algebra/sequences/index.html"),L("Quadratic sequences","apps/quadratic-sequences/index.html"),L("Geometric sequences","apps/geometric-sequences/index.html"),L("Sequence challenges","apps/sequence-challenges/index.html"),L("Farey sequences","apps/farey-sequences/index.html")]),
 T("Fractions and decimals","number/fractions/index.html",[L("Farey fractions","apps/farey-sequences/index.html")]),
 T("Complex numbers","number/complex-numbers/index.html",[L("Complex Numbers Explorer","apps/complex-numbers/index.html")])]},
{label:"Algebra",home:"algebra/index.html",topics:[
 T("Expanding brackets","algebra/expansions/index.html",[L("Split the brackets","apps/split-brackets/index.html"),L("Place-value method","apps/polynomial-place-value/index.html"),L("Vertical FOIL","apps/vertical-foil/index.html"),L("Inline rainbow FOIL","apps/inline-rainbow/index.html"),L("Other FOIL representations","apps/foil/index.html"),L("Linear right margin","apps/linear-right-margin/index.html")]),
 T("Factorising","algebra/factorising/index.html",[L("Factorising frame","apps/factorising-frame/index.html")])]},
{label:"Functions",home:"functions/index.html",topics:[T("Quadratic functions","functions/quadratic-functions/index.html")]},
{label:"Geometry",home:"geometry/index.html",topics:[T("Squares and rectangles","geometry/rectangle-variables/index.html",[L("Rectangle explorer","geometry/rectangle-variables/app.html")]),T("Pythagoras","apps/pythagoras/index.html")]},
{label:"Trigonometry",home:"trigonometry/index.html",topics:[
 T("Right-angled triangles","apps/right-angle-ratios/index.html",[L("Sine","apps/trigonometry/sine/index.html"),L("Cosine","apps/trigonometry/cosine/index.html"),L("Tangent","apps/trigonometry/tangent/index.html")]),
 T("Sine and cosine rules","trigonometry/triangle-rules/index.html",[L("Triangle explorer","apps/triangle-rules/index.html"),L("Geometry triangle rules","geometry/triangle-rules/index.html")])]},
{label:"Statistics",home:"statistics/index.html",topics:[T("Describing data","statistics/describing-data/index.html")]},
{label:"Probability",home:"probability/index.html",topics:[T("Probability experiments","probability/theoretical-experimental/index.html"),T("Tree diagrams","probability/tree-diagrams/index.html"),T("Counting principles","probability/counting/index.html")]},
{label:"Combinatorics",home:"combinatorics/index.html",topics:[T("Counting","combinatorics/counting/index.html")]}];
const relative=decodeURIComponent(location.pathname).replace(root.pathname,"").replace(/^\/+/,"");
const path=!relative?"index.html":relative.endsWith("/")?relative+"index.html":relative;
let selected=null,section=null;
for(const s of strands){for(const t of s.topics){if(path===t.home||t.items.some(i=>i.path===path)){selected=t;section=s;break;}}if(selected)break;}
if(!section)section=strands.find(s=>path===s.home||path.startsWith(s.home.split("/")[0]+"/"))||null;
const a=(item,cls="")=>{const x=document.createElement("a");x.href=url(item.path);x.textContent=item.label;x.className=cls;if(path===item.path){x.classList.add("maths-current");x.setAttribute("aria-current","page");}return x;};
function nav(menu){
 menu.classList.add("maths-strands");menu.setAttribute("aria-label","Mathematics strands and topics");menu.replaceChildren();
 for(const s of strands){const d=document.createElement("details");d.className="maths-strand"+(s===section?" maths-selected-strand":"");
 const summary=document.createElement("summary");summary.textContent=s.label+" ";const arrow=document.createElement("span");arrow.textContent="⌄";arrow.setAttribute("aria-hidden","true");summary.append(arrow);d.append(summary);
 const drop=document.createElement("div");drop.className="maths-dropdown";drop.append(a(L("All "+s.label,s.home),"maths-all-topics"));s.topics.forEach(t=>drop.append(a(L(t.label,t.home))));d.append(drop);menu.append(d);
 d.addEventListener("toggle",()=>{if(d.open)menu.querySelectorAll("details").forEach(other=>{if(other!==d)other.open=false;});});}
 menu.addEventListener("click",e=>{if(e.target.closest("a")){menu.querySelectorAll("details").forEach(d=>d.open=false);menu.classList.remove("open");const toggle=document.getElementById("menu-toggle")||document.getElementById("maths-app-menu-toggle");toggle?.setAttribute("aria-expanded","false");}});
 document.addEventListener("click",e=>{if(!menu.contains(e.target))menu.querySelectorAll("details").forEach(d=>d.open=false);});
 document.addEventListener("keydown",e=>{if(e.key==="Escape")menu.querySelectorAll("details").forEach(d=>d.open=false);});
}
function side(el){
 el.replaceChildren();const h=document.createElement("h2");h.textContent=selected?selected.label:section?section.label+" topics":"Explore Maths";el.append(h);
 if(selected)el.append(a(L("← All "+section.label,section.home),"maths-back-link"));
 else if(section)el.append(a(L("Overview",section.home),"maths-back-link"));
 const list=document.createElement("div");list.className="maths-side-list";
 const items=selected?selected.items:section?section.topics.map(t=>L(t.label,t.home)):strands.map(s=>L(s.label,s.home));
 items.forEach(item=>list.append(a(item)));el.append(list);
}
function start(){
 if(document.documentElement.dataset.mathsNavReady)return;document.documentElement.dataset.mathsNavReady="yes";
 if(window.self!==window.top)return;
 const css=document.createElement("link");css.rel="stylesheet";css.href=new URL("navigation.css",source.src).href;document.head.append(css);
 let menu=document.getElementById("main-menu"),sidebar=document.querySelector(".stage>.sidebar");
 if(!menu){
 document.body.classList.add("maths-standalone-page");
 const bar=document.createElement("div");bar.className="maths-unified-top";
 const brand=a(L("","index.html"),"maths-unified-brand");brand.setAttribute("aria-label","Maths home");
 const logo=document.createElement("img");logo.alt="Maths four-dot logo";logo.src=url("assets/maths-logo.svg");brand.append(logo);bar.append(brand);
 const toggle=document.createElement("button");toggle.id="maths-app-menu-toggle";toggle.className="maths-unified-toggle";toggle.type="button";toggle.textContent="☰ Strands";toggle.setAttribute("aria-expanded","false");toggle.setAttribute("aria-controls","maths-app-strands");bar.append(toggle);
 menu=document.createElement("nav");menu.id="maths-app-strands";bar.append(menu);document.body.prepend(bar);
 toggle.addEventListener("click",()=>{const v=toggle.getAttribute("aria-expanded")!=="true";toggle.setAttribute("aria-expanded",String(v));menu.classList.toggle("open",v);});
 sidebar=document.createElement("aside");sidebar.className="maths-unified-side";sidebar.setAttribute("aria-label","Subtopics");bar.insertAdjacentElement("afterend",sidebar);
 }
 nav(menu);if(sidebar)side(sidebar);
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();