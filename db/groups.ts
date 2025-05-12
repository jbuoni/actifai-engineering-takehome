import { pool } from './pool';
import { getUserById } from './users';

const getGroups = async () => {
    const res = await pool.query('SELECT * FROM groups ORDER BY id ASC')
    return res?.rows
}
const getGroupById = async (id: string) => {    
    const res = await pool.query(`SELECT * FROM groups WHERE id = ${id}`)
    return res?.rows[0]
}
const getGroupByName = async (name: string) => {
    const res = await pool.query(`SELECT * FROM groups WHERE name = '${name}'`)
    return res?.rows[0]
}
const addGroup = async (name: string) => {
    const group = await getGroupByName(name);
    if (group) {
        throw new Error(`Group with name ${name} already exists`);
    }

    const res = await pool.query(`INSERT INTO groups (id, name) VALUES (nextval(pg_get_serial_sequence('groups', 'id')), '${name}') RETURNING *`);
    return res?.rows[0];
}

const updateGroup = async (id: string, name: string) => {
    const res = await pool.query(`UPDATE groups SET name = '${name}' WHERE id = ${id} RETURNING *`);
    return res?.rows[0]
}

const deleteGroup = async (id: string) => {
    await pool.query(`DELETE FROM groups WHERE id = ${id}`);
}

const getGroupByUserId = async (userId: string) => {
    const query = `
        SELECT g.id, g.name
        FROM groups g
        JOIN users u ON g.id = u.group_id
        WHERE u.id = ${userId}
    `;
    const res = await pool.query(query);
    return res?.rows[0]
}


const addUserToGroup = async (userId: string, groupId: string) => {

    const user = getUserById(userId);
    
    if (!user) {
        throw new Error(`User with ID ${userId} does not exist`);
    }
    const group = await getGroupById(groupId);
    
    if (!group) {
        throw new Error(`Group with ID ${groupId} does not exist`);
    }

    const query = `
        INSERT INTO user_groups (user_id, group_id)
        VALUES (${userId}, ${groupId})
        RETURNING *
    `;
    const res = await pool.query(query);
    return res?.rows[0]
}

const getGroupsByUserId = async (userId: string) => {
    const res = await pool.query(`SELECT g.* FROM groups g INNER JOIN user_groups ug ON g.id = ug.group_id WHERE ug.user_id = ${userId}`);
    return res?.rows
}

const getUsersByGroupId = async (groupId: string) => {
    const res = await pool.query(`SELECT u.* FROM users u INNER JOIN user_groups ug ON u.id = ug.user_id WHERE ug.group_id = ${groupId}`);
    return res?.rows
}

export {
    getGroups,
    getGroupById,
    getGroupByName,
    addGroup,
    addUserToGroup,
    deleteGroup,
    getGroupByUserId,
    updateGroup,
    getGroupsByUserId,
    getUsersByGroupId
}