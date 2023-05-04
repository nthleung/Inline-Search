/**
 * inline.js
 *
 * Use your favourite search engines on the fly
 * without having to open new tab.
 *
 * @author     Tsz Hin Leung
 * @copyright  Copyright (c) 2023
 * @license    MIT license
 * 
 * @author     Victor Aremu <victor.olorunbunmi@gmail.com>
 * @copyright  Copyright (c) 2018
 * @license    MIT license
 */

window.inlineSeachExt = {};

window.inlineSeachExt.overlayDisplayed = false;
window.inlineSeachExt.currentPageHeight = Math.max( document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight );
window.inlineSeachExt.currentPageWidth = Math.max( document.body.scrollWidth, document.body.offsetWidth, document.documentElement.clientWidth, document.documentElement.scrollWidth, document.documentElement.offsetWidth);

window.inlineSeachExt.DEFAULT_WIDTH = "480";
window.inlineSeachExt.DEFAULT_HEIGHT = "640";

(function () {
    document.onmousemove = handleMouseMove;

    function handleMouseMove(event) {
        var dot, eventDoc, doc, body, pageX, pageY;

        event = event || window.event;
        if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
                (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
                (doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
                (doc && doc.scrollTop || body && body.scrollTop || 0) -
                (doc && doc.clientTop || body && body.clientTop || 0);
        }

        window.inlineSeachExt.extInlineSearchX = event.pageX;
        window.inlineSeachExt.extInlineSearchY = event.pageY;

    }
})();

window.inlineSeachExt.inline = function (inCtrl, overlayEnabled, last_engine, transparency) {
// console.log(inCtrl);

    window.inlineSeachExt.createShadowDOM(transparency);

    window.inlineSeachExt.doc_keyUp = function (e) {

        if (e.ctrlKey && e.keyCode == inCtrl) {
			window.inlineSeachExt.toggle_search(overlayEnabled);
        }
    };

    document.addEventListener('keyup', window.inlineSeachExt.doc_keyUp, false);
};

chrome.storage.local.get(['n_inCtrl', 'n_overlay', 'n_last_engine', 'n_transparency'], function (result) {

    if (result.n_inCtrl == undefined && result.n_overlay == undefined && result.n_last_engine == undefined && result.n_transparency == undefined) {

        chrome.storage.local.set({
            n_inCtrl: "B",
            n_overlay: 1,
            n_last_engine: "inext-ch-google",
			n_transparency: 0
        })
		window.inlineSeachExt.last_engine = "inext-ch-google"; 
		window.inlineSeachExt.inline(("B").charCodeAt(0), 1, "inext-ch-google", 0);
    } else
    {
        window.inlineSeachExt.last_engine = result.n_last_engine; 
        window.inlineSeachExt.inline(result.n_inCtrl.charCodeAt(0), result.n_overlay, result.n_last_engine, result.n_transparency);
    }
});

window.inlineSeachExt.closeSearch = function(){
	chrome.runtime.sendMessage({operation: "close"});
	var overlay = window.inlineSeachExt.shadow.getElementById("ext_inlineSearchOverlay");
	if(overlay !== null )window.inlineSeachExt.shadow.getElementById("ext_inlineSearchOverlay").remove();
	window.inlineSeachExt.shadow.getElementById("ext_InlineSearch_Panel").remove();
	window.inlineSeachExt.overlayDisplayed = false;
}

window.inlineSeachExt.toggle_search = function (overlayEnabled) {

	if (!window.inlineSeachExt.overlayDisplayed) {

		chrome.runtime.sendMessage({operation: "open"});

		if (overlayEnabled == 1){
			var ext_inlineSearchOverlay = document.createElement('div');
			ext_inlineSearchOverlay.id = "ext_inlineSearchOverlay";
			window.inlineSeachExt.shadow.appendChild(ext_inlineSearchOverlay);
			window.inlineSeachExt.shadow.getElementById("ext_inlineSearchOverlay").addEventListener('click', window.inlineSeachExt.closeSearch);
		}

        var ext_highlightedText = window.getSelection().toString();
        var ext_panel = document.createElement('div');
        ext_panel.id = "ext_InlineSearch_Panel";
        ext_panel.classList += "resize-drag";
        ext_panel.style.position = "absolute";
        ext_panel.style.zIndex = 2147483647;
        ext_panel.style.top = 0;
        ext_panel.style.left = 0;

        ext_panel.innerHTML =
            `<div class="flexBox1">
                        <div class="flexBox1-1">
                            <div class="inext-dropdown">
                                <button id="inextbtn-drop" class="inext-dropbtn ext-icon-perview">
                                    
                                </button>
                                <div id="inext-Dropdown" class="inext-dropdown-content">
                                    <a id="inext-ch-google" class="inext-ch-engine"><div class="ext-icon intext-google"></div> Google</a>
                                    <a id="inext-ch-wiki" class="inext-ch-engine"><div class="ext-icon intext-wiki"></div> Wikipedia</a>                                    
                                    <a id="inext-ch-bing" class="inext-ch-engine"><div class="ext-icon intext-bing"></div> Bing</a>
                                    <a id="inext-ch-yahoo" class="inext-ch-engine"><div class="ext-icon intext-yahoo"></div> Yahoo</a>
                                </div>
                            </div>
                        </div>
                        <div class="flexBox1-2">
                            <div class="flex-pane">
                                <div class="flexBox1-2-2">
                                    <input type="text" id="inext-search-box" value="${ext_highlightedText}" class="inext-search-text-box ignore-interact-inext"/>
                                </div>
                                <div class="flexBox1-2-3">
                                     <button id="inext-close-options-pane" class="ext-opt-icon intext-settings"></button>
                                    <button id="inext-close-panel-pane" class="ext-opt-icon intext-close"></button>
                                    <div id="inext-close-drag-pane" class="ext-opt-icon intext-drag"></div>    
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="flexBox2 ignore-interact-inext">
                        <div class="inext-search-conetnt" id="inext-search-conetnt"></div>
                    </div>`;

        var calculateOffsetX = window.inlineSeachExt.currentPageWidth - window.inlineSeachExt.extInlineSearchX;
        var calculateOffsetY = window.inlineSeachExt.currentPageHeight - window.inlineSeachExt.extInlineSearchY;
        if(calculateOffsetX <= window.inlineSeachExt.DEFAULT_WIDTH ) window.inlineSeachExt.extInlineSearchX -= (window.inlineSeachExt.DEFAULT_WIDTH - calculateOffsetX);
        if(calculateOffsetY <= window.inlineSeachExt.DEFAULT_HEIGHT ) window.inlineSeachExt.extInlineSearchY -= (window.inlineSeachExt.DEFAULT_HEIGHT - calculateOffsetY);

        if (window.inlineSeachExt.extInlineSearchX < 0) window.inlineSeachExt.extInlineSearchX = 0
		if (window.inlineSeachExt.extInlineSearchY < 0) window.inlineSeachExt.extInlineSearchY = 0

        ext_panel.style.transform = "translate(" + window.inlineSeachExt.extInlineSearchX + "px, " + window.inlineSeachExt.extInlineSearchY + "px)";
        ext_panel.setAttribute('data-x', window.inlineSeachExt.extInlineSearchX);
        ext_panel.setAttribute('data-y', window.inlineSeachExt.extInlineSearchY);
        window.inlineSeachExt.shadow.appendChild(ext_panel);

          
		window.inlineSeachExt.startSearch(window.inlineSeachExt.last_engine);

        window.inlineSeachExt.shadow.getElementById("inextbtn-drop").addEventListener('click', function (event) {
            event.stopPropagation();
            window.inlineSeachExt.shadow.getElementById("inext-Dropdown").classList.toggle("inext-show");
        });

        var engines = window.inlineSeachExt.shadow.querySelectorAll(".inext-ch-engine");
        for(var e = 0; e < engines.length; e++)
        {
            engines[e].addEventListener("click", function(e){
                    window.inlineSeachExt.startSearch(e.target.id);
            });
        }
        
        window.inlineSeachExt.shadow.getElementById("inext-search-box").addEventListener("keyup", function(e){
            if (e.keyCode == 13) {
				window.inlineSeachExt.startSearch(window.inlineSeachExt.last_engine);
            }
        });
        window.inlineSeachExt.shadow.getElementById("inext-close-panel-pane").onclick = window.inlineSeachExt.closeSearch;


        window.inlineSeachExt.shadow.getElementById("inext-close-options-pane").onclick = function () {
            window.open(chrome.runtime.getURL("redirect.html"));
        };

        window.onclick = function (event) {

            if (!event.target.matches('inext-dropbtn')) {
       
                var dropdowns = document.getElementById("inext-shadow-dom-local-scope").shadowRoot.querySelectorAll(".inext-dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('inext-show')) {
                        openDropdown.classList.remove('inext-show');
                    }
                }
            }
        };
        window.inlineSeachExt.panelDragResize();
        window.inlineSeachExt.overlayDisplayed = true;

    } else
    {	
		window.inlineSeachExt.closeSearch()
    }

}

window.inlineSeachExt.createShadowDOM = function(transparency)
{
    var div = document.createElement("div");
    div.style.height = window.inlineSeachExt.currentPageHeight+"px";
    div.style.width = window.inlineSeachExt.currentPageWidth+"px";
    div.id = "inext-shadow-dom-local-scope";
    document.getElementsByTagName("body")[0].appendChild(div);
    var shadow = div.attachShadow({mode: 'open'});
   
    shadow.innerHTML =
    `
        
       <style>
       .inext-ch-engine{font-size: 14px !important;}
       #inext-Dropdown a
       {
            cursor: default;
       }
        
            @font-face {
                font-family: "Segoe UI";
                font-style: normal;
                font-weight: normal;
                src: local("Segoe UI"), url(chrome-extension://__MSG_@@extension_id__/fonts/Segoe-UI.ttf) format("truetype");
            }

            .inext-search-conetnt
            {
                background: #eee !important;
                padding: 7px;
                overflow: hidden;
            }
            #inext-place-holder
            {
                margin-top: 9em;
				display: none
            }

            .res-icon
            {
                border-right: 10px solid transparent;
            }
            .res-icon, .divider
            {
                margin: auto;
            }

            #search-content-iframe-inext
            {
                width: 100%;
                height: 100%;
                margin: 0;
                border-radius: 3px;
                background: transparent;
                overflow: hidden;
				display: none
            }

            #inext-place-holder p
            {
                text-align: center;
                font-family: Segoe UI;
                color: #555;
                font-size: 16px !important;
                font-weight: lighter;
            }

			#main-iframe
			{
				width: 100%;
				height: 100%
			}

            .icon-big
            {
                width: 100px !important;
                height: 100px !important;
                display: table !important;
                margin: 5px auto;
                opacity: .7;               
            }
            
            #ext_inlineSearchOverlay
            {
            
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                height: 100vh !important;
                z-index: 2147483647 !important;
                width: 100vw !important;
                pointer-events: all !important;
                background: rgba(0,0,0, .5) !important;
                opacity: ${1 - transparency / 100}
            }

            #ext_InlineSearch_Panel
            {
                position: absolute !important;
                pointer-events: all !important;
                display: flex !important;
                flex-direction: column !important;
                width: ${window.inlineSeachExt.DEFAULT_WIDTH}px;
                height: ${window.inlineSeachExt.DEFAULT_HEIGHT}px;
                background: transparent !important;
				opacity: ${1 - transparency / 100}
            }

            .flexBox1
            {
                background: transparent !important;
                min-height: 65px !important;
                display: flex !important;
                flex-direction: row !important;
                
            }

            .flexBox1-1
            {
                background: transparent !important;
                min-width: 65px !important;
                display: flex !important;
            }

            .flexBox1-2
            {
                width: 100% !important;
                /* display: flex !important; */
                flex-direction: row !important;
                background: transparent !important;
            }

            .flex-pane
            {
                display: flex !important;
                flex-direction: row !important;
                background: white !important;
                border-radius: 500px !important;
                width: 100% !important;
                margin: auto !important;
                height: 50px !important;
                -webkit-border-radius: 500px !important;
                -moz-border-radius: 500px !important;
                -ms-border-radius: 500px !important;
                -o-border-radius: 500px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24) !important;

            }

            .flexBox1-2-1
            {
                background:transparent !important;
                width: 0% !important;
                display: flex !important;
                margin-left: 12px !important;
            }

            .flexBox1-2-2
            {
                background:transparent !important;
                width: 100% !important;
                margin-left: 12px !important;
                display: flex !important;
            }

            .inext-search-text-box
            {
                width: 100% !important;
                margin: auto !important;
                background: transparent !important;
                /* height: 5px !important;*/
                padding: 0 13px !important;
                margin: 0 !important;
                vertical-align: middle !important;
                color: #444 !important;
                border:0 !important;
                box-shadow: none !important;
                outline: none !important;
                font-size: 12px;
                font-weight: lighter !important;
                font-family: Montserrat, sans-serif !important;


            }

            .flexBox1-2-3
            {
                background: transparent !important;
                min-width: 100px !important;
                display: flex !important;
                padding-right: 12px !important;
				margin-left: auto !important
            }


            .inext-search-conetnt
            {
                margin: auto !important;
                width: 100% !important;
                height: 100% !important;
                border-radius: 3px !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24) !important;
                -webkit-border-radius: 3px !important;
                -moz-border-radius: 3px !important;
                -ms-border-radius: 3px !important;
                -o-border-radius: 3px !important;
            }

            .flexBox2
            {
                background: transparent !important;
                height: 100% !important;
            }

            /* Dropdown Button */
            .inext-dropbtn {
                background-color: white !important;
                width: 54px !important;
                height: 54px !important;
                margin: auto !important;
                vertical-align: middle !important;
                box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24) !important;
                border-radius: 50% !important;
                border: none !important;
                cursor: pointer !important;
                outline: none !important;
                -webkit-border-radius: 50% !important;
                -moz-border-radius: 50% !important;
                -ms-border-radius: 50% !important;
                -o-border-radius: 50% !important;
            }

            /* Dropdown button on hover & focus */
            .inext-dropbtn:hover, .inext-dropbtn:focus:not(:active){
                background-color: #eee !important;
            }

            /* The container <div> - needed to position the dropdown content */
            .inext-dropdown {
                position: relative !important;
                display: inline-block !important;
            }

            /* Dropdown Content (Hidden by Default) */
            .inext-dropdown-content {
                display: none !important;
                border-radius: 3px !important;
                position: absolute !important;
                margin-top: 12px !important;
                background-color: #fff !important;
                min-width: 160px !important;
                box-shadow: 0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23) !important;
                -webkit-border-radius: 3px !important;
                -moz-border-radius: 3px !important;
                -ms-border-radius: 3px !important;
                -o-border-radius: 3px !important;
            }

            /* Links inside the dropdown */
            .inext-dropdown-content a {
                color: black !important;
                padding: 12px 16px !important;
                text-decoration: none !important;
                font-family: "Segoe UI",Arial,sans-serif !important;
                border-radius: 3px !important;
                display: block !important;
                -webkit-border-radius: 3px !important;
                -moz-border-radius: 3px !important;
                -ms-border-radius: 3px !important;
                -o-border-radius: 3px !important;
            }

            /* Change color of dropdown links on hover */
            .inext-dropdown-content a:hover {background-color: #eee !important; color: black !important; text-decoration: none !important;}

            /* Show the dropdown menu (use JS to add this class to the .dropdown-content container when the user clicks on the dropdown button) */
            .inext-show {display:block !important;}

            .ext-icon
            {
                width: 24px !important;
                height: 24px !important;
                display: inline-block !important;
                vertical-align: middle !important;
                margin-right: 10px !important;
            }

            .ext-opt-icon
            {
                width: 18px !important;
                height: 18px !important;
                background-color: white !important;
				background-size: contain;
                outline: none !important;
                border: none !important;
                margin: auto !important;
                opacity: .5 !important;
                transform: ease .6s all !important;
                -webkit-transform: ease .6s all !important;
                -moz-transform: ease .6s all !important;
                -ms-transform: ease .6s all !important;
                -o-transform: ease .6s all !important;
            }

            .ext-opt-icon:hover
            {
                opacity: 1 !important;
            }

            .ext-icon-perview
            {
                background-position: center !important;
				background-size: 70% !important
            }

            .ext-icon.intext-google, .ext-icon-perview.intext-google
            {

                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAACglJREFUeF7lW31wVNUV/537srsk2YWCbEAsiHwYBAJqQsAOQkiAKTq0JSEU0KKl4ge2o4y24xDAdASVomNrW1stTq0UhYQwjpRayO4S5av52IKKKIpMsQFKCIEkhHzse/d0XkJiSDbZ995uPqj7757f75zze/fed+695xG6+MfZEGXvJycIhZNZcgITjSLGUBAGM9hBIBfAtcyoJaILklEqiI+D6DiB/1lXYyscevBgbVeFSV1B/N/ZE2KFdNwtpcwQoDQQXWfVDzMaQCgkIE9w1LaBvoOnrHIFw0VUgLNpkycAvJyAewB2RjJQnYsZkgheSP61e0/JewRwuD4iIsC51MTbpRBPgzGXgIhwhkpMMj4ToDVuX9G2cIQIK9izaZMHMfhZYr6fCCJU0F3yP/NBATw+0FdSZIXfsgBlqcmZIH4FwEArjiOJ0acGCBu1GLliyA7/ZTPcpgU4PTcxxnZZvMrAvWYcdYst4wgUkR6XX/iFUX+mBDifMvnbmqL+DRATjTrobjsGLhLz4jhfyXtGfBsWoGJm4jCVhQ/ASCPEPWXDzBqAHw/ylWwyEoMhAc6kTBmukOqDoJuMkPaUjdnk9ThDCnA2NXEkID4gwpCeSsyIXz15QXSf21u82Yh9s02nApyfM7mvbNAOMGicGdLutrXy5EMKwACVpU3aScCc7k7IjL/GJy/EEren6C0zuJACnEub9AQDL1gh7RBDdBws3wfTfqngK1Kp3KZoFyRssVJqboAGMfF4Yp7FQDIRKZ35Dzf5DteA8tmJY6QqDoPgCFcAZlQS4Q0CveL2Fn1ulO9Cyq3fUqNsmVLyk0R0c1tcJJIPKkDT0E8qINA0o8EGtWPUM2E9aTUb4gqOXrLKpW+nz+1NSgfTehBG6DyNyQM/cvtK3rbK2+EUKEtLmg9QbljEkvYJm7Zs4G7/Z2HxtAKXpYx1shL7IsBLBWNJJJJvNwI4B0rZa4kfEYux1gPn190X+RHy+wPWOTpG6gXZAI//q0hxX/UaVPPtGQ1fOFdfyht5PYA4006YVsX5itaZxvUg4CoBAl5bARjT5eWo81Ubx5zkmqjbjcYmgZcHe4sfM2rfW+xaBKj32ceRxh8TNVWHzKTVbB9+oOHzflNDHXIw8F7cgOFzKTdXr8OvqV+LAAGPTX/nP9E2+vpP+xVefmf4SICC7vv115ywyVvcu/xnrqnMrwTbSoCoY0D7961uJyvtpys3xlegQRnfNkkCP+z2lrx6LSbf8hao8zpGKiyPd5YEa6Re2jqiSD3p+k6LHeNj97TiWykb8poWoCHf9jMivGwkibpDA/Zf3jVsPDH6Efght7fkNSO43mrTOAUaPLY3CLjPaJBamf3f1ZturtA0bdrg3R/VGMX1RrtGAQIeWwmARDMBMrDZPjMQ9rlgytrLUwRpvzPjOzK25PFlOZ8ivfoL9LdVEyHaDDEzHrTPCvzJDCaYbepzl2ZDYle4PKbxjCO+Vc4E4vzoYSqpJ80SaBDxfWbWG97ddcTfYwKAVYfL6aR6j32CAH9oRgAGNNu+gD0Sq3/PCQBIoY2mQH7UVBDtNSUA46x9VmCwGUzvGwF6uSsmk+pT7mIpdppKRvInttlqu6LIFMcV454cASQw5xstABPdbW0KAGX2mYFBVp54W0xPjgAwT6f6fHuCIP7ITDL/L4sgQInf4NcgQCTjmwqhAbYqAmJMjQLCMntaYKMZTO8qhJijHE5XcylcDCDJTDKSsckxK7DEDKZXCQAu9WW5hjYKoHqUPzPE/UaT+TLgPLGsclqljObp+7//brVRXDC7Wc9UjtaE8pNwOAjcn0EPmuFgQsGelc4ZTbtBr+2nxPitEYLc+pv2vFQ5/nYW1I8Jj/h/mPdHI7iutEl7tno+s7mjfP2ixpsV+2ijAHWePiMUaF92FmQDRP1jlVMKDwcGtlyYMOOI/1jCRGRn9+iBSNq6qr8whKnpSOBF3izXltZHYkcBuiWYCKe1mFNLLtxZUQNHQtv/GVjuX5j3h658wp1xz3y+op/UHKVm2/ICoCF7s2LPfC1Avn0DiJ9s68xTP+TAmurE0QxyBwuEIaska7ccWvTu6Z4QIXVdTRbAa036PubLco7RMV8fi3vsY4n5SPOxuMakrqxOPPhB/ZCpuHJU3qETon8448rnFswoUE0GEpZ5yq8uDaYGfEaEfqaImNf6VrlWXyVA42LosXkJSD0v+5QvuTj9ZIV0GD4lIvDG4oXbl5kKJAzj7GwW70dV7yQS3zVLIySP9ax2fdpOANVrn7evPm7Nz6uTr2cm87U+0y9LFm3LNhuQFfvUZy69ANH+HiM0F/t9Wa6WmueqqzG9KpykpX8Ist4Sw8AbtUI8dHRBbkPoYMxbpGRzFOw1GwTjcfPoxkm/xLfS2dJB1q5HKGlrRgYY2yyRXwFJ8AGbUJYVLsg9Gg5PW+ydz1a7bZLeBiHNCi8zn2DVGV+QTS1rVfsmKQYlbZ3nA0SKFSctGOYGEG1wRAfWh1stjvr7HEf/qpiHqS5hvrN0xSiQYuk0ioge8K6Mfb11XkG7xJJyMuNZaocJ1CcsEfRTJ8gqgniTJX7vX5xnqmEiecu8mxlioQQeIGBo46KlOsudpc+dJK2v4QW6abGTJQNGu6bkLqCrLnA7bJNL2pL+OEAvhStAazwDJwDoPYd7malUgXaWWVZAKjbNpvQXqjoAQsRLlrcRRDIRgh67MQst5szygqjapBkECtmlrrfUEIlkX1bsv9rm03GfoD4VcubvAPPdkRQhkly2qmlFfc4tjSdQqDpgvX4JEsx3p42Sk/96T19Vqdvf0ZOIZDJWuShw3emY/6y7qHB00LYeydgDNXZ264Uv5BrQ2mDS5vQRUujDlm6wGmRX41jaa12nVvlFw41Tr/bFpVEBJO7OdpV1FEPIXmEdeNvm9BuFQj5CU5tab/05Ls7dbz+fcRuBYsA4x5Jn7Fnj+qSzeA0JoBMk5mQOI03zgmhUbxVAj0upHX0s5tQvAoiy37vnKWfIGy/DAujkd+Rk3hCQ2jsAmTo+607B9DeNkPhe8eK8Tp98c0ymBNBBY3My7TFSPgfGipC7xO7MXPcl8QHDnuFf/Ha5UdemBWgmnrQ1faaU2ERElqoyowEasWOGKgS/KC8OXO1/6DVTDZqWBdADm/DmvDiHndYxsBQGChIjyZi10fcdilAeLV6Qe9gsVrcPS4Bmh8lb5k3USHmaJP+gu6YFS3mMFJFVsiBvO8j6F6QREaBlWryVMU4KXg7wvQTR18oT6RTDYJD0EYnfFH+asDMSh7ERFaA5+DtyMqMDLO+SGs8X+taVgp8nGhOIA2AUArRdk7z90D3bTXezRKQOMBZsEKum7fU4gjKJgQkgjAbLofriKVn20UcKM+ufx9cSUAHiUsk4QSS+EEIclNF1xf65O0x9DWom1v8Bc0EK2UnurlsAAAAASUVORK5CYII=') !important;
                background-repeat: no-repeat !important;
				background-size: contain
            }

            .ext-icon.intext-wiki, .ext-icon-perview.intext-wiki
            {

                background-image: url('data:image/png;base64,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') !important;
                background-repeat: no-repeat !important;
				background-size: contain
            }

            .ext-icon.intext-bing, .ext-icon-perview.intext-bing
            {

                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAC7VJREFUeF7dW3usFFcd/p1zZnbvvWC1KWpqJcofmhgbaltQ24i0llTllVBE05RSHlakUCIv/2kDt4XYqEkrD1MtlhJALJfX5d6LplZLpUTSB9VoTEzaUNsCrVK4j33NzJlzjjkzc3bOzs7Mzu69tOVuQtjX7O75vu/3/b7zm7kIYm4Lep47aIDRwZDdhd4zfrdz0a1W3PtGw3MobhHTdvcdNQ08vSNnQLtBijlETnAQ++ACPD3awEgEABE0XYIjQAAGBGNyJrQbuJgn5AUhoGu0gJEKgFy8B4KQQPg3DOCB0UFIgRByAnHeRQbwZauMhgDIxftKCJAI7svH8uCxnjJIIWeQF4TLu8xBsu9yKpNEAICAXwIa+/KBUoL8X2iPMQIYY5oSkEHmsvkH5n2z73IwyVQA0tj3wfEBkf8rlci7XLB7Ti68Y9dlC8A3dvccxQRPz8q+rgR5jMvdBS8umrv7sgYAYRx0gfraT2NfvjZqAFD1Hlf7oeQ1X/D8QgDj7PJWwK17evswQjPinF9nv1YJqluMEgAQQjNUCIg6fxr78rVRoQAPAN3dA0erNTzVBUL2JVh8NJSAAiCNfb31VVPjqAEAwCsBr8+nsB+GpdAMR4cCAHwTVCDUhJ3a4KOzL9HiYhR0ARQA0Cz7EgCXi7tfXjxnjwSv8/iplzDmb9tMHDr/b9z1xNJJ9MMUkGKj8Nf39PYZGgC1UbeWfV8hgQYCtHQA7vv9ia1tObIiTzCYGBcB4EUXRK+gYs8j075y4YMGIxEAopeAvgmque8vXpWJvOsHIagqYOmRP07KtXe87L0WbCFzhECeYEow+Zcr2LMM5bb/fOr1r30QYDQEoFn2owDIRS3/w/H/YIw/w7TNk9pESTDaDIObCJ3GmBwrutb+zdO+9uz7BUY8ALt6+wj2TTCu7+vOH2XfD0KhAuTjpb3HtpmmuZwHxaI2WVwC4pmmryMDI2g3DCAIvZvD6DgHt3vw9fYDl9I3EgHAOGiDCVvemtoPUPC8wFtQLQDfP/zMjfn2Ma94AASfJxftdQyZG1SHEaIKBsYY2oj8R4YIFn91GOo1BXr6sW/dfHEk1ZEKQDPsVwGJAUC+tuzo8dNAYEKUfS85ekrwrZSrAYwEwwtVAhACaDMNyGPs5LHxDwbsGUbadjw+bfLp4YKRCYDowCOJfVUaUQXI5+/tPbaVGGSFH6wECJ7Mvio9CQYXUjdqMuUrLEcwdOQMngf8GjHwn8q2vevJWbe91AoYiQAgJMIk2MD5dfaDH1vtAupH3XO478b2/BWvCBRIXpN/GvuqxSqv8DxGghIoxcQYOqQ6DHI2h8Qxznk3P3NFT1bfSAUgGoLCEVkYe1XrC40RwHXZ3a/e+x0vCOm3e/uOnUYET8jCvvxuxn32fa/QDdO/r9TEPTUJaZ6eibabeJBgfNzgqNdA5MDjM6f0J6kjFoApu3p6MYKZ9V2gvu/r7KuOkATA4u4/byE5437d/LKyHxpsaJSeZ/AACME9z5A3+RxCAjoME8aYRoUQdPKCY+87OvfbT0SBSAQAIZjpsxq/5fU+KAg+OvvyfhIA8w/23NCev+IUR6hmoKraoA54s+xLSfimqZJpYKhCgO1yOF+unHv9vjuvaQqAqPlFU18c+/IYxnhsCcj3L+x+7jQxyQTV+qTJxTm/XvvNsq+0YFEG58sWvD1UgjaTnOlfvXB8JgBu3nWk10BoZnTaW838Kew3AmDB/me2GO35+0O2w9ZXzQhcsqlyQljvXkeIqf0o+5RzGLBseGuwCCXqeseMzZvNAUAgKAGtBakaVwMCxYx6XikmTQGyDIzcR06hoAxUPA4X4cMcbX1+mSiw4mvfZQIKDoWzxRK8V7L8zwmcfEzePDPQjAIkAGEX0HZ8Ddj3gk1KCcjD7+rqe4Pk2j6LCK7KX2e/KvlgAX5YSme/7Ljw31IFzhZKcjseWFSoHqmAlgCoa30BKknsZwFg9t4jn8y57mJiGN/DhExEpomAGF7qS2PfywIR56dcwPlSxavzsuv6C48xZ6mAwWYUgFUJ6B+WgX2vDTVQgG5E87oOf4mV+RJkoDnYyF2DcjnZw4J47Le4OPZdwWHIovDmYBH6LbuGcd2clYpbAiAt+OjnDWu6heSQicQukBRI5PNzdnRNdQUsIXkyCxn5j2HTDEoklLL0jJLjwtmhErxTKmtABbKPYV/+vrFtuSYUsPNIL8Yws0ZKGdn35gEun//3H8z7bdpi01676dGu9qs+yu8QQOZjk9wGhmki0wSHMXi3UIE3hwrgsHCPUN+OQ/NT3aajzThTWL04YxvceaS3GoSqM58w+KSxL3/McAHQwbl916FPCMpWFLi4762Kc9WQ7URmFFo6TQhmUgEdOeNMYW2TAKQFn9hhqcrrbHgKqALQ2YlvGH/tsotlZ+NFy7pSRd3YdJpizvKlMc0AcNPO7h6M0KxGwSda+8qB+QgA8NWnDt8yYNHN/6uUJ1LmL13JObyfjf2WAEAIZiUFnzT2gy7QsgdM2X3w6gsVvqm/Yi0sUVdektRwLFdj1lUl1F640bQCJABqoXGbniT2PZZaUYCU+zXXLrtgORsHbPvKeMZVwInr9XoX8ItIj/KtA9CgtuoduHkApNwvWNbm/oozUfZ3/cqURmO5LOx7bVB6wLol2bqA9AAISiBpy1s1ophL6bIqYPKO7vEDduXRok3nWoyjtHSZOJZLcf5qqVIH2gR/vtK58tZo+42dB1QBaIV9f3aV7gGdnXjip774wwGbbipS58ooi7EekzSWCwCIbc2MgbCtc8KlG+CRdU96U5LILRaAL+/s7iFSAQ3QrbZJ7VK6YDt81z+XfndvXNiZvOPQ1H7L3jxgOdcFA6/Y7J7phEzS75OjNKtSBsE28xLaCI+triQFr2QAQHWB+lRVNShtu6m3KMZ4HQDS3S9abGN/2V5kM+67e83x9d8Tr4T61ldlX6rEsQSntEcgvgo2rXujURpNBSCJ4eoP07arynW9JKgDEMj9okU3WYz67l7HXK2DZ2VfB1G4FLhln8KcrnEf+fFfGi1cvR4PwFMHewgifhBK6KtJr+kATNq+/5YBSn9RcNzrqnO/WF9pnX1gDLhVOSdct5P9ZO1v4uo8DYxEADDCfhCK1Hcj9r0v42J5RfDrizZdTDnHibPFRh6jTpmFlyqGZSPlblfKwNwtThEeTqvzlgFotOmpzufUG72LJDkUqFu0qDs2WsPxPTtFZXHO79W5LZhr9xgYr7Y6Vw3r9FiqAhqxH01rcp8uZ3L6JqpV9vUkVwXOdYBb1iks3LXWpnXPZ63zlhSAICiB6MXQ0eAj5+6cw6DlANNnccG3xk6WM4zVao5zGXCn8g6itNPatGZ7s3XeMgCNNj1yQDFkU5Bj6Dp3j7mKvMa14xJk9EoUVeecba0M8odarfNhARC36ZFMF2wKlkxaKWeOWmZfAkodwW17PxCyptK58sxIyD3uM2I9YPKOQ0cQQrP1OlTsyRMNJZt6p6HSzhy1nN1dCsK2X2WuvWak6rxpBSgA9EXYjEHRoSCHE2kJren0poCUanLsc5zSh8oP/2hE63xYAMi2Juvckfm6pi8n7M0b1H6tD/gNnluVsnCdbaUh0Xkp6rwlAATA7BKl3gg66+6sKfaDfs6pfYABXn0p67xpAD6/dc9eSp07GSYgz9jUz+Jq2a+ympV9SqXcXxSAVhXWrzh5qQwuy+fGmqA88NM/+9XnGCcPYhDTMcHjhGGAkIBo5/aTWl+ohMjOTeZ2ap1D1N04uGHlr0eyn2dZbOYuEH2jDwZ+EAkxHQgeBwEYwvvLwfDEaaLzy3N+VqUimLNtcIBveL/rvOkSSDtAguEw8gAGPgMwGieIAUAIiDhlyIuBHEdwah/EmKy++ODyt1tl6lIdl1gCWb7QBwM9IASfjjD+uARDSDCkMuT+3Lb/JgRbNbB+Zeb9eZbvHcn3DAsA/Ydc/dNffsFleL0AuJ0Dd7nL1g2sX/mh/+PJ/wPVYrL1e+ZtIgAAAABJRU5ErkJggg==') !important;
                background-repeat: no-repeat !important;
				background-size: contain
            }

            .ext-icon.intext-yahoo, .ext-icon-perview.intext-yahoo
            {

                background-image: url('data:image/png;base64,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') !important;
                background-repeat: no-repeat !important;
				background-size: contain
            }

            .ext-opt-icon.intext-close
            {
                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAAuJJREFUeF7tmlmqFTEQQM9DUfRH3YAD6goE/RVR0C3oRkRxHnAjugYHED9VEDfguAD1T8UBpKAbmse9SSWpqlzp7t/bN6lzujqVDrXFzK+tmfOzCFgyYOYGlldg5gmwLILaV2AvcBW4CBwCPgKPgPvAj85ZJLFdGWI7DHyaxPY9F5tGgEzwHDi1YrDXwHngW24ip98PAI+BkyvGfwWcAZISNALuDYbXMbwBznWQIPDPgBMJuXeA6yn5GgGSUpL2qStaggZe4v0AHG0V8BvYqUjhKAlaeAlZYt/VKkAsHlEIkFu8JZTASzzvgOOtAm4D15QCPCWUwksst4CbrQL2AC/WrLRRC2MNvFSB08DPVgHy/33A00IJb4fq8KUge1bduh94UjH3WeBrbm5NFRjH6CHBFV7ASgREZ4I7fI2AKAkh8LUCvCWEwbcI8JIQCt8qwFpCOLyFACsJXeCtBLRK+OtZ5y33AbmxanZr8u0gV+qTdvu8pt8bpfuAnISazVJuzOnvsrtU7fC0g1oLqH0dNPGaw1uuAdsBrDPBBd5TgGUmuMF7C7CQ4AofIaBFgjt8lICaTY7EZnWekFxgParAdMJa+HEMdwmeAlrhQyR4CbCCd5fgIcAa3lWCtQAveDcJlgJm/TFU8+THOi+fw72O3ItPhVfV1Bb48dy+5tvBpES2vgIW8KPULhJaBFjCd5NQK8ADvouEGgGe8OESSgVEwIdKKBEQCR8mQSugB3yIBI2A/7VBQlr4pEEi2ceoEXB3aJLUnNzKPabn9pNJa7ba0t5zIxW4RoB0hUoHpubygh/nLpXwHjjWKuAPsENB7w1fI+EXsLtVgCYDouBLJZhkQG4NiIYvkWCyBqSapaUV7UKHPuGphHXN0i+HZunmKiCTiYTLwCXg4NCS/hB4kOvDU6wdrbdImR5jk57mz8AYW7aVX1MFWgPc6P8vAjb68QQEt2RAgOSNnmLJgI1+PAHBzT4D/gErpPJB0BlMIwAAAABJRU5ErkJggg==') !important;
                background-repeat: no-repeat !important;
            }

            .ext-opt-icon.intext-drag
            {
                opacity: .5;
                background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAAAXNSR0IArs4c6QAAA7tJREFUeF7tm7uTDUEUh78Ve1WhPBMKVRICgRKIPEJVXiVCroRefwJFxH9Apqwi9AyRCGzqFXkVSu2SUz81szU7ZqZP9+3uuffu3XBvP87vmzPdfc7pmaKfvw3ATeAAsAR4BpwFPuY2Zyr3hMBO4CGwrjb3V+AQMJPTptwAJP4psLpF5E/gIPAqF4ScAFziS81ZIeQCYBWfHUIOAL7is0JIDSBUfDYIKQEMKj4LhFQAYolPDiEFgC3AS2BN5K3sG7AH+BBz3BQA7gFHYhpZGWsaOB5z7BQA5oBlMY2sjKWxV8QcOwWAWWB5TCMrY2nslTHHTgFAbnq0xcjvHcfgsktXm7vAiWEHsA14AayqGapFTNHfa4eAXcCThkVUYPYCb4cdgOxTuHsF2A8sBR4BF4sV/I9DgLxyc9F/H6D2CqAuA59iitdYKV4Bl40WAK4xov0+ARANpX2giQcY1gA7zgFbWl8BHW+vF6t4uShdAt4EzJ/CA7ZXFl1pegxcAN677LMAUGDTtC39KPJ7vitzbADacZRHbNt2O3OMLgCuqO42cNpFufZ7bAC3gFMdBy9txa0QugC4xGvOL8D6ngHIA7ts6MwxtgGwiJfukOAktgdYgi+dIhs9oQmAVbwAhJzNYwOQDccMXtgIoQ7AR3xogiI2AJ8EzH8QqgB8xSuwCanixAagh7+jKK/Vq01NjrFgTSgB+Ig3eNvQN5mHIADaR1WKstAbemUeBmoH2y0AXQkMj/FGsum0AFi2kZFUZzB6VgB+FUkLQ/uxazInAA+Aw2MnzSbovgBsLBbBtbY+Y9NKFzL+LYK+++g4ECgTtDPVg1DwYcKTSIqDkM85Zl687J4chRueng/NO8DJnj3Aeo4xBUOlFiuEz8VJ0odB7FfAco7xCodLMZY1Qff6NvmoLwodXV1cWap6X1dCZME7X+/smszlCUpHnekZQLKUWPV1aKvVqY431knREoJqddeKS4z6n2p9qtW983z6ah57DdCYW4u0uC5ZlvaVtchOE12vQIA+Z5cUAJyTtjWYAAhGF95x4gEOdlm9MtVkSrNdrVyQUK3uvMcFCWV6y0X3d1GaG5kLEipUPl/MV2S67gkOeklqJO4JLvprcpbgJHQPCalFZj8IWcPTEAghtcjsAHxqdT4QQmuR2QFoQkso7Ss+tBbZC4CYEDrjeR+KTW1THYTKuQb1hKTiZWRqAIN4QnLxuQCEQMgiPicAHwjZxOcGYIGQVXwfADTnov54utwdFC7fqHw+r+8BzvXx+fxfCszusvOdP2wAAAAASUVORK5CYII=') !important;
                background-repeat: no-repeat !important
            }

            .ext-opt-icon.intext-drag:hover
            {
                opacity: .7 !important;
            }

            .ext-opt-icon.intext-settings
            {
                background-image: url('data:image/png;base64,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') !important;
                background-repeat: no-repeat !important;
            }

            * {
            box-sizing: border-box;
          	}
          
			.google-loader {
				height: 50px;
				width: 50px;
				position: relative;
				margin: 47px auto 0 auto;
				display: none
			}

			.google-loader .dot {
				position: absolute;
				height: 100%;
				width: 100%;
				z-index: 1;
				border-radius: 25px;
				background: #df4a42;
				border-right: 0px solid #ffd649;
				border-left: 25px solid #df4a42;
				border-top: 0px solid transparent;
				border-bottom: 0px solid transparent;
				animation: flippingAnimation 2s linear infinite;
			}
          
          @keyframes opacity {
            to {
              opacity: 0;
            }
          }
          @keyframes flippingAnimation {
            /* RED TO YELLOW */
            0% {
              border-right: 0px solid #ffc500;
              display: block;
            }
            12.4% {
              background: #ed726c;
            }
            12.5% {
              border-right: 25px solid #ffd649;
              border-left: 25px solid #df4a42;
              background: #ffe486;
            }
            24.9% {
              border-right: 25px solid #ffd649;
              background: #ffd649;
              border-left: 0px solid #d8291f;
              border-top: 0px solid transparent;
              border-bottom: 0px solid transparent;
            }
            /* Yellow to Green */
            25% {
              border-right: 0px solid #ffd649;
              border-left: 0px solid #d8291f;
              border-top: 25px solid #ffd649;
              border-bottom: 0px solid #ffd649;
              background: #ffd649;
            }
            37.4% {
              background: #ffde6e;
            }
            37.5% {
              border-right: 0px solid transparent;
              border-left: 0px solid transparent;
              border-top: 25px solid #ffd649;
              border-bottom: 25px solid #28ad6b;
              background: #109f58;
            }
            49.9% {
              border-right: 0px solid transparent;
              border-left: 0px solid transparent;
              border-top: 0px solid #ffd649;
              border-bottom: 25px solid #28ad6b;
              background: #28ad6b;
            }
            /* Green to Blue */
            50% {
              border-top: 0px solid transparent;
              border-bottom: 0px solid transparent;
              border-left: 0px solid #377af6;
              border-right: 25px solid #28ad6b;
              background: #28ad6b;
            }
            62.4% {
              background: #2abb71;
            }
            62.5% {
              border-top: 0px solid transparent;
              border-bottom: 0px solid transparent;
              border-left: 25px solid #377af6;
              border-right: 25px solid #28ad6b;
              background: #518af4;
            }
            74.9% {
              border-top: 0px solid transparent;
              border-bottom: 0px solid transparent;
              border-left: 25px solid #377af6;
              border-right: 0px solid #28ad6b;
              background: #377af6;
            }
            /* Blue to Red */
            75% {
              border-top: 0px solid #df4a42;
              border-bottom: 25px solid #377af6;
              border-left: 0px solid transparent;
              border-right: 0px solid transparent;
              background: #377af6;
            }
            87.4% {
              background: #316bd7;
            }
            87.5% {
              border-top: 25px solid #df4a42;
              border-bottom: 25px solid #377af6;
              border-left: 0px solid transparent;
              border-right: 0px solid transparent;
              background: #f26c65;
            }
            100% {
              border-top: 25px solid #df4a42;
              border-bottom: 0px solid #377af6;
              border-left: 0px solid transparent;
              border-right: 0px solid transparent;
              background: #df4a42;
            }
          }
          
    </style>
    `;
    window.inlineSeachExt.shadow = shadow;

};


window.inlineSeachExt.panelDragResize = function () {


       interact(document.getElementById("inext-shadow-dom-local-scope").shadowRoot.querySelector(".resize-drag"))
        .draggable({
            inertia: true,
            ignoreFrom: '.ignore-interact-inext',
            restrict: {
                restriction: "parent",
                endOnly: true,
                elementRect: {
                    top: 0,
                    left: 0,
                    bottom: 1,
                    right: 1
                }
            },
            autoScroll: true,

            onmove: dragMoveListener
        })
        .resizable({
            edges: {
                left: true,
                right: true,
                bottom: true,
                top: true
            },
            restrictEdges: {
                outer: 'parent',
                endOnly: true,
            },
            restrictSize: {
                min: {
                    width: 220
                }
            },
            inertia: true
        })
        .on('resizemove', function (event) {
            var target = event.target,
                x = (parseFloat(target.getAttribute('data-x')) || 0),
                y = (parseFloat(target.getAttribute('data-y')) || 0);

            target.style.width = event.rect.width + 'px';
            target.style.height = event.rect.height + 'px';

            x += event.deltaRect.left;
            y += event.deltaRect.top;

            target.style.webkitTransform = target.style.transform =
                'translate(' + x + 'px,' + y + 'px)';

            target.setAttribute('data-x', x);
            target.setAttribute('data-y', y);
        }).styleCursor(true).pointerEvents({
            ignoreFrom: '[no-pointer-event]',
          });


    function dragMoveListener(event) {
        var target = event.target,
            x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
            y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

        target.style.webkitTransform =
            target.style.transform =
            'translate(' + x + 'px, ' + y + 'px)';

        target.setAttribute('data-x', x);
        target.setAttribute('data-y', y);
    }
   
};

window.inlineSeachExt.startSearch = function(id)

{	
	window.inlineSeachExt.shadow.getElementById("inext-search-conetnt").innerHTML=`
		<div id="inext-place-holder"></div>
		<div id="google-loader" class="google-loader"><div class="dot"></div></div>
		<div id="search-content-iframe-inext">
			<iframe id="main-iframe"></iframe>
		</div>
	`
    switch(id)
    {
        case "inext-ch-google":
			window.inlineSeachExt.shadow.getElementById("inextbtn-drop").className = "inext-dropbtn ext-icon-perview intext-google";
        break;
        case "inext-ch-wiki":
			window.inlineSeachExt.shadow.getElementById("inextbtn-drop").className = "inext-dropbtn ext-icon-perview intext-wiki";
        break;
        case "inext-ch-bing":
			window.inlineSeachExt.shadow.getElementById("inextbtn-drop").className = "inext-dropbtn ext-icon-perview intext-bing";
        break;
        case "inext-ch-yahoo":
			window.inlineSeachExt.shadow.getElementById("inextbtn-drop").className = "inext-dropbtn ext-icon-perview intext-yahoo";
        break;
        default:
            window.inlineSeachExt.shadow.getElementById("inextbtn-drop").className = "inext-dropbtn ext-icon-perview intext-google";
    }

	window.inlineSeachExt.last_engine = id;
	chrome.storage.local.set({n_last_engine: id})
	
	var q = window.inlineSeachExt.shadow.getElementById("inext-search-box").value;

	if(q==null || q==undefined || q=="" || q==" " || q=="  ")
    {
		window.inlineSeachExt.shadow.getElementById("inext-place-holder").style.display = "block"
        window.inlineSeachExt.shadow.getElementById("inext-place-holder").innerHTML = "<p>Enter a keyword to search.</p>";
    } else {
		window.inlineSeachExt.shadow.getElementById("google-loader").style.display = "block"
        switch(window.inlineSeachExt.last_engine)
        {
            case "inext-ch-google":
				var url = `https://www.google.com/search?q=${q}`;
            break;
            case "inext-ch-wiki":
                var url = `https://www.wikipedia.org/search-redirect.php?search=${q}`;
            break;
            case "inext-ch-bing":
                var url = `https://www.bing.com/search?q=${q}`;
            break;
            case "inext-ch-yahoo":
                var url = `https://search.yahoo.com/search?p=${q}`;
            break;
            default:
                var url = `https://www.google.com/search?q=${q}`;
        }
		var browserContent = window.inlineSeachExt.shadow.getElementById("main-iframe");
		browserContent.setAttribute("src", url)
		browserContent.onload = function(){
			window.inlineSeachExt.shadow.getElementById("search-content-iframe-inext").style.display = "block";
			window.inlineSeachExt.shadow.getElementById("google-loader").style.display = "none";
		}

    }
};