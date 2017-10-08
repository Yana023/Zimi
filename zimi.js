// zimi v2.0
// Author: Yana
// 2017/10/09
var color = '#9de';
var size = 75;
var base_url = "https://yana.honifuwa.com/zimi/";
var text_box = document.getElementById('text_box');
var ruled_line = document.getElementById('ruled_line');
var code_panel = document.getElementById('code_panel');
var font_size = document.getElementById('font_size');
var url_text = document.getElementById('url_text');
// util
function getURL(word) {
    return base_url + '?s=' + encodeURI(word) + '&f=' + size;
}
// events
function changeFontSizeEvent(ev) {
    size = parseInt(this.value);
    console.log("set font-size: ", size);
    text_box.style.fontSize = size + 'px';
}
function clickCopyButtonEvent(ev) {
    console.log('copy!');
    let url = document.getElementById('url_text');
    console.log(url.value);
    url.select();
    document.execCommand('copy');
}
function changeTextEvent(ev) {
    console.log("changeTextEvent:", this.textContent);
    let u = url_text;
    u.value = getURL(this.textContent);
}
function textClearEvent(ev) {
    this.textContent = "";
}
// sub
function initEvents() {
    text_box.oninput = changeTextEvent;
    font_size.onchange = changeFontSizeEvent;
}
function loadArgs() {
    let args = new URL(document.URL);
    let s = args.searchParams.get('s');
    let f = args.searchParams.get('f');
    if (s != null) {
        text_box.textContent = s;
    }
    if (f != null) {
        let f_num = Number.parseInt(f);
        if (1 < f_num && f_num < 200) {
            size = f_num;
            console.log("set font-size:", size);
            text_box.style.fontSize = size + 'px';
        }
    }
}
// main
function main() {
    // test codes.
    // console.log("URL: ", document.URL);
    // console.log("1", url_arg.searchParams.get('s'));
    // console.log("2", url_arg.searchParams.get('aaa'));
    // console.log("root.URL:", URL);
    loadArgs();
    initEvents();
    text_box.focus();
}
main();
//# sourceMappingURL=zimi.js.map