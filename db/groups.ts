import { pool } from './pool';

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

export {
    getGroups,
    getGroupById,
    getGroupByName,
    addGroup,
    deleteGroup,
    getGroupByUserId,
    updateGroup
}