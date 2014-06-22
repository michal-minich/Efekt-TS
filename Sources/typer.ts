/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="prelude.ts"/>
/// <reference path="interpreter.ts"/>


class Typer implements AstVisitor<void> {




    private logger : LogWriter;
    private env : Env<Ident>;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    private commonType (types : Exp[]) : Exp {
        for (var i = 0; i < types.length; i++) {
            types[i].accept(this);
        }
        return types[0].infType;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        al.infType = new TypeVoid(undefined);
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
    }




    visitExpList (el : ExpList) : void {
        el.infType = new TypeVoid(undefined);
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
    }




    visitBraced (bc : Braced) : void {
        this.visitExpList(bc.list);
        bc.infType = bc.list.items.length === 0
            ? new TypeVoid(undefined)
            : bc.list.items[0].infType;
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        l.infType = new TypeVoid(undefined);
        this.visitScope(l.body);
    }



    visitBreak (b : Break) : void {
        b.infType = new TypeVoid(undefined);
    }




    visitContinue (c : Continue) : void {
        c.infType = new TypeVoid(undefined);
    }




    visitLabel (lb : Label) : void {
        lb.infType = new TypeVoid(undefined);
        //this.visitIdent(lb.ident);
    }




    visitGoto (gt : Goto) : void {
        gt.infType = new TypeVoid(undefined);
        //this.visitIdent(gt.ident);
    }




    visitImport (im : Import) : void {
        im.infType = new TypeVoid(undefined);
        //im.value.accept(this);
    }




    visitReturn (r : Return) : void {
        r.infType = new TypeVoid(undefined);
        r.value.accept(this);
    }




    visitThrow (th : Throw) : void {
        th.ex.accept(this);
        th.infType = new TypeVoid(undefined);
    }




    visitTry (tr : Try) : void {
        tr.infType = new TypeVoid(undefined);
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
        tpg.value.accept(this);
        tpg.type.accept(this);
        tpg.infType = tpg.type;
    }




    visitConstraining (csg : Constraining) : void {
        csg.constraint.accept(this);
        csg.type.accept(this);
        csg.infType = csg.type;
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        a.slot.accept(this);
        a.infType = a.value.infType;
        if (a.slot instanceof Declr) {
            a.slot.infType = a.infType;
            var i = (<Declr>a.slot).ident;
            i.infType = a.infType;
        } else if (a.slot instanceof Typing) {
            if ((<Typing>a.slot).value instanceof Declr) {
                (<Typing>a.slot).value.infType = a.infType;
                (<Declr>(<Typing>a.slot).value).ident.infType = a.infType;
            } else if ((<Typing>a.slot).value instanceof Ident) {
                (<Ident>a.slot).infType = a.infType;
            }
        } else if (a.slot instanceof Ident) {
            var i = <Ident>a.slot;
            i.infType = a.infType;
            var e = this.env.getDeclaringEnv(i.name);
            if (e) {
                var di = e.getDirectly(i.name);
                di.infType = a.infType;
                di.parent.infType = a.infType;
                di.parent.parent.infType = a.infType;
            }
        }
    }




    visitScope (sc : Scope) : void {
        this.env = new Env<Ident>(this.env ? this.env : undefined, this.logger);
        this.visitAsiList(sc.list);
        this.env = this.env.parent;
        sc.infType = sc.list.items.length === 0
            ? new TypeVoid(undefined)
            : sc.list.items[0].infType;
    }




    visitIdent (i : Ident) : void {
        var e = this.env.getDeclaringEnv(i.name);
        if (e) {
            i.infType = e.getDirectly(i.name).infType;
        } else {
            i.infType = new TypeErr(undefined, new TypeVoid(undefined));
        }
    }




    visitMemberAccess (ma : MemberAccess) : void {
        ma.bag.accept(this);
        //this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        this.visitBraced(fna.args);
        fna.fn.accept(this);
        fna.infType = fna.fn.infType;
    }




    visitBinOpApply (opa : BinOpApply) : void {
        opa.op1.accept(this);
        opa.op.accept(this);
        opa.op2.accept(this);
    }




    visitIf (i : If) : void {
        i.test.accept(this);
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
        vo.infType = new TypeVoid(undefined);
    }




    visitBool (b : Bool) : void {
        b.infType = new TypeBool(undefined);
    }




    visitInt (ii : Int) : void {
        ii.infType = new TypeInt(undefined);
    }




    visitFloat (f : Float) : void {
        f.infType = new TypeFloat(undefined);
    }




    visitChar (ch : Char) : void {
        ch.infType = new TypeChar(undefined);
    }




    visitArr (arr : Arr) : void {
        this.visitExpList(arr.list);
        var t = this.commonType(arr.list.items);
        var len = new Int(undefined, "" + arr.list.items.length);
        arr.infType = new TypeArr(undefined, t, len);
    }




    visitRef (rf : Ref) : void {
        rf.item.accept(this);
        rf.infType = new TypeRef(undefined, rf.item.infType);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.env = new Env(this.env, this.logger);
        this.visitBraced(fn.params);
        if (fn.body) {
            this.env = new Env(this.env, this.logger);
            this.visitScope(fn.body);
            if (fn.body.list.items.length === 1) {
               // var fnt = new Fn(undefined, undefined, undefined);
                //fnt.returnType = fn.body.list.items[0].infType;
                fn.infType = fn.body.list.items[0].infType;
            }
            this.env = this.env.parent;
        }
        this.env = this.env.parent;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        throw undefined;
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
        d.infType = d.ident.infType;
    }




    visitClosure (cls : Closure) : void {
        throw undefined;
    }




    visitRefSlot (rs : RefSlot) : void {
        throw undefined;
    }
}