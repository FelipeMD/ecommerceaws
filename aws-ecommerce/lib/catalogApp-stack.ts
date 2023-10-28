import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"
import {RemovalPolicy} from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import {BillingMode} from "aws-cdk-lib/aws-dynamodb"

import {Construct} from "constructs"

export class CatalogAppStack extends cdk.Stack {

    readonly catalogFetchHandler: lambdaNodeJs.NodejsFunction
    readonly catalogAdminHandler: lambdaNodeJs.NodejsFunction
    readonly catalogDdb: dynamodb.Table


    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.catalogDdb = new dynamodb.Table(this, "CatalogDdb", {
            tableName: "catalog",
            removalPolicy: RemovalPolicy.DESTROY,
            partitionKey: {
                name: "id",
                type: dynamodb.AttributeType.STRING
            },
            billingMode: BillingMode.PROVISIONED,
            readCapacity: 1,
            writeCapacity: 1
        })
        this.catalogFetchHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogFetchFunction", {
            functionName: "CatalogFetchFunction",
            entry: "lambda/catalog/CatalogFetchFunction.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(19),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                CATALOG_DDB: this.catalogDdb.tableName
            }
        })
        this.catalogDdb.grantReadData(this.catalogFetchHandler)

        this.catalogAdminHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogAdminFunction", {
            functionName: "CatalogAdminFunction",
            entry: "lambda/catalog/CatalogAdminFunction.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(19),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                CATALOG_DDB: this.catalogDdb.tableName
            }
        })
        this.catalogDdb.grantWriteData(this.catalogAdminHandler)
    }
}