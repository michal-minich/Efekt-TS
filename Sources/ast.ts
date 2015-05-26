/// <reference path="common.ts"/>


interface AstVisitor<T> {

    // values
    visitNew (nw : New) : T;
    visitVoid (vo : Void) : T;
    visitBool (b : Bool) : T;
    visitInt (ii : Int) : T;
    visitFloat (f : Float) : T;
    visitChar (ch : Char) : T;
    visitArr (arr : Arr) : T;
    visitFn (fn : Fn) : T;

    // types
    visitStruct (st : Struct) : T;

    // internal
    visitBuiltin (bi : Builtin) : T;
    visitClosure (cls : Closure) : T;

    // expressions
    visitAssign (a : Assign) : T;
    visitIdent (i : Ident) : T;
    visitMemberAccess (ma : MemberAccess) : T;
    visitFnApply (fna : FnApply) : T;
    visitIf (i : If) : T;
    visitErr (er : Err) : T;

    // statements
    visitPragma (pg : Pragma) : T;
    visitLoop (l : Loop) : T;
    visitBreak (b : Break) : T;
    visitContinue (c : Continue) : T;
    visitLabel (lb : Label) : T;
    visitGoto (gt : Goto) : T;
    visitImport (im : Import) : T;
    visitReturn (r : Return) : T;
    visitThrow (th : Throw) : T;
    visitTry (tr : Try) : T;
    visitVar (v : Var) : T;

    // helpers
    visitAsiList (al : AsiList) : T;
}



// base ===============================================


class Asi {

    //noinspection JSUnusedGlobalSymbols
    public __nominalAsi : number;
    public parent : Asi;
    public attrs : Asi[];

    protected optionallySetAsiArrayParent (items : Asi[]) : Asi[] {
        if (items === undefined)
            return undefined;
        else if (items instanceof Array)
            return this.setAsiArrayParent(items);
        else
            throw undefined;
    }

    protected setAsiArrayParent<T extends Asi> (items : T[]) : T[] {
        for (var i = 0; i < items.length; i++)
            items[i].parent = this;
        return items;
    }

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }

    setAttrs (attrs : Asi[]) : void {
        this.attrs = this.setAsiArrayParent(attrs);
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
    public __nominalExp : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Value extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalValue : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Type extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalType : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}



class Stm extends Asi {

    //noinspection JSUnusedGlobalSymbols
    public __nominalStm : number;

    accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// values ===============================================




class New extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalNew : number;
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




class Void extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalVoid : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVoid(this);
    }

    public static instance = new Void();
}




class Bool extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalBool : number;
    public value : boolean;

    constructor (value : boolean) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalInt : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalFloat : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Char extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalChar : number;
    public value : string;

    constructor (value : string) {
        super();
        this.value = value;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitChar(this);
    }
}




class Arr extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalArr : number;
    public items : Asi[];
    public itemType : Exp;

    constructor (items : Asi[], itemType? : Exp) {
        super();
        this.items = this.setAsiArrayParent(items);
        if (itemType) {
            this.itemType = itemType;
            itemType.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitArr(this);
    }
}



class Fn extends Value {

    //noinspection JSUnusedGlobalSymbols
    public __nominalFn : number;
    public params : Var[];
    public body : Asi[];

    constructor (params : Var[], body : Asi[]) {
        super();
        this.params = this.setAsiArrayParent(params);
        this.body = this.setAsiArrayParent(body);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFn(this);
    }
}




// types  ===============================================




class Struct extends Type {

    //noinspection JSUnusedGlobalSymbols
    public __nominalStruct : number;
    public body : Var[];

    constructor (body : Var[]) {
        super();
        this.body = this.setAsiArrayParent(body);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




// expressions ===============================================




class Assign extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalAssign : number;
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




class Ident extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalIdent : number;
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




class MemberAccess extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalMemberAccess : number;
    public bag : Exp;
    public member : Ident;

    constructor (bag : Exp, member : Ident) {
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




class FnApply extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalFnApply : number;
    public args : Exp[];
    public fn : Exp;

    constructor (args : Exp[], fn : Exp) {
        super();
        this.args = this.setAsiArrayParent(args);
        this.fn = fn;
        fn.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitFnApply(this);
    }
}




class If extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalIf : number;
    public test : Exp;
    public then : Asi[];
    public otherwise : Asi[];

    constructor (test : Exp, then : Asi[], otherwise : Asi[]) {
        super();
        this.test = test;
        test.parent = this;
        this.then = this.setAsiArrayParent(then);
        this.otherwise = this.optionallySetAsiArrayParent(otherwise);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitIf(this);
    }
}




interface BuiltinFn {
    (args : Exp[]) : Exp;
}


class Builtin extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalBuiltin : number;
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




class Err extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalErr : number;
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




class Closure extends Exp {

    //noinspection JSUnusedGlobalSymbols
    public __nominalTypeClosure : number;
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




// statements ===============================================




class Pragma extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalPragma : number;
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




class Loop extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalLoop : number;
    public body : Asi[];

    constructor (body : Asi[]) {
        super();
        this.body = this.setAsiArrayParent(body);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalBreak : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalContinue : number;

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Label extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalLabel : number;
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
    public __nominalGoto : number;
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
    public __nominalImport : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitImport(this);
    }
}




class Return extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalReturn : number;
    public value : Exp;

    constructor (value : Exp) {
        super();
        this.value = value;
        value.parent = this;
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitReturn(this);
    }
}




class Throw extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalThrow : number;
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
    public __nominalTry : number;
    public body : Asi[];
    public catches : Catch[];
    public fin : Asi[];

    constructor (body : Asi[], fin : Asi[]) {
        super();
        this.body = this.setAsiArrayParent(body);
        this.fin = this.setAsiArrayParent(fin);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitTry(this);
    }
}




class Catch {
    public on : Var;
    public body : Asi[];
}




class Var extends Stm {

    //noinspection JSUnusedGlobalSymbols
    public __nominalVar : number;
    public slot : Ident;
    public value : Exp;

    constructor (slot : Ident, value : Exp) {
        super();
        this.slot = slot;
        slot.parent = this;
        if (value) {
            this.value = value;
            value.parent = this;
        }
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




// helpers ===============================================




class AsiList extends Asi {

    //noinspection JSUnusedGlobalSymbols
    public __nominalAsiList : number;
    public items : Asi[];
    public brace : string;

    constructor (items : Asi[]) {
        super();
        this.items = this.setAsiArrayParent(items);
    }

    accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }

    add (item : Asi) : void {
        this.items.push(item);
        item.parent = this;
    }
}