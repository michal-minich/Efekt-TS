/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {

    var parser = new Parser();

    var testAll = "if 1 then 2 " +
        "if a then b else c " +
        "if 1 then 2 else if 3 then 4 else 5 " +
        "struct a " +
        "interface { b }" +
        "new Int " +
        "typeof 1 + 2 " +
        "obj.member " +
        "try a finally { var b } " +
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

    var testStr =
            "a " +
            "b : T " +
            "c : T of Int " +
            "d : T of Int = 1 " +
            "e : T = 1 " +
            "f of Int = 1 " +
            "g = 1 " +
            "h of Int " +
            "i of Int = 1 " +
            "1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1 ";

    var testStr2 = "2 * 3 + 4 " +
                   "2 + 3 * 4 " +
                   "2 + 3 * 4 + 5 " +
                   "2 + 3 * 4 + 5 + 6 " +
                   "2 + 3 * 4 + 5 + 6 * 7 " +
                   "2 + 3 * 4 + 5 + 6 * 7 + 8 " +
                   "2 + 3 * 4 * 5 * 6 + 7 * 8 " +
                   "2 + 3 + 4 + 5 + 6 + 7 + 8 " +
                   "2 * 3 * 4 * 5 * 6 * 7 * 8 ";

    var testStr3 = "1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1";

    var sc = parser.parse(testStr);

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
