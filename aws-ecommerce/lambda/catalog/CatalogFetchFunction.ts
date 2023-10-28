import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda"

export async function handler(event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult>{

    const lambdaRequestId = context.awsRequestId
    const apiRequestId = event.requestContext.requestId

    console.log(`API Gateway RequestId: ${apiRequestId} - Lambda RequestId: ${lambdaRequestId}`)

    const method = event.httpMethod
    if(event.resource === "/catalog"){
        if(method === "GET"){
            console.log('GET')

            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: "GET Catalog - OK"
                })
            }
        }
    } else if (event.resource === "/catalog/{id}"){
        const catalogId = event.pathParameters!.id as string
        console.log(`GET /catalog/${catalogId}`)
        return {
            statusCode: 200,
            body: `GET /catalog/${catalogId}`
        }
    }

    return {
        statusCode: 400,
        body: JSON.stringify({
            message: "BAD REQUEST"
        })
    }
}