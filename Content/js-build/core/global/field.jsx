// Universal Module Definition - http://git.io/xPWm
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['libs/react', 'core/global/helpers', 'core/global/form-store', 'core/global/form-actions'], factory);
    } else {
        // Browser globals
        root.Field = factory(root.React, root.Helpers, root.FormStore, root.FormActions);
    }
}(this, function (React, Helpers, FormStore, FormActions) {
    //This is a field component that validates three input types: name, phone and email
    //The purpose of this component is to make it easier to build forms that validate
    //https://www.google.com/design/spec/patterns/errors.html as a suggestion for how we handle error styling / messaging

    //<Field fieldType = "phone" label = "this is a label" required />

    var Field = React.createClass({ // Our global field component
        getInitialState: function() {
            if(Helpers === undefined){
                Helpers = {};
                Helpers.validate = function(){return true};
            } // This is to allow serverside rendering of the field component. will be replaced in future versions
            return {
                fieldType: this.props.fieldType,
                value: this.props.value,
                errorText: this.props.errorText,
                errorUpdatePassportText: this.props.errorUpdatePassportText,
                errorPassportExpSoonText: this.props.errorPassportExpSoonText,
                valid: Helpers.validate(this.props.fieldType, this.props.value), // initialize with valid or not
                showErrorMessage: Helpers.validate(this.props.fieldType, this.props.value) // handles the error text for all invalid fields
            }
        },
        componentDidMount: function() {
            // register this field in the FormStore data object with a key so this can be Die-Namic
            FormStore.registerComponent(this);
        },
        handleValidation: function(e) {

            var inputValue = e.target.value;
            var isFieldValid;
            var showErrorMessage;
            var showPassportExpError = false;
            var showPassportExpSoonError = false;
            var travelerReturnDate = this.props.travelerReturnDate;

            function checkPassportExpDate(passportExpDate, travelerReturnDate) {
              var passportExpDate = new Date(passportExpDate);
              // var passportExpDateAddedSixMonths = new Date(new Date(passportExpDate).setMonth(passportExpDate.getMonth()+6));
              var travelerReturnDate = new Date(travelerReturnDate);

              if(passportExpDate < travelerReturnDate) {
                return false;
              } else {
                return true;
              }
            };

            function checkPassportExpSoon(passportExpDate, travelerReturnDate) {
              var travelerReturnDate = new Date(travelerReturnDate),
                  toDate = new Date(new Date(travelerReturnDate).setMonth(travelerReturnDate.getMonth()+6)),
                  passportExpDate = new Date(passportExpDate);

              if((passportExpDate <= toDate && passportExpDate >= travelerReturnDate)) {
                  return true;
              } else {
                return false;
              }
            };

            if (this.props.required && inputValue == ''){
                isFieldValid = showErrorMessage = false; //replicate where you leave a field empty and it shows an error
            } else {
                isFieldValid = showErrorMessage = Helpers.validate(this.props.fieldType, inputValue);

              // validate the date field for non-html5 supported browsers
              if(this.props.fieldType === 'date'){
                // validates text date for non-html5 browser support, otherwise the above Helpers.validate() handles the html5 date validation
                if(e.target.type === "text"){
                  isFieldValid = showErrorMessage = Helpers.validate('dateTextInput', inputValue);
                }

                // check if the passport is expired, or will before they return from their trip
                if(isFieldValid) {
                  var isPassportExpValid = checkPassportExpDate(inputValue, travelerReturnDate);
                  var isPassportExpSoon = checkPassportExpSoon(inputValue, travelerReturnDate);

                  if(!isPassportExpValid) {
                    isFieldValid = false;
                    showPassportExpError = showErrorMessage = true;
                  }

                  if(isPassportExpSoon) {
                    isFieldValid = showErrorMessage = true;
                    showPassportExpSoonError = true;
                  }
                }
              }
            }

            //allow the callback function from props to access the field value
            if (this.props.callback) {
                this.props.callback();
            }

            this.setState({
                valid: isFieldValid,
                showErrorMessage: showErrorMessage,
                showPassportExpError: showPassportExpError,
                showPassportExpSoonError: showPassportExpSoonError,
                value: e.target.value
            }, (function() { FormActions.validate() }
            )); //callback needs to be wrapped like this for some reason
        },
        render: function() {
            // strings
            var autoCompleteToken;
            var inputModeToken;
            var inputClass = "form-field"; // the default, if we don't provide an override
            var labelClass = "form-label"; // ditto
            var errorLabelClass = "field-validation-error"; // tritto
            var inputType = "text"; // default, we can pass textarea tho
            var placeHolder = "";

            // jsx partials
            var errorMessage;
            var errorMessagePassportExp;
            var errorMessagePassportExpSoon;
            var label;

            switch (this.props.fieldType) {
            case "phone":
                autoCompleteToken = "tel"; //should we consider changing our "phone" type to "tel" ?
                inputModeToken = "tel";
                break;
            case "date":
                inputType = this.props.fieldType;
                break;
            case "email":
                inputType = this.props.fieldType;
                autoCompleteToken = this.props.fieldType;
                inputModeToken = this.props.fieldType;
                break;
            case "name":
                autoCompleteToken = this.props.fieldType; //name and email are valid autocompletes
                inputModeToken = this.props.fieldType;
                break;
            }


            if (this.props.inputClass) {
                inputClass = this.props.inputClass;
            }

            if (this.props.placeholder) {
                placeHolder = this.props.placeholder;
            }

            if (this.props.labelClass) {
                labelClass = this.props.labelClass;
            }

            if (this.props.errorLabelClass) {
                errorLabelClass = this.props.errorLabelClass;
            }

            if (this.props.callback) {
                callback = this.props.callback;
            }

            if (!this.state.showErrorMessage) {
                errorMessage =  <
                label
                className = { errorLabelClass } 
                dangerouslySetInnerHTML={{ __html: this.state.errorText }}>< /
                label > ;
            }

            if (this.state.showPassportExpError) {
                errorMessagePassportExp =  <
                label
                className = { errorLabelClass } 
                dangerouslySetInnerHTML={{ __html: this.state.errorUpdatePassportText }}>< /
                label > ;
            }

            if (this.state.showPassportExpSoonError) {
                errorMessagePassportExpSoon =  <
                label
                className = { errorLabelClass }
                dangerouslySetInnerHTML={{__html: this.state.errorPassportExpSoonText}}>< /
                label > ;
            }

            if (this.props.label) {
                label =  <
                label
                className = { labelClass } > { this.props.label } < /
                label > ;
            }

            if (this.state.valid === false) {
                inputClass += " invalid"
            }

            if (this.props.inputType == 'textarea') {

                return <div>
                    { label }
                    <textarea
                    className = { inputClass }
                    value = { this.state.value }
                    placeholder= { placeHolder }
                    onChange = {
                        this.handleValidation
                    }
                    onBlur = {
                        this.handleValidation
                    }
                    rows = "5" />
                    {errorMessage}
                    </div>

            } else if(this.props.fieldType == 'date') {
                return (
                  <div>
                    { label }
                    < input
                      type = { inputType }
                      id= { this.props.idName }
                      className = { inputClass } //if we use classes
                      onChange = {
                          this.handleValidation
                      }
                      onBlur = {
                          this.handleValidation
                      }
                      value={ this.state.value }
                      placeholder= { placeHolder }
                      required = { this.props.required } />

                    { errorMessage }
                    { errorMessagePassportExp }
                    { errorMessagePassportExpSoon }
                  </div>
                )
            } else {

                return <div>
                    { label }
                    < input
                    type = { inputType }
                    className = { inputClass } //if we use classes
                    value = {
                        this.state.value
                    }
                    placeholder= { placeHolder }
                    onChange = {
                        this.handleValidation
                    }
                    onBlur = {
                        this.handleValidation
                    }
                    autoComplete = {
                        autoCompleteToken // this lets us tie into the browser's autocomplete
                    }
                    inputMode = {
                        inputModeToken // throws up a keyboard that makes sense: ie numeric for phone, email for email
                    }
                    required = { this.props.required } />
                    { errorMessage }
                    </div>

            }

        }

    });

  return Field;

}));
