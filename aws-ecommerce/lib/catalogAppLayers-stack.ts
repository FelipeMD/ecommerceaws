import * as cdk from "aws-cdk-lib"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as ssm from "aws-cdk-lib/aws-ssm"
import { Construct } from "constructs"

export class CatalogAppLayersStack extends cdk.Stack {
    readonly catalogLayers: lambda.LayerVersion

    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.catalogLayers = new lambda.LayerVersion(this, "CatalogLayer", {
            code: lambda.Code.fromAsset('lambda/catalog/layers/catalogLayer'),
            layerVersionName: "CatalogLayer",
            removalPolicy: cdk.RemovalPolicy.RETAIN
        })
        new ssm.StringParameter(this, "CatalogLayerVersionArn", {
            parameterName: "CatalogLayerVersionArn",
            stringValue: this.catalogLayers.layerVersionArn
        })
    }
}