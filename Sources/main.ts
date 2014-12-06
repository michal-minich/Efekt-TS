/// <reference path="tests.ts"/>
/// <reference path="ide.ts"/>

"use strict";

document.addEventListener("DOMContentLoaded", function () {

    Ide.init();

    unitTests();

    Ide.parse((<HTMLTextAreaElement>$id("codeEdit")).value);
});