/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="debugprinter.ts"/>

interface ExceptionHandler {
    exception (ex : Exp) : void
}




interface Logger {
    error (msg : string) : void;
    warn (msg : string) : void;
    suggest (msg : string) : void;
    info (msg : string) : void;
    notice (msg : string) : void;
}




interface OutputWriter {
    write (asi : Asi) : void;
}




interface TextWriter {

    write(...values : string[]) : void;
}




class StringWriter implements TextWriter {

    private buffer : string[] = [];


    public getString () : string {
        return this.buffer.join("");
    }


    public clear () {
        this.buffer = [];
    }


    write (...values : string[]) : void {
        this.buffer.push.apply(this.buffer, values);
    }
}




class OutputLogger implements Logger, ExceptionHandler, OutputWriter {

    private logView : HTMLElement;
    private outputView : HTMLElement;
    private outputAstView : HTMLElement;

    constructor (el : HTMLElement,
                 outputView : HTMLElement,
                 outputAstView : HTMLElement) {
        this.logView = el;
        this.outputView = outputView;
        this.outputAstView = outputAstView
    }

    error (msg : string) : void {
        this.log('error', msg);
    }

    warn (msg : string) : void {
        this.log('warn', msg);
    }

    suggest (msg : string) : void {
        this.log('suggest', msg);
    }

    info (msg : string) : void {
        this.log('info', msg);
    }

    notice (msg : string) : void {
        this.log('notice', msg);
    }

    exception (ex : Exp) : void {
        this.outputView.innerHTML += "Exception: <br>" + asiToHtmlString(ex);
        this.outputAstView.innerHTML += "Exception: <br>" +
            asiToHtmlAstString(ex);
    }

    write (asi : Asi) : void {
        this.outputView.innerHTML += "<br>" + asiToHtmlString(asi);
        this.outputAstView.innerHTML += "<br>" + asiToHtmlAstString(asi);
    }

    private log (img : string, msg : string) : void {
        this.logView.innerHTML += "<span class='logItem'><span class='" + img +
            "></span>" + msg + "</span>";
    }
}




function asiToString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new PlainTextCodeWriter(sw);
    var p = new Printer(cw);
    asi.accept(p);
    var str = sw.getString();
    return str;
}




function asiToHtmlAstString (asi : Asi, invisibleBraced = false) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw, invisibleBraced);
    asi.accept(p);
    var str = sw.getString();
    return str;
}




function asiToHtmlString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new Printer(cw);
    asi.accept(p);
    var str = sw.getString();
    return str;
}




var logView = <HTMLDivElement>document.getElementById("logView");
var outputView = <HTMLPreElement>document.getElementById("outputView");
var outputAstView = <HTMLPreElement>document.getElementById("outputAstView");
var logger = new OutputLogger(logView, outputView, outputAstView);




function codeToAstString (code : string, invisibleBraced = false) : string {
    var parser = new Parser(logger);
    var al = parser.parse(code);
    return asiToAstString(al, invisibleBraced);
}




function codeToHtmlString (code : string) : string {
    var parser = new Parser(logger);
    var al = parser.parse(code);
    return asiToHtmlString(al);
}




function asiToAstString (asi : Asi, invisibleBraced = false) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw, invisibleBraced);
    asi.accept(p);
    var str = sw.getString();
    return str;
}




function assume (test : boolean) {
    if (!test)
        throw "Assumtion failed";
}




interface Object {
    getTypeName () : string;
}




Object.prototype.getTypeName = function () : string {
    var str = (this.prototype
        ? this.prototype.constructor
        : this.constructor).toString();
    var cname = str.match(/function\s(\w*)/)[1];
    var aliases = ["", "anonymous", "Anonymous"];
    return aliases.indexOf(cname) > -1 ? "Function" : cname;
};




interface Array<T> {
    contains (item : T) : boolean;
    removeAt (index : number) : void;
    last () : T;
}




Array.prototype.contains = function<T> (item : T) : boolean {
    return this.indexOf(item) !== -1;
};




Array.prototype.removeAt = function (index : number) : void {
    this.splice(index, 1);
};




Array.prototype.last = function<T> () : T {
    return this[this.length - 1];
};
