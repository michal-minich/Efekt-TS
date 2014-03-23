/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>


function start () {

    var testParseAll = "if 1 then 2 " +
        "if a then b else c " +
        "if 1 then 2 else if 3 then 4 else 5 " +
        "struct a " +
        "interface { b }" +
        "new Int " +
        "typeof 1 + 2 " +
        "obj.member.m " +
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
        "var i of Int = 1 " +
        "a " +
        "b = 1 " +
        "c : T " +
        "d of Int " +
        "D of Int " +
        "e : T = 1 " +
        "f : T of Int " +
        "g of Int = 1 " +
        "G of Int = 1 " +
        "h : T of Int = Int " +
        "1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1 " +
        "var a " +
        "var b = 1 " +
        "var c : T " +
        "var d of Int " +
        "var D of Int " +
        "var e : T = 1 " +
        "var f : T of Int " +
        "var g of Int = 1 " +
        "var G of Int = 1 " +
        "var h : T of Int = Int " +
        "1 + 2 * var a : T of Int == 2 * 3 + var b : T of Int + 1 ";

    //var testStr3 = "1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1";

    var testEval =
        "var a = 0 " +
        "var b = 5 " +
        "loop { " +
            "a = a + 1" +
            "if a != 10 then continue " +
            "b = b + 1" +
            "if a == 10 then break " +
        "} " +
        "b";

    var parser = new Parser();
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new Printer(cw);

    var exHandler = function (ex : Asi) {
        ex.accept(p);
        var str = sw.getString();
        document.getElementById("view").innerHTML = "Exception: " + str;
    };

    var interpreter = new Interpreter(exHandler);

    var sc : Asi = parser.parse(testEval);

    sc = sc.accept(interpreter);

    sc.accept(p);
    var str = sw.getString();
    //console.log(str);

    sw.clear();
    var dp = new DebugPrinter(cw);
    sc.accept(dp);
    var dstr = sw.getString();
    //console.log(dstr);

    document.getElementById("view").innerHTML = str + "<br/><br/>" + dstr;
}
