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




    private writeList (items : Asi[]) {
        this.cw.writeMarkup("items");
        if (items.length === 0) {
            this.cw.writeSpace().writeMarkup("=empty=");
            return;
        }
        this.cw.tab().writeNewLine();
        for (var i = 0; i < items.length; i++) {
            this.cw.writeMarkup("" + i).writeSpace();
            items[i].accept(this);
            if (i + 1 !== items.length)
                this.cw.writeNewLine();
        }
        this.cw.unTab();
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        this.cw.writeKey("AsiList").tab().writeNewLine();
        this.writeList(al.items);
        this.cw.unTab();
    }




    visitExpList (el : ExpList) : void {
        this.cw.writeKey("ExpList").tab().writeNewLine();
        this.writeList(el.items);
        this.cw.unTab();
    }




    visitBraced (bc : Braced) : void {
        if (!this.invisibleBraced)
            this.cw.writeKey("Braced").tab().writeNewLine().writeMarkup("value").writeSpace();
        if (bc.value)
            bc.value.accept(this);
        if (!this.invisibleBraced) {
            if (!bc.value)
                this.cw.writeSpace().writeMarkup("=nothing=");
            this.cw.unTab();
        }
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.cw.writeKey("Loop").tab().writeNewLine().writeMarkup("body").writeSpace();
        this.visitScope(l.body);
        this.cw.unTab();
    }




    visitBreak (b : Break) : void {
        this.cw.writeKey("Break");
    }




    visitContinue (c : Continue) : void {
        this.cw.writeKey("Continue");
    }




    visitReturn (r : Return) : void {
        this.cw.writeKey("Return");
        if (r.value) {
            this.cw.tab().writeNewLine().writeMarkup("value").writeSpace();
            r.value.accept(this);
            this.cw.unTab();
        } else {
            this.cw.writeNewLine();
        }
    }




    visitThrow (th : Throw) : void {
        this.cw.writeKey("Throw");
        if (th.ex) {
            this.cw.tab().writeNewLine().writeMarkup("ex").writeSpace();
            th.ex.accept(this);
            this.cw.unTab();
        } else {
            this.cw.writeNewLine();
        }
    }




    visitTry (tr : Try) : void {
        this.cw.writeKey("Try").tab().writeNewLine().writeMarkup("body").writeSpace();
        this.visitScope(tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                this.cw.writeNewLine().writeMarkup("catch");
                var c = tr.catches[i];
                if (c.on) {
                    this.cw.writeSpace().writeMarkup("(");
                    this.visitVar(c.on);
                    this.cw.writeMarkup(")").writeSpace();
                    this.visitScope(c.body);
                }
            }
        }
        if (tr.fin) {
            this.cw.writeNewLine().writeMarkup("finally").writeSpace();
            this.visitScope(tr.fin);
        }
        this.cw.unTab();
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        this.cw.writeKey("Var").tab().writeNewLine().writeMarkup("exp").writeSpace();
        v.exp.accept(this);
    }




    visitValueVar (vv : ValueVar) : void {
        this.cw.writeKey("ValueVar").tab();
        this.cw.writeNewLine().writeMarkup("ident").writeSpace();
        vv.ident.accept(this);
        this.cw.writeNewLine().writeMarkup("type").writeSpace();
        vv.type.accept(this);
        this.cw.unTab();
    }




    visitTypeVar (tv : TypeVar) : void {
        this.cw.writeKey("TypeVar").tab();
        this.cw.writeNewLine().writeMarkup("type").writeSpace();
        tv.type.accept(this);
        this.cw.writeNewLine().writeMarkup("constraint").writeSpace();
        tv.constraint.accept(this);
        this.cw.unTab();
    }




    visitAssign (a : Assign) : void {
        this.cw.writeKey("Assign").tab();
        this.cw.writeNewLine().writeMarkup("slot").writeSpace();
        a.slot.accept(this);
        this.cw.writeNewLine().writeMarkup("value").writeSpace();
        a.value.accept(this);
        this.cw.unTab();
    }




    visitScope (sc : Scope) : void {
        this.cw.writeKey("Scope");
        this.cw.tab();
        for (var i = 0; i < sc.list.items.length; i++) {
            this.cw.writeNewLine().writeMarkup("item").writeSpace();
            sc.list.items[i].accept(this);
        }
        this.cw.unTab();
    }




    visitIdent (i : Ident) : void {
        this.cw.writeKey("Ident").tab().writeNewLine().writeMarkup("name").writeSpace();
        if (i.isOp)
            this.cw.writeOp(i.name);
        else if (i.isKey)
            this.cw.writeKey(i.name);
        else if (i.isType)
            this.cw.writeType(i.name);
        else
            this.cw.writeIdent(i.name);
        this.cw.unTab();
    }




    visitMember (m : Member) : void {
        this.cw.writeKey("Member").tab().writeNewLine().writeMarkup("bag").writeSpace();
        m.bag.accept(this);
        this.cw.writeNewLine().writeMarkup("ident").writeSpace();
        this.visitIdent(m.ident);
        this.cw.unTab();
    }




    visitFnApply (fna : FnApply) : void {
        this.cw.writeKey("FnApply").tab().writeNewLine().writeMarkup("fn").writeSpace();
        fna.fn.accept(this);
        this.cw.writeNewLine().writeMarkup("args").writeSpace();
        fna.args.accept(this);
        this.cw.unTab();
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.writeKey("BinOpApply").tab().writeNewLine().writeMarkup("op").writeSpace();
        opa.op.accept(this);
        this.cw.writeNewLine().writeMarkup("op1").writeSpace();
        opa.op1.accept(this);
        this.cw.writeNewLine().writeMarkup("op2").writeSpace();
        opa.op2.accept(this);
        this.cw.unTab();
    }




    visitIf (i : If) : void {
        this.cw.writeKey("If").tab().writeNewLine().writeMarkup("test").writeSpace();
        i.test.accept(this);
        this.cw.writeNewLine().writeMarkup("then").writeSpace();
        this.visitScope(i.then);
        if (i.otherwise) {
            this.cw.writeNewLine().writeMarkup("otherwise").writeSpace();
            this.visitScope(i.otherwise);
        }
        this.cw.unTab();
    }




    visitNew (nw : New) : void {
        this.cw.writeKey("New").tab().writeNewLine().writeMarkup("value").writeSpace();
        nw.value.accept(this);
        this.cw.unTab();
    }




    visitTypeOf (tof : TypeOf) : void {
        this.cw.writeKey("TypeOf").tab().writeNewLine().writeMarkup("value").writeSpace();
        tof.value.accept(this);
        this.cw.unTab();
    }




    // values ===============================================




    visitErr (er : Err) : void {
        this.cw.writeKey("error").writeSpace().writeMarkup("(");
        er.item.accept(this);
        this.cw.writeMarkup(")");
    }




    visitVoid (vo : Void) : void {
        this.cw.writeKey("void");
    }




    visitBool (b : Bool) : void {
        this.cw.writeKey("Bool").tab().writeNewLine().writeMarkup("value").writeSpace();
        this.cw.writeKey(b.value === true ? "true" : "false");
        this.cw.unTab();
    }




    visitInt (ii : Int) : void {
        this.cw.writeKey("Int").tab().writeNewLine().writeMarkup("value")
            .writeSpace().writeNum(ii.value).unTab();
    }




    visitFloat (f : Float) : void {
        this.cw.writeKey("Char").tab().writeNewLine().writeMarkup("value")
            .writeText(f.value).unTab();
    }




    visitChar (ch : Char) : void {
        this.cw.writeKey("Char").tab().writeNewLine().writeMarkup("value")
            .writeText("'").writeText(ch.value).writeText("'").unTab();
    }




    visitArr (arr : Arr) : void {
        this.cw.writeKey("Arr").tab().writeNewLine().writeMarkup("list.items");
        arr.list.accept(this);
        this.cw.unTab();
    }




    visitRef (rf : Ref) : void {
        this.cw.writeKey("Ref").writeSpace(); // ?
        rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.cw.writeKey("Fn").tab().writeNewLine().writeMarkup("params").writeSpace();
        fn.params.accept(this);
        this.cw.writeSpace();
        if (fn.returnType) {
            this.cw.writeMarkup("returnType").writeSpace();
            fn.returnType.accept(this);
        }
        this.cw.writeNewLine().writeMarkup("params").writeSpace();
        fn.body.accept(this);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.cw.writeKey("Struct").tab().writeNewLine().writeMarkup("body")
            .writeSpace();
        st.body.accept(this);
        this.cw.unTab();
    }



    visitInterface (ifc : Interface) : void {
        this.cw.writeKey("Interface").tab().writeNewLine().writeMarkup("body")
            .writeSpace();
        ifc.body.accept(this);
        this.cw.unTab();
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.cw.writeType("Any");
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.cw.writeType("AnyOf");
        tao.choices.accept(this);
    }




    visitTypeErr (te : TypeErr) : void {
        this.cw.writeType("Error");
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        this.cw.writeType("Void");
    }




    visitTypeBool (tb : TypeBool) : void {
        this.cw.writeType("Bool");
    }




    visitTypeInt (tii : TypeInt) : void {
        this.cw.writeType("Int");
    }




    visitTypeFloat (tf : TypeFloat) : void {
        this.cw.writeType("Float");
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.cw.writeType("Array").writeMarkup("(");
        tarr.elementType.accept(this);
        this.cw.writeType(",").writeSpace();
        tarr.length.accept(this);
        this.cw.writeMarkup(")");
    }




    visitTypeRef (trf : TypeRef) : void {
        this.cw.writeType("Ref").writeMarkup("(");
        trf.elementType.accept(this);
        this.cw.writeMarkup(")");
    }
}