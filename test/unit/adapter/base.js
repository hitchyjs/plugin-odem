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


const { join } = require( "path" );

const { describe, it, before } = require( "mocha" );
const Should = require( "should" );

const { loadAllServices } = require( "../helper" );

describe( "Abstract Adapter", function() {
	let OdemAdapter;

	before( () => loadAllServices().then( s => { ( { OdemAdapter } = s ); } ) );

	it( "is exposed in property `Adapter`", function() {
		Should( OdemAdapter ).be.ok();
	} );

	it( "can be used to create instance", function() {
		( () => new OdemAdapter() ).should.not.throw();
	} );

	it( "exposes instance methods of Adapter API", function() {
		const instance = new OdemAdapter();

		instance.should.have.property( "create" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "has" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "read" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "write" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "keyStream" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "begin" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "rollBack" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "commit" ).which.is.a.Function().of.length( 0 );
	} );

	it( "exposes class/static methods of Adapter API", function() {
		OdemAdapter.should.have.property( "keyToPath" ).which.is.a.Function().of.length( 1 );
		OdemAdapter.should.have.property( "pathToKey" ).which.is.a.Function().of.length( 1 );
	} );

	it( "returns promise on invoking create() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.create( "model/%u", {} ).should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking has() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.has( "model/some-id" ).should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking read() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.read( "model/some-id" ).should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking write() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.write( "model/some-id", {} ).should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking remove() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.remove( "model/some-id" ).should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking begin() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.begin().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking rollBack() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.rollBack().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking commit() which is rejected for being abstract base class", function() {
		const instance = new OdemAdapter();

		return instance.commit().should.be.Promise().which.is.rejected();
	} );

	it( "returns keys w/o UUID as given on request for mapping it into some path name", function() {
		[
			"",
			"a",
			"some/test",
		].forEach( key => OdemAdapter.keyToPath( key ).replace( /\\/g, "/" ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns keys w/ UUID as given on request for mapping it into some path name", function() {
		[
			"01234567-89ab-cdef-fedc-ba9876543210",
			"item/00000000-1111-2222-4444-888888888888",
		].forEach( key => OdemAdapter.keyToPath( key ).replace( /\\/g, "/" ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns path names not related to some UUID as given on request for mapping it into some key", function() {
		[
			"",
			"a",
			join( "some", "test" ),
		].forEach( key => OdemAdapter.pathToKey( key ).should.be.String().which.is.equal( key ) );
	} );

	it( "returns path names related to some UUID as given on request for mapping it into some key", function() {
		[
			join( "0", "12", "34567-89ab-cdef-fedc-ba9876543210" ),
			join( "item", "0", "00", "00000-1111-2222-4444-888888888888" ),
		].forEach( key => OdemAdapter.pathToKey( key ).should.be.String().which.is.equal( key ) );
	} );
} );
