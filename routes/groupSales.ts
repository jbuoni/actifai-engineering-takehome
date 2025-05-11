import { createReturnByDate } from '../lib/salesHelpers';
import { 
    getSalesGroupedByTime,
    getGroupSalesAfterDate,
    getGroupSalesByDate,
    getSalesByGroupId, 
    getGroupSalesGroupedByTime,
    getSalesByGroupIdTimeframe
} from '../db/sales';
import * as express from 'express';

const router = express.Router();

// Get sales by group
router.get('/group/:groupId', async (req, res) => {
    const groupId = req.params.groupId;
    console.log(`Get sales data for group: ${groupId}`);
    try {
        const salesData = await getSalesByGroupId(groupId);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/group/:groupId/:timeframe', async (req, res) => {
    const { groupId, timeframe } = req.params;
    console.log(`Get sales data for user: ${groupId} for timeframe: ${timeframe}`);
    try {
        const salesData = await getSalesByGroupIdTimeframe(groupId, timeframe);
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
        const salesData = await getGroupSalesAfterDate(startDate, timeframe);
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
        const salesData = await getGroupSalesByDate(startDate, endDate);
        res.json(salesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// Get sales data grouped by group and date
router.get('/range/:timeframe', async (req, res) => {  
    const { timeframe } = req.params;
    console.log(`Get sales data grouped by group and ${timeframe}`);

    if (timeframe !== 'month' && timeframe !== 'year') {
        return res.status(400).json({ error: 'Invalid timeframe. Use "month" or "year".' });
    }

    try {
        const salesData = await getGroupSalesGroupedByTime(timeframe);
        const formattedSalesData = createReturnByDate(salesData)
        res.json(formattedSalesData);
    } catch (error) {
        console.error('Error fetching sales data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});


module.exports = router;