import * as cdk from 'aws-cdk-lib/core';
import { Construct } from 'constructs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as apigw from "aws-cdk-lib/aws-apigateway"
import * as lambda from "aws-cdk-lib/aws-lambda"
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'node:path'
import * as ec2 from 'aws-cdk-lib/aws-ec2'
import { Duration } from 'aws-cdk-lib'
import * as iam from 'aws-cdk-lib/aws-iam'

export class BackEndStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = ec2.Vpc.fromVpcAttributes(this, 'VPC', {
          vpcId: 'vpc-020d486486f24023b',
          availabilityZones: ['us-east-2a', 'us-east-2b', 'us-east-2c'],
          privateSubnetIds: ['subnet-0d05e966a6346bd3d', 'subnet-03f3042ed42587537', 'subnet-0cc005993ec908f44'],
    })

    const securityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', 'sg-077ca90141aef7aef', {
        mutable: false
    })


    // generic default handler for any API function that doesn't get its own Lambda method
    const default_fn = new lambdaNodejs.NodejsFunction(this, 'LambdaDefaultFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'default.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'LambdaDefaultFunctionA40B1763.zip')),
      vpc: vpc,
      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })

    const api_endpoint = new apigw.LambdaRestApi(this, `calculatorapi`, {
      handler: default_fn,
      restApiName: `CalculatorAPI`, 
      proxy: false,
      defaultCorsPreflightOptions: { // Optional but helpful: Add CORS configuration 
        allowOrigins: apigw.Cors.ALL_ORIGINS,
        allowMethods: apigw.Cors.ALL_METHODS,
        allowHeaders: apigw.Cors.DEFAULT_HEADERS,
      },
    })
    
    const donazionResource = api_endpoint.root.addResource('donazion')

    // Organization
    const loginOrganizationResource = donazionResource.addResource('loginOrganization')
    const changePasswordResource = donazionResource.addResource('changePassword')
    const orgShowDashboardResource = donazionResource.addResource('orgShowDashboard')
    const addCategoryResource = donazionResource.addResource('addCategory')
    const removeCategoryResource = donazionResource.addResource('removeCategory')
    const uploadCategoryItemsResource = donazionResource.addResource('uploadCategoryItems')
    const removeCategoryItemResource = donazionResource.addResource('removeCategoryItem')
    const editCategoryItemResource = donazionResource.addResource('editCategoryItem')
    const listDonationCentersResource = donazionResource.addResource('listDonationCenters') // Also for donor

    // Donation Center
    const registerDonationCenterResource = donazionResource.addResource('registerDonationCenter')
    const loginDonationCenterResource = donazionResource.addResource('loginDonationCenter')
    const removeDonationCenterResource = donazionResource.addResource('removeDonationCenter')
    const dcShowDashboardResource = donazionResource.addResource('dcShowDashboard')
    const listInventoryResource = donazionResource.addResource('listInventory')
    const wishlistResource = donazionResource.addResource('wishlist')
    const addWishlistItemResource = donazionResource.addResource('addWishlistItem')
    const removeWishlistItemResource = donazionResource.addResource('removeWishlistItem')
    const catalogItemsResource = donazionResource.addResource('catalogItems')

    // Donor
// Deferred until Iteration 2:     const listCategoryItemsResource = donazionResource.addResource('listCategoryItems')
    const mapDonationCentersResource = donazionResource.addResource('mapDonationCenters')
    const searchDonationCentersByWishlistResource = donazionResource.addResource('searchDonationCentersByWishlist')
    const prepareBoxResource = donazionResource.addResource('prepareBox')
    const completeBoxDonationResource = donazionResource.addResource('completeBoxDonation')

    // https://github.com/aws/aws-cdk/blob/main/packages/aws-cdk-lib/aws-apigateway/README.md
    const integration_parameters = { 
       proxy: false,
       passthroughBehavior: apigw.PassthroughBehavior.WHEN_NO_MATCH,
       
       integrationResponses: [
          {
            // Successful response from the Lambda function, no filter defined
            statusCode: '200',
            responseTemplates: {
              'application/json': '$input.json(\'$\')',       // should just pass JSON through untouched
            },
            responseParameters: {
                'method.response.header.Content-Type':                      "'application/json'",
                'method.response.header.Access-Control-Allow-Origin':       "'*'",
                'method.response.header.Access-Control-Allow-Credentials':  "'true'"
            },
          },
          {
            // For errors, we check if the error message is not empty, get the error data
            selectionPattern: '(\n|.)+',
            statusCode: "400",
            responseTemplates: {
              'application/json': JSON.stringify({ state: 'error', message: "$util.escapeJavaScript($input.path('$.errorMessage'))" })
          },
            responseParameters: {
                'method.response.header.Content-Type':                      "'application/json'",
                'method.response.header.Access-Control-Allow-Origin':       "'*'",
                'method.response.header.Access-Control-Allow-Credentials':  "'true'"
            },
          }
        ]
    }

    const response_parameters = {
   methodResponses: [
    {
      // Successful response from the integration
      statusCode: '200',
      // Define what parameters 
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },

    },
    {
      // Same thing for the error responses
      statusCode: '400',
      responseParameters: {
        'method.response.header.Content-Type': true,
        'method.response.header.Access-Control-Allow-Origin': true,
        'method.response.header.Access-Control-Allow-Credentials': true
      },
 
    }
  ]
    }

    const path_parameter_integration = {
      proxy: true
    }

    const path_response_parameters = {
      methodResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        },
        {
          statusCode: '400',
          responseParameters: {
            'method.response.header.Content-Type': true,
            'method.response.header.Access-Control-Allow-Origin': true,
            'method.response.header.Access-Control-Allow-Credentials': true
          }
        }
      ]
    }

    // Organization
    // Add a POST method to the '/donazion/loginOrganization' resource
    const loginOrganization_fn = new lambda.Function(this, 'loginOrganizationFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'loginOrganization.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'loginOrganization')),
      vpc: vpc,   // Reference the VPC defined above

      securityGroups: [securityGroup],   // Associate the security group
   // Timeout, adjust as needed,
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })

    // Allows loginOrganization to retrieve its database password and JWT secret.
    loginOrganization_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            `arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`,
            `arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/JWT_SECRET`
        ]
    }));

    // Uses Lambda proxy integration to preserve authentication HTTP status codes.
    loginOrganizationResource.addMethod(
        'POST',
        new apigw.LambdaIntegration(loginOrganization_fn, {
            proxy: true
        })
    )

    const changePassword_fn = new lambda.Function(this, 'changePasswordFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'changePassword.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'changePassword')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })

    // Allows changePassword to retrieve its database password and JWT secret.
    changePassword_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            `arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`,
            `arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/JWT_SECRET`
        ]
    }));

    // Passes authentication headers and the JSON body to the Lambda.
    changePasswordResource.addMethod('POST', new apigw.LambdaIntegration(changePassword_fn, {
    	...integration_parameters,
    	requestTemplates: {
        	'application/json': `{
            	"headers": {
                	"Authorization": 	"$util.escapeJavaScript($input.params().header.get('Authorization')).replaceAll("\\\\'","'")"
            	},
            	"body": "$util.escapeJavaScript($input.body).replaceAll("\\\\'","'")"
        	}`
    	}
	}), response_parameters)

    const orgShowDashboard_fn = new lambdaNodejs.NodejsFunction(this, 'orgShowDashboardFunction', {
    	runtime: lambda.Runtime.NODEJS_22_X,
    	handler: 'orgShowDashboard.handler',
    	code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'orgShowDashboard')),
    	vpc: vpc,

    	securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 128,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
	})
	// Allows the dashboard to retrieve the database password and JWT secret.
	orgShowDashboard_fn.addToRolePolicy(new iam.PolicyStatement({
    	actions: ['ssm:GetParameter'],
    	resources: [
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`,
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/JWT_SECRET`
    	]
	}));
    orgShowDashboardResource.addMethod('POST', new apigw.LambdaIntegration(orgShowDashboard_fn, {
    	...integration_parameters,
    	requestTemplates: {
        	'application/json': `{
            	"headers": {
                	"Authorization": 	"$util.escapeJavaScript($input.params().header.get('Authorization')).replaceAll("\\\\'","'")"
            	},
            	"body": "$util.escapeJavaScript($input.body).replaceAll("\\\\'","'")"
        	}`
    	}
	}), response_parameters)

    const addCategory_fn = new lambdaNodejs.NodejsFunction(this, 'addCategoryFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addCategory.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'addCategoryFunction644B2020.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(25),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    addCategory_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD',
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/JWT_SECRET'
        ]
    }));

    addCategoryResource.addMethod('POST', new apigw.LambdaIntegration(addCategory_fn, integration_parameters), response_parameters)

    const removeCategory_fn = new lambdaNodejs.NodejsFunction(this, 'removeCategoryFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeCategory.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'removeCategoryFunction78C65F0F.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(25),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    removeCategory_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD',
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/JWT_SECRET'
        ]
    }));

    removeCategoryResource.addMethod('POST', new apigw.LambdaIntegration(removeCategory_fn, integration_parameters), response_parameters)

    const uploadCategoryItems_fn = new lambdaNodejs.NodejsFunction(this, 'uploadCategoryItemsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'uploadCategoryItems.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'uploadCategoryItemsFunction6240E45F.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    uploadCategoryItemsResource.addMethod('POST', new apigw.LambdaIntegration(uploadCategoryItems_fn, integration_parameters), response_parameters)

    const removeCategoryItem_fn = new lambdaNodejs.NodejsFunction(this, 'removeCategoryItemFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeCategoryItem.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'removeCategoryItemFunction35B27EC2.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(25),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    removeCategoryItem_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD',
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/JWT_SECRET'
        ]
    }));

    removeCategoryItemResource.addMethod('POST', new apigw.LambdaIntegration(removeCategoryItem_fn, integration_parameters), response_parameters)

    const editCategoryItem_fn = new lambdaNodejs.NodejsFunction(this, 'editCategoryItemFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'editCategoryItem.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'editCategoryItemFunction13153CA6.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(25),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    editCategoryItem_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD',
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/JWT_SECRET'
        ]
    }));

    editCategoryItemResource.addMethod('POST', new apigw.LambdaIntegration(editCategoryItem_fn, integration_parameters), response_parameters)

    const listDonationCenters_fn = new lambdaNodejs.NodejsFunction(this, 	'listDonationCentersFunction', {
    	runtime: lambda.Runtime.NODEJS_22_X,
    	handler: 'listDonationCenters.handler',
    	code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'listDonationCenters')),
    	vpc: vpc,

    	securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
	})    // Also for Donor
	// Allows the donation center list to retrieve the database password.
	listDonationCenters_fn.addToRolePolicy(new iam.PolicyStatement({
    	actions: ['ssm:GetParameter'],
    	resources: [
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`
    	]
	}));
    listDonationCentersResource.addMethod(
    	'POST',
    	new apigw.LambdaIntegration(
        	listDonationCenters_fn,
        	integration_parameters
    	),
    	response_parameters
)


    // Donation Center
    const registerDonationCenter_fn = new lambdaNodejs.NodejsFunction(this, 	'registerDonationCenterFunction', {
    	runtime: lambda.Runtime.NODEJS_22_X,
    	handler: 'registerDonationCenter.handler',
    	code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'registerDonationCenter')),
    	vpc: vpc,

    	securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
	})
	// Allows registration to retrieve the database password.
	registerDonationCenter_fn.addToRolePolicy(new iam.PolicyStatement({
    	actions: ['ssm:GetParameter'],
    	resources: [
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`
    	]
	}));
    registerDonationCenterResource.addMethod('POST', new apigw.LambdaIntegration(registerDonationCenter_fn, integration_parameters), response_parameters)

    const loginDonationCenter_fn = new lambdaNodejs.NodejsFunction(this, 	'loginDonationCenterFunction', {
    	runtime: lambda.Runtime.NODEJS_22_X,
    	handler: 'loginDonationCenter.handler',
    	code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'loginDonationCenter')),
    vpc: vpc,

    	securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
	})
	// Allows donation center login to retrieve the database password and JWT secret.
	loginDonationCenter_fn.addToRolePolicy(new iam.PolicyStatement({
    	actions: ['ssm:GetParameter'],
    	resources: [
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`,
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/JWT_SECRET`
    	]
	}));
    loginDonationCenterResource.addMethod('POST', new apigw.LambdaIntegration(loginDonationCenter_fn, integration_parameters), response_parameters)

    const removeDonationCenter_fn = new lambdaNodejs.NodejsFunction(this, 'removeDonationCenterFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeDonationCenter.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'removeDonationCenterFunction5BA7F2FE.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    removeDonationCenterResource.addMethod('POST', new apigw.LambdaIntegration(removeDonationCenter_fn, integration_parameters), response_parameters)

    const dcShowDashboard_fn = new lambdaNodejs.NodejsFunction(this, 'dcShowDashboardFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'dcShowDashboard.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'dcShowDashboardFunction640DEE57.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    dcShowDashboardResource.addMethod('GET', new apigw.LambdaIntegration(dcShowDashboard_fn, integration_parameters), response_parameters)

    const listInventory_fn = new lambdaNodejs.NodejsFunction(this, 'listInventoryFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'listInventory.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'listInventoryFunctionCE9D9001.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    listInventoryResource.addMethod('GET', new apigw.LambdaIntegration(listInventory_fn, integration_parameters), response_parameters)

    const wishlist_fn = new lambdaNodejs.NodejsFunction(this, 'wishlistFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'wishlist.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'wishlistFunctionE31282DD.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    wishlistResource.addMethod('GET', new apigw.LambdaIntegration(wishlist_fn, integration_parameters), response_parameters)

    const addWishlistItem_fn = new lambdaNodejs.NodejsFunction(this, 'addWishlistItemFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'addWishlistItem.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'addWishlistItemFunctionF2F5AECE.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    addWishlistItemResource.addMethod('POST', new apigw.LambdaIntegration(addWishlistItem_fn, integration_parameters), response_parameters)

    const removeWishlistItem_fn = new lambdaNodejs.NodejsFunction(this, 'removeWishlistItemFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'removeWishlistItem.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'removeWishlistItemFunction5E79255E.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    removeWishlistItemResource.addMethod('POST', new apigw.LambdaIntegration(removeWishlistItem_fn, integration_parameters), response_parameters)

    const catalogItems_fn = new lambdaNodejs.NodejsFunction(this, 'catalogItemsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'listCategoryItems.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'catalogItemsFunction6B2A5818.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    catalogItems_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD'
        ]
    }));

    catalogItemsResource.addMethod('POST', new apigw.LambdaIntegration(catalogItems_fn, integration_parameters), response_parameters)


    // Donor
    const mapDonationCenters_fn = new lambdaNodejs.NodejsFunction(this, 'mapDonationCentersFunction', 	{
    	runtime: lambda.Runtime.NODEJS_22_X,
    	handler: 'mapDonationCenters.handler',
    	code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'mapDonationCenters')),
    	vpc: vpc,

    	securityGroups: [securityGroup],
        timeout: Duration.seconds(15),
        memorySize: 256,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
        },
	})
	// Allows the donation center map to retrieve the database password.
	mapDonationCenters_fn.addToRolePolicy(new iam.PolicyStatement({
    	actions: ['ssm:GetParameter'],
    	resources: [
        	`arn:aws:ssm:${this.region}:${this.account}:parameter/donazion/prod/DB_PASSWORD`
    	]
	}));
    mapDonationCentersResource.addMethod('POST', new apigw.LambdaIntegration(mapDonationCenters_fn, integration_parameters), response_parameters)

    const searchDonationCentersByWishlist_fn = new lambdaNodejs.NodejsFunction(this, 'searchDonationCentersByWishlistFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'searchDonationCentersByWishlist.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'searchDonationCentersByWishlistFunctionCF0E2C5F.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
        environment: {
            DB_HOST: process.env.DB_HOST!,
            DB_PORT: process.env.DB_PORT!,
            DB_USER: process.env.DB_USER!,
            DB_NAME: process.env.DB_NAME!,
            DB_CA_PATH: '/var/task/certs/global-bundle.pem',
        },
    })
    searchDonationCentersByWishlist_fn.addToRolePolicy(new iam.PolicyStatement({
        actions: ['ssm:GetParameter'],
        resources: [
            'arn:aws:ssm:us-east-2:971805627045:parameter/donazion/prod/DB_PASSWORD'
        ]
    }));

    searchDonationCentersByWishlistResource.addMethod('POST', new apigw.LambdaIntegration(searchDonationCentersByWishlist_fn, integration_parameters), response_parameters)

    const prepareBox_fn = new lambdaNodejs.NodejsFunction(this, 'prepareBoxFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'prepareBox.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'prepareBoxFunctionD1FDEAD4.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    prepareBoxResource.addMethod('POST', new apigw.LambdaIntegration(prepareBox_fn, integration_parameters), response_parameters)

    const completeBoxDonation_fn = new lambdaNodejs.NodejsFunction(this, 'completeBoxDonationFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'completeBoxDonation.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, '..', 'lambda-assets', 'preserved', 'completeBoxDonationFunction24E5FEAD.zip')),
      vpc: vpc,

      securityGroups: [securityGroup],
        timeout: Duration.seconds(3),
        memorySize: 128,
    })
    completeBoxDonationResource.addMethod('POST', new apigw.LambdaIntegration(completeBoxDonation_fn, integration_parameters), response_parameters)

/* Deferred until Iteration 2
    const listCategoryItems_fn = new lambdaNodejs.NodejsFunction(this, 'listCategoryItemsFunction', {
      runtime: lambda.Runtime.NODEJS_22_X,
      handler: 'listCategoryItems.handler',
      code: lambda.Code.fromAsset(path.join(__dirname, 'listCategoryItems')),
      vpc: vpc,
      environment: {
          RDS_USER: process.env.RDS_USER!,
          RDS_PASSWORD: process.env.RDS_PASSWORD!,
          RDS_DATABASE: process.env.RDS_DATABASE!,
          RDS_HOST: process.env.RDS_HOST!
        },
      securityGroups: [securityGroup],
      timeout: Duration.seconds(3),
    })
    listCategoryItemsResource.addMethod('POST', new apigw.LambdaIntegration(listCategoryItems_fn, integration_parameters), response_parameters)
*/
    // The code that defines your stack goes here

    // example resource
    // const queue = new sqs.Queue(this, 'BackEndQueue', {
    //   visibilityTimeout: cdk.Duration.seconds(300)
    // });
  }
}
