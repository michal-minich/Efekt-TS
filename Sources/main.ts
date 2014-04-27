/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>

function start () {

    unitTests();

    var logView = <HTMLDivElement>document.getElementById("logView");
    var outputView = <HTMLPreElement>document.getElementById("outputView");
    var outputAstView = <HTMLPreElement>document.getElementById("outputAstView");
    var outputLogger = new OutputLogger(logView, outputView, outputAstView);
    var consoleLogger = new ConsoleLogger();

    var codeEdit = <HTMLTextAreaElement>document.getElementById("codeEdit");
    var parseButton = <HTMLButtonElement>document.getElementById("parseButton");
    var runButton = <HTMLButtonElement>document.getElementById("runButton");

    function parse () {
        clear();
        outputView.innerHTML = codeToHtmlString(codeEdit.value, outputLogger);
        outputAstView.innerHTML = codeToAstString(codeEdit.value,
                                                  consoleLogger);
    }

    function interpret () {
        clear();
        var parser = new Parser(outputLogger);
        var al = parser.parse(codeEdit.value);
        var i = new Interpreter(outputLogger, outputLogger, outputLogger);
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

    runButton.addEventListener('click', () => {
        interpret();
    });

    parse();


}

