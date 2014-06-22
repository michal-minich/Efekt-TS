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
        return types[0].infType;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : void {
        al.infType = new TypeVoid(undefined);
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
    }




    visitExpList (el : ExpList) : void {
        el.infType = new TypeVoid(undefined);
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
    }




    visitBraced (bc : Braced) : void {
        bc.infType = bc.list.items.length === 0
            ? new TypeVoid(undefined)
            : bc.list.items[0].infType;
    }




    // statements ===============================================




    visitLoop (l : Loop) : void {
        l.infType = new TypeVoid(undefined);
        this.visitScope(l.body);
    }



    visitBreak (b : Break) : void {
        b.infType = new TypeVoid(undefined);
    }




    visitContinue (c : Continue) : void {
        c.infType = new TypeVoid(undefined);
    }




    visitLabel (lb : Label) : void {
        lb.infType = new TypeVoid(undefined);
        //this.visitIdent(lb.ident);
    }




    visitGoto (gt : Goto) : void {
        gt.infType = new TypeVoid(undefined);
        //this.visitIdent(gt.ident);
    }




    visitImport (im : Import) : void {
        im.infType = new TypeVoid(undefined);
        //im.value.accept(this);
    }




    visitReturn (r : Return) : void {
        r.infType = new TypeVoid(undefined);
        r.value.accept(this);
    }




    visitThrow (th : Throw) : void {
        th.ex.accept(this);
        th.infType = new TypeVoid(undefined);
    }




    visitTry (tr : Try) : void {
        tr.infType = new TypeVoid(undefined);
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
        v.infType = v.exp.infType;
    }




    visitTyping (tpg : Typing) : void {
        tpg.value.accept(this);
        tpg.type.accept(this);
        tpg.infType = tpg.type;
    }




    visitConstraining (csg : Constraining) : void {
        csg.constraint.accept(this);
        csg.type.accept(this);
        csg.infType = csg.type;
    }




    visitAssign (a : Assign) : void {
        a.value.accept(this);
        a.slot.accept(this);
        a.infType = a.value.infType;
    }



    visitScope (sc : Scope) : void {
        var prevScope = this.currentScope;
        this.currentScope = sc;
        this.visitAsiList(sc.list);
        this.currentScope = prevScope;
        sc.infType = sc.list.items.length === 0
            ? new TypeVoid(undefined)
            : sc.list.items[0].infType;
    }




    visitIdent (i : Ident) : void {
        if (i.declaredBy)
            i.infType = i.declaredBy.infType;
        else
            i.infType = new TypeErr(undefined, new TypeVoid(undefined));
    }




    visitMemberAccess (ma : MemberAccess) : void {
        ma.bag.accept(this);
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
            i.infType = this.commonType([i.then.infType, i.otherwise.infType])
        } else {
            i.infType = i.then.infType;
        }
    }




    visitNew (nw : New) : void {
        nw.value.accept(this);
        nw.infType = nw.value.infType;
    }




    visitTypeOf (tof : TypeOf) : void {
        tof.value.accept(this);
        tof.infType = tof.value.infType;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : void {
        throw undefined;
    }




    visitErr (er : Err) : void {
        er.item.infType.accept(this);
        er.infType = new TypeErr(undefined, er.item.infType);
    }




    visitVoid (vo : Void) : void {
        vo.infType = new TypeVoid(undefined);
    }




    visitBool (b : Bool) : void {
        b.infType = new TypeBool(undefined);
    }




    visitInt (ii : Int) : void {
        ii.infType = new TypeInt(undefined);
    }




    visitFloat (f : Float) : void {
        f.infType = new TypeFloat(undefined);
    }




    visitChar (ch : Char) : void {
        ch.infType = new TypeChar(undefined);
    }




    visitArr (arr : Arr) : void {
        this.visitExpList(arr.list);
        var t = this.commonType(arr.list.items);
        var len = new Int(undefined, "" + arr.list.items.length);
        arr.infType = new TypeArr(undefined, t, len);
    }




    visitRef (rf : Ref) : void {
        rf.item.accept(this);
        rf.infType = new TypeRef(undefined, rf.item.infType);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : void {
        this.visitBraced(fn.params);
        this.visitScope(fn.body);
        if (fn.body.list.items.length === 1) {
            fn.infType = fn.body.list.items[0].infType;
        }
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
        this.visitIdent(d.ident);
        d.infType = d.ident.infType;
    }




    visitClosure (cls : Closure) : void {
        throw undefined;
    }




    visitRefSlot (rs : RefSlot) : void {
        throw undefined;
    }
}