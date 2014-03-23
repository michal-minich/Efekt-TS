/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>




class TestReprot {

    private table : string[] = [];
    private counter : number = 0;

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

        var actualPlain = asiToString(actualAsi);
        var actualHtml = asiToHtmlString(actualAsi);
        var codeAst = codeToAstString(code);

        try {
            var expectedAst = codeToAstString(expected);
        } catch (ex) {
            var expectedAst = ex;
        }

        var actualAst = asiToHtmlAstString(actualAsi);

        if (expected === actualPlain && expectedAst === actualAst)
            return;

        this.table.push("<tr>",
                        "<td>", "" + (++this.counter), "</td>",
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
        this.table.push("</tbody></table>");
        return this.table.join("");
    }
}




var testReport = new TestReprot();




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




function unitTestsSpecific () {

    function t (code : string) : Test {
        var parser = new Parser();
        var parsed = parser.parse(code);
        return new Test(code, parsed);
    }

    t("throw \n throw ex").parse("throw\nthrow ex");

    document.getElementById("testReport").innerHTML =
        testReport.getReportString();
}




function unitTests () {




    function t (code : string) : Test {
        var parser = new Parser();
        var parsed = parser.parse(code);
        return new Test(code, parsed);
    }



    //noinspection FunctionTooLongJS
    function parseTests () {
        t("if 1 then 2").parse();
        t("if a then b else c").parse();
        t("if 1 then 2 else if 3 then 4 else 5").parse();
        t("struct a").parse();
        t("interface { b }").parse();
        t("new Int").parse();
        t("typeof 1 + 2").parse("typeof (1 + 2)");
        t("obj.member.m").parse();
        t("try a finally { var b }").parse("try a\nfinally { var b }");
        t("throw \n throw ex").parse("throw\nthrow ex");
        t("return \n return 1 + 2").parse("return\nreturn 1 + 2");
        t("break continue").parse("break\ncontinue");
        t("loop { a }").parse();
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
        t("1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1").parse(
            "((1 + (2 * a : T of Int)) == (((2 * 3) + b : T of Int) + 1))");
        t("var a").parse();
        t("var b = 1").parse();
        t("var c : T").parse();
        t("var d of Int").parse();
        t("var D of Int").parse();
        t("var e : T = 1").parse();
        t("var f : T of Int").parse();
        t("var g of Int = 1").parse();
        t("var G of Int = 1").parse();
        t("var h : T of Int = Int").parse();
        t("1 + 2 * var a : T of Int == 2 * 3 + var b : T of Int + 1").parse(
            "((1 + (2 * var a : T of Int)) == (((2 * 3) + b : T of Int) + 1))");
        t("a = b = 1").parse();
        t("var a = b = 1").parse();
        t("a = var b = 1").parse();
        t("var a = var b = 1").parse();
    }




    //noinspection FunctionTooLongJS
    function interpreterTests () {
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




    parseTests();
    interpreterTests();




    document.getElementById("testReport").innerHTML =
        testReport.getReportString();
}