/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="writer.ts"/>
/// <reference path="printer.ts"/>




interface Vars {
    [name : string] : Asi
}




interface BinFn {
    (op1 : Asi, op2 : Asi) : Asi;
}




interface ExceptionHandler {
    (ex : Asi) : void
}




interface InterpreterScope {
    vars : Vars;
    currentAsiIx : number;
    asisLenght : number;
    parent : InterpreterScope;
}




class Interpreter implements AstVisitor<Asi> {




    private exceptionHandler : ExceptionHandler;
    private scopes : InterpreterScope[];
    private loopScopes : InterpreterScope[];
    private currentScope : InterpreterScope;
    private isBreak : boolean;
    private isContinue : boolean;




    constructor (exceptionHandler : ExceptionHandler) {
        this.exceptionHandler = exceptionHandler;
        this.scopes = [];
        this.loopScopes = [];
    }




    private push (asisLenght : number) : void {
        this.currentScope =
        {
            vars: {},
            currentAsiIx: -1,
            asisLenght: asisLenght,
            parent: this.currentScope
        };
        this.scopes.push(this.currentScope);
    }




    private pop () : void {
        this.scopes.pop();
    }




    get (name : string) : Exp {
        for (var i = this.scopes.length - 1; i >= 0; --i) {
            var asi = this.scopes[i].vars[name];
            if (asi)
                return asi;
        }

        //noinspection UnnecessaryLocalVariableJS
        var ex = "variable " + name + " is undefined.";
        //this.exceptionHandler(new Text(ex));
        throw ex;
    }




    set (name : string, value : Asi, createNewVar : boolean) : void {
        if (createNewVar) {
            this.currentScope.vars[name] = value;
        } else {
            for (var i = this.scopes.length - 1; i >= 0; --i) {
                var s = this.scopes[i];
                if (s.vars[name]) {
                    s.vars[name] = value;
                    return;
                }
            }
            throw "cannot assign to variable " + name +
                " becuase it was not declared.";
        }
    }




    op (name : string) : BinFn {
        switch (name) {
            case '+':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value + +(<Int>b).value));
                };
            case '-':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value - +(<Int>b).value));
                };
            case '*':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value * +(<Int>b).value));
                };
            case '<':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value < +(<Int>b).value));
                };
            case '>':
                return function (a, b) {
                    return new Int(undefined,
                                   "" + (+(<Int>a).value > +(<Int>b).value));
                };
            case '==':
                return function (a, b) {
                    return new Bool(undefined,
                                    asiToString(a) == asiToString(b));
                };
            case '!=':
                return function (a, b) {
                    return new Bool(undefined,
                                    asiToString(a) != asiToString(b));
                };
            default:
                throw "operator " + name + " is not defined.";
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
            this.walkAsiList(l.body.list, true);
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




    visitReturn (r : Return) : Void {
        return Void.instance;
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
        return vv;
    }




    visitTypeVar (tv : TypeVar) : Exp {
        return tv;
    }




    visitAssign (a : Assign) : Exp {
        var val = a.value.accept(this);
        if (a.slot instanceof Ident) {
            this.set((<Ident>a.slot).name, val, a.parent instanceof Var);
        } else {
            throw "assing not supported";
        }
        return val;
    }




    visitScope (sc : Scope) : Exp {
        return this.walkAsiList(sc.list, false);
    }




    private walkAsiList (al : AsiList, isLoopScope : boolean) : Exp {
        this.push(al.items.length);
        var cs = this.currentScope;
        if (isLoopScope)
            this.loopScopes.push(this.currentScope);
        while ((cs.currentAsiIx < cs.asisLenght - 1) && !this.isBreak &&
            !this.isContinue) {
            ++cs.currentAsiIx;
            var res = al.items[cs.currentAsiIx].accept(this);
        }
        this.pop();
        return res;
    }




    visitIdent (i : Ident) : Exp {
        return this.get(i.name).accept(this);
    }




    visitMember (m : Member) : Exp {
        return undefined;
    }




    visitFnApply (fna : FnApply) : Exp {
        var args : Exp[] = [];
        if (fna.args.value instanceof ExpList) {
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

        var fn = fna.fn.accept(this);
        if (fn instanceof Ident) {
            var fnExp = this.get(fni.name);
            return fnExp;
        } else {
            throw "fn apply not supported";
        }
    }




    visitBinOpApply (opa : BinOpApply) : Exp {
        var o1 = opa.op1.accept(this);
        var o2 = opa.op2.accept(this);
        return this.op(opa.op.name)(o1, o2);
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