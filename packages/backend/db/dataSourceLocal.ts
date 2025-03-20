import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

const connectionOptions: DataSourceOptions = {
  type: "postgres",
  host: "localhost",
  port: 5432,
  username: "dev_user", // postgre username
  //   password: "root", // postgre password
  database: "coredin_dev_db", // postgre db, needs to be created before
  synchronize: false, // if true, you don't really need migrations
  logging: true,
  entities: ["src/**/*.entity{.ts,.js}"], // where our entities reside
  migrations: ["db/migrations/*{.ts,.js}"] // where our migrations reside
};

export default new DataSource({
  ...connectionOptions
});
