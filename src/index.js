import React from 'react';
import PeopleSearch from './views/PeopleSearch/PeopleSearch.jsx';

var Goldfish = {
    options : {
      //The default title (overridable with options)
      title: 'Goldfish'
    },

    interval : null,

    LoadStyleSheet: function (href, type) {
       //setup the google materials fonts for the UI
       var sheet = document.createElement('link');

       sheet.setAttribute('href', href);
       sheet.setAttribute('rel','stylesheet');

       sheet.onreadystatechange = function () {
          if (this.readyState == 'complete') {
              Goldfish.Ready();
          }
       };

       //Handle better browsers
       sheet.onload = function () {
          Goldfish.Ready();
       };

       document.getElementsByTagName("head")[0].appendChild(sheet);
    },
    HouseKeeping: function () {
      //minimal download strategy page click house keeping
      window.onhashchange = function() {
           if (location.hash.charAt(1) === '/') {
                var child = document.getElementById('component-holder'); 
                //After the MDS has finished loading the page, we need to clear down Goldfish if it's open
                if (child !== null) {              
                    document.body.removeChild(child);
                }
           } 
      }

      if (typeof window.houseKeeping === 'undefined') {
           //we need to clear up if this is the first visit
          Object.keys(localStorage).forEach(
            function(item, i) { 
                if (item.indexOf('PeopleSearch-Results') > -1) { 
                  localStorage.removeItem(item); 
                } 
          });

          window.houseKeeping = true;
      }      
    },
    KeyPressListener: function () {
      document.addEventListener("keydown", function(e){ 

         window.keyWatcher = window.keyWatcher || null;

         if (window.keyWatcher === null && e.keyCode === 18) {
             window.keyWatcher = e.keyCode;
         } else {
            if (window.keyWatcher === 18 && e.keyCode === 71) {
                var component = document.getElementById('component-holder');

                if (component === null) {
                    Goldfish.Create();
                } else {
                  //destroy
                  if (component !== null) {
                    React.unmountComponentAtNode(component);

                    document.body.removeChild(component);                    
                  }
                }
            
            window.keyWatcher = null;
            }
         }   
      });
    },
    DisableDragAndDrop: function () {
      //if we are on a page with drag and drop controls we need to temporarily disable them
      window.ExecuteOrDelayUntilScriptLoaded(function() {
          if (typeof window.DUCBindDragDrop !== 'undefined') {
            window.removeListener(document.body, 'dragenter', window.dropElementDragEnter);       
            window.removeListener(document.body, 'dragover', null);
            window.removeListener(document.body, 'dragleave', window.dropElementDragLeave);
            window.removeListener(document.body, 'drop', window.dropElementDrop);
          }
      },'dragdrop.js');
    },
    Ready: function() {
      if (typeof Sys != "undefined" && Sys && Sys.Application) { 
        Sys.Application.notifyScriptLoaded(); 
      }

      if (typeof SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs =="function") { 
        //inform the create function that Goldfish can now load safely
        SP.SOD.notifyScriptLoadedAndExecuteWaitingJobs("goldfish.min.js"); 
      }

      Goldfish.KeyPressListener();
    },
    GetjQueryStatus : function () {
        return typeof jQuery !== "undefined";
    },
    GetjQuery : function () {
      var jQueryFetch = document.createElement("script");

      jQueryFetch.setAttribute("type","text/javascript");
      jQueryFetch.setAttribute("src", "https://code.jquery.com/jquery-1.11.3.min.js");

      //Handle IE
      jQueryFetch.onreadystatechange = function ( ) {
        if (this.readyState == "complete") {
          Goldfish.Swim();
        }
      };
      //Handle better browsers
      jQueryFetch.onload = function ( ) {
          Goldfish.Swim();
      };

      document.getElementsByTagName("head")[0].appendChild(jQueryFetch);
    },
    Swim : function () {
       if (!Goldfish.GetjQueryStatus()) {
          Goldfish.GetjQuery();
  
          return false;
          //check that jQuery has fully loaded...          
       }
       //setup the google materials font and animate css for the UI
       Goldfish.LoadStyleSheet('https://fonts.googleapis.com/icon?family=Material+Icons', 'fonts');
    },
    Create : function (options) {
         //if options are provided do a cursory check and save them if they are valid
         if (typeof options !== 'undefined') {
           if (this.ObjectPayloadCheck(options)) {
              Goldfish.options = options;
           } else {
              console.log('Goldfish.Swim - options ignored (invalid format)');
           }
         }

         //due to the global way drag and drop is invoked on document libraries, we need to disable this whilst our component is active
         Goldfish.DisableDragAndDrop();

         //we need to clear up if this is the first visit
         Goldfish.HouseKeeping();
         
         /*
         everything looks good...
            lets setup the container and component elements
         */
         var holder = document.createElement('div');

         holder.id = 'component-holder';
         holder.style.width = '400px';

         document.getElementsByTagName("body")[0].appendChild(holder);

         //When we close the People Search component, we trash it. Recreate if it is opened again
         window.ExecuteOrDelayUntilScriptLoaded(() => {
            React.render(
                  <PeopleSearch options={Goldfish.options} />,
                  document.getElementById('component-holder'),
                  function () {
                      //callback function to apply any override theme CSS
                      Goldfish.OverrideThemeColours();
                      //Goldfish.SetDefaultFocus();
                  }
            );
         }, 'goldfish.min.js');
    },
    SetDefaultFocus: function () {
      jQuery('#component input[type=text]')[0].focus();
    },
    OverrideThemeColours : function () {
        if (typeof jQuery !== 'undefined') {

            if (document.getElementById('component') !== null) {
              if (Goldfish.interval !== null) {
                  window.clearInterval(Goldfish.interval);
              }
              
              var head = document.head || document.getElementsByTagName('head')[0];
              var colour = jQuery('#O365_NavHeader').css('backgroundColor');

              var overrides = document.createElement('style');
              overrides.type = 'text/css';

              var css = '#outer-space { position: absolute; z-index: 2000; top: 85px; display: block; right: 0; height: 100%; width: 470px; overflow-y: scroll; } #outer-space::-webkit-scrollbar { background: #eeeeee } #outer-space::-webkit-scrollbar-thumb { background: #cccccc } #outer-space div.sortable-container div.sortable-item div:hover, #outer-space div.sortable-container div.sortable-item:hover { background-color: ' + colour + '; } #outer-space .highlight { color:' + colour + ' !important; } #outer-space span.commandor input[type=button], #outer-space span.commandor button { background-color: #666666 !important; } #outer-space input[type=text]:focus, #outer-space input[type=text]:hover { border-color: ' + colour + ' !important; } #outer-space button, #outer-space input[type=button] { background-color: ' + colour + ' !important; } #outer-space div.nocolour button, #outer-space div.nocolour input[type=button] { background-color: #f4f4f4 !important; } #outer-space div.remove button, #outer-space div.remove input[type=button] { background-color: #666666 !important; } div.switches-with-broomsticks label span[role=switch] { background-color: ' + colour + ' !important; } div.switches-with-broomsticks label span span[role=thumb] { background-color: ' + colour + ' !important; }';

              if (overrides.styleSheet) {
                  overrides.styleSheet.cssText = css;
              } else {
                  overrides.appendChild(document.createTextNode(css));
              }

              head.appendChild(overrides);
            } else {
              //IE safe guard for late rendering
              Goldfish.interval = Goldfish.interval || window.setInterval(function( ) { 
                                      Goldfish.OverrideThemeColours();
                                  }, 1000);
            }
        }
    },
    ObjectPayloadCheck : function (options) {
      var safe = ['css','suggest','settings','layout'];

      var valid = Object.keys(options).some(function(item, i) {
          return safe.indexOf(item) > -1;
      });

      return valid;
    }
};

//fetches and prepares everything
Goldfish.Swim();

window.Goldfish = window.Goldfish || Goldfish;

/*
	You can load Goldfish with or without options (options are shown in the readme.md file)

  Goldfish.Create();
  Goldfish.Create(options);
*/