/// <reference path="common.ts"/>


interface AstVisitor<T> extends TerminalAstVisitor<T>,
                                SemanticAstVisitor<T> {

    // helpers
    visitAsiList (al : AsiList) : T;
    visitExpList (el : ExpList) : T;
    visitBraced (bc : Braced) : T;
    visitPragma (pg : Pragma) : T;

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



// base ===============================================


class Asi {

    public __dummyAsi : number;
    public parent : Asi;
    public attrs : ExpList;
    public infType : Exp;

    constructor (attrs : ExpList) {
        if (attrs) {
            this.attrs = attrs;
            attrs.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Exp extends Asi {

    public __dummyExp : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Stm extends Asi {

    public __dummyStm : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// helpers ===============================================




class AsiList extends Asi {

    public __dummyAsiList : number;
    public items : Asi[];

    constructor (attrs : ExpList, items : Asi[]) {
        super(attrs);
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }
}




class ExpList extends Asi {

    public __dummyExpList : number;
    public items : Exp[];

    constructor (attrs : ExpList, items : Exp[]) {
        super(attrs);
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitExpList(this);
    }

    add (item : Exp) : void {
        this.items.push(item);
        item.parent = this;
    }
}




class Braced extends Exp {

    public __dummyBraced : number;
    public list : ExpList;

    constructor (attrs : ExpList, list : ExpList) {
        super(attrs);
        if (list) {
            this.list = list;
            list.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBraced(this);
    }
}




class Pragma extends Stm {

    public __dummyPragma : number;
    public exp : Exp;

    constructor (attrs : ExpList, exp : Exp) {
        super(attrs);
        if (exp) {
            this.exp = exp;
            exp.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitPragma(this);
    }
}




// statements ===============================================




class Loop extends Stm {

    public __dummyLoop : number;
    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Stm {

    public __dummyBreak : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Stm {

    public __dummyContinue : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Label extends Stm {

    public __dummyLabel : number;
    public name : string;

    constructor (attrs : ExpList, name : string) {
        super(attrs);
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLabel(this);
    }
}




class Goto extends Stm {

    public __dummyGoto : number;
    public name : string;

    constructor (attrs : ExpList, name : string) {
        super(attrs);
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitGoto(this);
    }
}




class Import extends Stm {

    public __dummyImport : number;
    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitImport(this);
    }
}




class Return extends Stm {

    public __dummyReturn : number;
    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitReturn(this);
    }
}




class Throw extends Stm {

    public __dummyThrow : number;
    public ex : Exp;

    constructor (attrs : ExpList, ex : Exp) {
        super(attrs);
        if (ex) {
            this.ex = ex;
            ex.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitThrow(this);
    }
}




class Try extends Stm {

    public __dummyTry : number;
    public body : Scope;
    public catches : Catch[];
    public fin : Scope;

    constructor (attrs : ExpList, body : Scope, fin : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
        if (fin) {
            this.fin = fin;
            fin.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTry(this);
    }
}




class Catch {
    public on : Var;
    public body : Scope;
}




// expressions ===============================================




class Var extends Exp {

    public __dummyVar : number;
    public exp : Exp;

    constructor (attrs : ExpList, exp : Exp) {
        super(attrs);
        this.exp = exp;
        exp.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




class Typing extends Exp {

    public __dummyTyping : number;
    public exp : Exp; // Declr | Ident
    public type : Exp;

    constructor (attrs : ExpList, ident : Exp, type : Exp) {
        super(attrs);
        this.exp = ident;
        this.type = type;
        ident.parent = this;
        type.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTyping(this);
    }
}




class Constraining extends Exp {

    public __dummyConstraining : number;
    public type : Exp;
    public constraint : Exp;

    constructor (attrs : ExpList, type : Exp, constraint : Exp) {
        super(attrs);
        this.type = type;
        this.constraint = constraint;
        type.parent = this;
        constraint.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitConstraining(this);
    }
}




class Assign extends Exp {

    public __dummyAssign : number;
    public slot : Exp;
    public value : Exp;

    constructor (attrs : ExpList, slot : Exp, value : Exp) {
        super(attrs);
        this.slot = slot;
        this.value = value;
        slot.parent = this;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAssign(this);
    }
}




class Scope extends Exp {

    public __dummyScope : number;
    public list : AsiList;
    public currentAsiIx = -1;

    constructor (attrs : ExpList, list : AsiList) {
        super(attrs);
        this.list = list;
        list.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitScope(this);
    }

    get parentScope () : Scope {
        var asi = this.parent;
        while (asi) {
            if (asi instanceof Scope)
                return <Scope>asi;
            asi = asi.parent;
        }
        return undefined;
    }
}




class Ident extends Exp {

    public __dummyIdent : number;
    public name : string;
    public isOp : boolean = false;
    public isKey : boolean = false;
    public declaredBy : Ident;
    public declaringEnv : Env<Ident>;
    public assignedValue : Exp;
    public isUndefined : boolean;

    constructor (attrs : ExpList, name : string) {
        super(attrs);
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitIdent(this);
    }

    get isType () : boolean {
        return this.name[0] >= 'A' && this.name[0] <= 'Z';
    }

    get isAttr () : boolean {
        return this.name[0] === '@';
    }
}




class MemberAccess extends Exp {

    public __dummyMemberAccess : number;
    public bag : Exp;
    public member : Exp;

    constructor (attrs : ExpList, bag : Exp, member : Exp) {
        super(attrs);
        this.bag = bag;
        this.member = member;
        bag.parent = this;
        member.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitMemberAccess(this);
    }
}




class FnApply extends Exp {

    public __dummyFnApply : number;
    public args : Braced;
    public fn : Exp;

    constructor (attrs : ExpList, args : Braced, fn : Exp) {
        super(attrs);
        this.args = args;
        this.fn = fn;
        args.parent = this;
        fn.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFnApply(this);
    }
}




class BinOpApply extends Exp {

    public __dummyBinOpApply : number;
    public op : Ident;
    public op1 : Exp;
    public op2 : Exp;

    constructor (attrs : ExpList, op : Ident, op1 : Exp, op2 : Exp) {
        super(attrs);
        this.op = op;
        this.op1 = op1;
        this.op2 = op2;
        op.parent = this;
        op1.parent = this;
        op2.parent = this;
        op.isKey = op.name[0] >= 'a' && op.name[0] <= 'z';
        op.isOp = !op.isKey;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBinOpApply(this);
    }
}




class If extends Exp {

    public __dummyIf : number;
    public test : Exp;
    public then : Scope;
    public otherwise : Scope;

    constructor (attrs : ExpList, test : Exp, then : Scope, otherwise : Scope) {
        super(attrs);
        this.test = test;
        this.then = then;
        test.parent = this;
        then.parent = this;
        if (otherwise) {
            this.otherwise = otherwise;
            otherwise.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitIf(this);
    }
}




class New extends Exp {

    public __dummyNew : number;
    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitNew(this);
    }
}




class TypeOf extends Exp {

    public __dummyTypeOf : number;
    public value : Exp;

    constructor (attrs : ExpList, value : Exp) {
        super(attrs);
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeOf(this);
    }
}




// values ===============================================




interface BuiltinFn {
    (args : Exp[]) : Exp;
}


class Builtin extends Exp {

    public __dummyBuiltin : number;
    public fn : Fn;
    public impl : BuiltinFn;

    constructor (fn : Fn, impl : BuiltinFn) {
        super(undefined);
        this.fn = fn;
        fn.parent = this;
        this.impl = impl;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBuiltin(this);
    }
}




class Err extends Exp {

    public __dummyErr : number;
    public item : Asi;

    constructor (attrs : ExpList, item : Asi) {
        super(attrs);
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitErr(this);
    }
}




class Void extends Exp {

    public __dummyVoid : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVoid(this);
    }

    public static instance = new Void(undefined);
}




class Bool extends Exp {

    public __dummyBool : number;
    public value : boolean;

    constructor (attrs : ExpList, value : boolean) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Exp {

    public __dummyInt : number;
    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Exp {

    public __dummyFloat : number;
    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Char extends Exp {

    public __dummyChar : number;
    public value : string;

    constructor (attrs : ExpList, value : string) {
        super(attrs);
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitChar(this);
    }
}




class Arr extends Exp {

    public __dummyArr : number;
    public list : ExpList;
    public itemType : Exp;

    constructor (attrs : ExpList, list : ExpList, itemType : Exp = null) {
        super(attrs);
        this.list = list;
        list.parent = this;
        if (itemType) {
            this.itemType = itemType;
            itemType.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitArr(this);
    }
}




class Ref extends Exp {

    public __dummyRef : number;
    public item : Ident;
    public scope : Scope;

    constructor (attrs : ExpList, item : Ident) {
        super(attrs);
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitRef(this);
    }
}




// values / types ===============================================




class Fn extends Exp {

    public __dummyFn : number;
    public params : Braced;
    public body : Scope;
    public returnType : Exp;

    constructor (attrs : ExpList, params : Braced, body : Scope) {
        super(attrs);
        this.params = params;
        params.parent = this;
        if (body) {
            this.body = body;
            body.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFn(this);
    }


    get isFnType () : boolean {
        return this.body === undefined;
    }
}




// types (user defined) ===============================================




class Struct extends Exp {

    public __dummyStruct : number;
    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




class Interface extends Exp {

    public __dummyInterface : number;
    public body : Scope;

    constructor (attrs : ExpList, body : Scope) {
        super(attrs);
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInterface(this);
    }
}




// types (built in) ===============================================




class TypeAny extends Exp {

    public __dummyTypeAny : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAny(this);
    }

    public static instance = new TypeAny(undefined);
}




class TypeAnyOf extends Exp {

    public __dummyTypeAnyOf : number;
    public choices : ExpList;

    constructor (attrs : ExpList, choices : ExpList) {
        super(attrs);
        this.choices = choices;
        choices.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAnyOf(this);
    }
}




class TypeErr extends Exp {

    public __dummyTypeErr : number;
    public elementType : Exp;

    constructor (attrs : ExpList, elementType : Exp) {
        super(attrs);
        this.elementType = elementType;
        elementType.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeErr(this);
    }
}




class TypeVoid extends Exp {

    public __dummyTypeVoid : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVoid(this);
    }

    public static instance = new TypeVoid(undefined);
}




class TypeBool extends Exp {

    public __dummyTypeBool : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeBool(this);
    }

    public static instance = new TypeBool(undefined);
}




class TypeInt extends Exp {

    public __dummyTypeInt : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInt(this);
    }

    public static instance = new TypeInt(undefined);
}




class TypeFloat extends Exp {

    public __dummyTypeFloat : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFloat(this);
    }

    public static instance = new TypeFloat(undefined);
}




class TypeChar extends Exp {

    public __dummyTypeChar : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeChar(this);
    }

    public static instance = new TypeChar(undefined);
}




class TypeArr extends Exp {

    public __dummyTypeArr : number;
    public elementType : Exp;
    public length : Exp;

    constructor (attrs : ExpList, elementType : Exp, length : Exp) {
        super(attrs);
        this.elementType = elementType;
        this.length = length;
        elementType.parent = this;
        length.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeArr(this);
    }
}




class TypeRef extends Exp {

    public __dummyTypeRef : number;
    public elementType : Exp;

    constructor (attrs : ExpList, elementType : Exp) {
        super(attrs);
        this.elementType = elementType;
        elementType.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeRef(this);
    }
}




// semantic ===============================================




class Declr extends Exp {

    public __dummyTypeDeclr : number;
    public ident : Ident;

    constructor (attrs : ExpList, ident : Ident) {
        super(attrs);
        this.ident = ident;
        ident.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitDeclr(this);
    }
}




class Closure extends Exp {

    public __dummyTypeClosure : number;
    public env : Env<Exp>;
    public item : Exp;
    public asiIx = -1;

    constructor (attrs : ExpList, env : Env<Exp>, item : Exp) {
        super(attrs);
        this.item = item;
        // parent ?
        this.env = env;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitClosure(this);
    }
}




class RefSlot extends Exp {

    public __dummyRefSlot : number;

    constructor (attrs : ExpList) {
        super(attrs);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitRefSlot(this);
    }
}


