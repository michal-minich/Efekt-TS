/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="ide.ts"/>


interface BuiltinsList {
    [fnName : string] : BuiltinFn;
}


const builtins : BuiltinsList = {

    'print': function (args : Exp[]) : Exp {
        for (var i = 0; i < args.length; ++i) {
            Ide.outputView.write(args[i]);
            Ide.outputAstView.write(args[i]);
        }
        return Void.instance;
    },

    '+': function (args : Exp[]) : Exp {
        return new Int("" + (+(<Int>args[0]).value + +(<Int>args[1]).value));
    },

    '-': function (args : Exp[]) : Exp {
        return new Int("" + (+(<Int>args[0]).value - +(<Int>args[1]).value));
    },

    '*': function (args : Exp[]) : Exp {
        return new Int("" + (+(<Int>args[0]).value * +(<Int>args[1]).value));
    },

    '<': function (args : Exp[]) : Exp {
        return new Bool(+(<Int>args[0]).value < +(<Int>args[1]).value);
    },

    '>': function (args : Exp[]) : Exp {
        return new Bool(+(<Int>args[0]).value > +(<Int>args[1]).value);
    },

    '==': function (args : Exp[]) : Exp {
        return new Bool(Ide.asiToPlainString(args[0]) ==
                        Ide.asiToPlainString(args[1]));
    },

    '!=': function (args : Exp[]) : Exp {
        return new Bool(Ide.asiToPlainString(args[0]) !=
                        Ide.asiToPlainString(args[1]));
    },

    'at': function (args : Exp[]) : Exp {
        const arr = <Arr>args[0];
        const ix = <Int>args[1];
        return <Exp>(arr.items[+ix.value]);
    },

    'count': function (args : Exp[]) : Exp {
        const arr = <Arr>args[0];
        return new Int("" + arr.items.length);
    },

    'add': function (args : Exp[]) : Exp {
        const arr = <Arr>args[0];
        const item = args[1];
        item.parent = arr;
        arr.items.push(item);
        return arr;
    },

    'target': function (args : Exp[]) : Exp {
        return args[0];
    }
};