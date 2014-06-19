/// <reference path="tests.ts"/>
/// <reference path="ide.ts"/>

"use strict";

function start () {

    unitTests();

    Ide.init();

    Ide.usages((<HTMLTextAreaElement>$id("codeEdit")).value);
}