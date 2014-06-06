/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>


class Namer implements AstVisitor<void> {




    private logger : LogWritter;
    private currentScope : Scope;




    constructor (logger : LogWritter) {
        this.logger = logger;
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




    visitLabel (lb : Label) : void {
        //return lb.ident.accept(this);
    }




    visitGoto (gt : Goto) : void {
        //return gt.ident.accept(this);
    }




    visitImport (im : Import) : void {
        //return im.value.accept(this);
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
        if (vv.ident instanceof Ident)
            this.declareIdent(<Ident>vv.ident);
        else
            vv.ident.accept(this);
        vv.typeVar.accept(this);
    }




    visitTypeVar (tv : TypeVar) : void {
        if (tv.typeVar instanceof Ident)
            this.declareIdent(<Ident>tv.typeVar);
        else
            tv.typeVar.accept(this);
        tv.constraint.accept(this);
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        if (a.slot instanceof Ident) {
            var i = <Ident>a.slot;
            if (a.parent instanceof Var) {
                this.declareIdent(i);
            } else {
                var sc = Namer.getScope(this.currentScope, i.name);
                i.scopeId = sc.id;
                i.declaredBy = sc.declrs[i.name];
                i.isWrite = true;
            }
        } else if (a.slot instanceof Member) {
            a.slot.accept(this);
            var i = <Ident>(<Member>a.slot).ident;
            i.isWrite = true;
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




    private processIdent (i : Ident, scope : Scope) {
        var sc = Namer.getScope(scope, i.name);
        i.scopeId = sc.id;
        i.declaredBy = sc.declrs[i.name];
        if (!i.declaredBy)
            throw "variable " + i.name + " is not declared";
    }




    visitIdent (i : Ident) : void {
        this.processIdent(i, this.currentScope);
    }



    private getIdentDeclaredValue (i : Ident) : Exp {
        while (i.declaredBy !== undefined)
            i = i.declaredBy;
        if (i.parent instanceof Assign) {
            var ia = <Assign>i.parent;
            if (ia.value instanceof FnApply) {
                var iaf = <FnApply>ia.value;
                if (iaf.fn instanceof Ident) {
                    var iafi = <Ident>iaf.fn;
                    if (!iafi.isType) {
                        this.logger.warn(
                                "namer - can resolve only sturct" +
                                "constructor, not function application");
                    }
                    return this.getIdentDeclaredValue(iafi);
                }
            } else if (ia.value instanceof Ident) {
                return this.getIdentDeclaredValue(<Ident>ia.value);
            } else {
                return ia.value;
            }
        }
        this.logger.error("namer - ident can be declared only bi assign")
    }




    visitMember (m : Member) : void {
        m.bag.accept(this);
        var bi : Ident;
        if (m.bag instanceof Ident) {
            bi = <Ident>m.bag;
        } else if (m.bag instanceof Member) {
            bi = <Ident>(<Member>m.bag).ident;
        } else {
            this.logger.warn("namer - cannot resolve member access " +
                                 "ident if bag is not ident");
        }

        var bis = this.getIdentDeclaredValue(bi);
        if (bis instanceof Struct)
            this.processIdent(m.ident, (<Struct>bis).body);
        else
            this.logger.warn("namer - member access is not on struct but " +
                                 getTypeName(bis));

    }




    visitFnApply (fna : FnApply) : void {
        this.visitBraced(fna.args);
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



    visitBuiltin (bi : Builtin) : void {
    }




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
        if (!fn.body)
            return;
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