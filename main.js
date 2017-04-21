
var font_size = 76;
// var offset_x = 0;
var offset_y = font_size / 4; // line-height: 1.5em
var line_color = '#9de';

var text_box = document.getElementById('text_box');
var ruled_line = document.getElementById('ruled_line');
var code_panel = document.getElementById('code_panel');
var canvas =ruled_line.getContext('2d');

console.log("debug! ('-',,)");

text_box.addEventListener("input", changeTextEvent);

function changeTextEvent() {
    var text = text_box.textContent;
    text_width = measure(text) * font_size / 10;
    console.log("Text: " + text);
    console.log("Text.len: " + text.length);
    console.log("Text.width: " + text_width);

    ruled_line.width = font_size * text.length;
    ruled_line.height = font_size + offset_y;
    
    canvas.beginPath();
    canvas.strokeStyle = line_color;
    canvas.setLineDash([5, 5]);
    var x_cursor = 0;
    var hex_str = "HEX: "
    text.split('').forEach(function (val) {
        var c_width = measure(val) * 76 / 10;
        console.log("Charactor.width: " + val + "= " + c_width);
        // hex_str += encodeURIComponent(val) + ", ";
        hex_str += val.charCodeAt(0).toString(16) + ", ";

        var x1 = x_cursor + c_width / 2;
        var y1 = offset_y;
        var x2 = x1;
        var y2 = y1 + font_size;

        canvas.moveTo(x1, y1);
        canvas.lineTo(x2, y2);
        canvas.stroke();

        x_cursor += c_width;
    });
    code_panel.textContent = hex_str.replace(/%/g, '');
    code_panel.width = measure(code_panel.textContent) + 100;
    console.log(code_panel.width);

    var x1 = 0; // offset_x
    var y1 = font_size / 2 + offset_y;
    var x2 = text_width;
    var y2 = y1;

    canvas.moveTo(x1, y1);
    canvas.lineTo(x2, y2);
    canvas.stroke();
}

function measure(str) {
    return canvas.measureText(str).width;
}

changeTextEvent();