/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>




interface Vars {
    [name : string] : Asi
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
    private scope : InterpreterScope[];




    constructor (exceptionHandler : ExceptionHandler) {
        this.exceptionHandler = exceptionHandler;
        this.scope = [];
    }




    private push (asisLenght : number) : void {
        this.scope.push(
            {
                vars: {},
                currentAsiIx: -1,
                asisLenght: asisLenght
            }
        );
    }




    private pop () : void {
        this.scope.pop();
    }




    private current () : InterpreterScope {
        return this.scope[this.scope.length - 1];
    }




    public get (name : string) : Asi {
        for (var i = this.scope.length - 1; i >= 0; --i) {
            var asi = this.scope[i].vars[name];
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
            this.current().vars[name] = value;
        } else {
            for (var i = this.scope.length - 1; i >= 0; --i) {
                var s = this.scope[i];
                if (s.vars[name]) {
                    s.vars[name] = value;
                    return;
                }
            }
            throw "cannot assign to variable " + name +
                " becuase it was not declared.";
        }
    }




    // helpers ===============================================




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length - 1; i++)
            el.items[i].accept(this);

        return el.items[el.items.length - 1].accept(this);
    }




    // statements ===============================================




    visitLoop (l : Loop) : Asi {
        this.visitScope(l.body);
        return undefined;
    }




    visitBreak (b : Break) : Asi {
        var cs = this.current();
        cs.currentAsiIx = cs.asisLenght;
        return undefined;
    }




    visitContinue (c : Continue) : Asi {
        var cs = this.current();
        cs.currentAsiIx = -1;
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
        this.push(sc.items.length);
        var cs = this.current();
        while (cs.currentAsiIx < cs.asisLenght - 1) {
            ++cs.currentAsiIx;
            var res = sc.items[cs.currentAsiIx].accept(this);
        }
        this.pop();
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