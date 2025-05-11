import { createReturnByDate } from '../lib/salesHelpers';
import { getSalesByDate, getSalesGroupedByTime, getSalesAfterDate, getSalesByUserId, getSalesByUserIdTimeframe } from '../db/sales';
import * as express from 'express';
import { time } from 'console';

const router = express.Router();

router.get('/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    console.log(`Get sales data for user: ${userId}`);
    try {
        const salesData = await getSalesByUserId(userId);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/user/:userId/:timeframe', async (req, res) => {
    const { userId, timeframe } = req.params;
    console.log(`Get sales data for user: ${userId} for timeframe: ${timeframe}`);
    try {
        const salesData = await getSalesByUserIdTimeframe(userId, timeframe);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

// Get sales data grouped by user after start date
router.get('/after/:startDate/:timeframe', async (req, res) => {  
    const { startDate, timeframe } = req.params;
    console.log(`Get sales data grouped by user after ${startDate}`);
    try {
        const salesData = await getSalesAfterDate(startDate, timeframe);
        const formattedSalesData = createReturnByDate(salesData)
        res.json(formattedSalesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get sales data grouped by user and date
router.get('/range/:timeframe', async (req, res) => {  
    const { timeframe } = req.params;
    if (timeframe !== 'month' && timeframe !== 'year') {
        return res.status(400).json({ error: 'Invalid timeframe. Use "month" or "year".' });
    }

    console.log(`Get sales data grouped by user and ${timeframe}`);

    try {
        const salesData = await getSalesGroupedByTime(timeframe);
        const formattedSalesData = createReturnByDate(salesData)
        res.json(formattedSalesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get sales data grouped by user and date
router.get('/range/:startDate/:endDate', async (req, res) => {  
    const { startDate, endDate } = req.params;
    console.log(`Get sales data grouped by user for date range: ${startDate} to ${endDate}`);
    try {
        const salesData = await getSalesByDate(startDate, endDate);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;