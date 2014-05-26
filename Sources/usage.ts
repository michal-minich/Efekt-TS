/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>


class Usage implements AstVisitor<void> {




    private logger : Logger;
    private writer : OutputWriter;
    private currentScope : Scope;




    constructor (logger : Logger, writer : OutputWriter) {
        this.logger = logger;
        this.writer = writer;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
    }




    visitExpList (el : ExpList) : void {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
    }




    visitBraced (bc : Braced) : void {
        bc.list.accept(this);
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        this.visitScope(l.body);
    }



    visitBreak (b : Break) : void {
    }




    visitContinue (c : Continue) : void {
    }




    visitReturn (r : Return) : void {
        r.value.accept(this);
    }




    visitThrow (th : Throw) : void {
        th.ex.accept(this);
    }




    visitTry (tr : Try) : void {
        tr.body.accept(this);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    c.on.accept(this);
                    c.body.accept(this);
                }
            }
        }
        if (tr.fin)
            this.visitScope(tr.fin);
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        if (v.exp instanceof Ident)
            this.declareIdent(<Ident>v.exp);
        else
            v.exp.accept(this);
    }




    visitValueVar (vv : ValueVar) : void {
        vv.ident.accept(this);
        vv.type.accept(this);
    }




    visitTypeVar (tv : TypeVar) : void {
        tv.type.accept(this);
        tv.constraint.accept(this);
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        if (a.slot instanceof Ident) {
            var i = <Ident>a.slot;
            if (a.parent instanceof Var) {
                this.declareIdent(i);
            } else {
                var sc = Usage.getScope(this.currentScope, i.name);
                i.scopeId = sc.id;
                i.declaredBy = sc.declrs[i.name];
                i.isWrite = true;
            }
        } else {
            a.slot.accept(this);
        }
    }




    private declareIdent (i : Ident) : void {
        this.currentScope.declrs[i.name] = i;
        i.scopeId = this.currentScope.id;
    }




    visitScope (sc : Scope) : void {
        var prevScope = this.currentScope;
        this.currentScope = sc;
        this.visitAsiList(sc.list);
        this.currentScope = prevScope;
    }




    private static getScope (scope : Scope, name : string) : Scope {
        var sc = scope;
        while (sc) {
            var asi = sc.declrs[name];
            if (asi)
                return sc;
            sc = sc.parentScope;
        }

        throw "variable " + name + " is undeclared.";
    }




    visitIdent (i : Ident) : void {
        if (i.isOp || i.name === "print" || i.name === "count" ||
            i.name === "at" || i.name === "add" || i.name === "Ref" ||
            i.name === "target") {
            i.isBuiltin = true;
            return;
        }
        var sc = Usage.getScope(this.currentScope, i.name);
        i.scopeId = sc.id;
        i.declaredBy = sc.declrs[i.name];
        if (!i.declaredBy)
            throw "variable " + i.name + " is not declared";
    }




    visitMember (m : Member) : void {
        m.bag.accept(this);
        m.ident.accept(this);
    }




    visitFnApply (fna : FnApply) : void {
        fna.args.accept(this);
        fna.fn.accept(this);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        opa.op1.accept(this);
        opa.op.accept(this);
        opa.op2.accept(this);
    }




    visitIf (i : If) : void {
        i.test.accept(this);
        i.then.accept(this);
        if (i.otherwise)
            i.otherwise.accept(this);
    }




    visitNew (nw : New) : void {
        nw.value.accept(this);
    }




    visitTypeOf (tof : TypeOf) : void {
        tof.value.accept(this);
    }




    // values ===============================================




    visitErr (er : Err) : void {
        er.item.accept(this);
    }




    visitVoid (vo : Void) : void {
    }




    visitBool (b : Bool) : void {
    }




    visitInt (ii : Int) : void {
    }




    visitFloat (f : Float) : void {
    }




    visitChar (ch : Char) : void {
    }




    visitArr (arr : Arr) : void {
        arr.list.accept(this);
        if (arr.itemType)
            arr.itemType.accept(this);
    }




    visitRef (rf : Ref) : void {
        rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        var prevScope = this.currentScope;
        this.currentScope = fn.body;

        if (fn.params.list) {
            var el = <ExpList>fn.params.list;
            for (var i = 0; i < el.items.length; ++i) {
                if (el.items[i] instanceof Ident) {
                    var ident = <Ident>el.items[i];
                    this.declareIdent(ident);
                    ident.scopeId = fn.body.id;
                }
                else {
                    el.items[i].accept(this);
                }
            }
        }

        if (fn.returnType)
            fn.returnType.accept(this);
        fn.body.accept(this);

        this.currentScope = prevScope;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        st.body.accept(this);
    }



    visitInterface (ifc : Interface) : void {
        ifc.body.accept(this);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        tao.choices.accept(this);
    }




    visitTypeErr (te : TypeErr) : void {
    }




    visitTypeVoid (tvo : TypeVoid) : void {
    }




    visitTypeBool (tb : TypeBool) : void {
    }




    visitTypeInt (tii : TypeInt) : void {
    }




    visitTypeFloat (tf : TypeFloat) : void {
    }




    visitTypeChar (tch : TypeChar) : void {
    }




    visitTypeArr (tarr : TypeArr) : void {
        tarr.elementType.accept(this);
    }




    visitTypeRef (trf : TypeRef) : void {
        trf.elementType.accept(this);
    }
}