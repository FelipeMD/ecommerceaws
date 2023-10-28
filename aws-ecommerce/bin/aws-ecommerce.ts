#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { CatalogAppStack } from '../lib/catalogApp-stack';
import { ApiStack } from '../lib/api-stack';
import { CatalogAppLayersStack } from '../lib/catalogAppLayers-stack';

const app = new cdk.App();

const env: cdk.Environment = {
    account: "828000338113",
    region: "us-east-1"
}

const tags = {
    cost: "aws-ecommerce",
    team: "Felipe Souza"
}

const catalogAppLayersStack = new CatalogAppLayersStack(app, "CatalogAppLayers", {
    tags: tags,
    env: env
})

const catalogAppStack = new CatalogAppStack(app, "CatalogApp", {
    tags: tags,
    env: env
})
catalogAppStack.addDependency(catalogAppLayersStack)

const eCommerceApiStack = new ApiStack(app, "CatalogApi", {
    catalogFetchHandler: catalogAppStack.catalogFetchHandler,
    catalogAdminHandler: catalogAppStack.catalogAdminHandler,
    tags: tags,
    env: env
})
eCommerceApiStack.addDependency(catalogAppStack)