import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"
import {Catalog, CatalogRepository} from "/opt/nodejs/catalogLayer";
import {DynamoDB} from "aws-sdk";

const catalogDdb = process.env.CATALOG_DDB!
const ddbClient = new DynamoDB.DocumentClient()
const catalogReporisory = new CatalogRepository(ddbClient, catalogDdb)

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> {

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    if (event.resource === "/catalog") {
        console.log("POST /catalog")
        const catalog = JSON.parse(event.body!) as Catalog
        const catalogItemCreated = await catalogReporisory.create(catalog)
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