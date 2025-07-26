import "reflect-metadata"
import { DataSource, In } from "typeorm"
import { Knesset } from "./models/knesset"
import { Faction } from "./models/faction"
import { Mk } from "./models/mk"
import { VoteResultType } from "./models/vote_result_type"
import cmbData from "../scraper/scrap_data/GetVotesCmbData.json"


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "kapi",
    password: "kapi",
    database: "kapi",
    entities: [Knesset, Faction, Mk, VoteResultType],
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
        faction.mks = [];
        const knesset = await knessetRepo.findOneBy({id: cmbFaction.KnessetId});
        if (!knesset) {
            throw new Error(`Knesset with ID ${cmbFaction.KnessetId} not found`);
        }

        faction.knesset = knesset;
        await factionRepo.save(faction)
    }

    const cmbMks = cmbData.MKS;
    const normalizedMks: { [key: string]: { id: number; factions: Set<number> } } = {};
    
    for (let cmbMk of cmbMks) {
        const name = cmbMk.Name;
        if (!normalizedMks[name]) {
            normalizedMks[name] = {id: cmbMk.Id, factions: new Set()}
        }
        normalizedMks[name].factions.add(cmbMk.faction_id);
    }
    
    const mkRepo = AppDataSource.getRepository(Mk);
    for (let name in normalizedMks) {
        const normalizedMk = normalizedMks[name];
        const factions = await factionRepo.findBy({id: In([...normalizedMk.factions])});
        const mk = new Mk();
        mk.name = name;
        mk.factions = factions;
        mk.id = normalizedMk.id;
        mkRepo.save(mk);
        
    }

    const cmbVoteResultTypes = cmbData.VoteResultTypes;
    const voteResultTypeRepo = AppDataSource.getRepository(VoteResultType);

    for (let cmbVoteResultType of cmbVoteResultTypes) {
        let voteResultType = new VoteResultType();
        voteResultType.id = cmbVoteResultType.ID;
        voteResultType.name = cmbVoteResultType.Title;
        voteResultTypeRepo.save(voteResultType);
    }

})