import { 
    _getSalesFilteredByYear,
    _getTotalSalesMetrics,
    comprehensiveGroupReport,
    comprehensiveUserReport 
} from "../../../lib/reportsHelper";
import { Pool } from 'pg';

jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mClient) };
});

describe("_getSalesFilteredByYear", () => {
    const mockSalesData = [
        { date: "2023-01-15", amount: 100 },
        { date: "2023-02-20", amount: 200 },
        { date: "2022-12-10", amount: 150 },
    ];

    it("should filter sales data by the given year", () => {
        const result = _getSalesFilteredByYear(mockSalesData, 2023);

        expect(result).toEqual([
            { date: "2023-01-15", amount: 100 },
            { date: "2023-02-20", amount: 200 },
        ]);
    });

    it("should return an empty array if no sales match the given year", () => {
        const result = _getSalesFilteredByYear(mockSalesData, 2021);

        expect(result).toEqual([]);
    });

    it("should handle an empty sales data array", () => {
        const result = _getSalesFilteredByYear([], 2023);

        expect(result).toEqual([]);
    });

    it("should handle sales data with invalid dates gracefully", () => {
        const invalidSalesData = [
            { date: "invalid-date", amount: 100 },
            { date: "2023-02-20", amount: 200 },
        ];

        const result = _getSalesFilteredByYear(invalidSalesData, 2023);

        expect(result).toEqual([
            { date: "2023-02-20", amount: 200 },
        ]);
    });
});

describe("_getTotalSalesMetrics", () => {
    it("should calculate total sales and total sales count correctly", () => {
        const mockSalesData = [
            { amount: 100 },
            { amount: 200 },
            { amount: 300 },
        ];

        const result = _getTotalSalesMetrics(mockSalesData);

        expect(result).toEqual({
            totalSales: 600,
            totalSalesCount: 3,
        });
    });

    it("should return zero for total sales and total sales count when sales data is empty", () => {
        const result = _getTotalSalesMetrics([]);

        expect(result).toEqual({
            totalSales: 0,
            totalSalesCount: 0,
        });
    });

});

describe("comprehensiveUserReport", () => {

    let mockClient: jest.Mocked<Pool>;

    const mockUser = {
        id: 1,
        name: "John Doe",
        role: "Salesperson",
    };

    const mockSalesData = [
        { date: "2023-01-15", amount: 100 },
        { date: "2023-02-20", amount: 200 },
        { date: "2022-12-10", amount: 150 },
    ];

    const mockUserGroups = ["Group A", "Group B"];
    const mockYear = 2023;

    const mockSalesByMonth = [
        { sale_date: "2023-01", total_sales: 1000, avg_sales: 100, num_sales: 10 },
        { sale_date: "2023-02", total_sales: 2000, avg_sales: 200, num_sales: 10 },
    ];

    beforeEach(() => {
        mockClient = new Pool() as jest.Mocked<Pool>;
        const mock = jest.spyOn(mockClient, 'query');
        mock.mockImplementation(() => Promise.resolve({ rows: mockSalesByMonth }));

    });

    afterEach(() => {
        jest.clearAllMocks();
    });


    it("should return a comprehensive report for the user", async () => {
        const result = await comprehensiveUserReport(mockUser, mockSalesData, mockUserGroups, mockYear);

        expect(result).toEqual({
            userInformation: {
                userId: mockUser.id,
                userName: mockUser.name,
                userRole: mockUser.role,
            },
            groups: mockUserGroups,
            salesData: {
                salesByMonth: mockSalesByMonth.map(sale => ({
                    month: sale.sale_date,
                    totalSales: sale.total_sales,
                    avgSales: sale.avg_sales,
                    numSales: sale.num_sales,
                })),
                individualSales: [
                    { date: "2023-01-15", amount: 100 },
                    { date: "2023-02-20", amount: 200 },
                ],
            },
            totalSales: 300,
            totalSalesCount: 2,
        });
    });

    it("should filter sales data by the given year", async () => {
        const result = await comprehensiveUserReport(mockUser, mockSalesData, mockUserGroups, mockYear);

        expect(result.salesData.individualSales).toEqual([
            { date: "2023-01-15", amount: 100 },
            { date: "2023-02-20", amount: 200 },
        ]);
    });

    it("should calculate total sales and total sales count correctly", async () => {
        const result = await comprehensiveUserReport(mockUser, mockSalesData, mockUserGroups, mockYear);

        expect(result.totalSales).toBe(300);
        expect(result.totalSalesCount).toBe(2);
    });
});

describe("comprehensiveGroupReport", () => {
    let mockClient: jest.Mocked<Pool>;

    const mockGroup = {
        id: 1,
        name: "Group A",
    };

    const mockSalesData = [
        { date: "2023-01-15", amount: 100 },
        { date: "2023-02-20", amount: 200 },
        { date: "2022-12-10", amount: 150 },
    ];

    const mockGroupUsers = [
        {
            id: 1,
            name: "John Doe",
            role: "Salesperson",
            sales: [
                { date: "2023-01-15", amount: 50 },
                { date: "2023-02-20", amount: 150 },
            ],
        },
        {
            id: 2,
            name: "Jane Smith",
            role: "Manager",
            sales: [
                { date: "2023-01-10", amount: 100 },
                { date: "2023-02-25", amount: 200 },
            ],
        },
    ];

    const mockYear = 2023;

    const mockSalesByMonth = [
        { sale_date: "2023-01", total_sales: 1000, avg_sales: 100, num_sales: 10 },
        { sale_date: "2023-02", total_sales: 2000, avg_sales: 200, num_sales: 10 },
    ];

    beforeEach(() => {
        mockClient = new Pool() as jest.Mocked<Pool>;
        const mock = jest.spyOn(mockClient, 'query');
        mock.mockImplementation(() => Promise.resolve({ rows: mockSalesByMonth }));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it("should return a comprehensive report for the group", async () => {
        const result = await comprehensiveGroupReport(mockGroup, mockSalesData, mockGroupUsers, mockYear);

        expect(result).toEqual({
            groupInformation: {
                groupId: mockGroup.id,
                groupName: mockGroup.name,
            },
            users: [
                {
                    userInformation: {
                        userId: 1,
                        userName: "John Doe",
                        userRole: "Salesperson",
                    },
                    salesData: {
                        salesByMonth: mockSalesByMonth.map(sale => ({
                            month: sale.sale_date,
                            totalSales: sale.total_sales,
                            avgSales: sale.avg_sales,
                            numSales: sale.num_sales,
                        })),
                        individualSales: [
                            { date: "2023-01-15", amount: 100 },
                            { date: "2023-02-20", amount: 200 },
                        ],
                    },
                    totalSales: 200,
                    totalSalesCount: 2,
                },
                {
                    userInformation: {
                        userId: 2,
                        userName: "Jane Smith",
                        userRole: "Manager",
                    },
                    salesData: {
                        salesByMonth: mockSalesByMonth.map(sale => ({
                            month: sale.sale_date,
                            totalSales: sale.total_sales,
                            avgSales: sale.avg_sales,
                            numSales: sale.num_sales,
                        })),
                        individualSales: [
                            { date: "2023-01-15", amount: 100 },
                            { date: "2023-02-20", amount: 200 },
                        ],
                    },
                    totalSales: 300,
                    totalSalesCount: 2,
                },
            ],
            salesData: {
                salesByMonth: mockSalesByMonth.map(sale => ({
                    month: sale.sale_date,
                    totalSales: sale.total_sales,
                    avgSales: sale.avg_sales,
                    numSales: sale.num_sales,
                })),
                groupSales: [
                    { date: "2023-01-15", amount: 100 },
                    { date: "2023-02-20", amount: 200 },
                ],
            },
            totalSales: 300,
            totalSalesCount: 2,
        });
    });

    it("should filter group sales data by the given year", async () => {
        const result = await comprehensiveGroupReport(mockGroup, mockSalesData, mockGroupUsers, mockYear);

        expect(result.salesData.groupSales).toEqual([
            { date: "2023-01-15", amount: 100 },
            { date: "2023-02-20", amount: 200 },
        ]);
    });

    it("should calculate total sales and total sales count for the group correctly", async () => {
        const result = await comprehensiveGroupReport(mockGroup, mockSalesData, mockGroupUsers, mockYear);

        expect(result.totalSales).toBe(300);
        expect(result.totalSalesCount).toBe(2);
    });

    it("should include comprehensive sales data for each user in the group", async () => {
        const result = await comprehensiveGroupReport(mockGroup, mockSalesData, mockGroupUsers, mockYear);

        expect(result.users).toHaveLength(2);
        expect(result.users[0].userInformation.userName).toBe("John Doe");
        expect(result.users[1].userInformation.userName).toBe("Jane Smith");
    });
});
