/// <reference path="ast.ts"/>


interface AstVisitor<T> {
    visitAsiList (al : AsiList) : T;
    visitErr (err : Err) : T;
    visitNone (n : None) : T;
    visitIdent (i : Ident) : T;
    visitScope (sc : Scope) : T;
    visitVar (v : Var) : T;
    visitIf (i : If) : T;
    visitBinOpApply (opa : BinOpApply) : T;
    visitFn (fn : Fn) : T;
    visitFnApply (fna : FnApply) : T;
    visitReturn (r : Return) : T;
    visitObj (o : Obj) : T;
    visitMember (m : Member) : T;
    visitInt (ii : Int) : T;
}