/// <reference path="tests.ts"/>
/// <reference path="ide.ts"/>


function start () {

    unitTests();

    Ide.init();

    Ide.usages((<HTMLTextAreaElement>$id("codeEdit")).value);
}

