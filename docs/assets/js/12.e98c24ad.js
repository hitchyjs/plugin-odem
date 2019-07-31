(window.webpackJsonp=window.webpackJsonp||[]).push([[12],{44:function(t,s,e){"use strict";e.r(s);var n=e(0),a=Object(n.a)({},function(){var t=this,s=t.$createElement,e=t._self._c||s;return e("ContentSlotsDistributor",{attrs:{"slot-key":t.$parent.slotKey}},[e("h1",{attrs:{id:"using-models"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#using-models","aria-hidden":"true"}},[t._v("#")]),t._v(" Using Models")]),t._v(" "),e("h2",{attrs:{id:"server-side-code"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#server-side-code","aria-hidden":"true"}},[t._v("#")]),t._v(" Server-Side Code")]),t._v(" "),e("p",[t._v("When implementing code in your Hitchy-based project you might have defined models using "),e("code",[t._v("Model.define()")]),t._v(". Any model defined that way is returned from invoked "),e("code",[t._v("Model.define()")]),t._v(" and can be used right away. However, when defining models via filesystem by placing model definition files in folder "),e("strong",[t._v("api/model")]),t._v(" of your Hitchy-based project those models are exposed via Hitchy's runtime API. This API is available in context of dispatched requests and therefore can be used in policy and route handlers.")]),t._v(" "),e("p",[t._v("Let's pretend there is a file "),e("strong",[t._v("api/model/user.js")]),t._v(" like this one:")]),t._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[t._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("exports "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\tprops"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\tloginName"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\t\tpassword"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(":")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),e("p",[t._v("This would establish prerequisites for using a controller file "),e("strong",[t._v("api/controller/user.js")]),t._v(" like this one:")]),t._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[t._v("module"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("exports "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("getByLoginNameAction")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("req"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" res")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v("\n\t\t"),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("const")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("{")]),t._v(" User "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[t._v("this")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("api"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("runtime"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("models"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t\t\n\t\tUser"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("findByAttribute")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[t._v('"loginName"')]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v(" req"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("params"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("name "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),t._v("\n\t\t\t"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),e("span",{pre:!0,attrs:{class:"token function"}},[t._v("then")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("(")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token parameter"}},[t._v("matches")]),t._v(" "),e("span",{pre:!0,attrs:{class:"token operator"}},[t._v("=>")]),t._v(" res"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(".")]),t._v("json "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n\t"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(",")]),t._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v("}")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[t._v(";")]),t._v("\n")])])]),e("p",[t._v("The name of controller file doesn't matter here, though. The essential part is how the code is accessing the runtime API in context of a controller function. The same applies to policy handlers. Arrow functions don't work here due to using "),e("code",[t._v("this")]),t._v(" for accessing the model.")]),t._v(" "),e("p",[t._v("The "),e("router-link",{attrs:{to:"/api/model.html"}},[t._v("common API of models")]),t._v(" is providing additional information for use in server-side code.")],1),t._v(" "),e("h2",{attrs:{id:"client-side-code"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#client-side-code","aria-hidden":"true"}},[t._v("#")]),t._v(" Client-Side Code")]),t._v(" "),e("p",[t._v("Accessing models from client-side code is beyond the scope of this extension. Exposing models over the network is a job you need to implement yourself using server-side code.")]),t._v(" "),e("p",[t._v("As an option you might add an existing plugin that implements particular API for accessing models over the network. One of those plugins is "),e("a",{attrs:{href:"https://www.npmjs.com/package/hitchy-plugin-odem-rest",target:"_blank",rel:"noopener noreferrer"}},[t._v("hitch-plugin-odem-rest"),e("OutboundLink")],1),t._v(" and you should start with adding that one as a dependency right away for it will implicitly install this extension, too.")])])},[],!1,null,null,null);s.default=a.exports}}]);