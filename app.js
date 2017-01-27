!function(){"use strict";var e="undefined"==typeof global?self:global;if("function"!=typeof e.require){var t={},n={},r={},i={}.hasOwnProperty,o=/^\.\.?(\/|$)/,u=function(e,t){for(var n,r=[],i=(o.test(t)?e+"/"+t:t).split("/"),u=0,a=i.length;u<a;u++)n=i[u],".."===n?r.pop():"."!==n&&""!==n&&r.push(n);return r.join("/")},a=function(e){return e.split("/").slice(0,-1).join("/")},c=function(t){return function(n){var r=u(a(t),n);return e.require(r,t)}},s=function(e,t){var r=b&&b.createHot(e),i={id:e,exports:{},hot:r};return n[e]=i,t(i.exports,c(e),i),i.exports},l=function(e){return r[e]?l(r[e]):e},f=function(e,t){return l(u(a(e),t))},p=function(e,r){null==r&&(r="/");var o=l(e);if(i.call(n,o))return n[o].exports;if(i.call(t,o))return s(o,t[o]);throw new Error("Cannot find module '"+e+"' from '"+r+"'")};p.alias=function(e,t){r[t]=e};var d=/\.[^.\/]+$/,m=/\/index(\.[^\/]+)?$/,h=function(e){if(d.test(e)){var t=e.replace(d,"");i.call(r,t)&&r[t].replace(d,"")!==t+"/index"||(r[t]=e)}if(m.test(e)){var n=e.replace(m,"");i.call(r,n)||(r[n]=e)}};p.register=p.define=function(e,r){if(e&&"object"==typeof e)for(var o in e)i.call(e,o)&&p.register(o,e[o]);else t[e]=r,delete n[e],h(e)},p.list=function(){var e=[];for(var n in t)i.call(t,n)&&e.push(n);return e};var b=e._hmr&&new e._hmr(f,p,t,n);p._cache=n,p.hmr=b&&b.wrap,p.brunch=!0,e.require=p}}(),function(){"undefined"==typeof window?this:window;require.register("api/index.js",function(e,t,n){"use strict";Object.defineProperty(e,"__esModule",{value:!0});var r=t("./repositories");Object.defineProperty(e,"numberOfRepositories",{enumerable:!0,get:function(){return r.numberOfRepositories}})}),require.register("api/repositories.js",function(e,t,n){"use strict";function r(e){if(u(e))return new Promise(function(t){return t(u(e))});var t=o(e);return t.then(function(t){return a(e,t)}),t}Object.defineProperty(e,"__esModule",{value:!0}),e.numberOfRepositories=r;var i="https://api.github.com/search/",o=function(e){return fetch(i+"repositories?q=+language:"+e).then(function(e){return e.json().then(function(e){return e.total_count})})},u=function(e){return localStorage.getItem("repo_viz_numbers_"+e)},a=function(e,t){localStorage.setItem("repo_viz_numbers_"+e,t)}}),require.register("app.js",function(e,t,n){"use strict";function r(e){if(e&&e.__esModule)return e;var t={};if(null!=e)for(var n in e)Object.prototype.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t["default"]=e,t}function i(){return{render:function(e){m().then(function(e){d(e)})}}}Object.defineProperty(e,"__esModule",{value:!0}),e.App=i;var o=t("api"),u=t("d3"),a=r(u),c=t("d3-scale"),s=["ruby","javascript","java","go","elixir","haskell","c","cpp","lua","python"],l=.063,f=a.scaleOrdinal(c.schemeCategory10),p=function(e){return e.toString().replace(/\B(?=(\d{3})+(?!\d))/g,".")},d=function(e){var t=window.innerHeight,n=window.innerWidth,r=a.scalePow().exponent(.5).range([50,.3*t]).domain([0,40*a.max(e,function(e){return e.amount})]),i=a.select("body").append("svg").attr("width",n).attr("height",t).attr("class","bubbles"),o=function(){i.selectAll(".bubble").attr("transform",function(e){return"translate("+(e.x-e.radius/2)+", "+(e.y-e.radius/2)+")"})},u=a.forceSimulation().velocityDecay(.2).force("x",a.forceX().strength(l).x(n/2)).force("y",a.forceY().strength(l).y(t/2)).force("collide",a.forceCollide(function(e){return 1.2*e.radius}).iterations(2)).on("tick",o),c=e.map(function(e){return{radius:r(e.amount),x:Math.random()*n,y:Math.random()*t,amount:e.amount,name:e.name}}),s=i.selectAll(".bubble").data(c,function(e){return e.id}),d=s.enter().append("g").classed("bubble",!0).attr("transform",function(e){return"translate("+e.x+", "+e.y+")"});d.append("circle").attr("r",function(e){return e.radius}).style("fill",function(e){return f(e.amount)}),d.append("text").attr("text-anchor","middle").style("fill","white").text(function(e){return e.name}),d.append("text").attr("y","15").attr("text-anchor","middle").style("fill","white").text(function(e){return p(e.amount)+" repos"}),s=s.merge(d),u.nodes(c)},m=function(){var e=[];return new Promise(function(t,n){s.forEach(function(t){(0,o.numberOfRepositories)(t).then(function(n){console.log(t+" has "+n+" repos on github."),e.push({name:t,amount:n})})}),t(e)})}}),require.register("initialize.js",function(e,t,n){"use strict";var r=t("app");document.addEventListener("DOMContentLoaded",function(){console.log("Initialized app");var e=document.getElementById("app");(0,r.App)().render(e);document.body.appendChild(e)})}),require.register("___globals___",function(e,t,n){})}(),require("___globals___");