/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {

    unitTests();

    logView = <HTMLDivElement>document.getElementById("logView");
    outputView = <HTMLPreElement>document.getElementById("outputView");
    outputAstView = <HTMLPreElement>document.getElementById("outputAstView");
    logger = new OutputLogger(logView, outputView, outputAstView);

    var codeEdit = <HTMLTextAreaElement>document.getElementById("codeEdit");
    var parseButton = <HTMLButtonElement>document.getElementById("parseButton");
    var evalButton = <HTMLButtonElement>document.getElementById("evalButton");

    function parse () {
        clear();
        outputView.innerHTML = codeToHtmlString(codeEdit.value);
        outputAstView.innerHTML = codeToAstString(codeEdit.value);
    }

    function interpret () {
        clear();
        var parser = new Parser(logger);
        var al = parser.parse(codeEdit.value);
        var i = new Interpreter(logger, logger, logger);
        var sc = new Scope(undefined, al);
        var res = sc.accept(i);
        outputView.innerHTML += asiToHtmlString(res);
        outputAstView.innerHTML += asiToHtmlAstString(res);
    }

    function clear () {
        logView.innerHTML = "";
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

