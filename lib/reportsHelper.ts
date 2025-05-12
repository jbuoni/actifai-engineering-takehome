import { getSalesByGroupIdTimeframe, getSalesByUserIdTimeframe } from "../db/sales";


const _getSalesFilteredByYear = (salesData, year) => {
    return salesData.filter(sale => {
        const saleYear = new Date(sale.date).getFullYear();
        return saleYear == year;
    });
}

const _getTotalSalesMetrics = (salesData) => {
    const totalSales = salesData.reduce((acc, sale) => acc + sale.amount, 0);
    const totalSalesCount = salesData.length;
    return {
        totalSales,
        totalSalesCount,
    };
}

const comprehensiveUserReport = async (user, salesData, userGroups, year) => {
    const { id, name, role } = user;
    const salesFilteredByYear = _getSalesFilteredByYear(salesData, year);

    const salesByMonth = await getSalesByUserIdTimeframe(id, 'month');

    return {
        userInformation: {
            userId: id,
            userName: name,
            userRole: role,
        },
        groups: userGroups,
        salesData: {
            salesByMonth: salesByMonth.map(sale => ({
                month: sale.sale_date,
                totalSales: sale.total_sales,
                avgSales: sale.avg_sales,
                numSales: sale.num_sales,
            })),
            individualSales: salesFilteredByYear,
        },
        ..._getTotalSalesMetrics(salesFilteredByYear),
    };
}

const comprehensiveGroupReport = async (group, salesData, groupUsers, year) => {
    const { id, name } = group;
    const salesFilteredByYear = salesData.filter(sale => {
        const saleYear = new Date(sale.date).getFullYear();
        return saleYear == year;
    });

    const salesByMonth = await getSalesByGroupIdTimeframe(id, 'month');

    const usersWithComprehensiveSales = await Promise.all(groupUsers.map(async (user) => {
        const userSalesFilteredByYear = _getSalesFilteredByYear(user.sales, year);
    
        const salesByMonth = await getSalesByUserIdTimeframe(user.id, 'month');

        return {
            userInformation: {
                userId: user.id,
                userName: user.name,
                userRole: user.role,
            },
            salesData: {
                salesByMonth: salesByMonth.map(sale => ({
                    month: sale.sale_date,
                    totalSales: sale.total_sales,
                    avgSales: sale.avg_sales,
                    numSales: sale.num_sales,
                })),
                individualSales: salesFilteredByYear,
            },
            ..._getTotalSalesMetrics(userSalesFilteredByYear),
        };
    }));

    return {
        groupInformation: {
            groupId: id,
            groupName: name,
        },
        users: usersWithComprehensiveSales,
        salesData: {
            salesByMonth: salesByMonth.map(sale => ({
                month: sale.sale_date,
                totalSales: sale.total_sales,
                avgSales: sale.avg_sales,
                numSales: sale.num_sales,
            })),
            groupSales: salesFilteredByYear,
        },
        ..._getTotalSalesMetrics(salesFilteredByYear),
    };
}


export {
    _getSalesFilteredByYear,
    _getTotalSalesMetrics,
    comprehensiveUserReport,
    comprehensiveGroupReport 
};