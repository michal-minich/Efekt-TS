/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {

    var parser = new Parser();
    var exp = parser.parse("var a=1+2 var b=3+4");

    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);

    var p : AstVisitor<void> = new Printer(cw);
    exp.accept(p);
    var str = sw.getString();
    console.log(str);

    sw.clear();
    var dp : AstVisitor<void> = new DebugPrinter(cw);
    exp.accept(dp);
    var dstr = sw.getString();
    //console.log(dstr);

    document.getElementById("view").innerHTML = str + "<br/><br/>" + dstr;


}
