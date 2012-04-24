(function() {
var makeHelpBox = function(id, helpHTML, $target) {
  var hb = {};
  hb.id = id;
  var pos = $target.position();
  var gap;

  hb.$box = $("<div>").
    addClass('no-select').
    addClass('help-box').
    addClass('clickable').
    css('position', 'absolute');
  var helpText = $("<div>").attr('id', hb.id).
    addClass('no-select').
    html(helpHTML);
  hb.$box.append(helpText);
  hb.$text = helpText;
  $target.append(hb.$box);
  gap = ($target.width() - hb.$box.width())/2;
  var margin = parseInt($target.css('margin-top').replace(/px/, ''));
  hb.$box.css('top', pos.top).css('left', pos.left + gap);
  var helpHeight;
  var openHelp = function() {
    hb.$box.unbind();
    hb.$box.animate({height: helpHeight}, 'slow', function() {
        hb.$text.css('visibility', 'visible');
        hb.$box.css('height', 'auto');
        hb.$box.click(closeHelp);
    });
    
  };
  var closeHelp = function(e) {
    helpHeight = hb.$box.height();
    hb.$box.unbind();
    hb.$box.animate({height: '0'}, 'slow', function() { 
        hb.$text.css('visibility', 'hidden');
        hb.$box.click(openHelp);
    });
    if(window.localStorage) {
      window.localStorage.setItem(hb.id, "closed");
    }
  };
  if(window.localStorage) {
    var closed = window.localStorage.getItem(hb.id);
    if(closed === "closed") {
      closeHelp();
      hb.$box.click(openHelp);
    } else { 
      hb.$box.click(closeHelp);
    }
  } else {
    hb.$box.click(closeHelp);
  }
  return hb;
};
var makeFilesDemo = function() {
  var filesDemo = {};
  filesDemo.id = 'images';
  filesDemo.labelText = 'Montage';
  filesDemo.description = 'Drag images in from the desktop and arrange them in the browser (<a href="https://www.google.com/chrome">Chrome</a> and <a href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a> only).';

  filesDemo.fileMenuOptions = (function() {
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


  filesDemo.contextMenu = function(x, y, t) {
    var menuWrapper = $('<div class="file-context-menu">');
    var closeButton = $('<span>');
    var contentDiv = $('<div>');
    var options = filesDemo.fileMenuOptions;
    $('.file-context-menu').remove();
    contentDiv.
      html($(t).find('img').attr('title'));
    menuWrapper.
      addClass('context-menu-wrapper').
      css('position', 'absolute').
      css('top', y).
      css('left', x).
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
    var optionWrapper = $('<div>').attr('id', 'option-wrapper');
    for(var i = 0; i < options.length; i++) {
      var optionDiv = $('<span>').text(options[i].name);
      optionDiv.click((function (f) {
        return function(e) {
          f.call($(t), e);
          menuWrapper.remove();
        }
      })(options[i].action));
      optionDiv.addClass('context-menu-option');
      optionWrapper.append(optionDiv);
    }
    contentDiv.append(optionWrapper);
    menuWrapper.append(contentDiv);
    $('#list').append(menuWrapper);
  };

  filesDemo.handleFileSelect = function(e) {
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
          var imgWrapper = $('<div>').addClass('img-wrapper');
          var img = $('<img>').load(function() {
            img.addClass('thumb');
            img.attr('title', theFile.name);
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
              filesDemo.contextMenu(e.pageX, e.pageY, $(this));
            });
          });
          img.attr('src', e.target.result);
        };
      })(f, e);
      reader.readAsDataURL(f);
    }
  };

  filesDemo.go = function(targetName, state) {
    var filesDemoTarget = $('<div>').
      attr('id', 'list');
    var tmpText = 'Use transparent PNGs for the best effect (<a href="http://freevintagedigistamps.blogspot.co.uk" target="_blank">these</a> are excellent).';
    var helpText=  'Drag images into the box from your computer, then drag and drop within the box to arrange them. '+
          tmpText+' Drag the lower right-hand corner of an image to resize or click an image for a menu.<br>(<a href="https://www.google.com/chrome">Chrome</a> and <a href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a> only)'+
          '<br><br>Click anywhere in this box to dismiss it.';
    var help = makeHelpBox('files-demo-help', helpText, $(targetName));
    $(targetName).append(filesDemoTarget);
    $('#list').bind('dragover', function(e) {
      e.stopPropagation();
      e.preventDefault();
      e.originalEvent.dataTransfer.dropEffect = 'copy';
    });
    $('#list').bind('drop', filesDemo.handleFileSelect);
    $('#list').click(function() {
      $('.file-context-menu').remove();
    });
  };

  filesDemo.destroy = function(targetName) {
    $('#list').find().unbind();
    $('#list').remove();
  };

  return filesDemo;
};

var makeAjaxDemo = function(baseURL) {
  var ajaxDemo = {};
  ajaxDemo.id = 'ajax';
  ajaxDemo.labelText = "AJAX";
  ajaxDemo.description = "Smooth, uninterrupted browsing.";
  ajaxDemo.loadSection = (function() {
    var cache = {};
    return function (number) {
      if(cache[number]) {
        $('#category-content').html(cache[number].replace(/\n/, '<br>'));
      } else {
        $.get('/api/categories/'+number+'/').done(function(d) {
          cache[number] = d;
          $('#category-content').html(d.replace(/\n/, '<br>'));
        });
      }
    };
  })();
  var updateHistory = function(number) {
    if(history.pushState) {
      history.pushState({section: ajaxDemo.id, part: number}, "", baseURL+ajaxDemo.id+"/"+number+'/');
    }
  };
  ajaxDemo.go = function(targetName, state) {
    var $target = $(targetName);
    var attrib = '<h5>Courtesy of <a href="http://www.gutenberg.org/">Project Gutenberg</a></h5><hr>';
    var $title = $('<h3>').text('Aristotle\'s Categories').append(attrib);
    var $sections = $('<div>').attr('id', 'section-list').text("Parts: ");
    for(var i = 1; i < 16; i++) {
      $sections.append($('<span>').
          attr('id', 'section-'+i).
          addClass('section-numbers').
          addClass('clickable').
          text(i).
          click((function() {
            var number = i;
            return function() {
              ajaxDemo.loadSection(number);
              updateHistory(number);
            };
          })()));
    }
    $target.append($title);
    $target.append($sections);
    $target.append($('<div>').attr('id', 'category-content'));
    if(state && state.part) {
      ajaxDemo.loadSection(state.part);
    } else {
      var re = new RegExp(baseURL+ajaxDemo.id+'\/(\\d*)\/');
      var loc = window.location;
      if(window.location.pathname.match(re)) {
        var m = window.location.pathname.match(re);
        ajaxDemo.loadSection(m[1]);
      }
    }

    var help = makeHelpBox('files-demo-text', "Each section is fetched from the server on demand "+
        " so the user doesn't experience a jarring page load while browsing. The text is cached in the browser"+
        " as the sections are fetched, so"+
        " unnecessary data transfer is avoided. <br><br>Click anywhere in this box to dismiss it.", $(targetName));
  };
  ajaxDemo.destroy = function(targetName) {
  };
  return ajaxDemo;
};

var makeAnimationDemo = function() {
  var animationDemo = {};
  var rgbToHex = function(rgbString) {
    if(rgbString.match(/^#/)) {
      return rgbString.replace(/#/, '').toUpperCase();
    }
    var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    parts.splice(0, 1);
    for (var i = 0; i < 3; i++) {
        parts[i] = parseInt(parts[i]).toString(16);
        if (parts[i].length == 1) parts[i] = '0' + parts[i];
    } 
    return parts.join('').toUpperCase(); 
  };
  animationDemo.id = 'tiles';
  animationDemo.labelText = "Tiles";
  animationDemo.description = "Drag-and-drop interface with animation.";
  animationDemo.boxWidth = 40;
  animationDemo.boxHeight = 40;
  animationDemo.duration = 800;
  animationDemo.displacement = 10;
  animationDemo.colours = ['CF4D3F', 'FF9900', 'FCFC06', '92CC47', '092E20', '00A3E6', '1A2A59', '662678'];
  var timers = [];
  animationDemo.go = function(targetName, state) {
    var $target = $(targetName);
    var maxOffset = $target.width() - animationDemo.boxWidth;
    var helpText = "Drag and drop the coloured tiles to swap them. Press the button to animate the colours; press again to stop. <br><br>Click anywhere in this box to dismiss it.";
    var help = makeHelpBox('animation-demo-help', helpText, $target);
    var colouredDivs = [];
    for(var i = 0; i < animationDemo.colours.length; i++) {
      var $tmpDiv = $('<div>').
        attr('id', animationDemo.colours[i]).
        css('width', animationDemo.boxWidth).
        css('height', animationDemo.boxHeight).
        css('position', 'relative').
        css('background', '#'+animationDemo.colours[i]);
      $target.append($tmpDiv);
      colouredDivs.push($tmpDiv);
    }
    var slideRight = function() {
      for(var i = 0; i < colouredDivs.length; i++) {
        var displacement = animationDemo.displacement * i;
        colouredDivs[i].delay(displacement).animate({left: maxOffset}, animationDemo.duration);
      }
    };
    var slideLeft = function() {
      for(var i = 0; i < colouredDivs.length; i++) {
        var displacement = animationDemo.displacement * i;
        colouredDivs[i].delay(displacement).animate({left: 0}, animationDemo.duration);
      }
    };
    var slideCentre = function() {
      for(var i = 0; i < colouredDivs.length; i++) {
        var displacement = animationDemo.displacement * i;
        colouredDivs[i].delay(displacement).animate({left: maxOffset/2}, animationDemo.duration);
      }
    };
    var expand = function() {
      var width = Math.floor($target.width() / (animationDemo.boxWidth + 1)) * (animationDemo.boxWidth + 1);
      for(var i = 0; i < colouredDivs.length; i++) {
        var displacement = animationDemo.displacement * i;
        colouredDivs[i].delay(displacement).animate({width: width, left: 0}, animationDemo.duration);

      }
    };

    function divideAll($container, targets) {
      var divideOne = function($parentDiv) {
        var colour = $parentDiv.css('background-color');
        var height = $parentDiv.height();
        var divisions = Math.floor(($parentDiv.width())/(height + 1));
        for(var i = 0; i < divisions; i++) {
          var tmpId = [$parentDiv.attr('id'), i].join('');
          var tmpDiv = $('<span>').attr('id', tmpId).
            html('&nbsp;').
            css('float', 'left').
            css('height', height).
            css('width', height).
            css('background-color', colour).
            addClass('division').
            addClass(rgbToHex(colour)).
            draggable({
              start: function() {
                $(this).css('z-index', '2');
                },
              stop: function() {
                $(this).css('z-index', '0');
                $(this).css('left', 'auto').css('top', 'auto');
              },
              containment: $container}).droppable({
              accept: '.division',
              drop: function(e, ui) {
                var movingColour = ui.draggable.css('background-color');
                var stillColour = $(this).css('background-color');
                $(this).css('background-color', movingColour);
                $(this).removeClass(rgbToHex(stillColour));
                $(this).addClass(rgbToHex(movingColour));
                ui.draggable.css('background-color', stillColour);
                ui.draggable.removeClass(rgbToHex(movingColour));
                ui.draggable.addClass(rgbToHex(stillColour));
                ui.draggable.css('left', 'auto').css('top', 'auto');
              }});
          $parentDiv.append(tmpDiv);
        }
        var cnt = $parentDiv.contents();
        $parentDiv.replaceWith(cnt);
      };
      for(var i = 0; i < targets.length; i++) {
        divideOne(targets[i]);
      }
      $container.append($('<div>').addClass('clearfix'));
      var tileLabelWrapper = $('<div>').attr('id', 'tile-label-wrapper').hide();
      tileLabelWrapper.append($('<span>').attr('id', 'tile-label').
          addClass('context-menu-option').
          addClass('clickable').
          click(startDisco).
          text("Animate").css('position', 'relative'));
      $container.prepend(tileLabelWrapper);
      $('#tile-label-wrapper').slideDown('slow').addClass('no-select');
    }

    var disco = function(colours) {
      for(var i = 0; i < colours.length; i++) {
        var newColour = colours[(i + 1) % colours.length];
        $('.'+colours[i]).css('background-color', '#'+newColour).removeClass(colours[i]);
      }
      $('.division').each(function() {
          $(this).addClass(rgbToHex($(this).css('background-color')));
      });

    };

    $target.
      css('text-align', 'left').
      addClass('no-select');
    slideRight();
    var totalTime = (animationDemo.duration + ((colouredDivs.length - 1) * animationDemo.displacement));
    timers.push(setTimeout(expand, totalTime));
    timers.push(setTimeout(function() {
          divideAll($target, colouredDivs);
      }, totalTime*2.5));

    var discoInt; 
    var stopDisco = function() {
      $(this).unbind();
      clearInterval(discoInt);
      $(this).click(startDisco);
    };
    var startDisco = function() {
      $(this).unbind();
      timers.push(discoInt = setInterval(function() {
            disco(animationDemo.colours);
        }, 500));
      $(this).click(stopDisco);
    };
  };


  animationDemo.destroy = function(targetName) {
    for(var i = 0; i < timers.length; i++) {
      clearInterval(timers[i]);
    }
    $(targetName).css('text-align', 'center');
    $('#tile-label-wrapper').remove();
    $(targetName).removeClass('no-select');
  };

  return animationDemo;
}
    
var makeCommentDemo = function() {
  var commentDemo = {};
  commentDemo.id = 'comments';
  commentDemo.labelText = "Comments";
  commentDemo.description = 'Inline commenting with browser storage for persistence (IE 8 and above, <a href="https://www.google.com/chrome">Chrome</a> and <a href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a>.';
  commentDemo.defaultText = "Edit me.";
  commentDemo.go = function(targetSelector, state, containerSelector) {
    var $container = $(containerSelector);
    var $target = $(targetSelector);
    var pos = $container.position();
    var debounce = function(func , timeout) {
      var timeoutID;
      var timeout = timeout || 200;
      return function () {
          var scope = this;
          var args = arguments;
          clearTimeout(timeoutID);
          timeoutID = setTimeout(function () {
              func.apply(scope , Array.prototype.slice.call(args));
          }, timeout);
      }
    }
    var helpText = 'Click on the boxes with circles in them to attach a comment to a picture, or the boxes with plusses in them to mark particular pictures. This information is stored in your browser and filled in when you revisit the page (IE 8 and above, <a href="https://www.google.com/chrome">Chrome</a> and <a href="http://www.mozilla.org/en-US/firefox/new/">Firefox</a>). Nothing is sent to the server or in other way recorded or processed.<br><br>Click anywhere in this box to dismiss it.';
    var help = makeHelpBox('comment-demo-help', helpText, $target);

    var makeCommentBox = function(id, top, left) {
      var cb = {};
      cb.size = 20;
      cb.id = id;
      cb.top = top;
      cb.left = left;
      cb.$button = $('<div>').
        addClass('comment-button').
        addClass('clickable').
        html("&nbsp;");
      cb.$text = $('<span>').
        addClass('comment-text').
        attr('contenteditable', 'true').
        text(commentDemo.defaultText);
      cb.$box = $('<div>').addClass('comment-box').
        attr('id', id).
        css('position', 'absolute').
        css('left', cb.left).
        css('top', cb.top).
        css('height', cb.size).
        css('width', cb.size).
        append(cb.$button).
        append(cb.$text);
      cb.position = function(top, left) {
        cb.top = top;
        cb.left = left;
        cb.$box.css('top', top).css('left', left);
      };
      cb.saveLS = function() {
        if(cb.$text.text() != commentDemo.defaultText && cb.$text.text() != '') {
          window.localStorage.setItem(cb.id, cb.$text.text());
          cb.$box.addClass('commented');
        }
      };
      cb.loadLS = function() {
        var loaded = window.localStorage.getItem(cb.id);
        if(loaded && loaded != '' && loaded != commentDemo.defaultText) {
          cb.$text.text(loaded);
          cb.$box.addClass('commented');
        }
      };
      if(window.localStorage) {
        cb.save = cb.saveLS;
        cb.load = cb.loadLS;
      } else {
        cb.save = cb.load = function () {};
      }
      cb.close = function() {
        cb.$button.unbind();
        cb.$text.unbind();
        cb.$box.css('width', cb.size).css('height', cb.size).css('z-index', '3');
        cb.$text.hide().unbind();
        cb.save();
        cb.$button.click(cb.open);
      };
      cb.open = function() {
        cb.$button.unbind();
        cb.$box.css('width', 'auto').css('height', 'auto').css('z-index', '4');
        if(cb.$text.text() === "") {
          cb.$text.text(commentDemo.defaultText);
        }
        cb.$text.
          show().
          focus().
          bind('blur', cb.close);
        cb.$button.click(cb.close);
      };
      cb.init = function($target) {
        $target.append(cb.$box);
        pos = cb.$box.position();
        cb.$text.hide();
        cb.load();
        cb.$button.click(cb.open);
      };
      return cb;
    };
    var makePlusBox = function(id, top, left) {
      var pb = {};
      pb.size = 20;
      pb.id = id;
      pb.top = top;
      pb.left = left;
      pb.$box = $('<div>').addClass('plus-box').
        addClass('clickable').
        attr('id', id).
        css('position', 'absolute').
        css('left', pb.left).
        css('top', pb.top).
        css('height', pb.size).
        css('width', pb.size).
        text('+');
      pb.position = function(top, left) {
        pb.top = top;
        pb.left = left;
        pb.$box.css('top', top).css('left', left);
      };
      pb.saveLS = function(unplus) {
        if(unplus == "unplus") {
          window.localStorage.setItem(pb.id, '-');
        } else {
          window.localStorage.setItem(pb.id, '+');
        }
      };
      pb.loadLS = function() {
        var loaded = window.localStorage.getItem(pb.id);
        if(loaded === '+') {
          pb.$box.addClass('plussed');
        }
      };
      if(window.localStorage) {
        pb.save = pb.saveLS;
        pb.load = pb.loadLS;
      } else {
        pb.save = pb.load = function () {};
      }
      pb.plus = function() {
        pb.save('plus');
        pb.$box.addClass('plussed');
        pb.$box.click(pb.unplus);
      };
      pb.unplus = function() {
        pb.save('unplus');
        pb.$box.removeClass('plussed');
        pb.$box.click(pb.plus);
      };
      pb.init = function($target) {
        $target.append(pb.$box);
        pos = pb.$box.position();
        pb.load();
        if(pb.$box.hasClass('plussed')) {
          pb.$box.click(pb.unplus);
        } else {
          pb.$box.click(pb.plus);
        }
      };
      return pb;
    };
    var lineByLine = function() {
      var commentBoxes = [];
      var basePos = $target.position();
      var mainText = $('<div>').attr('id', 'main-text').
        css('position', 'absolute').
        css('top', basePos.top).
        css('left', basePos.left + 25).
        attr('contenteditable', 'true');
      var setup = function(text) {
        mainText.text(text);
        $target.append(mainText);
        var numLines = mainText.height() / cb.size;
        var tmpBox = makeCommentBox('comment-0', basePos.top, basePos.left);
        commentBoxes.push(tmpBox);
        $target.append(tmpBox);
        tmpBox.init($(targetSelector));
        for(var i = 1; i < numLines; i++) {
          var soFar = cb.size * i;
          var tmpBox = makeCommentBox('comment-'+i, basePos.top + soFar, basePos.left);
          commentBoxes.push(tmpBox);
          $target.append(tmpBox);
          tmpBox.init($(targetSelector));
        }
      };
      $.ajax({
        type: 'GET',
        url: '/api/categories/1/'}).done(setup).fail(function(e) {
          console.log(e);
        });
    };
    var inBoxes = function() {
      var widthWithMargin = function($el) {
        var width = $el.width();
        var tmp = $el.css('margin-left').replace(/px/, '');
        width += parseInt(tmp);
        return width;
      };
      var heightWithMargin = function($el) {
        var height = $el.height();
        var tmp = $el.css('margin-top').replace(/px/, '');
        height += parseInt(tmp);
        return height;
      };
      var redraw = function(boxes) {
        var basePos, margin, width, border;
        for(var i = 0; i < boxes.length; i++) {
          basePos = boxes[i].productBox.position();
          basePos.top += heightWithMargin(boxes[i].productBox) - boxes[i].commentBox.size;
          margin = parseInt(boxes[i].productBox.css('margin-left').replace(/px/, ''));
          boxes[i].commentBox.position(basePos.top, basePos.left + margin);
          width = boxes[i].productBox.width();
          border = parseInt(boxes[i].productBox.css('border-right-width').replace(/px/, ''));
          border += parseInt(boxes[i].plusBox.$box.css('border-right-width').replace(/px/, ''));
          boxes[i].plusBox.position(basePos.top, basePos.left + width - margin/2 - boxes[i].plusBox.size/2 + border);
        }
      };
      var wrappers = [];
      var products = [{image: '/bike.jpeg', name: 'Bike', id: 'bike'}, {image: '/chair.jpeg', name: "Chair", id: 'chair'}, {image: '/plane.jpeg', name: 'Flying boat', id: 'plane'}];
      for(var i = 0; i < products.length; i++) {
        var tmpBox = $('<div>').addClass('product-box').attr('id', products[i].id);
        var innerBox = $('<div>').html('<img height="200" src="'+products[i].image+'">');
        var text = $('<div>').
          addClass('product-name').
          text(products[i].name);
        tmpBox.append(innerBox);
        $target.append(tmpBox);
        var commentBox = makeCommentBox('comment-product-'+i, 0, 0);
        commentBox.init($(targetSelector));
        var plusBox = makePlusBox('plus-product-'+i, 0, 0);
        plusBox.init($(targetSelector));
        tmpBox.append(commentBox.$box).append(plusBox.$box);
        wrappers.push({"commentBox": commentBox, "productBox": tmpBox, "plusBox": plusBox});
      }
      redraw(wrappers);
      $(window).resize(debounce(function() {
        redraw(wrappers);
      }, 5));
    };
    inBoxes();
  };

  commentDemo.destroy = function() {

  };

  return commentDemo;
}


$(function() {
  var currentDemo;
  var demoFactories = [makeFilesDemo, makeAjaxDemo, makeAnimationDemo, makeCommentDemo];
  var demoLabels = [];
  var demos = {};
  var baseURL = "/demos/";
  var title = "<h3>A selection of JavaScript demos.</h3><hr>";
  var targetSelector = '#content';
  var controlsParent = '#demo-controls';
  var $defaultText = $('<div>').html(title);
  var destroyCurrent = function() {
    if(currentDemo) {
      currentDemo.destroy(targetSelector);
    }
    $(targetSelector).children().remove();
    $('.demo-label').css('text-decoration', 'none');
  };
  var demoClickHandler = function() {
    var demoId = $(this).attr('id').replace(/-alt/, '');
    var newDemo = demos[demoId];
    updateHistory(newDemo);
    loadNewDemo(newDemo);
  };
  var loadNewDemo = function(newDemo, state) {
    destroyCurrent();
    newDemo.labelElement.css('text-decoration', 'underline');
    currentDemo = newDemo;
    currentDemo.go(targetSelector, state, '#content');
  };
  var updateHistory = function(newDemo) {
    if(!history.pushState) {
      window.location.hash = "#"+newDemo.id+'/';
    } else {
      history.pushState({section: newDemo.id}, "", baseURL + newDemo.id + '/');
    }
  };
  for(var i = 0; i < demoFactories.length; i++) {
    tmpDemo = demoFactories[i](baseURL);
    var tmpLabel = $('<li>').
        attr('id', tmpDemo.id).
        addClass('demo-label').
        addClass('clickable').
        text(tmpDemo.labelText);
    var tmpDesc = $('<div>').attr('id', tmpDemo.id+'-alt').
      append($('<p>').html(tmpDemo.labelText+": "+tmpDemo.description)).
      addClass('alt-section-link').
      click(demoClickHandler);
    $defaultText.append(tmpDesc);
    tmpDemo.labelElement = tmpLabel;
    demos[tmpDemo.id] = tmpDemo;
    demoLabels.push(tmpLabel);
  }
  for(var i = 0; i < demoLabels.length; i++) {
    $(controlsParent).append(demoLabels[i]);
    demoLabels[i].click(demoClickHandler);
  }
  var loaded = false;
  var loadState = function(e) {
    if(e && e.originalEvent.state) {
      var section = e.originalEvent.state.section;
      for(var i in demos) if(demos.hasOwnProperty(i)) {
        if(section === demos[i].id) {
          loadNewDemo(demos[i], e.originalEvent.state);
          loaded = true;
        }
      }
    } else {
      for(var i in demos) if(demos.hasOwnProperty(i)) {
        if(window.location.pathname.match(new RegExp(baseURL+demos[i].id+'/.*'))) {
          loadNewDemo(demos[i]);
          loaded = true;
        }
      }
      if(!loaded) {
        for(var i in demos) if(demos.hasOwnProperty(i)) {
          if(window.location.hash.match(new RegExp('#'+demos[i].id+'/.*'))) {
            loaded = true;
            loadNewDemo(demos[i]);
          }
        }
      }
    }
    if(section === "default") {
      destroyCurrent();
      $(targetSelector).append($defaultText);
      $('.alt-section-link').click(demoClickHandler);
    }
  }
  loadState();
  $(window).bind('popstate', loadState);
  $(window).bind('hashchange', loadState);
  if(!loaded) {
    if(!history.pushState) {
      // IE
    } else {
      history.replaceState({section: 'default'}, "", baseURL);
    }
    $(targetSelector).append($defaultText);
    $('.alt-section-link').click(demoClickHandler);
    $('a#demos-main-link').click(function(e) {
      e.preventDefault();
      destroyCurrent();
      $(targetSelector).append($defaultText);
      $('.alt-section-link').click(demoClickHandler).addClass('clickable');
      if(history.pushState) {
        history.pushState({section: 'default'}, "", baseURL);
      }
    });
  }
});

}());
