import "reflect-metadata"
import * as fs from 'fs';
import * as path from 'path';

import { DataSource, In } from "typeorm"
import { Knesset } from "./models/knesset"
import { Faction } from "./models/faction"
import { Mk } from "./models/mk"
import { VoteResultType } from "./models/vote_result_type"
import { Vote } from "./models/vote";
import cmbData from "../scraper/scrap_data/GetVotesCmbData.json"
import { LawItem } from "./models/law_item";
import { VoteDetail } from "./models/vote_detail";


const AppDataSource = new DataSource({
    type: "postgres",
    host: "localhost",
    port: 5432,
    username: "kapi",
    password: "kapi",
    database: "kapi",
    entities: [Knesset, Faction, Mk, VoteResultType, Vote, LawItem, VoteDetail],
    synchronize: true,
    dropSchema: true,
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
        await mkRepo.save(mk);
        
    }

    const cmbVoteResultTypes = cmbData.VoteResultTypes;
    const voteResultTypeRepo = AppDataSource.getRepository(VoteResultType);

    for (let cmbVoteResultType of cmbVoteResultTypes) {
        let voteResultType = new VoteResultType();
        voteResultType.id = cmbVoteResultType.ID;
        voteResultType.name = cmbVoteResultType.Title;
        await voteResultTypeRepo.save(voteResultType);
    }

    const scrapDataPath = path.join(__dirname, '..', 'scraper', 'scrap_data');
    const scrapDataJsons = fs.readdirSync(scrapDataPath);
    const voteJsonPaths = scrapDataJsons.filter(filename=>/^\d+\.json/.test(filename));
    console.log(voteJsonPaths)
    console.log('Got all vote paths, parsing...');
    const voteRepo = AppDataSource.getRepository(Vote);
    const lawItemRepo = AppDataSource.getRepository(LawItem)
    const voteDetailRepo = AppDataSource.getRepository(VoteDetail);

    const allKnessets = await knessetRepo.find();
    const idToKnesset = Object.fromEntries(allKnessets.map(kns=>[kns.id, kns]))

    const idToLawItem: {[key: number] : LawItem} = {};

    for (let filename of voteJsonPaths) {
        const text = fs.readFileSync(path.join(scrapDataPath, filename), 'utf-8');
        const siteVote = JSON.parse(text);
        const vote = new Vote();
        const id = Number(filename.split('.')[0])
        if (!id) {
            // TODO: ask Shoval about better solution
            continue
        }
        vote.id = id;
        console.log(`Parsing vote ${vote.id}`);
        vote.next = siteVote.NextAndPrevVotes[0].NextVote;
        vote.prev = siteVote.NextAndPrevVotes[0].PrevVote;
        if (siteVote.VoteHeader[0]) {
            vote.protocol = siteVote.VoteHeader[0].VoteProtocolNo;
            const knessetId = siteVote.VoteHeader[0].FK_Knesset;
            const knesset = idToKnesset[knessetId]
            vote.knesset = knesset;

            // handle lawItems
            const lawItemTitle = siteVote.VoteHeader[0].ItemTitle;
            const lawItemId = siteVote.VoteHeader[0].FK_ItemID;

            // get from db
            let lawItem = idToLawItem[lawItemId];
            if (!lawItem) {
                lawItem = new LawItem();
                lawItem.id = lawItemId;
                lawItem.title = lawItemTitle;
                await lawItemRepo.save(lawItem);
                idToLawItem[lawItemId] = lawItem;
            }

            vote.law_item = lawItem;
            
            
            
        }
        
        await voteRepo.save(vote);
        
        const allVoteResultTypes = await voteResultTypeRepo.find();
        const idToVoteResult = Object.fromEntries(allVoteResultTypes.map(vrt=>[vrt.id, vrt]))
        for (let siteVoteDetail of siteVote.VoteDetails) {
            let voteDetail = new VoteDetail();
            voteDetail.mk_name = siteVoteDetail.MkName;

            const voteResultType = idToVoteResult[siteVoteDetail.VoteResultId];
            if (!voteResultType) {
                throw new Error(`No vote result type ${siteVoteDetail.VoteResultId} in vote ${vote.id}`)
            }
            voteDetail.vote_result_type = voteResultType;
            voteDetail.faction_name = siteVoteDetail.FactionName;
            voteDetail.vote = vote;
            await voteDetailRepo.save(voteDetail);
        }
        

    }

})