import { addSaleForUser, deleteSalesByUserId } from '../db/sales';
import * as express from 'express';

const router = express.Router();

// Add a new sale for a user
router.post('/add', async (req, res) => {
    const { userId, amount, date } = req.body;

    if (!userId || !amount || !date) {
        return res.status(400).json({ error: 'Missing required fields: userId, amount, date' });
    }

    try {
        const newSale = await addSaleForUser(userId, amount, date);
        res.status(201).json(newSale);
    } catch (error) {
        console.error('Error adding sale:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a sale by user ID
router.delete('/delete/:saleId', async (req, res) => {
    const { saleId } = req.params;

    if ( !saleId) {
        return res.status(400).json({ error: 'Missing required parameter saleId' });
    }

    try {
        const result = await deleteSalesByUserId(saleId);
        if (result) {
            res.status(200).json({ message: 'Sale deleted successfully' });
        } else {
            res.status(404).json({ error: 'Sale not found' });
        }
    } catch (error) {
        console.error('Error deleting sale:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;