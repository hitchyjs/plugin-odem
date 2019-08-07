(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{39:function(e,t,a){"use strict";a.r(t);var i=a(0),o=Object(i.a)({},function(){var e=this,t=e.$createElement,a=e._self._c||t;return a("ContentSlotsDistributor",{attrs:{"slot-key":e.$parent.slotKey}},[a("h1",{attrs:{id:"glossary"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#glossary","aria-hidden":"true"}},[e._v("#")]),e._v(" Glossary")]),e._v(" "),a("p",[e._v("The documentation "),a("em",[e._v("tries to")]),e._v(" stick with certain terminology. This glossary is provided to help with understanding those terms.")]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Revisions Welcome!")]),e._v(" "),a("p",[e._v("We don't claim this glossary to represent ultimate truth. This glossary is open for discussion and correction.")])]),e._v(" "),a("p",[e._v("The glossary isn't sorted alphabetically to help with reading it top to bottom, though some aspects might be given redundantly to understand every term individually.")]),e._v(" "),a("h2",{attrs:{id:"model"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#model","aria-hidden":"true"}},[e._v("#")]),e._v(" Model")]),e._v(" "),a("p",[e._v("A model combines a defined set of "),a("em",[e._v("structured information")]),e._v(" with associated "),a("em",[e._v("behaviour")]),e._v(" and applies a somewhat unique "),a("em",[e._v("label")]),e._v(" to this combination. It is used to describe a certain "),a("em",[e._v("type of item")]),e._v(" to be handled in code. Models can be derived by means of extending an existing model by adding or replacing information and/or behaviour resulting in a different, but related model.")]),e._v(" "),a("p",[e._v("For every model there may be a set of instances sharing that model as a description of their common structure and behaviour.")]),e._v(" "),a("p",[e._v("A model in ODM is very similar to a class in object-oriented programming.")]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v("When creating an address book application it is going to handle records each describing a particular "),a("em",[e._v("person")]),e._v(". In this scenario "),a("em",[e._v("person")]),e._v(" is a model.")]),e._v(" "),a("p",[e._v("It might define to have a name and some mail address for contacting this particular person. This is the "),a("em",[e._v("structured information")]),e._v(" common to all the records and thus also known as "),a("em",[e._v("a person's data")]),e._v(".")]),e._v(" "),a("p",[e._v("The model will expose a method for sending mail to a particular person. This is the "),a("em",[e._v("behaviour")]),e._v(" associated with a person's data.")]),e._v(" "),a("p",[e._v("The address book might support different kinds of persons, such as "),a("em",[e._v("friends")]),e._v(" and "),a("em",[e._v("colleagues")]),e._v(". Either kind may be considered a derived model and it might adjust information structure and associated behaviour, e.g. adding birthday per friend to what is managed by common "),a("em",[e._v("person")]),e._v(" model.")])]),e._v(" "),a("h3",{attrs:{id:"schema"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#schema","aria-hidden":"true"}},[e._v("#")]),e._v(" Schema")]),e._v(" "),a("p",[e._v("When using a model's API the definition of properties and behaviour per model is exposed as the model's schema.")]),e._v(" "),a("h3",{attrs:{id:"properties"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#properties","aria-hidden":"true"}},[e._v("#")]),e._v(" Properties")]),e._v(" "),a("p",[e._v("In context of a model properties are used to describe the common structure of information found in instances of that model.")]),e._v(" "),a("p",[e._v("A definition of a property includes")]),e._v(" "),a("ul",[a("li",[e._v("its name for identifying related information in context of instances of the model,")]),e._v(" "),a("li",[e._v("its type of information used in every instance,")]),e._v(" "),a("li",[e._v("constraints to be applied to detect valid/invalid information and")]),e._v(" "),a("li",[e._v("indices used to improve performance on searching for/sorting by this property.")])]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v("One property of model "),a("em",[e._v("person")]),e._v(" in the address book application will declare to have a "),a("em",[e._v("last name")]),e._v(" (which is the identifying name of some information) as a "),a("em",[e._v("string of characters")]),e._v(" (that's the type of information) and that "),a("em",[e._v("providing a last name is required")]),e._v(" (which is a constraint applied to this information).")])]),e._v(" "),a("h3",{attrs:{id:"computed-properties"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#computed-properties","aria-hidden":"true"}},[e._v("#")]),e._v(" Computed Properties")]),e._v(" "),a("p",[e._v("A model might define virtual properties that won't be stored persistently but will derive their information from other information of an instance on demand.")]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v("When having actual properties "),a("em",[e._v("last name")]),e._v(" and "),a("em",[e._v("first name")]),e._v(" there might be a computed property "),a("em",[e._v("full name")]),e._v(" that is combining the former two attributes.")])]),e._v(" "),a("h3",{attrs:{id:"methods"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#methods","aria-hidden":"true"}},[e._v("#")]),e._v(" Methods")]),e._v(" "),a("p",[e._v("A method is a piece of code defined in context of a model. However, there are two types of methods with regards to context when running:")]),e._v(" "),a("ul",[a("li",[a("p",[e._v("A static or model-related method is running bound to the model, thus basically incapable of processing a particular instance of that model.")])]),e._v(" "),a("li",[a("p",[e._v("An instance method is running bound to a particular instance of the model it was defined in. This method is capable of processing the particular instance as well as accessing its model and use static methods defined there.")])])]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v("Searching a person by its name is an operation to be run in context of whole model rather than a single instance of it. Thus this method is a static method of model "),a("em",[e._v("person")]),e._v(".")]),e._v(" "),a("p",[e._v("Sending mail to a particular person requires information of that particular person as context and thus is defined as an instance method.")])]),e._v(" "),a("h2",{attrs:{id:"item-or-instance"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#item-or-instance","aria-hidden":"true"}},[e._v("#")]),e._v(" Item "),a("em",[e._v("or")]),e._v(" Instance")]),e._v(" "),a("p",[e._v("A single set of values complying with the structure of a particular model may be called an item or instance of that model.")]),e._v(" "),a("p",[e._v("In code, instances aren't just "),a("em",[e._v("complying")]),e._v(" with one of the models, but have a strong relationship with the model instead for the model's API is used to actually access and manage some of its instances.")]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v("The address book application will be populated with information on several actual persons. Each particular person's individual data is an instance or item of the model.")])]),e._v(" "),a("h3",{attrs:{id:"property-values"}},[a("a",{staticClass:"header-anchor",attrs:{href:"#property-values","aria-hidden":"true"}},[e._v("#")]),e._v(" Property Values")]),e._v(" "),a("p",[e._v("Every instance of a model is grouping values for the properties defined for the model. Either value has to comply with the type and constraints as defined.")]),e._v(" "),a("div",{staticClass:"tip custom-block"},[a("p",{staticClass:"custom-block-title"},[e._v("Example")]),e._v(" "),a("p",[e._v('In address book application there might be a record for a person named "John Doe". This record will have a value "Doe" for the property named '),a("em",[e._v("last name")]),e._v(" which is a "),a("em",[e._v("string of characters")]),e._v(" and "),a("em",[e._v("is present")]),e._v(", thus complying with the definition of this property.")])])])},[],!1,null,null,null);t.default=o.exports}}]);