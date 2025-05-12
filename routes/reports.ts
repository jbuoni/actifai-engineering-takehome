import { comprehensiveGroupReport, comprehensiveUserReport } from '../lib/reportsHelper';
import { getGroupById, getGroupsByUserId, getUsersByGroupId } from '../db/groups';
import { getSalesByGroupId, getSalesByUserId } from '../db/sales';
import { getUserById } from '../db/users';

import { Router } from 'express';

const router = Router();

/**
 * GET route for user reports
 * Returns comprehensive reports for a specific user
 * These are for full reports, and therefore the user should understand
 * that performance will be slower than other metric routes.
 * 
 * NOTE: As we get larger datasets, we may wan this to be done as a stream
 */
router.get('/user/:userId/:year', async (req, res) => {
    const { userId, year } = req.params;
    try {
        console.log(`Fetching reports for user: ${userId}`);

        const user = await getUserById(userId);
        const userSales = await getSalesByUserId(userId);
        const userGroups = await getGroupsByUserId(userId);

        const report = await comprehensiveUserReport(user, userSales, userGroups, year);

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: `Failed to fetch reports` });
    }
});

// GET route for group reports
router.get('/group/:groupId/:year', async (req, res) => {
    const { groupId, year } = req.params;
    try {
        console.log(`Fetching reports for group: ${groupId} for year: ${year}`);
        
        const users = await getUsersByGroupId(groupId);
        const groupSales = await getSalesByGroupId(groupId);
        const group = await getGroupById(groupId);

        const usersWithSalesPromises = users.map(async(user) => {
            const userSales = await getSalesByUserId(user.id);
            return { ...user, sales: userSales };
        });

        const usersWithSales = await Promise.all(usersWithSalesPromises);

        const report = await comprehensiveGroupReport(group, groupSales, usersWithSales, year);

        res.status(200).json({ success: true, data: report });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Failed to fetch group reports' });
    }
});

module.exports = router;