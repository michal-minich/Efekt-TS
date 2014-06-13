/// <reference path="ast.ts"/>

var prelude : AsiList;

var preludeStr = "";/*
    ' var print = @builtin("print") @ioWrite fn (@params a)' +
    ' var op+ = @builtin("+") fn (a, b)' +
    ' var op- = @builtin("-") fn (a, b)' +
    ' var op* = @builtin("*") fn (a, b)' +
    ' var op< = @builtin("<") fn (a, b)' +
    ' var op> = @builtin(">") fn (a, b)' +
    ' var op== = @builtin("==") fn (a, b)' +
    ' var op!= = @builtin("!=") fn (a, b)' +
    ' var at = @builtin("at") fn (arr, index)' +
    ' var count = @builtin("count") fn (arr)' +
    ' var add = @builtin("add") fn (arr, item)' +
    ' var target = @builtin("target") fn (ref)' +
    ' var random = @builtin("target") @readsMutableState @writesMutableState fn (min, max)' +
    ' var input = @builtin("target") @nondeterministic fn (output)' +
    ' void';*/