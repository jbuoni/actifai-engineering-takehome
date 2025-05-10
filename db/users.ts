import { pool } from './pool';

const getUserById = async (id: string) => {
    try {
        const res = await pool.query(`SELECT * FROM users WHERE id = ${id}`)
        return res?.rows[0]
    } catch (err) {
        console.error(err)
    }
}

const getUsers = async() => {
    try {
        const res = await pool.query('SELECT * FROM users ORDER BY id ASC')
        return res?.rows
    } catch (err) {
        console.error(err)
    }
}

const getUserByName = async (name: string) => {
    try {
        const res = await pool.query(`SELECT * FROM users WHERE name = '${name}'`)
        return res?.rows[0]
    } catch (err) {
        console.error(err)
    }
}

const addUser = async (name: string, role: string) => {
    console.log(`INSERT INTO users (name, role) VALUES ('${name}', '${role}') RETURNING *`)
    const res = await pool.query(`INSERT INTO users (id, name, role) VALUES (nextval(pg_get_serial_sequence('users', 'id')), '${name}', '${role}') RETURNING *`);
    return res?.rows[0];
};

const updateUser = async (id: string, name: string, role: string) => {
    let query = `UPDATE users SET `;
    let addComma = false;
    if(name) {
        query += `name = '${name}'`;
        addComma = true
    }
    if(role) {
        query += `${addComma && ',' || ''} role = '${role}'`;
    }
    query += ` WHERE id = ${id} RETURNING *`;

    const res = await pool.query(query);
    return res?.rows[0];
}

const deleteUser = async (id: string) => {
    const res = await pool.query(`DELETE FROM users WHERE id = ${id}`);
}

export {
    getUserById,
    getUserByName,
    getUsers,
    addUser,
    updateUser,
    deleteUser
}