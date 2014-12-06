/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="builtin.ts"/>




class Interpreter implements AstVisitor<Exp> {

    private exceptionHandler : ExceptionHandler;
    private logger : LogWriter;
    private writer : OutputWriter;

    private isBreak : boolean;
    private isContinue : boolean;
    private env : Env<Exp>;
    private asiIx : number;




    constructor (exceptionHandler : ExceptionHandler,
                 logger : LogWriter,
                 writer : OutputWriter) {
        this.exceptionHandler = exceptionHandler;
        this.logger = logger;
        this.writer = writer;
    }




    private static createStringArr (s : string) : Arr {
        const es : Exp[] = [];
        for (var i = 0; i < s.length; ++i)
            es.push(new Char(undefined, s[i]));
        return new Arr(
            undefined, new ExpList(undefined, es), TypeChar.instance);
    }




    private castAsi<T extends Exp> (TConstructor : any, asi : Asi) : Exp {
        return castAsi<T>(TConstructor, asi, this.logger);
    }




    run (sc : Scope) : Exp {
        if (sc.list.items.length === 0)
            return Void.instance;
        try {
            return this.visitScope(sc);
        } catch (ex) {
            if (typeof ex === "string") {
                this.exceptionHandler.exception(Interpreter.createStringArr(ex));
                return Void.instance;
            } else {
                throw ex;
            }
        }
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : Void {
        const is = al.items;
        for (var i = 0; i < is.length; ++i)
            is[i].accept(this);
        return Void.instance;
    }




    visitExpList (el : ExpList) : Exp {
        const is = el.items;
        for (var i = 0; i < is.length - 1; ++i)
            is[i].accept(this);
        return is[is.length - 1].accept(this); // this is questionable. throw?
    }




    visitBraced (bc : Braced) : Exp {
        return bc.list ? bc.list.accept(this) : Void.instance;
    }




    visitPragma (pg : Pragma) : Exp {
        throw undefined;
    }




    // statements ===============================================




    visitLoop (l : Loop) : Void {
        while (!this.isBreak) {
            this.visitScope(l.body);
            this.isContinue = false;
        }
        this.isBreak = false;
        return Void.instance;
    }




    visitBreak (b : Break) : Void {
        this.isBreak = true;
        return Void.instance;
    }




    visitContinue (c : Continue) : Void {
        this.isContinue = true;
        return Void.instance;
    }




    visitLabel (lb : Label) : Void {
        throw undefined;
    }




    visitGoto (gt : Goto) : Void {
        throw undefined;
    }




    visitImport (im : Import) : Void {
        throw undefined;
    }




    visitReturn (r : Return) : Exp {
        return r.value ? r.value.accept(this) : Void.instance;
    }




    visitThrow (th : Throw) : Void {
        this.exceptionHandler.exception(th.ex.accept(this));
        return Void.instance;
    }




    visitTry (tr : Try) : Void {
        return Void.instance;
    }




    // expressions ===============================================




    visitVar (v : Var) : Exp {
        return v.exp.accept(this);
    }




    visitTyping (tpg : Typing) : Exp {
        throw undefined;
    }




    visitConstraining (csg : Constraining) : Exp {
        throw undefined;
    }




    visitAssign (a : Assign) : Exp {
        var val = a.value.accept(this);
        if (val instanceof Closure)
            val = Interpreter.copyStruct(<Closure>val);
        if (a.slot instanceof Ident) {
            this.env.set((<Ident>a.slot).name, val);
        } else if (a.slot instanceof Declr) {
            this.env.declare(
                (<Ident>(<Declr>a.slot).ident).name, val, this.asiIx);
        } else if (a.slot instanceof MemberAccess) {
            const ma = <MemberAccess>a.slot;
            const exp = ma.bag.accept(this);
            if (exp instanceof Closure
                && (<Closure>exp).item instanceof Struct) {
                const cls = <Closure>exp;
                cls.env.set((<Ident>ma.member).name, val);
            } else {
                throw "assign to member - expected struct, got: " +
                getTypeName(ma);
            }
        }/*else if (a.slot instanceof FnApply) {
            const fnRes = <Ref>a.slot.accept(this);
            if (fnRes instanceof Ref) {
                const rf = <Ref>fnRes;
                rf.scope.env.set(rf.item.name, val);
            } else {
                throw "assign to ref - expected ref, got: " +
                    getTypeName(fnRes);
            }
        }*/ else {
            throw "assign to " + getTypeName(a.slot) + " is not supported";
        }
        return val;
    }




    private static copyStruct (cls : Closure) : Closure {
        return cls.item instanceof Struct
            ? new Closure(undefined, cls.env.duplicate(), cls.item)
            : cls;
    }




    visitScope (sc : Scope) : Exp {
        const prevEnv = this.env;
        const prevAsiIx = this.asiIx;
        this.env = this.env
            ? this.env.create()
            : new Env<Exp>(undefined, this.logger);
        this.asiIx = -1;
        var res : Exp = Void.instance;
        while ((this.asiIx < sc.list.items.length - 1) && !this.isBreak &&
        !this.isContinue) {
            ++this.asiIx;
            res = sc.list.items[this.asiIx].accept(this);
        }
        if (res instanceof Closure)
            res = Interpreter.copyStruct(<Closure>res);
        this.env = prevEnv;
        this.asiIx = prevAsiIx;
        return res;
    }




    visitIdent (i : Ident) : Exp {
        return this.env.get(i.name);
    }




    visitMemberAccess (ma : MemberAccess) : Exp {
        const exp = ma.bag.accept(this);
        if (exp instanceof Closure)
            return (<Closure>exp).env.get((<Ident>ma.member).name);
        throw "expected struct before member access, got: " + getTypeName(exp);
    }




    visitFnApply (fna : FnApply) : Exp {
        const args : Exp[] = [];
        if (fna.args.list) {
            const el = <ExpList>fna.args.list;
            for (var i = 0; i < el.items.length; ++i) {
                var ea = el.items[i].accept(this);
                if (ea instanceof Closure)
                    ea = Interpreter.copyStruct(<Closure>ea);
                args.push(ea);
            }
        }

        /*if (fna.fn instanceof Ident) {
            const fni = <Ident>fna.fn;
            if (fni.name === "ref") {
                if (fna.args.list.items.length === 1 &&
                    fna.args.list.items[0] instanceof Ident) {
                    const ident = <Ident>fna.args.list.items[0];
                    const rf = new Ref(undefined, ident);
                    rf.scope.env = this.env.getDeclaringEnv(ident.name);
                    return rf;
                }
            }
        }*/

        /*if (fna.fn instanceof MemberAccess) {
            const ma = <MemberAccess>fna.fn;
            args.splice(0, 0, ma.bag);
            const fna2 = new FnApply(
                undefined,
                new Braced(undefined, new ExpList(undefined, args)),
                ma.member);
            fna2.parent = fna.parent;
            return this.visitFnApply(fna2);
        }*/

        const exp = fna.fn.accept(this);

        if (exp instanceof Builtin) {
            return (<Builtin>exp).impl(args);
        }

        if (exp instanceof Closure) {
            var cls = <Closure>exp;
            if (cls.item instanceof Struct) {
                const s = <Struct>cls.item;
                const c = new Closure(undefined, cls.env.create(), s);
                const prevEnv = this.env;
                this.env = c.env;
                this.visitAsiList(s.body.list);
                this.env = prevEnv;
                return c;
            }
            const fn = <Fn>cls.item;
            cls = (<Closure>exp);
            for (var i = 0; i < args.length; ++i) {
                const p = Interpreter.getFromBracedAt(fn.params, i);
                const n = Interpreter.getName(p);
                cls.env.declare(n, args[i]); // use 3rd parameter
            }
            const prevEnv = this.env;
            const prevAsiIx = this.asiIx;
            this.env = cls.env;
            this.asiIx = -1;
            const res = this.visitScope(fn.body);
            this.env = prevEnv;
            this.asiIx = prevAsiIx;
            return res;
        }

        if (exp instanceof Struct) {
            const st = <Struct>exp;
            this.visitScope(st.body);
            return exp;
        }

        throw "cannot apply " + getTypeName(exp);
    }




    private static getName (e : Exp) : string {
        if (e instanceof Typing)
            e = (<Typing>e).exp;
        else if (e instanceof Constraining)
            e = (<Constraining>e).type;
        if (e instanceof Declr)
            e = (<Declr>e).ident;
        if (e instanceof Ident)
            return (<Ident>e).name;
        else
            throw "exp has no name";
    }




    private static getFromBracedAt (params : Braced, ix : number) : Exp {
        if (params.list) {
            const el = <ExpList>params.list;
            if (el.items.length > ix)
                return el.items[ix];
            else
                throw "fn has no param at " + ix;
        } else {
            throw "fn has no params";
        }
    }




    visitBinOpApply (opa : BinOpApply) : Exp {
        const fna = new FnApply(
            undefined,
            new Braced(undefined, new ExpList(undefined, [opa.op1, opa.op2])),
            opa.op);
        fna.parent = opa.parent;
        return this.visitFnApply(fna);
    }




    visitIf (i : If) : Exp {
        const t = i.test.accept(this);
        if (!(t instanceof Bool))
            throw "if test must evaluate to Bool, not " + getTypeName(t);
        if ((<Bool>t).value)
            return i.then.accept(this);
        else if (i.otherwise)
            return i.otherwise.accept(this);
        else
            return Void.instance;
    }




    visitNew (nw : New) : Ref {
        throw undefined;
    }




    visitTypeOf (tof : TypeOf) : Exp {
        return tof.value.infType;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : Builtin {
        return bi;
    }



    visitErr (er : Err) : Err {
        return er;
    }




    visitVoid (vo : Void) : Void {
        return vo;
    }




    visitBool (b : Bool) : Bool {
        return b;
    }




    visitInt (ii : Int) : Int {
        return ii;
    }




    visitFloat (f : Float) : Float {
        return f;
    }




    visitChar (ch : Char) : Char {
        return ch;
    }




    visitArr (arr : Arr) : Arr {
        return arr;
    }




    visitRef (rf : Ref) : Ref {
        return rf;
    }




    // values / types ===============================================




    visitFn (fn : Fn) : Exp {
        if (!fn.body) {
            if (!fn.attrs)
                return fn;
            for (var i = 0; i < fn.attrs.items.length; i++) {
                const attr = fn.attrs.items[i];
                if (attr instanceof FnApply) {
                    const fnAttr = <FnApply>attr;
                    if (fnAttr.fn instanceof Ident &&
                        (<Ident>fnAttr.fn).name == "@builtin") {
                        const name = arrToStr(<Arr>fnAttr.args.list.items[0]);
                        const bn = builtins[name];
                        if (bn === undefined && name !== "ref")
                            throw "Undefined builtin '" + name + "'";
                        return new Builtin(fn, bn);
                    }
                }
            }
            return fn;
        }
        return new Closure(undefined, this.env.create(), fn);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Closure {
        return new Closure(undefined, this.env.create(), st);
    }




    visitInterface (ifc : Interface) : Interface {
        return ifc;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : TypeAny {
        return ta;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : TypeAnyOf {
        return tao;
    }




    visitTypeErr (ter : TypeErr) : TypeErr {
        return ter;
    }




    visitTypeVoid (tvo : TypeVoid) : TypeVoid {
        return tvo;
    }




    visitTypeBool (tb : TypeBool) : TypeBool {
        return tb;
    }




    visitTypeInt (tii : TypeInt) : TypeInt {
        return tii;
    }




    visitTypeFloat (tf : TypeFloat) : TypeFloat {
        return tf;
    }




    visitTypeChar (tch : TypeChar) : TypeChar {
        return tch;
    }




    visitTypeArr (tarr : TypeArr) : TypeArr {
        return tarr;
    }




    visitTypeRef (trf : TypeRef) : TypeRef {
        return trf;
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : Void {
        this.env.declare(d.ident.name, Void.instance, this.asiIx);
        return Void.instance;
    }




    visitClosure (cls : Closure) : Closure {
        return cls;
    }




    visitRefSlot (rs : RefSlot) : RefSlot {
        return rs;
    }
}