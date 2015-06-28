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

    var queue = new Array;
    for( var i = 0; i < polygon.vertexCount(); ++i )
    {
        var vertex = polygon.vertexAt( i );
        queue.push( vertex );
    }
    queue.sort( function( a, b ) {
        if( a.getY() < b.getY() ) {
            return -1;
        }
        else if( a.getY() > b.getY() ) {
            return 1;
        }
        else
        {
            if( a.getX() < b.getX() ) {
                return -1;
            }
            else if( a.getX() > b.getX() ) {
                return 1;
            }
            else {
                return 0;
            }
        }
    } );

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
    vertex.setIndex( this.vertices.length );
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
    this.edge = null;
    this.index = 0;
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

Vertex.prototype.setIndex = function( index ) {
    this.index = index;
}

Vertex.prototype.getIndex = function() {
    return this.index;
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

Vertex.prototype.setEdge = function( edge ) {
    this.edge = edge;
}

Vertex.prototype.getEdge = function() {
    return this.edge;
}

function Edge( vertex )
{
    this.vertex = vertex;
    vertex.setEdge( this );
}

Edge.prototype.getVertex = function() {
    return this.vertex;
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

function EdgeTree()
{
    this.edges = [];
}

EdgeTree.prototype.getMinX = function( edge ) {
    var start = edge.getVertex();
    var end = start.getNextVertex();
    if( start.getX() < end.getX() )
    {
        return start.getX();
    }
    else
    {
        return end.getX();
    }
}

EdgeTree.prototype.compare = function( a, b ) {
    var ax = this.getMinX( a );
    var bx = this.getMinX( b );
    if( ax < bx )
    {
        return -1;
    }
    else if( ax > bx )
    {
        return 1;
    }
    else
    {
        if( a.getIndex() < b.getIndex() )
        {
            return -1;
        }
        else if( a.getIndex() > b.getIndex() )
        {
            return 1;
        }
        else
        {
            return 0;
        }
    }
}

Edge.prototype.lower_bound = function( edge ) {
    if( this.edges.length == 0 )
    {
        return -1;
    }

    var min = 0;
    var max = this.edges.length;
    var current = ( max - min ) / 2;
    var ret = this.compare( edge, this.edges[current] );
    if( ret < 0 )
    {
        var next = current + ( max - current ) / 2;
        if( next == current )
        {
            return -1;
        }
        else
        {
            min = current;
            current = next;
        }
    }
    else if( ret > 0 )
    {
        var next = current - ( current - min ) / 2;
    }
    else
    {
    }
}
