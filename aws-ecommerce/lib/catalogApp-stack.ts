import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as cdk from "aws-cdk-lib"
import {RemovalPolicy} from "aws-cdk-lib"
import * as dynamodb from "aws-cdk-lib/aws-dynamodb"
import * as ssm from "aws-cdk-lib/aws-ssm"
import {BillingMode} from "aws-cdk-lib/aws-dynamodb"

import {Construct} from "constructs"
import {Runtime} from "aws-cdk-lib/aws-lambda";

interface catalogAppStackProps extends cdk.StackProps {
    eventsDdb: dynamodb.Table
}
export class CatalogAppStack extends cdk.Stack {

    readonly catalogFetchHandler: lambdaNodeJs.NodejsFunction
    readonly catalogAdminHandler: lambdaNodeJs.NodejsFunction
    readonly catalogDdb: dynamodb.Table


    constructor(scope: Construct, id: string, props: catalogAppStackProps) {
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

        const catalogLayerArn = ssm.StringParameter.valueForStringParameter(this, "CatalogLayerVersionArn")
        const catalogLayer = lambda.LayerVersion.fromLayerVersionArn(this, "CatalogLayerVersionArn", catalogLayerArn)

        const catalogEventsLayerArn = ssm.StringParameter.valueForStringParameter(this, "CatalogEventsLayerVersionArn")
        const catalogEventsLayer = lambda.LayerVersion.fromLayerVersionArn(this, "CatalogEventsLayerVersionArn", catalogEventsLayerArn)

        const catalogEventsHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogEventsFunction", {
            functionName: "CatalogEventsFunction",
            entry: "lambda/catalog/CatalogEventsFunction.ts",
            handler: "handler",
            memorySize: 128,
            runtime: Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(10),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                EVENTS_DDB: props.eventsDdb.tableName
            },
            layers: [catalogEventsLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_229_0
        })
        props.eventsDdb.grantWriteData(catalogEventsHandler)

        this.catalogFetchHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogFetchFunction", {
            functionName: "CatalogFetchFunction",
            entry: "lambda/catalog/CatalogFetchFunction.ts",
            handler: "handler",
            memorySize: 128,
            runtime: Runtime.NODEJS_16_X,
            timeout: cdk.Duration.seconds(55),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                CATALOG_DDB: this.catalogDdb.tableName
            },
            layers: [catalogLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_229_0
        })
        this.catalogDdb.grantReadData(this.catalogFetchHandler)

        this.catalogAdminHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogAdminFunction", {
            functionName: "CatalogAdminFunction",
            entry: "lambda/catalog/CatalogAdminFunction.ts",
            handler: "handler",
            runtime: Runtime.NODEJS_16_X,
            memorySize: 128,
            timeout: cdk.Duration.seconds(55),
            bundling: {
                minify: true,
                sourceMap: false
            },
            environment: {
                CATALOG_DDB: this.catalogDdb.tableName,
                CATALOG_EVENTS_FUNCTION_NAME: catalogEventsHandler.functionName
            },
            layers: [catalogLayer, catalogEventsLayer],
            tracing: lambda.Tracing.ACTIVE,
            insightsVersion: lambda.LambdaInsightsVersion.VERSION_1_0_229_0
        })
        this.catalogDdb.grantWriteData(this.catalogAdminHandler)
        catalogEventsHandler.grantInvoke(this.catalogAdminHandler)
    }
}