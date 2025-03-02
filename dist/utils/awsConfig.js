import AWS from 'aws-sdk';
// Configure AWS SDK 
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID, //  AWS Access Key ID
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, // AWS Secret Access Key
    region: process.env.AWS_REGION, // Your AWS region 
});
