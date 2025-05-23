'use strict';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as dotenv from 'dotenv';

import * as UserRoutes from './routes/user';
import * as SalesRoutes from './routes/sales';
import * as GroupRoutes from './routes/groups';
import * as ReportsRoutes from './routes/reports';
import * as GroupSalesRoutes from './routes/groupSales';
import * as AgentSalesRoutes from './routes/agentSales';

dotenv.config();

const seeder = require('./seed'); // eslint-disable-line

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
  app.use('/groups', GroupRoutes);
  app.use('/reports', ReportsRoutes);
  app.use('/sales/agents', AgentSalesRoutes);
  app.use('/sales/groups', GroupSalesRoutes);

  app.listen(PORT, HOST);
  console.log(`Server is running on http://${HOST}:${PORT}`);
}

start();
