#!/usr/bin/env node
// Prevent deployment with missing database settings.
for (const key of ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_NAME']) {
    if (!process.env[key]?.trim()) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
}

import * as cdk from 'aws-cdk-lib/core';
import { BackEndStack } from '../lib/back_end-stack';

const app = new cdk.App();
new BackEndStack(app, 'BackEndStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */

  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  // env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },

  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  env: { account: '971805627045', region: 'us-east-2' },

  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});
