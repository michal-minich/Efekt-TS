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
}




class Interpreter implements AstVisitor<Asi> {




    private exceptionHandler : ExceptionHandler;
    private scopes : InterpreterScope[];
    private loopScopes : InterpreterScope[];
    private currentScope : InterpreterScope;




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
            asisLenght: asisLenght
        };
        this.scopes.push(this.currentScope);
    }




    private pop () : void {
        this.scopes.pop();
    }




    public get (name : string) : Asi {
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




    public set (name : string, value : Asi, createNewVar : boolean) {
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




    public op (name : string) : BinFn {
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
            case '==':
                return function (a, b) {
                    return new Bool(undefined,
                                    Interpreter.str(a) == Interpreter.str(b));
                };
            default:
                throw "operator " + name + " is not defined.";
        }
    }




    private static str (asi : Asi) : string {
        var sw = new StringWriter();
        var cw = new HtmlCodeWriter(sw);
        var p = new Printer(cw);
        asi.accept(p);
        var str = sw.getString();
        return str;
    }




    // helpers ===============================================




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length - 1; i++)
            el.items[i].accept(this);

        return el.items[el.items.length - 1].accept(this);
    }




    // statements ===============================================




    visitLoop (l : Loop) : Asi {
        this.walkScope(l.body, true);
        this.loopScopes.pop();
        return undefined;
    }




    visitBreak (b : Break) : Asi {
        var ls = this.loopScopes[this.loopScopes.length - 1];
        ls.currentAsiIx = ls.asisLenght;
        return undefined;
    }




    visitContinue (c : Continue) : Asi {
        this.currentScope.currentAsiIx = -1;
        return undefined;
    }




    visitReturn (r : Return) : Asi {
        return undefined;
    }




    visitThrow (th : Throw) : Asi {
        this.exceptionHandler(th.ex.accept(this));
        return undefined;
    }




    visitTry (tr : Try) : Asi {
        return undefined;
    }




    // expressions ===============================================




    visitVar (v : Var) : Asi {
        var val = v.value.accept(this);
        this.set(v.ident.name, val, v.useVarKeyword);
        return val;
    }




    visitScope (sc : Scope) : Asi {
        return this.walkScope(sc, false);
    }




    private walkScope (sc : Scope, isLoopScope : boolean) : Asi {
        this.push(sc.items.length);
        var cs = this.currentScope;
        if (isLoopScope)
            this.loopScopes.push(this.currentScope);
        console.log("+");
        while (cs.currentAsiIx < cs.asisLenght - 1) {
            ++cs.currentAsiIx;
            console.log(cs.currentAsiIx, cs.asisLenght);
            var res = sc.items[cs.currentAsiIx].accept(this);
        }
        this.pop();
        console.log("-");
        return res;
    }




    visitIdent (i : Ident) : Asi {
        return this.get(i.name).accept(this);
    }




    visitMember (m : Member) : Asi {
        return undefined;
    }




    visitFnApply (fna : FnApply) : Asi {
        return undefined;
    }




    visitBinOpApply (opa : BinOpApply) : Asi {
        var o1 = opa.op1.accept(this);
        var o2 = opa.op2.accept(this);
        return this.op(opa.op.name)(o1, o2);
    }




    visitIf (i : If) : Asi {
        var t = i.test.accept(this);
        if (t instanceof Bool) {
            if ((<Bool>t).value)
                return i.then.accept(this);
            else if (i.otherwise)
                return i.otherwise.accept(this);
        }
        else {
            throw "if test must evaluate to Bool";
        }
    }




    visitNew (nw : New) : Asi {
        return undefined;
    }




    visitTypeOf (tof : TypeOf) : Asi {
        return undefined;
    }




    // values ===============================================



    visitErr (er : Err) : Asi {
        return er;
    }




    visitVoid (vo : Void) : Asi {
        return vo;
    }




    visitBool (b : Bool) : Asi {
        return b;
    }




    visitInt (ii : Int) : Asi {
        return ii;
    }




    visitFloat (f : Float) : Asi {
        return f;
    }




    visitArr (arr : Arr) : Asi {
        return arr;
    }




    visitRef (rf : Ref) : Asi {
        return rf;
    }




    // values / types ===============================================




    visitFn (fn : Fn) : Asi {
        return fn;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Asi {
        return undefined;
    }




    visitInterface (ifc : Interface) : Asi {
        return undefined;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : Asi {
        return undefined;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : Asi {
        return undefined;
    }




    visitTypeErr (ter : TypeErr) : Asi {
        return undefined;
    }




    visitTypeVoid (tvo : TypeVoid) : Asi {
        return undefined;
    }




    visitTypeBool (tb : TypeBool) : Asi {
        return undefined;
    }




    visitTypeInt (tii : TypeInt) : Asi {
        return undefined;
    }




    visitTypeFloat (tf : TypeFloat) : Asi {
        return undefined;
    }




    visitTypeArr (tarr : TypeArr) : Asi {
        return undefined;
    }




    visitTypeRef (trf : TypeRef) : Asi {
        return undefined;
    }
}