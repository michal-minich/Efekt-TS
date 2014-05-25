/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>
/// <reference path="usage.ts"/>
/// <reference path="origin.ts"/>


function start () {

    unitTests();

    var logView = <HTMLDivElement>document.getElementById("logView");
    var outputView = <HTMLPreElement>document.getElementById("outputView");
    var outputAstView = <HTMLPreElement>document.getElementById("outputAstView");
    var outputLogger = new OutputLogger(logView, outputView, outputAstView);
    var consoleLogger = new ConsoleLogger();

    var codeEdit = <HTMLTextAreaElement>document.getElementById("codeEdit");
    var parseButton = <HTMLButtonElement>document.getElementById("parseButton");
    var usagesButton = <HTMLButtonElement>document.getElementById("usagesButton");
    //var originButton = <HTMLButtonElement>document.getElementById("originButton");
    var runButton = <HTMLButtonElement>document.getElementById("runButton");

    function parse () {
        clear();
        outputView.innerHTML = codeToHtmlString(codeEdit.value, outputLogger);
        outputAstView.innerHTML = codeToAstString(codeEdit.value,
                                                  consoleLogger);
    }

    function usages () {
        clear();
        var parser = new Parser(outputLogger);
        var al = parser.parse(codeEdit.value);
        var usage = new Usage(outputLogger, outputLogger);
        var sc = new Scope(undefined, al);
        sc.accept(usage);
        outputView.innerHTML = asiToHtmlString(al);
        outputAstView.innerHTML = asiToHtmlAstString(al, false);
    }

    function origin () {
        clear();
        var parser = new Parser(outputLogger);
        var al = parser.parse(codeEdit.value);
        var usage = new Usage(outputLogger, outputLogger);
        var origin = new Origin(outputLogger, outputLogger);
        var sc = new Scope(undefined, al);
        sc.accept(usage);
        sc.accept(origin);
        outputView.innerHTML = asiToHtmlString(al);
        outputAstView.innerHTML = asiToHtmlAstString(al, false);
    }

    function interpret () {
        clear();
        var parser = new Parser(outputLogger);
        var al = parser.parse(codeEdit.value);
        var i = new Interpreter(outputLogger, outputLogger, outputLogger);
        var res = i.run(al);
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

    usagesButton.addEventListener('click', () => {
        usages();
    });

    /*originButton.addEventListener('click', () => {
        origin();
    });*/

    runButton.addEventListener('click', () => {
        interpret();
    });




    function highlightToggle (className : string) {
        var usages = outputView.getElementsByClassName(className);
        for (var i = 0; i < usages.length; ++i) {
            var u = <HTMLElement>usages[i];
            if (u.classList.contains('declr'))
                u.classList.toggle('usageDeclr');
            else if (u.classList.contains('write'))
                u.classList.toggle('usageWrite');
            else if (u.classList.contains('builtin'))
                u.classList.toggle('usageBuiltin');
            else
                u.classList.toggle('usage');
        }
    }

    var lastTarget : HTMLElement;
    var lastClass : string;

    outputView.addEventListener('mousemove', (event : MouseEvent) => {
        var t = <HTMLElement>event.target || <HTMLElement>event.srcElement;
        if (lastClass && t === outputView) {
            highlightToggle(lastClass);
            lastClass = undefined;
        }
        if (t === lastTarget)
            return;
        highlightToggle(lastClass);
        lastTarget = t;
        for (var i = 0; i < t.classList.length; ++i) {
            var cn = t.classList[i];
            if (cn.indexOf("sc_") === 0) {
                lastClass = cn;
                break;
            }
        }
        highlightToggle(lastClass);
    });

    usages();
}

