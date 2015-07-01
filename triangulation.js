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

    var edgeComparator = new Object;
    edgeComparator.y = 0;
    edgeComparator.compare = function( a, b ) {
        if( a === b )
        {
            return 0;
        }
        else
        {
            var x1 = a.getXAt( this.y );
            var x2 = b.getXAt( this.y );
            if( x1 < x2 )
            {
                return -1;
            }
            else if( x1 > x2 )
            {
                return 1;
            }
            else
            {
                return 0;
            }
        }
    }
    var edgeTree = new SortedArray( edgeComparator );
    edgeTree.getLeftEdge = function( edge ) {
        if( this.size() == 0 )
        {
            return null;
        }

        var index = this.lower_bound( edge );
        if( index < 0 )
        {
            return this.at( this.size() - 1 );
        }

        var leftEdge = this.at( index );
        if( this.comparator.compare( leftEdge, edge ) >= 0 )
        {
            if( index > 0 )
            {
                leftEdge = this.at( index - 1 );
            }
            else
            {
                leftEdge = null;
            }
        }

        return leftEdge;
    }

    for( var i = 0; i < queue.length; ++i )
    {
        var vertex = queue[i];
        var edge = vertex.getEdge();
        var type = vertex.getVertexType();
        if( type == "start" )
        {
            edgeComparator.y = vertex.getY();

            edgeTree.insert( edge );
            edge.setHelper( vertex );
        }
        else if( type == "end" )
        {
            var previousEdge = vertex.getPreviousVertex().getEdge();
            var previousHelper = previousEdge.getHelper();
            if( previousHelper.getVertexType() == "merge" )
            {
                context.beginPath();
                context.moveTo( vertex.getX(), vertex.getY() );
                context.lineTo( previousHelper.getX(), previousHelper.getY() );
                context.stroke();
            }
            edgeTree.remove( previousEdge );

            edgeComparator.y = vertex.getY();
        }
        else if( type == "merge" )
        {
            var previousEdge = vertex.getPreviousVertex().getEdge();
            var previousHelper = previousEdge.getHelper();
            if( previousHelper.getVertexType() == "merge" )
            {
                context.beginPath();
                context.moveTo( vertex.getX(), vertex.getY() );
                context.lineTo( previousHelper.getX(), previousHelper.getY() );
                context.stroke();
            }
            edgeTree.remove( previousEdge );

            edgeComparator.y = vertex.getY();

            var leftEdge = edgeTree.getLeftEdge( edge );
            var leftHelper = leftEdge.getHelper();
            if( leftHelper.getVertexType() == "merge" )
            {
                context.beginPath();
                context.moveTo( vertex.getX(), vertex.getY() );
                context.lineTo( leftHelper.getX(), leftHelper.getY() );
                context.stroke();
            }
            leftEdge.setHelper( vertex );
        }
        else if( type == "split" )
        {
            edgeComparator.y = vertex.getY();

            var leftEdge = edgeTree.getLeftEdge( edge );
            var leftHelper = leftEdge.getHelper();
            context.beginPath();
            context.moveTo( vertex.getX(), vertex.getY() );
            context.lineTo( leftHelper.getX(), leftHelper.getY() );
            context.stroke();
            leftEdge.setHelper( vertex );
            edgeTree.insert( edge );
            edge.setHelper( vertex );
        }
        else
        {
            var previousVertex = vertex.getPreviousVertex();
            if( previousVertex.getY() < vertex.getY() )
            {
                var previousEdge = previousVertex.getEdge();
                var previousHelper = previousEdge.getHelper();
                if( previousHelper.getVertexType() == "merge" )
                {
                    context.beginPath();
                    context.moveTo( vertex.getX(), vertex.getY() );
                    context.lineTo( previousHelper.getX(), previousHelper.getY() );
                    context.stroke();
                }
                edgeTree.remove( previousEdge );

                edgeComparator.y = vertex.getY();

                edgeTree.insert( edge );
                edge.setHelper( vertex );
            }
            else
            {
                edgeComparator.y = vertex.getY();

                var leftEdge = edgeTree.getLeftEdge( edge );
                var leftHelper = leftEdge.getHelper();
                if( leftHelper.getVertexType() == "merge" )
                {
                    context.beginPath();
                    context.moveTo( vertex.getX(), vertex.getY() );
                    context.lineTo( leftHelper.getX(), leftHelper.getY() );
                    context.stroke();
                }
                leftEdge.setHelper( vertex );
            }
        }
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
    this.helper = null;
}

Edge.prototype.getVertex = function() {
    return this.vertex;
}

Edge.prototype.getXAt = function( y ) {
    var v1 = this.vertex;
    var v2 = v1.getNextVertex();

    var x1 = v1.getX();
    var y1 = v1.getY();
    if( y == y1 )
    {
        return x1;
    }

    var x2 = v2.getX();
    var y2 = v2.getY();
    if( y == y2 )
    {
        return x2;
    }

    if( x1 == x2 )
    {
        return x1;
    }

    if( y1 == y2 )
    {
        return Number.POSITIVE_INFINITY;
    }

    var a = ( y2 - y1 ) / ( x2 - x1 );
    if( a == 0 )
    {
        return Number.POSITIVE_INFINITY;
    }

    return ( y - y1 ) / a + x1;
}

Edge.prototype.setHelper = function( vertex ) {
    this.helper = vertex;
}

Edge.prototype.getHelper = function() {
    return this.helper;
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
