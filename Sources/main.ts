/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>


function start () {

    unitTests();

    var codeInput = <HTMLTextAreaElement>document.getElementById("codeInput");
    var codeScratchpad = <HTMLTextAreaElement>document.getElementById("codeScratchpad");
    var parseButton = <HTMLButtonElement>document.getElementById("parseButton");
    var evalButton = <HTMLButtonElement>document.getElementById("evalButton");
    var codeView = <HTMLPreElement>document.getElementById("codeView");
    var astView = <HTMLPreElement>document.getElementById("astView");

    codeScratchpad.value = codeInput.value;

    function parse () {
        clear();
        codeView.innerHTML = codeToHtmlString(codeInput.value);
        astView.innerHTML = codeToAstString(codeInput.value);
    }

    function interpret () {
        clear();
        function exHandler (ex : Asi) {
            codeView.innerHTML = "Exception: <br>" + asiToHtmlString(ex);
            codeView.innerHTML = "Exception: <br>" + asiToHtmlAstString(ex);
        }

        var parser = new Parser();
        var al = parser.parse(codeInput.value);
        var i = new Interpreter(exHandler);
        var sc = new Scope(undefined, al);
        var res = sc.accept(i);
        codeView.innerHTML = asiToHtmlString(res);
        astView.innerHTML = asiToHtmlAstString(res);
    }

    function clear () {
        codeView.innerHTML = "...";
        astView.innerHTML = "...";
    }

    parseButton.addEventListener('click', () => {
        parse();
    });

    evalButton.addEventListener('click', () => {
        interpret();
    });

    parse();


}

