!function(t,e){"object"==typeof exports&&"object"==typeof module?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.notedSdk=e():t.notedSdk=e()}("undefined"!=typeof self?self:this,function(){return function(t){function e(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return t[n].call(o.exports,o,o.exports,e),o.l=!0,o.exports}var r={};return e.m=t,e.c=r,e.d=function(t,r,n){e.o(t,r)||Object.defineProperty(t,r,{configurable:!1,enumerable:!0,get:n})},e.n=function(t){var r=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(r,"a",r),r},e.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},e.p="",e(e.s=8)}([function(t,e,r){"use strict";function n(t){return"[object Array]"===f.call(t)}function o(t){return null!==t&&"object"==typeof t}function i(t){return"[object Function]"===f.call(t)}function a(t,e){if(null!==t&&void 0!==t)if("object"!=typeof t&&(t=[t]),n(t))for(var r=0,o=t.length;r<o;r++)e.call(null,t[r],r,t);else for(var i in t)Object.prototype.hasOwnProperty.call(t,i)&&e.call(null,t[i],i,t)}function u(){function t(t,r){"object"==typeof e[r]&&"object"==typeof t?e[r]=u(e[r],t):e[r]=t}for(var e={},r=0,n=arguments.length;r<n;r++)a(arguments[r],t);return e}var s=r(3),c=r(12),f=Object.prototype.toString;t.exports={isArray:n,isArrayBuffer:function(t){return"[object ArrayBuffer]"===f.call(t)},isBuffer:c,isFormData:function(t){return"undefined"!=typeof FormData&&t instanceof FormData},isArrayBufferView:function(t){return"undefined"!=typeof ArrayBuffer&&ArrayBuffer.isView?ArrayBuffer.isView(t):t&&t.buffer&&t.buffer instanceof ArrayBuffer},isString:function(t){return"string"==typeof t},isNumber:function(t){return"number"==typeof t},isObject:o,isUndefined:function(t){return void 0===t},isDate:function(t){return"[object Date]"===f.call(t)},isFile:function(t){return"[object File]"===f.call(t)},isBlob:function(t){return"[object Blob]"===f.call(t)},isFunction:i,isStream:function(t){return o(t)&&i(t.pipe)},isURLSearchParams:function(t){return"undefined"!=typeof URLSearchParams&&t instanceof URLSearchParams},isStandardBrowserEnv:function(){return("undefined"==typeof navigator||"ReactNative"!==navigator.product)&&"undefined"!=typeof window&&"undefined"!=typeof document},forEach:a,merge:u,extend:function(t,e,r){return a(e,function(e,n){t[n]=r&&"function"==typeof e?s(e,r):e}),t},trim:function(t){return t.replace(/^\s*/,"").replace(/\s*$/,"")}}},function(t,e){function r(){throw new Error("setTimeout has not been defined")}function n(){throw new Error("clearTimeout has not been defined")}function o(t){if(c===setTimeout)return setTimeout(t,0);if((c===r||!c)&&setTimeout)return c=setTimeout,setTimeout(t,0);try{return c(t,0)}catch(e){try{return c.call(null,t,0)}catch(e){return c.call(this,t,0)}}}function i(){d&&p&&(d=!1,p.length?h=p.concat(h):m=-1,h.length&&a())}function a(){if(!d){var t=o(i);d=!0;for(var e=h.length;e;){for(p=h,h=[];++m<e;)p&&p[m].run();m=-1,e=h.length}p=null,d=!1,function(t){if(f===clearTimeout)return clearTimeout(t);if((f===n||!f)&&clearTimeout)return f=clearTimeout,clearTimeout(t);try{f(t)}catch(e){try{return f.call(null,t)}catch(e){return f.call(this,t)}}}(t)}}function u(t,e){this.fun=t,this.array=e}function s(){}var c,f,l=t.exports={};!function(){try{c="function"==typeof setTimeout?setTimeout:r}catch(t){c=r}try{f="function"==typeof clearTimeout?clearTimeout:n}catch(t){f=n}}();var p,h=[],d=!1,m=-1;l.nextTick=function(t){var e=new Array(arguments.length-1);if(arguments.length>1)for(var r=1;r<arguments.length;r++)e[r-1]=arguments[r];h.push(new u(t,e)),1!==h.length||d||o(a)},u.prototype.run=function(){this.fun.apply(null,this.array)},l.title="browser",l.browser=!0,l.env={},l.argv=[],l.version="",l.versions={},l.on=s,l.addListener=s,l.once=s,l.off=s,l.removeListener=s,l.removeAllListeners=s,l.emit=s,l.prependListener=s,l.prependOnceListener=s,l.listeners=function(t){return[]},l.binding=function(t){throw new Error("process.binding is not supported")},l.cwd=function(){return"/"},l.chdir=function(t){throw new Error("process.chdir is not supported")},l.umask=function(){return 0}},function(t,e,r){"use strict";(function(e){function n(t,e){!o.isUndefined(t)&&o.isUndefined(t["Content-Type"])&&(t["Content-Type"]=e)}var o=r(0),i=r(14),a={"Content-Type":"application/x-www-form-urlencoded"},u={adapter:function(){var t;return"undefined"!=typeof XMLHttpRequest?t=r(4):void 0!==e&&(t=r(4)),t}(),transformRequest:[function(t,e){return i(e,"Content-Type"),o.isFormData(t)||o.isArrayBuffer(t)||o.isBuffer(t)||o.isStream(t)||o.isFile(t)||o.isBlob(t)?t:o.isArrayBufferView(t)?t.buffer:o.isURLSearchParams(t)?(n(e,"application/x-www-form-urlencoded;charset=utf-8"),t.toString()):o.isObject(t)?(n(e,"application/json;charset=utf-8"),JSON.stringify(t)):t}],transformResponse:[function(t){if("string"==typeof t)try{t=JSON.parse(t)}catch(t){}return t}],timeout:0,xsrfCookieName:"XSRF-TOKEN",xsrfHeaderName:"X-XSRF-TOKEN",maxContentLength:-1,validateStatus:function(t){return t>=200&&t<300}};u.headers={common:{Accept:"application/json, text/plain, */*"}},o.forEach(["delete","get","head"],function(t){u.headers[t]={}}),o.forEach(["post","put","patch"],function(t){u.headers[t]=o.merge(a)}),t.exports=u}).call(e,r(1))},function(t,e,r){"use strict";t.exports=function(t,e){return function(){for(var r=new Array(arguments.length),n=0;n<r.length;n++)r[n]=arguments[n];return t.apply(e,r)}}},function(t,e,r){"use strict";(function(e){var n=r(0),o=r(15),i=r(17),a=r(18),u=r(19),s=r(5),c="undefined"!=typeof window&&window.btoa&&window.btoa.bind(window)||r(20);t.exports=function(t){return new Promise(function(f,l){var p=t.data,h=t.headers;n.isFormData(p)&&delete h["Content-Type"];var d=new XMLHttpRequest,m="onreadystatechange",v=!1;if("test"===e.env.NODE_ENV||"undefined"==typeof window||!window.XDomainRequest||"withCredentials"in d||u(t.url)||(d=new window.XDomainRequest,m="onload",v=!0,d.onprogress=function(){},d.ontimeout=function(){}),t.auth){var y=t.auth.username||"",g=t.auth.password||"";h.Authorization="Basic "+c(y+":"+g)}if(d.open(t.method.toUpperCase(),i(t.url,t.params,t.paramsSerializer),!0),d.timeout=t.timeout,d[m]=function(){if(d&&(4===d.readyState||v)&&(0!==d.status||d.responseURL&&0===d.responseURL.indexOf("file:"))){var e="getAllResponseHeaders"in d?a(d.getAllResponseHeaders()):null,r={data:t.responseType&&"text"!==t.responseType?d.response:d.responseText,status:1223===d.status?204:d.status,statusText:1223===d.status?"No Content":d.statusText,headers:e,config:t,request:d};o(f,l,r),d=null}},d.onerror=function(){l(s("Network Error",t,null,d)),d=null},d.ontimeout=function(){l(s("timeout of "+t.timeout+"ms exceeded",t,"ECONNABORTED",d)),d=null},n.isStandardBrowserEnv()){var w=r(21),x=(t.withCredentials||u(t.url))&&t.xsrfCookieName?w.read(t.xsrfCookieName):void 0;x&&(h[t.xsrfHeaderName]=x)}if("setRequestHeader"in d&&n.forEach(h,function(t,e){void 0===p&&"content-type"===e.toLowerCase()?delete h[e]:d.setRequestHeader(e,t)}),t.withCredentials&&(d.withCredentials=!0),t.responseType)try{d.responseType=t.responseType}catch(e){if("json"!==t.responseType)throw e}"function"==typeof t.onDownloadProgress&&d.addEventListener("progress",t.onDownloadProgress),"function"==typeof t.onUploadProgress&&d.upload&&d.upload.addEventListener("progress",t.onUploadProgress),t.cancelToken&&t.cancelToken.promise.then(function(t){d&&(d.abort(),l(t),d=null)}),void 0===p&&(p=null),d.send(p)})}}).call(e,r(1))},function(t,e,r){"use strict";var n=r(16);t.exports=function(t,e,r,o,i){var a=new Error(t);return n(a,e,r,o,i)}},function(t,e,r){"use strict";t.exports=function(t){return!(!t||!t.__CANCEL__)}},function(t,e,r){"use strict";function n(t){this.message=t}n.prototype.toString=function(){return"Cancel"+(this.message?": "+this.message:"")},n.prototype.__CANCEL__=!0,t.exports=n},function(t,e,r){"use strict";(function(t){function n(t){return function(){var e=t.apply(this,arguments);return new Promise(function(t,r){function n(o,i){try{var a=e[o](i),u=a.value}catch(t){return void r(t)}if(!a.done)return Promise.resolve(u).then(function(t){n("next",t)},function(t){n("throw",t)});t(u)}return n("next")})}}function o(t){var e=this,r=arguments.length>1&&void 0!==arguments[1]?arguments[1]:function(){};return function(t,n){if(e.isAuthenticated())return e.scheduleRenewal(),r();n&&n.accessToken&&n.idToken?(e.setSession(n),r()):t?(console.log(t),location.assign("/")):r()}}Object.defineProperty(e,"__esModule",{value:!0});var i=Object.assign||function(t){for(var e=1;e<arguments.length;e++){var r=arguments[e];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(t[n]=r[n])}return t},a=function(){function t(t,e){for(var r=0;r<e.length;r++){var n=e[r];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}return function(e,r,n){return r&&t(e.prototype,r),n&&t(e,n),e}}();e.default=function(e){var o=this,i=e.audience,a=e.domain,c=e.clientID,v=e.redirectUri,y=e.projectID;if(!t.browser)return{};var g=r(10),w=function(){var t=n(regeneratorRuntime.mark(function t(){var e,r,n,i,a;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,s;case 2:return t.next=4,g.get(f+"/api/project-config/"+y).catch(function(t){console.log({err:t})});case 4:return e=t.sent,r=e.data,n=r.clientId,i=r.redirectUri,a={clientID:n,defaultRedirectUri:i},t.abrupt("return",a);case 8:case"end":return t.stop()}},t,o)}));return function(){return t.apply(this,arguments)}}(),x=new p({audience:i||u.audience,domain:a||u.domain,clientID:c,redirectUri:v},w),b=function(){var t=n(regeneratorRuntime.mark(function t(){var e,r;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,s;case 2:return t.next=4,x.handleAuthentication();case 4:return e=x.getSession().accessToken,r={"Content-Type":"application/json"},x.isAuthenticated()&&(r.Authorization="Bearer "+e),t.abrupt("return",r);case 8:case"end":return t.stop()}},t,o)}));return function(){return t.apply(this,arguments)}}(),E=function(t){return t||l+"/"+y},S=function(){var t=n(regeneratorRuntime.mark(function t(e,r,n){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.t0=g,t.t1=E(n),t.next=4,b();case 4:return t.t2=t.sent,t.t3={query:e,variables:r},t.t4={url:t.t1,method:"POST",headers:t.t2,data:t.t3},t.t5=h,t.t6=d,t.abrupt("return",(0,t.t0)(t.t4).then(t.t5).then(t.t6));case 10:case"end":return t.stop()}},t,o)}));return function(e,r,n){return t.apply(this,arguments)}}();return S.batch=function(){var t=n(regeneratorRuntime.mark(function t(){var e=arguments.length>0&&void 0!==arguments[0]?arguments[0]:[],r=arguments[1];return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.t0=g,t.t1=E(r),t.next=4,b();case 4:return t.t2=t.sent,t.t3=JSON.stringify({queries:e,batch:!0}),t.t4={url:t.t1,method:"POST",headers:t.t2,data:t.t3},t.t5=h,t.t6=m,t.abrupt("return",(0,t.t0)(t.t4).then(t.t5).then(t.t6));case 10:case"end":return t.stop()}},t,o)}));return function(){return t.apply(this,arguments)}}(),{auth:x,gqlRequest:S}},r(9);var u={domain:"synergy-apps.auth0.com",audience:"http://localhost:3001/graphql"},s=void 0;if(document){var c=document.createElement("script");c.src="http://cdn.auth0.com/js/auth0/8.12.1/auth0.min.js",(s=new Promise(function(t,e){c.onload=t,c.onerror=e})).catch(function(t){return console.error(t)}),document.body.appendChild(c)}var f="http://127.0.0.1:3001",l=f+"/graphql",p=function(){function t(e,r){var o=this,a=e.clientID,u=e.audience,s=e.domain,c=e.redirectUri;!function(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}(this,t),this.login=n(regeneratorRuntime.mark(function t(){return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:return t.next=2,o.auth0;case 2:t.sent.authorize();case 3:case"end":return t.stop()}},t,o)})),this.onAuthenticated=function(){return o.handleAuthentication().then(function(){return o.isAuthenticated()})},this.setSession=function(t){var e=JSON.stringify(1e3*t.expiresIn+(new Date).getTime());localStorage.setItem("access_token",t.accessToken),localStorage.setItem("id_token",t.idToken),localStorage.setItem("expires_at",e),o.scheduleRenewal()},this.auth0=new Promise(function(){var t=n(regeneratorRuntime.mark(function t(e,n){var f,l,p,h,d;return regeneratorRuntime.wrap(function(t){for(;;)switch(t.prev=t.next){case 0:if(f=a,l=c,t.prev=2,a&&c){t.next=11;break}return t.next=6,r();case 6:p=t.sent,h=p.clientID,d=p.defaultRedirectUri,f=a||h,l=c||d;case 11:t.next=16;break;case 13:t.prev=13,t.t0=t.catch(2),n({fetchErr:t.t0});case 16:o.authParams={clientID:f,audience:u,scope:"openid profile email update:note",redirectUri:l},e(new auth0.WebAuth(i({domain:s,responseType:"token id_token"},o.authParams)));case 18:case"end":return t.stop()}},t,o,[[2,13]])}));return function(e,r){return t.apply(this,arguments)}}())}return a(t,[{key:"handleAuthentication",value:function(){var t=this;return this.parseHash?this.parseHash:(this.parseHash=new Promise(function(){var e=n(regeneratorRuntime.mark(function e(r){var n;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.auth0;case 2:(n=e.sent).parseHash(o.call(t,n,function(){r()}));case 4:case"end":return e.stop()}},e,t)}));return function(t){return e.apply(this,arguments)}}()),this.parseHash)}},{key:"getSession",value:function(){return{expiresAt:localStorage.getItem("expires_at"),accessToken:localStorage.getItem("access_token"),idToken:localStorage.getItem("id_token")}}},{key:"logout",value:function(){localStorage.removeItem("access_token"),localStorage.removeItem("id_token"),localStorage.removeItem("expires_at");location.assign("/")}},{key:"isAuthenticated",value:function(){var t=JSON.parse(localStorage.getItem("expires_at"));return(new Date).getTime()<t}},{key:"scheduleRenewal",value:function(){var t=this,e=(arguments.length>0&&void 0!==arguments[0]?arguments[0]:{}).forceRenew,r=JSON.parse(localStorage.getItem("expires_at"))-Date.now();if(r>0){var o=e?2e3:r-5e3;this.tokenRenewalTimeout=setTimeout(n(regeneratorRuntime.mark(function e(){return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,t.auth0;case 2:e.t0=t.authParams,e.t1=function(e,r){r?t.setSession(r):(console.log(e),alert(e))},e.sent.checkSession(e.t0,e.t1);case 5:case"end":return e.stop()}},e,t)})),o)}}}]),t}(),h=function(t){return t.data},d=function(t){return t.errors&&console.error("graphqlError: \n"+JSON.stringify(t.errors,null,2)),t.data},m=function(t){return t.map(d)}}).call(e,r(1))},function(t,e){!function(e){"use strict";function r(t,e,r,i){var a=e&&e.prototype instanceof o?e:o,u=Object.create(a.prototype),s=new p(i||[]);return u._invoke=function(t,e,r){var o=T;return function(i,a){if(o===k)throw new Error("Generator is already running");if(o===L){if("throw"===i)throw a;return d()}for(r.method=i,r.arg=a;;){var u=r.delegate;if(u){var s=c(u,r);if(s){if(s===j)continue;return s}}if("next"===r.method)r.sent=r._sent=r.arg;else if("throw"===r.method){if(o===T)throw o=L,r.arg;r.dispatchException(r.arg)}else"return"===r.method&&r.abrupt("return",r.arg);o=k;var f=n(t,e,r);if("normal"===f.type){if(o=r.done?L:R,f.arg===j)continue;return{value:f.arg,done:r.done}}"throw"===f.type&&(o=L,r.method="throw",r.arg=f.arg)}}}(t,r,s),u}function n(t,e,r){try{return{type:"normal",arg:t.call(e,r)}}catch(t){return{type:"throw",arg:t}}}function o(){}function i(){}function a(){}function u(t){["next","throw","return"].forEach(function(e){t[e]=function(t){return this._invoke(e,t)}})}function s(t){function e(r,o,i,a){var u=n(t[r],t,o);if("throw"!==u.type){var s=u.arg,c=s.value;return c&&"object"==typeof c&&y.call(c,"__await")?Promise.resolve(c.__await).then(function(t){e("next",t,i,a)},function(t){e("throw",t,i,a)}):Promise.resolve(c).then(function(t){s.value=t,i(s)},a)}a(u.arg)}var r;this._invoke=function(t,n){function o(){return new Promise(function(r,o){e(t,n,r,o)})}return r=r?r.then(o,o):o()}}function c(t,e){var r=t.iterator[e.method];if(r===m){if(e.delegate=null,"throw"===e.method){if(t.iterator.return&&(e.method="return",e.arg=m,c(t,e),"throw"===e.method))return j;e.method="throw",e.arg=new TypeError("The iterator does not provide a 'throw' method")}return j}var o=n(r,t.iterator,e.arg);if("throw"===o.type)return e.method="throw",e.arg=o.arg,e.delegate=null,j;var i=o.arg;return i?i.done?(e[t.resultName]=i.value,e.next=t.nextLoc,"return"!==e.method&&(e.method="next",e.arg=m),e.delegate=null,j):i:(e.method="throw",e.arg=new TypeError("iterator result is not an object"),e.delegate=null,j)}function f(t){var e={tryLoc:t[0]};1 in t&&(e.catchLoc=t[1]),2 in t&&(e.finallyLoc=t[2],e.afterLoc=t[3]),this.tryEntries.push(e)}function l(t){var e=t.completion||{};e.type="normal",delete e.arg,t.completion=e}function p(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(f,this),this.reset(!0)}function h(t){if(t){var e=t[w];if(e)return e.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,n=function e(){for(;++r<t.length;)if(y.call(t,r))return e.value=t[r],e.done=!1,e;return e.value=m,e.done=!0,e};return n.next=n}}return{next:d}}function d(){return{value:m,done:!0}}var m,v=Object.prototype,y=v.hasOwnProperty,g="function"==typeof Symbol?Symbol:{},w=g.iterator||"@@iterator",x=g.asyncIterator||"@@asyncIterator",b=g.toStringTag||"@@toStringTag",E="object"==typeof t,S=e.regeneratorRuntime;if(S)E&&(t.exports=S);else{(S=e.regeneratorRuntime=E?t.exports:{}).wrap=r;var T="suspendedStart",R="suspendedYield",k="executing",L="completed",j={},O={};O[w]=function(){return this};var A=Object.getPrototypeOf,_=A&&A(A(h([])));_&&_!==v&&y.call(_,w)&&(O=_);var C=a.prototype=o.prototype=Object.create(O);i.prototype=C.constructor=a,a.constructor=i,a[b]=i.displayName="GeneratorFunction",S.isGeneratorFunction=function(t){var e="function"==typeof t&&t.constructor;return!!e&&(e===i||"GeneratorFunction"===(e.displayName||e.name))},S.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,a):(t.__proto__=a,b in t||(t[b]="GeneratorFunction")),t.prototype=Object.create(C),t},S.awrap=function(t){return{__await:t}},u(s.prototype),s.prototype[x]=function(){return this},S.AsyncIterator=s,S.async=function(t,e,n,o){var i=new s(r(t,e,n,o));return S.isGeneratorFunction(e)?i:i.next().then(function(t){return t.done?t.value:i.next()})},u(C),C[b]="Generator",C[w]=function(){return this},C.toString=function(){return"[object Generator]"},S.keys=function(t){var e=[];for(var r in t)e.push(r);return e.reverse(),function r(){for(;e.length;){var n=e.pop();if(n in t)return r.value=n,r.done=!1,r}return r.done=!0,r}},S.values=h,p.prototype={constructor:p,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=m,this.done=!1,this.delegate=null,this.method="next",this.arg=m,this.tryEntries.forEach(l),!t)for(var e in this)"t"===e.charAt(0)&&y.call(this,e)&&!isNaN(+e.slice(1))&&(this[e]=m)},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){function e(e,n){return i.type="throw",i.arg=t,r.next=e,n&&(r.method="next",r.arg=m),!!n}if(this.done)throw t;for(var r=this,n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],i=o.completion;if("root"===o.tryLoc)return e("end");if(o.tryLoc<=this.prev){var a=y.call(o,"catchLoc"),u=y.call(o,"finallyLoc");if(a&&u){if(this.prev<o.catchLoc)return e(o.catchLoc,!0);if(this.prev<o.finallyLoc)return e(o.finallyLoc)}else if(a){if(this.prev<o.catchLoc)return e(o.catchLoc,!0)}else{if(!u)throw new Error("try statement without catch or finally");if(this.prev<o.finallyLoc)return e(o.finallyLoc)}}}},abrupt:function(t,e){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&y.call(n,"finallyLoc")&&this.prev<n.finallyLoc){var o=n;break}}o&&("break"===t||"continue"===t)&&o.tryLoc<=e&&e<=o.finallyLoc&&(o=null);var i=o?o.completion:{};return i.type=t,i.arg=e,o?(this.method="next",this.next=o.finallyLoc,j):this.complete(i)},complete:function(t,e){if("throw"===t.type)throw t.arg;return"break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&e&&(this.next=e),j},finish:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.finallyLoc===t)return this.complete(r.completion,r.afterLoc),l(r),j}},catch:function(t){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc===t){var n=r.completion;if("throw"===n.type){var o=n.arg;l(r)}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,e,r){return this.delegate={iterator:h(t),resultName:e,nextLoc:r},"next"===this.method&&(this.arg=m),j}}}}(function(){return this}()||Function("return this")())},function(t,e,r){t.exports=r(11)},function(t,e,r){"use strict";function n(t){var e=new a(t),r=i(a.prototype.request,e);return o.extend(r,a.prototype,e),o.extend(r,e),r}var o=r(0),i=r(3),a=r(13),u=r(2),s=n(u);s.Axios=a,s.create=function(t){return n(o.merge(u,t))},s.Cancel=r(7),s.CancelToken=r(27),s.isCancel=r(6),s.all=function(t){return Promise.all(t)},s.spread=r(28),t.exports=s,t.exports.default=s},function(t,e){function r(t){return!!t.constructor&&"function"==typeof t.constructor.isBuffer&&t.constructor.isBuffer(t)}t.exports=function(t){return null!=t&&(r(t)||function(t){return"function"==typeof t.readFloatLE&&"function"==typeof t.slice&&r(t.slice(0,0))}(t)||!!t._isBuffer)}},function(t,e,r){"use strict";function n(t){this.defaults=t,this.interceptors={request:new a,response:new a}}var o=r(2),i=r(0),a=r(22),u=r(23);n.prototype.request=function(t){"string"==typeof t&&(t=i.merge({url:arguments[0]},arguments[1])),(t=i.merge(o,this.defaults,{method:"get"},t)).method=t.method.toLowerCase();var e=[u,void 0],r=Promise.resolve(t);for(this.interceptors.request.forEach(function(t){e.unshift(t.fulfilled,t.rejected)}),this.interceptors.response.forEach(function(t){e.push(t.fulfilled,t.rejected)});e.length;)r=r.then(e.shift(),e.shift());return r},i.forEach(["delete","get","head","options"],function(t){n.prototype[t]=function(e,r){return this.request(i.merge(r||{},{method:t,url:e}))}}),i.forEach(["post","put","patch"],function(t){n.prototype[t]=function(e,r,n){return this.request(i.merge(n||{},{method:t,url:e,data:r}))}}),t.exports=n},function(t,e,r){"use strict";var n=r(0);t.exports=function(t,e){n.forEach(t,function(r,n){n!==e&&n.toUpperCase()===e.toUpperCase()&&(t[e]=r,delete t[n])})}},function(t,e,r){"use strict";var n=r(5);t.exports=function(t,e,r){var o=r.config.validateStatus;r.status&&o&&!o(r.status)?e(n("Request failed with status code "+r.status,r.config,null,r.request,r)):t(r)}},function(t,e,r){"use strict";t.exports=function(t,e,r,n,o){return t.config=e,r&&(t.code=r),t.request=n,t.response=o,t}},function(t,e,r){"use strict";function n(t){return encodeURIComponent(t).replace(/%40/gi,"@").replace(/%3A/gi,":").replace(/%24/g,"$").replace(/%2C/gi,",").replace(/%20/g,"+").replace(/%5B/gi,"[").replace(/%5D/gi,"]")}var o=r(0);t.exports=function(t,e,r){if(!e)return t;var i;if(r)i=r(e);else if(o.isURLSearchParams(e))i=e.toString();else{var a=[];o.forEach(e,function(t,e){null!==t&&void 0!==t&&(o.isArray(t)&&(e+="[]"),o.isArray(t)||(t=[t]),o.forEach(t,function(t){o.isDate(t)?t=t.toISOString():o.isObject(t)&&(t=JSON.stringify(t)),a.push(n(e)+"="+n(t))}))}),i=a.join("&")}return i&&(t+=(-1===t.indexOf("?")?"?":"&")+i),t}},function(t,e,r){"use strict";var n=r(0),o=["age","authorization","content-length","content-type","etag","expires","from","host","if-modified-since","if-unmodified-since","last-modified","location","max-forwards","proxy-authorization","referer","retry-after","user-agent"];t.exports=function(t){var e,r,i,a={};return t?(n.forEach(t.split("\n"),function(t){if(i=t.indexOf(":"),e=n.trim(t.substr(0,i)).toLowerCase(),r=n.trim(t.substr(i+1)),e){if(a[e]&&o.indexOf(e)>=0)return;a[e]="set-cookie"===e?(a[e]?a[e]:[]).concat([r]):a[e]?a[e]+", "+r:r}}),a):a}},function(t,e,r){"use strict";var n=r(0);t.exports=n.isStandardBrowserEnv()?function(){function t(t){var e=t;return r&&(o.setAttribute("href",e),e=o.href),o.setAttribute("href",e),{href:o.href,protocol:o.protocol?o.protocol.replace(/:$/,""):"",host:o.host,search:o.search?o.search.replace(/^\?/,""):"",hash:o.hash?o.hash.replace(/^#/,""):"",hostname:o.hostname,port:o.port,pathname:"/"===o.pathname.charAt(0)?o.pathname:"/"+o.pathname}}var e,r=/(msie|trident)/i.test(navigator.userAgent),o=document.createElement("a");return e=t(window.location.href),function(r){var o=n.isString(r)?t(r):r;return o.protocol===e.protocol&&o.host===e.host}}():function(){return!0}},function(t,e,r){"use strict";function n(){this.message="String contains an invalid character"}var o="ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";(n.prototype=new Error).code=5,n.prototype.name="InvalidCharacterError",t.exports=function(t){for(var e,r,i=String(t),a="",u=0,s=o;i.charAt(0|u)||(s="=",u%1);a+=s.charAt(63&e>>8-u%1*8)){if((r=i.charCodeAt(u+=.75))>255)throw new n;e=e<<8|r}return a}},function(t,e,r){"use strict";var n=r(0);t.exports=n.isStandardBrowserEnv()?{write:function(t,e,r,o,i,a){var u=[];u.push(t+"="+encodeURIComponent(e)),n.isNumber(r)&&u.push("expires="+new Date(r).toGMTString()),n.isString(o)&&u.push("path="+o),n.isString(i)&&u.push("domain="+i),!0===a&&u.push("secure"),document.cookie=u.join("; ")},read:function(t){var e=document.cookie.match(new RegExp("(^|;\\s*)("+t+")=([^;]*)"));return e?decodeURIComponent(e[3]):null},remove:function(t){this.write(t,"",Date.now()-864e5)}}:{write:function(){},read:function(){return null},remove:function(){}}},function(t,e,r){"use strict";function n(){this.handlers=[]}var o=r(0);n.prototype.use=function(t,e){return this.handlers.push({fulfilled:t,rejected:e}),this.handlers.length-1},n.prototype.eject=function(t){this.handlers[t]&&(this.handlers[t]=null)},n.prototype.forEach=function(t){o.forEach(this.handlers,function(e){null!==e&&t(e)})},t.exports=n},function(t,e,r){"use strict";function n(t){t.cancelToken&&t.cancelToken.throwIfRequested()}var o=r(0),i=r(24),a=r(6),u=r(2),s=r(25),c=r(26);t.exports=function(t){n(t),t.baseURL&&!s(t.url)&&(t.url=c(t.baseURL,t.url)),t.headers=t.headers||{},t.data=i(t.data,t.headers,t.transformRequest),t.headers=o.merge(t.headers.common||{},t.headers[t.method]||{},t.headers||{}),o.forEach(["delete","get","head","post","put","patch","common"],function(e){delete t.headers[e]});return(t.adapter||u.adapter)(t).then(function(e){return n(t),e.data=i(e.data,e.headers,t.transformResponse),e},function(e){return a(e)||(n(t),e&&e.response&&(e.response.data=i(e.response.data,e.response.headers,t.transformResponse))),Promise.reject(e)})}},function(t,e,r){"use strict";var n=r(0);t.exports=function(t,e,r){return n.forEach(r,function(r){t=r(t,e)}),t}},function(t,e,r){"use strict";t.exports=function(t){return/^([a-z][a-z\d\+\-\.]*:)?\/\//i.test(t)}},function(t,e,r){"use strict";t.exports=function(t,e){return e?t.replace(/\/+$/,"")+"/"+e.replace(/^\/+/,""):t}},function(t,e,r){"use strict";function n(t){if("function"!=typeof t)throw new TypeError("executor must be a function.");var e;this.promise=new Promise(function(t){e=t});var r=this;t(function(t){r.reason||(r.reason=new o(t),e(r.reason))})}var o=r(7);n.prototype.throwIfRequested=function(){if(this.reason)throw this.reason},n.source=function(){var t;return{token:new n(function(e){t=e}),cancel:t}},t.exports=n},function(t,e,r){"use strict";t.exports=function(t){return function(e){return t.apply(null,e)}}}]).default});