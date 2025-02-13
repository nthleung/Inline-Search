/**
 * popup.js
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

document.addEventListener('DOMContentLoaded', function() {


    document.getElementById("op").addEventListener("click", function(){
        chrome.runtime.openOptionsPage();
    });


    document.getElementById("rm").addEventListener("click", function(){
        chrome.tabs.create({ 'url': 'chrome://extensions/' });
    });
    
    document.getElementById("au").addEventListener("click", function(){
        chrome.tabs.create({ 'url': 'http://github.com/nthleung' });
    });

    document.getElementById("oau").addEventListener("click", function(){
        chrome.tabs.create({ 'url': 'http://github.com/ahkohd' });
    });

    document.getElementById("icon").addEventListener("click", function(){
        chrome.tabs.create({ 'url': 'https://www.iconfinder.com/iconsets/website-design-4'});
    });


    document.getElementById("ab").addEventListener("click", function(){
        document.getElementById("well1").style.display = "none";
        document.getElementById("well2").style.display = "block";
        document.getElementById("well2").style.opacity = 1;
    });


    document.getElementById("cb").addEventListener("click", function(){
        document.getElementById("well1").style.display = "block";
        document.getElementById("well2").style.display = "none";
        document.getElementById("well2").style.opacity = 0;


    });

});