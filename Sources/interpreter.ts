/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>




interface Vars {
    [name : string] : Asi
}




interface ExceptionHandler {
    (ex : Asi) : void
}




class Env {

    private parent : Env;
    private exceptionHandler : ExceptionHandler;
    private vars : Vars;


    constructor (parent : Env, exceptionHandler : ExceptionHandler) {
        this.parent = parent;
        this.exceptionHandler = exceptionHandler;
        this.vars = {};
    }


    public get (name : string) : Asi {
        var asi = this.vars[name];
        if (asi) {
            return asi;
        } else if (this.parent) {
            //noinspection TailRecursionJS
            return this.parent.get(name);
        }
        else {
            //noinspection UnnecessaryLocalVariableJS
            var ex = "variable " + name + " is undefined.";
            //this.exceptionHandler(new Text(ex));
            throw ex;
        }
    }




    public set (name : string, value : Asi) : void {
        this.vars[name] = value;
    }
}




class Interpreter implements AstVisitor<Asi> {




    private env : Env;
    private exceptionHandler : ExceptionHandler;



    constructor (exceptionHandler : ExceptionHandler) {
        this.exceptionHandler = exceptionHandler;
    }




    // helpers ===============================================




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length - 1; i++)
            el.items[i].accept(this);

        return el.items[el.items.length - 1].accept(this);
    }




    // statements ===============================================




    visitLoop (l : Loop) : Asi {
        return undefined;
    }




    visitBreak (b : Break) : Asi {
        return undefined;
    }




    visitContinue (c : Continue) : Asi {
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
        this.env.set(v.ident.name, val);
        return val;
    }




    visitScope (sc : Scope) : Asi {
        var parentEnv = this.env;
        this.env = new Env(parentEnv, this.exceptionHandler);
        for (var i = 0; i < sc.items.length - 1; i++)
            sc.items[i].accept(this);
        var res = sc.items[sc.items.length - 1].accept(this);
        this.env = parentEnv;
        return res;
    }




    visitIdent (i : Ident) : Asi {
        return this.env.get(i.name).accept(this);
    }




    visitMember (m : Member) : Asi {
        return undefined;
    }




    visitFnApply (fna : FnApply) : Asi {
        return undefined;
    }




    visitBinOpApply (opa : BinOpApply) : Asi {
        return undefined;
    }




    visitIf (i : If) : Asi {
        var t = i.test.accept(this);
        if (t instanceof Bool) {
            return (<Bool>t).value
                ? i.then.accept(this)
                : i.otherwise.accept(this);
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