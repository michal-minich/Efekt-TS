/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        for (var i = 0; i < al.items.length; i++)
            al[i].accept(this);
    }




    // statements ===============================================


    visitVar (v : Var) : void {
        if (v.isPublic) {
            this.cw.writeKey("public");
            this.cw.writeSpace();
        }
        this.cw.writeKey("var");
        this.cw.writeSpace();
        this.visitIdent(v.ident);
    }




    visitLoop (l : Loop) : void {
        this.cw.writeComment("");
    }




    visitBreak (b : Break) : void {
        this.cw.writeComment("");
    }




    visitContinue (c : Continue) : void {
        this.cw.writeComment("");
    }




    visitReturn (r : Return) : void {
        this.cw.writeKey("return");
        if (r.value != Void.instance) {
            this.cw.writeSpace();
            r.value.accept(this);
        }
    }




    // expressions ===============================================


    visitScope (sc : Scope) : void {
        this.cw.writeMarkup("{");
        this.cw.tab();
        this.visitAsiList(sc.list);
        this.cw.unTab();
        this.cw.writeMarkup("}");
    }




    visitIdent (i : Ident) : void {
        this.cw.writeIdent(i.name);
    }




    visitMember (m : Member) : void {
        return this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        throw undefined;
    }




    visitBinOpApply (opa : BinOpApply) : void {
        throw undefined;
    }




    visitIf (i : If) : void {
        throw undefined;
    }




    // values ===============================================




    visitErr (er : Err) : void {
        throw undefined;
    }




    visitVoid (vo : Void) : void {
    }




    visitBool (b : Bool) : void {
        this.cw.writeComment("");
    }




    visitInt (ii : Int) : void {
        this.cw.writeNum(ii.value);
    }




    visitFloat (f : Float) : void {
        this.cw.writeNum(f.value);
    }




    visitArr (arr : Arr) : void {
        throw undefined;
    }




    visitFn (fn : Fn) : void {
        throw undefined;
    }




    visitStruct (st : Struct) : void {
        throw undefined;
    }



    visitInterface (ifc : Interface) : void {
        this.cw.writeComment("");
    }




    // types ===============================================




    visitTypeAny (ta : TypeAny) : void {
        this.cw.writeComment("");
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        this.cw.writeComment("");
    }




    // types of values ===============================================




    visitTypeErr (te : TypeErr) : void {
        throw undefined;
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        this.cw.writeComment("");
    }




    visitTypeBool (tb : TypeBool) : void {
        this.cw.writeComment("");
    }




    visitTypeInt (tii : TypeInt) : void {
        this.cw.writeComment("");
    }




    visitTypeFloat (tf : TypeFloat) : void {
        this.cw.writeComment("");
    }




    visitTypeArr (tarr : TypeArr) : void {
        this.cw.writeComment("");
    }




    visitTypeFn (tfn : TypeFn) : void {
        this.cw.writeComment("");
    }




    visitTypeStruct (ts : TypeStruct) : void {
        this.cw.writeComment("");
    }




    visitTypeInterface (tifc : TypeInterface) : void {
        this.cw.writeComment("");
    }
}