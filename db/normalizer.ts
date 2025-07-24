import "reflect-metadata"
import { DataSource } from "typeorm"
import { Knesset } from "./models/knesset"
import cmbData from "../scraper/scrap_data/GetVotesCmbData.json"
import { Faction } from "./models/faction"


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "kapi",
    password: "kapi",
    database: "kapi",
    entities: [Knesset, Faction],
    synchronize: true,
    logging: false,
})

AppDataSource.initialize().then(async ()=>{
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
        await knessetRepo.save(knesset);
        console.log(`saved knesset ${knesset.id}`)
    }


    const cmbFactions = cmbData.Factions;
    const factionRepo = AppDataSource.getRepository(Faction);
    for (let cmbFaction of cmbFactions) {
        const faction = new Faction();
        faction.id = cmbFaction.ID;
        faction.name = cmbFaction.FactionName;
        const knesset = await knessetRepo.findOneBy({id: cmbFaction.KnessetId});
        if (!knesset) {
            throw new Error(`Knesset with ID ${cmbFaction.KnessetId} not found`);
        }

        faction.knesset = knesset;
        await factionRepo.save(faction)
    }
})