/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="builtin.ts"/>
/// <reference path="prelude.ts"/>




class Interpreter implements AstVisitor<Exp> {

    private exceptionHandler : ExceptionHandler;
    private logger : LogWriter;
    private writer : OutputWriter;

    private isBreak : boolean;
    private isContinue : boolean;
    private currentEnv : Env<Exp>;
    private currentAsiIx : number;
    private currentAsiCount : number;




    constructor (exceptionHandler : ExceptionHandler,
                 logger : LogWriter,
                 writer : OutputWriter) {
        this.exceptionHandler = exceptionHandler;
        this.logger = logger;
        this.writer = writer;
    }




    private static createStringArr (s : string) : Arr {
        var exps : Exp[] = [];
        for (var i = 0; i < s.length; ++i) {
            exps.push(new Char(undefined, s[i]));
        }
        var arr = new Arr(undefined, new ExpList(undefined, exps),
                          new TypeChar(undefined));
        return arr;
    }




    run (sc : Scope) : Exp {
        if (sc.list.items.length === 0)
            return Void.instance;
        try {
            return this.visitScope(sc);
        } catch (ex) {
            if (ex instanceof String) {
                var arr = Interpreter.createStringArr(ex);
                this.exceptionHandler.exception(arr);
                return Void.instance;
            } else {
                throw ex;
            }
        }
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : Asi {
        throw "Interpreter.visitAsiList";
    }




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length - 1; i++)
            el.items[i].accept(this);

        return el.items[el.items.length - 1].accept(this);
    }




    visitBraced (bc : Braced) : Exp {
        return bc.list ? bc.list.accept(this) : Void.instance;
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
        //return lb.ident.accept(this);
    }




    visitGoto (gt : Goto) : Void {
        throw undefined;
        //return gt.ident.accept(this);
    }




    visitImport (im : Import) : Void {
        throw undefined;
        //return im.value.accept(this);
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
        if (v.exp instanceof Declr)
            this.currentEnv.declare((<Declr>v.exp).ident.name,
                                    Void.instance,
                                    this.currentAsiIx);
        return v.exp.accept(this);
    }




    visitTyping (tpg : Typing) : Exp {
        return tpg.exp;
    }




    visitConstraining (csg : Constraining) : Exp {
        return csg.type;
    }




    visitAssign (a : Assign) : Exp {
        var val = a.value.accept(this);
        if (val instanceof Struct)
            val = Interpreter.copyStruct(<Struct>val);
        if (a.slot instanceof Ident) {
            this.currentEnv.set((<Ident>a.slot).name, val);
        } else if (a.slot instanceof Declr) {
            this.currentEnv.declare((<Ident>(<Declr>a.slot).ident).name,
                                    val,
                                    this.currentAsiIx);
        } else if (a.slot instanceof MemberAccess) {
            var ma = <MemberAccess>a.slot;
            var exp = ma.bag.accept(this);
            if (exp instanceof Struct) {
                var s = <Struct>exp;
                s.body.env.set((<Ident>ma.member).name, val);
            } else {
                throw "assign to member - expected struct, got: " +
                    getTypeName(ma);
            }
        } else if (a.slot instanceof FnApply) {
            var fnRes = <Ref>a.slot.accept(this);
            if (fnRes instanceof Ref) {
                var rf = <Ref>fnRes;
                rf.scope.env.set(rf.item.name, val);
            } else {
                throw "assign to ref - expected ref, got: " +
                    getTypeName(fnRes);
            }
        } else {
            throw "assign to " + getTypeName(a.slot) + " is not supported";
        }
        return val;
    }




    private static copyStruct (s : Struct) : Struct {
        var sc = new Scope(s.body.attrs ? s.body.attrs : undefined,
                           s.body.list);
        sc.env = s.body.env.duplicate();
        var c = new Struct(s.attrs ? s.attrs : undefined, sc);
        return c;
    }




    visitScope (sc : Scope) : Exp {
        var prevEnv = this.currentEnv;
        var prevAsiIx = this.currentAsiIx;
        var prevAsiCount = this.currentAsiCount;
        this.currentEnv = this.currentEnv
            ? this.currentEnv.create()
            : new Env<Exp>(undefined, this.logger);
        this.currentAsiIx = -1;
        this.currentAsiCount = sc.list.items.length;
        var res = this.walkAsiList(sc.list);
        this.currentEnv = prevEnv;
        this.currentAsiIx = prevAsiIx;
        this.currentAsiCount = prevAsiCount;
        return res;
    }




    private walkAsiList (al : AsiList) : Exp {
        var res = Void.instance;
        while ((this.currentAsiIx < this.currentAsiCount - 1) &&
            !this.isBreak && !this.isContinue) {
            ++this.currentAsiIx;
            res = al.items[this.currentAsiIx].accept(this);
        }
        if (res instanceof Struct)
            res = Interpreter.copyStruct(<Struct>res);
        return res;
    }




    visitIdent (i : Ident) : Exp {
        return this.currentEnv.get(i.name).accept(this);
    }




    visitMemberAccess (ma : MemberAccess) : Exp {
        var exp = ma.bag.accept(this);
        if (exp instanceof Struct) {
            var bag = <Struct>exp;
            return bag.body.env.get((<Ident>ma.member).name);
        }
        throw "expected struct before member access, got: " + getTypeName(exp);
    }




    visitFnApply (fna : FnApply) : Exp {
        var args : Exp[] = [];
        if (fna.args.list) {
            var el = <ExpList>fna.args.list;
            for (var i = 0; i < el.items.length; ++i) {
                var ea = el.items[i].accept(this);
                if (ea instanceof Struct)
                    ea = Interpreter.copyStruct(<Struct>ea);
                args.push(ea);
            }
        }

        if (fna.fn instanceof Ident) {
            var fni = <Ident>fna.fn;
            if (fni.name === "ref") {
                if (fna.args.list.items.length === 1 &&
                    fna.args.list.items[0] instanceof Ident) {
                    var ident = <Ident>fna.args.list.items[0];
                    var rf = new Ref(undefined, ident);
                    rf.scope.env = this.currentEnv.getDeclaringEnv(ident.name);
                    return rf;
                }
            }
        }

        if (fna.fn instanceof MemberAccess) {
            var ma = <MemberAccess>fna.fn;
            args.splice(0, 0, ma.bag);
            var fna2 = new FnApply(
                undefined,
                new Braced(undefined, new ExpList(undefined, args)),
                ma.member);
            fna2.parent = fna.parent;
            return this.visitFnApply(fna2);
        }

        var exp = fna.fn.accept(this);

        if (exp instanceof Builtin) {
            return (<Builtin>exp).impl(args);
        }

        if (exp instanceof Closure) {
            var fn = <Fn>(<Closure>exp).item;
            var cls = (<Closure>exp);
            for (var i = 0; i < args.length; ++i) {
                var p = Interpreter.getFromBracedAt(fn.params, i);
                var n = Interpreter.getName(p);
                cls.env.declare(n, args[i]); // use 3rd parameter
            }
            var prevEnv = this.currentEnv;
            var prevAsiIx = this.currentAsiIx;
            var prevAsiCount = this.currentAsiCount;
            this.currentEnv = cls.env;
            this.currentAsiIx = -1;
            this.currentAsiCount = fn.body.list.items.length;
            var res = this.visitScope(fn.body);
            this.currentEnv = prevEnv;
            this.currentAsiIx = prevAsiIx;
            this.currentAsiCount = prevAsiCount;
            return res;
        }

        if (exp instanceof Struct) {
            var st = <Struct>exp;
            this.visitScope(st.body);
            return exp;
        }

        throw "cannot apply " + getTypeName(exp);
    }




    private static getName (e : Exp) : string {
        if (e instanceof Declr)
            e = (<Declr>e).ident;
        if (e instanceof Ident)
            return (<Ident>e).name;
        else if (e instanceof Typing)
            return Interpreter.getName((<Typing>e).exp);
        else if (e instanceof Constraining)
            return Interpreter.getName((<Constraining>e).type);
        else
            throw "exp has no name";
    }




    private static getFromBracedAt (params : Braced, ix : number) : Exp {
        if (params.list) {
            var el = <ExpList>params.list;
            if (el.items.length > ix)
                return el.items[ix];
            else
                throw "fn has no param at " + ix;
        } else {
            throw "fn has no params";
        }
    }




    visitBinOpApply (opa : BinOpApply) : Exp {
        var fna = new FnApply(undefined,
                              new Braced(undefined,
                                         new ExpList(undefined,
                                                     [opa.op1, opa.op2])),
                              opa.op);
        fna.parent = opa.parent;
        return this.visitFnApply(fna);
    }




    visitIf (i : If) : Exp {
        var t = i.test.accept(this);
        if (t instanceof Bool) {
            if ((<Bool>t).value)
                return i.then.accept(this);
            else if (i.otherwise)
                return i.otherwise.accept(this);
            else
                return Void.instance;
        }
        else {
            throw "if test must evaluate to Bool";
        }
    }




    visitNew (nw : New) : Ref {
        throw "new not implemented";
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
                var attr = fn.attrs.items[i];
                if (attr instanceof FnApply) {
                    var fnAttr = <FnApply>attr;
                    if (fnAttr.fn instanceof Ident &&
                        (<Ident>fnAttr.fn).name == "@builtin") {
                        var name = arrToStr(<Arr>fnAttr.args.list.items[0]);
                        var bn = builtins[name];
                        if (bn === undefined && name !== "ref")
                            throw "Undefined builtin '" + name + "'";
                        return new Builtin(fn, bn);
                    }
                }
            }
            return fn;
        }
        var cls = new Closure(undefined, this.currentEnv.create(), fn);
        return cls;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Struct {
        if (!st.body.env)
            st.body.env = this.currentEnv.create();
        return st;
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