/// <reference path="writer.ts"/>
/// <reference path="parser.ts"/>

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
        if (asi.infType) {
            this.cw.space().markup(":").space();
            asi.infType.accept(this);
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
        //this.printType(al);
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
            if (i < el.items.length - 1)
                this.cw.markup(',').space();
        }
        //this.printType(el);
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
        //this.printType(bc);
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
        this.cw.key("label").space().ident(lb.name);
    }




    visitGoto (gt : Goto) : void {
        this.cw.key("goto").space().ident(gt.name);
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
        //this.printType(v);
    }




    visitTyping (tpg : Typing) : void {
        tpg.value.accept(this);
        this.cw.space().writeOp(":").space();
        tpg.type.accept(this);
        //this.printType(tpg);
    }




    visitConstraining (csg : Constraining) : void {
        csg.type.accept(this);
        this.cw.space().writeOp("of").space();
        csg.constraint.accept(this);
        //this.printType(csg);
    }




    visitAssign (a : Assign) : void {
        a.slot.accept(this);
        this.cw.space().writeOp("=").space();
        a.value.accept(this);
        //this.printType(a);
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
        //this.printType(sc);
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
        } else if (i.isUndefined) {
            fn.call(this.cw, i.name, "sc_0__ undefined");
        } else {
            fn.call(this.cw, i.name);
        }
        //this.printType(i);
    }




    visitMemberAccess (ma : MemberAccess) : void {
        ma.bag.accept(this);
        this.cw.writeOp(".");
        ma.member.accept(this);
        //this.printType(ma);
    }




    visitFnApply (fna : FnApply) : void {
        fna.fn.accept(this);
        fna.args.accept(this);
        //this.printType(fna);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.markup("(");
        opa.op1.accept(this);
        this.cw.space();
        opa.op.accept(this);
        this.cw.space();
        opa.op2.accept(this);
        this.cw.markup(")");
        //this.printType(opa);
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
        //this.printType(i);
    }




    visitNew (nw : New) : void {
        this.cw.key("new").space();
        nw.value.accept(this);
        //this.printType(nw);
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
        //this.printType(er);
    }




    visitVoid (vo : Void) : void {
        this.cw.key("void");
        //this.printType(vo);
    }




    visitBool (b : Bool) : void {
        this.cw.key(b.value === true ? "true" : "false");
        //this.printType(b);
    }




    visitInt (ii : Int) : void {
        this.cw.num(ii.value);
        //this.printType(ii);
    }




    visitFloat (f : Float) : void {
        this.cw.num(f.value);
        //this.printType(f);
    }




    visitChar (ch : Char) : void {
        this.cw.text("'").text(ch.value).text("'");
        //this.printType(ch);
    }




    visitArr (arr : Arr) : void {
        if (arr.itemType && arr.itemType instanceof TypeChar) {
            this.cw.text('"').text(arrToStr(arr)).text('"');
        } else {
            this.cw.markup("[");
            arr.list.accept(this);
            this.cw.markup("]");
        }
        //this.printType(arr);
    }




    visitRef (rf : Ref) : void {
        this.cw.key("ref").markup("(");
        rf.item.accept(this);
        this.cw.markup(")");
        //this.printType(rf);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        if (fn.isFnType) {
            this.cw.type("Fn").markup("(");
            var items = fn.params.list.items;
            for (var i = 0; i < items.length; ++i) {
                if (items[i].infType)
                    items[i].infType.accept(this);
                else
                    this.cw.type("Unknown");
                this.cw.markup(",").space();
            }
            fn.returnType.accept(this);
            this.cw.markup(")");
            return;
        }
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
        this.cw.type("AnyOf").markup("(");
        tao.choices.accept(this);
        this.cw.markup(")");
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




    // semantic ===============================================




    visitDeclr (d : Declr) : void {
        this.visitIdent(d.ident);
        this.printType(d);
    }




    visitClosure (cls : Closure) : void {
    }




    visitRefSlot (rs : RefSlot) : void {
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

    visitLabel (lb : Label) : boolean {
        return false;
    }

    visitGoto (gt : Goto) : boolean {
        return false;
    }




    // expressions
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




class ShortCircuitFnVisitor implements AstVisitor<boolean> {

    private csg : TerminalAstVisitor<boolean>;


    constructor (csg : TerminalAstVisitor<boolean>) {
        this.csg = csg;
    }




    private loopAsiArray (items : Asi[]) : boolean {
        for (var i = 0; i < items.length; i++) {
            var ist = items[i].accept(this);
            if (!ist)
                return false;
        }
        return true;
    }



    private acceptTwo (a : Asi, b : Asi) : boolean {
        var res = a.accept(this);
        if (!res)
            return false;
        return b.accept(this);
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : boolean {
        return this.loopAsiArray(al.items);
    }




    visitExpList (el : ExpList) : boolean {
        return this.loopAsiArray(el.items);
    }




    visitBraced (bc : Braced) : boolean {
        return bc.list ? bc.list.accept(this) : true;
    }




    // statements ===============================================




    visitLoop (l : Loop) : boolean {
        return this.visitScope(l.body);
    }




    visitBreak (b : Break) : boolean {
        return this.csg.visitBreak(b);
    }




    visitContinue (c : Continue) : boolean {
        return this.csg.visitContinue(c);
    }




    visitLabel (lb : Label) : boolean {
        return this.csg.visitLabel(lb);
    }




    visitGoto (gt : Goto) : boolean {
        return this.csg.visitGoto(gt);
    }




    visitImport (im : Import) : boolean {
        return im.value.accept(this);
    }




    visitReturn (r : Return) : boolean {
        return r.value.accept(this);
    }




    visitThrow (th : Throw) : boolean {
        return th.ex.accept(this);
    }




    visitTry (tr : Try) : boolean {
        var res = tr.body.accept(this);
        if (res && tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    res = this.acceptTwo(c.on, c.body);
                    if (!res)
                        return false;
                }
            }
        }
        if (tr.fin)
            return this.visitScope(tr.fin);
        return true;
    }




    // expressions ===============================================




    visitVar (v : Var) : boolean {
        return v.exp.accept(this);
    }




    visitTyping (tpg : Typing) : boolean {
        return this.acceptTwo(tpg.value, tpg.type);
    }




    visitConstraining (csg : Constraining) : boolean {
        return this.acceptTwo(csg.type, csg.constraint);
    }




    visitAssign (a : Assign) : boolean {
        return this.acceptTwo(a.slot, a.value);
    }




    visitScope (sc : Scope) : boolean {
        return this.visitAsiList(sc.list);
    }




    visitIdent (i : Ident) : boolean {
        return this.csg.visitIdent(i);
    }




    visitMemberAccess (ma : MemberAccess) : boolean {
        return this.acceptTwo(ma.bag, ma.member);
    }




    visitFnApply (fna : FnApply) : boolean {
        return this.acceptTwo(fna.args, fna.fn);
    }




    visitBinOpApply (opa : BinOpApply) : boolean {
        var res = this.acceptTwo(opa.op1, opa.op2);
        if (!res)
            return false;
        return this.visitIdent(opa.op);
    }




    visitIf (i : If) : boolean {
        var res = this.acceptTwo(i.test, i.then);
        if (!res)
            return false;
        return i.otherwise.accept(this);
    }




    visitNew (nw : New) : boolean {
        return nw.value.accept(this);
    }




    visitTypeOf (tof : TypeOf) : boolean {
        return tof.value.accept(this);
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : boolean {
        return this.visitFn(bi.fn);
    }




    visitErr (er : Err) : boolean {
        return er.item.accept(this);
    }




    visitVoid (vo : Void) : boolean {
        return this.csg.visitVoid(vo);
    }




    visitBool (b : Bool) : boolean {
        return this.csg.visitBool(b);
    }




    visitInt (ii : Int) : boolean {
        return this.csg.visitInt(ii);
    }




    visitFloat (f : Float) : boolean {
        return this.csg.visitFloat(f);
    }




    visitChar (ch : Char) : boolean {
        return this.csg.visitChar(ch);
    }




    visitArr (arr : Arr) : boolean {
        return this.acceptTwo(arr.list, arr.itemType);
    }




    visitRef (rf : Ref) : boolean {
        return rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : boolean {
        var res = this.acceptTwo(fn.params, fn.body);
        if (!res)
            return false;
        return fn.returnType ? fn.returnType.accept(this) : true;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : boolean {
        return this.visitScope(st.body);
    }




    visitInterface (ifc : Interface) : boolean {
        return this.visitScope(ifc.body);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : boolean {
        return this.csg.visitTypeAny(ta);
    }




    visitTypeAnyOf (tao : TypeAnyOf) : boolean {
        return this.visitExpList(tao.choices);
    }




    visitTypeErr (ter : TypeErr) : boolean {
        return this.csg.visitTypeErr(ter);
    }




    visitTypeVoid (tvo : TypeVoid) : boolean {
        return this.csg.visitTypeVoid(tvo);
    }




    visitTypeBool (tb : TypeBool) : boolean {
        return this.csg.visitTypeBool(tb);
    }




    visitTypeInt (tii : TypeInt) : boolean {
        return this.csg.visitTypeInt(tii);
    }




    visitTypeFloat (tf : TypeFloat) : boolean {
        return this.csg.visitTypeFloat(tf);
    }




    visitTypeChar (tch : TypeChar) : boolean {
        return this.csg.visitTypeChar(tch);
    }




    visitTypeArr (tarr : TypeArr) : boolean {
        return this.acceptTwo(tarr.elementType, tarr.length);
    }




    visitTypeRef (trf : TypeRef) : boolean {
        return trf.elementType.accept(this);
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : boolean {
        return d.ident.accept(this);
    }




    visitClosure (cls : Closure) : boolean {
        return undefined;
    }




    visitRefSlot (rs : RefSlot) : boolean {
        return undefined;
    }
}



