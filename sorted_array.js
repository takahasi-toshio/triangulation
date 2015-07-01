function SortedArray( comparator )
{
    this.entries = [];
    if( typeof comparator == "function" )
    {
        this.comparator = { compare: comparator };
    }
    else
    {
        this.comparator = comparator;
    }
}

SortedArray.prototype.lower_bound = function( entry ) {
    var min = 0;
    var max = this.entries.length - 1;
    while( min <= max )
    {
        var current = ( min + max ) >> 1;
        var ret = this.comparator.compare( entry, this.entries[current] );
        if( ret <= 0 )
        {
            max = current;
            if( min == max )
            {
                return current;
            }
        }
        else
        {
            min = current + 1;
        }
    }
    return -1;
}

SortedArray.prototype.insert = function( entry ) {
    var index = this.lower_bound( entry );
    if( index < 0 )
    {
        this.entries.push( entry );
        return true;
    }
    else
    {
        if( this.comparator.compare( entry, this.entries[index] ) == 0 )
        {
            return false;
        }
        else
        {
            this.entries.splice( index, 0, entry );
            return true;
        }
    }
}

SortedArray.prototype.contains = function( entry ) {
    return this.find( entry ) >= 0 ;
}

SortedArray.prototype.find = function( entry ) {
    var index = this.lower_bound( entry );
    if( index < 0 )
    {
        return -1;
    }
    else
    {
        if( this.comparator.compare( entry, this.entries[index] ) == 0 )
        {
            return index;
        }
        else
        {
            return -1;
        }
    }
}

SortedArray.prototype.remove = function( entry ) {
    var index =this.find( entry );
    if( index < 0 )
    {
        return false;
    }
    else
    {
        this.entries.splice( index, 1 );
        return true;
    }
}

SortedArray.prototype.size = function() {
    return this.entries.length;
}

SortedArray.prototype.at = function( index ) {
    return this.entries[index];
}
