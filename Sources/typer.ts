/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="prelude.ts"/>
/// <reference path="interpreter.ts"/>


class Typer implements AstVisitor<void> {




    private logger : LogWriter;
    private currentScope : Scope;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    private commonType (types : Exp[]) : Exp {
        for (var i = 0; i < types.length; i++) {
            types[i].accept(this);
        }
        return types[0].type;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        al.type = new TypeVoid(undefined);
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
    }




    visitExpList (el : ExpList) : void {
        el.type = new TypeVoid(undefined);
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
    }




    visitBraced (bc : Braced) : void {
        bc.type = bc.list.items.length === 0
            ? new TypeVoid(undefined)
            : bc.list.items[0].type;
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        l.type = new TypeVoid(undefined);
        this.visitScope(l.body);
    }



    visitBreak (b : Break) : void {
        b.type = new TypeVoid(undefined);
    }




    visitContinue (c : Continue) : void {
        c.type = new TypeVoid(undefined);
    }




    visitLabel (lb : Label) : void {
        lb.type = new TypeVoid(undefined);
        //this.visitIdent(lb.ident);
    }




    visitGoto (gt : Goto) : void {
        gt.type = new TypeVoid(undefined);
        //this.visitIdent(gt.ident);
    }




    visitImport (im : Import) : void {
        im.type = new TypeVoid(undefined);
        //im.value.accept(this);
    }




    visitReturn (r : Return) : void {
        r.type = new TypeVoid(undefined);
        r.value.accept(this);
    }




    visitThrow (th : Throw) : void {
        th.ex.accept(this);
        th.type = new TypeVoid(undefined);
    }




    visitTry (tr : Try) : void {
        tr.type = new TypeVoid(undefined);
        tr.body.accept(this);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    c.on.accept(this);
                    c.body.accept(this);
                }
            }
        }
        if (tr.fin)
            this.visitScope(tr.fin);
    }




    // expressions ===============================================




    visitVar (v : Var) : void {
        v.exp.accept(this);
        v.type = v.exp.type;
    }




    visitValueVar (vv : ValueVar) : void {
        vv.ident.accept(this);
        vv.typeVar.accept(this);
        vv.type = vv.typeVar;
    }




    visitTypeVar (tv : TypeVar) : void {
        tv.constraint.accept(this);
        tv.typeVar.accept(this);
        tv.type = tv.typeVar;
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        a.slot.accept(this);
        a.type = a.value.type;
    }



    visitScope (sc : Scope) : void {
        var prevScope = this.currentScope;
        this.currentScope = sc;
        this.visitAsiList(sc.list);
        this.currentScope = prevScope;
        sc.type = sc.list.items.length === 0
            ? new TypeVoid(undefined)
            : sc.list.items[0].type;
    }




    visitIdent (i : Ident) : void {
        if (i.declaredBy)
            i.type = i.declaredBy.type;
        else
            i.type = new TypeVoid(undefined);
    }




    visitMember (ma : MemberAccess) : void {
        m.bag.accept(this);
        //this.visitIdent(m.ident);
    }




    visitFnApply (fna : FnApply) : void {
        this.visitBraced(fna.args);
        fna.fn.accept(this);
    }




    visitBinOpApply (opa : BinOpApply) : void {
        opa.op1.accept(this);
        opa.op.accept(this);
        opa.op2.accept(this);
    }




    visitIf (i : If) : void {
        i.test.accept(this);
        i.then.accept(this);
        if (i.otherwise) {
            i.otherwise.accept(this);
            i.type = this.commonType([i.then.type, i.otherwise.type])
        } else {
            i.type = i.then.type;
        }
    }




    visitNew (nw : New) : void {
        nw.value.accept(this);
        nw.type = nw.value.type;
    }




    visitTypeOf (tof : TypeOf) : void {
        tof.value.accept(this);
        tof.type = tof.value.type;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : void {
        throw undefined;
    }




    visitErr (er : Err) : void {
        er.item.type.accept(this);
        er.type = new TypeErr(undefined, er.item.type);
    }




    visitVoid (vo : Void) : void {
        vo.type = new TypeVoid(undefined);
    }




    visitBool (b : Bool) : void {
        b.type = new TypeBool(undefined);
    }




    visitInt (ii : Int) : void {
        ii.type = new TypeInt(undefined);
    }




    visitFloat (f : Float) : void {
        f.type = new TypeFloat(undefined);
    }




    visitChar (ch : Char) : void {
        ch.type = new TypeChar(undefined);
    }




    visitArr (arr : Arr) : void {
        this.visitExpList(arr.list);
        var t = this.commonType(arr.list.items);
        var len = new Int(undefined, "" + arr.list.items.length);
        arr.type = new TypeArr(undefined, t, len);
    }




    visitRef (rf : Ref) : void {
        rf.item.accept(this);
        rf.type = new TypeRef(undefined, rf.item.type);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        throw undefined;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : void {
        throw undefined;
    }



    visitInterface (ifc : Interface) : void {
        throw undefined;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : void {
        throw undefined;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : void {
        throw undefined;
    }




    visitTypeErr (te : TypeErr) : void {
        throw undefined;
    }




    visitTypeVoid (tvo : TypeVoid) : void {
        throw undefined;
    }




    visitTypeBool (tb : TypeBool) : void {
        throw undefined;
    }




    visitTypeInt (tii : TypeInt) : void {
        throw undefined;
    }




    visitTypeFloat (tf : TypeFloat) : void {
        throw undefined;
    }




    visitTypeChar (tch : TypeChar) : void {
        throw undefined;
    }




    visitTypeArr (tarr : TypeArr) : void {
        throw undefined;
    }




    visitTypeRef (trf : TypeRef) : void {
        throw undefined;
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : void {
        throw undefined;
    }




    visitClosure (cls : Closure) : void {
        throw undefined;
    }




    visitRefSlot (rs : RefSlot) : void {
        throw undefined;
    }
}