import { Callback, Context } from "aws-lambda";
import { DynamoDB } from "aws-sdk";
import { CatalogEvent } from "/opt/nodejs/catalogEventsLayer";
import * as AWSXRay from "aws-xray-sdk"

AWSXRay.captureAWS(require("aws-sdk"))

const eventsDdb = process.env.EVENTS_DDB!
const ddbClient = new DynamoDB.DocumentClient()

export async function handler(event: CatalogEvent,
                              context: Context, callback: Callback): Promise<void> {
    //TODO - to be removed
    console.log(event)

    console.log(`Lambda requestId: ${context.awsRequestId}`)

    await createEvent(event)

    callback(null, JSON.stringify({
        catalogEventCreated: true,
        message: "OK"
    }))
}

function createEvent(event: CatalogEvent) {
    const timestamp = Date.now()
    const ttl = ~~(timestamp / 1000 + 5 * 60) //5 minutos à frente

    return ddbClient.put({
        TableName: eventsDdb,
        Item: {
            pk: `#catalog_${event.productCode}`,
            sk: `${event.eventType}#${timestamp}`, //CATALOG_CREATED#123465
            email: event.email,
            createdAt: timestamp,
            requestId: event.requestId,
            eventType: event.eventType,
            info: {
                catalogId: event.productId,
                price: event.productPrice
            },
            ttl: ttl
        }
    }).promise()
}