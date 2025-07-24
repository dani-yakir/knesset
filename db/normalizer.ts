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

AppDataSource.initialize().then(()=>{
    // normalize Knessets
    const cmbKnessets = cmbData.Knessets;
    const knessetRepo =  AppDataSource.getRepository(Knesset);

    for (let cmbKnesset of cmbKnessets) {
        const knesset = new Knesset();
        knesset.id = cmbKnesset.KnessetId;
        knesset.is_current = Boolean(cmbKnesset.IsCurrent);
        knesset.name = cmbKnesset.KnessetName;
        knesset.end_date = cmbKnesset.KnessetEnd;
        knesset.start_date = cmbKnesset.KnessetStart;
        knessetRepo.save(knesset);
        console.log(`saved knesset ${knesset.id}`)
    }


})