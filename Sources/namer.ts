/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>


class SlotResolver {

    public self : AstVisitor<Ident> = <any>this;

    // helpers

    visitExpList (el : ExpList) : Ident {
        if (el.items.length !== 1)
            throw "slot resolver braced explist length expected to be 1, it is"
                + el.items.length;
        return el.items[0].accept(this.self);
    }

    visitBraced (bc : Braced) : Ident {
        return this.visitExpList(bc.list);
    }

    // expressions

    visitTyping (tpg : Typing) : Ident {
        return tpg.value.accept(this.self);
    }

    visitConstraining (csg : Constraining) : Ident {
        return csg.type.accept(this.self);
    }

    visitAssign (a : Assign) : Ident {
        return a.slot.accept(this.self);
    }

    visitIdent (i : Ident) : Ident {
        return i;
    }

    visitMember (ma : MemberAccess) : Ident {
        return <Ident>ma.member;
    }
}




class ValueResolver {

    private self : AstVisitor<Ident> = <any>this;
    private logger : LogWriter;

    constructor (logger : LogWriter) {
        this.logger = logger;
    }

    // helpers

    visitExpList (el : ExpList) : Ident {
        if (el.items.length !== 1)
            throw "slot resolver braced explist legnth expected to be 1, it is"
                + el.items.length;
        return el.items[0].accept(this.self);
    }

    visitBraced (bc : Braced) : Ident {
        return this.visitExpList(bc.list);
    }

    // expressions

    visitAssign (a : Assign) : Ident {
        return a.value.accept(this.self);
    }

    visitIdent (i : Ident) : Ident {
        var i2 = i;
        while (i2.declaredBy)
            i2 = i2.declaredBy;
        var a = i2.parent;
        while (!(a instanceof Assign))
            a = a.parent;
        return this.visitAssign(<Assign>a);
    }

    visitMember (ma : MemberAccess) : Ident {
        throw undefined;
    }

    visitFnApply (fna : FnApply) : Ident {
        if (fna.fn instanceof Ident) {
            var fnaFn = <Ident>fna.fn;
            if (!fnaFn.isType) {
                this.logger.warn(
                        "namer - can resolve only sturct" +
                        "constructor, not function application");
            }
            return fnaFn.accept(this.self);
        }
        throw undefined;
    }
}




class Namer implements AstVisitor<void> {




    private logger : LogWriter;
    private slotResolver = new SlotResolver();
    private valueResolver : ValueResolver;
    private env : Env<Ident>;




    constructor (logger : LogWriter) {
        this.logger = logger;
        this.valueResolver = new ValueResolver(this.logger);
    }




    public static declareIdent (i : Ident, env : Env<Ident>) : void {
        env.declare(i.name, i);
        i.declaringEnv = env;
    }




    public static processIdent (i : Ident, env : Env<Ident>) : void {
        var e = env.getDeclaringEnv(i.name);
        i.declaringEnv = e;
        i.declaredBy = e.getDirectly(i.name);
        if (!i.declaredBy)
            throw "variable " + i.name + " is not declared";
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
        var slot = v.exp.accept(this.slotResolver.self);
        Namer.declareIdent(slot, this.env);
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
        if (!i.declaringEnv)
            Namer.processIdent(i, this.env);
    }




    visitMember (ma : MemberAccess) : void {
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
        if (fn.params.list) {
            var el = <ExpList>fn.params.list;
            for (var i = 0; i < el.items.length; ++i) {
                if (el.items[i] instanceof Ident) {
                    var ident = <Ident>el.items[i];
                    Namer.declareIdent(ident, this.env);
                }
                else {
                    el.items[i].accept(this);
                }
            }
        }
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




    visitDeclr (d : Declr) : Declr {
        return d;
    }




    visitClosure (cls : Closure) : Closure {
        return cls;
    }




    visitRefSlot (rs : RefSlot) : RefSlot {
        return rs;
    }
}