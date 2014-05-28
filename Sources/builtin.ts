/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>

class BuiltInOps {

    static op (name : string) : BinFn {
        switch (name) {
            case '+':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value + +(<Int>b).value));
                };
            case '-':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value - +(<Int>b).value));
                };
            case '*':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value * +(<Int>b).value));
                };
            case '<':
                return function (a, b) {
                    return new Bool(undefined,
                                    +(<Int>a).value < +(<Int>b).value);
                };
            case '>':
                return function (a, b) {
                    return new Bool(undefined,
                                    +(<Int>a).value > +(<Int>b).value);
                };
            case '==':
                return function (a, b) {
                    return new Bool(undefined,
                                    asiToString(a) == asiToString(b));
                };
            case '!=':
                return function (a, b) {
                    return new Bool(undefined,
                                    asiToString(a) != asiToString(b));
                };
            default:
                throw "operator " + name + " is not defined.";
        }
    }
}