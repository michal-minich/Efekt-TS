/// <reference path="visitor.ts"/>

class Interpreter implements AstVisitor<Asi> {
    visitAsiList (al : AsiList) : Asi {
        throw undefined;
    }




    visitErr (err : Err) : Asi {
        throw undefined;
    }




    visitNone (n : None) : Asi {
        throw undefined;
    }




    visitIdent (i : Ident) : Asi {
        throw undefined;
    }




    visitScope (sc : Scope) : Asi {
        throw undefined;
    }




    visitVar (v : Var) : Asi {
        throw undefined;
    }




    visitIf (i : If) : Asi {
        throw undefined;
    }




    visitBinOpApply (opa : BinOpApply) : Asi {
        throw undefined;
    }




    visitFn (fn : Fn) : Asi {
        throw undefined;
    }




    visitFnApply (fna : FnApply) : Asi {
        throw undefined;
    }




    visitReturn (r : Return) : Asi {
        throw undefined;
    }




    visitObj (o : Obj) : Asi {
        throw undefined;
    }




    visitMember (m : Member) : Asi {
        throw undefined;
    }




    visitInt (ii : Int) : Asi {
        return ii;
    }
}