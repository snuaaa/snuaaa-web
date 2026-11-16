import { mockClient } from 'aws-sdk-client-mock';
import { S3Client } from '@aws-sdk/client-s3';
import { SESClient } from '@aws-sdk/client-ses';

// Tests never reach AWS. Every S3 / SES call resolves with an empty result
// unless a test sets up its own response, e.g.
// `s3Mock.on(PutObjectCommand).resolves({})`. Reset before each test.
export const s3Mock = mockClient(S3Client);
export const sesMock = mockClient(SESClient);
