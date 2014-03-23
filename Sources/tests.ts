/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>




class TestReprot {

    private table : string[] = [];

    constructor () {
        this.table.push("<table class='testReport'><thead><tr>",
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
        var expectedAst = codeToAstString(expected);
        var actualAst = asiToHtmlAstString(actualAsi);

        if (expected === actualPlain && expectedAst === actualAst)
            return;

        this.table.push("<tr><td>", category, "</td>",
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
        var sc = new Scope(undefined, this.parsed.items);
        var evaled = sc.accept(interpreter);
        testReport.addEval(this.code, expected, evaled);
        return this;
    }
}




function unitTests () {




    function t (code : string) : Test {
        var parser = new Parser();
        var parsed = parser.parse(code);
        return new Test(code, parsed);
    }




    function parseTests () {
        t("if 1 then 2").parse();
        t("a = b = 1").parse();
        t("var a = b = 1").parse();
        t("a = var b = 1").parse();
        t("var a = var b = 1").parse();
    }




    function interpreterTests () {
        t("1 + 2").evalTo("3");
        t("1 + 2").evalTo("4");
    }




    parseTests();
    interpreterTests();




    document.getElementById("testReport").innerHTML =
        testReport.getReportString();
}