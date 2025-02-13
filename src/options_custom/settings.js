/**
 * settings.js
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

    //get the saved settings
    function getSaved()
    {
        chrome.storage.local.get(['n_inCtrl', 'n_overlay', 'n_last_engine', 'n_transparency'], function(result) {

            // if firsttime and it as options has not been set
            if(result.n_inCtrl == undefined && result.n_overlay == undefined && result.n_last_engine == undefined && result.n_transparency == undefined)
                chrome.storage.local.set({n_inCtrl: 'B', n_overlay : 1, n_last_engine: 'inext-ch-google', n_transparency: 0});

            // set the values 
            document.getElementById('inCtrl').value = result.n_inCtrl || 'B';
            document.getElementById('inOverlay').value = result.n_overlay || 1;
            document.getElementById('inTransparency').value = result.n_transparency || 0;
            document.getElementById('transparencyPercentage').textContent= document.getElementById('inTransparency').value + '%';
          });
    }

    getSaved();

    document.getElementById('inTransparency').addEventListener("input", function(){
        document.getElementById('transparencyPercentage').textContent= this.value + '%'
    })


    function save()
    {
        var inCtrl = document.getElementById('inCtrl').value;
        var inOverlay = document.getElementById('inOverlay').value;
        var inTransparency = document.getElementById('inTransparency').value;

        chrome.storage.local.set({n_inCtrl: inCtrl, n_overlay: inOverlay, n_transparency: inTransparency}, function() {
            successAlert("Settings saved!");
        });
    }   


    function successAlert(msg)
    {
        document.getElementById('success').style.display = "block";
        document.getElementById('success').style.opacity = "1";
        document.getElementById('s_msg').innerText = msg;
    }

    function errorAlert(msg)
    {
        document.getElementById('error').style.display = "block";
        document.getElementById('error').style.opacity = "1";
        document.getElementById('e_msg').innerText = msg;
    }

    
    function restore()
    {
        document.getElementById('inCtrl').value =  "B";
        document.getElementById('inOverlay').value = 1;
        document.getElementById('inTransparency').value = 0;
        chrome.storage.local.set({n_inCtrl: "B", n_overlay: 1, n_transparency: 0}, function() {
            successAlert("Default setting restored!");
        });
    }

 
    document.getElementById('save').addEventListener('click', save);
    document.getElementById('restore').addEventListener('click', restore);


                    // Get all elements with class="closebtn"
                    var close = document.getElementsByClassName("closebtn");
                    var i;
                    
                    // Loop through all close buttons
                    for (i = 0; i < close.length; i++) {
                        // When someone clicks on a close button
                        close[i].onclick = function(){
                    
                            // Get the parent of <span class="closebtn"> (<div class="alert">)
                            var div = this.parentElement;
                    
                            // Set the opacity of div to 0 (transparent)
                            div.style.opacity = "0";
                    
                            // Hide the div after 600ms (the same amount of milliseconds it takes to fade out)
                            setTimeout(function(){ div.style.display = "none"; }, 600);
                        }
                    }
});


