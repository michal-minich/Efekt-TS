/// <reference path="common.ts"/>

interface CodeWriter {

    writeKey(value : string) : void;
    writeIdent(value : string) : void;
    //writeType(value : string) : void;
    writeMarkup(value : string) : void;
    writeComment(value : string) : void;
    writeText(value : string) : void;
    writeNum(value : string) : void;
    writeOp(value : string) : void;

    writeNewLine() : void;
    writeSpace() : void;

    tab() : void;
    unTab() : void;

    //beginUnused() : void;
    //endUnused() : void;

    //beginError() : void;
    //endError() : void;

    //beginWarning() : void;
    //endWarning() : void;

    //beginNotice() : void;
    //endNotice() : void;
}




class TextCodeWriter implements CodeWriter {

    private tw : TextWriter;


    constructor (tw : TextWriter) {
        this.tw = tw;
    }


    writeKey (value : string) : void {
        this.tw.write(value);
    }

    writeIdent (value : string) : void {
        this.tw.write(value);
    }

    writeMarkup (value : string) : void {
        this.tw.write(value);
    }

    writeComment (value : string) : void {
        this.tw.write(value);
    }

    writeText (value : string) : void {
        this.tw.write(value);
    }

    writeNum (value : string) : void {
        this.tw.write(value);
    }

    writeOp (value : string) : void {
        this.tw.write(value);
    }

    writeNewLine () : void {
        this.tw.writeNewLine();
    }

    writeSpace () : void {
        this.tw.write(" ");
    }

    tab () : void {
        this.tw.write("");
        this.writeNewLine();
    }

    unTab () : void {
        this.tw.write("");
        this.writeNewLine();
    }
}