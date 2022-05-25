$(document).ready(function(){
    /* jump straight to camera */
    $("input[type='file']")
        .attr('accept', 'image/*')
        .attr('capture', 'camera')
        .attr('id', 'img-frame')
    // "capture=environment" prefers front facing
    
    /* dynamic company name */
    const getObjSize = obj => Object.keys(obj).length
    const queryString = new URLSearchParams(window.location.search)
    const queryStringObj = Object.fromEntries(queryString.entries())
    const company = queryStringObj.company
    const editMode = queryStringObj.vc_editable
    const companyLine = document.querySelector('#company-name')
    const companyName = companyLine.querySelector('#company-name-1')
    if (company && companyName) {
        companyName.innerText = company
    }
    else if (!editMode) {
        companyLine.style.display = 'none'
    }
    
    /* show thumbnail after taking photo */    
    const isMultiUploader = !!$("#mfcf7_zl_multifilecontainer").length

    function readURL(input) {
        if (input.files && input.files[0]) {
            console.log(input.files[0])

            if ($("#mfcf7_zl_multifilecontainer")) {
                $(input).after('<div class="img-wrapper"><img class="loaded-img"></div>')
                console.log('created empty image container')
            }

            var reader = new FileReader()
            reader.onload = function (e) {
                if ($(input).next() {
                    console.log('adding img src to container')
                    $(input).next('.img-wrapper').find('img').attr('src', e.target.result)
                }
                else {
                    $('.loaded-img').attr('src', e.target.result)
                }
            }
            // reader.readAsDataURL(input.files[0])
        }
    }

    function fixHeight($el) {
        $('.loaded-img').load(function() {
            $el.css({
                'height': $('.loaded-img').height(),
                'width': $('.loaded-img').width(),
            })
        })
    }

    // Find all image input containers:
    // $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img').find('input#img-frame')
    // Find just last container:
    // $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img').last().find('input#img-frame')

    if (isMultiUploader) {
        $("#mfcf7_zl_multifilecontainer").change(function() {
            const $inputWrappers = $(this).children('.multilinefile-img')
            const $lastInput = $inputWrappers.last().find('input#img-frame')
            const lastInputFilename = $inputWrappers.last()[0].innerText

            // console.log('$lastInput (' + $lastInput.length + '): ' + lastInputFilename)
            // console.log($lastInput[0])
            // console.log($lastInput[0].files)
            // console.log($lastInput[0].files[0])

            readURL($lastInput[0])
            fixHeight($lastInput.next('.img-wrapper'))
        })
    }
    else {
        $('input#img-frame').change(function() {
            readURL(this)
            fixHeight($('.cameraButton'))
        })
    }

    /* auto format phone number */
    // https://stackoverflow.com/questions/30058927/format-a-phone-number-as-a-user-types-using-pure-javascript
    const isNumericInput = (event) => {
        const key = event.keyCode;
        return ((key >= 48 && key <= 57) || // Allow number line
            (key >= 96 && key <= 105) // Allow number pad
        )
    }
    
    const isModifierKey = (event) => {
        const key = event.keyCode;
        return (event.shiftKey === true || key === 35 || key === 36) || // Allow Shift, Home, End
            (key === 8 || key === 9 || key === 13 || key === 46) || // Allow Backspace, Tab, Enter, Delete
            (key > 36 && key < 41) || // Allow left, up, right, down
            (
                // Allow Ctrl/Command + A,C,V,X,Z
                (event.ctrlKey === true || event.metaKey === true) &&
                (key === 65 || key === 67 || key === 86 || key === 88 || key === 90)
            )
    }
    
    const enforceFormat = (event) => {
        // Input must be of a valid number format or a modifier key, and not longer than ten digits
        if(!isNumericInput(event) && !isModifierKey(event)){
            event.preventDefault()
        }
    }
    
    const formatToPhone = (event) => {
        if(isModifierKey(event)) {return}
        const input = event.target.value.replace(/\D/g,'').substring(0,10) // First ten digits of input only
        const areaCode = input.substring(0,3)
        const middle = input.substring(3,6)
        const last = input.substring(6,10)
        if(input.length > 6){event.target.value = `(${areaCode}) ${middle} - ${last}`}
        else if(input.length > 3){event.target.value = `(${areaCode}) ${middle}`}
        else if(input.length > 0){event.target.value = `(${areaCode}`}
    }
    
    const inputElement = document.querySelector('input[type="tel"')
    inputElement.addEventListener('keydown',enforceFormat)
    inputElement.addEventListener('keyup',formatToPhone)
})