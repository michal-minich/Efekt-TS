/// <reference path="tests.ts"/>
/// <reference path="ide.ts"/>


function start () {

    unitTests();

    Ide.init();

    Ide.doType((<HTMLTextAreaElement>$id("codeEdit")).value);
}

