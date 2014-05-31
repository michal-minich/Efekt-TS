/// <reference path="ast.ts"/>

var prelude : AsiList;

var preludeStr =
    ' var print = @builtin("print") fn (@params a)' +
    ' var op+ = @builtin("+") fn (a, b)' +
    ' var op- = @builtin("-") fn (a, b)' +
    ' var op* = @builtin("*") fn (a, b)' +
    ' var op< = @builtin("<") fn (a, b)' +
    ' var op> = @builtin(">") fn (a, b)' +
    ' var op== = @builtin("==") fn (a, b)' +
    ' var op!= = @builtin("!=") fn (a, b)' +
    ' var at = @builtin("at") fn (a, b)' +
    ' var count = @builtin("count") fn (a, b)' +
    ' var add = @builtin("add") fn (a, b)' +
    ' var target = @builtin("target") fn (a, b)' +
    ' void';