$(function () {
  var placeholders = [
    'http://lorempixel.com/%w/%h/',
    'http://placeimg.com/%w/%h/any',
    'http://placehold.it/%wx%h'
  ];
  var activePlaceholder = 0;

  // Renders the grid with random images.
  function renderImages() {
    var gridSize = $('.buttons-option-size').find('.active').attr('data-value');
    var gridPadding = $('.buttons-option-padding').find('.active').attr('data-value');
    var sortable = ($('.buttons-option-sortable').find('.active').attr('data-value') === '1');
    var baseSize = (gridSize == 'small' ? 150 : 500);
    var count = (gridSize == 'small' ? 30 : 15);

    // Unload widget, clear content.
    try {
      // Later versions of jQuery UI throw error if
      // the widget is not yet initialized.
      $('.photo-grid-container').sortablePhotos('destroy');
    } catch (exception) {}

    $('.photo-grid-container').empty();

    // Generate random-sized images.
    for (var i = 0; i < count; i++) {
      var w = baseSize + 50 * Math.round(5 * Math.random());
      var h = baseSize + 50 * Math.round(5 * Math.random());
      var url = placeholders[activePlaceholder];

      url = url.replace('%w', w);
      url = url.replace('%h', h);

      $('.photo-grid-container').append('<div class="photo-grid-item"><img width="' + w + '" height="' + h + '" src="' + url + '"></div>');
    }

    // Initialize jQuery Sortable Photos.
    $('.photo-grid-container').sortablePhotos({
      selector: '> .photo-grid-item',
      sortable: sortable,
      padding: gridPadding,
      beforeArrange: function (event, data) {
      },
      afterDrop: function (event, data) {
      }
    });

    // Check for image loading error and switch placeholder service.
    $('.photo-grid-container img').first().error(function () {
      if (activePlaceholder < (placeholders.length - 1)) {
        activePlaceholder++;
        renderImages();
      }
    });

  }

  // Click handler for the buttons.
  $('.buttons-option button').click(function () {
    $(this).parent().find('button').removeClass('active');
    $(this).addClass('active');

    renderImages();
  });

  renderImages();
});
