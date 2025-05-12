const createReturnByDate = (inputJson) => {
    const formatted = {}

    inputJson.forEach(item => {
        const { sale_date, ...rest } = item

        if (!formatted[sale_date]) {
            formatted[sale_date] = []
        }
        formatted[sale_date].push(rest)
    })

    return formatted
}

const getTimeFormat = (time: 'month' | 'year') => {
    let timeFormat = 'YYYY-MM';

    if (time === 'year') {
        timeFormat = 'YYYY';
    }
    return timeFormat
}

export { createReturnByDate, getTimeFormat }