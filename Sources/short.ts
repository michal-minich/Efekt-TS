/// <reference path="visitor.ts"/>




class ShortCircuitFnVisitor implements AstVisitor<boolean> {

    private csg : TerminalAstVisitor<boolean>;


    constructor (csg : TerminalAstVisitor<boolean>) {
        this.csg = csg;
    }




    private loopAsiArray (items : Asi[]) : boolean {
        for (var i = 0; i < items.length; i++) {
            var ist = items[i].accept(this);
            if (!ist)
                return false;
        }
        return true;
    }



    private acceptTwo (a : Asi, b : Asi) : boolean {
        var res = a.accept(this);
        if (!res)
            return false;
        return b.accept(this);
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : boolean {
        return this.loopAsiArray(al.items);
    }




    visitExpList (el : ExpList) : boolean {
        return this.loopAsiArray(el.items);
    }




    visitBraced (bc : Braced) : boolean {
        return bc.list ? bc.list.accept(this) : true;
    }




    // statements ===============================================




    visitLoop (l : Loop) : boolean {
        return this.visitScope(l.body);
    }




    visitBreak (b : Break) : boolean {
        return this.csg.visitBreak(b);
    }




    visitContinue (c : Continue) : boolean {
        return this.csg.visitContinue(c);
    }




    visitLabel (lb : Label) : boolean {
        return lb.ident.accept(this);
    }




    visitGoto (gt : Goto) : boolean {
        return gt.ident.accept(this);
    }




    visitImport (im : Import) : boolean {
        return im.value.accept(this);
    }




    visitReturn (r : Return) : boolean {
        return r.value.accept(this);
    }




    visitThrow (th : Throw) : boolean {
        return th.ex.accept(this);
    }




    visitTry (tr : Try) : boolean {
        var res = tr.body.accept(this);
        if (res && tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    res = this.acceptTwo(c.on, c.body);
                    if (!res)
                        return false;
                }
            }
        }
        if (tr.fin)
            return this.visitScope(tr.fin);
        return true;
    }




    // expressions ===============================================




    visitVar (v : Var) : boolean {
        return v.exp.accept(this);
    }




    visitTyping (tpg : Typing) : boolean {
        return this.acceptTwo(tpg.value, tpg.type);
    }




    visitConstraining (csg : Constraining) : boolean {
        return this.acceptTwo(csg.type, csg.constraint);
    }




    visitAssign (a : Assign) : boolean {
        return this.acceptTwo(a.slot, a.value);
    }




    visitScope (sc : Scope) : boolean {
        return this.visitAsiList(sc.list);
    }




    visitIdent (i : Ident) : boolean {
        return this.csg.visitIdent(i);
    }




    visitMemberAccess (ma : MemberAccess) : boolean {
        return this.acceptTwo(ma.bag, ma.member);
    }




    visitFnApply (fna : FnApply) : boolean {
        return this.acceptTwo(fna.args, fna.fn);
    }




    visitBinOpApply (opa : BinOpApply) : boolean {
        var res = this.acceptTwo(opa.op1, opa.op2);
        if (!res)
            return false;
        return this.visitIdent(opa.op);
    }




    visitIf (i : If) : boolean {
        var res = this.acceptTwo(i.test, i.then);
        if (!res)
            return false;
        return i.otherwise.accept(this);
    }




    visitNew (nw : New) : boolean {
        return nw.value.accept(this);
    }




    visitTypeOf (tof : TypeOf) : boolean {
        return tof.value.accept(this);
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : boolean {
        return this.visitFn(bi.fn);
    }




    visitErr (er : Err) : boolean {
        return er.item.accept(this);
    }




    visitVoid (vo : Void) : boolean {
        return this.csg.visitVoid(vo);
    }




    visitBool (b : Bool) : boolean {
        return this.csg.visitBool(b);
    }




    visitInt (ii : Int) : boolean {
        return this.csg.visitInt(ii);
    }




    visitFloat (f : Float) : boolean {
        return this.csg.visitFloat(f);
    }




    visitChar (ch : Char) : boolean {
        return this.csg.visitChar(ch);
    }




    visitArr (arr : Arr) : boolean {
        return this.acceptTwo(arr.list, arr.itemType);
    }




    visitRef (rf : Ref) : boolean {
        return rf.item.accept(this);
    }




    // values / types ===============================================




    visitFn (fn : Fn) : boolean {
        var res = this.acceptTwo(fn.params, fn.body);
        if (!res)
            return false;
        return fn.returnType ? fn.returnType.accept(this) : true;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : boolean {
        return this.visitScope(st.body);
    }




    visitInterface (ifc : Interface) : boolean {
        return this.visitScope(ifc.body);
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : boolean {
        return this.csg.visitTypeAny(ta);
    }




    visitTypeAnyOf (tao : TypeAnyOf) : boolean {
        return this.visitExpList(tao.choices);
    }




    visitTypeErr (ter : TypeErr) : boolean {
        return this.csg.visitTypeErr(ter);
    }




    visitTypeVoid (tvo : TypeVoid) : boolean {
        return this.csg.visitTypeVoid(tvo);
    }




    visitTypeBool (tb : TypeBool) : boolean {
        return this.csg.visitTypeBool(tb);
    }




    visitTypeInt (tii : TypeInt) : boolean {
        return this.csg.visitTypeInt(tii);
    }




    visitTypeFloat (tf : TypeFloat) : boolean {
        return this.csg.visitTypeFloat(tf);
    }




    visitTypeChar (tch : TypeChar) : boolean {
        return this.csg.visitTypeChar(tch);
    }




    visitTypeArr (tarr : TypeArr) : boolean {
        return this.acceptTwo(tarr.elementType, tarr.length);
    }




    visitTypeRef (trf : TypeRef) : boolean {
        return trf.elementType.accept(this);
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : boolean {
        return d.ident.accept(this);
    }




    visitClosure (cls : Closure) : boolean {
        return undefined;
    }




    visitRefSlot (rs : RefSlot) : boolean {
        return undefined;
    }
}



