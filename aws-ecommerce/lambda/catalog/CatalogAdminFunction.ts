import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {Catalog, CatalogRepository} from "/opt/nodejs/catalogLayer";
import {DynamoDB, Lambda} from "aws-sdk";
import {CatalogEvent, CatalogEventType} from "/opt/nodejs/catalogEventsLayer";
import * as AWSXRay from "aws-xray-sdk"

AWSXRay.captureAWS(require("aws-sdk"))
const catalogDdb = process.env.CATALOG_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const catalogReporisory = new CatalogRepository(ddbClient, catalogDdb)
const lambdaClient = new Lambda()
const catalogEventsFunctionName = process.env.CATALOG_EVENTS_FUNCTION_NAME!

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    if (event.resource === "/catalog") {
        console.log("POST /catalog")
        const catalog = JSON.parse(event.body!) as Catalog
        const catalogItemCreated = await catalogReporisory.create(catalog)

        const response = await sendProductEvent(catalogItemCreated,
            CatalogEventType.CREATED, "teste@teste.com", lambdaRequestId)
        console.log(response)

        return {
            statusCode: 201,
            body: JSON.stringify(catalogItemCreated)
        }
    } else if (event.resource === "/catalog/{id}") {
        const catalogId = event.pathParameters!.id as string
        if (event.httpMethod === "PUT") {
            console.log(`PUT /catalog/${catalogId}`)
            const catalogItem = JSON.parse(event.body!) as Catalog

            try {
                const catalogItemUpdated = await catalogReporisory.updateCatalogItem(catalogId, catalogItem)

                const response = await sendProductEvent(catalogItemUpdated,
                    CatalogEventType.UPDATED, "testwewee@teste.com", lambdaRequestId)
                console.log(response)

                return {
                    statusCode: 200,
                    body: JSON.stringify(catalogItemUpdated)
                }
            } catch (ConditionalCheckFailedException) {
                return {
                    statusCode: 404,
                    body: 'Catalog Item not found'
                }
            }

        } else if (event.httpMethod === "DELETE") {
            console.log(`DELETE /catalog/${catalogId}`)
            try {
                const catalogItem = await catalogReporisory.deleteCatalogItem(catalogId)

                const response = await sendProductEvent(catalogItem,
                    CatalogEventType.DELETED, "aaaatestwewee@teste.com", lambdaRequestId)
                console.log(response)

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
    }

    return {
        statusCode: 400,
        body: "Bad Request"
    }
}

function sendProductEvent(product: Catalog,
                          eventType: CatalogEventType, email: string,
                          lambdaRequestId: string) {

    const event: CatalogEvent = {
        email: email,
        eventType: eventType,
        productCode: product.code,
        productId: product.id,
        productPrice: product.price,
        requestId: lambdaRequestId
    }

    return lambdaClient.invoke({
        FunctionName: catalogEventsFunctionName,
        Payload: JSON.stringify(event),
        InvocationType: "RequestResponse"
    }).promise()
}