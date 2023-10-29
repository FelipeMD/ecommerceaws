import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as ssm from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

export class CatalogAppLayersStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const catalogLayers = new lambda.LayerVersion(this, "CatalogLayer", {
            code: lambda.Code.fromAsset('lambda/catalog/layers/catalogLayer'),
            layerVersionName: "CatalogLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        new ssm.StringParameter(this, "CatalogLayerVersionArn", {
            parameterName: "CatalogLayerVersionArn",
            stringValue: catalogLayers.layerVersionArn
        })

        const catalogEventsLayers = new lambda.LayerVersion(this, "CatalogEventsLayer", {
            code: lambda.Code.fromAsset('lambda/catalog/layers/CatalogEventsLayer'),
            layerVersionName: "CatalogEventsLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        new ssm.StringParameter(this, "CatalogEventsLayerVersionArn", {
            parameterName: "CatalogEventsLayerVersionArn",
            stringValue: catalogEventsLayers.layerVersionArn
        })
    }
}