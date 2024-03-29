/// <reference path="tests.ts"/>
/// <reference path="common.ts"/>
/// <reference path="debugprinter.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="interpreter.ts"/>
/// <reference path="prelude.ts"/>
"use strict";


document.addEventListener("DOMContentLoaded", function () {

    Ide.init();

    unitTests();

    Ide.parse((<HTMLTextAreaElement>$id("codeEdit")).value);
});


class Ide {

    static lastTarget : HTMLElement;
    static lastClass : string;

    static outputView : HtmlOutputView;
    static outputAstView : OutputView;
    static outputLogger : OutputLogger;

    static parser : Parser;
    static interpreter : Interpreter;

    static stringWriter : StringWriter;

    static htmlCodeWriter : HtmlCodeWriter;
    static printer : Printer;
    static debugPrinter : DebugPrinter;

    static plainCodeWriter : PlainTextCodeWriter;
    static plainPrinter : Printer;
    static plainDebugPrinter : DebugPrinter;


    static init () {

        const codeEdit = <HTMLTextAreaElement>$id("codeEdit");

        Ide.outputView = new HtmlOutputView(
            <HTMLPreElement>$id("outputView"),
            Ide.asiToHtmlString);
        Ide.outputAstView = new HtmlOutputView(
            <HTMLPreElement>$id("outputAstView"),
            Ide.asiToHtmlDebugString);
        Ide.outputLogger = new OutputLogger(<HTMLDivElement>$id("logView"),
                                            Ide.outputView,
                                            Ide.outputAstView);

        Ide.parser = new Parser(Ide.outputLogger);
        Ide.interpreter = new Interpreter(Ide.outputLogger,
                                          Ide.outputLogger,
                                          Ide.outputLogger);

        Ide.stringWriter = new StringWriter();

        Ide.htmlCodeWriter = new HtmlCodeWriter(Ide.stringWriter);
        Ide.printer = new Printer(Ide.htmlCodeWriter);
        Ide.debugPrinter = new DebugPrinter(Ide.htmlCodeWriter);

        Ide.plainCodeWriter = new PlainTextCodeWriter(Ide.stringWriter);
        Ide.plainPrinter = new Printer(Ide.plainCodeWriter);
        Ide.plainDebugPrinter = new DebugPrinter(Ide.plainCodeWriter);

        $id("parseButton").addEventListener('mousedown', () => {
            Ide.doWithExceptionHandling(()=> {
                Ide.outputLogger.clear();
                Ide.parse(codeEdit.value);
            });
        });

        $id("runButton").addEventListener('mousedown', () => {
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




    static asiToHtmlString (asi : Asi) : string {
        return Ide.asiToString(asi, Ide.printer);
    }



    static asiToHtmlDebugString (asi : Asi, invisibleBraced = false) : string {
        Ide.debugPrinter.invisibleBraced = invisibleBraced;
        return Ide.asiToString(asi, Ide.debugPrinter);
    }




    static asiToPlainString (asi : Asi) : string {
        return Ide.asiToString(asi, Ide.plainPrinter);
    }




    static asiToPlainDebugString (asi : Asi, invisibleBraced = false) : string {
        Ide.plainDebugPrinter.invisibleBraced = invisibleBraced;
        return Ide.asiToString(asi, Ide.plainDebugPrinter);
    }




    static asiToString (asi : Asi, printer : AstVisitor<void>) : string {
        asi.accept(printer);
        const res = Ide.stringWriter.getString();
        Ide.stringWriter.clear();
        return res;
    }




    private static doWithExceptionHandling (fn : () => void) {
        try {
            fn();
        } catch (ex) {
            Ide.outputLogger.fatal(ex);
        }
    }




    static parse (code : string) : void {
        const al = Ide.parser.parse(code);
        Ide.outputView.show(al);
        Ide.debugPrinter.printInfTypes = false;
        Ide.outputAstView.show(al);
    }




    static interpret (code : string) {
        var al = Ide.parser.parse(code);
        Ide.outputView.clear();
        Ide.outputAstView.clear();
        al = combineAsiLists(prelude, al);
        //Ide.typer.visitScope(sc);
        const res = Ide.interpreter.run(al.items);
        Ide.outputView.write(res);
        Ide.debugPrinter.printInfTypes = false;
        Ide.outputAstView.write(res);
    }




    static usagesMouseMove (event : MouseEvent) {
        const t = <HTMLElement>event.target || <HTMLElement>event.srcElement;
        if (Ide.lastClass && t === Ide.outputView.element()) {
            Ide.highlightToggle(Ide.lastClass);
            Ide.lastClass = undefined;
        }
        if (t === Ide.lastTarget)
            return;
        if (Ide.lastClass)
            Ide.highlightToggle(Ide.lastClass);
        Ide.lastTarget = t;
        const tcl = t.classList;
        for (var i = 0; i < tcl.length; ++i) {
            const cn = tcl[i];
            if (cn.indexOf("sc_") === 0) {
                Ide.lastClass = cn;
                break;
            }
        }
        if (Ide.lastClass)
            Ide.highlightToggle(Ide.lastClass);
    }




    static highlightToggle (className : string) {
        const usages = Ide.outputView.element().getElementsByClassName(className);
        for (var i = 0; i < usages.length; ++i) {
            const ucl = (<HTMLSpanElement>usages[i]).classList;
            if (ucl.contains('declr'))
                ucl.toggle('usageDeclr');
            else if (ucl.contains('write'))
                ucl.toggle('usageWrite');
            else if (ucl.contains('builtin'))
                ucl.toggle('usageBuiltin');
            else if (ucl.contains('undefined'))
                ucl.toggle('usageUndefined');
            else
                ucl.toggle('usageRead');
        }
    }

}