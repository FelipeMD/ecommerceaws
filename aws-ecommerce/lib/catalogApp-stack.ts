import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodeJs from "aws-cdk-lib/aws-lambda-nodejs"
import * as cdk from "aws-cdk-lib"

import {Construct} from "constructs"

export class CatalogAppStack extends cdk.Stack {

    readonly catalogFetchHandler: lambdaNodeJs.NodejsFunction
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        this.catalogFetchHandler = new lambdaNodeJs.NodejsFunction(this, "CatalogFetchFunctionId", {
            functionName: "CatalogFetchFunction",
            entry: "lambda/catalog/CatalogFetchFunction.ts",
            handler: "handler",
            memorySize: 128,
            timeout: cdk.Duration.seconds(19),
            bundling: {
                minify: true,
                sourceMap: false
            },
        })
    }
}