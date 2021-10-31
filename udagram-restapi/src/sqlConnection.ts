import { Sequelize } from 'sequelize-typescript';
import { config } from './config/config';
const c = config.dev;

// IDEA: host could come from config
const URI = `postgres://${c.username}:${c.password}@${c.database}.cm4zsmcet6a5.us-west-2.rds.amazonaws.com:5432/postgres`;

export const sqlConnect = new Sequelize(URI);
