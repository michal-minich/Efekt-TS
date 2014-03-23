/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="parser.ts"/>


class DebugPrinter implements AstVisitor<void> {

    private cw : CodeWriter;




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    private writeComaList (items : Exp[]) {
        this.cw.writeMarkup("(");
        for (var i = 0; i < items.length; i++) {
            var t : AstVisitor<void> = this; // TypeScript bug?, cannot pass this directly
            items[i].accept(t);
            this.cw.writeMarkup(",").writeSpace();
        }
        this.cw.writeMarkup(")");
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++)
            al.items[i].accept(this);
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++)
            el.items[i].accept(this);
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
        this.cw.writeKey("Var").tab();
        if (v.ident) {
            this.cw.writeNewLine().writeMarkup("ident").writeSpace();
            this.visitIdent(v.ident);
        }
        if (v.type) {
            this.cw.writeNewLine().writeMarkup("type").writeSpace();
            v.type.accept(this);
        }
        if (v.constraint) {
            this.cw.writeNewLine().writeMarkup("constraint").writeSpace();
            v.constraint.accept(this);
        }
        if (v.value) {
            this.cw.writeNewLine().writeMarkup("value").writeSpace();
            v.value.accept(this);
        }
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
        fna.fn.accept(this);
        this.writeComaList(fna.args.items);
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
        this.cw.writeKey("Int").tab().writeNewLine().writeMarkup("value").writeSpace();
        this.cw.writeNum(ii.value);
        this.cw.unTab();
    }




    visitFloat (f : Float) : void {
        this.cw.writeNum(f.value);
    }




    visitArr (arr : Arr) : void {
        this.cw.writeMarkup("[");
        this.writeComaList(arr.list.items);
        this.cw.writeMarkup("]");
    }




    visitRef (rf : Ref) : void {
        this.cw.writeKey("ref").writeSpace(); // ?
        rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.cw.writeKey("fn").writeSpace();
        this.writeComaList(fn.params.items);
        this.cw.writeSpace();
        if (fn.returnType) {
            this.cw.writeMarkup("->").writeSpace();
            fn.returnType.accept(this);
        }
        fn.body.accept(this);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.cw.writeKey("struct").writeSpace();
        st.body.accept(this);
    }



    visitInterface (ifc : Interface) : void {
        this.cw.writeKey("interface").writeSpace();
        ifc.body.accept(this);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.cw.writeType("Any");
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.cw.writeType("AnyOf");
        this.writeComaList(tao.choices.items);
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