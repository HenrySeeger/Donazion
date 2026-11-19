import * as cdk from 'aws-cdk-lib/core';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';

export class BackEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Imports the existing VPC that contains our RDS database.
    const vpc = ec2.Vpc.fromLookup(this, 'DonazionVpc', {
      vpcId: 'vpc-020d486486f24023b',
    });

    // Allows Lambda functions to access Parameter Store privately.
    vpc.addInterfaceEndpoint('SsmEndpoint', {
      service: ec2.InterfaceVpcEndpointAwsService.SSM,
      subnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
    });

    // Security group for the organization authentication Lambda functions.
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'OrganizationLambdaSG', {
      vpc,
      description: 'Security group for Donazion organization authentication Lambdas',
      allowAllOutbound: true,
    });

    // Lambda function for Organization login requests.
    const loginOrganizationLambda = new nodejs.NodejsFunction(
      this,
      'LoginOrganizationLambda',
      {
        entry: 'lambda/organization/loginOrganization.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(15),
        vpc,
        securityGroups: [lambdaSecurityGroup],
        allowPublicSubnet: true,
        environment: {
          DB_CA_PATH: '/var/task/certs/global-bundle.pem',
          DB_HOST: 'donaziondb.c3oe48gacjry.us-east-2.rds.amazonaws.com',
          DB_PORT: '3306',
          DB_NAME: 'donazion',
          DB_USER: 'donazionAdmin',
        },
        bundling: {
      commandHooks: {
        beforeBundling() {
          return [];
        },
        beforeInstall() {
          return [];
        },
        afterBundling(_inputDir, outputDir) {
          return [
            `node -e "const fs=require('fs');const path=require('path');const dest=path.join(process.argv[1],'certs');fs.mkdirSync(dest,{recursive:true});fs.copyFileSync('certs/global-bundle.pem',path.join(dest,'global-bundle.pem'))" "${outputDir}"`,
          ];
        },
      },
    },
      }
    );

    // Lambda function for Organization password changes.
    const changePasswordLambda = new nodejs.NodejsFunction(
      this,
      'ChangePasswordLambda',
      {
        entry: 'lambda/organization/changePassword.ts',
        handler: 'handler',
        runtime: lambda.Runtime.NODEJS_22_X,
        timeout: cdk.Duration.seconds(15),
        vpc,
        securityGroups: [lambdaSecurityGroup],
        allowPublicSubnet: true,
       environment: {
          DB_CA_PATH: '/var/task/certs/global-bundle.pem',
          DB_HOST: 'donaziondb.c3oe48gacjry.us-east-2.rds.amazonaws.com',
          DB_PORT: '3306',
          DB_NAME: 'donazion',
          DB_USER: 'donazionAdmin',
        },
        bundling: {
        commandHooks: {
          beforeBundling() {
            return [];
          },
          beforeInstall() {
            return [];
          },
          afterBundling(_inputDir, outputDir) {
            return [
              `node -e "const fs=require('fs');const path=require('path');const dest=path.join(process.argv[1],'certs');fs.mkdirSync(dest,{recursive:true});fs.copyFileSync('certs/global-bundle.pem',path.join(dest,'global-bundle.pem'))" "${outputDir}"`,
            ];
          },
        },
      },
      }
    );

    // Allow both Lambda functions to retrieve Donazion secrets.
    const parameterArns = [
      `arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD`,
      `arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/JWT_SECRET`,
    ];

    for (const lambdaFunction of [
      loginOrganizationLambda,
      changePasswordLambda,
    ]) {
      lambdaFunction.addToRolePolicy(
        new iam.PolicyStatement({
          actions: ['ssm:GetParameter'],
          resources: parameterArns,
        })
      );
    }

    // Creates the REST API for Donazion.
    const api = new apigateway.RestApi(this, 'DonazionApi', {
      restApiName: 'DonazionAPI',
      description: 'REST API for the Donazion donation management system',
      deployOptions: {
        stageName: 'prod',
      },
    });

    // Connects the Login Organization Lambda to the API.
    const loginOrganizationResource = api.root.addResource('loginOrganization');

    loginOrganizationResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(loginOrganizationLambda)
    );

    // Imports the existing security group used by the RDS database.
    const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'DonazionRdsSG',
      'sg-08719816a77e5a5f5',
      {
        mutable: true,
      }
    );

    // Connects the Change Password Lambda to the API.
    const changePasswordResource = api.root.addResource('changePassword');

    changePasswordResource.addMethod(
      'POST',
      new apigateway.LambdaIntegration(changePasswordLambda)
    );

    // Allows the organization Lambdas to connect to the RDS MySQL database.
    rdsSecurityGroup.addIngressRule(
      lambdaSecurityGroup,
      ec2.Port.tcp(3306),
      'Allow Donazion organization Lambdas to access MySQL'
    );

    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackEndQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
