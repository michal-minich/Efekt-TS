/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>




class TestReprot {

    private table : string[] = [];
    public failedCount = 0;
    private testCount = 0;

    constructor () {
        this.table.push("<table class='testReport'><thead><tr>",
                        "<th>#</th>",
                        "<th>Category</th>",
                        "<th>Code</th>",
                        "<th>Expected</th>",
                        "<th>Actual</th>",
                        "<th>Code AST</th>",
                        "<th>Expected AST</th>",
                        "<th>Actual AST</th>",
                        "</tr></thead><tbody class='efektCode'>");
    }




    addParse (code : string, expected : string, actualAsi : Asi) : void {
        this.add("Parse", code, expected, actualAsi);
    }




    addEval (code : string, expected : string, actualAsi : Asi) : void {
        this.add("Eval", code, expected, actualAsi);
    }




    private add (category : string,
                 code : string,
                 expected : string,
                 actualAsi : Asi) : void {

        ++this.testCount;

        var actualPlain = asiToString(actualAsi);
        var actualHtml = asiToHtmlString(actualAsi);
        var codeAst = codeToAstString(code);

        try {
            var expectedAst = codeToAstString(expected);
        } catch (ex) {
            var expectedAst = ex;
        }

        var actualAst = asiToHtmlAstString(actualAsi);

        var ok = expected === actualPlain && expectedAst === actualAst;

        var rowClass = "class='test" + (ok ? "Successful" : "Failed") + "'";

        if (ok) {
            //var rowClass = "";
            return;
        }

        this.table.push("<tr", rowClass, ">",
                        "<td>", "" + (++this.failedCount), "</td>",
                        "<td>", category, "</td>",
                        "<td>", code, "</td>",
                        "<td>", expected, "</td>",
                        "<td>", actualHtml, "</td>",
                        "<td>", codeAst, "</td>",
                        "<td>", expectedAst, "</td>",
                        "<td>", actualAst, "</td>",
                        "</tr>");
    }




    getReportString () : string {
        if (this.failedCount === 0)
            return "All " + this.testCount + " Tests OK";
        this.table.push("</tbody></table>");
        return "" + this.failedCount + " of " + this.testCount +
            " Tests Failed" +
            this.table.join("");
    }
}




class Test {

    private code : string;
    private parsed : AsiList;

    constructor (code : string, parsed : AsiList) {
        this.code = code;
        this.parsed = parsed;
    }




    parse (expected? : string) : Test {
        if (!expected)
            expected = this.code;
        testReport.addParse(this.code, expected, this.parsed);
        return this;
    }




    evalTo (expected : string) : Test {
        var exHandler = function (ex : Asi) {
        };
        var interpreter = new Interpreter(exHandler);
        var sc = new Scope(undefined, this.parsed);
        var evaled = sc.accept(interpreter);
        testReport.addEval(this.code, expected, evaled);
        return this;
    }
}




function t (code : string) : Test {
    var parser = new Parser();
    var parsed = parser.parse(code);
    return new Test(code, parsed);
}




var testReport = new TestReprot();




function unitTests () {

    testSpecific();

    if (testReport.failedCount === 0) {
        parseTests();
    }

    if (testReport.failedCount === 0) {
        //interpreterTests();
    }

    document.getElementById("testReport").innerHTML =
        testReport.getReportString();
}




function testSpecific () : void {

    t("(1 + 2) + 3").parse("((1 + 2) + 3)");
}




function parseTests () : void {

    // if
    t("if 1 then 2").parse();
    t("if a then b else c").parse();
    t("if 1 then 2 else if 3 then 4 else 5").parse();
    t("if a then { struct b } else { interface c }").parse();
    t("if a then { struct { b } } else { interface { c } }").parse();

    // struct
    t("struct a").parse("struct { a }");
    t("struct { a } struct b").parse("struct { a } struct { b }");

    // interface
    t("var I = interface { b }").parse();

    // new
    t("new Int").parse();

    // typeof
    t("typeof 1 + 2").parse("typeof (1 + 2)");
    t("typeof var a = 1").parse();

    // member access
    t("obj.member").parse();
    t("a.b.c.d").parse();
    t("((x.y).z).q").parse("x.y.z.q");

    // try finally
    t("try a finally { var b }").parse("try a\nfinally var b");

    // throw
    t("throw 1 + 2").parse("throw (1 + 2)");
    t("throw \n throw ex").parse("throw\nthrow ex");

    // return
    t("return \n return 1 + 2").parse("return\nreturn (1 + 2)");

    // break
    t("break continue").parse("break\ncontinue");

    // loop
    t("loop { a }").parse("loop a");

    // true false
    t("if true then false").parse();
    t("false").parse();

    // var
    t("var a").parse();
    t("var b : T").parse();
    t("var c : T of Int").parse();
    t("var d : T of Int = 1").parse();
    t("var e : T = 1").parse();
    t("var f of Int = 1").parse();
    t("var g = 1").parse();
    t("var h of Int").parse();
    t("var i of Int = 1").parse();

    t("a").parse();
    t("b = 1").parse();
    t("c : T").parse();
    t("d of Int").parse();
    t("D of Int").parse();
    t("e : T = 1").parse();
    t("f : T of Int").parse();
    t("g of Int = 1").parse();
    t("G of Int = 1").parse();
    t("h : T of Int = Int").parse();

    t("var b = 1").parse();
    t("var c : T").parse();
    t("var d of Int").parse();
    t("var D of Int").parse();
    t("var e : T = 1").parse();
    t("var f : T of Int").parse();
    t("var g of Int = 1").parse();
    t("var G of Int = 1").parse();
    t("var h : T of Int = Int").parse();

    // var & op priority and precednce
    t("a = b = 1 + 2").parse("a = b = (1 + 2)");
    t("var a = b = 1 + 2").parse("var a = b = (1 + 2)");
    t("a = var b = 1 + 2").parse("a = var b = (1 + 2)");
    t("var a = var b = 1 + 2").parse("var a = var b = (1 + 2)");
    t("1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1").parse(
        "((1 + (2 * a : T of Int)) == (((2 * 3) + b : T of Int) + 1))");

    t("var b : T of Int + 1").parse("(var b : T of Int + 1)");
    t("1 + var a = 2 + 3").parse("(1 + var a = (2 + 3))");
    t("1 + var a : T.U of X.Addable + 2").parse(
        "(1 + var a : T.U of X.Addable + 2)");


    //t("1 + 2 * var a : T of Int == 2 * 3 + var b : T of Int + 1").parse(
    //"((1 + (2 * var a : T of Int)) == (((2 * 3) + b : T of Int) + 1))");

    // braces and op priority and precednce
    t("2 + 3 + 4").parse("((2 + 3) + 4)");
    t("(2 + 3) + 4").parse("((2 + 3) + 4)");
    t("1 + (2 + 3) + 4").parse("((1 + (2 + 3)) + 4)");
    t("1 + (2 + 3)").parse("(1 + (2 + 3))");

    t("2 * 3 + 4").parse("((2 * 3) + 4)");
    t("(2 * 3) + 4").parse("((2 * 3) + 4)");
    t("1 * (2 + 3) + 4").parse("((1 * (2 + 3)) + 4)");
    t("1 * (2 + 3)").parse("(1 * (2 + 3))");

    t("2 + 3 * 4").parse("(2 + (3 * 4))");
    t("(2 + 3) * 4").parse("((2 + 3) * 4)");
    t("1 + (2 * 3) + 4").parse("((1 + (2 * 3)) + 4)");
    t("1 + (2 * 3)").parse("(1 + (2 * 3))");

    t("((2 + 3)) * 4").parse("((2 + 3) * 4)");
    t("1 + (((2 * 3))) + 4").parse("((1 + (2 * 3)) + 4)");
    t("1 + ((((2 * 3))))").parse("(1 + (2 * 3))");
    t("1 * ((((2 + 3)))) + 4").parse("((1 * (2 + 3)) + 4)");
}




function interpreterTests () : void {

    t("1 + 2").evalTo("3");
    t("var a = 0 " +
          "var b = 5 " +
          "loop { " +
          "a = a + 1" +
          "if a != 10 then continue " +
          "b = b + 1" +
          "if a == 10 then break " +
          "} " +
          "b").evalTo("6");
}