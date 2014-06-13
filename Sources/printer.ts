/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="parser.ts"/>
/// <reference path="short.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;
    private isInline = new ShortCircuitFnVisitor(new IsInline());




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




    private printAttributes (asi : Asi) : CodeWriter {
        if (asi.attrs)
            for (var i = 0; i < asi.attrs.items.length; ++i) {
                asi.attrs.items[i].accept(this);
                this.cw.space();
            }
        return this.cw;
    }




    private printType (asi : Asi) : CodeWriter {
        if (asi.type) {
            this.cw.space().markup(":").space();
            asi.type.accept(this);
        }
        return this.cw;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++) {
            var item = al.items[i];
            item.accept(this);
            if (i < al.items.length - 1) {
                this.cw.newLine();
            }
        }
        this.printType(al);
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
            if (i < el.items.length - 1)
                this.cw.markup(',').space();
        }
        this.printType(el);
    }




    visitBraced (bc : Braced) : void {
        var showBraces = !(bc.list.items.length === 1
            && (bc.list.items[0] instanceof Braced
                || bc.list.items[0] instanceof BinOpApply));
        if (showBraces)
            this.cw.markup('(');
        bc.list.accept(this);
        if (showBraces)
            this.cw.markup(')');
        this.printType(bc);
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.cw.key("loop").space();
        this.visitScope(l.body);
    }




    visitBreak (b : Break) : void {
        this.cw.key("break");
    }




    visitContinue (c : Continue) : void {
        this.cw.key("continue");
    }




    visitLabel (lb : Label) : void {
        this.cw.key("label").space();
        lb.ident.accept(this);
    }




    visitGoto (gt : Goto) : void {
        this.cw.key("goto").space();
        gt.ident.accept(this);
    }




    visitImport (im : Import) : void {
        this.cw.key("import").space();
        im.value.accept(this);
    }




    visitReturn (r : Return) : void {
        this.cw.key("return");
        if (r.value) {
            this.cw.space();
            r.value.accept(this);
        }
    }




    visitThrow (th : Throw) : void {
        this.cw.key("throw");
        if (th.ex) {
            this.cw.space();
            th.ex.accept(this);
        }
    }




    visitTry (tr : Try) : void {
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
        this.printAttributes(v);
        this.cw.key("var").space();
        v.exp.accept(this);
        this.printType(v);
    }




    visitValueVar (vv : ValueVar) : void {
        vv.ident.accept(this);
        this.cw.space().writeOp(":").space();
        vv.typeVar.accept(this);
        this.printType(vv);
    }




    visitTypeVar (tv : TypeVar) : void {
        tv.typeVar.accept(this);
        this.cw.space().writeOp("of").space();
        tv.constraint.accept(this);
        this.printType(tv);
    }




    visitAssign (a : Assign) : void {
        a.slot.accept(this);
        this.cw.space().writeOp("=").space();
        a.value.accept(this);
        this.printType(a);
    }




    visitScope (sc : Scope) : void {
        this.printAttributes(sc);
        var useBraces = sc.list.items.length > 1
            || Printer.showScopeBraces(sc.parent);

        if (sc.list.items.length === 0) {
            if (useBraces)
                this.cw.markup("{ }");
            return;
        }
        var ln = sc.list.items.length > 1
            || !sc.list.items[0].accept(this.isInline);

        if (ln) {
            if (useBraces)
                this.cw.markup("{").tab().newLine();
            else
                this.cw.tab().newLine();
        } else {
            if (useBraces)
                this.cw.markup("{").space();
        }

        this.visitAsiList(sc.list);

        if (ln) {
            if (useBraces)
                this.cw.unTab().newLine().markup("}");
            else
                this.cw.unTab();
        }
        else {
            if (useBraces)
                this.cw.space().markup("}");
        }
        this.printType(sc);
    }




    visitIdent (i : Ident) : void {
        this.printAttributes(i);
        var fn : (value : string, cssClass? : string) => CodeWriter;
        if (i.isOp) {
            if (!(i.parent instanceof BinOpApply))
                this.cw.key("op");
            fn = this.cw.writeOp
        } else if (i.isKey)
            fn = this.cw.key;
        else if (i.isType)
            fn = this.cw.type;
        else if (i.isAttr)
            fn = this.cw.attr;
        else {
            fn = this.cw.ident;
        }

        if (i.declaringEnv) {
            var cssClass = "sc_" + i.declaringEnv.id + "_" + i.name;
            if (i.declaredBy) {
                if (i.assignedValue)
                    fn.call(this.cw, i.name, cssClass + " write");
                else
                    fn.call(this.cw, i.name, cssClass);
            }
            else
                fn.call(this.cw, i.name, cssClass + " declr");
        } else {
            fn.call(this.cw, i.name);
        }
        this.printType(i);
    }




    visitMember (m : Member) : void {
        m.bag.accept(this);
        this.cw.writeOp(".");
        this.visitIdent(m.ident);
        this.printType(m);
    }




    visitFnApply (fna : FnApply) : void {
        fna.fn.accept(this);
        fna.args.accept(this);
        this.printType(fna);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.markup("(");
        opa.op1.accept(this);
        this.cw.space();
        opa.op.accept(this);
        this.cw.space();
        opa.op2.accept(this);
        this.cw.markup(")")
        this.printType(opa);
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
        this.printType(i);
    }




    visitNew (nw : New) : void {
        this.cw.key("new").space();
        nw.value.accept(this);
        this.printType(nw);
    }




    visitTypeOf (tof : TypeOf) : void {
        this.cw.key("typeof").space();
        tof.value.accept(this);
        this.printType(tof);
    }




    // values ===============================================




    visitBuiltin (bi : Builtin) : void {
        this.visitFn(bi.fn);
    }




    visitErr (er : Err) : void {
        this.cw.key("error").space().markup("(");
        er.item.accept(this);
        this.cw.markup(")");
        this.printType(er);
    }




    visitVoid (vo : Void) : void {
        this.cw.key("void");
        this.printType(vo);
    }




    visitBool (b : Bool) : void {
        this.cw.key(b.value === true ? "true" : "false");
        this.printType(b);
    }




    visitInt (ii : Int) : void {
        this.cw.num(ii.value);
        this.printType(ii);
    }




    visitFloat (f : Float) : void {
        this.cw.num(f.value);
        this.printType(f);
    }




    visitChar (ch : Char) : void {
        this.cw.text("'").text(ch.value).text("'");
        this.printType(ch);
    }




    visitArr (arr : Arr) : void {
        if (arr.itemType && arr.itemType instanceof TypeChar) {
            this.cw.text('"').text(arrToStr(arr)).text('"');
            ;
        } else {
            this.cw.markup("[");
            arr.list.accept(this);
            this.cw.markup("]");
        }
        this.printType(arr);
    }




    visitRef (rf : Ref) : void {
        this.cw.type("Ref").markup("(");
        rf.item.accept(this);
        this.cw.markup(")");
        this.printType(rf);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.printAttributes(fn);
        this.cw.key("fn").space();
        fn.params.accept(this);
        this.cw.space();
        if (fn.returnType) {
            this.cw.markup("->").space();
            fn.returnType.accept(this);
        }
        if (fn.body)
            this.visitScope(fn.body);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.printAttributes(st);
        this.cw.key("struct").space();
        st.body.accept(this);
    }



    visitInterface (ifc : Interface) : void {
        this.printAttributes(ifc);
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




    visitTypeChar (tch : TypeChar) : void {
        this.cw.type("Char");
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.cw.type("Array").markup("(");
        tarr.elementType.accept(this);
        this.cw.markup(",").space();
        tarr.length.accept(this);
        this.cw.markup(")");
    }




    visitTypeRef (trf : TypeRef) : void {
        this.cw.type("Ref").markup("(");
        trf.elementType.accept(this);
        this.cw.markup(")");
    }
}




class IsInline implements TerminalAstVisitor<boolean> {


    // statements
    visitBreak (b : Break) : boolean {
        return false;
    }

    visitContinue (c : Continue) : boolean {
        return false;
    }




    // expresions
    visitIdent (i : Ident) : boolean {
        return true;
    }




    // values
    visitVoid (vo : Void) : boolean {
        return true;
    }

    visitBool (b : Bool) : boolean {
        return true;
    }

    visitInt (ii : Int) : boolean {
        return true;
    }

    visitFloat (f : Float) : boolean {
        return true;
    }

    visitChar (ch : Char) : boolean {
        return true;
    }




    // types (built in)
    visitTypeAny (ta : TypeAny) : boolean {
        return true;
    }

    visitTypeErr (ter : TypeErr) : boolean {
        return true;
    }

    visitTypeVoid (tvo : TypeVoid) : boolean {
        return true;
    }

    visitTypeBool (tb : TypeBool) : boolean {
        return true;
    }

    visitTypeInt (tii : TypeInt) : boolean {
        return true;
    }

    visitTypeFloat (tf : TypeFloat) : boolean {
        return true;
    }

    visitTypeChar (tch : TypeChar) : boolean {
        return true;
    }
}