/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>

class BuiltIns {

    static fn (name : string) : BuiltinFn {
        switch (name) {
            case '+':
                return function (args) {
                    return new Int(undefined,
                                   "" + (+(<Int>args[0]).value +
                                       +(<Int>args[1]).value));
                };
            case '-':
                return function (args) {
                    return new Int(undefined,
                                   "" + (+(<Int>args[0]).value -
                                       +(<Int>args[1]).value));
                };
            case '*':
                return function (args) {
                    return new Int(undefined,
                                   "" + (+(<Int>args[0]).value *
                                       +(<Int>args[1]).value));
                };
            case '<':
                return function (args) {
                    return new Bool(undefined,
                                    +(<Int>args[0]).value <
                                        +(<Int>args[1]).value);
                };
            case '>':
                return function (args) {
                    return new Bool(undefined,
                                    +(<Int>args[0]).value >
                                        +(<Int>args[1]).value);
                };
            case '==':
                return function (args) {
                    return new Bool(undefined,
                                    asiToString(args[0]) ==
                                        asiToString(args[1]));
                };
            case '!=':
                return function (args) {
                    return new Bool(undefined,
                                    asiToString(args[0]) !=
                                        asiToString(args[1]));
                };
            case 'print':
                return function (args : Exp[]) {
                    var outputView = <HTMLPreElement>$id("outputView");
                    var outputAstView = <HTMLPreElement>$id("outputAstView");
                    for (var i = 0; i < args.length; ++i) {
                        outputView.innerHTML += asiToHtmlString(args[i]) +
                            "<br>";
                        outputAstView.innerHTML += asiToAstString(args[i]) +
                            "<br>";
                    }
                    return Void.instance;
                };
            case 'at':
                return function (args : Exp[]) {
                    var arr = <Arr>args[0];
                    var ix = <Int>args[1];
                    return arr.list.items[+ix.value];
                };
            case 'count':
                return function (args : Exp[]) {
                    var arr = <Arr>args[0];
                    return new Int(undefined, "" + arr.list.items.length);
                };
            case 'add':
                return function (args : Exp[]) {
                    var arr = <Arr>args[0];
                    var item = args[1];
                    item.parent = arr.list;
                    arr.list.items.push(item);
                    return arr;
                };
            case 'target':
                return function (args : Exp[]) {
                    return args[0];
                };
            default:
                return undefined;
        }
    }
}