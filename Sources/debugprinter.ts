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
        this.cw.markup("items");
        if (items.length === 0) {
            this.cw.space().markup("&lt;empty&gt;");
            return;
        }
        this.cw.tab().newLine();
        for (var i = 0; i < items.length; i++) {
            this.cw.markup("" + i).space();
            items[i].accept(this);
            if (i + 1 !== items.length)
                this.cw.newLine();
        }
        this.cw.unTab();
    }




    private printAttributes (asi : Asi) : void {
        if (asi.attrs) {
            this.cw.markup("attrs").tab().newLine();
            this.writeList(asi.attrs.items);
            this.cw.unTab().newLine();
        }
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        this.cw.key("AsiList").tab().newLine();
        this.writeList(al.items);
        this.cw.unTab();
    }




    visitExpList (el : ExpList) : void {
        this.cw.key("ExpList").tab().newLine();
        this.writeList(el.items);
        this.cw.unTab();
    }




    visitBraced (bc : Braced) : void {
        if (this.invisibleBraced) {
            if (bc.list.items.length === 1)
                bc.list.items[0].accept(this);
        } else {
            this.cw.key("Braced").tab().newLine().markup("value").space();
            bc.list.accept(this);
            this.cw.unTab();
        }
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.cw.key("Loop").tab().newLine().markup("body").space();
        this.visitScope(l.body);
        this.cw.unTab();
    }




    visitBreak (b : Break) : void {
        this.cw.key("Break");
    }




    visitContinue (c : Continue) : void {
        this.cw.key("Continue");
    }




    visitLabel (lb : Label) : void {
        this.cw.key("Label").space();
        this.cw.tab().newLine().markup("ident").space();
        lb.ident.accept(this);
        this.cw.unTab();
    }




    visitGoto (gt : Goto) : void {
        this.cw.key("Goto").space();
        this.cw.tab().newLine().markup("ident").space();
        gt.ident.accept(this);
        this.cw.unTab();
    }




    visitImport (im : Import) : void {
        this.cw.key("Import").space();
        this.cw.tab().newLine().markup("value").space();
        im.value.accept(this);
        this.cw.unTab();
    }




    visitReturn (r : Return) : void {
        this.cw.key("Return");
        if (r.value) {
            this.cw.tab().newLine().markup("value").space();
            r.value.accept(this);
            this.cw.unTab();
        } else {
            this.cw.newLine();
        }
    }




    visitThrow (th : Throw) : void {
        this.cw.key("Throw");
        if (th.ex) {
            this.cw.tab().newLine().markup("ex").space();
            th.ex.accept(this);
            this.cw.unTab();
        } else {
            this.cw.newLine();
        }
    }




    visitTry (tr : Try) : void {
        this.cw.key("Try").tab().newLine().markup("body").space();
        this.visitScope(tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                this.cw.newLine().markup("catch");
                var c = tr.catches[i];
                if (c.on) {
                    this.cw.space().markup("(");
                    this.visitVar(c.on);
                    this.cw.markup(")").space();
                    this.visitScope(c.body);
                }
            }
        }
        if (tr.fin) {
            this.cw.newLine().markup("finally").space();
            this.visitScope(tr.fin);
        }
        this.cw.unTab();
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        this.cw.key("Var").tab().newLine();
        this.printAttributes(v);
        this.cw.markup("exp").space();
        v.exp.accept(this);
        this.cw.unTab();
    }




    visitValueVar (vv : ValueVar) : void {
        this.cw.key("ValueVar").tab();
        this.cw.newLine().markup("ident").space();
        vv.ident.accept(this);
        this.cw.newLine().markup("type").space();
        vv.type.accept(this);
        this.cw.unTab();
    }




    visitTypeVar (tv : TypeVar) : void {
        this.cw.key("TypeVar").tab();
        this.cw.newLine().markup("type").space();
        tv.type.accept(this);
        this.cw.newLine().markup("constraint").space();
        tv.constraint.accept(this);
        this.cw.unTab();
    }




    visitAssign (a : Assign) : void {
        this.cw.key("Assign").tab();
        this.cw.newLine().markup("slot").space();
        a.slot.accept(this);
        this.cw.newLine().markup("value").space();
        a.value.accept(this);
        this.cw.unTab();
    }




    visitScope (sc : Scope) : void {
        this.cw.key("Scope").tab().newLine().markup("list").space();
        sc.list.accept(this);
        this.cw.unTab();
    }




    visitIdent (i : Ident) : void {
        this.cw.key("Ident").tab().newLine().markup("name").space();
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
        this.cw.key("Member").tab().newLine().markup("bag").space();
        m.bag.accept(this);
        this.cw.newLine().markup("ident").space();
        this.visitIdent(m.ident);
        this.cw.unTab();
    }




    visitFnApply (fna : FnApply) : void {
        this.cw.key("FnApply").tab().newLine().markup("fn").space();
        fna.fn.accept(this);
        this.cw.newLine().markup("args").space();
        fna.args.accept(this);
        this.cw.unTab();
    }




    visitBinOpApply (opa : BinOpApply) : void {
        this.cw.key("BinOpApply").tab().newLine().markup("op").space();
        opa.op.accept(this);
        this.cw.newLine().markup("op1").space();
        opa.op1.accept(this);
        this.cw.newLine().markup("op2").space();
        opa.op2.accept(this);
        this.cw.unTab();
    }




    visitIf (i : If) : void {
        this.cw.key("If").tab().newLine().markup("test").space();
        i.test.accept(this);
        this.cw.newLine().markup("then").space();
        this.visitScope(i.then);
        if (i.otherwise) {
            this.cw.newLine().markup("otherwise").space();
            this.visitScope(i.otherwise);
        }
        this.cw.unTab();
    }




    visitNew (nw : New) : void {
        this.cw.key("New").tab().newLine().markup("value").space();
        nw.value.accept(this);
        this.cw.unTab();
    }




    visitTypeOf (tof : TypeOf) : void {
        this.cw.key("TypeOf").tab().newLine().markup("value").space();
        tof.value.accept(this);
        this.cw.unTab();
    }




    // values ===============================================




    visitErr (er : Err) : void {
        this.cw.key("error").space().markup("(");
        er.item.accept(this);
        this.cw.markup(")");
    }




    visitVoid (vo : Void) : void {
        this.cw.key("Void");
    }




    visitBool (b : Bool) : void {
        this.cw.key("Bool").tab().newLine().markup("value").space();
        this.cw.key(b.value === true ? "true" : "false");
        this.cw.unTab();
    }




    visitInt (ii : Int) : void {
        this.cw.key("Int").tab().newLine().markup("value")
            .space().num(ii.value).unTab();
    }




    visitFloat (f : Float) : void {
        this.cw.key("Char").tab().newLine().markup("value")
            .text(f.value).unTab();
    }




    visitChar (ch : Char) : void {
        this.cw.key("Char").tab().newLine().markup("value")
            .text("'").text(ch.value).text("'").unTab();
    }




    visitArr (arr : Arr) : void {
        this.cw.key("Arr").tab().newLine().markup("list").space();
        this.visitAsiList(arr.list);
        this.cw.unTab();
    }




    visitRef (rf : Ref) : void {
        this.cw.key("Ref").space().tab().newLine().markup("item").space();
        rf.item.accept(this);
        //this.cw.newLine().markup("scope").space();
        //rf.scope.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.cw.key("Fn").tab().newLine().markup("params").space();
        fn.params.accept(this);
        this.cw.space();
        if (fn.returnType) {
            this.cw.markup("returnType").space();
            fn.returnType.accept(this);
        }
        this.cw.newLine().markup("body").space();
        fn.body.accept(this);
        this.cw.unTab();
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        this.cw.key("Struct").tab().newLine().markup("body")
            .space();
        st.body.accept(this);
        this.cw.unTab();
    }



    visitInterface (ifc : Interface) : void {
        this.cw.key("Interface").tab().newLine().markup("body")
            .space();
        ifc.body.accept(this);
        this.cw.unTab();
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