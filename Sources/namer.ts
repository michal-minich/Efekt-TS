/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>


class Namer implements AstVisitor<void> {




    private logger : LogWriter;
    private env : Env<Ident>;




    constructor (logger : LogWriter) {
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
        v.exp.accept(this);
    }




    visitTyping (tpg : Typing) : void {
        tpg.type.accept(this);
        tpg.value.accept(this);
    }




    visitConstraining (csg : Constraining) : void {
        csg.constraint.accept(this);
        csg.type.accept(this);
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        a.slot.accept(this);
        if (a.slot instanceof Ident)
            (<Ident>a.slot).assignedValue = a.value;
    }




    visitScope (sc : Scope) : void {
        this.env = new Env<Ident>(this.env ? this.env : undefined, this.logger);
        this.visitAsiList(sc.list);
        this.env = this.env.parent;
    }




    visitIdent (i : Ident) : void {
        var e = this.env.getDeclaringEnv(i.name);
        if (!e) {
            this.logger.error("variable " + i.name + " is not declared");
            i.isUndefined = true;
            return;
        }
        i.declaringEnv = e;
        i.declaredBy = e.getDirectly(i.name);
    }




    visitMemberAccess (ma : MemberAccess) : void {
        /*if (m.bag instanceof Ident) {
            var i = <Ident>m.bag;
            this.visitIdent(i);
            //this.processIdent(m.ident, i.declaringEnv)
        }*/
        ma.bag.accept(this);
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
        if (!fn.body)
            return;
        this.env = new Env(this.env, this.logger);
        this.visitBraced(fn.params);
        if (fn.returnType)
            fn.returnType.accept(this);
        fn.body.accept(this);
        this.env = this.env.parent;
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




    // semantic ===============================================




    visitDeclr (d : Declr) : void {
        this.env.declare(d.ident.name, d.ident);
        d.ident.declaringEnv = this.env;
    }




    visitClosure (cls : Closure) : void {

    }




    visitRefSlot (rs : RefSlot) : void {
    }
}