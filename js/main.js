(function(){
    'use strict';

    /**
     * Displays logging information on the screen and in the console.
     * @param {string} msg - Message to log.
     */
    function log(msg) {
        var logsEl = document.getElementById('logs');

        if (msg) {
            // Update logs
            console.log('[PlayerHTML5Subtitle]: ', msg);
            logsEl.innerHTML += msg + '<br />';
        } else {
            // Clear logs
            logsEl.innerHTML = '';
        }

        logsEl.scrollTop = logsEl.scrollHeight;
    }

    var video;
    var videoControls;

    var playBtn;
    var stopBtn;
    var pauseBtn;
    var CCBtn;
    var fullscreenBtn;
    var information;
    var catalog;
    var film;

    var isFull = false;
    const DISPLAY_NONE = 'hidden';
    const VISIBLE = 'visible';

    /**
     * Register keys used in this application
     */
    function registerKeys() {
        var usedKeys = [
            'MediaPause',
            'MediaPlay',
            'MediaStop',
            'ColorF0Red'
        ];

        usedKeys.forEach(
            function (keyName) {
                tizen.tvinputdevice.registerKey(keyName);
            }
        );
    }

    /**
     * Handle input from remote
     */
    function registerKeyHandler() {
        document.addEventListener('keydown', function (e) {
            switch (e.keyCode) {
                //key RETURN
                case 10009:
                    log("RETURN");
                    tizen.application.getCurrentApplication().hide();
                    break;

                //key PLAY
                case 415:
                    play();
                    break;

                //key STOP
                case 413:
                    stop();
                    break;

                //key PAUSE
                case 19:
                	pause();
                	break;

                //key Enter
                case 13:
                	changeScreenSize();
                	break;

                default:
                    log("Unhandled key: " + e.keyCode);
                    break;
            }
        });
    }

    /**
     * Display application version
     */
    function displayVersion() {
        var el = document.createElement('div');
        el.id = 'version';
        el.innerHTML = 'ver: ' + tizen.application.getAppInfo().version;
        document.body.appendChild(el);
    }

    /**
     * Init the video player using video / track elements.
     */
    function initVideoPlayer() {
        video = document.getElementById('video');
        videoControls = document.getElementById('video-controls');

        // Set the button elements
        playBtn = document.getElementById('play');
        stopBtn = document.getElementById('stop');
        pauseBtn = document.getElementById('pause');
		CCBtn = document.getElementById('subtitles');
        fullscreenBtn = document.getElementById('fullscreen');

        createSubtitleMenuItem();
        createSubtitleMenu();

        registerMouseEvents();

        video.addEventListener('ended', function () {
            log("Playback finished.");
            init();
        });
    }

    var subtitleMenuButtons = [];
    var selectedIndex = 0;
    var createSubtitleMenuItem = function(id, language, label) {
    	var item = document.createElement('li');
    	var button = item.appendChild(document.createElement('button'));
    	button.id = id;
    	button.className = 'subtitles-button';
    	button.value = label;
    	if (language !== null){
    		button.lang = language;
        }
    	button.setAttribute('data-state', 'inactive');

    	button.appendChild(document.createTextNode(label));
    	button.addEventListener('click', function(e) {
    		// all buttons to inactive
    		subtitleMenuButtons.map(function(v, i, a) {
    			subtitleMenuButtons[i].setAttribute('data-state', 'inactive');
    		});
    		// show OR hide the subtitle.
    		var selectedLang = this.getAttribute('lang');
    		for (var i = 0; i < video.textTracks.length; i++) {
    			if (video.textTracks[i].language === selectedLang) {
    				video.textTracks[i].mode = 'showing';
    				this.setAttribute('data-state', 'active');
                    selectedIndex = i;
    			}
    			else {
    				video.textTracks[i].mode = 'hidden';
    			}
    		}
    		subtitlesMenu.style.display = 'none';
    	});
    	subtitleMenuButtons.push(button);
    	return item;
    }

    var subtitlesMenu;
    function createSubtitleMenu() {
    	if (video.textTracks) {
    		var fragment = document.createDocumentFragment();
            var ul = document.createElement('ul');
    		subtitlesMenu = fragment.appendChild(ul);
    		subtitlesMenu.className = 'subtitles-menu';
    		subtitlesMenu.appendChild(createSubtitleMenuItem('subtitles-off', '', 'Off'));
    		for (var i = 0; i < video.textTracks.length; i++) {
    			subtitlesMenu.appendChild(createSubtitleMenuItem('subtitles-' + video.textTracks[i].language, video.textTracks[i].language, video.textTracks[i].label));
    		}
    		document.body.appendChild(subtitlesMenu);
    	}
    	CCBtn.addEventListener('click', function(e) {
    		if (subtitlesMenu) {
    			subtitlesMenu.style.display = (subtitlesMenu.style.display === 'block' ? 'none' : 'block');
    		}
            if(isFull === true){
                subtitlesMenu.classList.add('fullscreenMode');
            }
            else{
                subtitlesMenu.classList.remove('fullscreenMode');
            }
    	});
    }

    function registerMouseEvents() {
        playBtn.addEventListener('click', function(){
            video.play();
        });
        stopBtn.addEventListener('click', function(){
            video.pause();
            video.currentTime = 0;
        });
        pauseBtn.addEventListener('click', function(){
            video.pause();
        });
        fullscreenBtn.addEventListener('click', function(){
            changeScreenSize();
        });
    }

    function changeScreenSize() {
    	if(isFull === false){
            if(subtitlesMenu.style.display === 'block'){
                subtitlesMenu.classList.add('fullscreenMode');
            }
            video.classList.add('fullscreenMode');
            videoControls.classList.add('fullscreenMode');
            isFull = true;
            fullscreenBtn.innerHTML = "ReturnScreen";
        }
        else{
            if(subtitlesMenu.style.display === 'block'){
                subtitlesMenu.classList.remove('fullscreenMode');
            }
            video.classList.remove('fullscreenMode');
            videoControls.classList.remove('fullscreenMode');
            isFull = false;
            fullscreenBtn.innerHTML = "FullScreen";
        }
    }

    /**
     * Stop the player when application is closed.
     */
    function onUnload() {
    	log('onUnload');
        stop();
    }

    /**
     * Function to init video playback.
     */
    function init() {
        video.load();
    }

    /**
     * Function to start video playback.
     * Create video element if it does not exist yet.
     */
    function play() {
    	video.play();
    }

    /**
     * Function to pause video playback.
     */
    function pause() {
    	video.pause();
    }

    /**
     * Function to stop video playback.
     */
    function stop() {
    	video.pause();
    	video.currentTime = 0;

        init();
    }
    
    function bindEvents() {
        window.addEventListener('keydown', onKeyDownPress);
    }
    
    function initPage() {
    	if(!$('#main-view').hasClass("hidden")){
    		const selectedElement = $('#main-view .focused').attr("data-id");
    		onItemClick(selectedElement);
    	}
    	if(!$('#video-player').hasClass("hidden")){
    		if($('#video-player .catalog-button').hasClass("focused")){
    			onCatalogClick('#video-player');
    		}
    	}
    	if(!$('#information').hasClass("hidden")){
    		if($('#information .play-button').hasClass("focused")){
    			onMovieWatch ();
    			initVideoPlayer();
    			video.play();
    		}
    		if($('#information .catalog-button').hasClass("focused")){
    			onCatalogClick('#information');
    			onUnload();
    			$('#video').remove();
    		}
    	}
    }
    
    function onKeyDownPress(e) {
        if(e.keyCode === 13){
        	const page = initPage();
        }
    }

    /**
     * Start the application once loading is finished
     * voice handler
     */
    window.onload = function () {
        console.log(voiceCommands, 'voiceCommands');
    	if (window.tizen === undefined) {
    		log('This application needs to be run on Tizen device');
    	}
    	
        var client = tizen.voicecontrol.getVoiceControlClient();
        var currentLanguage = client.getCurrentLanguage();

        var commands = voiceCommands;

        client.setCommandList(commands, "FOREGROUND");

        var resultListenerCallback = function(event, list, result)
        {
          for(var i=0; i< items.length; i++){
        	  if("Catalog" === result || "List" === result) {
        		  if(!$('#video-player').hasClass("hidden")){
        			  onCatalogClick('#video-player');
        		  } else {
        			  if(!$('#information').hasClass("hidden")){ 
        				  onCatalogClick('#information');
        			  }
        		  }
        	  }
        	  
        	  if(items[i].title === result) {
        		  onItemClick(i);
        	  } 
        	  
        	  if(((items[i].title + ' play') === result) || (('Play ' + items[i].title) === result)) {
        		  onItemClick(i);
        		  onMovieWatch();
        		  initVideoPlayer();
      			  video.play();
        	  }
          }
        }

        var id = client.addResultListener(resultListenerCallback);
    	
    	document.addEventListener('tizenhwkey', function(e) {
            if(e.keyName == "back")
	    	try {
	    	    tizen.application.getCurrentApplication().exit();
	    	} catch (ignore) {}
        });
    	bindEvents();

        displayVersion();
        registerKeys();
        registerKeyHandler();
        
        document.body.addEventListener('unload', onUnload);
    };
})();