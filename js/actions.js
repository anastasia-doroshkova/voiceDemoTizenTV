function onItemClick (index) {	
	$('#main-view').addClass("hidden");
	$('#information').removeClass("hidden");
	$('#information-title').text(items[index].title);
	$("#information-item-img").attr("src",items[index].img);
	$('#information-description').text(items[index].description);
	$('#item-index').text(index);
}

function onCatalogClick (element) {
	if(element === '#video-player'){
		$('#video').remove();
	}
	$('#main-view').removeClass("hidden");
	$(element).addClass("hidden");
}

function onMovieWatch () {
	$('#video-player').removeClass("hidden");
	const index = $('#item-index').text();
	$('#video-title').text(items[index].title);
	$("#video-container").append('<video id="video" preload="metadata" height="600px" width="1376px"><source id="video-source" class="active" type="video/mp4" src="' + items[index].source + '"></video>');
	$('#video-player').removeClass("hidden");
	$('#information').addClass("hidden");
}

$(document).ready(function(){
	$('#list1').caphList({
		items : items,
		template: '<div class="item" data-id="<%= index %>" onclick="onItemClick(<%= index %>)" focusable data-focusable-initial-focus="<%=(index===0)?true:false%>"><a class="item-link" href="#"><h2 class="item-title"><%= item.title %></h2><img class="item-img" src=<%= item.img %>></a><p class="description"><%= item.description %></p></div>',
		containerClass : 'list'
	});
    console.log(voiceCommands, 'voiceCommands');
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
});