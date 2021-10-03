; (function () {
    if (!Blazor) {
        console.warn('BlazorUP: no Blazor found!');
        return;
    }

    scriptTags = [].slice.call(document.scripts);
    var blazorWasmScriptTag = scriptTags.find(s => s.src && s.src.indexOf('_framework/blazor.webassembly.js') !== -1);
    if (!blazorWasmScriptTag) {
        console.warn('BlazorUP: no "blazor.webassembly.js" found!');
        return;
    }

    var autostart = blazorWasmScriptTag.attributes['autostart'];
    if (!autostart || autostart.value !== 'false') {
        console.warn('BlazorUP: no autostart=false found on "blazor.webassembly.js" script tag!');
        return;
    }

    var blazorUpScriptTag = scriptTags.find(s => s.src && s.src.indexOf('_content/BlazorUP/blazor.up.js') !== -1);
    if (!blazorUpScriptTag) {
        console.warn('BlazorUP: no "blazor.up.js" found!');
        return Blazor.start();
    }

    var progressHandlerAttribute = blazorUpScriptTag.attributes['handler'];
    var progressHandlerName = 'blazorUp';
    if (progressHandlerAttribute && progressHandlerAttribute.value) {
        progressHandlerName = progressHandlerAttribute.value;
    }

    var progressHandler = window[progressHandlerName];
    if (!progressHandler || typeof progressHandler !== 'function') {
        console.warn(`BlazorUP: progress handler (window.${progressHandlerName}) is not a function!`);
        //return Blazor.start();
    }

    var progressElementId = 'blazor-up';
    var progressElementIdAttribute = blazorUpScriptTag.attributes['elementid'];
    if (progressElementIdAttribute && progressElementIdAttribute.value) {
        progressElementId = progressElementIdAttribute.value;
    }
    var progressElement = document.getElementById(progressElementId);
    progressElement && (progressElement.style.display = 'none');

    var counter = 0;
    var fetchResponsePromises = [];
    Blazor.start({
        loadBootResource: loadBootResource
    })


    function loadBootResource(type, name, url, integrity) {
        if (type == "dotnetjs") return url; // blazor itself handles this specific resource and needs to have its url

        progressElement && (progressElement.style.display = 'block');

        var response = fetch(url, {
            cache: 'no-cache',
            integrity: integrity
        });

        fetchResponsePromises.push(response);

        response.then((r) => {
            counter++;
            var percent = 100 * counter / fetchResponsePromises.length;

            try { progressHandler(percent, type, name, url, integrity); } catch (e) { }

            if (percent >= 100) {
                progressElement && (progressElement.style.display = 'none');
            }
        });

        return response;
    }
}());