/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="visitor.ts"/>
/// <reference path="prelude.ts"/>
/// <reference path="interpreter.ts"/>


class Fixer implements AstVisitor<Asi> {




    private logger : LogWriter;
    private currentScope : Scope;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : Asi {
        for (var i = 0; i < al.items.length; i++) {
            al.items[i].accept(this);
        }
        return al;
    }




    visitExpList (el : ExpList) : Asi {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i].accept(this);
        }
        return el;
    }




    visitBraced (bc : Braced) : Asi {
        return bc;
    }




    // statements ===============================================




    visitLoop (l : Loop) : Asi {
        this.visitScope(l.body);
        return l;
    }



    visitBreak (b : Break) : Asi {
        return b;
    }




    visitContinue (c : Continue) : Asi {
        return c;
    }




    visitLabel (lb : Label) : Asi {
        //this.visitIdent(lb.ident);
        return lb;
    }




    visitGoto (gt : Goto) : Asi {
        //this.visitIdent(gt.ident);
        return gt;
    }




    visitImport (im : Import) : Asi {
        //im.value.accept(this);
        return im;
    }




    visitReturn (r : Return) : Asi {
        r.value.accept(this);
        return r;
    }




    visitThrow (th : Throw) : Asi {
        th.ex.accept(this);
        return th;
    }




    visitTry (tr : Try) : Asi {
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
        return tr;
    }




    // expressions ===============================================



    private static convertToDeclr (parent : any, property: string) {
        var i = <Ident>parent[property];
        var d = new Declr(undefined, i);
        d.parent = parent;
        parent[property] = d;
    }



    visitVar (v : Var) : Asi {
        v.exp.accept(this);

        if (v.exp instanceof Ident)
            Fixer.convertToDeclr(v, 'exp');
        else if (v.exp instanceof Typing)
            Fixer.convertToDeclr(v.exp, 'value');
        else if (v.exp instanceof Constraining)
            Fixer.convertToDeclr(v.exp, 'type');
        else if (v.exp instanceof Assign) {
            var s = (<Assign>v.exp).slot;
            if (s instanceof Ident)
                Fixer.convertToDeclr(v.exp, 'slot');
            else if (s instanceof Typing)
                Fixer.convertToDeclr(s, 'value');
            else if (s instanceof Constraining)
                Fixer.convertToDeclr(s, 'type');
        }

        return v;
    }


    visitTyping (tpg : Typing) : Asi {
        tpg.value.accept(this);
        return tpg;
    }




    visitConstraining (csg : Constraining) : Asi {
        csg.constraint.accept(this);
        return csg;
    }




    visitAssign (a : Assign) : Asi {
        a.value.accept(this);
        a.slot.accept(this);
        return a;
    }



    visitScope (sc : Scope) : Asi {
        var prevScope = this.currentScope;
        this.currentScope = sc;
        this.visitAsiList(sc.list);
        this.currentScope = prevScope;
        return sc;
    }




    visitIdent (i : Ident) : Asi {
        return i;
    }




    visitMember (ma : MemberAccess) : Asi {
        ma.bag.accept(this);
        //this.visitIdent(m.ident);
        return ma;
    }




    visitFnApply (fna : FnApply) : Asi {
        this.visitBraced(fna.args);
        fna.fn.accept(this);
        return fna;
    }




    visitBinOpApply (opa : BinOpApply) : Asi {
        opa.op1.accept(this);
        opa.op.accept(this);
        opa.op2.accept(this);
        return opa;
    }




    visitIf (i : If) : Asi {
        i.test.accept(this);
        i.then.accept(this);
        if (i.otherwise) {
            i.otherwise.accept(this);
        } else {
        }
        return i;
    }




    visitNew (nw : New) : Asi {
        nw.value.accept(this);
        return nw;
    }




    visitTypeOf (tof : TypeOf) : Asi {
        tof.value.accept(this);
        return tof;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : Asi {
        return bi;
    }




    visitErr (er : Err) : Asi {
        return er;
    }




    visitVoid (vo : Void) : Asi {
        return vo;
    }




    visitBool (b : Bool) : Asi {
        return b;
    }




    visitInt (ii : Int) : Asi {
        return ii;
    }




    visitFloat (f : Float) : Asi {
        return f;
    }




    visitChar (ch : Char) : Asi {
        return ch;
    }




    visitArr (arr : Arr) : Asi {
        this.visitExpList(arr.list);
        return arr;
    }




    visitRef (rf : Ref) : Asi {
        rf.item.accept(this);
        return rf;
    }




    // values / types ===============================================




    visitFn (fn : Fn) : Asi {
        //for (var i = 0; i < fn.params.list.items.length; ++i) {
        //    if (fn)
        //}
        return fn;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Asi {
        return st;
    }



    visitInterface (ifc : Interface) : Asi {
        return ifc;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : Asi {
        return ta;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : Asi {
        return tao;
    }




    visitTypeErr (te : TypeErr) : Asi {
        return te;
    }




    visitTypeVoid (tvo : TypeVoid) : Asi {
        return tvo;
    }




    visitTypeBool (tb : TypeBool) : Asi {
        return tb;
    }




    visitTypeInt (tii : TypeInt) : Asi {
        return tii;
    }




    visitTypeFloat (tf : TypeFloat) : Asi {
        return tf;
    }




    visitTypeChar (tch : TypeChar) : Asi {
        return tch;
    }




    visitTypeArr (tarr : TypeArr) : Asi {
        return tarr;
    }




    visitTypeRef (trf : TypeRef) : Asi {
        return trf;
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : Asi {
        return d;
    }




    visitClosure (cls : Closure) : Asi {
        return cls;
    }




    visitRefSlot (rs : RefSlot) : Asi {
        return rs;
    }
}