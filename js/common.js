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
        html = await axios.get(url,{
            headers:{
                "X-Requested-With": "XMLHttpRequest"
            }
        });
    }

    return html;
}