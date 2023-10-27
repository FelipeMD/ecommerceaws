"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// asset-input/lambda/catalog/CatalogFetchFunction.ts
var CatalogFetchFunction_exports = {};
__export(CatalogFetchFunction_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(CatalogFetchFunction_exports);
async function handler(event, context) {
  const lambdaRequestId = context.awsRequestId;
  const apiRequestId = event.requestContext.requestId;
  console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`);
  const method = event.httpMethod;
  if (event.resource === "/catalog") {
    if (method === "GET") {
      console.log("GET");
      return {
        statusCode: 200,
        body: JSON.stringify({
          message: "GET Catalog - OK"
        })
      };
    }
  }
  return {
    statusCode: 400,
    body: JSON.stringify({
      message: "BAD REQUEST"
    })
  };
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
