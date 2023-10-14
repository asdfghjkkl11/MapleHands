import axios from "axios";
import {URL_ITEM} from "./config.js";

export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));
export async function get(url){
    let html;
    try{
        html = await axios.get(url,{
            headers:{
                "X-Requested-With": "XMLHttpRequest"
            }
        });
    }catch (e){
        console.log(e)
        html = await axios.get(url,{
            headers:{
                "X-Requested-With": "XMLHttpRequest"
            }
        });
    }

    return html;
}
export function g_nvl(text, rText) {
    if (text == null || text == undefined) text = "";
    if (rText != null && text == "") text = rText;
    return text;
}
export function comma(str) {
    str = String(Number(String(g_nvl(str, "0")).replace(/[^0-9-]/g,"")));
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}