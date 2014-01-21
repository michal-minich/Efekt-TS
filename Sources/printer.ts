/// <reference path="writer.ts"/>
/// <reference path="visitor.ts"/>

class Printer implements AstVisitor<void> {

    private cw : CodeWriter;




    constructor (cw : CodeWriter) {
        this.cw = cw;
    }




    visitAsiList (al : AsiList) : void {
        throw undefined;
    }




    visitErr (err : Err) : void {
        throw undefined;
    }




    visitNone (n : None) : void {
    }




    visitIdent (i : Ident) : void {
        this.cw.writeIdent(i.name);
    }




    visitScope (sc : Scope) : void {
        this.cw.writeMarkup("{");
        this.cw.tab();
        this.visitAsiList(sc.list);
        this.cw.unTab();
        this.cw.writeMarkup("}");
    }




    visitVar (v : Var) : void {
        if (v.isPublic) {
            this.cw.writeKey("public");
            this.cw.writeSpace();
        }
        this.cw.writeKey("var");
        this.cw.writeSpace();
        this.visitIdent(v.ident);
    }




    visitIf (i : If) : void {
        throw undefined;
    }




    visitBinOpApply (opa : BinOpApply) : void {
        throw undefined;
    }




    visitFn (fn : Fn) : void {
        throw undefined;
    }




    visitFnApply (fna : FnApply) : void {
        throw undefined;
    }




    visitReturn (r : Return) : void {
        this.cw.writeKey("return");
        if (r.value != None.instance) {
            this.cw.writeSpace();
            r.value.accept(this);
        }
    }




    visitObj (o : Obj) : void {
        throw undefined;
    }




    visitMember (m : Member) : void {
        return this.visitIdent(m.ident);
    }




    visitInt (ii : Int) : void {
        this.cw.writeNum(ii.value);
    }
}