/// <reference path="common.ts"/>

interface CodeWriter {

    key(value : string) : CodeWriter;
    ident(value : string, cssClass? : string) : CodeWriter;
    type(value : string) : CodeWriter;
    markup(value : string) : CodeWriter;
    comment(value : string) : CodeWriter;
    text(value : string) : CodeWriter;
    num(value : string) : CodeWriter;
    writeOp(value : string) : CodeWriter;

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

    type (value : string) : CodeWriter {
        this.w('Type', value);
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

    writeOp (value : string) : CodeWriter {
        this.w('Op', value);
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

    type (value : string) : CodeWriter {
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

    writeOp (value : string) : CodeWriter {
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