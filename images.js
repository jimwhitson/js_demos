var files_demo = {};
files_demo.fileMenuOptions = (function() {
  var newOption = {};
  var options = [];
  newOption.name = 'Remove';
  newOption.action = function() {
    $(this).remove();
  };
  options.push(newOption);
  
  newOption = {};
  newOption.name = 'Up';
  newOption.action = function() {
    $(this).css('z-index', '2');
  };
  options.push(newOption);

  newOption = {};
  newOption.name = 'Down';
  newOption.action = function() {
    $(this).css('z-index', '1');
  };
  options.push(newOption);

  return options; 
})();


files_demo.contextMenu = function(x, y, t) {
  var menuWrapper = $('<div class="file-context-menu">');
  var closeButton = $('<span>');
  var contentDiv = $('<div>');
  var options = files_demo.fileMenuOptions;
  $('.file-context-menu').remove();
  contentDiv.
    html($(t).find('img').attr('title'));
  menuWrapper.
    addClass('context-menu-wrapper').
    css('position', 'absolute').
    css('top', y).
    css('left', x).
    css('z-index', '10').
    click(function(e) {
      e.stopPropagation();
      e.preventDefault();
    });
  closeButton.
    text('X').
    css('background-color', '#FFFFFF').
    css('opacity', '1').
    css('display', 'inline').
    css('position', 'relative').
    click(function() {
      menuWrapper.remove();
    });
  for(var i = 0; i < options.length; i++) {
    var optionDiv = $('<div>').text(options[i].name);
    optionDiv.click((function (f) {
      return function(e) {
        f.call($(t), e);
        menuWrapper.remove();
      }
    })(options[i].action));
    optionDiv.addClass('context-menu-option');
    contentDiv.append(optionDiv);
  }
  menuWrapper.append(contentDiv);
  $('#list').append(menuWrapper);
};
files_demo.handleFileSelect = function(e) {
  var files = e.originalEvent.dataTransfer.files; 
  e.stopPropagation();
  e.preventDefault();
  for (var i = 0, f; f = files[i]; i++) {
    if (!f.type.match('image.*')) {
      continue;
    }
    var reader = new FileReader();
    reader.onload = (function(theFile, parentEvent) {
      return function(e) {
        var x = parentEvent.originalEvent.pageX;
        var y = parentEvent.originalEvent.pageY;
        var imgxxx = ['<div class="img-wrapper"><img class="thumb" src="', e.target.result,
                        '" title="', escape(theFile.name), '"/></div>'].join('');
        var imgWrapper = $('<div>').addClass('img-wrapper');
        var img = $('<img>').load(function() {
          img.addClass('thumb');
          imgWrapper.append(img);
          $('#list').append(imgWrapper);
          $('div.img-wrapper:last').draggable({containment: $('div#list')}).css('border-width', '0');
          $('img.thumb:last').
            resizable({containment: $('div#list'), autoHide: true, handles: 'se', aspectRatio: true}).
            css('border-width', '0');
          $('div.img-wrapper:last').
            css('z-index', '1').
            css('position', 'absolute').
            css('width', $('img.thumb:last').css('width')).
            css('height', $('img.thumb:last').css('height')).
            css('top', y - $('img.thumb:last').height()/2).
            css('left', x - $('img.thumb:last').width()/2);
          $('div.img-wrapper:last').click(function(e) {
            e.stopPropagation();
            e.preventDefault();
            files_demo.contextMenu(e.pageX, e.pageY, $(this));
          });
        });
        img.attr('src', e.target.result);
      };
    })(f, e);
    reader.readAsDataURL(f);
  }
};

$(document).ready(function() {
  $('#list').bind('dragover', function(e) {
    e.stopPropagation();
    e.preventDefault();
    e.originalEvent.dataTransfer.dropEffect = 'copy';
  });
  $('#list').bind('drop', files_demo.handleFileSelect);
  $('#list').click(function() {
    $('.file-context-menu').remove();
  });
});

