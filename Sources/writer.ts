/// <reference path="common.ts"/>

interface CodeWriter {

    writeKey(value : string) : CodeWriter;
    writeIdent(value : string) : CodeWriter;
    writeType(value : string) : CodeWriter;
    writeMarkup(value : string) : CodeWriter;
    writeComment(value : string) : CodeWriter;
    writeText(value : string) : CodeWriter;
    writeNum(value : string) : CodeWriter;
    writeOp(value : string) : CodeWriter;

    writeNewLine() : CodeWriter;
    writeSpace() : CodeWriter;

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


    private w (style : string, value : string) : void {
        this.tw.write("<span class='efekt", style, "'>", value, "</span>");
    }


    writeKey (value : string) : CodeWriter {
        this.w('Key', value);
        return this;
    }

    writeIdent (value : string) : CodeWriter {
        this.w('Ident', value);
        return this;
    }

    writeType (value : string) : CodeWriter {
        this.w('Type', value);
        return this;
    }

    writeMarkup (value : string) : CodeWriter {
        this.w('Markup', value);
        return this;
    }

    writeComment (value : string) : CodeWriter {
        this.w('Comment', value);
        return this;
    }

    writeText (value : string) : CodeWriter {
        this.w('Text', value);
        return this;
    }

    writeNum (value : string) : CodeWriter {
        this.w('Num', value);
        return this;
    }

    writeOp (value : string) : CodeWriter {
        this.w('Op', value);
        return this;
    }

    writeNewLine () : CodeWriter {
        this.tw.write("<br/>");
        this.tw.write(this.tabs);
        return this;
    }

    writeSpace () : CodeWriter {
        this.tw.write(" ");
        return this;
    }

    tab () : CodeWriter {
        this.tabs += "    ";
        this.writeNewLine();
        return this;
    }

    unTab () : CodeWriter {
        this.tabs = this.tabs.substr(0, this.tabs.length - 4);
        return this;
    }
}