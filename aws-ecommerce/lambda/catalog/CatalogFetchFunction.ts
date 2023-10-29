import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {CatalogRepository} from "/opt/nodejs/catalogLayer";
import {DynamoDB} from "aws-sdk";
import * as AWSXRay from "aws-xray-sdk"

AWSXRay.captureAWS(require("aws-sdk"))
const catalogDdb = process.env.CATALOG_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const catalogReporisory = new CatalogRepository(ddbClient, catalogDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    const method = event.httpMethod
    if(event.resource === "/catalog"){
        if(method === "GET"){
            console.log('GET')

            const catalogItems = await catalogReporisory.getAllCatalogItem()
            return {
                statusCode: 200,
                body: JSON.stringify(catalogItems)
            }
        }
    } else if (event.resource === "/catalog/{id}"){
        const catalogId = event.pathParameters!.id as string
        console.log(`GET /catalog/${catalogId}`)

        try{
            const catalogItem = await catalogReporisory.getCatalogItemById(catalogId)
            return {
                statusCode: 200,
                body: JSON.stringify(catalogItem)
            }
        } catch (error) {
            console.error((<Error>error).message)
            return {
                statusCode: 404,
                body: (<Error>error).message
            }
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "BAD REQUEST"
        })
    }
}