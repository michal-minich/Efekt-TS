/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="debugprinter.ts"/>

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




function codeToAstString (code : string, invisibleBraced = false) : string {
    var parser = new Parser();
    var al = parser.parse(code);
    return asiToAstString(al, invisibleBraced);
}




function codeToHtmlString (code : string) : string {
    var parser = new Parser();
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
