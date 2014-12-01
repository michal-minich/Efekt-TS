/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="ide.ts"/>


interface BuiltinsList {
    [fnName : string] : BuiltinFn;
}


var builtins : BuiltinsList = {

    'print': function (args : Exp[]) {
        for (var i = 0; i < args.length; ++i) {
            Ide.outputView.write(args[i]);
            Ide.outputAstView.write(args[i]);
        }
        return Void.instance;
    },

    '+': function (args) {
        return new Int(undefined,
                       "" + (+(<Int>args[0]).value + +(<Int>args[1]).value));
    },

    '-': function (args) {
        return new Int(undefined,
                       "" + (+(<Int>args[0]).value - +(<Int>args[1]).value));
    },

    '*': function (args) {
        return new Int(undefined,
                       "" + (+(<Int>args[0]).value * +(<Int>args[1]).value));
    },

    '<': function (args) {
        return new Bool(undefined,
                        +(<Int>args[0]).value < +(<Int>args[1]).value);
    },

    '>': function (args) {
        return new Bool(undefined,
                        +(<Int>args[0]).value > +(<Int>args[1]).value);
    },

    '==': function (args) {
        return new Bool(undefined,
                        Ide.asiToPlainString(args[0]) ==
                        Ide.asiToPlainString(args[1]));
    },

    '!=': function (args) {
        return new Bool(undefined,
                        Ide.asiToPlainString(args[0]) !=
                        Ide.asiToPlainString(args[1]));
    },

    'at': function (args : Exp[]) {
        var arr = <Arr>args[0];
        var ix = <Int>args[1];
        return arr.list.items[+ix.value];
    },

    'count': function (args : Exp[]) {
        var arr = <Arr>args[0];
        return new Int(undefined, "" + arr.list.items.length);
    },

    'add': function (args : Exp[]) {
        var arr = <Arr>args[0];
        var item = args[1];
        item.parent = arr.list;
        arr.list.items.push(item);
        return arr;
    },

    'target': function (args : Exp[]) {
        return args[0];
    }
};