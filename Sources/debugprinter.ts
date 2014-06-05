/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="parser.ts"/>


class DebugPrinter implements AstVisitor<void> {

    private cw : CodeWriter;
    private invisibleBraced : boolean;




    constructor (cw : CodeWriter, invisibleBraced = false) {
        this.cw = cw;
        this.invisibleBraced = invisibleBraced;
    }




    private writeList (items : Asi[]) : CodeWriter {
        this.cw.tab().newLine().markup("items");
        if (items.length === 0) {
            this.cw.space().markup("&lt;empty&gt;");
            return this.cw;
        }
        this.cw.tab().newLine();
        for (var i = 0; i < items.length; i++) {
            this.cw.markup("" + i).space();
            items[i].accept(this);
            if (i + 1 !== items.length)
                this.cw.newLine();
        }
        this.cw.unTab();
        return this.cw;
    }




    private printKey (name : string, asi : Asi) : CodeWriter {
        this.cw.key(name);
        return this.printCommon(asi);
    }




    private printType (name : string, asi : Asi) : CodeWriter {
        this.cw.type(name);
        return this.printCommon(asi);
    }




    private printField (name : string, asi : Asi) : CodeWriter {
        this.cw.tab().newLine().markup(name).space();
        asi.accept(this);
        return this.cw.unTab();
    }




    private printCommon (asi : Asi) : CodeWriter {
        if (asi.attrs)
            this.printField("attrs", asi.attrs);
        if (asi.type && !(asi.type instanceof TypeVoid))
            this.printField("typeVar", asi.type);
        return this.cw;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        this.printKey("AsiList", al);
        this.writeList(al.items);
        this.cw.unTab();
    }




    visitExpList (el : ExpList) : void {
        this.printKey("ExpList", el);
        this.writeList(el.items);
        this.cw.unTab();
    }




    visitBraced (bc : Braced) : void {
        if (this.invisibleBraced && bc.list.items.length === 1) {
            bc.list.items[0].accept(this);
        } else {
            this.printKey("Braced", bc);
            this.printField("value", bc.list);
        }
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.printKey("Loop", l);
        this.printField("body", l.body);
    }




    visitBreak (b : Break) : void {
        this.printKey("Break", b);
    }




    visitContinue (c : Continue) : void {
        this.printKey("Continue", c);
    }




    visitLabel (lb : Label) : void {
        this.printKey("Label", lb);
        this.printField("ident", lb.ident);
    }




    visitGoto (gt : Goto) : void {
        this.printKey("Goto", gt);
        this.printField("ident", gt.ident);
    }




    visitImport (im : Import) : void {
        this.printKey("Import", im);
        this.printField("value", im.value);
    }




    visitReturn (r : Return) : void {
        this.printKey("Return", r);
        if (r.value)
            this.printField("value", r.value);
    }




    visitThrow (th : Throw) : void {
        this.printKey("Throw", th);
        if (th.ex)
            this.printField("ex", th.ex);
    }




    visitTry (tr : Try) : void {
        this.printKey("Try", tr);
        this.printField("body", tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    this.printField("on", c.on);
                    this.printField("body", c.body);
                }
            }
        }

        if (tr.fin)
            this.printField("fin", tr.fin);
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        this.printKey("Var", v);
        this.printField("exp", v.exp);
    }




    visitValueVar (vv : ValueVar) : void {
        this.printKey("Var", vv);
        this.printField("ident", vv.ident);
        this.printField("typeVar", vv.typeVar);
    }




    visitTypeVar (tv : TypeVar) : void {
        this.printKey("TypeVar", tv);
        this.printField("typeVar", tv.typeVar);
        this.printField("constraint", tv.constraint);
    }




    visitAssign (a : Assign) : void {
        this.printKey("Assign", a);
        this.printField("slot", a.slot);
        this.printField("value", a.value);
    }




    visitScope (sc : Scope) : void {
        this.printKey("Scope", sc);
        this.printField("list", sc.list);
    }




    visitIdent (i : Ident) : void {
        this.printKey("Ident", i).tab().newLine();
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




    visitMember (m : Member) : void {
        this.printKey("Member", m);
        this.printField("bag", m.ident);
        this.printField("ident", m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        this.printKey("FnApply", fna);
        this.printField("fn", fna.fn);
        this.printField("args", fna.args);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.printKey("BinOpApply", opa);
        this.printField("op", opa.op);
        this.printField("op1", opa.op1);
        this.printField("op2", opa.op2);
    }




    visitIf (i : If) : void {
        this.printKey("If", i);
        this.printField("test", i.test);
        this.printField("then", i.then);
        if (i.otherwise)
            this.printField("otherwise", i.otherwise);
    }




    visitNew (nw : New) : void {
        this.printKey("New", nw);
        this.printField("value", nw.value);
    }




    visitTypeOf (tof : TypeOf) : void {
        this.printKey("TypeOf", tof);
        this.printField("value", tof.value);
    }




    // values ===============================================




    visitBuiltin (bi : Builtin) : void {
        this.printKey("Builtin", bi);
        this.printField("fn", bi.fn);
    }




    visitErr (er : Err) : void {
        this.printKey("Error", er);
        this.printField("item", er.item);
    }




    visitVoid (vo : Void) : void {
        this.printKey("Void", vo);
        this.printCommon(vo);
    }




    visitBool (b : Bool) : void {
        this.printKey("Bool", b).tab().newLine().markup("value")
            .key(b.value === true ? "true" : "false").unTab();
    }




    visitInt (ii : Int) : void {
        this.printKey("Int", ii).tab().newLine().markup("value")
            .num(ii.value).unTab();
    }




    visitFloat (f : Float) : void {
        this.printKey("Float", f).tab().newLine().markup("value")
            .num(f.value).unTab();
    }




    visitChar (ch : Char) : void {
        this.printKey("Char", ch).tab().newLine().markup("value")
            .text("'").text(ch.value).text("'").unTab();
    }




    visitArr (arr : Arr) : void {
        this.printKey("Arr", arr);
        this.printField("list", arr.list);
    }




    visitRef (rf : Ref) : void {
        this.printKey("Ref", rf);
        this.printField("item", rf.item);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.printKey("Fn", fn);
        this.printField("params", fn.params);
        if (fn.returnType)
            this.printField("returnType", fn.returnType);
        if (fn.body)
            this.printField("body", fn.body);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.printKey("Struct", st);
        this.printField("body", st.body);
    }



    visitInterface (ifc : Interface) : void {
        this.printKey("Interface", ifc);
        this.printField("body", ifc.body);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.printType("TypeAny", ta);
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.printType("TypeAnyOf", tao);
        this.printField("choices", tao.choices);
    }




    visitTypeErr (te : TypeErr) : void {
        this.printType("TypeErr", te);
        this.printField("elementType", te.elementType);
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        this.printType("TypeVoid", tvo);
    }




    visitTypeBool (tb : TypeBool) : void {
        this.printType("TypeBool", tb);
    }




    visitTypeInt (tii : TypeInt) : void {
        this.printType("TypeInt", tii);
    }




    visitTypeFloat (tf : TypeFloat) : void {
        this.printType("TypeFloat", tf);
    }




    visitTypeChar (tch : TypeChar) : void {
        this.printType("TypeChar", tch);
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.printType("TypeArr", tarr);
        this.printField("elementType", tarr.elementType);
        this.printField("length", tarr.length);
    }




    visitTypeRef (trf : TypeRef) : void {
        this.printType("TypeRef", trf);
        this.printField("elementType", trf.elementType);
    }
}