/**
 * (c) 2018 cepharum GmbH, Berlin, http://cepharum.de
 *
 * The MIT License (MIT)
 *
 * Copyright (c) 2018 cepharum GmbH
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 * @author: cepharum
 */

"use strict";

const { kebapToCamel } = require( "../../utility/string" );
const { deepFreeze } = require( "../../utility/object" );

const files = [
	"./string",
	"./integer",
	"./boolean",
];



const aliases = [];
const map = {};



/**
 * Provides static map of supported types of model attributes.
 */
class ModelAttributeTypes {
	/**
	 * Retrieves deeply frozen static map of supported types' keys into either
	 * type's implementation.
	 *
	 * @returns {object<string,ModelType>}
	 */
	static get map() {
		return deepFreeze( map );
	}

	/**
	 * Selects a type's implementation selected by its name.
	 *
	 * @param {string} name
	 * @returns {?ModelType}
	 */
	static selectByName( name ) {
		const key = this.mapNameToKey( name );
		if ( map.hasOwnProperty( key ) ) {
			return map[key];
		}

		return null;
	}

	/**
	 * Maps a type's name in quite arbitrary form to its related key used in
	 * collection's map for addressing either type's implementation.
	 *
	 * @param {string} name
	 * @returns {string}
	 */
	static mapNameToKey( name ) {
		if ( typeof name !== "string" ) {
			throw new TypeError( "invalid name of attribute type" );
		}

		return kebapToCamel( name.trim().toLocaleLowerCase() ).toLocaleUpperCase();
	}
}



files.forEach( name => {
	const type = require( name );
	const key = ModelAttributeTypes.mapNameToKey( type.typeName );

	map[key] = type;

	aliases.push( {
		key,
		type,
		aliases: type.aliases || [],
	} );
} );

aliases.forEach( ( { type, aliases } ) => {
	aliases.forEach( alias => {
		const aliasKey = ModelAttributeTypes.mapNameToKey( alias );

		if ( !map[aliasKey] ) {
			map[aliasKey] = type;
		}
	} );
} );



module.exports = ModelAttributeTypes;