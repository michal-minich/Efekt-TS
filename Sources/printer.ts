/// <reference path="writer.ts"/>
/// <reference path="parser.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    private printAttributes (asi : Asi) : CodeWriter {
        if (asi.attrs)
            for (var i = 0; i < asi.attrs.length; ++i) {
                asi.attrs[i].accept(this);
                this.cw.space();
            }
        return this.cw;
    }




    private printType (asi : Asi) : CodeWriter {
        /*if (asi.infType) {
            this.cw.space().markup(":").space();
            asi.infType.accept(this);
        }*/
        return this.cw;
    }



    private printItems (items : Asi[], showComas : boolean) : CodeWriter {
        for (var i = 0; i < items.length; i++) {
            items[i].accept(this);
            if (i < items.length - 1) {
                if (showComas)
                    this.cw.markup(",").space();
                else
                    this.cw.newLine();
            }
        }
        return this.cw;
    }




    private printScope (items : Asi[], parent : Asi) : CodeWriter {
        const useBraces = items.length > 1
            || (parent && (parent instanceof Fn || parent instanceof Struct ||
            parent instanceof Loop));

        if (items.length === 0) {
            if (useBraces)
                this.cw.markup("{ }");
            return;
        }
        const ln = items.length > 1 || items[0].is(Stm);

        if (ln) {
            if (useBraces)
                this.cw.markup("{").tab().newLine();
            else
                this.cw.tab().newLine();
        } else {
            if (useBraces)
                this.cw.markup("{").space();
        }

        this.printItems(items, false);

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
    }




    // values ===============================================




    visitNew (nw : New) : void {
        this.cw.key("new").space();
        nw.value.accept(this);
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
        if (arr.itemType /*&& arr.itemType instanceof TypeChar*/) {
            this.cw.text('"').text(arrToStr(arr)).text('"');
        } else {
            this.cw.markup("[");
            arr.accept(this);
            this.cw.markup("]");
        }
    }




    visitFn (fn : Fn) : void {
        this.printAttributes(fn);
        /*if (fn.isFnType) {
            this.cw.type("Fn").markup("(");
            const items = fn.params.list.items;
            for (var i = 0; i < items.length; ++i) {
                if (items[i].infType)
                    items[i].infType.accept(this);
                else
                    this.cw.type("Unknown");
                this.cw.markup(",").space();
            }
            if (fn.returnType)
                fn.returnType.accept(this);
            else {
                this.cw.attr("&lt;unknown&gt;");
            }
            this.cw.markup(")");
            return;
        }*/
        this.cw.key("fn").space().markup("(");
        this.printItems(fn.params, true);
        this.cw.markup(")");
        /*if (fn.infType && (<Fn>fn.infType).returnType) {
            this.cw.space().markup("->").space();
            (<Fn>fn.infType).returnType.accept(this);
        }
        if (fn.returnType) {
            this.cw.space().markup("->").space();
            fn.returnType.accept(this);
        }*/
        if (fn.body) {
            this.cw.space();
            this.printScope(fn.body, fn);
        }
    }




    // types ===============================================




    visitStruct (st : Struct) : void {
        this.printAttributes(st);
        this.cw.key("struct").space();
        this.printScope(st.body, st);
    }




    // internal ===============================================




    visitBuiltin (bi : Builtin) : void {
        this.visitFn(bi.fn);
    }




    visitClosure (cls : Closure) : void {
    }




    // expressions ===============================================




    visitAssign (a : Assign) : void {
        a.slot.accept(this);
        this.cw.space().writeOp("=").space();
        a.value.accept(this);
    }




    visitIdent (i : Ident) : void {
        this.printAttributes(i);
        var fn : (value : string, cssClass? : string) => CodeWriter;
        if (i.isOp) {
            // todo this needs special fiedl in fnapply, set by parser
            // that op was used as fnapply
            //if (!(i.parent instanceof FnApply))
            //    this.cw.key("op");
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
            const cssClass = "sc_" + i.declaringEnv.id + "_" + i.name;
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
    }




    visitMemberAccess (ma : MemberAccess) : void {
        ma.bag.accept(this);
        this.cw.writeOp(".");
        ma.member.accept(this);
    }




    visitFnApply (fna : FnApply) : void {
        fna.fn.accept(this);
        this.cw.markup("(");
        this.printItems(fna.args, true);
        this.cw.markup(")");
    }




    visitIf (i : If) : void {
        this.cw.key("if").space();
        i.test.accept(this);
        this.cw.space().key("then").space();
        this.printScope(i.then, i);
        if (i.otherwise) {
            this.cw.space().key("else").space();
            this.printScope(i.otherwise, i);
        }
    }




    visitErr (er : Err) : void {
        this.cw.key("error").space().markup("(");
        er.item.accept(this);
        this.cw.markup(")");
    }




    // statements ===============================================




    visitPragma (pg : Pragma) : void {
        this.cw.key("pragma").space();
        pg.exp.accept(this);
    }




    visitLoop (l : Loop) : void {
        this.cw.key("loop").space();
        this.printScope(l.body, l);
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
        this.printScope(tr.body, tr);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                this.cw.key("catch");
                const c = tr.catches[i];
                if (c.on) {
                    //this.cw.space().markup("(");
                    this.visitVar(c.on);
                    //this.cw.markup(")").space();
                    this.printScope(c.body, tr);
                }
            }
        }
        if (tr.fin) {
            this.cw.newLine().key("finally").space();
            this.printScope(tr.fin, tr);
        }
    }




    visitVar (v : Var) : void {
        this.cw.key("var").space().ident(v.slot.name);
        this.printType(v);

        if (v.value) {
            this.cw.space().writeOp('=').space();
            v.value.accept(this);
        }
    }




    // helpers ===============================================



    visitAsiList (al : AsiList) : void {
        this.printItems(al.items, al.brace === "(" || al.brace === "[");
    }
}