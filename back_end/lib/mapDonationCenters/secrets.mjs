
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";

// Creates an AWS Systems Manager client.
const ssm = new SSMClient({
    region: process.env.AWS_REGION || "us-east-2",
});

// Retrieves an encrypted secret from Parameter Store.
export async function getSecret(parameterName) {
    // Allows local development and tests to use .env.local.
    const localSecretName = parameterName.split("/").pop();
    const localSecret = localSecretName
        ? process.env[localSecretName]
        : undefined;

    if (localSecret) {
        return localSecret;
    }

    // Retrieves the encrypted parameter from AWS.
    const response = await ssm.send(
        new GetParameterCommand({
            Name: parameterName,
            WithDecryption: true,
        })
    );

    const secret = response.Parameter?.Value;

    if (!secret) {
        throw new Error(`Missing required parameter: ${parameterName}`);
    }

    return secret;
}
