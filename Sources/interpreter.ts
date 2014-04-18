/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>
/// <reference path="builtin.ts"/>




interface BinFn {
    (op1 : Exp, op2 : Exp) : Exp;
}




interface ExceptionHandler {
    (ex : Exp) : void
}




class Interpreter implements AstVisitor<Exp> {




    private exceptionHandler : ExceptionHandler;
    private isBreak : boolean;
    private isContinue : boolean;
    private currentScope : Scope;




    constructor (exceptionHandler : ExceptionHandler) {
        this.exceptionHandler = exceptionHandler;
    }




    private get (scope : Scope, name : string) : Exp {
        var sc = scope;
        while (sc) {
            var asi = sc.vars[name];
            if (asi)
                return asi;
            sc = sc.parentScope;
        }

        //noinspection UnnecessaryLocalVariableJS
        var ex = "variable " + name + " is undefined.";
        //this.exceptionHandler(new Text(ex));
        throw ex;
    }




    private set (scope : Scope,
                 name : string,
                 value : Asi,
                 createNewVar : boolean) : void {
        if (createNewVar) {
            scope.vars[name] = value;
        } else {
            var sc = scope;
            while (sc) {
                if (sc.vars[name]) {
                    sc.vars[name] = value;
                    return;
                }
                sc = sc.parentScope;
            }
            throw "cannot assign to variable " + name +
                " becuase it was not declared.";
        }
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : Asi {
        throw "Intrpreter.visitAsiList";
    }




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length - 1; i++)
            el.items[i].accept(this);

        return el.items[el.items.length - 1].accept(this);
    }




    visitBraced (bc : Braced) : Exp {
        return bc.value ? bc.value.accept(this) : Void.instance;
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




    visitReturn (r : Return) : Exp {
        return r.value ? r.value.accept(this) : Void.instance;
    }




    visitThrow (th : Throw) : Void {
        this.exceptionHandler(th.ex.accept(this));
        return Void.instance;
    }




    visitTry (tr : Try) : Void {
        return Void.instance;
    }




    // expressions ===============================================




    visitVar (v : Var) : Exp {
        return v.exp.accept(this);
    }




    visitValueVar (vv : ValueVar) : Exp {
        return vv.ident;
    }




    visitTypeVar (tv : TypeVar) : Exp {
        return tv.type;
    }




    visitAssign (a : Assign) : Exp {
        var val = a.value.accept(this);
        if (a.slot instanceof Ident) {
            this.set(this.currentScope, (<Ident>a.slot).name, val,
                     a.parent instanceof Var);
        } else {
            throw "assing not supported";
        }
        return val;
    }




    visitScope (sc : Scope) : Exp {
        this.currentScope = sc;
        sc.currentAsiIx = -1;
        var res = this.walkAsiList(sc.list);
        this.currentScope = sc.parentScope;
        return res;
    }




    private walkAsiList (al : AsiList) : Exp {
        var cs = this.currentScope;
        while ((cs.currentAsiIx < cs.list.items.length - 1) && !this.isBreak &&
            !this.isContinue) {
            ++cs.currentAsiIx;
            var res = al.items[cs.currentAsiIx].accept(this);
        }
        return res;
    }




    visitIdent (i : Ident) : Exp {
        return this.get(this.currentScope, i.name).accept(this);
    }




    visitMember (m : Member) : Exp {
        return undefined;
    }




    visitFnApply (fna : FnApply) : Exp {
        var args : Exp[] = [];
        if (!fna.args.value) {
        } else if (fna.args.value instanceof ExpList) {
            var el = <ExpList>fna.args.value;
            for (var i = 0; i < el.items.length; ++i)
                args.push(el.items[i].accept(this));
        } else if (fna.args.value instanceof Exp) {
            args = [fna.args.value.accept(this)];
        } else {
            args = [];
        }
        if (fna.fn instanceof Ident) {
            var fni = <Ident>fna.fn;
            if (fni.name === "print") {
                var codeView = <HTMLPreElement>document.getElementById("codeView");
                var astView = <HTMLPreElement>document.getElementById("astView");
                for (var i = 0; i < args.length; ++i) {
                    codeView.innerHTML += asiToHtmlString(args[i]) + "<br>";
                    astView.innerHTML += asiToAstString(args[i]) + "<br>";
                }
                return Void.instance;
            }
        }

        var exp = fna.fn.accept(this);
        if (exp instanceof Fn) {
            var fn = <Fn>exp;
            var sc = new Scope(undefined, fn.body.list);
            sc.parent = this.currentScope;
            for (var i = 0; i < args.length; ++i) {
                var p = Interpreter.getFromBracedAt(fn.params, i);
                var n = Interpreter.getName(p);
                this.set(sc, n, args[i], true);
            }
            return this.visitScope(sc);
        } else {
            throw "fn is not fn type";
        }
    }




    private static getName (e : Exp) : string {
        if (e instanceof Ident)
            return (<Ident>e).name;
        else if (e instanceof ValueVar)
            return this.getName((<ValueVar>e).ident);
        else if (e instanceof TypeVar)
            return this.getName((<TypeVar>e).type);
        else
            throw "exp has no name";
    }




    private static getFromBracedAt (params : Braced, ix : number) : Exp {
        if (params.value instanceof ExpList) {
            var el = <ExpList>params.value;
            if (el.items.length > ix)
                return el.items[ix];
            else
                throw "fn has no param at " + ix;
        } else if (params.value instanceof Exp) {
            if (ix === 0)
                return params.value;
            else
                throw "fn has only one param";
        } else {
            throw "fn has no params";
        }
    }




    visitBinOpApply (opa : BinOpApply) : Exp {
        var o1 = opa.op1.accept(this);
        var o2 = opa.op2.accept(this);
        return BuiltIn.op(opa.op.name)(o1, o2);
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
        return undefined;
    }




    visitTypeOf (tof : TypeOf) : Exp {
        return undefined;
    }




    // values ===============================================



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




    visitFn (fn : Fn) : Fn {
        return fn;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Struct {
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




    visitTypeArr (tarr : TypeArr) : TypeArr {
        return tarr;
    }




    visitTypeRef (trf : TypeRef) : TypeRef {
        return trf;
    }
}