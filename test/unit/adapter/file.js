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

const Path = require( "path" );
const { Readable } = require( "stream" );

const { describe, it, before, after, beforeEach, afterEach } = require( "mocha" );
const Should = require( "should" );
const { MkDir, RmDir } = require( "file-essentials" );

const { fakeApi } = require( "../helper" );

const dataSource = Path.resolve( __dirname, "../../../data" );

describe( "OdemAdapterFile", function() {
	let OdemAdapterFile, OdemAdapter, OdemUtilityUuid;

	before( () => MkDir( dataSource ).then( () => fakeApi() ).then( ( { runtime: { services: s } } ) => {
		( { OdemAdapter, OdemAdapterFile, OdemUtilityUuid } = s );
	} ) );

	afterEach( () => RmDir( dataSource, { subsOnly: true } ) );

	after( () => {
		return require( "file-essentials" ).Find( dataSource, {
			depthFirst: true,
			qualified: true,
			minDepth: 0,
			waitForConverter: true,
			converter: ( localName, absoluteName, stats ) => new Promise( rmResolve => {
				if ( stats.isDirectory() ) {
					console.log( "D " + localName );
				} else {
					console.log( "F " + localName );
				}

				rmResolve();
			} ),
		} );
	} );
	after( () => RmDir( dataSource ) );


	it( "is exposed as service component", function() {
		Should( OdemAdapterFile ).be.ok();
	} );

	it( "can be used to create instance", function() {
		( () => new OdemAdapterFile() ).should.not.throw();
	} );

	it( "is derived from basic Adapter", function() {
		new OdemAdapterFile().should.be.instanceOf( OdemAdapter );
	} );

	it( "is using ./data for storing data files by default", function() {
		return new OdemAdapterFile().dataSource.should.be.Promise().which.is.resolvedWith( Path.resolve( "data" ) );
	} );

	it( "exposes instance methods of Adapter API", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		instance.should.have.property( "create" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "has" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "read" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "write" ).which.is.a.Function().of.length( 2 );
		instance.should.have.property( "remove" ).which.is.a.Function().of.length( 1 );
		instance.should.have.property( "begin" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "rollBack" ).which.is.a.Function().of.length( 0 );
		instance.should.have.property( "commit" ).which.is.a.Function().of.length( 0 );
	} );

	it( "exposes class/static methods of Adapter API", function() {
		OdemAdapterFile.should.have.property( "keyToPath" ).which.is.a.Function().of.length( 1 );
		OdemAdapterFile.should.have.property( "pathToKey" ).which.is.a.Function().of.length( 1 );
	} );

	it( "returns promise on invoking create() which is resolved with key of created record", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		const myData = { someProperty: "its value" };

		return instance.create( "model/%u", myData ).should.be.Promise().which.is.resolved()
			.then( key => {
				const segments = key.split( "/" );

				segments.should.be.Array().which.has.length( 2 );
				segments[0].should.be.String().which.is.equal( "model" );
				segments[1].should.be.String().and.match( OdemUtilityUuid.ptnUuid );

				return instance.read( key ).should.be.Promise().which.is.resolvedWith( myData );
			} );
	} );

	it( "returns promise on invoking read() which is rejected on missing record and resolved with data on existing record", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		const myData = { someProperty: "its value" };

		return instance.read( "model/some-id" ).should.be.Promise().which.is.rejected()
			.then( () => instance.write( "model/some-id", myData ) )
			.then( () => instance.read( "model/some-id" ).should.be.Promise().which.is.resolvedWith( myData ) );
	} );

	it( "promises provided fallback value on trying to read() missing record", function() {
		const instance = new OdemAdapterFile();

		const myFallbackData = { someProperty: "its value" };

		return instance.read( "model/some-id" ).should.be.Promise().which.is.rejected()
			.then( () => instance.read( "model/some-id", { ifMissing: myFallbackData } ).should.be.Promise().which.is.resolvedWith( myFallbackData ) );
	} );

	it( "returns promise on invoking write() which is resolved with written data", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		const myData = { someProperty: "its value" };

		return instance.write( "model/some-id", myData ).should.be.Promise().which.is.resolved()
			.then( result => {
				result.should.equal( myData );
			} );
	} );

	it( "returns promise on invoking has() which is resolved with information on having selected record or not", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		return instance.has( "model/some-id" ).should.be.Promise().which.is.resolvedWith( false )
			.then( () => instance.write( "model/some-id", {} ) )
			.then( () => instance.has( "model/some-id" ).should.be.Promise().which.is.resolvedWith( true ) );
	} );

	it( "returns promise on invoking remove() which is resolved with key of record no matter if record exists or not", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		return instance.remove( "model/some-id" ).should.be.Promise().which.is.resolvedWith( "model/some-id" )
			.then( () => instance.write( "model/some-id", { someProperty: "its value" } ) )
			.then( () => instance.remove( "model/some-id" ).should.be.Promise().which.is.resolvedWith( "model/some-id" ) );
	} );

	it( "returns promise on invoking begin() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		return instance.begin().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking rollBack() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		return instance.rollBack().should.be.Promise().which.is.rejected();
	} );

	it( "returns promise on invoking commit() which is rejected due to lack of support for transactions", function() {
		const instance = new OdemAdapterFile( { dataSource } );

		return instance.commit().should.be.Promise().which.is.rejected();
	} );

	describe( "provides `keyStream()` which", function() {
		let adapter;

		beforeEach( function() {
			adapter = new OdemAdapterFile( { dataSource: "../data" } );

			return adapter.purge().then( () => adapter.dataSource )
				.then( () => adapter.write( "some/key/without/uuid-1", { id: "first" } ) )
				.then( () => adapter.write( "some/key/without/uuid-2", { id: "second" } ) )
				.then( () => adapter.write( "some/other/key/without/uuid-3", { id: "third" } ) )
				.then( () => adapter.write( "some/key/with/uuid/12345678-1234-1234-1234-1234567890ab", { id: "fourth" } ) )
				.then( () => adapter.write( "some/key/with/uuid/00000000-0000-0000-0000-000000000000", { id: "fifth" } ) );
		} );

		it( "is a function", function() {
			adapter.should.have.property( "keyStream" ).which.is.a.Function();
		} );

		it( "returns a readable stream", function() {
			return new Promise( resolve => {
				const stream = adapter.keyStream();

				stream.should.be.instanceOf( Readable );
				stream.on( "end", resolve );
				stream.resume();
			} );
		} );

		it( "generates keys of all records in selected datasource by default", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream();

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 5 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/with/uuid/00000000-0000-0000-0000-000000000000",
						"some/key/with/uuid/12345678-1234-1234-1234-1234567890ab",
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
						"some/other/key/without/uuid-3",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource matching some selected prefix", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/without",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates no key if prefix doesn't select any folder or single record in backend", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/missing/key",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.is.empty();
					resolve();
				} );
			} );
		} );

		it( "generates no key if prefix partially matching key of some folder in backend, only", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/wit",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.is.empty();
					resolve();
				} );
			} );
		} );

		it( "generates some matching record's key used as prefix, only", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key/without/uuid-1",
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 1 );
					streamed.should.eql( ["some/key/without/uuid-1"] );
					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource up to some requested maximum depth", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					maxDepth: 4,
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "generates keys of all records in selected datasource with requested maximum depth considered relative to given prefix", function() {
			return new Promise( resolve => {
				const streamed = [];
				const stream = adapter.keyStream( {
					prefix: "some/key",
					maxDepth: 2,
				} );

				stream.should.be.instanceOf( Readable );
				stream.on( "data", data => streamed.push( data ) );
				stream.on( "end", () => {
					streamed.should.be.Array().which.has.length( 2 );

					streamed.sort();

					streamed.should.eql( [
						"some/key/without/uuid-1",
						"some/key/without/uuid-2",
					] );

					resolve();
				} );
			} );
		} );

		it( "obeys key depth instead of backend path depth which is higher due to splitting contained UUIDs into several segments", function() {
			return adapter.write( "some/12345678-1234-1234-1234-1234567890ab", {} )
				.then( () => adapter.write( "some/00000000-0000-0000-0000-000000000000", {} ) )
				.then( () => adapter.write( "some/non-UUID", {} ) )
				.then( () => adapter.write( "some/deeper/00000000-0000-0000-0000-000000000000", {} ) )
				.then( () => new Promise( resolve => {
					const streamed = [];
					const stream = adapter.keyStream( {
						prefix: "some",
						maxDepth: 1,
					} );

					stream.should.be.instanceOf( Readable );
					stream.on( "data", data => streamed.push( data ) );
					stream.on( "end", () => {
						streamed.should.be.Array().which.has.length( 3 );

						streamed.sort();

						streamed.should.eql( [
							"some/00000000-0000-0000-0000-000000000000",
							"some/12345678-1234-1234-1234-1234567890ab",
							"some/non-UUID",
						] );

						resolve();
					} );
				} ) );
		} );
	} );

	it( "maps empty key empty path name", function() {
		OdemAdapterFile.keyToPath( "" ).should.be.String().which.is.empty();
	} );

	describe( "considers keys segmented by forward slash and thus", function() {
		it( "prefixes non-UUID segments with letter 's'", function() {
			OdemAdapterFile.keyToPath( "a" ).should.be.String().which.is.equal( "sa" );
			OdemAdapterFile.keyToPath( "firstSegment" ).should.be.String().which.is.equal( "sfirstSegment" );

			OdemAdapterFile.keyToPath( "a/b/c/d/e" ).replace( /\\/g, "/" ).should.be.String().which.is.equal( "sa/sb/sc/sd/se" );
			OdemAdapterFile.keyToPath( "first/Second" ).replace( /\\/g, "/" ).should.be.String().which.is.equal( "sfirst/sSecond" );
		} );

		it( "detects UUID segments to be split into three resulting segments each prefixed with letter 'p'", function() {
			OdemAdapterFile.keyToPath( "12345678-1234-1234-1234-1234567890ab" ).replace( /\\/g, "/" ).should.be.String().which.is.equal( "p1/p23/p45678-1234-1234-1234-1234567890ab" );
		} );

		it( "properly marks UUID- and non-UUID-segments in a single path", function() {
			OdemAdapterFile.keyToPath( "model/item/12345678-1234-1234-1234-1234567890ab/data" ).replace( /\\/g, "/" ).should.be.String().which.is.equal( "smodel/sitem/p1/p23/p45678-1234-1234-1234-1234567890ab/sdata" );
		} );
	} );

	it( "maps empty path name to empty key", function() {
		OdemAdapterFile.pathToKey( "" ).should.be.String().which.is.empty();
	} );

	describe( "considers all segments of path name to be marked by prefix 'p' or 's' and thus", function() {
		it( "rejects segments w/o such prefix", function() {
			( () => OdemAdapterFile.pathToKey( "a" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "first" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "a/b/c/d/e" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "a\\b\\c\\d\\e" ) ).should.throw();
		} );

		it( "accepts segments prefixed w/ wrong case of marking letters", function() {
			( () => OdemAdapterFile.pathToKey( "Sa" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "sa" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "Sfirst" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "sfirst" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "Sa/Sb/Sc/Sd/Se" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "sa/sb/sc/sd/se" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "Sa\\Sb\\Sc\\Sd\\Se" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "sa\\sb\\sc\\sd\\se" ) ).should.not.throw();
		} );

		it( "always requires three successive segments marked with 'p'", function() {
			( () => OdemAdapterFile.pathToKey( "Pa" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pa" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "Pfirst" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pfirst" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "Pa/Pb" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pa/pb" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "Pa\\Pb" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pa\\pb" ) ).should.throw();

			( () => OdemAdapterFile.pathToKey( "Pa/Pb/Pc" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "pa/pb/pc" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "Pa\\Pb\\Pc" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "pa\\pb\\pc" ) ).should.not.throw();

			( () => OdemAdapterFile.pathToKey( "Pa/Pb/Pc/Pd" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pa/pb/pc/pd" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "Pa\\Pb\\Pc\\Pd" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "pa\\pb\\pc\\pd" ) ).should.throw();

			( () => OdemAdapterFile.pathToKey( "Pa/Pb/Pc/Pd/Pe/Pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "pa/pb/pc/pd/pe/pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "Pa\\Pb\\Pc\\Pd\\Pe\\Pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "pa\\pb\\pc\\pd\\pe\\pf" ) ).should.not.throw();

			( () => OdemAdapterFile.pathToKey( "S0/Pa/Pb/Pc/Pd/Pe/Pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0/pa/pb/pc/pd/pe/pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "S0\\Pa\\Pb\\Pc\\Pd\\Pe\\Pf" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0\\pa\\pb\\pc\\pd\\pe\\pf" ) ).should.not.throw();

			( () => OdemAdapterFile.pathToKey( "S0/Pa/Pb/Pc/Pd/Pe/Pf/S2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0/pa/pb/pc/pd/pe/pf/s2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "S0\\Pa\\Pb\\Pc\\Pd\\Pe\\Pf\\S2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0\\pa\\pb\\pc\\pd\\pe\\pf\\s2" ) ).should.not.throw();

			( () => OdemAdapterFile.pathToKey( "S0/Pa/Pb/Pc/S1/Pd/Pe/Pf/S2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0/pa/pb/pc/s1/pd/pe/pf/s2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "S0\\Pa\\Pb\\Pc\\S1\\Pd\\Pe\\Pf\\S2" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "s0\\pa\\pb\\pc\\s1\\pd\\pe\\pf\\s2" ) ).should.not.throw();

			( () => OdemAdapterFile.pathToKey( "S0/Pa/Pb/Pc/Pd/S1/Pe/Pf/S2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "s0/pa/pb/pc/pd/s1/pe/pf/s2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "S0\\Pa\\Pb\\Pc\\Pd\\S1\\Pe\\Pf\\S2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "s0\\pa\\pb\\pc\\pd\\s1\\pe\\pf\\s2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "S0/Pa/Pb/S1/Pc/Pd/Pe/Pf/S2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "s0/pa/pb/s1/pc/pd/pe/pf/s2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "S0\\Pa\\Pb\\S1\\Pc\\Pd\\Pe\\Pf\\S2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "s0\\pa\\pb\\s1\\pc\\pd\\pe\\pf\\s2" ) ).should.throw();
		} );

		it( "removes prefix 's' from segments on conversion", function() {
			OdemAdapterFile.pathToKey( "sa" ).should.be.String().which.is.equal( "a" );
			OdemAdapterFile.pathToKey( "sfirstSegment" ).should.be.String().which.is.equal( "firstSegment" );
			OdemAdapterFile.pathToKey( "Sa" ).should.be.String().which.is.equal( "a" );
			OdemAdapterFile.pathToKey( "SfirstSegment" ).should.be.String().which.is.equal( "firstSegment" );

			OdemAdapterFile.pathToKey( "sa/sb/sc/sd/se" ).should.be.String().which.is.equal( "a/b/c/d/e" );
			OdemAdapterFile.pathToKey( "sfirst/sSecond" ).should.be.String().which.is.equal( "first/Second" );
			OdemAdapterFile.pathToKey( "Sa/Sb/Sc/Sd/Se" ).should.be.String().which.is.equal( "a/b/c/d/e" );
			OdemAdapterFile.pathToKey( "Sfirst/SSecond" ).should.be.String().which.is.equal( "first/Second" );
		} );

		it( "maps any OS-specific path name separator to forwards slash", function() {
			OdemAdapterFile.pathToKey( "sa\\sb\\sc\\sd\\se" ).should.be.String().which.is.equal( "a/b/c/d/e" );
			OdemAdapterFile.pathToKey( "sfirst\\sSecond" ).should.be.String().which.is.equal( "first/Second" );
			OdemAdapterFile.pathToKey( "Sa\\Sb\\Sc\\Sd\\Se" ).should.be.String().which.is.equal( "a/b/c/d/e" );
			OdemAdapterFile.pathToKey( "Sfirst\\SSecond" ).should.be.String().which.is.equal( "first/Second" );
		} );

		it( "joins split segments marked with prefix 'p' back into one", function() {
			OdemAdapterFile.pathToKey( "p1/p23/p45678-1234-1234-1234-1234567890ab" ).should.be.String().which.is.equal( "12345678-1234-1234-1234-1234567890ab" );
			OdemAdapterFile.pathToKey( "P1/P23/P45678-1234-1234-1234-1234567890ab" ).should.be.String().which.is.equal( "12345678-1234-1234-1234-1234567890ab" );
			OdemAdapterFile.pathToKey( "p1\\p23\\p45678-1234-1234-1234-1234567890ab" ).should.be.String().which.is.equal( "12345678-1234-1234-1234-1234567890ab" );
			OdemAdapterFile.pathToKey( "P1\\P23\\P45678-1234-1234-1234-1234567890ab" ).should.be.String().which.is.equal( "12345678-1234-1234-1234-1234567890ab" );
		} );

		it( "does not check if joining split segments marked with prefix 'p' back into one results in valid UUID", function() {
			OdemAdapterFile.pathToKey( "p1/p2/p4" ).should.be.String().which.is.equal( "124" );
			OdemAdapterFile.pathToKey( "P1/P2/P4" ).should.be.String().which.is.equal( "124" );
			OdemAdapterFile.pathToKey( "p1\\p2\\p4" ).should.be.String().which.is.equal( "124" );
			OdemAdapterFile.pathToKey( "P1\\P2\\P4" ).should.be.String().which.is.equal( "124" );
		} );

		it( "rejects to join split segments on missing some required segments", function() {
			( () => OdemAdapterFile.pathToKey( "p1" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "P1" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "p1" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "P1" ) ).should.throw();

			( () => OdemAdapterFile.pathToKey( "p1/p2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "P1/P2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "p1\\p2" ) ).should.throw();
			( () => OdemAdapterFile.pathToKey( "P1\\P2" ) ).should.throw();

			( () => OdemAdapterFile.pathToKey( "p1/p2/p4" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "P1/P2/P4" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "p1\\p2\\p4" ) ).should.not.throw();
			( () => OdemAdapterFile.pathToKey( "P1\\P2\\P4" ) ).should.not.throw();
		} );

		it( "properly handles path names mixing segments marked with 's' and 'p'", function() {
			OdemAdapterFile.pathToKey( "smodel/sItem/p1/P23/p45678-1234-1234-1234-1234567890ab/Sdata" )
				.should.be.String().which.is.equal( "model/Item/12345678-1234-1234-1234-1234567890ab/data" );
			OdemAdapterFile.pathToKey( "smodel\\sItem\\p1\\P23\\p45678-1234-1234-1234-1234567890ab\\Sdata" )
				.should.be.String().which.is.equal( "model/Item/12345678-1234-1234-1234-1234567890ab/data" );
		} );
	} );

	it( "properly recovers provided keys after mapping to path and back on a Linux-like OS", function() {
		[
			"01234567-89ab-cdef-fedc-ba9876543210",
			"item/00000000-1111-2222-4444-888888888888",
			"item/00000000-0000-0000-0000-000000000000",
			"00000000-1111-2222-4444-888888888888/propA",
			"/models/user/00000000-1111-2222-4444-888888888888",
			"/models/user/00000000-1111-2222-4444-888888888888/propA",
		].forEach( key => {
			OdemAdapterFile.pathToKey( OdemAdapterFile.keyToPath( key ).replace( "\\", "/" ) ).should.be.equal( key );
		} );
	} );

	it( "properly recovers provided keys after mapping to path and back on a Win32-like OS", function() {
		[
			"01234567-89ab-cdef-fedc-ba9876543210",
			"item/00000000-1111-2222-4444-888888888888",
			"item/00000000-0000-0000-0000-000000000000",
			"00000000-1111-2222-4444-888888888888/propA",
			"/models/user/00000000-1111-2222-4444-888888888888",
			"/models/user/00000000-1111-2222-4444-888888888888/propA",
		].forEach( key => {
			OdemAdapterFile.pathToKey( OdemAdapterFile.keyToPath( key ).replace( "/", "\\" ) ).should.be.equal( key );
		} );
	} );

	it( "succeeds to write many records with very similar model-like path simultaneously", function() {
		const adapter = new OdemAdapterFile( { dataSource } );
		const record = { someProperty: "its value" };

		const promises = new Array( 200 )
			.fill( 0 )
			.map( ( _, i ) => adapter.write( `models/some-model/items/00000000-0000-0000-0000-00000000${( "000" + i ).slice( -4 )}`, record ) );

		return Promise.all( promises );
	} );

	it( "succeeds to write many records with same model-like path simultaneously", function() {
		this.timeout( 20000 );

		const NumItems = 50000;
		const adapter = new OdemAdapterFile( { dataSource } );

		const text = `lorem ipsum dolor sit amet consectetur`;
		const record = { someProperty: new Array( NumItems ).fill( text ) };

		const promises = new Array( 200 )
			.fill( 0 )
			.map( () => adapter.write( `models/some-model/items/00000000-0000-0000-0000-000000000000`, record ) );

		return Promise.all( promises )
			.then( () => adapter.read( `models/some-model/items/00000000-0000-0000-0000-000000000000` ) )
			.then( loaded => {
				loaded.should.be.Object().which.has.size( 1 ).and.has.property( "someProperty" ).which.is.an.Array().which.has.length( NumItems );
				loaded.someProperty.every( item => item === text ).should.be.true();
			} );
	} );
} );
