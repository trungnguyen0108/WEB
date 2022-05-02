function Validator(options) {
    function getParent(element, selector)  {
        while (element.parentElement) {
            if (element.parentElement.matches(selector)) {
                return element.parentElement
            }
            element = element.parentElement
        }
    }

    let selectorRules = {}

    function validate(inputElement, rule) {
        let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
        let errorMessage

        let rules = selectorRules[rule.selector]

        for(let i = 0; i < rules.length; i++){
            errorMessage = rules[i](inputElement.value)
            if (errorMessage) break
        }

        if (errorMessage) {
            errorElement.innerText = errorMessage;
            getParent(inputElement, options.formGroupSelector).classList.add("invalid")
        } else {
            errorElement.innerText = ""
            getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
        }

        return !errorMessage
    }

    let formElement = document.querySelector(options.form)

    if (formElement) {

        formElement.onsubmit = function(e) {
            e.preventDefault();
            let isFormValid = true

            options.rules.forEach((rule) => {
                let inputElement = formElement.querySelector(rule.selector)
                let isValid = validate(inputElement, rule)     
                if (!isValid) {
                    isFormValid = false
                }
            })
            
            if (isFormValid) {
                if (typeof options.onSubmit === "function") {
                    let enableInput = formElement.querySelectorAll("[name]:not([disabled])")
                    let formValue = Array.from(enableInput).reduce( (values, input) => {
                        values[input.name] = input.value
                        return values
                    }, {})
                    options.onSubmit(formValue)
                }
                else{
                    formElement.submit()
                }
                
            }
    
        }

        
        options.rules.forEach((rule) => {

            if(Array.isArray(selectorRules[rule.selector])){
                selectorRules[rule.selector].push(rule.test)
            } else {
                selectorRules[rule.selector] = [rule.test]
            }

            let inputElement = formElement.querySelector(rule.selector)
            if (inputElement) {
                inputElement.onblur = function () {
                    validate(inputElement, rule)
                }

                inputElement.oninput = function() {
                    let errorElement = getParent(inputElement, options.formGroupSelector).querySelector(options.errorSelector)
                    errorElement.innerText = ""
                    getParent(inputElement, options.formGroupSelector).classList.remove("invalid")
                }
            }
        })
    }
}

Validator.isRequired = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            return value ? undefined : message ||  "Vui lòng nhập trường này"
        }
    }
}

Validator.isEmail = function (selector, message) {
    return {
        selector: selector,
        test: function (value) {
            let regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
            return regex.test(value) ? undefined : message ||  "Email không hợp lệ"
        }
    }
}


Validator.isConfirmed = function (selector, getConfirmValue, message) {
    return {
        selector: selector,
        test: function (value) {
            return value === getConfirmValue() ? undefined : message || "Mật khẩu 2 không đúng"
        }
    }
}