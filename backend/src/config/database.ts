import { Sequelize } from "sequelize";

const sequelize = new Sequelize(
  "maison_daly",   // nom de ta base
  "root",          // ton utilisateur MySQL (change si nécessaire)
  "",              // ton mot de passe MySQL (remplace si nécessaire)
  {
    host: "localhost",
    dialect: "mysql",
    logging: false,
  }
);

export default sequelize;
