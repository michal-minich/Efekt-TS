/// <reference path="common.ts"/>


interface AstVisitor<T> extends TerminalAstVisitor<T>,
                                SemanticAstVisitor<T> {

    // helpers
    visitAsiList (al : AsiList) : T;
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyAsi : number;
    public parent : Asi;
    public attrs : AsiList;
    public infType : Exp;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }

    setAttrs (attrs : AsiList) : void {
        attrs.parent = this;
        this.attrs = attrs;
    }

    is (TConstructor : any) : boolean {
        return this instanceof TConstructor;
    }

    isAnyOf (...TConstructors : any[]) : boolean {
        for (var i = 0; i < TConstructors.length; ++i)
            if (this.is(TConstructors[i]))
                return true;
        return false;
    }

    as<T extends Exp>(TConstructor : any) : T {
        return this.is(TConstructor) ? <T>this : undefined;
    }
/*
    to<T extends Exp>(TConstructor : any, logger : LogWriter) : T {
        if (this.is(TConstructor))

        {
            logger.error("Expected " + getTypeName(TConstructor) + ", got " +
                         getTypeName(asi));
        }
        else
        {
            return new Err(this);
        }
    }*/
}




class Exp extends Asi {

    //noinspection JSUnusedGlobalSymbols
    public __dummyExp : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Apply extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyApplly : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class ComplexLit extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyDeclaring : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}





class Lit extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyLit : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Type extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyType : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class TypeLit extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyLit : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Internal extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyInternal : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}



class Stm extends Asi {

    //noinspection JSUnusedGlobalSymbols
    public __dummyStm : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// helpers ===============================================




class AsiList extends Asi {

    //noinspection JSUnusedGlobalSymbols
    public __dummyAsiList : number;
    public items : Asi[];

    constructor (items : Asi[]) {
        super();
        this.items = items;
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }


   add (item : Exp) : void {
        this.items.push(item);
        item.parent = this;
    }

}



class Braced extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __dummyBraced : number;
    public list : AsiList;

    constructor (list : AsiList) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyPragma : number;
    public exp : Exp;

    constructor (exp : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyLoop : number;
    public body : Scope;

    constructor (body : Scope) {
        super();
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyBreak : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyContinue : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Label extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyLabel : number;
    public name : string;

    constructor (name : string) {
        super();
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLabel(this);
    }
}




class Goto extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyGoto : number;
    public name : string;

    constructor (name : string) {
        super();
        this.name = name;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitGoto(this);
    }
}




class Import extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyImport : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyReturn : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyThrow : number;
    public ex : Exp;

    constructor (ex : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyTry : number;
    public body : Scope;
    public catches : Catch[];
    public fin : Scope;

    constructor (body : Scope, fin : Scope) {
        super();
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




class Var extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __dummyVar : number;
    public exp : Exp;

    constructor (exp : Exp) {
        super();
        this.exp = exp;
        exp.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




class Typing extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTyping : number;
    public exp : Exp; // Declr | Ident
    public type : Exp;

    constructor (ident : Exp, type : Exp) {
        super();
        this.exp = ident;
        this.type = type;
        ident.parent = this;
        type.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTyping(this);
    }
}




class Constraining extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyConstraining : number;
    public type : Exp;
    public constraint : Exp;

    constructor (type : Exp, constraint : Exp) {
        super();
        this.type = type;
        this.constraint = constraint;
        type.parent = this;
        constraint.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitConstraining(this);
    }
}




class Assign extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyAssign : number;
    public slot : Exp;
    public value : Exp;

    constructor (slot : Exp, value : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyScope : number;
    public list : AsiList;
    public currentAsiIx = -1;

    constructor (list : AsiList) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyIdent : number;
    public name : string;
    public isOp : boolean = false;
    public isKey : boolean = false;
    public declaredBy : Ident;
    public declaringEnv : Env<Ident>;
    public assignedValue : Exp;
    public isUndefined : boolean;

    constructor (name : string) {
        super();
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




class MemberAccess extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyMemberAccess : number;
    public bag : Exp;
    public member : Exp;

    constructor (bag : Exp, member : Exp) {
        super();
        this.bag = bag;
        this.member = member;
        bag.parent = this;
        member.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitMemberAccess(this);
    }
}




class FnApply extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyFnApply : number;
    public args : Braced;
    public fn : Exp;

    constructor (args : Braced, fn : Exp) {
        super();
        this.args = args;
        this.fn = fn;
        args.parent = this;
        fn.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFnApply(this);
    }
}




class BinOpApply extends Apply {

    //noinspection JSUnusedGlobalSymbols
    public __dummyBinOpApply : number;
    public op : Ident;
    public op1 : Exp;
    public op2 : Exp;

    constructor (op : Ident, op1 : Exp, op2 : Exp) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyIf : number;
    public test : Exp;
    public then : Scope;
    public otherwise : Scope;

    constructor (test : Exp, then : Scope, otherwise : Scope) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyNew : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitNew(this);
    }
}




class TypeOf extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeOf : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
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


class Builtin extends Internal {

    //noinspection JSUnusedGlobalSymbols
    public __dummyBuiltin : number;
    public fn : Fn;
    public impl : BuiltinFn;

    constructor (fn : Fn, impl : BuiltinFn) {
        super();
        this.fn = fn;
        fn.parent = this;
        this.impl = impl;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBuiltin(this);
    }
}




class Err extends Internal {

    //noinspection JSUnusedGlobalSymbols
    public __dummyErr : number;
    public item : Asi;

    constructor (item : Asi) {
        super();
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitErr(this);
    }
}




class Void extends Lit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyVoid : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVoid(this);
    }

    public static instance = new Void();
}




class Bool extends Lit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyBool : number;
    public value : boolean;

    constructor (value : boolean) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Lit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyInt : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Lit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyFloat : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Char extends Lit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyChar : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitChar(this);
    }
}




class Arr extends ComplexLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyArr : number;
    public list : AsiList;
    public itemType : Exp;

    constructor (list : AsiList, itemType : Exp = null) {
        super();
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

    //noinspection JSUnusedGlobalSymbols
    public __dummyRef : number;
    public item : Ident;
    public scope : Scope;

    constructor (item : Ident) {
        super();
        this.item = item;
        item.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitRef(this);
    }
}




// values / types ===============================================




class Fn extends ComplexLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyFn : number;
    public params : Braced;
    public body : Scope;
    public returnType : Exp;

    constructor (params : Braced, body : Scope) {
        super();
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




class Struct extends ComplexLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyStruct : number;
    public body : Scope;

    constructor (body : Scope) {
        super();
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




class Interface extends ComplexLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyInterface : number;
    public body : Scope;

    constructor (body : Scope) {
        super();
        this.body = body;
        body.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInterface(this);
    }
}




// types (built in) ===============================================




class TypeAny extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeAny : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAny(this);
    }

    public static instance = new TypeAny();
}




class TypeAnyOf extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeAnyOf : number;
    public choices : AsiList;

    constructor (choices : AsiList) {
        super();
        this.choices = choices;
        choices.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAnyOf(this);
    }
}




class TypeErr extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeErr : number;
    public elementType : Exp;

    constructor (elementType : Exp) {
        super();
        this.elementType = elementType;
        elementType.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeErr(this);
    }
}




class TypeVoid extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeVoid : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVoid(this);
    }

    public static instance = new TypeVoid();
}




class TypeBool extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeBool : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeBool(this);
    }

    public static instance = new TypeBool();
}




class TypeInt extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeInt : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInt(this);
    }

    public static instance = new TypeInt();
}




class TypeFloat extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeFloat : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFloat(this);
    }

    public static instance = new TypeFloat();
}




class TypeChar extends TypeLit {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeChar : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeChar(this);
    }

    public static instance = new TypeChar();
}




class TypeArr extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeArr : number;
    public elementType : Exp;
    public length : Exp;

    constructor (elementType : Exp, length : Exp) {
        super();
        this.elementType = elementType;
        this.length = length;
        elementType.parent = this;
        length.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeArr(this);
    }
}




class TypeRef extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeRef : number;
    public elementType : Exp;

    constructor (elementType : Exp) {
        super();
        this.elementType = elementType;
        elementType.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeRef(this);
    }
}




// semantic ===============================================




class Declr extends Internal {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeDeclr : number;
    public ident : Ident;

    constructor (ident : Ident) {
        super();
        this.ident = ident;
        ident.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitDeclr(this);
    }
}




class Closure extends Internal {

    //noinspection JSUnusedGlobalSymbols
    public __dummyTypeClosure : number;
    public env : Env<Exp>;
    public item : Exp;
    public asiIx = -1;

    constructor (env : Env<Exp>, item : Exp) {
        super();
        this.item = item;
        // parent ?
        this.env = env;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitClosure(this);
    }
}




class RefSlot extends Internal {

    //noinspection JSUnusedGlobalSymbols
    public __dummyRefSlot : number;

    constructor () {
        super();
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitRefSlot(this);
    }
}


