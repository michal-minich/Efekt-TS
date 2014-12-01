/// <reference path="tests.ts"/>
/// <reference path="ide.ts"/>

"use strict";

function start () {

    Ide.init();

    unitTests();

    Ide.parse((<HTMLTextAreaElement>$id("codeEdit")).value);
}