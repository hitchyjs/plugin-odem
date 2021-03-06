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

const { Transform } = require( "stream" );

const PromiseUtils = require( "promise-essentials" );
const Monitor = require( "object-monitor" );

/**
 * @typedef {object} ModelProperties
 * @property {{changed: Set<string>}} $context
 */

/**
 * @typedef {object} ModelSchema
 */

const PtnModelItemsKey = /^models\/([^/]+)\/items\/([^/]+)(?:\/(\S+))?$/;


module.exports = function() {
	const api = this;
	const { services: Services } = api.runtime;
	const logDebug = api.log( "hitchy:odem:debug" );
	const logError = api.log( "hitchy:odem:error" );

	/**
	 * Implements basic behaviour of a model.
	 *
	 * @alias Model
	 * @alias this.runtime.services.Model
	 */
	class Model {
		/**
		 * @param {?(string|Buffer)} itemUUID UUID of model item to be managed by instance, omit for starting new item
		 * @param {boolean|string} onUnsaved set true to omit model logging to stderr on replacing changed property w/o saving first
		 */
		constructor( itemUUID = null, { onUnsaved = null } = {} ) {
			const args = this.beforeCreate( { uuid: itemUUID, options: { onUnsaved } } ) || {};

			const { onUnsaved: __onUnsaved } = args.options || {};
			const _onUnsaved = __onUnsaved == null ? this.constructor.onUnsaved : __onUnsaved;

			let _uuid = null;

			Object.defineProperties( this, {
				/**
				 * Uniquely identifies current instance of model.
				 *
				 * @note UUID can be written only once unless it has been given
				 *       initially for loading some matching instance from storage.
				 *
				 * @note For compatibility reasons this property is always provided
				 *       as string when reading though internal processing of UUIDs
				 *       relies on binary format now to reduce memory consumption.
				 *       The binary format used internally can be read using
				 *       @see Model#$uuid.
				 *
				 * @name Model#uuid
				 * @property {?(string|Buffer)}
				 */
				uuid: {
					get: () => {
						if ( _uuid == null ) {
							return null;
						}

						Object.defineProperties( this, {
							uuid: { value: Services.OdemUtilityUuid.format( _uuid ), }
						} );

						return this.uuid;
					},
					set: newUUID => {
						if ( newUUID != null ) {
							if ( _uuid != null ) {
								throw new Error( "re-assigning Services.OdemUtilityUuid rejected" );
							}

							_uuid = Services.OdemUtilityUuid.normalize( newUUID );
						}
					},
					configurable: true,
				},

				/**
				 * Uniquely identifies current instance of model.
				 *
				 * @note UUID can be set via @see Model#uuid, only.
				 *
				 * @name Model#$uuid
				 * @property {?Buffer}
				 * @readonly
				 */
				$uuid: {
					get: () => _uuid,
				},
			} );

			this.uuid = args.uuid;


			/**
			 * @type {ModelProperties}
			 */
			let data = Monitor( {}, {
				warn: _onUnsaved === "warn",
				fail: _onUnsaved === "fail",
				coercion: this.constructor._coercionHandlers,
			} );

			// create initial set of properties from either actual property
			const props = this.constructor.schema.props;
			const propNames = Object.keys( props );

			for ( let i = 0, l = propNames.length; i < l; i++ ) {
				const name = propNames[i];
				const defaultValue = props[name].default;

				if ( defaultValue !== undefined ) {
					data[name] = props[name].default;
				}
			}

			data.$context.commit();


			let isLoading = null;
			let markLoaded = false;

			Object.defineProperties( this, {
				/**
				 * Promises previously triggered request for loading properties of
				 * current item to have succeeded or failed. This promise is set
				 * as soon as request for loading properties has been triggered.
				 *
				 * @see Model#$isMarkedLoaded for different indicator suitable for
				 * detecting synchronously if properties have been loaded before.
				 *
				 * @name Model#$loaded
				 * @property {?Promise<Model>}
				 * @readonly
				 */
				$loaded: {
					get: () => isLoading,
					set: promise => {
						if ( isLoading ) {
							throw new Error( "must not promise loading multiple times" );
						}

						if ( !( promise instanceof Promise ) ) {
							throw new Error( "not a promise" );
						}

						isLoading = promise
							.then( record => {
								markLoaded = true;

								if ( _uuid != null ) {
									if ( !record || typeof record !== "object" ) {
										throw new TypeError( "invalid set of properties" );
									}

									if ( data.$context && data.$context.hasChanged ) {
										switch ( _onUnsaved ) {
											case "ignore" :
												break;

											case "warn" :
												// eslint-disable-next-line no-console
												logError( "WARNING: replacing an item's properties after changing some w/o saving" );
												break;

											case "fail" :
											default :
												throw new Error( "WARNING: replacing an item's properties after changing some w/o saving" );
										}
									}

									const constructor = this.constructor;
									const { _deserializeProperties, schema } = constructor;
									const deserialized = typeof _deserializeProperties === "function" ? _deserializeProperties( record, schema.props ) : record;

									data = Monitor( deserialized, {
										warn: _onUnsaved === "warn",
										fail: _onUnsaved === "fail",
										coercion: this.constructor._coercionHandlers,
									} );
								}

								return this;
							} );
					}
				},

				/**
				 * Synchronously indicates if current instance's properties have
				 * been loaded before or not.
				 *
				 * @name Model#$isMarkedLoaded
				 * @property {boolean}
				 * @readonly
				 */
				$isMarkedLoaded: { get: () => markLoaded },

				/**
				 * Marks if current model instance is new (thus still lacking UUID).
				 *
				 * @name Model#$isNew
				 * @property {boolean}
				 * @readonly
				 */
				$isNew: { get: () => _uuid == null },

				/**
				 * Fetches data key of current model usually to be used with some
				 * KV-based storage.
				 *
				 * @name Model#$dataKey
				 * @property {string}
				 * @readonly
				 */
				$dataKey: {
					value: this.constructor.uuidToKey( _uuid ),
					configurable: _uuid == null,
				},

				/**
				 * Provides properties of current instance of model.
				 *
				 * @name Model#$properties
				 * @property {ModelProperties}
				 * @readonly
				 */
				$properties: { get: () => data },
			} );



			if ( _uuid == null ) {
				this.$loaded = Promise.resolve();
			}

			this.$properties.$context.relax();
			this.afterCreate();
			this.$properties.$context.relax( false );
		}

		/**
		 * Represents any default value.
		 *
		 * @returns {*} some opaque value used to indicate "default value"
		 */
		get $default() {
			return Object.freeze( {} );
		}

		/**
		 * Fetches defined name of current model.
		 *
		 * @returns {string} defined name of model
		 */
		static get name() {
			return "$$OdemModel$$";
		}

		/**
		 * Exposes default mode for handling multiple value assignments to a
		 * property without saving intermittently.
		 *
		 * @returns {string} default value of model-related option onUnsaved
		 */
		static get onUnsaved() { return "fail"; }

		/**
		 * Lists  definitions of indices extracted from properties of current model.
		 *
		 * @returns {array} list of indices' definitions
		 * @readonly
		 */
		static get indices() {
			return [];
		}

		/**
		 * Normalizes provided input to be UUID as an instance of Buffer with 16
		 * octets at least.
		 *
		 * @param {Buffer|string} uuid UUID to be normalized
		 * @returns {Buffer} normalized UUID
		 */
		static normalizeUUID( uuid ) {
			return Services.OdemUtilityUuid.normalize( uuid );
		}

		/**
		 * Creates string representing provided UUID.
		 *
		 * @param {Buffer|string} uuid UUID to be represented
		 * @returns {string} string representing UUID
		 */
		static formatUUID( uuid ) {
			return Services.OdemUtilityUuid.format( uuid );
		}

		/**
		 * Generates data key related to given UUID suitable for selecting related
		 * record in data source connected via current adapter.
		 *
		 * @param {?(string|Buffer)} uuid UUID to be converted
		 * @returns {string} backend-compatible key for selecting related record there
		 */
		static uuidToKey( uuid ) {
			const _uuid = Services.OdemUtilityUuid.normalize( uuid );
			if ( _uuid ) {
				return `models/${this.name}/items/${Services.OdemUtilityUuid.format( _uuid )}`;
			}

			return `models/${this.name}/items/%u`;
		}

		/**
		 * Extracts UUID of some addressed instance from provided key.
		 *
		 * @param {string} key key used with data backend
		 * @returns {Buffer} UUID of this model's instance extracted from key, null if no UUID was found
		 */
		static keyToUuid( key ) {
			const result = PtnModelItemsKey.exec( key );
			if ( result ) {
				return Buffer.from( result[2].replace( /-/g, "" ), "hex" );
			}

			throw new Error( "invalid key to extract UUID from" );
		}

		/**
		 * Extracts name of model addressed by provided key.
		 *
		 * @param {string} key key used with data backend
		 * @returns {?string} name of model addressed by given key, null if key doesn't address any model
		 */
		static keyToModelName( key ) {
			const match = PtnModelItemsKey.exec( key );

			return match ? match[1] : null;
		}

		/**
		 * Tests if backend contains data of current item or not.
		 *
		 * @returns {Promise<boolean>} promises true if data exists and false otherwise
		 */
		get $exists() {
			if ( this.$isNew ) {
				return Promise.resolve( false );
			}

			return this.constructor.adapter.has( this.$dataKey );
		}

		/**
		 * Exposes schema of abstract base class.
		 *
		 * @note This schema is basically empty for base class doesn't handle data
		 *       itself but serves as an abstract base class to actually defined
		 *       models.
		 *
		 * @returns {{computed: {}, hooks: {}, props: {}}} empty schema definition
		 */
		static get schema() {
			return { props: {}, computed: {}, hooks: {} };
		}

		/**
		 * Observes current model's adapter for remote changes to be adopted in
		 * locally managed indices.
		 *
		 * @returns {void}
		 */
		static observeBackend() {
			if ( !this._isObservingAdapter ) {
				Object.defineProperty( this, "_isObservingAdapter", { value: true } );

				this.adapter.on( "change", ( key, data ) => {
					const match = PtnModelItemsKey.exec( key );
					if ( !match || match[1] !== this.name ) {
						return;
					}

					logDebug( "NOTIFICATION: %s has changed remotely", match[2] );

					// FIXME detect a backend's watcher triggering on local change instead of remote one

					const uuid = Buffer.from( match[2].replace( /-/g, "" ), "hex" );

					this.indexLoaded
						.then( indices => {
							const length = indices.length;
							if ( length ) {
								const { computed, props } = this.schema;
								let context = null;

								const propNames = Object.keys( props );
								const numPropNames = propNames.length;
								const record = {};

								for ( let i = 0; i < numPropNames; i++ ) {
									const propName = propNames[i];
									const prop = props[propName];

									record[propName] = prop.$type.deserialize( data[propName] );
								}

								for ( let i = 0; i < length; i++ ) {
									const { property, handler } = indices[i];
									const computedInfo = computed[property];
									let newProp;

									logDebug( "updating index of %s.%s after change of %s", this.name, property, match[2] );

									if ( computedInfo ) {
										// required: computed value in context of updated record
										if ( !context ) {
											context = new Proxy( new this( uuid ), {
												get( target, prop ) {
													if ( prop === "$properties" ) {
														return record;
													}

													if ( props[prop] ) {
														return record[prop];
													}

													return target[prop];
												},
											} );
										}

										newProp = computedInfo.code.call( context );
									} else {
										newProp = record[property];
									}

									handler.update( uuid, null, newProp, { searchExisting: true, addIfMissing: true } );
								}
							}
						} )
						.catch( error => {
							logError( "handling remote change of %s's %s failed: %s", this.name, Services.OdemUtilityUuid.format( uuid ), error.stack );
						} );
				} );

				this.adapter.on( "delete", key => {
					const match = PtnModelItemsKey.exec( key );
					if ( !match || match[1] !== this.name ) {
						return;
					}

					// FIXME detect a backend's watcher triggering on local removal instead of remote one

					logDebug( "NOTIFICATION: %s has been removed remotely", match[2] );

					const uuid = Buffer.from( match[2].replace( /-/g, "" ), "hex" );

					this.indexLoaded
						.then( indices => {
							const length = indices.length;

							for ( let i = 0; i < length; i++ ) {
								const { property, handler } = indices[i];

								logDebug( "removing %s from index of %s.%s", match[2], this.name, property );

								handler.remove( uuid );
							}
						} )
						.catch( error => {
							logError( "handling remote removal of %s's %s failed: %s", this.name, Services.OdemUtilityUuid.format( uuid ), error.stack );
						} );
				} );
			}
		}

		/**
		 * Implements default hook invoked first in every item's constructor.
		 *
		 * @note Creating item doesn't refer to creating record in an attached data
		 *       storage, but constructing new instance of `Model` at runtime.
		 *
		 * @note Returning promise isn't available here due to being invoked in
		 *       constructor of model instance.
		 *
		 * @param {?(Buffer|string)} uuid UUID of item to be represented by instance, null for starting new item
		 * @param {object<string,string>} options options provided for new instance
		 * @returns {{uuid:(Buffer|string), options:object<string,string>}} provided information, probably adjusted
		 */
		beforeCreate( { uuid = null, options = {} } = {} ) {
			return { uuid, options };
		}

		/**
		 * Implements default hook invoked after having created item.
		 *
		 * @note Creating item doesn't refer to creating record in an attached data
		 *       storage, but constructing new instance of `Model` at runtime.
		 *
		 * @note Returning promise isn't available here due to being invoked in
		 *       constructor of model instance.
		 *
		 * @returns {void}
		 */
		afterCreate() {} // eslint-disable-line no-empty-function

		/**
		 * Implements default hook invoked before loading item's record from attached
		 * data storage.
		 *
		 * @returns {undefined|Promise} optional promise settled when hook has finished
		 */
		beforeLoad() {} // eslint-disable-line no-empty-function

		/**
		 * Implements default hook invoked after having loaded item's record from
		 * attached data storage.
		 *
		 * @param {object} record raw record as read from data storage
		 * @returns {object} record to use eventually for setting properties
		 */
		afterLoad( record ) { return record; }

		/**
		 * Implements default hook invoked before validating properties of items.
		 *
		 * @returns {undefined|Error[]|Promise<Error[]>} list of errors encountered by hook
		 */
		beforeValidate() {} // eslint-disable-line no-empty-function

		/**
		 * Implements default hook invoked after having validated properties of
		 * items.
		 *
		 * @param {Error[]} errors lists error encountered while validating
		 * @returns {Error[]} probably filtered list of validation errors
		 */
		afterValidate( errors ) { return errors; }

		/**
		 * Implements default hook invoked before saving validated properties of
		 * item.
		 *
		 * @param {boolean} existsAlready true if item exists in backend already
		 * @param {object} record record of current item's serialized property values to be written in backend
		 * @returns {object} item's record to be written in backend eventually
		 */
		beforeSave( existsAlready, record ) { // eslint-disable-line no-unused-vars
			return record;
		}

		/**
		 * Implements default hook invoked after saving validated properties of
		 * item.
		 *
		 * @param {boolean} existsAlready true if item exists in backend already
		 * @returns {undefined|Promise} optional promise settled when hook finished
		 */
		afterSave( existsAlready ) {} // eslint-disable-line no-unused-vars,no-empty-function

		/**
		 * Implements default hook invoked before removing item from backend.
		 *
		 * @returns {undefined|Promise} optional promise settled when hook has finished
		 */
		beforeRemove() {} // eslint-disable-line no-empty-function

		/**
		 * Implements default hook invoked after removing item from backend.
		 *
		 * @returns {undefined|Promise} optional promise settled when hook has finished
		 */
		afterRemove() {} // eslint-disable-line no-empty-function

		/**
		 * Loads data of item from backend.
		 *
		 * @returns {Promise<Model>} promises model instance with properties loaded from storage
		 */
		load() {
			if ( !this.$loaded ) {
				this.$loaded = Promise.resolve()
					.then( () => this.beforeLoad() )
					.then( () => this.constructor.adapter.read( this.$dataKey ) )
					.then( record => this.afterLoad( record ) );
				// NOTE Properties are replaced in setter of `this.$loaded`.
			}

			return this.$loaded;
		}

		/**
		 * Writes data of item to backend.
		 *
		 * @param {boolean} ignoreUnloaded set true to permit saving record w/o loading first
		 * @returns {Promise<Model>} promises instance of model with its properties saved to persistent storage
		 */
		save( { ignoreUnloaded = false } = {} ) {
			const { constructor, $isNew: isNew } = this;
			let load;

			if ( !isNew && !this.$loaded && !ignoreUnloaded ) {
				if ( this.$properties.$context.changed.size > 0 ) {
					return Promise.reject( new Error( "saving unloaded item rejected" ) );
				}

				return Promise.resolve( this );
			}

			if ( !isNew && this.$loaded ) {
				load = this.$loaded.then( () => this.$properties.$context.changed.size > 0 );
			} else {
				load = Promise.resolve( true );
			}

			return load.then( hasChanged => {
				if ( !hasChanged ) {
					return this;
				}

				return this.validate()
					.catch( severeError => [severeError] )
					.then( validationErrors => {
						if ( validationErrors && validationErrors.length > 0 ) {
							throw Object.assign( new Error( `saving invalid properties rejected (${validationErrors.map( e => e.message ).join( ", " )})` ), {
								validationErrors,
							} );
						}

						if ( isNew ) {
							return false;
						}

						return this.$exists;
					} )
					.then( existsAlready => Promise.resolve()
						.then( () => {
							if ( typeof constructor._serializeProperties === "function" ) {
								return constructor._serializeProperties( this.$properties );
							}

							return this.$properties;
						} )
						.then( record => {
							this.$properties.$context.relax();
							return this.beforeSave( existsAlready, record );
						} )
						.then( record => {
							if ( existsAlready ) {
								return constructor.indexLoaded
									.then( indices => {
										const length = indices.length;
										if ( length ) {
											const { computed, props } = constructor.schema;
											let oldContext = null;

											for ( let i = 0; i < length; i++ ) {
												const { property, handler } = indices[i];
												const computedInfo = computed[property];
												let newProp, oldProp;

												if ( computedInfo ) {
													// required: old value of computed property for updating index
													// -> need to re-compute it when bound to old set of actual properties
													if ( !oldContext ) {
														const oldProperties = this.$properties.$context.clone().$context.rollBack();

														oldContext = new Proxy( this, {
															get( target, prop ) {
																if ( prop === "$properties" ) {
																	return oldProperties;
																}

																if ( props[prop] ) {
																	return oldProperties[prop];
																}

																return target[prop];
															},
														} );
													}

													oldProp = computedInfo.code.call( oldContext );
													newProp = this[property];
												} else {
													newProp = this.$properties[property];
													oldProp = this.$properties.$context.changed.has( property ) ?
														this.$properties.$context.changed.get( property ) :
														this.$properties[property];
												}

												if ( newProp !== oldProp ) {
													handler.update( this.$uuid, oldProp, newProp );
												}
											}
										}

										return this.constructor.adapter.write( this.$dataKey, record );
									} );
							}

							return constructor.indexLoaded.then( indices => {
								return this.constructor.adapter.create( this.$dataKey, record )
									.then( dataKey => {
										const uuid = constructor.keyToUuid( dataKey );
										if ( !uuid ) {
											throw new Error( "first-time saving instance in backend didn't yield proper UUID" );
										}

										if ( isNew ) {
											this.uuid = uuid;
										}

										Object.defineProperties( this, {
											$dataKey: { value: constructor.uuidToKey( uuid ) },
										} );

										const numIndices = indices.length;

										for ( let i = 0; i < numIndices; i++ ) {
											const { property, handler } = indices[i];
											const { computed } = constructor.schema;

											const newProp = computed[property] ? this[property] : this.$properties[property];

											handler.add( uuid, newProp );
										}
									} );
							} );
						} )
						.then( () => this.afterSave( existsAlready ) )
						.then( () => {
							// clear marks on changed properties for having
							// saved them right before
							this.$properties.$context.commit();
							this.$properties.$context.relax( false );
						} )
						.catch( error => {
							this.$properties.$context.relax( false );
							throw error;
						} )
						.then( () => this )
					);
			} );
		}

		/**
		 * Removes item from backend.
		 *
		 * @returns {Promise<Model>} promises model instance being removed from backend
		 */
		remove() {
			return Promise.resolve()
				.then( () => {
					this.$properties.$context.relax();
					return this.beforeRemove();
				} )
				.then( () => {
					this.$properties.$context.relax( false );
					return this.constructor.indexLoaded;
				} )
				.then( indices => {
					const length = indices.length;

					if ( length ) {
						return this.load().then( () => {
							for ( let i = 0; i < length; i++ ) {
								const { handler, property } = indices[i];

								if ( this.$isMarkedLoaded ) {
									handler.removeValue( this.$uuid, this[property] );
								} else {
									// don't know the properties' values -> have to
									// search the whole index for removing UUID
									handler.remove( this.$uuid );
								}
							}
						} );
					}

					return undefined;
				} )
				.then( () => this.constructor.adapter.remove( this.$dataKey ) )
				.then( () => this.afterRemove() )
				.then( () => this );
		}

		/**
		 * Validates current set of properties.
		 *
		 * @returns {Promise<Error[]>} promises list of validation errors
		 */
		validate() {
			return Promise.resolve( [] );
		}

		/**
		 * Extracts item's values per attribute and computed attribute as well as
		 * its UUID to regular object.
		 *
		 * @param {boolean} omitComputed set true to extract actual properties and UUID, only
		 * @param {boolean} serialised set true to get all properties of resulting object suitable for serialisation e.g. as stringified JSON
		 * @returns {object} object providing item's UUID and values of its properties
		 */
		toObject( { omitComputed = false, serialised = false } = {} ) {
			const { props, computed } = this.constructor.schema;
			const output = {};
			let names;

			if ( !omitComputed ) {
				names = Object.keys( computed );
				for ( let i = 0, length = names.length; i < length; i++ ) {
					const name = names[i];
					const property = this[name];

					if ( property != null ) {
						if ( serialised && computed[name].$type ) {
							output[name] = computed[name].$type.serialize( property, Services.OdemAdapter );
						} else {
							output[name] = property;
						}
					}
				}
			}

			names = Object.keys( props );
			for ( let i = 0, length = names.length; i < length; i++ ) {
				const name = names[i];
				const property = this.$properties[name];

				if ( property != null ) {
					if ( serialised ) {
						output[name] = props[name].$type.serialize( property, Services.OdemAdapter );
					} else {
						output[name] = property;
					}
				}
			}

			output.uuid = this.uuid;

			return output;
		}

		/**
		 * Imports item's values per property and computed property from provided
		 * regular object.
		 *
		 * @param {object} data regular object to import properties from
		 * @param {boolean} omitComputed set true to process actual properties and UUID, only
		 * @param {boolean} serialised set true to indicate that object contains all properties in a form suitable for serialisation e.g. as stringified JSON
		 * @returns {this} fluent interface
		 */
		fromObject( data, { omitComputed = false, serialised = false } = {} ) {
			const { props, computed } = this.constructor.schema;
			let names, targets;

			names = Object.keys( props );
			targets = this.$properties;
			for ( let i = 0, length = names.length; i < length; i++ ) {
				const name = names[i];
				const source = data[name];

				if ( source !== undefined ) {
					targets[name] = serialised ? props[name].$type.deserialize( source ) : source;
					targets.$context.commit();
				}
			}

			if ( !omitComputed ) {
				names = Object.keys( computed );
				targets = this; // eslint-disable-line consistent-this

				for ( let i = 0, length = names.length; i < length; i++ ) {
					const name = names[i];
					const source = data[name];

					if ( source !== undefined ) {
						targets[name] = serialised && computed[name].$type ? computed[name].$type.deserialize( source ) : source;
						this.$properties.$context.commit();
					}
				}
			}

			return this;
		}

		/**
		 * Creates new item instance initialized with values per property and
		 * computed property provided as regular object.
		 *
		 * Resulting item's UUID can be provided in second argument or in property
		 * `uuid` of provided object.
		 *
		 * @param {object} data regular object to import properties from
		 * @param {string|Buffer} uuid UUID of item to use in preference over some property `uuid` in provided data object
		 * @param {boolean} omitComputed set true to process actual properties and UUID, only
		 * @param {boolean} serialised set true to indicate that object contains all properties in a form suitable for serialisation e.g. as stringified JSON
		 * @returns {Model} created item with properties set
		 */
		static fromObject( data, { uuid = null, omitComputed = false, serialised = false } = {} ) {
			const item = uuid || data.uuid ? new this( uuid || data.uuid ) : new this();

			return item.fromObject( data, { omitComputed, serialised } );
		}

		/**
		 * Fetches index handler matching named property and type of index.
		 *
		 * @param {string} property name of property to be covered by index
		 * @param {string} type test operation supported by index
		 * @returns {OdemModelIndexer|undefined} found index
		 */
		static getIndex( property, type = "eq" ) {
			const indices = this.indices;
			const numIndices = indices.length;

			for ( let i = 0; i < numIndices; i++ ) {
				const index = indices[i];

				if ( index.property === property && index.type === type ) {
					return index.handler;
				}
			}

			return undefined;
		}

		/**
		 * Retrieves stream of UUIDs of current model's instances.
		 *
		 * @returns {Readable} readable stream with UUIDs of model's instances
		 */
		static uuidStream() {
			const that = this;
			const keyStream = this.adapter.keyStream( { prefix: `models/${this.name}/items` } );

			const uuidStream = new Transform( {
				objectMode: true,
				transform( key, _, done ) {
					this.push( that.keyToUuid( key ) );
					done();
				},
			} );

			uuidStream.on( "close", () => {
				keyStream.unpipe( uuidStream );
				keyStream.pause();
				keyStream.destroy();
			} );

			keyStream.pipe( uuidStream );

			return uuidStream;
		}

		/**
		 * Unconditionally lists existing items of model.
		 *
		 * @note This method is basically an alias for finding records using special
		 *       test selecting every record of model.
		 *
		 * @param {int} offset number of items to skip
		 * @param {int} limit maximum number of items to retrieve
		 * @param {string} sortBy names property of model matching records shall be sorted by
		 * @param {boolean} sortAscendingly set true to sort matches in ascending order, set false for descending order
		 * @param {boolean} loadRecords set false to omit loading properties per matching item prior to returning them
		 * @param {?{count:int}} metaCollector object receiving meta information on return
		 * @returns {Promise<Model[]>} promises fetched instances of model
		 */
		static list( { offset = 0, limit = Infinity, sortBy = null, sortAscendingly = true } = {}, { loadRecords = true, metaCollector = null } = {} ) {
			return this.find(
				{ true: {} },
				{ offset, limit, sortBy, sortAscendingly },
				{ loadRecords, metaCollector }
			);
		}

		/**
		 * Aliases Model#find().
		 *
		 * @note This method was exposed in previous versions and is kept for
		 * compatibility reasons. Is is meant to vanish in a future release.
		 *
		 * @param {string} name names attribute/property to check per record
		 * @param {*} value provides value to compare with per record
		 * @param {string} operation names operation to use for comparing per record
		 * @param {int} offset number of leading matches to skip
		 * @param {int} limit maximum number of matches to retrieve
		 * @param {?{count:int}} metaCollector object receiving meta information on return
		 * @param {boolean} loadRecords set false to get instances of matching records left to be loaded later
		 * @returns {Promise<Model[]>} resulting matches
		 * @deprecated
		 */
		static findByAttribute( name, value = null, operation = "eq",
			{ offset = 0, limit = Infinity } = {},
			{ metaCollector = null, loadRecords = true } = {} ) {
			return this.find( { [operation]: { name, value } }, { offset, limit }, { loadRecords, metaCollector } );
		}

		/**
		 * Searches collection of current model for items matching described test.
		 *
		 * @param {object} test description of test operation to identify records to fetch
		 * @param {int} offset number of leading matches to skip
		 * @param {int} limit maximum number of matches to retrieve
		 * @param {string} sortBy names property resulting matches should be sorted by
		 * @param {boolean} sortAscendingly set true to sort in ascending order, false for descending order
		 * @param {?{count:int}} metaCollector object receiving meta information on return
		 * @param {boolean} loadRecords set false to get instances of matching records left to be loaded later
		 * @returns {Promise<Model[]>} resulting matches
		 */
		static find( test,
			{ offset = 0, limit = Infinity, sortBy = null, sortAscendingly = true } = {},
			{ metaCollector = null, loadRecords = true } = {} ) {
			return this.indexLoaded
				.then( () => new Promise( ( resolve, reject ) => { // eslint-disable-line promise/catch-or-return
					let source = this.processTerm( test, sortBy, sortAscendingly );

					if ( sortBy ) {
						const sortIndex = this.getIndex( sortBy, "eq" );
						let sorted;

						if ( sortIndex ) {
							sorted = new Services.OdemModelSorterIndexed( sortIndex, sortAscendingly );
						} else {
							sorted = new Services.OdemModelSorterNonIndexed( this, sortBy, sortAscendingly );
						}

						const origSource = source;

						sorted.on( "close", () => {
							origSource.unpipe( sorted );
							origSource.pause();
							origSource.destroy();
						} );

						source.pipe( sorted );

						source = sorted;
					}

					const collected = limit > 1000 ? [] : new Array( limit );
					let count = 0;
					let written = 0;
					let _offset = offset;
					let _limit = limit;

					source.on( "data", item => {
						count++;

						if ( _offset > 0 ) {
							_offset--;
						} else if ( _limit > 0 ) {
							_limit--;

							collected[written++] = item;
						} else if ( !metaCollector ) {
							process.nextTick( () => {
								source.pause();
								source.destroy();

								// destroying source prevents emission of end event
								source.emit( "end" );
							} );
						}
					} );

					source.on( "end", () => {
						if ( metaCollector ) {
							metaCollector.count = count;
						}

						collected.splice( written );

						if ( loadRecords ) {
							// collect all unloaded items
							let unloaded;
							let write = 0;

							for ( let i = 0; i < written; i++ ) {
								const item = collected[i];

								if ( !item.$isMarkedLoaded ) {
									if ( !unloaded ) {
										const size = written - i;
										unloaded = size > 1000 ? [] : new Array( size );
									}

									unloaded[write++] = item.load();
								}
							}

							if ( unloaded ) {
								unloaded.splice( write );

								Promise.all( unloaded )
									.then( () => resolve( collected ) )
									.catch( reject );
								return;
							}
						}

						resolve( collected );
					} );

					source.on( "error", reject );
				} ) );
		}

		/**
		 * Compiles test from provided description and returns its stream of matching items.
		 *
		 * @param {object} testDescription description of test used to pick instances
		 * @param {string} sortBy name of property finally resulting list of matches will be sorted by (provided to help optimizing tester)
		 * @param {boolean} sortAscendingly true if provided property will be used eventuall to sort in ascending order (provided to help optimizing tester)
		 * @returns {Readable<Model>} stream of instances matching given test
		 */
		static processTerm( testDescription, sortBy = null, sortAscendingly = true ) {
			return Services.OdemModelTester.fromDescription( this, testDescription, null, { sortBy, sortAscendingly } ).createStream();
		}

		/**
		 * Resolves as soon as all defined indices of model are available.
		 *
		 * @return {Promise<Index[]>} promises list of model's prepared indices
		 */
		static get indexLoaded() {
			if ( !this.indexPromise ) {
				const { adapter, indices } = this;
				const numIndices = indices.length;
				let promise;

				if ( numIndices ) {
					const stream = adapter.keyStream( { prefix: `models/${this.name}/items` } );
					let count = 0;
					let step = 100;

					promise = PromiseUtils.process( stream, dataKey => {
						return new this( this.keyToUuid( dataKey ) ) // eslint-disable-line new-cap
							.load().then( item => {
								const { $uuid } = item;

								for ( let i = 0; i < numIndices; i++ ) {
									const { property, handler } = indices[i];

									handler.add( $uuid, item[property] );
								}

								if ( count++ % step === 0 ) {
									logDebug( "having indexed %d records of model %s", count, this.name );

									if ( count / step >= 10 ) {
										step *= 10;
									}
								}
							} );
					} )
						.then( () => {
							if ( count % step ) {
								logDebug( "having indexed %d records of model %s eventually", count, this.name );
							}

							if ( process.env.NODE_ENV !== "production" ) {
								const failed = [];

								for ( let i = 0; i < numIndices; i++ ) {
									const index = indices[i];

									try {
										index.handler.checkIntegrity();
									} catch ( error ) {
										failed.push( `${index.type} on ${this.name}.${index.property} (${this.schema.computed[index.property] ? `${this.schema.computed[index.property].type} computed` : this.schema.props[index.property].type})` ); // eslint-disable-line max-len
										logError( "integrity check of %s index on %s.%s failed: %s", index.type, this.name, index.property, error.message );
									}
								}

								if ( failed.length > 0 ) {
									throw new Error( "failed integrity check(s) on: " + failed.join( ", " ) );
								}
							}

							this.observeBackend();

							return indices;
						} );
				} else {
					promise = Promise.resolve( indices );
				}

				Object.defineProperty( this, "indexPromise", { value: promise } );
			}

			return this.indexPromise;
		}

		/**
		 * Compiles provided schema into model class derived from Model or
		 * some explicitly provided model class.
		 *
		 * @param {string} modelName name of model
		 * @param {object} schema definition of model's schema
		 * @param {class} customBaseClass model class inheriting from Model
		 * @param {OdemAdapter} adapter selects adapter to use on instances of resulting model by default
		 * @returns {class} compiled model class
		 */
		static define( modelName, schema, customBaseClass = null, adapter = null ) {
			return Services.OdemModelCompiler.compileModel( modelName, schema, customBaseClass, adapter );
		}
	}

	return Model;
};
