/// <reference path="ast.ts"/>


interface AstVisitor<T> extends TerminalAstVisitor<T>,
                                SemanticAstVisitor<T> {

    // helpers
    visitAsiList (al : AsiList) : T;
    visitExpList (el : ExpList) : T;
    visitBraced (bc : Braced) : T;

    // statements
    visitLoop (l : Loop) : T;
    //visitBreak (b : Break) : T;
    //visitContinue (c : Continue) : T;
    //visitLabel (lb : Label) : T;
    //visitGoto (gt : Goto) : T;
    visitImport (im : Import) : T;
    visitReturn (r : Return) : T;
    visitThrow (th : Throw) : T;
    visitTry (tr : Try) : T;

    // expressions
    visitVar (v : Var) : T;
    visitTyping (tpg : Typing) : T;
    visitConstraining (csg : Constraining) : T;
    visitAssign (a : Assign) : T;
    visitScope (sc : Scope) : T;
    //visitIdent (i : Ident) : T;
    visitMemberAccess (ma : MemberAccess) : T;
    visitFnApply (fna : FnApply) : T;
    visitBinOpApply(opa : BinOpApply) : T;
    visitIf (i : If) : T;
    visitNew (nw : New) : T;
    visitTypeOf (tof : TypeOf) : T;

    // values
    visitBuiltin (bi : Builtin) : T;
    visitErr (er : Err) : T;
    //visitVoid (vo : Void) : T;
    //visitBool (b : Bool) : T;
    //visitInt (ii : Int) : T;
    //visitFloat (f : Float) : T;
    //visitChar (ch : Char) : T;
    visitArr (arr : Arr) : T;
    visitRef (rf : Ref) : T;

    // values / types
    visitFn (fn : Fn) : T;

    // types (user defined)
    visitStruct (st : Struct) : T;
    visitInterface (ifc : Interface) : T;

    // types (built in)
    //visitTypeAny (ta : TypeAny) : T;
    visitTypeAnyOf (tao : TypeAnyOf) : T;
    //visitTypeErr (ter : TypeErr) : T;
    //visitTypeVoid (tvo : TypeVoid) : T;
    //visitTypeBool (tb : TypeBool) : T;
    //visitTypeInt (tii : TypeInt) : T;
    //visitTypeFloat (tf : TypeFloat) : T;
    //visitTypeChar (tch : TypeChar) : T;
    visitTypeArr (tarr : TypeArr) : T;
    visitTypeRef (trf : TypeRef) : T;

    // semantic
    //visitDeclr(d : Declr);
    //visitClosure(cls : Closure);
    //visitRefSlot(rs : RefSlot);
}




interface SemanticAstVisitor<T> {

    // semantic
    visitDeclr (d : Declr) : T;
    visitClosure (cls : Closure) : T;
    visitRefSlot (rs : RefSlot) : T;
}




interface TerminalAstVisitor<T> {

    // statements
    visitBreak (b : Break) : T;
    visitContinue (c : Continue) : T;
    visitLabel (lb : Label) : T;
    visitGoto (gt : Goto) : T;

    // expressions
    visitIdent (i : Ident) : T;

    // values
    visitVoid (vo : Void) : T;
    visitBool (b : Bool) : T;
    visitInt (ii : Int) : T;
    visitFloat (f : Float) : T;
    visitChar (ch : Char) : T;

    // types (built in)
    visitTypeAny (ta : TypeAny) : T;
    visitTypeErr (ter : TypeErr) : T;
    visitTypeVoid (tvo : TypeVoid) : T;
    visitTypeBool (tb : TypeBool) : T;
    visitTypeInt (tii : TypeInt) : T;
    visitTypeFloat (tf : TypeFloat) : T;
    visitTypeChar (tch : TypeChar) : T;
}