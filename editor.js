var DomDemo = {};
  
DomDemo.editableText = function(options) {
  var handler = function() {
    var textarea = options && options.textarea || false;
    var text = $(this).html();
    var inputId = $(this).attr('id')+'-input';
    var parentElem = $(this);
    $(this).unbind('click');
    if(textarea) {
      text = text.replace(/<br>/g, "\n");
      $(this).html('<textarea id="'+inputId+'">'+text+'</textarea>');
    } else {
      $(this).html('<input type="text" id="'+inputId+'" value="'+text+'">');
      $('#'+inputId).keyup(function(e) {
        if(e.which === 13) {
          var text = $(this).val();
          parentElem.html(text); 
          parentElem.click(handler);
        }
      });
    }
    $('#'+inputId).focus();
    $('#'+inputId).blur(function() {
      var text = $(this).val();
      var labelId = $(this).attr('id').replace(/-input/, '');
      labelId = labelId.replace(/new/, 'delete');
      text = text.replace(/</, '&lt;').replace(/>/, '&gt;');
      if(textarea) {
        text = text.replace(/\n/g, "<br>");
      }
      parentElem.html(text); 
      $("#"+labelId).css('height', parentElem.css('height'));
      parentElem.click(handler);
    });
  };
  return handler;
};

DomDemo.demo = function() {
  var divs = 0;
  var addDiv = function() {
    divs++;
    $('div#compose').append('<div id="new-'+divs+'" class="new">Div '+divs+'</div>');
    $('div#new-'+divs).click(DomDemo.editableText({textarea: true}));
    $('div#labels').append('<div id="delete-'+divs+'" class="delete">'+divs+'</div>');
    $('div#delete-'+divs).draggable().
    droppable({accept: 'div.delete'}).
    bind('drop', function(e, ui) {
      var movingDiv = $('#'+$(ui.draggable).attr('id').replace(/delete/, 'new'));
      var targetDiv = $('#'+$(this).attr('id').replace(/delete/, 'new'));
      targetDiv.append('<br />'+movingDiv.html());
      $(this).css('height', targetDiv.css('height'));
      movingDiv.remove();
      $(ui.draggable).remove();
    }).
    click(function() {
      var target_id = $(this).attr('id').replace(/delete/, 'new');
      $("div#"+target_id).remove();
      $(this).remove();
    });
  };

  var go = function() {
    var title = $('span#demo-title').text();
    $('span#demo-title').click(DomDemo.editableText());
    $('input#test').keyup(function() {
      $('span#demo-title').text($(this).val());
    });
    $('div#add-div').click(function() {
      addDiv();
    });

  };
  $(document).ready(go);
};

DomDemo.demo();
