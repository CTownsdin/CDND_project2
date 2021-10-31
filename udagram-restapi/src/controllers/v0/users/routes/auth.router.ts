import { Router, Request, Response } from 'express';

import { User } from '../models/User';

import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { NextFunction } from 'connect';

import * as EmailValidator from 'email-validator';
import { config } from '../../../../config/config';

const router: Router = Router();

const saltRounds = 10;

async function generateHashedPassword(plainTextPassword: string): Promise<string> {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(plainTextPassword, salt);

    return hash;
}

async function comparePasswords(plainTextPassword: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(plainTextPassword, hash);
}

function generateJWT(user: User): string {
    return jwt.sign(user.toJSON(), config.jwt.secret);
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
    if (!req.headers || !req.headers.authorization) {
        return res.status(401).send({ message: 'No authorization headers.' });
    }

    const token_bearer = req.headers.authorization.split(' '); // eg "Bearer adflnfovinsvihuadjvnkjl"

    if (token_bearer.length != 2) {
        return res.status(401).send({ message: 'Malformed token.' });
    }

    const token = token_bearer[1];

    return jwt.verify(token, config.jwt.secret, (err, decoded) => {
        if (err) {
            return res.status(500).send({ auth: false, message: 'Failed to authenticate.' });
        }
        return next();
    });
}

router.get('/verification', requireAuth, async (req: Request, res: Response) => {
    return res.status(200).send({ auth: true, message: 'Authenticated.' });
});

router.post('/login', async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    if (!password) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);

    if (!user) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    const authValid = await comparePasswords(password, user.password_hash);

    if (!authValid) {
        return res.status(401).send({ auth: false, message: 'Unauthorized' });
    }

    const jwt = generateJWT(user);

    res.status(200).send({ auth: true, token: jwt, user: user.short() });
});

// register a new user
// is /api/v0/users/auth/
router.post('/', async (req: Request, res: Response) => {
    const email = req.body.email;
    const plainTextPassword = req.body.password;

    if (!email || !EmailValidator.validate(email)) {
        return res.status(400).send({ auth: false, message: 'Email is required or malformed' });
    }

    if (!plainTextPassword) {
        return res.status(400).send({ auth: false, message: 'Password is required' });
    }

    const user = await User.findByPk(email);

    if (user) {
        return res.status(422).send({ auth: false, message: 'User may already exist' });
    }

    const password_hash = await generateHashedPassword(plainTextPassword);

    const newUser = await new User({
        email: email,
        password_hash: password_hash,
    });

    let savedUser;

    try {
        savedUser = await newUser.save();
    } catch (e) {
        throw e;
    }

    // Generate JWT
    const jwt = generateJWT(savedUser);

    res.status(201).send({ token: jwt, user: savedUser.short() });
});

router.get('/', async (req: Request, res: Response) => {
    res.send('hello Auth route');
});

export const AuthRouter: Router = router;