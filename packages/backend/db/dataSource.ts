import DataSourceProd from "./dataSourceProd";
import DataSourceLocal from "./dataSourceLocal";

export default process.env.ENV === "prod" ? DataSourceProd : DataSourceLocal;
