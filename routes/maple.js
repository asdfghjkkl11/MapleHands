import axios from "axios";
import {nvl} from "../js/common.js";
import {apikey} from "../key.js";
import dayjs from "dayjs";

const serverUrl = "https://open.api.nexon.com/maplestory";

export async function maple (fastify, options) {
    fastify.post('/maple/getInfo', async function (req, reply) {
        const ID = req.body.ID;
        const date = req.body.date;
        let search_date = nvl(date,dayjs().subtract(1,"day").format("YYYY-MM-DD"));

        try {
            let ocid = await(await axios.get(`${serverUrl}/v1/id?character_name=${ID}`,{
                headers:{
                    "accept": "application/json",
                    "x-nxopen-api-key": apikey
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
                "union-raider"
            ]
            let result = {};
            let promise_list = [];

            for(let i = 0; i < url_list.length; i++){
                promise_list.push(axios.get(`${url_list[i]}`,{
                    headers:{
                        "accept": "application/json",
                        "x-nxopen-api-key": apikey
                    }
                }).then(res => res.data));
            }
            let res = await Promise.all(promise_list);

            for(let i = 0; i < res.length; i++){
                result[key_list[i]] = res[i];
            }

            console.log(result)

            return result;
        }catch (e){
            console.log(e)
        }
    });

}