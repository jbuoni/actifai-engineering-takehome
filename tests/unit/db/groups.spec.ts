import { Pool } from 'pg';
import { getGroupById, addGroup, updateGroup, deleteGroup, getGroupsByUserId, getUsersByGroupId } from '../../../db/groups';

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

    describe('getGroupsByUserId', () => {
        it('should return a list of groups for a valid user ID', async () => {
            const mockGroups = [
                { id: 1, name: 'Group 1' },
                { id: 2, name: 'Group 2' },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockGroups }));

            const result = await getGroupsByUserId('1');
            expect(result).toEqual(mockGroups);
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT g.* FROM groups g INNER JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = 1'
            );

        });

        it('should return an empty array when no groups are found for the given user ID', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const result = await getGroupsByUserId('999');
            expect(result).toEqual([]);
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT g.* FROM groups g INNER JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = 999'
            );
        });

        it('should throw an error if the query fails', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            await expect(getGroupsByUserId('1')).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT g.* FROM groups g INNER JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = 1'
            );
        });
    });

    describe('getUsersByGroupId', () => {
        it('should return a list of users for a valid group ID', async () => {
            const mockUsers = [
                { id: 1, name: 'User 1' },
                { id: 2, name: 'User 2' },
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockUsers }));

            const result = await getUsersByGroupId('1');
            expect(result).toEqual(mockUsers);
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT u.* FROM users u INNER JOIN user_groups ug ON u.id = ug.user_id WHERE ug.group_id = 1'
            );
        });

        it('should return an empty array when no users are found for the given group ID', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [] }));

            const result = await getUsersByGroupId('999');
            expect(result).toEqual([]);
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT u.* FROM users u INNER JOIN user_groups ug ON u.id = ug.user_id WHERE ug.group_id = 999'
            );
        });

        it('should throw an error if the query fails', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.reject(new Error('Database error')));

            await expect(getUsersByGroupId('1')).rejects.toThrow('Database error');
            expect(mockClient.query).toHaveBeenCalledWith(
                'SELECT u.* FROM users u INNER JOIN user_groups ug ON u.id = ug.user_id WHERE ug.group_id = 1'
            );
        });
    });
});