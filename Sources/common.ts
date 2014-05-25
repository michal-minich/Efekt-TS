/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="debugprinter.ts"/>

interface ExceptionHandler {
    exception (ex : Exp) : void
}




interface Logger {
    fatal (msg : string) : void;
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

    constructor (logView : HTMLElement,
                 outputView : HTMLElement,
                 outputAstView : HTMLElement) {
        this.logView = logView;
        this.outputView = outputView;
        this.outputAstView = outputAstView
    }

    fatal (msg : string) : void {
        this.log('fatal', msg);
        throw msg;
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
        this.outputView.innerHTML += "Exception: " + asiToHtmlString(ex) +
            "<br>";
        this.outputAstView.innerHTML += "Exception: " +
            asiToHtmlAstString(ex) + "<br>";
    }

    write (asi : Asi) : void {
        this.outputView.innerHTML += asiToHtmlString(asi) + "<br>";
        this.outputAstView.innerHTML += asiToHtmlAstString(asi) + "<br>";
    }

    private log (img : string, msg : string) : void {
        this.logView.innerHTML += "<div class='logItem'><span class='" + img +
            "' title='" + img + "'></span><span>" + msg + "</span></div>";
    }
}




class ConsoleLogger implements Logger, ExceptionHandler, OutputWriter {

    fatal (msg : string) : void {
        this.log('fatal', msg);
        throw msg;
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
        console.log("Exception: " + asiToHtmlString(ex));
        console.log("Exception: " + asiToHtmlAstString(ex));
    }

    write (asi : Asi) : void {
        console.log(asiToHtmlString(asi));
        console.log(asiToHtmlAstString(asi));
    }

    private log (img : string, msg : string) : void {
        console.log("<div class='logItem'><span class='" + img +
                        "'></span>" + img + ": " + msg + "<div>");
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




function codeToAstString (code : string,
                          logger : Logger,
                          invisibleBraced = false) : string {
    var parser = new Parser(logger);
    var al = parser.parse(code);
    return asiToAstString(al, invisibleBraced);
}




function codeToHtmlString (code : string, logger : Logger) : string {
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




function getTypeName (o : any) : string {
    var str = (o.prototype
        ? o.prototype.constructor
        : o.constructor).toString();
    var cname = str.match(/function\s(\w*)/)[1];
    var aliases = ["", "anonymous", "Anonymous"];
    return aliases.indexOf(cname) > -1 ? "Function" : cname;
}




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
