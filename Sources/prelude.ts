/// <reference path="ast.ts"/>

var prelude : AsiList;

var preludeIsFixed = false;

const preludeStr =
    ' var Any' +
    ' var Int' +
    ' var Bool' +
    ' var print = @builtin("print") @ioWrite fn (@params a : Any) -> Void' +
    ' var op+ = @builtin("+") fn (a : Int, b : Int) -> Int' +
    ' var op- = @builtin("-") fn (a : Int, b : Int) -> Int' +
    ' var op* = @builtin("*") fn (a : Int, b : Int) -> Int' +
    ' var op< = @builtin("<") fn (a : Int, b : Int) -> Bool' +
    ' var op> = @builtin(">") fn (a : Int, b : Int) -> Bool' +
    ' var op== = @builtin("==") fn (a : Int, b : Int) -> Bool' +
    ' var op!= = @builtin("!=") fn (a : Int, b : Int) -> Bool' +
    ' var at = @builtin("at") fn (arr : Any, index : Int) -> Any' +
    ' var count = @builtin("count") fn (arr : Any) -> Int' +
    ' var add = @builtin("add") fn (arr : Any, item : Any) -> Void' +
    ' var ref = @builtin("ref") fn (a : Any) -> Any' +
    ' var target = @builtin("target") fn (ref : Any) -> Any' +
    ' var random = @builtin("target") @readsMutableState ' +
    '@writesMutableState fn (min : Int, max : Int) -> Int' +
    ' var input = @builtin("target") @nondeterministic fn (output : Any) -> Any' +
    ' void';