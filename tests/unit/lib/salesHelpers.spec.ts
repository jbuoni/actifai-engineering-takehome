import { createReturnByDate, getTimeFormat } from '../../../lib/salesHelpers';

describe('createReturnByDate', () => {
    it('should group items by date', () => {
        const input = [
            { sale_date: '2023-01-01', value: 1 },
            { sale_date: '2023-01-01', value: 2 },
            { sale_date: '2023-01-02', value: 3 },
        ];
        const expectedOutput = {
            '2023-01-01': [{ value: 1 }, { value: 2 }],
            '2023-01-02': [{ value: 3 }],
        };

        const result = createReturnByDate(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should return an empty object for an empty input array', () => {
        const input = [];
        const expectedOutput = {};

        const result = createReturnByDate(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should handle input with a single item', () => {
        const input = [{ sale_date: '2023-01-01', value: 1 }];
        const expectedOutput = {
            '2023-01-01': [{ value: 1 }],
        };

        const result = createReturnByDate(input);
        expect(result).toEqual(expectedOutput);
    });

    it('should handle input with multiple dates', () => {
        const input = [
            { sale_date: '2023-01-01', value: 1 },
            { sale_date: '2023-01-02', value: 2 },
            { sale_date: '2023-01-03', value: 3 },
        ];
        const expectedOutput = {
            '2023-01-01': [{ value: 1 }],
            '2023-01-02': [{ value: 2 }],
            '2023-01-03': [{ value: 3 }],
        };

        const result = createReturnByDate(input);
        expect(result).toEqual(expectedOutput);
    });
});

describe('getTimeFormat', () => {
    it('should return "YYYY-MM" for "month" input', () => {
        const time = 'month';
        const expectedOutput = 'YYYY-MM';

        const result = getTimeFormat(time);
        expect(result).toBe(expectedOutput);
    });

    it('should return "YYYY" for "year" input', () => {
        const time = 'year';
        const expectedOutput = 'YYYY';

        const result = getTimeFormat(time);
        expect(result).toBe(expectedOutput);
    });

    it('should default to "YYYY-MM" for invalid input', () => {
        const time = 'invalid' as 'month'; // Simulating invalid input
        const expectedOutput = 'YYYY-MM';

        const result = getTimeFormat(time);
        expect(result).toBe(expectedOutput);
    });
});
