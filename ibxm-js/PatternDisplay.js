
function PatternDisplay( charsetImg ) {
	const fxclr = [
		/* 0 1 2 3 4 5 6 7 8 9 : ; < = > ? */
		   1,1,1,1,1,7,7,5,5,4,0,0,0,0,0,0,
		/* @ A B C D E F G H I J K L M N O */
		   0,5,6,5,6,0,6,5,5,0,0,0,4,0,0,0,
		/* P Q R S T U V W X Y Z [ \ ] ^ _ */
		   5,0,4,0,5,0,0,0,1,0,0,0,0,0,0,0,
		/* ` a b c d e f g h i j k l m n o */
		   0,6,6,6,5,1,1,1,1,5,1,7,7,0,0,4,
		/* p q r s t u v w x y z { | } ~ */
		   0,4,5,0,6,1,5,0,0,0,0,0,0,0,0
	];
	const exclr = [
		/* 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F */
		   0,1,1,1,1,1,6,5,0,4,0,0,0,0,0,0,0,5,5,4,4,4,4
	];
	const sxclr = [
		/* 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F */
		   5,4,1,1,5,0,0,0,5,0,0,0,0,0,0,0,0,5,4,4,4,4,4
	];
	const vcclr = [
		/* 0 1 2 3 4 5 6 7 8 9 : ; < = > ? @ A B C D E F */
		   5,5,5,5,5,0,5,5,5,5,0,0,0,0,0,0,0,1,1,5,5,5,1
	];
	var drawChar = function( chr, row, col, clr, ctx ) {
		ctx.drawImage( charsetImg, ( chr - 32 ) * 8, clr * 16, 8, 16, col * 8, row * 16, 8, 16 );
	};
	var drawString = function( str, row, col, clr, ctx ) {
		for( var idx = 0, len = str.length; idx < len; idx++ ) {
			drawChar( str.codePointAt( idx ), row, col + idx, clr, ctx );
		}
	};
	var drawInt = function( val, row, col, clr, len, ctx ) {
		while( len > 0 ) {
			len = len - 1;
			drawChar( 48 + val % 10, row, col + len, clr, ctx );
			val = ( val / 10 ) | 0;
		}
	};
	var muted = function( chn ) {
		return false;
	};
	this.display = function( module, pat, row, canvas ) {
		var ctx = canvas.getContext( "2d" );
		if( pat < 0 || pat >= module.numPatterns ) {
			pat = 0;
		}
		var pattern = module.patterns[ pat ];
		var numRows = pattern.numRows;
		var numChannels = module.numChannels;
		if( numChannels * 88 > canvas.width ) {
			numChannels = ( canvas.width / 88 ) | 0;
		}
		var note = new IBXMNote();
		var chars = [ 10 ];
		drawInt( pat, 0, 0, 3, 3, ctx );
		drawChar( 32, 0, 3, 0, ctx );
		for( var c = 0; c < numChannels; c++ ) {
			if( muted( c ) ) {
				drawString( " Muted  ", 0, c * 11 + 4, 3, ctx );
				drawInt( c, 0, c * 11 + 12, 3, 2, ctx );
			} else {
				drawString( "Channel ", 0, c * 11 + 4, 0, ctx );
				drawInt( c, 0, c * 11 + 12, 0, 2, ctx );
			}
			drawChar( 32, 0, c * 11 + 14, 0, ctx );
		}
		for( var y = 1; y < 16; y++ ) {
			var r = row - 8 + y;
			if( r >= 0 && r < numRows ) {
				var bcol = ( y == 8 ) ? 8 : 0;
				drawInt( r, y, 0, bcol, 3, ctx );
				drawChar( 32, y, 3, bcol, ctx );
				for( var c = 0; c < numChannels; c++ ) {
					var x = 4 + c * 11;
					pattern.getNote( r * numChannels + c, note ).toChars( chars );
					if( muted( c ) ) {
						for( var idx = 0; idx < 10; idx++ ) {
							drawChar( chars[ idx ], y, x + idx, bcol, ctx );
						}
					} else {
						var clr = chars[ 0 ] == 45 ? bcol : bcol + 2;
						for( var idx = 0; idx < 3; idx++ ) {
							drawChar( chars[ idx ], y, x + idx, clr, ctx );
						}
						for( var idx = 3; idx < 5; idx++ ) {
							clr = chars[ idx ] == 45 ? bcol : bcol + 3;
							drawChar( chars[ idx ], y, x + idx, clr, ctx );
						}
						clr = bcol;
						if( chars[ 5 ] >= 48 && chars[ 5 ] <= 70 ) {
							clr = bcol + vcclr[ chars[ 5 ] - 48 ];
						}
						drawChar( chars[ 5 ], y, x + 5, clr, ctx );
						drawChar( chars[ 6 ], y, x + 6, clr, ctx );
						if( chars[ 7 ] == 69 ) {
							clr = bcol;
							if( chars[ 8 ] >= 48 && chars[ 8 ] <= 70 ) {
								clr = clr + exclr[ chars[ 8 ] - 48 ];
							}
						} else if( chars[ 7 ] == 115 ) {
							clr = bcol;
							if( chars[ 8 ] >= 48 && chars[ 8 ] <= 70 ) {
								clr = clr + sxclr[ chars[ 8 ] - 48 ];
							}
						} else {
							clr = bcol;
							if( chars[ 7 ] >= 48 && chars[ 7 ] <= 126 ) {
								clr = clr + fxclr[ chars[ 7 ] - 48 ];
							}
						}
						for( var idx = 7; idx < 10; idx++ ) {
							drawChar( chars[ idx ], y, x + idx, clr, ctx );
						}
					}
					drawChar( 32, y, x + 10, 0, ctx );
				}
			} else {
				drawString( "    ", y, 0, 0, ctx );
				for( var c = 0; c < numChannels; c++ ) {
					drawString( "           ", y, 4 + c * 11, 0, ctx );
				}
			}
		}
	};
}

function initCharset( maskImg, callback ) {
	const pal = [
	/*   Blue       Green      Cyan       Red        Magenta    Yellow     White      Lime */
		"#0000C0", "#008000", "#008080", "#800000", "#800080", "#806600", "#808080", "#668000",
		"#0066FF", "#00FF00", "#00FFFF", "#FF0000", "#FF00FF", "#FFCC00", "#FFFFFF", "#CCFF00"
	];
	var can = maskImg.ownerDocument.createElement( "canvas" );
	can.width = 8 * 96;
	can.height = 16 * pal.length;
	var ctx = can.getContext( "2d" );
	for( var r = 0; r < pal.length; r++ ) {
		ctx.fillStyle = "black";
		ctx.fillRect( 0, r * 16, 8, 16 );
		ctx.fillStyle = pal[ r ];
		ctx.fillRect( 8, r * 16, 8 * 95, 16 );
		for( var c = 1; c < 96; c++ ) {
			var x = ( c - 1 ) & 0x1F;
			var y = ( c - 1 ) >> 5;
			ctx.drawImage( maskImg, x * 8, y * 16, 8, 16, c * 8, r * 16, 8, 16  );
		}
	}
	createImageBitmap( can, 0, 0, can.width, can.height ).then( callback );
}
