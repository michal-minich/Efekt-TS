/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="parser.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;
    private lineWritten : boolean[] = [];




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




    private static itIsExactlyOneExp (asis : Asi[]) : boolean {
        return asis.length == 1 && asis[0] instanceof Exp;
    }




    private markLineWritten () : void {
        this.lineWritten[this.lineWritten.length - 1] = true;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++) {
            var item = al.items[i];
            item.accept(this);
            if (i < al.items.length - 1)
                this.cw.writeNewLine();
        }
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++)
            el.items[i].accept(this);
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.markLineWritten();
        this.cw.writeKey("loop").writeSpace();
        this.visitScope(l.body);
    }




    visitBreak (b : Break) : void {
        this.markLineWritten();
        this.cw.writeKey("break");
    }




    visitContinue (c : Continue) : void {
        this.markLineWritten();
        this.cw.writeKey("continue");
    }




    visitReturn (r : Return) : void {
        this.markLineWritten();
        this.cw.writeKey("return");
        if (r.value) {
            this.cw.writeSpace();
            r.value.accept(this);
        }
    }




    visitThrow (th : Throw) : void {
        this.markLineWritten();
        this.cw.writeKey("throw");
        if (th.ex) {
            this.cw.writeSpace();
            th.ex.accept(this);
        }
    }




    visitTry (tr : Try) : void {
        this.markLineWritten();
        this.cw.writeKey("try").writeSpace();
        this.visitScope(tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                this.cw.writeKey("catch");
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
            this.cw.writeNewLine().writeKey("finally").writeSpace();
            this.visitScope(tr.fin);
        }
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        if (v.useVarKeyword)
            this.cw.writeKey("var").writeSpace();
        if (v.ident)
            this.visitIdent(v.ident);
        if (v.type) {
            if (v.ident)
                this.cw.writeSpace().writeOp(":").writeSpace();
            v.type.accept(this);
        }
        if (v.constraint) {
            this.cw.writeSpace().writeKey("of").writeSpace();
            v.constraint.accept(this);
        }
        if (v.value) {
            this.cw.writeSpace().writeOp("=").writeSpace();
            v.value.accept(this);
        }
    }




    visitScope (sc : Scope) : void {
        var skipBraces = Printer.itIsExactlyOneExp(sc.list.items);
        this.lineWritten.push(false);
        if (!skipBraces)
            this.cw.writeMarkup("{").writeSpace();
        this.cw.tab();

        this.visitAsiList(sc.list);

        this.cw.unTab();
        if (this.lineWritten.pop())
            this.cw.writeNewLine();
        else if (!skipBraces)
            this.cw.writeSpace();
        if (!skipBraces)
            this.cw.writeMarkup("}");


    }




    visitIdent (i : Ident) : void {
        if (i.isOp)
            this.cw.writeOp(i.name);
        else if (i.isKey)
            this.cw.writeKey(i.name);
        else if (i.isType)
            this.cw.writeType(i.name);
        else
            this.cw.writeIdent(i.name);
    }




    visitMember (m : Member) : void {
        m.bag.accept(this);
        this.cw.writeOp(".");
        this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        fna.fn.accept(this);
        this.writeComaList(fna.args.items);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.writeMarkup("(");
        opa.op1.accept(this);
        this.cw.writeSpace();
        opa.op.accept(this);
        this.cw.writeSpace();
        opa.op2.accept(this);
        this.cw.writeMarkup(")")
    }




    visitIf (i : If) : void {
        this.cw.writeKey("if").writeSpace();
        i.test.accept(this);
        this.cw.writeSpace().writeKey("then").writeSpace();
        this.visitScope(i.then);
        if (i.otherwise) {
            this.cw.writeSpace().writeKey("else").writeSpace();
            this.visitScope(i.otherwise);
        }
    }




    visitNew (nw : New) : void {
        this.cw.writeKey("new").writeSpace();
        nw.value.accept(this);
    }




    visitTypeOf (tof : TypeOf) : void {
        this.cw.writeKey("typeof").writeSpace();
        tof.value.accept(this);
    }




    // values ===============================================




    visitErr (er : Err) : void {
        this.cw.writeKey("error").writeSpace().writeMarkup("(");
        er.item.accept(this);
        this.cw.writeMarkup(")");
    }




    visitVoid (vo : Void) : void {
        throw "Cannot print void";
    }




    visitBool (b : Bool) : void {
        this.cw.writeKey(b.value === true ? "true" : "false");
    }




    visitInt (ii : Int) : void {
        this.cw.writeNum(ii.value);
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