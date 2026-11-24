const fs = require('node:fs');
const path = require('node:path');
const { execSync } = require('node:child_process');
const esbuild = require('esbuild');

const root = path.resolve(__dirname, '..');

const functions = [
    'loginOrganization',
    'changePassword',
    'orgShowDashboard',
    'listDonationCenters',
    'registerDonationCenter',
    'loginDonationCenter',
    'mapDonationCenters'
];

async function main() {
    for (const name of functions) {
        console.log(`Packaging ${name}...`);

        const source = path.join(root, 'lib', name);
        const destination = path.join(root, 'lambda-assets', name);

        // Install the dependencies defined in the lock file
        if (!process.argv.includes('--skip-install')) execSync('npm ci --no-audit --no-fund', {
            cwd: source,
            stdio: 'inherit'
        });

        // Recreate the deployment folder
        fs.rmSync(destination, {
            recursive: true,
            force: true
        });

        fs.mkdirSync(destination, {
            recursive: true
        });

        // Bundle the Lambda function
        await esbuild.build({
            entryPoints: [path.join(source, `${name}.mjs`)],
            bundle: true,
            platform: 'node',
            target: 'node22',
            format: 'cjs',
            outfile: path.join(destination, `${name}.js`)
        });

        // Copy the database certificate
        fs.cpSync(
            path.join(source, 'certs'),
            path.join(destination, 'certs'),
            { recursive: true }
        );

        console.log(`Completed ${name}`);
    }

    console.log('All seven Iteration 1 functions packaged.');
}

main().catch(error => {
    console.error(error);
    process.exitCode = 1;
});

