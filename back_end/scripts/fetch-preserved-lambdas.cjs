const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { execFileSync } = require('node:child_process');

const root = path.resolve(__dirname, '..');
const bucket = 'cdk-hnb659fds-assets-971805627045-us-east-2';
const region = 'us-east-2';

const manifest = JSON.parse(
    fs.readFileSync(
        path.join(__dirname, 'preserved-lambdas.json'),
        'utf8'
    ).replace(/^\uFEFF/, '')
);

const destination = process.env.DONAZION_ASSET_DIR ||
    path.join(root, 'lambda-assets', 'preserved');

fs.mkdirSync(destination, { recursive: true });

// Calculate the ZIP file hash.
function getHash(file) {
    return crypto.createHash('sha256')
        .update(fs.readFileSync(file))
        .digest('base64');
}

if (manifest.length !== 16) {
    throw new Error('Expected 16 preserved Lambda assets');
}

for (const entry of manifest) {

    const file = path.join(destination, entry.File);

    // Skip files that are already correct.
    if (fs.existsSync(file) &&
        getHash(file) === entry.CodeSha256) {

        console.log(`Already verified: ${entry.File}`);
        continue;
    }

    console.log(`Downloading: ${entry.File}`);

    const temporary = file + '.download';

    try {
        execFileSync('aws', [
            's3', 'cp',
            `s3://${bucket}/${entry.S3Key}`,
            temporary,
            '--region', region,
            '--only-show-errors'
        ], { stdio: 'inherit' });

        // Verify the downloaded file before using it.
        if (getHash(temporary) !== entry.CodeSha256) {
            throw new Error(`Hash mismatch: ${entry.File}`);
        }

        fs.renameSync(temporary, file);

        console.log(`Verified: ${entry.File}`);

    } finally {
        fs.rmSync(temporary, { force: true });
    }
}

console.log('All 16 preserved Lambda assets verified.');
