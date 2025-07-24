import "reflect-metadata"
import { DataSource } from "typeorm"
import { Knesset } from "./models/knesset"
import cmbData from "../scraper/scrap_data/GetVotesCmbData.json"


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "kapi",
    password: "kapi",
    database: "kapi",
    entities: [Knesset],
    synchronize: true,
    logging: false,
})

AppDataSource.initialize()