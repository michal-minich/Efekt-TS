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




function asiToHtmlAstString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw);
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




function codeToAstString (code : string) : string {
    var parser = new Parser();
    var al = parser.parse(code);
    return asiToAstString(al);
}




function asiToAstString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw);
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




Object.prototype.getTypeName = function () {
    var str = (this.prototype
        ? this.prototype.constructor
        : this.constructor).toString();
    var cname = str.match(/function\s(\w*)/)[1];
    var aliases = ["", "anonymous", "Anonymous"];
    return aliases.indexOf(cname) > -1 ? "Function" : cname;
};