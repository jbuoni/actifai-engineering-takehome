import { pool } from './pool';

const getSalesByUserId = async (userId: string) => {
    try {
        const res = await pool.query(`SELECT * FROM sales WHERE user_id = ${userId}`);
        return res?.rows;
    } catch (err) {
        console.error(err);
    }
};

const addSaleForUser = async (userId: string, amount: number, date: string) => {
    try {
        const res = await pool.query(
            `INSERT INTO sales (user_id, amount, date) VALUES (${userId}, ${amount}, '${date}') RETURNING *`
        );
        return res?.rows[0];
    } catch (err) {
        console.error(err);
    }
};

const deleteSalesByUserId = async (userId: string) => {
    try {
        await pool.query(`DELETE FROM sales WHERE user_id = ${userId}`);
    } catch (err) {
        console.error(err);
    }
};

const getSalesByDate = async (startDate: string, endDate: string) => {
    const query = `
        SELECT u.id, u.name, SUM(s.amount) as total_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY u.id, u.name
        ORDER BY total_sales DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

const getSalesGroupedByTime = async (time: 'month' | 'year') => {

    let timeFormat = 'YYYY-MM';

    if (time === 'year') {
        timeFormat = 'YYYY';
    }

    const query = `
        SELECT u.id, u.name, TO_CHAR(DATE_TRUNC('${time}', s.date), '${timeFormat}') AS ${time}, SUM(s.amount) AS total_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, ${time}
        ORDER BY ${time} DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

export { 
    getSalesByUserId,
    addSaleForUser,
    deleteSalesByUserId,
    getSalesByDate,
    getSalesGroupedByTime
};