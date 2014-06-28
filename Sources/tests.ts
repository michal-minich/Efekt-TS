/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="interpreter.ts"/>
/// <reference path="ide.ts"/>




class TestReprot {

    private table : string[] = [];
    public failedCount = 0;
    private testCount = 0;
    private logger = new ConsoleLogger();


    constructor () {
        this.table.push("<table class='testReport'><thead><tr>",
                        "<th>#</th>",
                        "<th>Category</th>",
                        "<th>Code</th>",
                        "<th>Expected</th>",
                        "<th>Actual</th>",
                        "<th>Code AST</th>",
                        "<th>Expected AST</th>",
                        "<th>Actual AST</th>",
                        "</tr></thead><tbody class='efektCode'>");
    }




    addParse (code : string, expected : string, actualAsi : Asi) : void {
        this.add("Parse", code, expected, actualAsi, false);
    }




    addEval (code : string, expected : string, actualAsi : Asi) : void {
        this.add("Eval", code, expected, actualAsi, true);
    }




    private add (category : string,
                 code : string,
                 expected : string,
                 actualAsi : Asi,
                 isEval : boolean) : void {

        ++this.testCount;

        var actualPlain = Ide.asiToPlainString(actualAsi);
        var actualHtml = Ide.asiToHtmlString(actualAsi);
        var al = Ide.parser.parse(code);
        var codeAst = Ide.asiToHtmlDebugString(al, true);
        var expectedAst : string;

        try {
            var al = Ide.parser.parse(expected);
            if (isEval) {
                expectedAst = "";
                for (var i = 0; i < al.items.length; ++i) {
                    expectedAst += Ide.asiToHtmlDebugString(al.items[i], true);
                    if (i < al.items.length - 1)
                        expectedAst += "<br>";
                }
            } else {
                expectedAst = Ide.asiToHtmlDebugString(al, true);
            }
        } catch (ex) {
            expectedAst = ex;
        }

        var actualAst = Ide.asiToHtmlDebugString(actualAsi, true);


        var ok = expected === actualPlain && expectedAst === actualAst;

        var rowClass = "class='test" + (ok ? "Successful" : "Failed") + "'";

        if (ok) {
            //var rowClass = "";
            return;
        } else {
            ++this.failedCount;
        }

        this.table.push("<tr", rowClass, ">",
                        "<td>", "" + this.failedCount, "</td>",
                        "<td>", category, "</td>",
                        "<td>", code, "</td>",
                        "<td>", expected, "</td>",
                        "<td>", actualHtml, "</td>",
                        "<td>", codeAst, "</td>",
                        "<td>", expectedAst, "</td>",
                        "<td>", actualAst, "</td>",
                        "</tr>");
    }




    getReportString () : string {
        if (this.table.length === 10) {
            console.log("All " + this.testCount + " Tests OK");
            return "";
        }
        this.table.push("</tbody></table>");
        document.getElementById("mainView").style.display = "none";
        return "" + this.failedCount + " of " + this.testCount +
            " Tests Failed" +
            this.table.join("");
    }
}




class Test {

    private code : string;
    private parsed : AsiList;
    private logger = new ConsoleLogger();


    constructor (code : string, parsed : AsiList) {
        this.code = code;
        this.parsed = parsed;
    }




    parse (expected : string = this.code) : Test {
        testReport.addParse(this.code, expected, this.parsed);
        return this;
    }




    evalTo (expected : string) : Test {
        var exHandler = function (ex : Asi) {
        };
        var interpreter = new Interpreter(this.logger, this.logger,
                                          this.logger);
        var sc = new Scope(undefined, combineAsiLists(prelude, this.parsed));
        var evaled = interpreter.run(sc);
        testReport.addEval(this.code, expected, evaled);
        return this;
    }
}




var loggerX = new ConsoleLogger();




function t (code : string) : Test {
    var parser = new Parser(loggerX);
    var parsed = parser.parse(code);
    return new Test(code, parsed);
}




var testReport = new TestReprot();




function unitTests () {

    if (window.location.href.indexOf("notest") != -1)
        return;

    testSpecific();

    if (testReport.failedCount === 0) {
        parseTests();
    }

    if (testReport.failedCount === 0) {
        interpreterTests();
    }

    document.getElementById("testReport").innerHTML =
        testReport.getReportString();
}




function testSpecific () : void {

    //t("if a then struct b else struct c").parse("if a then struct b else struct { c }");
}




function parseTests () : void {

    t("").parse();
    t("void").parse();

    // comments
    t("a = 1 -- + 2\nb").parse("a = 1\nb");
    t("a = 1 /* + 2 */\nb").parse("a = 1\nb");

    // if
    t("if 1 then 2").parse();
    t("if a then b else c").parse();
    t("if 1 then 2 else if 3 then 4 else 5").parse();
    t("if a then { struct b } else { interface c }").parse(
        "if a then struct { b } else interface { c }");
    t("if a then { struct { b } } else { interface { c } }").parse(
        "if a then struct { b } else interface { c }");

    // struct
    t("struct a").parse("struct { a }");
    t("struct struct a").parse("struct { struct { a } }");
    t("struct struct { a } ").parse("struct { struct { a } }");
    t("struct { struct { a } } ").parse("struct { struct { a } }");
    t("struct { a } struct b").parse("struct { a }\nstruct { b }");

    // interface
    t("var I = interface { b }").parse();
    t("struct interface a").parse("struct { interface { a } }");
    t("interface struct a").parse("interface { struct { a } }");

    // new
    t("new Int").parse();

    // typeof
    t("typeof 1 + 2").parse("typeof (1 + 2)");
    t("typeof var a = 1").parse();

    // member access
    t("obj.member").parse();
    t("a.b.c.d").parse();
    t("((x.y).z).q").parse("((x.y).z).q");

    // try finally
    t("try a finally { var b }").parse("try a\nfinally var b");

    // throw
    t("throw 1 + 2").parse("throw (1 + 2)");
    t("throw \n throw ex").parse("throw\nthrow ex");

    // return
    t("return \n return 1 + 2").parse("return\nreturn (1 + 2)");

    // return
    t("import a").parse("import a");
    t("import a.b").parse("import a.b");
    t("import a.(b, c)").parse("import a.(b, c)");

    // break
    t("break continue").parse("break\ncontinue");

    // loop
    t("loop a").parse("loop { a }");
    t("loop { a b }").parse("loop {\n    a\n    b\n}");

    // true false
    t("if true then false").parse();
    t("false").parse();

    // fn apply
    t("a()").parse();
    t("a() b()").parse("a()\nb()");
    t("a(1)").parse();
    t("a(1, 2)").parse();
    t("a(b())").parse();
    t("a(b(), c())").parse();
    t("a(b(), c()) d()").parse("a(b(), c())\nd()");
    t("a(b(c(d())))").parse();
    t("a()()").parse();
    t("a()(1, b())").parse();
    t("a.b()").parse();
    t("a().b()").parse();
    t("1 + a()").parse("(1 + a())");
    t("a() + 2").parse("(a() + 2)");

    // fn apply with compound exp
    t("if a then b()").parse();
    t("(if a then b)()").parse();
    t("fn () { }()").parse();
    t("[0]()").parse();
    t("a() : T()").parse();
    t("struct { }()").parse();
    t("interface { }()").parse();
    t("loop { }()").parse();

    // array
    t("[]").parse();
    t("[1]").parse();
    t("[1, 2]").parse();
    t("[1, 2] 3").parse("[1, 2]\n3");
    t("0 [1, 2] 3").parse("0\n[1, 2]\n3");
    t("[1, 2] [3, 4]").parse("[1, 2]\n[3, 4]");
    t("[] [3, 4]").parse("[]\n[3, 4]");
    t("[1, 2] []").parse("[1, 2]\n[]");
    t("[1, [2, 3]] []").parse("[1, [2, 3]]\n[]");
    t("[] [] []").parse("[]\n[]\n[]");
    t("[1, 2, ((3 + 4) * 5), [6, 7], 8, 9]").parse();

    // scope braces
    t("{}").parse("{ }");
    t("{1}").parse("{ 1 }");
    t("{1  2} 3").parse("{\n    1\n    2\n}\n3");
    t("0 {1 2} 3").parse("0\n{\n    1\n    2\n}\n3");
    t("{1 2} {3 4}").parse("{\n    1\n    2\n}\n{\n    3\n    4\n}");
    t("{} {3 4}").parse("{ }\n{\n    3\n    4\n}");
    t("{1 2} {}").parse("{\n    1\n    2\n}\n{ }");
    t("{1 {2 3}} {}").parse("{\n    1\n    {\n        2\n" +
                                "        3\n    }\n}\n{ }");
    t("{} {} {}").parse("{ }\n{ }\n{ }");
    t("loop { x if a then b y } z").parse("loop {\n    x\n    " +
                                              "if a then b\n    y\n}\nz");

    // fn
    t("fn () { }").parse();
    t("fn (1) { }").parse();
    t("fn (1, 2) { }").parse();
    t("fn (1, 2) { a }").parse();
    t("fn (1, 2) { a b }").parse("fn (1, 2) {\n    a\n    b\n}");
    t("fn (1, 2) { fn () { c } }").parse();
    t("fn (1, 2) { fn (fn () { d }) { } }").parse();

    // var
    t("var a").parse();
    t("var b : T").parse();
    t("var c : T of Int").parse();
    t("var d : T of Int = 1").parse();
    t("var e : T = 1").parse();
    t("var f of Int = 1").parse();
    t("var g = 1").parse();
    t("var h of Int").parse();
    t("var i of Int = 1").parse();

    t("a").parse();
    t("b = 1").parse();
    t("c : T").parse();
    t("d of Int").parse();
    t("D of Int").parse();
    t("e : T = 1").parse();
    t("f : T of Int").parse();
    t("g of Int = 1").parse();
    t("G of Int = 1").parse();
    t("h : T of Int = Int").parse();

    t("var b = 1").parse();
    t("var c : T").parse();
    t("var d of Int").parse();
    t("var D of Int").parse();
    t("var e : T = 1").parse();
    t("var f : T of Int").parse();
    t("var g of Int = 1").parse();
    t("var G of Int = 1").parse();
    t("var h : T of Int = Int").parse();

    // var & op priority and precednce
    t("a = b = 1 + 2").parse("a = b = (1 + 2)");
    t("var a = b = 1 + 2").parse("var a = b = (1 + 2)");
    t("a = var b = 1 + 2").parse("a = var b = (1 + 2)");
    t("var a = var b = 1 + 2").parse("var a = var b = (1 + 2)");
    t("1 + 2 * a : T of Int == 2 * 3 + b : T of Int + 1").parse(
        "((1 + (2 * a : T of Int)) == (((2 * 3) + b : T of Int) + 1))");
    t("1 + 2 * var a : T of Int == 2 * 3 + var b : T of Int + 1").parse(
        "(1 + (2 * var (a : T of Int == ((2 * 3) + var (b : T of Int + 1)))))");
    t("var b : T of Int + 1").parse("var (b : T of Int + 1)");
    t("1 + var a = 2 + 3").parse("(1 + var a = (2 + 3))");
    t("1 + var a : T.U of X.Addable + 2").parse(
        "(1 + var (a : T.U of X.Addable + 2))");

    // braces and op priority and precedence
    t("a = 301 == 10 * 3 + 1").parse("a = (301 == ((10 * 3) + 1))");

    t("2 + 3 + 4").parse("((2 + 3) + 4)");
    t("(2 + 3) + 4").parse("((2 + 3) + 4)");
    t("1 + (2 + 3) + 4").parse("((1 + (2 + 3)) + 4)");
    t("1 + (2 + 3)").parse("(1 + (2 + 3))");

    t("2 * 3 + 4").parse("((2 * 3) + 4)");
    t("(2 * 3) + 4").parse("((2 * 3) + 4)");
    t("1 * (2 + 3) + 4").parse("((1 * (2 + 3)) + 4)");
    t("1 * (2 + 3)").parse("(1 * (2 + 3))");

    t("2 + 3 * 4").parse("(2 + (3 * 4))");
    t("(2 + 3) * 4").parse("((2 + 3) * 4)");
    t("1 + (2 * 3) + 4").parse("((1 + (2 * 3)) + 4)");
    t("1 + (2 * 3)").parse("(1 + (2 * 3))");

    t("((2 + 3)) * 4").parse("((2 + 3) * 4)");
    t("1 + (((2 * 3))) + 4").parse("((1 + (2 * 3)) + 4)");
    t("1 + ((((2 * 3))))").parse("(1 + (2 * 3))");
    t("1 * ((((2 + 3)))) + 4").parse("((1 * (2 + 3)) + 4)");
}




function interpreterTests () : void {

    t("").evalTo("void");
    t("void").evalTo("void");

    // ops
    t("1 + 2").evalTo("3");
    t("1 + 2 * 10").evalTo("21");
    t("(1 + 2) * 10").evalTo("30");

    // var & ops
    t("var a = 1").evalTo("1");
    t("var a = 1 a").evalTo("1");
    t("var a = 1 + 2").evalTo("3");
    t("var a = 1 + 2 * 10").evalTo("21");
    t("var a = (1 + 2) * 10").evalTo("30");
    t("var a = 1 a = a + 2").evalTo("3");
    t("var a = 1 a = a + 2 a").evalTo("3");

    // if
    t("if true then 1 else 2").evalTo("1");
    t("if false then 1 else 2").evalTo("2");

    // scoped names
    t("var a = 1 { var a = 2 }").evalTo("2");
    t("var a = 1 { var a = 2 } a").evalTo("1");
    t("var a = 1 { a = 2 } a").evalTo("2");

    // loop, break
    t("var a = 0 loop { if a == 0 then break } a").evalTo("0");
    t("var a = 0 loop { a = a + 1 if a == 10 then break } a").evalTo("10");

    // loop, continue

    // label, goto

    // import

    // struct, member access

    // array

    // throw

    // try, catch, throw

    // try, finally, throw

    // ref

    // interface on struct

    // typeof

    // new

    // fn
    t("var f = fn () { 1 } f()").evalTo("1");
    t("var f = fn (a) { a } f(1)").evalTo("1");
    t("var f = fn (a) { a + 1 } f(1)").evalTo("2");
    t("fn (a) { a }(1)").evalTo("1");

    // return
    t("var f = fn () { return 1 } f()").evalTo("1");

    // fn closure
    t("var f = fn () { fn (a) { a } } f()(1)").evalTo("1");
    t("var f = fn (a) { fn () { a } } f(1)()").evalTo("1");
    t("var f = fn (a) { fn (b) { a - b } } f(10)(1)").evalTo("9");
    t("var b = 0 var f = fn (a) { b = a } f(1)").evalTo("1");
    //t("var b = 0 var f = fn (a) { b = a } f(1) b").evalTo("1");
    t("var f { var a = 1 f = fn () { a } } f()").evalTo("1");
    t("var f = fn (x) { x() } var a = 1 f(fn() { a })").evalTo("1");
    t("var f = fn (x) { x() } { var a = 1 f(fn() { a }) }").evalTo("1");
    t("").evalTo("void");
}

/*

-- select, where
var select = fn (arr, f) {
  var r = []
  var i = 0
  loop {
    if i == arr.count() then break
    r.add(f(arr.at(i)))
    i = i + 1
  }
  return r
}

var where = fn (arr, f) {
  var r = []
  var i = 0
  loop {
    if i == arr.count() then break
    var item = arr.at(i)
    if f(item) then { r.add(item) }
    i = i + 1
  }
  return r
}
var s = fn (a) { a = a + 10 a.print() a }
var w = fn (a) { a > 6 }
[5, 6, 7, 8, 9].where(w).select(s)


-- adder
var adder = fn (init) {
  var state = init
  fn () { state = state + 1 }
}
var a = adder(5)
var b = adder(10)
print(a())
print(b())
print(a())
print(b())


-- fact
var f = 1
var n = 21
var c = 0
loop {
  c = c + 1
  f = f * c
  print(f)
  if n == c then break
}


-- fib
var prev = 0
var next = 1
var i = 0
loop {
  i = i + 1
  if i == 103 then break
  var sum = prev + next
  prev = next
  next = sum
  print(sum)
}


-- struct
print("init")
var S = struct {
    var a = 1
    var C = struct { var c = 10 }
    var b = C()
}
var s = S()
print(s.a)

print("test inner struct access")
print(s.b.c)

print("test inner struct take out")
var x = s.b
s.b.c = 20
print(x.c)
print(s.b.c)

print("test fn arg pass")
var c = s.C()
c.c = 11
var f = fn (a) { print(a.c) }
f(c)

print("test create in fn and return")
var g = fn (a) { s.C() s.b.c = 12 s }
var d = g()
print(d.b.c)

print("test copy assign")
var t = s
t.a = 2
print(s.a)

print("test copy arg")
var h = fn (x) { x.a = 3 }
h(s)
print(s.a)

print("test copy return")
var f = fn () { s }
var u = f()
u.a = 4
print(s.a)
print(u.a)


-- ref
var a = 1
var r = Ref(a)
var f = fn () { r }
a = 2
print(r)
print(target(r))
target(r) = 3
print(a)
target(f()) = 4
print(a)

*/