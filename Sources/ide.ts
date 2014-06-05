/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>
/// <reference path="namer.ts"/>
/// <reference path="typer.ts"/>
/// <reference path="prelude.ts"/>


class Ide {

    static lastTarget : HTMLElement;
    static lastClass : string;

    static outputView : HtmlOutputView;
    static outputAstView : OutputView;
    static outputLogger : OutputLogger;
    static parser : Parser;
    static namer : Namer;
    static typer : Typer;
    static interpreter : Interpreter;


    static init () {

        var codeEdit = <HTMLTextAreaElement>$id("codeEdit");

        Ide.outputView = new HtmlOutputView(
            <HTMLPreElement>$id("outputView"),
            asiToHtmlString);
        Ide.outputAstView = new HtmlOutputView(
            <HTMLPreElement>$id("outputAstView"),
            asiToAstString);
        Ide.outputLogger = new OutputLogger(<HTMLDivElement>$id("logView"),
                                            Ide.outputView,
                                            Ide.outputAstView);
        Ide.parser = new Parser(Ide.outputLogger);
        Ide.namer = new Namer(Ide.outputLogger);
        Ide.typer = new Typer(Ide.outputLogger);
        Ide.interpreter = new Interpreter(Ide.outputLogger,
                                          Ide.outputLogger,
                                          Ide.outputLogger);


        $id("parseButton").addEventListener('click', () => {
            Ide.doWithExceptionHandling(()=> {
                Ide.outputLogger.clear();
                Ide.parse(codeEdit.value);
            });
        });

        $id("usagesButton").addEventListener('click', () => {
            Ide.doWithExceptionHandling(()=> {
                Ide.outputLogger.clear();
                Ide.usages(codeEdit.value);
            });
        });

        $id("typeButton").addEventListener('click', () => {
            Ide.doWithExceptionHandling(()=> {
                Ide.outputLogger.clear();
                Ide.doType(codeEdit.value);
            });
        });

        $id("runButton").addEventListener('click', () => {
            Ide.doWithExceptionHandling(()=> {
                Ide.outputLogger.clear();
                Ide.interpret(codeEdit.value);
            });
        });

        Ide.outputView.element().addEventListener(
            'mousemove',
            (event : MouseEvent) => {
                Ide.usagesMouseMove(event);
            });
    }




    static doWithExceptionHandling (fn : () => void) {
        try {
            fn();
        } catch (ex) {
            Ide.outputLogger.error(ex);
        }
    }




    static parse (code : string) : void {
        var al = Ide.parser.parse(code);
        Ide.outputView.show(al);
        Ide.outputAstView.show(al);
    }




    static usages (code : string) {
        var al = Ide.parser.parse(code);
        var sc = new Scope(undefined, combineAsiLists(prelude, al));
        sc.accept(Ide.namer);
        Ide.outputView.show(sc.list);
        Ide.outputAstView.show(sc.list);
    }




    static doType (code : string) {
        var al = Ide.parser.parse(code);
        var sc = new Scope(undefined, al);
        //sc.accept(Ide.namer);
        al.accept(Ide.typer);
        Ide.outputView.show(sc.list);
        Ide.outputAstView.show(sc.list);
    }




    static interpret (code : string) {
        var al = Ide.parser.parse(code);
        Ide.outputView.clear();
        Ide.outputAstView.clear();
        var sc = new Scope(undefined, combineAsiLists(prelude, al));
        var res = Ide.interpreter.run(sc);
        Ide.outputView.write(res);
        Ide.outputAstView.write(res);
    }




    static usagesMouseMove (event : MouseEvent) {
        var t = <HTMLElement>event.target || <HTMLElement>event.srcElement;
        if (Ide.lastClass && t === Ide.outputView.element()) {
            Ide.highlightToggle(Ide.lastClass);
            Ide.lastClass = undefined;
        }
        if (t === Ide.lastTarget)
            return;
        if (Ide.lastClass)
            Ide.highlightToggle(Ide.lastClass);
        Ide.lastTarget = t;
        var tcl = t.classList;
        for (var i = 0; i < tcl.length; ++i) {
            var cn = tcl[i];
            if (cn.indexOf("sc_") === 0) {
                Ide.lastClass = cn;
                break;
            }
        }
        if (Ide.lastClass)
            Ide.highlightToggle(Ide.lastClass);
    }




    static highlightToggle (className : string) {
        var usages = Ide.outputView.element().getElementsByClassName(className);
        for (var i = 0; i < usages.length; ++i) {
            var ucl = (<HTMLSpanElement>usages[i]).classList;
            if (ucl.contains('declr'))
                ucl.toggle('usageDeclr');
            else if (ucl.contains('write'))
                ucl.toggle('usageWrite');
            else if (ucl.contains('builtin'))
                ucl.toggle('usageBuiltin');
            else
                ucl.toggle('usageRead');
        }
    }

}