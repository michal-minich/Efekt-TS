/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="parser.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;
    private lineWritten : boolean[] = [];




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    private static showScopeBraces (asi : Asi) : boolean {
        return asi instanceof Fn ||
            asi instanceof AsiList ||
            asi instanceof Struct ||
            asi instanceof Loop ||
            asi instanceof Interface;
    }




    private markLineWritten () : void {
        this.lineWritten[this.lineWritten.length - 1] = true;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++) {
            var item = al.items[i];
            item.accept(this);
            if (i < al.items.length - 1) {
                this.cw.newLine();
                this.markLineWritten();
            }
        }
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
            if (i < el.items.length - 1)
                this.cw.markup(',').space();
        }
    }




    visitBraced (bc : Braced) : void {
        var showBraces = !(bc.value && (bc.value instanceof Braced
            || bc.value instanceof BinOpApply));
        if (showBraces)
            this.cw.markup('(');
        if (bc.value)
            bc.value.accept(this);
        if (showBraces)
            this.cw.markup(')');
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.markLineWritten();
        this.cw.key("loop").space();
        this.visitScope(l.body);
    }




    visitBreak (b : Break) : void {
        this.markLineWritten();
        this.cw.newLine().key("break");
    }




    visitContinue (c : Continue) : void {
        this.markLineWritten();
        this.cw.newLine().key("continue");
    }




    visitReturn (r : Return) : void {
        this.markLineWritten();
        this.cw.key("return");
        if (r.value) {
            this.cw.space();
            r.value.accept(this);
        }
    }




    visitThrow (th : Throw) : void {
        this.markLineWritten();
        this.cw.key("throw");
        if (th.ex) {
            this.cw.space();
            th.ex.accept(this);
        }
    }




    visitTry (tr : Try) : void {
        this.markLineWritten();
        this.cw.key("try").space();
        this.visitScope(tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                this.cw.key("catch");
                var c = tr.catches[i];
                if (c.on) {
                    //this.cw.space().markup("(");
                    this.visitVar(c.on);
                    //this.cw.markup(")").space();
                    this.visitScope(c.body);
                }
            }
        }
        if (tr.fin) {
            this.cw.newLine().key("finally").space();
            this.visitScope(tr.fin);
        }
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        this.cw.key("var").space();
        v.exp.accept(this);
    }




    visitValueVar (vv : ValueVar) : void {
        vv.ident.accept(this);
        this.cw.space().writeOp(":").space();
        vv.type.accept(this);
    }




    visitTypeVar (tv : TypeVar) : void {
        tv.type.accept(this);
        this.cw.space().writeOp("of").space();
        tv.constraint.accept(this);
    }




    visitAssign (a : Assign) : void {
        a.slot.accept(this);
        this.cw.space().writeOp("=").space();
        a.value.accept(this);
    }




    visitScope (sc : Scope) : void {
        var skipBraces = sc.list.items.length === 1;
        if (skipBraces)
            skipBraces = !Printer.showScopeBraces(sc.parent);
        this.lineWritten.push(false);
        if (!skipBraces) {
            if (sc.list.items.length === 0) {
                this.cw.markup("{ }");
                return;
            } else {
                this.cw.markup("{");
                if (sc.list.items.length === 1) {
                    this.cw.space()
                } else {
                    this.cw.tab();
                    this.cw.newLine();
                    this.markLineWritten();
                }
            }
        }

        this.visitAsiList(sc.list);

        if (this.lineWritten.pop()) {
            this.cw.unTab();
            this.cw.newLine();
        } else if (!skipBraces)
            this.cw.space();
        if (!skipBraces)
            this.cw.markup("}");
    }




    visitIdent (i : Ident) : void {
        if (i.isOp)
            this.cw.writeOp(i.name);
        else if (i.isKey)
            this.cw.key(i.name);
        else if (i.isType)
            this.cw.type(i.name);
        else
            this.cw.ident(i.name);
    }




    visitMember (m : Member) : void {
        m.bag.accept(this);
        this.cw.writeOp(".");
        this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        fna.fn.accept(this);
        fna.args.accept(this);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.markup("(");
        opa.op1.accept(this);
        this.cw.space();
        opa.op.accept(this);
        this.cw.space();
        opa.op2.accept(this);
        this.cw.markup(")")
    }




    visitIf (i : If) : void {
        this.cw.key("if").space();
        i.test.accept(this);
        this.cw.space().key("then").space();
        this.visitScope(i.then);
        if (i.otherwise) {
            this.cw.space().key("else").space();
            this.visitScope(i.otherwise);
        }
    }




    visitNew (nw : New) : void {
        this.cw.key("new").space();
        nw.value.accept(this);
    }




    visitTypeOf (tof : TypeOf) : void {
        this.cw.key("typeof").space();
        tof.value.accept(this);
    }




    // values ===============================================




    visitErr (er : Err) : void {
        this.cw.key("error").space().markup("(");
        er.item.accept(this);
        this.cw.markup(")");
    }




    visitVoid (vo : Void) : void {
        this.cw.key("void");
    }




    visitBool (b : Bool) : void {
        this.cw.key(b.value === true ? "true" : "false");
    }




    visitInt (ii : Int) : void {
        this.cw.num(ii.value);
    }




    visitFloat (f : Float) : void {
        this.cw.num(f.value);
    }




    visitChar (ch : Char) : void {
        this.cw.text("'").text(ch.value).text("'");
    }




    visitArr (arr : Arr) : void {
        this.cw.markup("[");
        arr.list.accept(this);
        this.cw.markup("]");
    }




    visitRef (rf : Ref) : void {
        this.cw.key("ref").space(); // ?
        rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.cw.key("fn").space();
        fn.params.accept(this);
        this.cw.space();
        if (fn.returnType) {
            this.cw.markup("->").space();
            fn.returnType.accept(this);
        }
        fn.body.accept(this);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.cw.key("struct").space();
        st.body.accept(this);
    }



    visitInterface (ifc : Interface) : void {
        this.cw.key("interface").space();
        ifc.body.accept(this);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.cw.type("Any");
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.cw.type("AnyOf");
        tao.choices.accept(this);
    }




    visitTypeErr (te : TypeErr) : void {
        this.cw.type("Error");
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        this.cw.type("Void");
    }




    visitTypeBool (tb : TypeBool) : void {
        this.cw.type("Bool");
    }




    visitTypeInt (tii : TypeInt) : void {
        this.cw.type("Int");
    }




    visitTypeFloat (tf : TypeFloat) : void {
        this.cw.type("Float");
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.cw.type("Array").markup("(");
        tarr.elementType.accept(this);
        this.cw.type(",").space();
        tarr.length.accept(this);
        this.cw.markup(")");
    }




    visitTypeRef (trf : TypeRef) : void {
        this.cw.type("Ref").markup("(");
        trf.elementType.accept(this);
        this.cw.markup(")");
    }
}