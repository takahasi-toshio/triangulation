onload = function() {
    triangulation();
}

function triangulation()
{
    var polygon = new Polygon;
    polygon.addVertex( new Vertex( 447, 165 ) );
    polygon.addVertex( new Vertex( 348, 208 ) );
    polygon.addVertex( new Vertex( 309, 25 ) );
    polygon.addVertex( new Vertex( 254, 59 ) );
    polygon.addVertex( new Vertex( 194, 25 ) );
    polygon.addVertex( new Vertex( 133, 79 ) );
    polygon.addVertex( new Vertex( 171, 125 ) );
    polygon.addVertex( new Vertex( 140, 230 ) );
    polygon.addVertex( new Vertex( 95, 193 ) );
    polygon.addVertex( new Vertex( 71, 308 ) );
    polygon.addVertex( new Vertex( 134, 408 ) );
    polygon.addVertex( new Vertex( 206, 369 ) );
    polygon.addVertex( new Vertex( 293, 477 ) );
    polygon.addVertex( new Vertex( 286, 280 ) );
    polygon.addVertex( new Vertex( 380, 335 ) );

    var canvas = document.getElementById( "canvas" );
    var context = canvas.getContext( "2d" );

    context.beginPath();
    for( var i = 0; i < polygon.vertexCount(); ++i )
    {
        var vertex = polygon.vertexAt( i );
        if( i == 0 )
        {
            context.moveTo( vertex.getX(), vertex.getY() );
        }
        else
        {
            context.lineTo( vertex.getX(), vertex.getY() );
        }
    }
    context.closePath();
    context.stroke();

    for( var i = 0; i < polygon.vertexCount(); ++i )
    {
        var vertex = polygon.vertexAt( i );
        var type = vertex.getVertexType();
        if( type == "start" )
        {
            context.fillStyle = "blue";
        }
        else if( type == "end" )
        {
            context.fillStyle = "red";
        }
        else if( type == "merge" )
        {
            context.fillStyle = "green";
        }
        else if( type == "split" )
        {
            context.fillStyle = "yellow";
        }
        else
        {
            context.fillStyle = "cyan";
        }
        context.beginPath();
        context.arc( vertex.getX(), vertex.getY(), 5, 0, Math.PI*2, false );
        context.fill();
    }
}

function Polygon()
{
    this.vertices = [];
    this.edges = [];
}

Polygon.prototype.addVertex = function( vertex ) {
    if( this.vertices.length > 0 )
    {
        this.vertices[this.vertices.length - 1].setNextVertex( vertex );
        vertex.setNextVertex( this.vertices[0] );
        vertex.setPreviousVertex( this.vertices[this.vertices.length - 1] );
        this.vertices[0].setPreviousVertex( vertex );
    }
    this.vertices.push( vertex );
    this.edges.push( new Edge( vertex ) );
}

Polygon.prototype.vertexAt = function( index ) {
    return this.vertices[index];
}

Polygon.prototype.vertexCount = function() {
    return this.vertices.length;
}

function Vertex( x, y )
{
    this.x = x;
    this.y = y;
    this.nextVertex = null;
    this.previousVertex = null;
}

Vertex.prototype.getX = function() {
    return this.x;
}

Vertex.prototype.getY = function() {
    return this.y;
}

Vertex.prototype.setNextVertex = function( vertex ) {
    this.nextVertex = vertex;
}

Vertex.prototype.setPreviousVertex = function( vertex ) {
    this.previousVertex = vertex;
}

Vertex.prototype.getNextVertex = function() {
    return this.nextVertex;
}

Vertex.prototype.getPreviousVertex = function() {
    return this.previousVertex;
}

Vertex.prototype.getVertexType = function() {
    var next = this.getNextVertex();
    var prev = this.getPreviousVertex();
    if( ( this.getY() < next.getY() ) && ( this.getY() < prev.getY() ) )
    {
        var segment = new Segment( prev, next );
        if( segment.getPosition( this ) == "right" )
        {
            return "start";
        }
        else
        {
            return "split";
        }
    }
    else if( ( this.getY() > next.getY() ) && ( this.getY() > prev.getY() ) )
    {
        var segment = new Segment( prev, next );
        if( segment.getPosition( this ) == "right" )
        {
            return "end";
        }
        else
        {
            return "merge";
        }
    }

    return "regular";
}

function Edge( vertex )
{
    this.vertex = vertex;
}

function Segment( start, end )
{
    this.start = start;
    this.end = end;
}

Segment.prototype.getPosition = function( vertex ) {
    var ax = this.end.getX() - this.start.getX();
    var ay = this.end.getY() - this.end.getY();
    var bx = vertex.getX() - this.start.getX();
    var by = vertex.getY() - this.start.getY();
    var outer = ax * by - ay * bx;
    if( outer > 0 )
    {
        return "right";
    }
    else if( outer < 0 )
    {
        return "left";
    }
    else
    {
        return "online";
    }
}