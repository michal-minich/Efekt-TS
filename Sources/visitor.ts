/// <reference path="ast.ts"/>


interface AstVisitor<T> {

    // helpers
    visitAsiList (al : AsiList) : T;

    // statements
    visitVar (v : Var) : T;
    visitLoop(l : Loop) : T;
    visitBreak(b : Break) : T;
    visitContinue(c : Continue) : T;
    visitReturn (r : Return) : T;

    // expresions
    visitScope (sc : Scope) : T;
    visitIdent (i : Ident) : T;
    visitMember (m : Member) : T;
    visitFnApply (fna : FnApply) : T;
    visitBinOpApply (opa : BinOpApply) : T;
    visitIf (i : If) : T;

    // values
    visitErr (er : Err) : T;
    visitVoid (vo : Void) : T;
    visitBool(b : Bool) : T;
    visitInt (ii : Int) : T;
    visitFloat (f : Float) : T;
    visitArr(arr : Arr) : T;
    visitFn (fn : Fn) : T;
    visitStruct (st : Struct) : T;
    visitInterface(ifc : Interface) : T;

    // types
    visitTypeAny(ta : TypeAny) : T;
    visitTypeAnyOf(tao : TypeAnyOf) : T;

    // types of values
    visitTypeErr(ter : TypeErr) : T;
    visitTypeVoid(tvo : TypeVoid) : T;
    visitTypeBool(tb : TypeBool) : T;
    visitTypeInt(tii : TypeInt) : T;
    visitTypeFloat(tf : TypeFloat) : T;
    visitTypeArr(tarr : TypeArr) : T;
    visitTypeFn(tfn : TypeFn) : T;
    visitTypeStruct(tst : TypeStruct) : T;
    visitTypeInterface(tifc : TypeInterface) : T;
}