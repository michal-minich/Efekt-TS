/// <reference path="common.ts"/>
/// <reference path="ast.ts"/>
/// <reference path="prelude.ts"/>
/// <reference path="interpreter.ts"/>


class Fixer implements AstVisitor<Asi> {




    private logger : LogWriter;
    private currentScope : Scope;




    constructor (logger : LogWriter) {
        this.logger = logger;
    }




    public fix (asi : Asi) : Asi {
        if (!preludeIsFixed) {
            prelude = <AsiList>prelude.accept(this);
            preludeIsFixed = true;
        }
        return asi.accept(this);
    }




    // helpers ===============================================




    visitAsiList (al : AsiList) : AsiList {
        for (var i = 0; i < al.items.length; i++) {
            al.items[i] = al.items[i].accept(this);
        }
        return al;
    }




    visitExpList (el : ExpList) : ExpList {
        for (var i = 0; i < el.items.length; i++) {
            el.items[i] = el.items[i].accept(this);
        }
        return el;
    }




    visitBraced (bc : Braced) : Braced {
        bc.list = this.visitExpList(bc.list);
        return bc;
    }




    // statements ===============================================




    visitLoop (l : Loop) : Loop {
        l.body = this.visitScope(l.body);
        return l;
    }



    visitBreak (b : Break) : Break {
        return b;
    }




    visitContinue (c : Continue) : Continue {
        return c;
    }




    visitLabel (lb : Label) : Label {
        //this.visitIdent(lb.ident);
        return lb;
    }




    visitGoto (gt : Goto) : Goto {
        //this.visitIdent(gt.ident);
        return gt;
    }




    visitImport (im : Import) : Import {
        //im.value.accept(this);
        return im;
    }




    visitReturn (r : Return) : Return {
        r.value = r.value.accept(this);
        return r;
    }




    visitThrow (th : Throw) : Asi {
        th.ex = th.ex.accept(this);
        return th;
    }




    visitTry (tr : Try) : Try {
        tr.body = this.visitScope(tr.body);
        if (tr.catches) {
            for (var i = 0; i < tr.catches.length; i++) {
                var c = tr.catches[i];
                if (c.on) {
                    c.on = this.visitVar(c.on);
                    c.body = this.visitScope(c.body);
                }
            }
        }
        if (tr.fin)
            tr.fin = this.visitScope(tr.fin);
        return tr;
    }




    // expressions ===============================================




    private static convertToDeclr (parent : any, property : string) : void {
        var d = new Declr(undefined, <Ident>parent[property]);
        d.parent = parent;
        parent[property] = d;
    }




    visitVar (v : Var) : Var {
        v.exp = v.exp.accept(this);
        v.exp = Fixer.makeDeclr(v.exp);
        return v;
    }




    private static makeDeclr (exp : Exp) : Exp {
        if (exp instanceof Ident) {
            var p = exp.parent;
            var d = new Declr(undefined, <Ident>exp);
            d.parent = p;
            return d;
        }
        else if (exp instanceof Typing)
            Fixer.convertToDeclr(exp, 'exp');
        else if (exp instanceof Constraining)
            Fixer.convertToDeclr(exp, 'type');
        else if (exp instanceof Assign) {
            var s = (<Assign>exp).slot;
            if (s instanceof Ident)
                Fixer.convertToDeclr(exp, 'slot');
            else if (s instanceof Typing)
                Fixer.convertToDeclr(s, 'exp');
            else if (s instanceof Constraining)
                Fixer.convertToDeclr(s, 'type');
        }
        return exp;
    }




    visitTyping (tpg : Typing) : Typing {
        tpg.exp = tpg.exp.accept(this);
        return tpg;
    }




    visitConstraining (csg : Constraining) : Constraining {
        csg.constraint = csg.constraint.accept(this);
        return csg;
    }




    visitAssign (a : Assign) : Assign {
        a.value = a.value.accept(this);
        a.slot = a.slot.accept(this);
        return a;
    }



    visitScope (sc : Scope) : Scope {
        var prevScope = this.currentScope;
        this.currentScope = sc;
        sc.list = this.visitAsiList(sc.list);
        this.currentScope = prevScope;
        return sc;
    }




    visitIdent (i : Ident) : Ident {
        return i;
    }




    visitMemberAccess (ma : MemberAccess) : MemberAccess {
        ma.bag = ma.bag.accept(this);
        //this.visitIdent(m.ident);
        return ma;
    }




    visitFnApply (fna : FnApply) : Exp {
        fna.args = this.visitBraced(fna.args);
        fna.fn = fna.fn.accept(this);
        /*if (fna.fn instanceof Ident && (<Ident>fna.fn).name === "ref") {
            return new Ref(undefined, <Ident>fna.args.list.items[0]);
        }*/
        return fna;
    }




    visitBinOpApply (opa : BinOpApply) : BinOpApply {
        opa.op1 = opa.op1.accept(this);
        opa.op = this.visitIdent(opa.op);
        opa.op2 = opa.op2.accept(this);
        return opa;
    }




    visitIf (i : If) : If {
        i.test = i.test.accept(this);
        i.then = this.visitScope(i.then);
        if (i.otherwise) {
            i.otherwise = this.visitScope(i.otherwise);
        } else {
        }
        return i;
    }




    visitNew (nw : New) : New {
        nw.value = nw.value.accept(this);
        return nw;
    }




    visitTypeOf (tof : TypeOf) : TypeOf {
        tof.value = tof.value.accept(this);
        return tof;
    }




    // values ===============================================



    visitBuiltin (bi : Builtin) : Builtin {
        return bi;
    }




    visitErr (er : Err) : Err {
        return er;
    }




    visitVoid (vo : Void) : Void {
        return vo;
    }




    visitBool (b : Bool) : Bool {
        return b;
    }




    visitInt (ii : Int) : Int {
        return ii;
    }




    visitFloat (f : Float) : Float {
        return f;
    }




    visitChar (ch : Char) : Char {
        return ch;
    }




    visitArr (arr : Arr) : Arr {
        arr.list = this.visitExpList(arr.list);
        return arr;
    }




    visitRef (rf : Ref) : Ref {
        rf.item = this.visitIdent(rf.item);
        return rf;
    }




    // values / types ===============================================




    visitFn (fn : Fn) : Fn {
        fn.params = this.visitBraced(fn.params);
        var items = fn.params.list.items;
        for (var i = 0; i < items.length; ++i)
            items[i] = Fixer.makeDeclr(items[i]);
        if (fn.body)
            fn.body = this.visitScope(fn.body);
        return fn;
    }




    // types (user defined) ===============================================




    visitStruct (st : Struct) : Struct {
        return st;
    }



    visitInterface (ifc : Interface) : Interface {
        return ifc;
    }




    // types (built in) ===============================================




    visitTypeAny (ta : TypeAny) : TypeAny {
        return ta;
    }




    visitTypeAnyOf (tao : TypeAnyOf) : TypeAnyOf {
        return tao;
    }




    visitTypeErr (te : TypeErr) : TypeErr {
        return te;
    }




    visitTypeVoid (tvo : TypeVoid) : TypeVoid {
        return tvo;
    }




    visitTypeBool (tb : TypeBool) : TypeBool {
        return tb;
    }




    visitTypeInt (tii : TypeInt) : TypeInt {
        return tii;
    }




    visitTypeFloat (tf : TypeFloat) : TypeFloat {
        return tf;
    }




    visitTypeChar (tch : TypeChar) : TypeChar {
        return tch;
    }




    visitTypeArr (tarr : TypeArr) : TypeArr {
        return tarr;
    }




    visitTypeRef (trf : TypeRef) : TypeRef {
        return trf;
    }




    // semantic ===============================================




    visitDeclr (d : Declr) : Declr {
        return d;
    }




    visitClosure (cls : Closure) : Closure {
        return cls;
    }




    visitRefSlot (rs : RefSlot) : RefSlot {
        return rs;
    }
}