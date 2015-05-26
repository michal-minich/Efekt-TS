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
            es.push(new Char(s[i]));
        return new Arr(es, new Char("")); // todo here should be type
    }




    run (items : Asi[]) : Exp {
        if (items.length === 0)
            return Void.instance;
        try {
            return this.runScope(items);
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




    visitPragma (pg : Pragma) : Exp {
        throw undefined;
    }




    // statements ===============================================




    visitLoop (l : Loop) : Void {
        while (!this.isBreak) {
            this.runScope(l.body);
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
        var val = v.value ? v.value.accept(this) : Void.instance;
        this.env.declare(v.slot.name, val, this.asiIx);
        v.value.accept(this);
        return Void.instance;
    }




    visitAssign (a : Assign) : Exp {
        var val = a.value.accept(this);
        if (val instanceof Closure)
            val = Interpreter.copyStruct(<Closure>val);
        if (a.slot instanceof Ident) {
            this.env.set((<Ident>a.slot).name, val);
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
            ? new Closure(cls.env.duplicate(), cls.item)
            : cls;
    }




    private runScope (items : Asi[]) : Exp {
        const prevEnv = this.env;
        const prevAsiIx = this.asiIx;
        this.env = this.env
            ? this.env.create()
            : new Env<Exp>(undefined, this.logger);
        this.asiIx = -1;
        var res : Exp = Void.instance;
        while ((this.asiIx < items.length - 1) && !this.isBreak &&
        !this.isContinue) {
            ++this.asiIx;
            res = items[this.asiIx].accept(this);
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
        if (fna.args) {
            for (var i = 0; i < fna.args.length; ++i) {
                var ea = fna.args[i].accept(this);
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
                    const rf = new Ref(ident);
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
                new Braced(new ExpList(args)),
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
                const c = new Closure(cls.env.create(), s);
                const prevEnv = this.env;
                this.env = c.env;
                for (var i = 0; i < s.body.length; ++i)
                    s.body[i].accept(this);
                this.env = prevEnv;
                return c;
            }
            const fn = <Fn>cls.item;
            cls = (<Closure>exp);
            for (var i = 0; i < args.length; ++i) {
                const p = Interpreter.getFromBracedAt(fn.params, i);
                const n = p.slot.name;
                cls.env.declare(n, args[i]); // use 3rd parameter
            }
            const prevEnv = this.env;
            const prevAsiIx = this.asiIx;
            this.env = cls.env;
            this.asiIx = -1;
            const res = this.runScope(fn.body);
            this.env = prevEnv;
            this.asiIx = prevAsiIx;
            return res;
        }

        if (exp instanceof Struct) {
            const st = <Struct>exp;
            this.runScope(st.body);
            return exp;
        }

        throw "cannot apply " + getTypeName(exp);
    }




    private static getFromBracedAt (params : Var[], ix : number) : Var {
        if (params) {
            if (params.length > ix)
                return params[ix];
            else
                throw "fn has no param at " + ix;
        } else {
            throw "fn has no params";
        }
    }




    visitIf (i : If) : Exp {
        const t = i.test.accept(this);
        if (!(t instanceof Bool))
            throw "if test must evaluate to Bool, not " + getTypeName(t);
        if ((<Bool>t).value)
            return this.runScope(i.then);
        else if (i.otherwise)
            return this.runScope(i.otherwise);
        else
            return Void.instance;
    }




    visitNew (nw : New) : Err {
        throw undefined;
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




    // values / types ===============================================




    visitFn (fn : Fn) : Exp {
        if (!fn.body) {
            if (!fn.attrs)
                return fn;
            for (var i = 0; i < fn.attrs.length; i++) {
                const attr = fn.attrs[i];
                if (attr instanceof FnApply) {
                    const fnAttr = <FnApply>attr;
                    if (fnAttr.fn instanceof Ident &&
                        (<Ident>fnAttr.fn).name == "@builtin") {
                        const name = arrToStr(<Arr>fnAttr.args[0]);
                        const bn = builtins[name];
                        if (bn === undefined && name !== "ref")
                            throw "Undefined builtin '" + name + "'";
                        return new Builtin(fn, bn);
                    }
                }
            }
            return fn;
        }
        return new Closure(this.env.create(), fn);
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Closure {
        return new Closure(this.env.create(), st);
    }




    // semantic ===============================================




    visitClosure (cls : Closure) : Closure {
        return cls;
    }
}