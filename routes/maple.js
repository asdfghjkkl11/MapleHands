import axios from "axios";
import {nvl} from "../js/common.js";
import {mapleApikey,mapleMApikey} from "../key.js";
import dayjs from "dayjs";
const serverUrl = "https://open.api.nexon.com/maplestory";
const serverUrlM = "https://open.api.nexon.com/maplestorym";

export async function maple (fastify, options) {
    fastify.post('/maple/getInfo', async function (req, reply) {
        const ID = req.body.ID;
        const date = req.body.date;
        let search_date = nvl(date,dayjs().subtract(1,"day").subtract(1,"hour").format("YYYY-MM-DD"));

        try {
            let ocid = await(await axios.get(`${serverUrl}/v1/id?character_name=${ID}`,{
                headers:{
                    "accept": "application/json",
                    "x-nxopen-api-key": mapleApikey
                }
            })).data.ocid;

            let url_list = [
                `${serverUrl}/v1/character/basic?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/popularity?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/stat?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/hyper-stat?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/propensity?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/ability?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/item-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/cashitem-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/symbol-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/set-effect?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/beauty-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/android-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/pet-equipment?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/link-skill?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/skill?ocid=${ocid}&date=${search_date}&character_skill_grade=5`,
                `${serverUrl}/v1/character/skill?ocid=${ocid}&date=${search_date}&character_skill_grade=6`,
                `${serverUrl}/v1/character/hexamatrix-stat?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/character/dojang?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/user/union?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/user/union-raider?ocid=${ocid}&date=${search_date}`,
                `${serverUrl}/v1/user/union-artifact?ocid=${ocid}&date=${search_date}`,
            ]
            let key_list = [
                "basic",
                "popularity",
                "stat",
                "hyper-stat",
                "propensity",
                "ability",
                "item-equipment",
                "cashitem-equipment",
                "symbol-equipment",
                "set-effect",
                "beauty-equipment",
                "android-equipment",
                "pet-equipment",
                "link-skill",
                "vmatrix",
                "hexamatrix",
                "hexamatrix-stat",
                "dojang",
                "union",
                "union-raider",
                "union-artifact"
            ]
            let result = {};
            let promise_list = [];

            for(let i = 0; i < url_list.length; i++){
                promise_list.push(axios.get(`${url_list[i]}`,{
                    headers:{
                        "accept": "application/json",
                        "x-nxopen-api-key": mapleApikey
                    }
                }).then(res => res.data));
            }
            let res = await Promise.all(promise_list);

            for(let i = 0; i < res.length; i++){
                result[key_list[i]] = res[i];
            }

            return result;
        }catch (e){
            console.log(e)
        }
    });
    fastify.post('/maple/mobile/getInfo', async function (req, reply) {
        const ID = req.body.ID;
        const server = req.body.server;

        try {
            let ocid = await(await axios.get(`${serverUrlM}/v1/id?character_name=${ID}&world_name=${server}`,{
                headers:{
                    "accept": "application/json",
                    "x-nxopen-api-key": mapleMApikey
                }
            })).data.ocid;

            let url_list = [
                `${serverUrlM}/v1/character/basic?ocid=${ocid}`,
                `${serverUrlM}/v1/character/item-equipment?ocid=${ocid}`,
                `${serverUrlM}/v1/character/stat?ocid=${ocid}`,
                `${serverUrlM}/v1/character/guild?ocid=${ocid}`,
            ]
            let key_list = [
                "basic",
                "item-equipment",
                "stat",
                "guild"
            ]
            let result = {};
            let promise_list = [];

            for(let i = 0; i < url_list.length; i++){
                promise_list.push(axios.get(`${url_list[i]}`,{
                    headers:{
                        "accept": "application/json",
                        "x-nxopen-api-key": mapleMApikey
                    }
                }).then(res => res.data));
            }
            let res = await Promise.all(promise_list);

            for(let i = 0; i < res.length; i++){
                result[key_list[i]] = res[i];
            }

            return result;
        }catch (e){
            console.log(e)
        }
    });
    fastify.post('/maple/getGuildInfo', async function (req, reply) {
        const guild = req.body.guild;
        const server = req.body.server;
        const date = req.body.date;
        let search_date = nvl(date,dayjs().subtract(1,"day").subtract(1,"hour").format("YYYY-MM-DD"));

        try {
            let oguild_id = await (await axios.get(`${serverUrl}/v1/guild/id?guild_name=${guild}&world_name=${server}`, {
                headers: {
                    "accept": "application/json",
                    "x-nxopen-api-key": mapleApikey
                }
            })).data.oguild_id;
            let guild_data = await (await axios.get(`${serverUrl}/v1/guild/basic?oguild_id=${oguild_id}&date=${search_date}`, {
                headers: {
                    "accept": "application/json",
                    "x-nxopen-api-key": mapleApikey
                }
            })).data;

            let member_list = {};

            if (guild_data.guild_member.length > 0){
                let ocid_list = [];
                let ocid_mapper = {};
                for(let i = 0; i < guild_data.guild_member.length; i++){
                    let ID = guild_data.guild_member[i];
                    member_list[ID] = {}
                    ocid_list.push(axios.get(`${serverUrl}/v1/id?character_name=${ID}`,{
                        headers:{
                            "accept": "application/json",
                            "x-nxopen-api-key": mapleApikey
                        }
                    }).then(res =>{
                        ocid_mapper[res.data.ocid] = ID;
                        return res.data.ocid;
                    }).catch(err=>""));
                }
                let ocid_res = await Promise.all(ocid_list);
                console.log(ocid_mapper)

                let promise_list = [];
                for(let i = 0; i < ocid_res.length; i++){
                    let ocid = ocid_res[i];
                    if(ocid !== "") {
                        let url_list = [
                            `${serverUrl}/v1/character/basic?ocid=${ocid}&date=${search_date}`,
                            `${serverUrl}/v1/character/stat?ocid=${ocid}&date=${search_date}`,
                            `${serverUrl}/v1/character/dojang?ocid=${ocid}&date=${search_date}`,
                            `${serverUrl}/v1/user/union?ocid=${ocid}&date=${search_date}`,
                        ]
                        let key_list = [
                            "basic",
                            "stat",
                            "dojang",
                            "union"
                        ]
                        for (let j = 0; j < url_list.length; j++) {
                            promise_list.push(axios.get(`${url_list[j]}`, {
                                headers: {
                                    "accept": "application/json",
                                    "x-nxopen-api-key": mapleApikey
                                }
                            }).then(res => {
                                return {
                                    ocid: ocid_mapper[ocid],
                                    key: key_list[j],
                                    data: res.data
                                };
                            }).catch(err=>{
                                return "error";
                            }));
                        }
                    }
                }

                let res = await Promise.all(promise_list);
                for(let i = 0; i < res.length; i++){
                    let r = res[i];
                    if(r !== "error"){
                        let ocid = r.ocid;
                        let key = r.key;
                        let data = r.data;
                        member_list[ocid][key] = data;
                    }
                }
            }

            let result = {
                guild: guild_data,
                member_list: member_list
            }

            return result;
        }catch (e){
            console.log(e)
        }
    });

    fastify.post('/maple/getUrl', async function (req, reply) {
        const url = req.body.url;
        let blob = await axios.get(url, {
            responseType: 'arraybuffer',
        });

        let contentType = `image/png`;
        let buffer = Buffer.from(blob.data);
        return "data:" + contentType + ';base64,' + buffer.toString('base64');
    });
}