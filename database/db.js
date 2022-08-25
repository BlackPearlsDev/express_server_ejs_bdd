import mysql from 'mysql2/promise';

// on va cherche les variables d'environnement déclarés dans le fichier .env
export const {DB_HOST, DB_USER, DB_PWD, DB_NAME} = process.env;

const POOL = mysql.createPool({
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USER,
    password: DB_PWD,
    waitForConnections: true,
    connectionLimit: 10000,
    queueLimit: 0,
});


// On est sûr de la promesse, donc on établit la connexion à la base de données.
// En chainant on peut avoir la bonne information et catch l'erreur.
POOL.getConnection()
    .then(res => {
        console.info(`CONNECTED TO ${res.config.database}`);
        res.release();
    }).catch(err => {
        console.log(err);
    }
);

export default POOL;