import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    if (event.resource === "/catalog"){
        console.log("POST /catalog")
        return {
            statusCode: 201,
            body: "POST /catalog"
        }
    } else if (event.resource === "/catalog/{id}") {
        const catalogId = event.pathParameters!.id as string
        if (event.httpMethod === "PUT") {
            console.log(`PUT /catalog/${catalogId}`)
            return {
                statusCode: 200,
                body: `PUT /catalog/${catalogId}`
            }
        } else if (event.httpMethod === "/catalog/{id}") {
            console.log(`DELETE /catalog/${catalogId}`)
            return {
                statusCode: 200,
                body: `DELETE /catalog/${catalogId}`
            }
        }
    }

    return {
        statusCode: 400,
        body: "Bad Request"
    }
}