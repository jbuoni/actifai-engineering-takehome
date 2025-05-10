import { getSalesByDate, getSalesGroupedByTime } from '../db/sales';
import * as express from 'express';

const router = express.Router();

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


// Get sales data grouped by user and date
router.get('/:timeframe', async (req, res) => {  
    const { timeframe } = req.params;
    if (timeframe !== 'month' && timeframe !== 'year') {
        return res.status(400).json({ error: 'Invalid timeframe. Use "month" or "year".' });
    }

    console.log(`Get sales data grouped by user and ${timeframe}`);

    try {
        const salesData = await getSalesGroupedByTime(timeframe);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;