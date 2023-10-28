import {DocumentClient} from "aws-sdk/clients/dynamodb";
import {v4 as uuid} from "uuid"

export interface Catalog {
    id: string;
    productName: string;
    code: string;
    price: number;
    model: string;
}

export class CatalogRepository {
    private ddbClient: DocumentClient
    private catalogDdb: string

    constructor(ddbClient: DocumentClient, catalogDdb: string) {
        this.ddbClient = ddbClient
        this.catalogDdb = catalogDdb
    }

    async getAllCatalogItem(): Promise<Catalog[]> {
        const data = await this.ddbClient.scan({
            TableName: this.catalogDdb
        }).promise()
        return data.Items as Catalog[]
    }

    async getCatalogItemById(catalogItemId: string): Promise<Catalog> {
        const data = await this.ddbClient.get({
            TableName: this.catalogDdb,
            Key: {
                id: catalogItemId
            }
        }).promise()
        if (data.Item) {
            return data.Item as Catalog
        } else {
            throw new Error('Catalog item not found')
        }
    }

    async create(catalogItem: Catalog): Promise<Catalog> {
        catalogItem.id = uuid()
        await this.ddbClient.put({
            TableName: this.catalogDdb,
            Item: catalogItem
        }).promise()
        return catalogItem
    }

    async deleteCatalogItem(catalogItemId: string): Promise<Catalog> {
        const data = await this.ddbClient.delete({
            TableName: this.catalogDdb,
            Key: {
                id: catalogItemId
            },
            ReturnValues: "ALL_OLD"
        }).promise()
        if (data.Attributes) {
            return data.Attributes as Catalog
        } else {
            throw new Error('Catalog Item not fount')
        }
    }

    async updateCatalogItem(catalogItemId: string, catalog: Catalog): Promise<Catalog> {
        const data = await this.ddbClient.update({
            TableName: this.catalogDdb,
            Key: {
                id: catalogItemId
            },
            ConditionExpression: 'attribute_exists(id)',
            ReturnValues: "UPDATED_NEW",
            UpdateExpression: "set productName = :n, code = :c, price = :p, model = :m",
            ExpressionAttributeValues: {
                ":n": catalog.productName,
                ":c": catalog.code,
                ":p": catalog.price,
                ":m": catalog.model
            }
        }).promise()
        data.Attributes!.id = catalogItemId
        return  data.Attributes as Catalog
    }
}