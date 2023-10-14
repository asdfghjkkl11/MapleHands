import {URL_EQUIPMENT, URL_RANK, URL_ITEM, URL_CHARACTER} from "../js/config.js";
import axios from "axios";
import * as cheerio from 'cheerio';
import {comma, get, sleep} from "../js/common.js";

export async function maple (fastify, options) {
    fastify.post('/maple/getCharacter', async function (req, reply) {
        const ID = req.body.ID;
        try {
            const characterToken = await getToken(ID);
            const equipment = await getEquipment(ID, characterToken);
            const character = await getCharacter(ID, characterToken);

            let data = Object.assign({},character);
            data = Object.assign(data,equipment);

            // console.log(character)
            // console.log(equipment)
            return {
                resultCode: "success",
                data: data
            };
        }catch (e){
            return {
                resultCode: "fail",
                data: {
                    error: e
                }
            };
        }
    });
}

async function getToken(ID){
    let world = 0;
    let html = await get(`${URL_RANK}w=${world}&c=${ID}`);
    let replaceHtml = html.data.replaceAll("\r","").replaceAll("\n","");
    let $ = cheerio.load(replaceHtml, null, false);
    let rankData = $(".rank_table tbody tr");

    //리부트
    if(rankData.length === 0){
        world = 254;
        html = await get(`${URL_RANK}w=${world}&c=${ID}`);
        replaceHtml = html.data.replaceAll("\r","").replaceAll("\n","");
        $ = cheerio.load(replaceHtml, null, false);

        rankData = $(".rank_table tbody tr");
    }

    //점검
    if(rankData.length === 0){
        let desc = $(".description").text();
        if(desc.includes("점검중")){
            throw "메이플스토리 사이트 점검중";
        }
    }

    let characterToken = "";
    for(let i = 0; i < rankData.length; i++){
        let id = $(rankData[i]).find("dt").text();
        if(id === ID){
            characterToken = $(rankData[i]).find("dt a").attr('href').split("?p=")[1];
            break;
        }
    }

    return characterToken;
}

async function getEquipment(ID, characterToken){
    let url = URL_EQUIPMENT.replace("{ID}",ID);
    const html = await get(url + characterToken);
    const replaceHtml = html.data.replaceAll("\r","").replaceAll("\n","");
    const $ = cheerio.load(replaceHtml, null, false);

    let resultData = {
        "items": [],
        "cashItems": []
    }
    let equipment = $(".tab01_con_wrap .item_pot");
    let cashEquipment = $(".tab02_con_wrap .item_pot");

    let itemList = equipment.find("li");

    for(let i = 0; i < itemList.length; i++){
        if($(itemList[i]).find("a").length > 0) {
            let itemToken = $(itemList[i]).find("a").attr('href').split("?p=")[1];
            let itemInfo = await getItem(itemToken);
            resultData.items.push(itemInfo);
        }
    }

    itemList = cashEquipment.find("li");

    for(let i = 0; i < itemList.length; i++){
        if($(itemList[i]).find("a").length > 0) {
            let itemToken = $(itemList[i]).find("a").attr('href').split("?p=")[1];
            let itemInfo = await getItem(itemToken);
            resultData.cashItems.push(itemInfo);
        }
    }

    return resultData;
}

async function getItem(itemToken){
    let html = await get(URL_ITEM + itemToken);
    const replaceHtml = html.data.view.replaceAll("\r","").replaceAll("\n","");
    const $ = cheerio.load(replaceHtml, null, false);

    let itemTitle = $(".item_title");
    let itemImg = itemTitle.find(".item_img img").attr('src');
    let itemNameFont = itemTitle.find(".item_memo_title h1 font").text().trim();
    let itemNameEM = itemTitle.find(".item_memo_title h1 em").text().trim();
    let itemName = itemTitle.find(".item_memo_title h1").text().replace(itemNameFont,"").replace(itemNameEM,"").trim();
    let itemAbility = $(".item_ability");
    let itemLevel = $(itemAbility.find(".ablilty01 li em")[0]).text();
    let itemType = $(itemAbility.find(".ablilty02 .job_name")[1]).find("em").text().trim();
    let seed = "";
    let stetInfo = $(".stet_info");
    let stet = stetInfo.find("li");

    let res = {
        image: itemImg,
        name: itemName,
        level: itemLevel,
        starforce: itemNameEM,
        soul: itemNameFont,
        itemType: itemType,
        seed: seed
    }

    for(let i = 0; i < stet.length; i++){
        let th = $(stet[i]).find(".stet_th").text();
        let td = $(stet[i]).find(".point_td").text();

        if(th.includes("잠재옵션")){
            if(th.includes("에디셔널")){
                th = "에디셔널 잠재옵션";
            }else{
                th = "잠재옵션";
            }

            let grade = $(stet[i]).find(".stet_th font").text();
            let contents = $(stet[i]).find(".point_td").contents();
            let option1 = (contents[0]?.data)?contents[0]?.data.split(" : "):"";
            let option2 = (contents[2]?.data)?contents[2]?.data.split(" : "):"";
            let option3 = (contents[4]?.data)?contents[4]?.data.split(" : "):"";

            td = {
                grade: grade,
                option: [option1, option2, option3]
            };
        }else if(th.includes("소울옵션") || th.includes("기타")){
            td = $(stet[i]).find(".point_td").html().split("<br>");

            for(let j = 0; j < td.length; j++) {
                td[j] = td[j].replace(/(<([^>]+)>)/ig, "");

                if(td[j].includes("[특수 스킬 반지]")){
                    res.seed = td[j][td[j].search(/\d레벨/g)];
                }
            }
        }else if(th.includes("등급")){
            td = td.split(" : ")[1];
        }else if(th.includes("착용 레벨 감소")){
            res.level = (res.level - td).toString();
        }else{
            if(td.includes("+")){
                td = td.replaceAll(" + "," ").replaceAll("+","").replaceAll("(","").replaceAll(")","");
                td = td.split(" ");
            }
        }

        res[th] = td;
    }

    return res;
}

async function getCharacter(ID, characterToken){
    let url = URL_CHARACTER.replace("{ID}",ID);
    const html = await get(url + characterToken);
    const replaceHtml = html.data.replaceAll("\r","").replaceAll("\n","");
    const $ = cheerio.load(replaceHtml, null, false);

    let characterTop = $(".char_info_top");
    let characterName = characterTop.find(".char_name span").text();
    characterName = characterName.slice(0,-1);

    let characterLevel = $(characterTop.find(".char_info dd")[0]).text();
    characterLevel.replace("LV.","");

    let characterImage = characterTop.find(".char_img img").attr('src');

    let returnData = {
        "character": {
            name: characterName,
            level: characterLevel,
            image: characterImage
        }
    };
    let characterStet = $(".tab01_con_wrap .table_style01 span");

    for(let i = 0; i < characterStet.length; i+=2){
        let key = $(characterStet[i]).text();
        let value = $(characterStet[i+1]).text();
        if(key.includes("STR")){
            value = comma(value);
        }else if(key.includes("스탯공격력")){
            value = value.split(" ~ ");
        }else if(key.includes("어빌리티") || key.includes("하이퍼스탯")){
            value = [];
            let contents = $(characterStet[i+1]).contents();
            for(let j = 0; j < contents.length; j += 2){
                value.push(contents[j]?.data);
            }
            if(key.includes("어빌리티")){
                let str = key.split(" ");
                console.log(str)
                key = "어빌리티";
                value = {
                    grade: str[0],
                    value: value
                }
            }
        }
        returnData.character[key] = value;
    }

    return returnData;
}