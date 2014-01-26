/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {

    var parser = new Parser();

    var testAll = "obj.member " +
        "try a finally { b } " +
        "throw \n throw ex " +
        "return \n return 1 + 2 " +
        "break continue " +
        "loop { a } " +
        "var a " +
        "var b : T " +
        "var c : T of Int " +
        "var d : T of Int = 1 " +
        "var e : T = 1 " +
        "var f of Int = 1 " +
        "var g = 1 " +
        "var h of Int " +
        "var i of Int = 1 ";

    var testStr = "obj.member";

    var sc = parser.parse(testAll);

    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);

    var p : AstVisitor<void> = new Printer(cw);
    sc.accept(p);
    var str = sw.getString();
    //console.log(str);

    sw.clear();
    var dp : AstVisitor<void> = new DebugPrinter(cw);
    sc.accept(dp);
    var dstr = sw.getString();
    //console.log(dstr);

    document.getElementById("view").innerHTML = str + "<br/><br/>" + dstr;
}
