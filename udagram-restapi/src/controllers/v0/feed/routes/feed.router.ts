import { Router, Request, Response } from 'express';
import { FeedItem } from '../models/FeedItem';
import { requireAuth } from '../../users/routes/auth.router';
import * as AWS from '../../../../aws';

const router: Router = Router();

// is effectively: /api/v0/feed/  route.
router.get('/', async (req: Request, res: Response) => {
    const items = await FeedItem.findAndCountAll({ order: [['id', 'DESC']] });
    items.rows.map((item) => {
        if (item.url) {
            item.url = AWS.getGetSignedUrl(item.url);
        }
    });
    return res.send(items);
});

router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const item = await FeedItem.findByPk(Number(id));
    if (!item) return res.status(404).send('404, item not found.');
    else {
        return res.send(item);
    }
});

router.patch('/:id', requireAuth, async (req: Request, res: Response) => {
    const newValues = req.body;

    try {
        const item = await FeedItem.findByPk(Number(req.params.id));
        if (!item) {
            return res.status(404).send('404, item not found.');
        }

        // updates both updatedAt and createdAt, bug?
        const results = await FeedItem.update(newValues, {
            returning: true,
            where: { id: req.params.id },
        });
        const dataValues = results[1][0].dataValues;

        return res.status(200).send(dataValues);
    } catch (err) {
        return res.status(400).send('unknown error updating item');
    }
});

// Get a signed url to put a new item in the bucket
router.get('/signed-url/:fileName', requireAuth, async (req: Request, res: Response) => {
    let { fileName } = req.params;
    const url = AWS.getPutSignedUrl(fileName);
    res.status(201).send({ url: url });
});

// POST metadata and the filename after a file is uploaded.
// NOTE the file name is the key name in the s3 bucket.
// eg body: {caption: string, fileName: string};
router.post('/', requireAuth, async (req: Request, res: Response) => {
    const caption = req.body.caption;
    const fileName = req.body.url;

    if (!caption) {
        return res.status(400).send({ message: 'Caption is required or malformed' });
    }

    if (!fileName) {
        return res.status(400).send({ message: 'File url is required' });
    }

    const item = await new FeedItem({
        caption: caption,
        url: fileName,
    });

    const saved_item = await item.save();

    saved_item.url = AWS.getGetSignedUrl(saved_item.url);
    res.status(201).send(saved_item);
});

export const FeedRouter: Router = router;
