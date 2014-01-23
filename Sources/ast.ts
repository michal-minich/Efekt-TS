/// <reference path="visitor.ts"/>


// base ===============================================


class Asi {

    public parent : Asi;
    public attrs : AsiList;
    public comment : string;

    constructor (parent : Asi, attrs : AsiList) {
        this.parent = parent;
        this.attrs = attrs;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Exp extends Asi {

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




class Stm extends Asi {

    public accept<T> (v : AstVisitor<T>) : T {
        throw undefined;
    }
}




// helpers ===============================================




class AsiList extends Asi {

    public items : Asi[];

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }
}




// statements ===============================================




class Var extends Stm {

    public isPublic : Boolean;
    public ident : Ident;
    public value : Exp;

    constructor (parent : Asi, attrs : AsiList, isPublic : Boolean, ident : Ident, value : Exp) {
        super(parent, attrs);
        this.isPublic = isPublic;
        this.ident = ident;
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitVar(this);
    }
}




class Loop extends Exp {

    public body : Scope;

    constructor (parent : Asi, attrs : AsiList, body : Scope) {
        super(parent, attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitLoop(this);
    }
}




class Break extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitBreak(this);
    }
}




class Continue extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitContinue(this);
    }
}




class Return extends Exp {

    public value : Exp;

    constructor (parent : Asi, attrs : AsiList, value : Exp) {
        super(parent, attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitReturn(this);
    }
}




// expressions ===============================================




class Scope extends Exp {

    public list : AsiList;

    constructor (parent : Asi, attrs : AsiList, list : AsiList) {
        super(parent, attrs);
        this.list = list;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitScope(this);
    }
}




class Ident extends Exp {

    public name : string;

    constructor (parent : Asi, attrs : AsiList, name : string) {
        super(parent, attrs);
        this.name = name;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitIdent(this);
    }
}




class Member extends Exp {

    public ident : Ident;

    constructor (parent : Asi, attrs : AsiList, ident : Ident) {
        super(parent, attrs);
        this.ident = ident;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitMember(this);
    }
}




class FnApply extends Exp {

    public args : AsiList;
    public fn : Exp;

    constructor (parent : Asi, attrs : AsiList, args : AsiList, fn : Exp) {
        super(parent, attrs);
        this.args = args;
        this.fn = fn;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitFnApply(this);
    }
}




class BinOpApply extends Exp {

    public op : Ident;
    public op1 : Exp;
    public op2 : Exp;

    constructor (parent : Asi, attrs : AsiList, op : Ident, op1 : Exp, op2 : Exp) {
        super(parent, attrs);
        this.op = op;
        this.op1 = op1;
        this.op2 = op2;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitBinOpApply(this);
    }
}




class If extends Exp {

    public test : Exp;
    public then : Scope;
    public otherwise : Scope;

    constructor (parent : Asi, attrs : AsiList, test : Exp, then : Scope, otherwise : Scope) {
        super(parent, attrs);
        this.test = test;
        this.then = then;
        this.otherwise = otherwise;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitIf(this);
    }
}




// values ===============================================




class Err extends Exp {

    public item : Asi;

    constructor (parent : Asi, attrs : AsiList, item : Asi) {
        super(parent, attrs);
        this.item = item;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitErr(this);
    }
}




class Void extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitVoid(this);
    }

    public static instance = new Void(undefined, undefined);
}




class Bool extends Exp {

    public value : boolean;

    constructor (parent : Asi, attrs : AsiList, value : boolean) {
        super(parent, attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitBool(this);
    }
}




class Int extends Exp {

    public value : string;

    constructor (parent : Asi, attrs : AsiList, value : string) {
        super(parent, attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitInt(this);
    }
}




class Float extends Exp {

    public value : string;

    constructor (parent : Asi, attrs : AsiList, value : string) {
        super(parent, attrs);
        this.value = value;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitFloat(this);
    }
}




class Arr extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitArr(this);
    }
}




class Fn extends Exp {

    public params : AsiList;
    public body : Scope;

    constructor (parent : Asi, attrs : AsiList, params : AsiList, body : Scope) {
        super(parent, attrs);
        this.params = params;
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitFn(this);
    }
}




class Struct extends Exp {

    public body : Scope;

    constructor (parent : Asi, attrs : AsiList, body : Scope) {
        super(parent, attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitStruct(this);
    }
}




class Interface extends Exp {

    public body : Scope;

    constructor (parent : Asi, attrs : AsiList, body : Scope) {
        super(parent, attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitInterface(this);
    }
}




// values ===============================================




class TypeAny extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAny(this);
    }
}




class TypeAnyOf extends Exp {

    public choices : Exp[];

    constructor (parent : Asi, attrs : AsiList, choices : Exp[]) {
        super(parent, attrs);
        this.choices = choices;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeAnyOf(this);
    }
}




// types of values ===============================================




class TypeErr extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeErr(this);
    }
}




class TypeVoid extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeVoid(this);
    }
}




class TypeBool extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeBool(this);
    }
}




class TypeInt extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInt(this);
    }
}




class TypeFloat extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFloat(this);
    }
}




class TypeArr extends Exp {

    public elementType : Exp;
    public length : Exp;

    constructor (parent : Asi, attrs : AsiList, elementType : Exp, length : Exp) {
        super(parent, attrs);
        this.elementType = elementType;
        this.length = length;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeArr(this);
    }
}




class TypeFn extends Exp {

    public signature : Exp[];

    constructor (parent : Asi, attrs : AsiList, signature : Exp[]) {
        super(parent, attrs);
        this.signature = signature;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeFn(this);
    }
}




class TypeStruct extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeStruct(this);
    }
}




class TypeInterface extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitTypeInterface(this);
    }
}