
var text_box = document.getElementById('text_box');
var ruled_line = document.getElementById('ruled_line');
var code_panel = document.getElementById('code_panel');
var canvas = ruled_line.getContext('2d');

var SettingClass = function (font, size) {
    this.font = font;
    this.size = size;
    this.style = [5, 5];
    this.color = '#9de';
    this.offset_x = 0;
    this.offset_y = size / 4; // line-height: 1.5em
}

function changeTextEvent() {
    var text = text_box.textContent;
    console.log("Text[" + text.length + "]: " + text);

    clear();
    if (text.length == 0) { return; }

    drawRuledLines(text);
    writeHexCode(text);
}

function clear() {
    // console.log(console.trace());
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
    ruled_line.width = setting.size * text.length;
    ruled_line.height = setting.size + setting.offset_y;

    text_width = measure(text);
    console.log("Text.width: " + text_width);
    var x_cursor = 0;
    text.split('').forEach(function (val) {
        var c_width = measure(val);
        var x = x_cursor + c_width / 2;
        drawLine(x, setting.offset_y, x, setting.offset_y + setting.size);

        //// one charactor area.
        // canvas.beginPath();
        // canvas.strokeStyle = setting.color;
        // canvas.setLineDash([1, 0]);
        // canvas.rect(x_cursor, setting.offset_y, c_width, setting.size);
        // canvas.stroke();

        x_cursor += c_width;
    });

    var y = setting.size / 2 + setting.offset_y;
    drawLine(0, y, text_width, y)
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
    var hex_str = "HEX: "
    str.split('').forEach(function (val) {
        hex_str += val.charCodeAt(0).toString(16) + ", ";
    });
    code_panel.textContent = hex_str.replace(/%/g, '');
}

function applyToHTML(setting) {
    console.dir(text_box);
    console.log(setting.size);
    text_box.style.fontSize = setting.size; // ('-';)?
}

console.log("debug! ('-',,)");
// console.dir(text_box);
// console.dir(canvas);
// console.dirxml(text_box);
// console.dir(canvas.textBaseline);

var setting = new SettingClass('sans-serif', 76);
// console.dir(setting);
applyToHTML(setting);
text_box.addEventListener("input", changeTextEvent);
changeTextEvent();