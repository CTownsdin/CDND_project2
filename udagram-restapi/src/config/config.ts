if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

export const config = {
    dev: {
        username: process.env.USERNAME,
        password: process.env.PASSWORD,
        database: process.env.DATABASE,
        host: process.env.HOST,
        dialect: 'postgres',
        aws_region: 'us-west-2',
        aws_profile: 'crex-sandbox',
        aws_media_bucket: 'udagram-ctownsdin-dev',
    },
    prod: {
        // prod secrets are entered into elastic beanstalk
    },
    jwt: {
        secret: process.env.JWT_SECRET,
    },
};
