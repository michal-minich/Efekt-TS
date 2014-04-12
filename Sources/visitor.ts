/// <reference path="ast.ts"/>


interface AstVisitor<T> {

    // helpers
    visitAsiList (al : AsiList) : T;
    visitExpList (el : ExpList) : T;

    // statements
    visitLoop (l : Loop) : T;
    visitBreak (b : Break) : T;
    visitContinue (c : Continue) : T;
    visitReturn (r : Return) : T;
    visitThrow (th : Throw) : T;
    visitTry (tr : Try) : T;

    // expresions
    visitVar (v : Var) : T;
    visitValueVar (tv : ValueVar) : T;
    visitTypeVar (vv : TypeVar) : T;
    visitAssign (a : Assign) : T;
    visitScope (sc : Scope) : T;
    visitIdent (i : Ident) : T;
    visitMember (m : Member) : T;
    visitFnApply (fna : FnApply) : T;
    visitBinOpApply(opa : BinOpApply) : T;
    visitIf (i : If) : T;
    visitNew (nw : New) : T;
    visitTypeOf (tof : TypeOf) : T;

    // values
    visitErr (er : Err) : T;
    visitVoid (vo : Void) : T;
    visitBool (b : Bool) : T;
    visitInt (ii : Int) : T;
    visitFloat (f : Float) : T;
    visitChar (ch : Char) : T;
    visitArr (arr : Arr) : T;
    visitRef (rf : Ref) : T;

    // values / types
    visitFn (fn : Fn) : T;

    // types (user defined)
    visitStruct (st : Struct) : T;
    visitInterface (ifc : Interface) : T;

    // types (built in)
    visitTypeAny (ta : TypeAny) : T;
    visitTypeAnyOf (tao : TypeAnyOf) : T;
    visitTypeErr (ter : TypeErr) : T;
    visitTypeVoid (tvo : TypeVoid) : T;
    visitTypeBool (tb : TypeBool) : T;
    visitTypeInt (tii : TypeInt) : T;
    visitTypeFloat (tf : TypeFloat) : T;
    visitTypeArr (tarr : TypeArr) : T;
    visitTypeRef (trf : TypeRef) : T;
}