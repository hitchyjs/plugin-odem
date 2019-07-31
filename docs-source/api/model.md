# Model API

## Static Methods

### Model.define()

**Signature:** `Model.define( name, schema, baseClass, adapter ) : Model`

This method is available to create a new model class according to provided definition. See the related documentation for defining models for additional information.

### Model.list()

**Signature:** `Model.list( offset, limit, withValues, meta ) : Promise<Model[]>`

This method promises an (excerpt from) unconditional list of current model's instances.

### Model.findByAttribute()

**Signature:** `Model.findBytAttribute( name, value, operation, offset, limit, meta ) : Promise<Model[]>`

This method promises a list of model instances matching condition described in arguments.

### Model.uuidToKey()

**Signature:** `Model.uuidToKey( uuid ) : string`

When accessing a record of data stored in a connected datasource the instance's UUID is converted into a key suitable for selecting that record. This method implements the proper conversion.

### Model.keyToUuid()

**Signature:** `Model.keyToUuid( key ) : string`

This method is the counterpart to `Model.uuidToKey()` and may be used to convert keys provided by some backend into the UUID suitable for identifying a related instance of the model.


## Static Properties

The abstract `Model` does not expose any static properties itself. But there static properties exposed by model classes compiled from a definition using `Model.define()`. The following description refers to `Model.*` to reflect this commonality between all compiled models that always derive from `Model`.
 
### Model.name

The name of model selected on defining it is exposed in context of model.

### Model.adapter

This property exposes the adapter selected to persistently store instances of the model.

### Model.schema

The qualified definition of model is exposed as its _schema_.

### Model.indices

This array is a concise list of indices defined in context of current model. Every item in this list provides the property either index is used for and the type of index or comparison operation. Every item looks like this one.

```javascript
{ property: "loginName", type: "eq" }
```

The exposed list is empty if there was no index defined for any of current model's properties.


### Model.derivesFrom

This property refers to the class current model is derived from. The resulting class is always `Model` or some class derived from `Model`.

This reference can be used to invoked static methods of a model current one is deriving from:

```javascript
static createRecord() {
    this.derivesFrom.createRecord();

    // add your code here
}
```


## Instance Methods

### instance.load()

**Signature:** `instance.load() : Promise<Model>`

Promises current instances with values of its properties loaded from persistent data storage.

### instance.save()

**Signature:** `instance.save() : Promise<Model>`

Promises properties of current instance persistently saved in data storage.

### instance.validate()

**Signature:** `instance.validate() : Promise<string[]>`

Validates values of every property in current instance promising a list of encountered validation errors. Validation is successful if promised list is empty, only.

### instance.remove()

**Signature:** `instance.remove() : Promise<Model>`

Promises removal of current instance from data storage.

### instance.toObject()

**Signature:** `instance.toObject( omitComputed ) : object`

Extracts values of all properties of current instance. By default, this includes values of computed properties. You might pass `true` as an argument to omit computed properties, though.


## Instance Properties

Basically, an instance of a model exposes every actual or computed property according to the model's definition. Those properties' names must not start with a `$` by intention to prevent naming conflicts with any implicitly available property described here.

:::warning Note!
There is one exclusion from this rule of prefixing implicit properties with `$`.

Every instance of a model is assumed to have a unique UUID for safely addressing it. This property is exposed as `instance.uuid`. A model's definition mustn't use this name for any element in turn.
:::

### instance.$properties

The current instance's actual set of values per defined property is managed in a monitored object which is exposed as `instance.$properties`. 

For example, if you have defined a property `name` for your model then there is a property `instance.name` suitable for reading or writing related value of either instance of model. The actual value is managed as `instance.$properties.name` internally.

It does not matter which way you access properties, but for the sake of simplicity and to create future-proof code you should use the exposed properties instead of `instance.$properties`.

Internally, [object-monitor](https://www.npmjs.com/package/object-monitor) is used to implement `instance.$properties`. Thus it is possible to read several meta information regarding the managed set of property values, e.g.

* detecting whether values have been changed recently by reading `instance.$properties.$context.hasChanged`,
* fetching map of recently changed values through `instance.$properties.$context.changed`, which is a [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) listing names and new values of changed property values,
* committing or rolling back recent changes to properties using either `instance.$properties.$context.commit()` or `instance.$properties.$context.rollBack()`.


### instance.$adapter

This property exposes adapter used to persistently store this instance of model. It might be different from the adapter defined for use with the model as a whole, though it won't be different in most cases.

### instance.$isNew

This property indicates whether current instance has been freshly created. This is assumed in case of missing UUID associated with current instance.

### instance.$exists

This property exposes promise for indicator whether data storage contains representation of instance currently.

### instance.$super

This property exposes object sharing prototype with the the class this model's class is derived from. Thus, it exposes that one's instance-related methods and properties.

The reference doesn't work like ES6 `super` keyword but requires slightly more complex code when trying to invoke instance methods of parent class:

```javascript
someMethod( arg1, arg2 ) {
    this.$super.someMethod.call( this, arg1, arg2 );

    // add your code here
}
```

### instance.uuid

This property is different from other implicit properties for it doesn't start with `$` by intention. 

An instance's UUID is used to uniquely select it in its model's collection of instances. On freshly created instances the UUID is `null`. After having saved such an instance the UUID assigned by backend adapter is exposed instead.

### instance.$dataKey

This property is related to the instance's UUID and exposes the key used to address the related record in data source connected via backend adapter. 

On a freshly created instance this information is a template containing `%u` as a placeholder for the UUID to be assigned on saving. 


## Hooks

For every supported life cycle event there is an instance method of same name to be invoked whenever either event occurs. Using a model's definition those _hooks_ can be replaced via definition section **hooks**, only.

:::tip Asynchronous Hooks
By intention every hook may return promise to delay further processing. Whenever some hook is required to return data that data may be promised as well.
:::

:::warning Calling Parent Class Hooks   
In combination with `instance.$super` any code is capable of including related hook of parent class.

```javascript
afterValidate() {
    const errors = this.$super.afterValidate.call( this );

    // add your code here
    
    return errors;
}
```

In addition, though, you must be aware of either hook of parent class might return promise as well requiring your hook to wait for the promise to be settled and adopt its result either way.

```javascript
afterValidate( errors ) {
    return Promise.resolve( this.$super.afterValidate.call( this ) )
        .then( errors => {
            // add your code here
            
            return errors;
        } );
}
```
:::

### Model.beforeCreate()

**Signature:** `Model.beforeCreate( value ) : value`

:::warning Note!  
This hook is the only one which isn't invoked in context of a particular instance of the model, but as a static method of that model.
:::

This hook is invoked with all values for a new instance to be created. It is meant to return the probably adjusted set of values to be used for eventually creating the instance.

### instance.afterCreate()

**Signature:** `instance.afterCreate()`

This hook is invoked after having created a new instance of the model.

### instance.beforeValidate()

**Signature:** `instance.beforeValidate()`

This hook is invoked prior to validating all property values of current instance to comply with 
defined constraints.

### instance.afterValidate( errors ) : errors

**Signature:** `instance.afterValidate( errors ) : errora`

This hook is invoked after validating all property values of current instance to comply with 
defined constraints. The list of error messages is passed in first argument as an error of strings. The probably adjusted list of messages is meant to be returned by this hook.

:::warning Important
Any validation of properties fails if there is at least one error message returned. If this hook fails to pass provided errors a failed validation e.g. won't prevent property values from being saved anymore.  
:::

### instance.beforeSave()

**Signature:** `instance.beforeSave()`

This hook is invoked prior to persistently saving property values of current instance in a datasource connected via backend adapter.

### instance.afterSave()

**Signature:** `instance.afterSave()`

This hook is invoked after saving property values of current instance in a datasource connected via backend adapter.

### instance.beforeRemove()

**Signature:** `instance.beforeRemove()`

This hook is invoked prior to removing current instance. It might throw exception or reject some returned promise to prevent removal of instance.

### instance.afterRemove()

**Signature:** `instance.afterRemove()`

This hook is invoked after having removed current instance. The hook is invoked in context of removed instance.