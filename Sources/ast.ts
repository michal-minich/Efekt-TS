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




class AsiList extends Asi {

    public items : Asi[];

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitAsiList(this);
    }
}




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




class None extends Exp {

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitNone(this);
    }

    public static instance = new None(undefined, undefined);
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




class Obj extends Exp {

    public body : Scope;

    constructor (parent : Asi, attrs : AsiList, body : Scope) {
        super(parent, attrs);
        this.body = body;
    }

    public accept<T> (v : AstVisitor<T>) : T {
        return v.visitObj(this);
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

