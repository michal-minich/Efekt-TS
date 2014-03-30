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

    parseButton.addEventListener('click', () => {
        codeView.innerHTML = codeToHtmlString(codeInput.value);
        astView.innerHTML = codeToAstString(codeInput.value);
    });

    /*
        var exHandler = function (ex : Asi) {
            ex.accept(p);
            var str = sw.getString();
            document.getElementById("view").innerHTML = "Exception: " + str;
        };
    */
}

