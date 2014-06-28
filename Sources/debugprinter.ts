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




    private field (name : string, asi : Asi) : DebugPrinter {
        this.cw.tab().newLine().markup(name).space();
        asi.accept(this);
        this.cw.unTab();
        return this;
    }




    private fieldStr (name : string, value : string) : DebugPrinter {
        this.cw.tab().newLine().markup(name)
            .space().ident(value).unTab();
        return this;
    }




    private printCommon (asi : Asi) : DebugPrinter {
        if (asi.attrs)
            this.field("attrs", asi.attrs);

        if (this.printInfTypes) {
            if (asi.infType) {
                if (!(asi instanceof Stm)) {
                    this.field("infType", asi.infType);
                }
            } else {
                this.cw.tab().newLine().markup("infType")
                    .space().attr("&lt;undefined&gt;").unTab();
            }
        }

        return this;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        this.key("AsiList", al).items(al.items);
    }




    visitExpList (el : ExpList) : void {
        this.key("ExpList", el).items(el.items);
    }




    visitBraced (bc : Braced) : void {
        if (this.invisibleBraced && bc.list.items.length === 1) {
            bc.list.items[0].accept(this);
        } else {
            this.key("Braced", bc).field("value", bc.list);
        }
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
                var c = tr.catches[i];
                if (c.on)
                    this.field("on", c.on).field("body", c.body);
            }
        }
        if (tr.fin)
            this.field("fin", tr.fin);
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        this.key("Var", v).field("exp", v.exp);
    }




    visitTyping (tpg : Typing) : void {
        this.key("Typing", tpg)
            .field("value", tpg.value)
            .field("type", tpg.type);
    }




    visitConstraining (csg : Constraining) : void {
        this.key("Constraining", csg)
            .field("type", csg.type)
            .field("constraint", csg.constraint);
    }




    visitAssign (a : Assign) : void {
        this.key("Assign", a).field("slot", a.slot).field("value", a.value);
    }




    visitScope (sc : Scope) : void {
        this.key("Scope", sc).field("items", sc.list);
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




    visitBinOpApply (opa : BinOpApply) : void {
        this.key("BinOpApply", opa)
            .field("op", opa.op)
            .field("op1", opa.op1)
            .field("op2", opa.op2);
    }




    visitIf (i : If) : void {
        this.key("If", i).field("test", i.test).field("then", i.then);
        if (i.otherwise)
            this.field("otherwise", i.otherwise);
    }




    visitNew (nw : New) : void {
        this.key("New", nw).field("value", nw.value);
    }




    visitTypeOf (tof : TypeOf) : void {
        this.key("TypeOf", tof).field("value", tof.value);
    }




    // values ===============================================




    visitBuiltin (bi : Builtin) : void {
        this.key("Builtin", bi).field("fn", bi.fn);
    }




    visitErr (er : Err) : void {
        this.key("Error", er).field("item", er.item);
    }




    visitVoid (vo : Void) : void {
        this.key("Void", vo);
        this.printCommon(vo);
    }




    visitBool (b : Bool) : void {
        this.key("Bool", b);
        this.cw.tab().newLine().markup("value").space()
            .key(b.value === true ? "true" : "false").unTab().newLine();
    }




    visitInt (ii : Int) : void {
        this.key("Int", ii);
        this.cw.tab().newLine().markup("value").space()
            .num(ii.value).unTab().newLine();
    }




    visitFloat (f : Float) : void {
        this.key("Float", f);
        this.cw.tab().newLine().markup("value").space()
            .num(f.value).unTab().newLine();
    }




    visitChar (ch : Char) : void {
        this.key("Char", ch);
        this.cw.tab().newLine().markup("value").space()
            .text("'").text(ch.value).text("'").unTab().newLine();
    }




    visitArr (arr : Arr) : void {
        this.key("Arr", arr).field("items", arr.list);
    }




    visitRef (rf : Ref) : void {
        this.key("Ref", rf).field("item", rf.item);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.key("Fn", fn).field("params", fn.params);
        if (fn.returnType)
            this.field("returnType", fn.returnType);
        if (fn.body)
            this.field("body", fn.body);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.key("Struct", st).field("body", st.body);
    }



    visitInterface (ifc : Interface) : void {
        this.key("Interface", ifc).field("body", ifc.body);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.type("TypeAny", ta);
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.type("TypeAnyOf", tao).field("choices", tao.choices);
    }




    visitTypeErr (te : TypeErr) : void {
        this.type("TypeErr", te).field("elementType", te.elementType);
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        this.type("TypeVoid", tvo);
    }




    visitTypeBool (tb : TypeBool) : void {
        this.type("TypeBool", tb);
    }




    visitTypeInt (tii : TypeInt) : void {
        this.type("TypeInt", tii);
    }




    visitTypeFloat (tf : TypeFloat) : void {
        this.type("TypeFloat", tf);
    }




    visitTypeChar (tch : TypeChar) : void {
        this.type("TypeChar", tch);
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.type("TypeArr", tarr)
            .field("elementType", tarr.elementType)
            .field("length", tarr.length);
    }




    visitTypeRef (trf : TypeRef) : void {
        this.type("TypeRef", trf).field("elementType", trf.elementType);
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : void {
        this.key("Declr", d).field("ident", d.ident);
    }




    visitClosure (cls : Closure) : void {
        this.key("Closure", cls);
    }




    visitRefSlot (rs : RefSlot) : void {
        this.key("RefSlot", rs);
    }
}