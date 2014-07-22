/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="debugprinter.ts"/>


interface EnvValues<T> {
    [name : string] : T;
}


interface DeclareIx {
    [name : string] : number;
}




class Env<T> {

    public parent : Env<T>;
    public id : number;

    private static lastId = 0;
    public values : EnvValues<T> = {};
    private declareIxs : DeclareIx = {};
    private logger : LogWriter;

    constructor (parent : Env<T>, logger : LogWriter) {
        this.parent = parent;
        this.logger = logger;
        this.id = Env.lastId++;
    }

    create () : Env<T> {
        return new Env<T>(this, this.logger);
    }

    duplicate () : Env<T> {
        var e = new Env<T>(this.parent, this.logger);
        for (var key in this.values)
            e.values[key] = this.values[key];
        return e;
    }

    contains (name : string) : boolean {
        return this.getDeclaringEnv(name) !== undefined;
    }

    containsDirectly (name : string) : boolean {
        return this.values[name] !== undefined;
    }

    containsIndirectly (name : string) : boolean {
        return !this.containsDirectly(name) && this.contains(name);
    }

    declare (name : string, value : T, declareIx? : number) {
        if (this.values[name]) {
            if (this.declareIxs[name] !== declareIx)
                this.logger.error("Variable '" + name +
                                      "' is already declared.");
        } else {
            this.declareIxs[name] = declareIx;
        }
        this.values[name] = value;
    }

    get (name : string) : T {
        var e = this.getDeclaringEnv(name);
        if (e)
            return e.values[name];
        this.logger.error("Variable '" + name + "' is not declared.");
        return undefined;
    }

    getDirectly (name : string) : T {
        var value = this.values[name];
        if (value)
            return value;
        this.logger.error("Variable '" + name + "' is not declared.");
        return undefined;
    }

    set (name : string, value : T) {
        this.getDeclaringEnv(name).values[name] = value;
    }

    getDeclaringEnv (name : string) : Env<T> {
        var e = this;
        do {
            var item = e.values[name];
            if (item)
                return e;
            e = e.parent;
        } while (e);
        return undefined;
    }
}




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
