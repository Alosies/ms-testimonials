#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { getStageConfig, type Stage } from '../config';
import { createStorageStack } from '../stacks';

const app = new cdk.App();

// Get stage from context or default to 'dev'
const stage = (app.node.tryGetContext('stage') || 'dev') as Stage;
const config = getStageConfig(stage);

console.log(`Deploying to stage: ${stage}`);
console.log(`Account: ${config.account}`);
console.log(`Region: ${config.region}`);

// Create stacks
createStorageStack(app, `TestimonialsStorage-${stage}`, {
  stage,
  env: {
    account: config.account,
    region: config.region,
  },
});

app.synth();
