var SettingClass = function (font, size) {
    this.font = font;
    this.size = size;
    this.style = [5, 5];
    this.color = '#9de';
    this.isReverse = false;
}

function changeTextEvent() {
    var text = text_box.textContent;
    console.log("Text[" + text.length + "]: " + text);

    clear();
    if (text.length == 0) { return; }

    drawRuledLines(text);
    writeHexCode(text);
    applyToHTML(setting);
}

function clear() {
    canvas.clearRect(0, 0, ruled_line.width, ruled_line.height);
}

function drawLine(x1, y1, x2, y2, line_color, line_style) {
    if (line_color == null) {
        line_color = setting.color;
    }
    if (line_style == null) {
        line_style = setting.style;
    }

    canvas.beginPath();
    canvas.strokeStyle = line_color;
    canvas.setLineDash(line_style);
    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
}

function drawRuledLines(text) {
    ruled_line.width = measure(text);
    ruled_line.height = text_box.clientHeight;

    var len = Math.round(text_box.clientHeight / setting.size);
    var h = ruled_line.height / len;
    var x_cursor = 0;
    text.split('').forEach(function (val) {
        var c_width = measure(val);
        var x = x_cursor + c_width / 2;
        drawLine(x, 0, x, h);
        x_cursor += c_width;
    });

    for (var l= 1; l <= len;l++) {
        var y = h * (l - 0.5);
        drawLine(0, y, ruled_line.width, y)
    }

}

function measure(str, font, font_size) {
    if (typeof str != "string") {
        throw "ArgumentError.";
    }
    if (font == null) {
        font = setting.font;
    }
    if (font_size == null) {
        font_size = setting.size;
    }
    canvas.font = font_size + "px " + font;
    var str_width = canvas.measureText(str).width;
    console.log("measure: " + str + " = " + "(" + canvas.font + ")" + str_width);
    return str_width;
}

function writeHexCode(str) {
    if (typeof str != "string") {
        throw "ArgumentError.";
    }
    var hex_str = ""
    str.split('').forEach(function (val) {
        hex_str += val.charCodeAt(0).toString(16) + ", ";
    });
    code_panel.textContent = hex_str.replace(/%/g, '');
}

function applyToHTML(setting) {
    console.dir(text_box);
    console.log(setting);
    text_box.style.fontSize = setting.size + "px"; // ('-';)?
    code_panel.style.marginTop = (setting.size - 76) + "px"; // 110-76
    text_box.style.fontFamily = setting.font;
    text_box.style.lineHeight = setting.size + "px";

    $('#url_text').val(getUrl());
}

// src: http://apr20.net/web/jquery/2215/
function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function reverse() {
    if (setting.isReverse) {
        text_box.style.transform = "";
    } else {
        text_box.style.transform = "matrix(-1,0,0,1,0,0)";
    }
    setting.isReverse = !setting.isReverse;
}

function getUrl() {
    var word = text_box.textContent;
    var domain = "https://yana.honifuwa.com/zimi/?";
    var url = domain + "s=" + encodeURI(word) + "&f=" + setting.size;
    return url;
}

function changeFontSize() {
    console.log("font_size.value= " + font_size.value);
    setting.size = parseInt(font_size.value);
    applyToHTML(setting);
    changeTextEvent();
}

function changeFontStyle() {
    setting.font = font_style.value;
    applyToHTML(setting);
    changeTextEvent();
}

// main
var text_box = document.getElementById('text_box');
var ruled_line = document.getElementById('ruled_line');
var code_panel = document.getElementById('code_panel');
var font_size = document.getElementById('font_size');
var font_style = document.getElementById('font_style');
var canvas = ruled_line.getContext('2d');
var setting = new SettingClass('sans-serif', 75);
var args = getUrlVars();
text_box.focus();

// args
//   s: 本文
//   f: font-size
if (args['s'] != null) {
    try {
        text_box.textContent = decodeURI(args['s']);
    } catch (e) {
        console.warn("InvalidArguments: args.s");
    }
}
if (args['f'] != null) {
    try {
        var tmp_size = parseInt(args['f']);
        if (40 <= tmp_size && tmp_size <= 200) {
            setting.size = tmp_size;
        } else {
            console.warn("OutOfRange.")
        }
    }catch (e) {
        console.warn("InvalidArguments: args.f");
    }
}

$(function () {
    text_box.addEventListener("input", changeTextEvent);
    var clipboard = new Clipboard('.url_copy_button');
    clipboard.on('success', function (e) {
        e.clearSelection();
    });

    changeTextEvent();
});

