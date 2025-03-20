import { DataSource } from "typeorm";
import { DataSourceOptions } from "typeorm/data-source/DataSourceOptions";

const envConfig = JSON.parse(process.env["CONFIGURATION_JSON"] || '{"db":{}}');

const connectionOptions: DataSourceOptions = {
  type: "postgres",
  host: envConfig.db.host,
  port: envConfig.db.port ? +envConfig.db.port : 5432, // Cast to number with +
  username: envConfig.db.user,
  password: process.env.db_password,
  database: envConfig.db.database,
  synchronize: false,
  logging: true,
  entities: ["dist/**/*.entity{.ts,.js}"],
  migrations: ["db/migrations/*{.ts,.js}"]
};

export default new DataSource({
  ...connectionOptions
});
