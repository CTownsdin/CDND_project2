import express from 'express';
import { sqlConnect } from './sqlConnection';
import bodyParser from 'body-parser';
import { V0MODELS } from './controllers/v0/model.index';
import { IndexRouter } from './controllers/v0/index.router';

(async () => {
    await sqlConnect.addModels(V0MODELS);
    await sqlConnect.sync(); // applies the migrations

    const app = express();
    const port = process.env.PORT || 8080;
    app.use(bodyParser.json());

    // CORS Should be restricted
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', 'http://localhost:8100');
        res.header(
            'Access-Control-Allow-Headers',
            'Origin, X-Requested-With, Content-Type, Accept, Authorization'
        );
        next();
    });

    app.use('/api/v0/', IndexRouter);

    app.get('/', async (req, res) => {
        res.send('/api/v0/');
    });

    app.listen(port, () => {
        console.log(`\nServer running on http://localhost:${port}`);
    });
})();
