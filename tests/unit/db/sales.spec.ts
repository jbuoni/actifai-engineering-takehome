import { Pool } from 'pg';
import { jest } from '@jest/globals';
import { 
    addSaleForUser,
    deleteSalesByUserId,
    getGroupSalesAfterDate,
    getGroupSalesByDate,
    getGroupSalesGroupedByTime,
    getSalesAfterDate,
    getSalesByDate,
    getSalesByGroupId,
    getSalesByUserId,
    getSalesByUserIdTimeframe,
    getSalesGroupedByTime
} from '../../../db/sales';

jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mClient) };
});

describe('Sales Database Functions', () => {
    let mockClient: jest.Mocked<Pool>;

    beforeEach(() => {
        mockClient = new Pool() as jest.Mocked<Pool>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getSalesByDate', () => {

        it('should return sales data grouped by user within the specified date range', async () => {
            const mockRows = [
                { id: '1', name: 'User A', total_sales: 100, avg_sales: 50 },
                { id: '2', name: 'User B', total_sales: 200, avg_sales: 100 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));
    
            const startDate = '2023-01-01';
            const endDate = '2023-01-31';
            const result = await getSalesByDate(startDate, endDate);
    
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY u.id, u.name
        ORDER BY total_sales DESC
    `);
            expect(result).toEqual(mockRows);
        });
    
        it('should return an empty array if no sales data is found within the specified date range', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));
    
            const startDate = '2023-01-01';
            const endDate = '2023-01-31';
            const result = await getSalesByDate(startDate, endDate);
    
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY u.id, u.name
        ORDER BY total_sales DESC
    `);
            expect(result).toEqual([]);
        });
    });
    
    describe('getSalesByUserId', () => {
    
        it('should return sales data for the specified user ID', async () => {
            const mockRows = [
                { id: '1', user_id: '123', amount: 100, date: '2023-01-01' },
                { id: '2', user_id: '123', amount: 200, date: '2023-01-02' },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));
    
            const userId = '123';
            const result = await getSalesByUserId(userId);
    
            expect(mockClient.query).toHaveBeenCalledWith(`SELECT * FROM sales WHERE user_id = ${userId}`);
            expect(result).toEqual(mockRows);
        });
    
        it('should return an empty array if no sales data is found for the specified user ID', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));
    
            const userId = '123';
            const result = await getSalesByUserId(userId);
    
            expect(mockClient.query).toHaveBeenCalledWith(`SELECT * FROM sales WHERE user_id = ${userId}`);
            expect(result).toEqual([]);
        });
    });
    
    describe('getSalesByUserIdTimeframe', () => {
        it('should return sales data grouped by month for the specified user ID', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023-01', total_sales: 300, avg_sales: 150 },
                { id: '2', name: 'User A', sale_date: '2023-02', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const userId = '123';
            const timeframe = 'month';
            const result = await getSalesByUserIdTimeframe(userId, timeframe);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return sales data grouped by year for the specified user ID', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023', total_sales: 700, avg_sales: 350 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const userId = '123';
            const timeframe = 'year';
            const result = await getSalesByUserIdTimeframe(userId, timeframe);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), 'YYYY') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no sales data is found for the specified user ID and timeframe', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const userId = '123';
            const timeframe = 'month';
            const result = await getSalesByUserIdTimeframe(userId, timeframe);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const userId = '123';
            const timeframe = 'month';

            await expect(getSalesByUserIdTimeframe(userId, timeframe)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${timeframe}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE u.id = ${userId}
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
        });
    });

    describe('addSaleForUser', () => {
    
        it('should add a sale for the specified user and return the inserted sale', async () => {
            const mockRow = { id: '1', user_id: '123', amount: 100, date: '2023-01-01' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockRow] }));
    
            const userId = '123';
            const amount = 100;
            const date = '2023-01-01';
            const result = await addSaleForUser(userId, amount, date);
    
            expect(mockClient.query).toHaveBeenCalledWith(
            `INSERT INTO sales (user_id, amount, date)
            VALUES (${userId}, ${amount}, '${date}')
            RETURNING *`
        );
            expect(result).toEqual(mockRow);
        });
    });
    
    describe('deleteSalesByUserId', () => {
        let mockClient: jest.Mocked<Pool>;
    
        beforeEach(() => {
            mockClient = new Pool() as jest.Mocked<Pool>;
        });
    
        afterEach(() => {
            jest.clearAllMocks();
        });
    
        it('should delete sales for the specified user ID and return the number of rows deleted', async () => {
            const mockResult = { id: '1', user_id: '123', amount: 100, date: '2023-01-01' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockResult] }));
    
            const userId = '123';
            await deleteSalesByUserId(userId);
    
            expect(mockClient.query).toHaveBeenCalledWith(`DELETE FROM sales WHERE id = ${userId} RETURNING *`);
        });
    
    });
    
    describe('getSalesGroupedByTime', () => {
    
        it('should return sales data grouped by month', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023-01', total_sales: 100, avg_sales: 50 },
                { id: '2', name: 'User B', sale_date: '2023-01', total_sales: 200, avg_sales: 100 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));
    
            const time = 'month';
            const result = await getSalesGroupedByTime(time);
    
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });
    
        it('should return sales data grouped by year', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023', total_sales: 300, avg_sales: 150 },
                { id: '2', name: 'User B', sale_date: '2023', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));
    
            const time = 'year';
            const result = await getSalesGroupedByTime(time);
    
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });
    
        it('should return an empty array if no sales data is found', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));
    
            const time = 'month';
            const result = await getSalesGroupedByTime(time);
    
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual([]);
        });
    
        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));
    
            const time = 'month';
    
            await expect(getSalesGroupedByTime(time)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
        });
    });
    
    describe('getSalesAfterDate', () => {
        it('should return sales data grouped by month after the specified start date', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023-01', total_sales: 300, avg_sales: 150 },
                { id: '2', name: 'User B', sale_date: '2023-01', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const startDate = '2023-01-01';
            const time = 'month';
            const result = await getSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date >= '${startDate}'
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return sales data grouped by year after the specified start date', async () => {
            const mockRows = [
                { id: '1', name: 'User A', sale_date: '2023', total_sales: 300, avg_sales: 150 },
                { id: '2', name: 'User B', sale_date: '2023', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const startDate = '2023-01-01';
            const time = 'year';
            const result = await getSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date >= '${startDate}'
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no sales data is found after the specified start date for the given time grouping', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const startDate = '2023-01-01';
            const time = 'month';
            const result = await getSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date >= '${startDate}'
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully when grouping by time', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const startDate = '2023-01-01';
            const time = 'month';

            await expect(getSalesAfterDate(startDate, time)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT u.id, u.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM users u
        JOIN sales s ON u.id = s.user_id
        WHERE s.date >= '${startDate}'
        GROUP BY u.id, u.name, sale_date
        ORDER BY sale_date DESC
    `);
        });
    });

    describe('getSalesByGroupId', () => {
        it('should return sales data for the specified group ID', async () => {
            const mockRows = [
                { id: '1', user_id: '123', amount: 100, date: '2023-01-01', name: 'Group A' },
                { id: '2', user_id: '124', amount: 200, date: '2023-01-02', name: 'Group A' },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const groupId = '1';
            const result = await getSalesByGroupId(groupId);

            expect(mockClient.query).toHaveBeenCalledWith(`
    SELECT s.*, g.name FROM sales s
    JOIN user_groups ug ON ug.user_id = s.user_id
    JOIN groups g ON g.id = ug.group_id
    WHERE g.id = ${groupId}
    ORDER BY s.date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no sales data is found for the specified group ID', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const groupId = '1';
            const result = await getSalesByGroupId(groupId);

            expect(mockClient.query).toHaveBeenCalledWith(`
    SELECT s.*, g.name FROM sales s
    JOIN user_groups ug ON ug.user_id = s.user_id
    JOIN groups g ON g.id = ug.group_id
    WHERE g.id = ${groupId}
    ORDER BY s.date DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const groupId = '1';

            await expect(getSalesByGroupId(groupId)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
    SELECT s.*, g.name FROM sales s
    JOIN user_groups ug ON ug.user_id = s.user_id
    JOIN groups g ON g.id = ug.group_id
    WHERE g.id = ${groupId}
    ORDER BY s.date DESC
    `);
        });
    });

    describe('getGroupSalesAfterDate', () => {
        it('should return group sales data grouped by month after the specified start date', async () => {
            const mockRows = [
                { name: 'Group A', sale_date: '2023-01', total_sales: 300, avg_sales: 150 },
                { name: 'Group B', sale_date: '2023-01', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const startDate = '2023-01-01';
            const time = 'month';
            const result = await getGroupSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date >= '${startDate}'
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return group sales data grouped by year after the specified start date', async () => {
            const mockRows = [
                { name: 'Group A', sale_date: '2023', total_sales: 300, avg_sales: 150 },
                { name: 'Group B', sale_date: '2023', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const startDate = '2023-01-01';
            const time = 'year';
            const result = await getGroupSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date >= '${startDate}'
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no group sales data is found after the specified start date', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const startDate = '2023-01-01';
            const time = 'month';
            const result = await getGroupSalesAfterDate(startDate, time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date >= '${startDate}'
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const startDate = '2023-01-01';
            const time = 'month';

            await expect(getGroupSalesAfterDate(startDate, time)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date >= '${startDate}'
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
        });
    });

    describe('getGroupSalesByDate', () => {
        it('should return group sales data grouped by name within the specified date range', async () => {
            const mockRows = [
                { name: 'Group A', total_sales: 300, avg_sales: 150 },
                { name: 'Group B', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const startDate = '2023-01-01';
            const endDate = '2023-01-31';
            const result = await getGroupSalesByDate(startDate, endDate);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY g.name
        ORDER BY total_sales DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no group sales data is found within the specified date range', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const startDate = '2023-01-01';
            const endDate = '2023-01-31';
            const result = await getGroupSalesByDate(startDate, endDate);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY g.name
        ORDER BY total_sales DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const startDate = '2023-01-01';
            const endDate = '2023-01-31';

            await expect(getGroupSalesByDate(startDate, endDate)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            SUM(s.amount) as total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        WHERE s.date BETWEEN '${startDate}' AND '${endDate}'
        GROUP BY g.name
        ORDER BY total_sales DESC
    `);
        });
    });


    describe('getGroupSalesGroupedByTime', () => {
        it('should return group sales data grouped by month', async () => {
            const mockRows = [
                { name: 'Group A', sale_date: '2023-01', total_sales: 300, avg_sales: 150 },
                { name: 'Group B', sale_date: '2023-01', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const time = 'month';
            const result = await getGroupSalesGroupedByTime(time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return group sales data grouped by year', async () => {
            const mockRows = [
                { name: 'Group A', sale_date: '2023', total_sales: 300, avg_sales: 150 },
                { name: 'Group B', sale_date: '2023', total_sales: 400, avg_sales: 200 },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockRows }));

            const time = 'year';
            const result = await getGroupSalesGroupedByTime(time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual(mockRows);
        });

        it('should return an empty array if no group sales data is found for the specified time grouping', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const time = 'month';
            const result = await getGroupSalesGroupedByTime(time);

            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
            expect(result).toEqual([]);
        });

        it('should handle database query errors gracefully', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            const time = 'month';

            await expect(getGroupSalesGroupedByTime(time)).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(`
        SELECT g.name,
            TO_CHAR(DATE_TRUNC('${time}', s.date), 'YYYY-MM') AS sale_date,
            SUM(s.amount) AS total_sales,
            AVG(s.amount)::NUMERIC(10,2) AS avg_sales
        FROM sales s
        JOIN user_groups ug ON ug.user_id = s.user_id
        JOIN groups g ON g.id = ug.group_id
        GROUP BY g.name, sale_date
        ORDER BY sale_date DESC
    `);
        });
    });
})
