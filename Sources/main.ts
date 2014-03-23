/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>


function start () {

    unitTests();

     /*
     var testCode =
         "var S = struct { var a = 1 } " +
         "S";

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

     var al = parser.parse(testCode );
     var sc = new Scope(undefined, al.items);

     //sc = sc.accept(interpreter);

     sc.accept(p);
     var str = sw.getString();
     //console.log(str);

     sw.clear();
     var dp = new DebugPrinter(cw);
     sc.accept(dp);
     var dstr = sw.getString();
     //console.log(dstr);

     document.getElementById("view").innerHTML = str + "<br/><br/>" + dstr;
     */
}
