/// <reference path="writer.ts"/>
/// <reference path="parser.ts"/>


class DebugPrinter implements AstVisitor<void> {

    private cw : CodeWriter;

    public printInfTypes : boolean;
    public invisibleBraced : boolean;




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    private items (items : Asi[]) : CodeWriter {
        this.cw.tab().newLine().markup("items");
        if (items.length === 0) {
            this.cw.space().attr("&lt;empty&gt;");
            return this.cw.unTab();
        }
        this.cw.tab().newLine();
        for (var i = 0; i < items.length; i++) {
            this.cw.markup("" + i).space();
            items[i].accept(this);
            if (i + 1 !== items.length)
                this.cw.newLine();
        }
        return this.cw.unTab().unTab();
    }




    private key (name : string, asi : Asi) : DebugPrinter {
        this.cw.key(name);
        return this.printCommon(asi);
    }




    private type (name : string, asi : Asi) : DebugPrinter {
        this.cw.type(name);
        if (asi.attrs)
            this.field("attrs", asi.attrs);
        return this;
    }




    private field (name : string, value : any) : DebugPrinter {
        this.cw.tab().newLine().markup(name).space();
        if (value instanceof Asi)
            value.accept(this);
        else if (value instanceof Array)
            this.items(value);
        else
            value();
        this.cw.unTab();
        return this;
    }




    private fieldStr (name : string, value : string) : DebugPrinter {
        this.cw.tab().newLine().markup(name)
            .space().ident(value).unTab();
        return this;
    }




    private printCommon (asi : Asi) : DebugPrinter {
        if (this.printInfTypes) {
            /*if (asi.infType) {
                if (!(asi instanceof Stm)) {
                    this.cw.space().markup(":").space()
                        .type(Ide.asiToHtmlString(asi.infType));
                }
            } else {
                this.cw.space().markup(":").space().type("&lt;undefined&gt;");
            }*/
        }
        if (asi.attrs)
            this.field("attrs", asi.attrs);
        return this;
    }




    // values  ===============================================




    visitNew (nw : New) : void {
        this.key("New", nw).field("value", nw.value);
    }




    visitVoid (vo : Void) : void {
        this.key("Void", vo);
    }




    visitBool (b : Bool) : void {
        this.key("Bool", b);
        this.cw.tab().newLine().markup("value").space()
            .key(b.value === true ? "true" : "false").unTab().newLine();
    }




    visitInt (ii : Int) : void {
        this.key("Int", ii).field("value", () => this.cw.num(ii.value));
    }




    visitFloat (f : Float) : void {
        this.key("Float", f).field("value", () => this.cw.num(f.value));
    }




    visitChar (ch : Char) : void {
        this.key("Char", ch).field(
            "value", () => this.cw.text("'").text(ch.value).text("'"));
    }




    visitArr (arr : Arr) : void {
        this.key("Arr", arr)
            .field("items", arr.items)
            .field("itemType", arr.itemType);
    }




    visitFn (fn : Fn) : void {
        this.key("Fn", fn).field("params", fn.params);
        if (fn.body)
            this.field("body", fn.body);
    }




    // types ===============================================




    visitStruct (st : Struct) : void {
        this.key("Struct", st).field("body", st.body);
    }




    // internal ===============================================




    visitBuiltin (bi : Builtin) : void {
        this.key("Builtin", bi).field("fn", bi.fn);
    }




    visitClosure (cls : Closure) : void {
        this.key("Closure", cls).field("item", cls.item);
        this.cw.tab();
        for (var key in cls.env.values) {
            this.cw.newLine().markup(key).space();
            cls.env.values[key].accept(this);
        }
        this.cw.unTab();
    }




    // helpers ===============================================




    visitPragma (pg : Pragma) : void {
        this.key("Pragma", pg).field("exp", pg.exp);
    }


    // expressions ===============================================




    visitAssign (a : Assign) : void {
        this.key("Assign", a).field("slot", a.slot).field("value", a.value);
    }




    visitIdent (i : Ident) : void {
        this.key("Ident", i);
        this.cw.tab().newLine();
        this.cw.markup("name").space();
        if (i.isOp)
            this.cw.writeOp(i.name);
        else if (i.isKey)
            this.cw.key(i.name);
        else if (i.isType)
            this.cw.type(i.name);
        else if (i.isAttr)
            this.cw.attr(i.name);
        else
            this.cw.ident(i.name);
        this.cw.unTab();
    }




    visitMemberAccess (ma : MemberAccess) : void {
        this.key("MemberAccess", ma)
            .field("bag", ma.bag).field("member", ma.member);
    }




    visitFnApply (fna : FnApply) : void {
        this.key("FnApply", fna).field("fn", fna.fn).field("args", fna.args);
    }




    visitIf (i : If) : void {
        this.key("If", i).field("test", i.test).field("then", i.then);
        if (i.otherwise)
            this.field("otherwise", i.otherwise);
    }




    visitErr (er : Err) : void {
        this.key("Error", er).field("item", er.item);
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.key("Loop", l).field("body", l.body);
    }




    visitBreak (b : Break) : void {
        this.key("Break", b);
    }




    visitContinue (c : Continue) : void {
        this.key("Continue", c);
    }




    visitLabel (lb : Label) : void {
        this.key("Label", lb).fieldStr("name", lb.name);
    }




    visitGoto (gt : Goto) : void {
        this.key("Goto", gt).fieldStr("name", gt.name);
    }




    visitImport (im : Import) : void {
        this.key("Import", im).field("value", im.value);
    }




    visitReturn (r : Return) : void {
        this.key("Return", r);
        if (r.value)
            this.field("value", r.value);
    }




    visitThrow (th : Throw) : void {
        this.key("Throw", th);
        if (th.ex)
            this.field("ex", th.ex);
    }




    visitTry (tr : Try) : void {
        this.key("Try", tr).field("body", tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                const c = tr.catches[i];
                if (c.on)
                    this.field("on", c.on).field("body", c.body);
            }
        }
        if (tr.fin)
            this.field("fin", tr.fin);
    }




    visitVar (v : Var) : void {
        this.key("Var", v)
            .field("slot", v.slot)
            .field("value", v.value);
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        this.key("AsiList", al)
            .field("brace", () => this.cw.text(al.brace))
            .field("items", al.items);
    }
}