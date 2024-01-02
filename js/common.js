export const sleep = delay => new Promise(resolve => setTimeout(resolve, delay));

export function nvl(text, rText) {
    if (text == null || text == undefined) text = "";
    if (rText != null && text == "") text = rText;
    return text;
}

export function comma(str) {
    str = String(Number(String(nvl(str, "0")).replace(/[^0-9-]/g,"")));
    return str.replace(/(\d)(?=(?:\d{3})+(?!\d))/g, "$1,");
}