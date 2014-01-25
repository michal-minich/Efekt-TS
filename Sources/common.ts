interface TextWriter {

    write(...values : string[]) : void;
}




class StringWriter implements TextWriter {

    private buffer : string[] = [];


    public getString () : string {
        return this.buffer.join("");
    }


    write (...values : string[]) : void {
        this.buffer.push.apply(this.buffer, values);
    }
}