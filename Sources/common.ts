/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="debugprinter.ts"/>




function combineAsiLists (first : AsiList, second : AsiList) : AsiList {
    var alCombined : Asi[] = [];
    for (var i = 0; i < first.items.length; i++)
        alCombined.push(first.items[i]);
    for (var i = 0; i < second.items.length; i++)
        alCombined.push(second.items[i]);
    return new AsiList(undefined, alCombined);
}




function arrToStr (arr : Arr) : string {
    var s : string[] = [];
    var items = arr.list.items;
    for (var i = 0; i < items.length; ++i)
        s.push((<Char>items[i]).value);
    return s.join("");
}




function asiToString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new PlainTextCodeWriter(sw);
    var p = new Printer(cw);
    asi.accept(p);
    return sw.getString();
}




function asiToHtmlAstString (asi : Asi, invisibleBraced = false) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw, invisibleBraced);
    asi.accept(p);
    return sw.getString();
}




function asiToHtmlString (asi : Asi) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new Printer(cw);
    asi.accept(p);
    return sw.getString();
}




function codeToAstString (code : string,
                          logger : LogWritter,
                          invisibleBraced = false) : string {
    var parser = new Parser(logger);
    var al = parser.parse(code);
    return asiToAstString(al, invisibleBraced);
}




function codeToHtmlString (code : string, logger : LogWritter) : string {
    var parser = new Parser(logger);
    var al = parser.parse(code);
    return asiToHtmlString(al);
}




function asiToAstString (asi : Asi, invisibleBraced = false) : string {
    var sw = new StringWriter();
    var cw = new HtmlCodeWriter(sw);
    var p = new DebugPrinter(cw, invisibleBraced);
    asi.accept(p);
    return sw.getString();
}




function $id (elementId : string) : HTMLElement {
    return document.getElementById(elementId);
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
