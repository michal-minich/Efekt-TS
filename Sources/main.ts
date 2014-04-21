/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>


function start () {

    unitTests();

    var codeEdit = <HTMLTextAreaElement>document.getElementById("codeEdit");
    var parseButton = <HTMLButtonElement>document.getElementById("parseButton");
    var evalButton = <HTMLButtonElement>document.getElementById("evalButton");
    var codeView = <HTMLPreElement>document.getElementById("codeView");
    var astView = <HTMLPreElement>document.getElementById("astView");

    function parse () {
        clear();
        codeView.innerHTML = codeToHtmlString(codeEdit.value);
        astView.innerHTML = codeToAstString(codeEdit.value);
    }

    function interpret () {
        clear();
        function exHandler (ex : Asi) {
            codeView.innerHTML = "Exception: <br>" + asiToHtmlString(ex);
            codeView.innerHTML = "Exception: <br>" + asiToHtmlAstString(ex);
        }

        var parser = new Parser();
        var al = parser.parse(codeEdit.value);
        var i = new Interpreter(exHandler);
        var sc = new Scope(undefined, al);
        var res = sc.accept(i);
        codeView.innerHTML += asiToHtmlString(res);
        astView.innerHTML += asiToHtmlAstString(res);
    }

    function clear () {
        codeView.innerHTML = "";
        astView.innerHTML = "";
    }

    parseButton.addEventListener('click', () => {
        parse();
    });

    evalButton.addEventListener('click', () => {
        interpret();
    });

    parse();


}

