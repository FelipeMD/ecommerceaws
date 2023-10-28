import * as cdk from "aws-cdk-lib"
import * as lambdaNodeJS from "aws-cdk-lib/aws-lambda-nodejs"
import * as apigateway from "aws-cdk-lib/aws-apigateway"
import * as cwlogs from "aws-cdk-lib/aws-logs"
import { Construct } from "constructs"

interface ApiStackProps extends  cdk.StackProps{
    catalogFetchHandler: lambdaNodeJS.NodejsFunction
    catalogAdminHandler: lambdaNodeJS.NodejsFunction
}
export class ApiStack extends cdk.Stack{
    constructor(scope: Construct, id: string, props: ApiStackProps) {
        super(scope, id, props);

        const logGroup = new cwlogs.LogGroup(this, "ApiLogsId")
        const api = new apigateway.RestApi(this, "ApiId", {
            restApiName: "Api",
            cloudWatchRole: true,
            deployOptions: {
                accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
                accessLogFormat: apigateway.AccessLogFormat.jsonWithStandardFields({
                    httpMethod: true,
                    ip: true,
                    protocol: true,
                    requestTime: true,
                    resourcePath: true,
                    responseLength: true,
                    status: true,
                    caller: true,
                    user: true
                })
            }
        })

        const  catalogFetchHandlerIntegration = new apigateway.LambdaIntegration(props.catalogFetchHandler)

        const catalogResource = api.root.addResource("catalog")
        catalogResource.addMethod("GET", catalogFetchHandlerIntegration)

        const catalogIdResource = catalogResource.addResource("{id}")
        catalogIdResource.addMethod("GET", catalogFetchHandlerIntegration)

        const catalogAdminIntegration = new apigateway.LambdaIntegration(props.catalogAdminHandler)

        catalogResource.addMethod("POST", catalogAdminIntegration)

        catalogIdResource.addMethod("PUT", catalogAdminIntegration)

        catalogIdResource.addMethod("DELETE", catalogAdminIntegration)
    }
}
