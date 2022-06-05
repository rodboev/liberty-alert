$(document).ready(function(){
    /* Jump straight to camera */
    $("input[type='file']")
        .attr('accept', 'image/*')
        .attr('capture', 'camera')
        .attr('id', 'img-frame');
    // "capture=environment" prefers front facing
    
    /* Pull company name from query string and add to page */
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
    
    /* Generate thumbnail from input field metadata, show on page */    
    // https://developer.mozilla.org/en-US/docs/Web/API/FileReader/load_event
    function readURL(input) {
        const selectedFile = input.files[0];
        console.log('rendering ' + selectedFile.name);
        let preview;
        if ($("#mfcf7_zl_multifilecontainer")) {
            $(input).after('<div class="img-wrapper"><img class="loaded-img"></div>');
            preview = $(input).next().find('.loaded-img')[0];
        }
        else {
            preview = $('.cameraButton .loaded-img')[0];
        }
        
        const reader = new FileReader();

        if (selectedFile) {
            reader.addEventListener('load', function(event) {
                if (event.type === "load") {
                    preview.src = reader.result;
                    
                    preview.onload = function() {
                        console.log('image loaded');
                        $(preview).parent().css({
                            'width': this.width,
                            'height': this.height,
                        });
                    }
                }
            })
            reader.readAsDataURL(selectedFile);
        }
    }

    function moveDeleteButton() {
        const deleteFile = document.querySelector('.multilinefile-img > .mfcf7_zl_delete_file');
        if (typeof deleteFile !== 'undefined') {
            /* TODO: Select with `this` instead of .last() */
            const $imgWrapperLast = $('.img-wrapper').last();
            $imgWrapperLast.append($imgWrapperLast.nextAll(deleteFile))
            deleteFile.addEventListener('click', function() {
                const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
                const $imgWrapperLast = $inputWrappers.find('.img-wrapper').last();
                updateImgs($imgWrapperLast.length);
            })
        }
    }
    
    const $button = $('#mfcf7_zl_add_file');
    const buttonTextOrig = $button ? $button[0].value : false;
    function updateButton(numPhotos) {
        if ($button) {
            if (numPhotos > 0) {
                $button[0].value = buttonTextOrig.replace('Start', 'Keep');
            }
            else {
                $button[0].value = buttonTextOrig;
            }
        }
    }

    function updateImgs(length) {
        if ($("#mfcf7_zl_multifilecontainer")) {
            $('input#img-frame').change(function() {
                console.log('[Change detected] Images currently uploaded: ' + length);
                const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
                const $inputLast = $inputWrappers.find('input#img-frame').last();
                const $imgWrapperLast = $inputWrappers.find('.img-wrapper').last();
                const $file = $inputWrappers.find('.mfcf7-zl-multifile-name');
                if ($file[0]) {
                    // console.log($file[0].name);
                    readURL($inputLast[0]);
                    const filename = $file[0].innerText.trim();
                    console.log('Filename: ' + filename);

                    moveDeleteButton();
                }
                else {
                    console.error('No file found');
                }
            });
        }
        else {
            $('input#img-frame').change(function() {
                readURL($('input#img-frame')[0]);
            })
        }
    }

    /* TODO: Change button text back to default if no photos on page */
    // https://developer.mozilla.org/en-US/docs/Web/API/MutationObserver
    const observer = new MutationObserver(function() {
        const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
        const $imgWrappers = $inputWrappers.find('.img-wrapper');
        // updateImgs($imgWrappers.length);
        console.log('[Mutation observed] Updating button based on ' + $imgWrappers.length + ' images');
        updateButton($imgWrappers.length);
    })
    observer.observe($("#mfcf7_zl_multifilecontainer")[0], { childList: true });

    /* Proxy event listener */
    $('#mfcf7_zl_add_file').on('click tap', function() {
        console.log('Clicked add photo');
        console.log($("#mfcf7_zl_multifilecontainer")[0]);
        const $inputWrappers = $("#mfcf7_zl_multifilecontainer").children('.multilinefile-img');
        const $imgWrappers = $inputWrappers.find('.img-wrapper').last();
        updateImgs(1);
    });

/* ---------------------------- *
 * Third-party code starts here *
------------------------------- */

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