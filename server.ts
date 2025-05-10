'use strict';

require('dotenv').config();

import * as express from 'express';
import * as bodyParser from 'body-parser';

import * as UserRoutes from './routes/user';
import * as SalesRoutes from './routes/sales';

const seeder = require('./seed');

// Constants
const PORT = process.env['PORT'];
const HOST = process.env['HOST'];

async function start() {
  // Seed the database
  await seeder.seedDatabase();
  // App
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: true}));

  // Health check
  app.get('/health', (req, res) => {
    res.send('Hello World');
  });

  // Write your endpoints here
  app.use('/users', UserRoutes);
  app.use('/sales', SalesRoutes);

  app.listen(PORT, HOST);
  console.log(`Server is running on http://${HOST}:${PORT}`);
}

start();
