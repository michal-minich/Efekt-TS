/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="prelude.ts"/>
/// <reference path="interpreter.ts"/>


class Typer implements AstVisitor<void> {




    private logger : LogWriter;
    private env : Env<Ident>;
    private currentFnReturnType : Exp;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    private commonType (types : Exp[]) : Exp {
        if (types.length === 0)
            return TypeVoid.instance;
        var unique : Exp[] = [];
        for (var i = 0; i < types.length; i++) {
            if (!(types[i] instanceof TypeAny) && !unique.contains(types[i]))
                unique.push(types[i]);
        }

        if (unique.length === 0)
            return TypeAny.instance;
        if (unique.length === 1)
            return unique[0];
        else
            return new TypeAnyOf(undefined, new ExpList(undefined, unique));

    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        al.infType = TypeVoid.instance;
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
    }




    visitExpList (el : ExpList) : void {
        el.infType = TypeVoid.instance;
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
    }




    visitBraced (bc : Braced) : void {
        this.visitExpList(bc.list);
        if (bc.list.items.length === 0)
            bc.infType = TypeVoid.instance;
        if (bc.list.items.length === 1)
            bc.infType = bc.list.items[0].infType;
        else
            bc.infType = TypeVoid.instance; // tuple type ?

    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        l.infType = TypeVoid.instance;
        this.visitScope(l.body);
    }



    visitBreak (b : Break) : void {
        b.infType = TypeVoid.instance;
    }




    visitContinue (c : Continue) : void {
        c.infType = TypeVoid.instance;
    }




    visitLabel (lb : Label) : void {
        lb.infType = TypeVoid.instance;
    }




    visitGoto (gt : Goto) : void {
        gt.infType = TypeVoid.instance;
    }




    visitImport (im : Import) : void {
        im.infType = TypeVoid.instance;
        im.value.accept(this);
    }




    visitReturn (r : Return) : void {
        r.infType = TypeVoid.instance;
        r.value.accept(this);
        this.currentFnReturnType = this.commonType(
            [r.value.infType, this.currentFnReturnType]);
    }




    visitThrow (th : Throw) : void {
        th.infType = TypeVoid.instance;
        th.ex.accept(this);
    }




    visitTry (tr : Try) : void {
        tr.infType = TypeVoid.instance;
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
        v.infType = v.exp.infType;
    }




    visitTyping (tpg : Typing) : void {
        tpg.exp.accept(this);
        tpg.type.accept(this);
        this.addInfTypeToDeclrIdent(tpg.exp, tpg.type);
        tpg.infType = tpg.type;
    }




    visitConstraining (csg : Constraining) : void {
        csg.type.accept(this);
        csg.constraint.accept(this);
        csg.infType = csg.type.infType;
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        a.slot.accept(this);
        this.addInfTypeToDeclrIdent(a.slot, a.value.infType);
        a.infType = a.slot.infType;
    }




    addInfTypeToDeclrIdent (slot : Exp, infType : Exp) : void {
        var tp : Typing;
        var dc : Declr;

        if (slot instanceof Typing) {
            tp = <Typing>slot;
            slot = tp.exp;
        }

        if (slot instanceof Declr) {
            dc = <Declr>slot;
            slot = dc.ident;
        }

        if (slot instanceof Ident) {
            var i = <Ident>slot;
            var itn = Ide.asiToPlainString(infType);
            var dtn = Ide.asiToPlainString(this.env.get(i.name).infType);
            if (dtn === "Any") {
                if (tp)
                    return;
                i.infType = infType;
                var e = this.env.getDeclaringEnv(i.name);
                if (e) {
                    var di = e.getDirectly(i.name);
                    di.infType = infType;
                    if (dc)
                        dc.infType = infType;
                    if (tp)
                        tp.infType = infType;
                }
            } else {
                if (itn !== dtn) {
                    this.logger.error(
                            "Cannot assign value of type '" + itn +
                            "' to variable of type '" + dtn + "'.");
                }
            }
        }
    }




    visitScope (sc : Scope) : void {
        this.env = new Env<Ident>(this.env ? this.env : undefined, this.logger);
        this.visitAsiList(sc.list);
        this.env = this.env.parent;
        sc.infType = sc.list.items.length === 0
            ? TypeVoid.instance
            : sc.list.items[0].infType;
    }




    visitIdent (i : Ident) : void {
        var e = this.env.getDeclaringEnv(i.name);
        if (e) {
            i.infType = e.getDirectly(i.name).infType;
        } else {
            i.infType = new TypeErr(undefined, TypeVoid.instance);
        }
    }




    visitMemberAccess (ma : MemberAccess) : void {
        ma.bag.accept(this);
        //this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        this.visitBraced(fna.args);
        fna.fn.accept(this);
        fna.infType = (<Fn>fna.fn.infType).returnType;

        var fnt = <Fn>fna.fn.infType;
        var params = fnt.params.list.items;
        var args = fna.args.list.items;
        for (var i = 0; i < params.length; ++i) {
            var pt = params[i].infType;
            var at = this.commonType([pt, args[i].infType]);
            this.addInfTypeToDeclrIdent(args[i], at);
        }
    }




    visitBinOpApply (opa : BinOpApply) : void {
        opa.op1.accept(this);
        opa.op.accept(this);
        opa.op2.accept(this);
        opa.infType = (<Fn>opa.op.infType).returnType;
    }




    visitIf (i : If) : void {
        i.test.accept(this);
        if (i.test instanceof Ident) {
            i.test.infType = this.commonType([i.test.infType,
                                              TypeBool.instance]);
            this.addInfTypeToDeclrIdent((<Ident>i.test), i.test.infType);
        }
        i.then.accept(this);
        if (i.otherwise) {
            i.otherwise.accept(this);
            i.infType = this.commonType([i.then.infType, i.otherwise.infType])
        } else {
            i.infType = i.then.infType;
        }
    }



    visitNew (nw : New) : void {
        nw.value.accept(this);
        nw.infType = nw.value.infType;
    }




    visitTypeOf (tof : TypeOf) : void {
        tof.value.accept(this);
        tof.infType = tof.value.infType;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : void {
        throw undefined;
    }




    visitErr (er : Err) : void {
        er.item.infType.accept(this);
        er.infType = new TypeErr(undefined, er.item.infType);
    }




    visitVoid (vo : Void) : void {
        vo.infType = TypeVoid.instance;
    }




    visitBool (b : Bool) : void {
        b.infType = TypeBool.instance;
    }




    visitInt (ii : Int) : void {
        ii.infType = TypeInt.instance;
    }




    visitFloat (f : Float) : void {
        f.infType = TypeFloat.instance;
    }




    visitChar (ch : Char) : void {
        ch.infType = TypeChar.instance;
    }




    visitArr (arr : Arr) : void {
        this.visitExpList(arr.list);
        var ts : Exp[] = [];
        for (var i = 0; i < arr.list.items.length; ++i) {
            arr.list.items[i].accept(this);
            ts.push(arr.list.items[i]);
        }
        var t = this.commonType(ts);
        var len = new Int(undefined, "" + arr.list.items.length);
        len.accept(this);
        arr.infType = new TypeArr(undefined, t, len);
    }




    visitRef (rf : Ref) : void {
        rf.item.accept(this);
        rf.infType = new TypeRef(undefined, rf.item.infType);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        var prevFnReturnType = this.currentFnReturnType;
        this.currentFnReturnType = TypeAny.instance;
        this.env = new Env(this.env, this.logger);
        this.visitBraced(fn.params);
        var fnt = new Fn(undefined, fn.params, undefined);
        fnt.returnType = TypeAny.instance;
        if (fn.body) {
            if (fn.body.list.items.length === 0) {
                fnt.returnType = TypeVoid.instance;
            } else {
                this.visitScope(fn.body);
                fnt.returnType = this.commonType(
                    [this.currentFnReturnType,
                     fn.body.list.items.last().infType]);
            }
        }
        fn.infType = fnt;
        this.env = this.env.parent;
        this.currentFnReturnType = prevFnReturnType;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
    }



    visitInterface (ifc : Interface) : void {
        throw undefined;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        throw undefined;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        throw undefined;
    }




    visitTypeErr (te : TypeErr) : void {
        throw undefined;
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        throw undefined;
    }




    visitTypeBool (tb : TypeBool) : void {
        throw undefined;
    }




    visitTypeInt (tii : TypeInt) : void {
        throw undefined;
    }




    visitTypeFloat (tf : TypeFloat) : void {
        throw undefined;
    }




    visitTypeChar (tch : TypeChar) : void {
        throw undefined;
    }




    visitTypeArr (tarr : TypeArr) : void {
        throw undefined;
    }




    visitTypeRef (trf : TypeRef) : void {
        throw undefined;
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : void {
        this.env.declare(d.ident.name, d.ident);
        if (!d.ident.infType)
            d.ident.infType = TypeAny.instance;
        d.infType = d.ident.infType;
    }




    visitClosure (cls : Closure) : void {
        throw undefined;
    }




    visitRefSlot (rs : RefSlot) : void {
        throw undefined;
    }
}