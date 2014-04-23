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
    var outputView = <HTMLPreElement>document.getElementById("outputView");
    var outputAstView = <HTMLPreElement>document.getElementById("outputAstView");

    function parse () {
        clear();
        outputView.innerHTML = codeToHtmlString(codeEdit.value);
        outputAstView.innerHTML = codeToAstString(codeEdit.value);
    }

    function interpret () {
        clear();
        function exHandler (ex : Asi) {
            outputView.innerHTML = "Exception: <br>" + asiToHtmlString(ex);
            outputView.innerHTML = "Exception: <br>" + asiToHtmlAstString(ex);
        }

        var parser = new Parser();
        var al = parser.parse(codeEdit.value);
        var i = new Interpreter(exHandler);
        var sc = new Scope(undefined, al);
        var res = sc.accept(i);
        outputView.innerHTML += asiToHtmlString(res);
        outputAstView.innerHTML += asiToHtmlAstString(res);
    }

    function clear () {
        outputView.innerHTML = "";
        outputAstView.innerHTML = "";
    }

    parseButton.addEventListener('click', () => {
        parse();
    });

    evalButton.addEventListener('click', () => {
        interpret();
    });

    parse();


}

