const dbRootUser = process.env.MONGO_INITDB_ROOT_USERNAME;
const dbRootPass = process.env.MONGO_INITDB_ROOT_PASSWORD;
const dbName = process.env.MONGO_DB_NAME;
const dbUser = process.env.MONGO_DB_USER;
const dbPass = process.env.MONGO_DB_PASSWORD;


conn = new Mongo();
db = conn.getDB("admin");
db.auth(dbRootUser, dbRootPass);

db = conn.getDB(dbName);
db.createUser({ user: dbUser, pwd: dbPass, roles: ["readWrite"] });

