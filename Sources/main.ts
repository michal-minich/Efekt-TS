/// <reference path="common.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {
    var i = new Int(undefined, undefined, "12345");

    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p : AstVisitor<void> = new Printer(cw);

    i.accept(p);

    document.getElementById("view").textContent = sw.getString();
}
