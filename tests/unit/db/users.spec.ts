import { Pool } from 'pg';
import {
    getUserById,
    getUserByName,
    getUsers,
    addUser,
    updateUser,
    deleteUser
} from '../../../db/users';

jest.mock('pg', () => {
    const mClient = {
        connect: jest.fn(),
        query: jest.fn(),
        end: jest.fn(),
        on: jest.fn(),
    };
    return { Pool: jest.fn(() => mClient) };
});


describe('db/users', () => {
    let mockClient: jest.Mocked<Pool>;

    beforeEach(() => {
        mockClient = new Pool() as jest.Mocked<Pool>;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserById', () => {
        it('should fetch a user by id', async () => {
            const mockUser = { id: '1', name: 'John Doe', role: 'admin' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve([mockUser]));

            await getUserById('1');

            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users WHERE id = 1');

        });
    });

    describe('getUsers', () => {
        it('should fetch all users', async () => {
            const mockUsers = [
                { id: '1', name: 'John Doe', role: 'admin' },
                { id: '2', name: 'Jane Doe', role: 'user' }
            ];
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: mockUsers }));

            const result = await getUsers();

            expect(mockClient.query).toHaveBeenCalledWith('SELECT * FROM users ORDER BY id ASC');
            expect(result).toEqual(mockUsers);
        });

    });

    describe('getUserByName', () => {
        it('should fetch a user by name', async () => {
            const mockUser = { id: '1', name: 'John Doe', role: 'admin' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockUser] }));

            const result = await getUserByName('John Doe');

            expect(mockClient.query).toHaveBeenCalledWith("SELECT * FROM users WHERE name = 'John Doe'");
            expect(result).toEqual(mockUser);
        });
    });

    describe('addUser', () => {
        it('should add a new user', async () => {
            const mockUser = { id: '1', name: 'John Doe', role: 'admin' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockUser] }));

            const result = await addUser('John Doe', 'admin');

            expect(mockClient.query).toHaveBeenCalledWith(
                "INSERT INTO users (id, name, role) VALUES (nextval(pg_get_serial_sequence('users', 'id')), 'John Doe', 'admin') RETURNING *"
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('updateUser', () => {
        it('should update a user', async () => {
            const mockUser = { id: '1', name: 'John Doe', role: 'admin' };
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({ rows: [mockUser] }));

            const result = await updateUser('1', 'John Doe', 'admin');

            expect(mockClient.query).toHaveBeenCalledWith(
                "UPDATE users SET name = 'John Doe', role = 'admin' WHERE id = 1 RETURNING *"
            );
            expect(result).toEqual(mockUser);
        });
    });

    describe('deleteUser', () => {
        it('should delete a user', async () => {
            const mock = jest.spyOn(mockClient, 'query');
            mock.mockImplementation(() => Promise.resolve({}));

            await deleteUser('1');

            expect(mockClient.query).toHaveBeenCalledWith('DELETE FROM users WHERE id = 1');
        });
    });
});