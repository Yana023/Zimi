// zimi v2.0
// Author: Yana
// 2017/10/09
var color = '#9de';
var size = 75;
var line_style = [5, 5];
var base_url = "https://yana.honifuwa.com/zimi/";
var text_box = document.getElementById('text_box');
var code_panel = document.getElementById('code_panel');
var font_size = document.getElementById('font_size');
var url_text = document.getElementById('url_text');
var url_copy_button = document.getElementById('url_copy_button');
var ruled_line = document.getElementById('ruled_line');
var canvas = ruled_line.getContext('2d');
// util
function getURL(word) {
    return base_url + '?s=' + encodeURI(word) + '&f=' + size;
}
function measure(str, font, font_size) {
    if (typeof str != "string") {
        throw "ArgumentError.";
    }
    canvas.font = size + "px " + font;
    var str_width = canvas.measureText(str).width;
    console.log("measure: " + str + " = " + "(" + canvas.font + ")" + str_width);
    return str_width;
}
function drawLine(x1, y1, x2, y2, line_color, line_style) {
    if (line_color == null) {
        line_color = color;
    }
    canvas.beginPath();
    canvas.strokeStyle = line_color;
    canvas.setLineDash(line_style);
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
}
function drawRuledLines(text) {
    ruled_line.width = measure(text, 'sans-serif', size);
    ruled_line.height = text_box.clientHeight;
    var len = Math.round(text_box.clientHeight / size);
    var h = ruled_line.height / len;
    var x_cursor = 0;
    text.split('').forEach(function (val) {
        var c_width = measure(val, 'sans-serif', size);
        var x = x_cursor + c_width / 2;
        drawLine(x, 0, x, h, color, line_style);
        x_cursor += c_width;
    });
    for (var l = 1; l <= len; l++) {
        var y = h * (l - 0.5);
        drawLine(0, y, ruled_line.width, y, color, line_style);
    }
}
// events
function changeFontSizeEvent(ev) {
    size = parseInt(this.value);
    console.log("set font-size: ", size);
    text_box.style.fontSize = size + 'px';
    text_box.style.lineHeight = size + 'px';
    // code_panel.style.marginTop = (size - 76) + 'px'; // 110-76
    drawRuledLines(text_box.textContent);
}
function clickCopyButtonEvent(ev) {
    console.log('copy!');
    let url = url_text;
    console.log(url.value);
    url.select();
    document.execCommand('copy');
    document.getSelection().removeAllRanges();
    text_box.focus();
}
function changeTextEvent(ev) {
    console.log("changeTextEvent:", this.textContent);
    let u = url_text;
    u.value = getURL(this.textContent);
    drawRuledLines(this.textContent);
}
function textClearEvent(ev) {
    this.textContent = "";
}
// sub
function initEvents() {
    text_box.oninput = changeTextEvent;
    font_size.onchange = changeFontSizeEvent;
    url_copy_button.onclick = clickCopyButtonEvent;
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
    loadArgs();
    initEvents();
    text_box.focus();
    drawRuledLines(text_box.textContent);
}
main();
//# sourceMappingURL=zimi.js.map