"use strict";var r=Object.defineProperty;var n=Object.getOwnPropertyDescriptor;var d=Object.getOwnPropertyNames;var u=Object.prototype.hasOwnProperty;var y=(t,e)=>{for(var s in e)r(t,s,{get:e[s],enumerable:!0})},I=(t,e,s,a)=>{if(e&&typeof e=="object"||typeof e=="function")for(let o of d(e))!u.call(t,o)&&o!==s&&r(t,o,{get:()=>e[o],enumerable:!(a=n(e,o))||a.enumerable});return t};var i=t=>I(r({},"__esModule",{value:!0}),t);var P={};y(P,{handler:()=>l});module.exports=i(P);async function l(t,e){let s=e.awsRequestId,a=t.requestContext.requestId;console.log(`API Gateway RequestId: ${a} - Lambda RequestId: ${s}`);let o=t.httpMethod;return t.resource==="/catalog"&&o==="GET"?(console.log("GET"),{statusCode:200,body:JSON.stringify({message:"GET Catalog - OK"})}):{statusCode:400,body:JSON.stringify({message:"BAD REQUEST"})}}0&&(module.exports={handler});
