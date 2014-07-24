/// <reference path="common.ts"/>
/// <reference path="ide.ts"/>

interface ExceptionHandler {
    exception (ex : Exp) : void
}




interface LogWriter {
    fatal (msg : string) : void;
    error (msg : string) : void;
    warn (msg : string) : void;
    suggest (msg : string) : void;
    info (msg : string) : void;
    notice (msg : string) : void;
}




interface Logger extends LogWriter {
    clear () : void;
}




interface OutputWriter {
    write (asi : Asi) : void;
}



interface AsiToStringFn {
    (asi : Asi) : string;
}




interface OutputView {
    show (asi : Asi) : void;
    write (asi : Asi) : void;
    clear () : void;
}




interface TextWriter {

    write(...values : string[]) : void;
}




interface CodeWriter {

    key(value : string) : CodeWriter;
    ident(value : string, cssClass? : string) : CodeWriter;
    type(value : string, cssClass? : string) : CodeWriter;
    attr(value : string, cssClass? : string) : CodeWriter;
    markup(value : string) : CodeWriter;
    comment(value : string) : CodeWriter;
    text(value : string) : CodeWriter;
    num(value : string) : CodeWriter;
    writeOp(value : string, cssClass? : string) : CodeWriter;

    newLine() : CodeWriter;
    space() : CodeWriter;

    tab() : CodeWriter;
    unTab() : CodeWriter;

    //beginUnused() : CodeWriter;
    //endUnused() : CodeWriter;

    //beginError() : CodeWriter;
    //endError() : CodeWriter;

    //beginWarning() : CodeWriter;
    //endWarning() : CodeWriter;

    //beginNotice() : CodeWriter;
    //endNotice() : CodeWriter;
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




class HtmlOutputView implements OutputView {

    private outputView : HTMLPreElement;
    private asiToStringFn : AsiToStringFn;

    constructor (outputView : HTMLPreElement, asiToStringFn : AsiToStringFn) {
        this.outputView = outputView;
        this.asiToStringFn = asiToStringFn;
    }

    show (asi : Asi) : void {
        this.outputView.innerHTML = this.asiToStringFn(asi);
    }

    write (asi : Asi) : void {
        this.outputView.innerHTML += this.asiToStringFn(asi) + "<br>";
    }

    clear () : void {
        this.outputView.innerHTML = "";
    }

    element () : HTMLPreElement {
        return this.outputView;
    }
}




class OutputLogger implements Logger, ExceptionHandler, OutputWriter {

    private logView : HTMLElement;
    private outputView : OutputView;
    private outputAstView : OutputView;

    constructor (logView : HTMLElement,
                 outputView : OutputView,
                 outputAstView : OutputView) {
        this.logView = logView;
        this.outputView = outputView;
        this.outputAstView = outputAstView
    }

    fatal (msg : string) : void {
        this.log('fatal', msg);
        //throw msg;
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
        // todo show somehow it is exception
        this.outputView.write(ex);
        this.outputAstView.write(ex)
    }

    write (asi : Asi) : void {
        this.outputView.write(asi);
        this.outputAstView.write(asi);
    }

    private log (img : string, msg : string) : void {
        this.logView.innerHTML += "<div class='logItem'><span class='" + img +
            "' title='" + img + "'></span><span>" + msg + "</span></div>";
    }

    clear () {
        this.logView.innerHTML = "";
    }
}




class ConsoleLogger implements LogWriter, ExceptionHandler, OutputWriter {

    fatal (msg : string) : void {
        this.log('fatal', msg);
        //throw msg;
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
        console.log("Exception: " + Ide.asiToHtmlString(ex));
        console.log("Exception: " + Ide.asiToHtmlDebugString(ex));
    }

    write (asi : Asi) : void {
        console.log(Ide.asiToPlainString(asi));
        console.log(Ide.asiToPlainDebugString(asi));
    }

    private log (img : string, msg : string) : void {
        console.log("<div class='logItem'><span class='" + img +
                        "'></span>" + img + ": " + msg + "<div>");
    }
}




class HtmlCodeWriter implements CodeWriter {

    private tw : TextWriter;
    private tabs : string;


    constructor (tw : TextWriter) {
        this.tw = tw;
        this.tabs = "";
    }


    private w (style : string, value : string, cssClass : string = "") : void {
        if (cssClass !== "")
            cssClass = " " + cssClass;
        this.tw.write("<span class='efekt", style, cssClass, "'>", value,
                      "</span>");
    }


    key (value : string) : CodeWriter {
        this.w('Key', value);
        return this;
    }

    ident (value : string, cssClass : string = "") : CodeWriter {
        this.w('Ident', value, cssClass);
        return this;
    }

    type (value : string, cssClass : string = "") : CodeWriter {
        this.w('Type', value, cssClass);
        return this;
    }

    attr (value : string, cssClass : string = "") : CodeWriter {
        this.w('Attr', value, cssClass);
        return this;
    }

    markup (value : string) : CodeWriter {
        this.w('Markup', value);
        return this;
    }

    comment (value : string) : CodeWriter {
        this.w('Comment', value);
        return this;
    }

    text (value : string) : CodeWriter {
        this.w('Text', value);
        return this;
    }

    num (value : string) : CodeWriter {
        this.w('Num', value);
        return this;
    }

    writeOp (value : string, cssClass : string = "") : CodeWriter {
        this.w('Op', value, cssClass);
        return this;
    }

    newLine () : CodeWriter {
        this.tw.write("<br>");
        this.tw.write(this.tabs);
        return this;
    }

    space () : CodeWriter {
        this.tw.write(" ");
        return this;
    }

    tab () : CodeWriter {
        this.tabs += "    ";
        return this;
    }

    unTab () : CodeWriter {
        this.tabs = this.tabs.substr(0, this.tabs.length - 4);
        return this;
    }
}




class PlainTextCodeWriter implements CodeWriter {

    private tw : TextWriter;
    private tabs : string;


    constructor (tw : TextWriter) {
        this.tw = tw;
        this.tabs = "";
    }

    key (value : string) : CodeWriter {
        this.tw.write(value);
        return this;
    }

    ident (value : string, cssClass : string = "") : CodeWriter {
        this.tw.write(value);
        return this;
    }

    type (value : string, cssClass : string = "") : CodeWriter {
        this.tw.write(value);
        return this;
    }

    attr (value : string, cssClass : string = "") : CodeWriter {
        this.tw.write(value);
        return this;
    }

    markup (value : string) : CodeWriter {
        this.tw.write(value);
        return this;
    }

    comment (value : string) : CodeWriter {
        this.tw.write(value);
        return this;
    }

    text (value : string) : CodeWriter {
        this.tw.write(value);
        return this;
    }

    num (value : string) : CodeWriter {
        this.tw.write(value);
        return this;
    }

    writeOp (value : string, cssClass : string = "") : CodeWriter {
        this.tw.write(value);
        return this;
    }

    newLine () : CodeWriter {
        this.tw.write("\n");
        this.tw.write(this.tabs);
        return this;
    }

    space () : CodeWriter {
        this.tw.write(" ");
        return this;
    }

    tab () : CodeWriter {
        this.tabs += "    ";
        return this;
    }

    unTab () : CodeWriter {
        this.tabs = this.tabs.substr(0, this.tabs.length - 4);
        return this;
    }
}