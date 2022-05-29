$(document).ready(function(){
    /* Jump straight to camera */
    $("input[type='file']")
        .attr('accept', 'image/*')
        .attr('capture', 'camera')
        .attr('id', 'img-frame');
    // "capture=environment" prefers front facing
    
    /* Pull company name from query string and add to page */
    const getObjSize = obj => Object.keys(obj).length;
    const queryString = new URLSearchParams(window.location.search);
    const queryStringObj = Object.fromEntries(queryString.entries());
    const company = queryStringObj.company;
    const editMode = queryStringObj.vc_editable;
    const companyLine = document.querySelector('#company-name');
    const companyName = companyLine.querySelector('#company-name-1');
    if (company && companyName) {
        companyName.innerText = company;
    }
    else if (!editMode) {
        companyLine.style.display = 'none';
    }
    
    /* Show thumbnail after taking photo */    
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/load_event
    function readURL(input) {
        let preview;
        if ($("#mfcf7_zl_multifilecontainer").length == 1) {
            $(input).after('<div class="img-wrapper"><img class="loaded-img" src=""></div>');
            preview = $(input).next().find('.loaded-img')[0];
        }
        else {
            preview = $('.cameraButton .loaded-img')[0];
        }
        
        const reader = new FileReader();

        const selectedFile = input.files[0];
        if (selectedFile) {
            reader.addEventListener('load', function(event) {
                if (event.type === "load") {
                    preview.src = reader.result;
                }
            })
            reader.readAsDataURL(selectedFile);
        }
    }

    function fixHeight($el) {
        $('.loaded-img').load(function() {
            if ($el.length == 1) {
                $el.css({
                    'height': $('.loaded-img').height(),
                    'width': $('.loaded-img').width(),
                })
            }
            else {
                $el.each(function(i, obj) {
                    $(this).css({
                        'height': $(this).children($el).eq(0).height(),
                        'width': $(this).children($el).eq(0).width()
                    })
                })
            }
        }
    )}

    (function() {
        if (typeof deleteFile !== 'undefined') {
            const deleteFile = document.querySelector('.multilinefile-img > .mfcf7_zl_delete_file');
            const $imgWrapper = $('.img-wrapper').last();
            $imgWrapper.append($imgWrapper.nextAll(deleteFile))
            deleteFile.addEventListener('click', function() {
                const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
                const $imgWrappers = $inputWrappers.find($('.img-wrapper'));
                updateImgs($imgWrappers.length);
            })
        }
    })();
    
    if (typeof $button !== 'undefined') {
        const $button = $('#mfcf7_zl_add_file');
        const buttonTextOrig = $button[0].value;
        const buttonText = document.querySelector($button[0]).value;
    }

    function updateButton(length) {
        if (typeof $button !== 'undefined') {
            if (length == 0) {
                $button[0].value = buttonText;
            }
            else if (buttonTextOrig.startsWith('Start')) {
                $button[0].value =  buttonTextorig.replace('Start', 'Keep');
            }
        }
    }

    function updateImgs(length) {
        console.log('updating images to: ' + length);
        const $imgWrapper = $('.img-wrapper').last();
        $imgWrapper.append($imgWrapper.nextAll(deleteFile));
        if ($("#mfcf7_zl_multifilecontainer").length == 1) {
            $("#mfcf7_zl_multifilecontainer").change(function() {
                const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
                const $lastInput = $inputWrappers.last().find('input#img-frame');

                readURL($lastInput[0]);
                const $imgWrappers = $inputWrappers.find('.img-wrapper');
                fixHeight($imgWrappers)
                updateButton($imgWrappers.length);
                updateImgs($imgWrappers.length);
            })
        }
        else {
            $('input#img-frame').change(function() {
                readURL($('input#img-frame')[0]);
                fixHeight($('.cameraButton'));
            })
        }
    }

    if ($("#mfcf7_zl_multifilecontainer").length == 1) {
        $("#mfcf7_zl_multifilecontainer").change(function() {
            const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
            const $lastInput = $inputWrappers.last().find('input#img-frame');

            readURL($lastInput[0]);
            const $imgWrappers = $inputWrappers.find('.img-wrapper');
            fixHeight($imgWrappers);
            updateButton($imgWrappers.length);
        })

        /* Change button text if photo on page */
        // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver

        const observer = new MutationObserver(function() {
            const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
            const $imgWrappers = $inputWrappers.find('.img-wrapper');
            fixHeight($imgWrappers);
            updateButton($imgWrappers.length);
        })
        observer.observe($("#mfcf7_zl_multifilecontainer")[0], { childList: true });
    }
    else {
        $('input#img-frame').change(function() {
            readURL($('input#img-frame')[0]);
            fixHeight($('.cameraButton'));
        })
    }

    /* Auto-format phone number */
    // https://stackoverflow.com/questions/30058927/format-a-phone-number-as-a-user-types-using-pure-javascript
    const isNumericInput = (event) => {
        const key = event.keyCode;
        return ((key >= 48 && key <= 57) || // Allow number line
            (key >= 96 && key <= 105) // Allow number pad
        );
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
            );
    }
    
    const enforceFormat = (event) => {
        // Input must be of a valid number format or a modifier key, and not longer than ten digits
        if(!isNumericInput(event) && !isModifierKey(event)){
            event.preventDefault();
        }
    }
    
    const formatToPhone = (event) => {
        if(isModifierKey(event)) {return}
        const input = event.target.value.replace(/\D/g,'').substring(0,10); // First ten digits of input only
        const areaCode = input.substring(0,3);
        const middle = input.substring(3,6);
        const last = input.substring(6,10);
        if(input.length > 6){event.target.value = `(${areaCode}) ${middle} - ${last}`;}
        else if(input.length > 3){event.target.value = `(${areaCode}) ${middle}`;}
        else if(input.length > 0){event.target.value = `(${areaCode}`;}
    }
    
    const inputElement = document.querySelector('input[type="tel"');
    inputElement.addEventListener('keydown',enforceFormat);
    inputElement.addEventListener('keyup',formatToPhone);
});