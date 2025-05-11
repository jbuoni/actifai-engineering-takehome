import { getTimeFormat } from '../lib/salesHelpers';
import { pool } from './pool';

const getSalesByUserId = async (userId: string) => {
    try {
        const res = await pool.query(`SELECT * FROM sales WHERE user_id = ${userId}`);
        return res?.rows;
    } catch (err) {
        console.error(err);
    }
};

const getSalesByUserIdTimeframe = async (userId: string, timeframe: 'month' | 'year') => {
    const timeFormat = getTimeFormat(timeframe);
    const query = `
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

const addSaleForUser = async (userId: string, amount: number, date: string) => {
    try {
        const res = await pool.query(
            `INSERT INTO sales (user_id, amount, date)
            VALUES (${userId}, ${amount}, '${date}')
            RETURNING *`
        );
        return res?.rows[0];
    } catch (err) {
        console.error(err);
    }
};

const deleteSalesByUserId = async (saleId: string) => {
    try {
        const res = await pool.query(`DELETE FROM sales WHERE id = ${saleId} RETURNING *`);
        return res?.rows[0];
    } catch (err) {
        console.error(err);
    }
};

const getSalesByDate = async (startDate: string, endDate: string) => {
    const query = `
        SELECT u.id, u.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
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

    const timeFormat = getTimeFormat(time);

    const query = `
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

const getSalesAfterDate = async (startDate: string, time: 'month' | 'year') => {
    const timeFormat = getTimeFormat(time);

    const query = `
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date >= '${startDate}'
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

const getSalesByGroupId = async (groupId: string) => {
    const query = `
    SELECT s.*, g.name FROM sales s
    JOIN user_groups ug ON ug.user_id = s.user_id
    JOIN groups g ON g.id = ug.group_id
    WHERE g.id = ${groupId}
    ORDER BY s.date DESC
    `
    const result = await pool.query(query);
    return result.rows;
}

const getSalesByGroupIdTimeframe = async (userId: string, timeframe: 'month' | 'year') => {
    const timeFormat = getTimeFormat(timeframe);
    const query = `
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `;
    const result = await pool.query(query);
    return result.rows;
}

const getGroupSalesAfterDate = async (startDate: string, time: 'month' | 'year') => {
    const timeFormat = getTimeFormat(time);

    const query = `
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date >= '${startDate}'
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

const getGroupSalesByDate = async (startDate: string, endDate: string) => {
    const query = `
        SELECT g.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY g.name
        ORDER BY total_sales DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}

const getGroupSalesGroupedByTime = async (time: 'month' | 'year') => {

    const timeFormat = getTimeFormat(time);

    const query = `
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), '${timeFormat}') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `;

    const result = await pool.query(query);
    return result.rows;
}


export { 
    getSalesByUserId,
    getSalesByUserIdTimeframe,
    addSaleForUser,
    deleteSalesByUserId,
    getSalesByDate,
    getSalesGroupedByTime,
    getSalesAfterDate,
    getSalesByGroupId,
    getGroupSalesAfterDate,
    getGroupSalesByDate,
    getSalesByGroupIdTimeframe
    ,getGroupSalesGroupedByTime
};