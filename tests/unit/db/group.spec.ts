import { Pool } from 'pg';
import { getGroupById, addGroup, updateGroup, deleteGroup } from '../../../db/groups';

jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mClient) };
});

describe('Group DB Operations', () => {
    let mockClient: jest.Mocked<Pool>;

    beforeEach(() => {
        mockClient = new Pool() as jest.Mocked<Pool>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getGroupById', () => {
        it('should return a group when a valid ID is provided', async () => {
            const mockGroup = { id: 1, name: 'Test Group' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockGroup] }));

            const result = await getGroupById('1');
            expect(result).toEqual(mockGroup);
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM groups WHERE id = 1');
        });

        it('should return null when no group is found for the given ID', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const result = await getGroupById('999');
            expect(result).toBeUndefined();
            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM groups WHERE id = 999');
        });

    });

    describe('addGroup', () => {
        it('should create a new group and return it', async () => {
            const newGroup = 'New Group';
            const mockGroup = { id: 1, name: newGroup };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            await addGroup(newGroup);
            expect(mockClient.query).toHaveBeenNthCalledWith(1,
                "SELECT * FROM groups WHERE name = 'New Group'"
            );
            expect(mockClient.query).toHaveBeenNthCalledWith(2,
                `INSERT INTO groups (id, name) VALUES (nextval(pg_get_serial_sequence('groups', 'id')), 'New Group') RETURNING *`
            );
        });

    });

    describe('updateGroup', () => {
        it('should update an existing group and return it', async () => {
            const updatedGroup = { id: 1, name: 'Updated Group' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [updatedGroup] }));

            const result = await updateGroup('1', 'Updated Group');
            expect(result).toEqual(updatedGroup);
            expect(mockClient.query).toHaveBeenCalledWith(
                `UPDATE groups SET name = 'Updated Group' WHERE id = 1 RETURNING *`
            );
        });
    });

    describe('deleteGroup', () => {
        it('should delete a group and return a success message', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({}));

            await deleteGroup('1');
            expect(mockClient.query).toHaveBeenCalledWith(
                'DELETE FROM groups WHERE id = 1'
            );
        });
    });
});