const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const multerS3 = require('multer-s3');
const multer = require('multer');

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://63.141.253.242:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'MINIO_ACCESS_KEY';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'MINIO_SECRET_KEY';
const MINIO_BUCKET = process.env.MINIO_BUCKET || 'shopii';

const s3 = new S3Client({
    region: 'us-east-1',
    endpoint: MINIO_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: MINIO_ACCESS_KEY,
        secretAccessKey: MINIO_SECRET_KEY,
    },
});

const upload = multer({
    storage: multerS3({
        s3,
        bucket: MINIO_BUCKET,
        contentType: multerS3.AUTO_CONTENT_TYPE,
        acl: 'public-read',
        key: (req, file, cb) => {
            const folder = req.query.folder || 'uploads';
            const ext = file.originalname.split('.').pop();
            const base = file.originalname.replace(/\.[^/.]+$/, '');
            const filename = `${base}-${Date.now()}.${ext}`;
            cb(null, `${folder}/${filename}`);
        },
        metadata: (req, file, cb) => {
            cb(null, { fieldName: file.fieldname });
        },
    }),
});

const deleteObject = async (key) => {
    const cmd = new DeleteObjectCommand({ Bucket: MINIO_BUCKET, Key: key });
    return s3.send(cmd);
};

module.exports = {
    s3,
    upload,
    deleteObject,
    MINIO_BUCKET,
    MINIO_ENDPOINT,
}; 