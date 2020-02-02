(window.webpackJsonp=window.webpackJsonp||[]).push([[7],{56:function(a,t,e){"use strict";e.r(t);var s=e(0),r=Object(s.a)({},(function(){var a=this,t=a.$createElement,e=a._self._c||t;return e("ContentSlotsDistributor",{attrs:{"slot-key":a.$parent.slotKey}},[e("h1",{attrs:{id:"adapter-api"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#adapter-api"}},[a._v("#")]),a._v(" Adapter API")]),a._v(" "),e("p",[a._v("Models are relying on "),e("em",[a._v("adapters")]),a._v(" to access data in a persistent data storage. This document is about those adapters, how to use them and how to create one yourself.")]),a._v(" "),e("h2",{attrs:{id:"available-adapters"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#available-adapters"}},[a._v("#")]),a._v(" Available Adapters")]),a._v(" "),e("p",[a._v("There are two adapters that ship with hitchy-plugin-odem:")]),a._v(" "),e("ul",[e("li",[a._v("MemoryAdapter")]),a._v(" "),e("li",[a._v("FileAdapter")])]),a._v(" "),e("p",[a._v("The first one is a useful adapter for developing applications for it doesn't actually save any data but manages records in volatile memory. The second one is meant to implement a very basic opportunity to persistently save records without relying on any additional software.")]),a._v(" "),e("p",[a._v("Either adapter is exposing an API which is very similar to the API of LevelDB. That's why it is possible to write your own adapter for saving records in a key-value-store like LevelDB.")]),a._v(" "),e("h2",{attrs:{id:"memoryadapter"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#memoryadapter"}},[a._v("#")]),a._v(" MemoryAdapter")]),a._v(" "),e("p",[a._v("If you intend to save records in volatile memory you might want to use an instance of MemoryAdapter. Simply create an instance of it. There are no options required to customize its behaviour.")]),a._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" adapter "),e("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("MemoryAdapter")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n")])])]),e("p",[a._v("This adapter may be provided on calling "),e("code",[a._v("Model.define()")]),a._v(" or on constructing an instance of your defined model afterwards.")]),a._v(" "),e("h2",{attrs:{id:"fileadapter"}},[e("a",{staticClass:"header-anchor",attrs:{href:"#fileadapter"}},[a._v("#")]),a._v(" FileAdapter")]),a._v(" "),e("p",[a._v("Using file adapter all records are saved in a folder of your local filesystem. That's why you should pass option on creating FileAdapter instance selecting that folder by its path name:")]),a._v(" "),e("div",{staticClass:"language-javascript extra-class"},[e("pre",{pre:!0,attrs:{class:"language-javascript"}},[e("code",[e("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("const")]),a._v(" adapter "),e("span",{pre:!0,attrs:{class:"token operator"}},[a._v("=")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token keyword"}},[a._v("new")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token class-name"}},[a._v("FileAdapter")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("(")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("{")]),a._v("\n   dataSource"),e("span",{pre:!0,attrs:{class:"token operator"}},[a._v(":")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token string"}},[a._v('"/path/name/of/a/folder"')]),a._v("\n"),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v("}")]),a._v(" "),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(")")]),e("span",{pre:!0,attrs:{class:"token punctuation"}},[a._v(";")]),a._v("\n")])])])])}),[],!1,null,null,null);t.default=r.exports}}]);