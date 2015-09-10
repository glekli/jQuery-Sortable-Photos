/*
 * jQuery Sortable Photos 1.0.0
 * https://github.com/glekli/jQuery-Sortable-Photos
 *
 * Sortable photo grid widget for jQuery UI.
 *
 * Depends:
 *	jquery.ui.core.js
 *	jquery.ui.widget.js
 *	jquery.ui.draggable.js
 *	jquery.ui.droppable.js
 */

(function ($) {

  /**
   * Constructor for the grid object.
   *
   * @param element
   *   The element on which the widget is initialized.
   * @param gridId
   *   A unique id for this grid.
   * @param width
   *   The total width of the grid that the each row must fit.
   * @param padding
   *   Padding between items in pixels.
   */
  var grid = function (element, gridId, width, padding) {
    this.element = element;
    this.gridId = gridId;
    this.width = width;
    this.padding = (typeof padding !== 'undefined' ? padding : 1);
    this.rows = [];
  };

  /**
   * Defines the prototype for the grid object.
   */
  $.extend(grid.prototype, {

    /**
     * Creates a new row and adds it to the grid object.
     *
     * @returns {gridRow}
     *   The new row.
     */
    createRow: function () {
      // Use array index as id.
      var rowId = this.rows.length;
      var row = new gridRow(rowId, this.width, this.padding);
      this.rows.push(row);
      return row;
    },

    /**
     * Renders the grid.
     */
    render: function () {
      // Keeps track of the current vertical position.
      var currentPos = 0;

      // Iterate through all rows, and let them render at the current
      // vertical position.
      for (var i = 0; i < this.rows.length; i++) {
        this.rows[i].render(currentPos);

        currentPos += this.rows[i].height + this.padding;
      }

      // Set the height on the container
      this.element.css('height', currentPos + 'px');
    }

  }); // $.extend(grid.prototype, {...})

  /**
   * Constructor for the row object.
   *
   * @param rowId
   *   The row's id. Added to the dom elements for identification purposes.
   * @param width
   *   The total width of the row that the row items must fit.
   * @param padding
   *   Padding between items in pixels.
   */
  var gridRow = function (rowId, width, padding) {
    this.rowId = rowId;
    this.width = width;
    this.height = 0;
    this.padding = (typeof padding !== 'undefined' ? padding : 1);
    this.usedWidth = 0;
    this.items = [];
  };

  /**
   * Defines the prototype for the gridRow object.
   */
  $.extend(gridRow.prototype, {

    /**
     * Creates and adds an item to the row. Keeps track of the width used by
     * the item.
     *
     * @param element
     *   The jQuery object representing the item.
     * @param width
     *   The original width of the image contained in this grid item.
     * @param height
     *   The original height of the image contained in this grid item.
     */
    createItem: function (element, width, height) {
      var item = new gridItem(element);
      item.width = width;
      item.height = height;
      item.displayWidth = width;
      item.displayHeight = height;

      // Place item into the row.
      if ((item.displayHeight && item.displayHeight < this.height) || !this.height) {
        // This item is smaller than the current row height.
        // Need to shrink the row to avoid upscaling.
        this.adjustRowHeight(item.height);
      }
      else {
        // Resize the item to match the row height.
        item = this.fitItem(item);
      }

      this.items.push(item);
      this.usedWidth = this.usedWidth + item.displayWidth;
    },

    /**
     * Checks if there is available space in the row for further items.
     */
    isFull: function () {
      return (this.getAvailableWidth() <= 0);
    },

    /**
     * Returns the width available for additional items to be added.
     *
     * @returns
     *   Width in pixels.
     */
    getAvailableWidth: function () {
      return this.width - this.usedWidth;
    },

    /**
     * Modifies an item's display size so that its height fits the row.
     *
     * @param item
     *   Item object.
     * @returns
     *   The modified item object.
     */
    fitItem: function (item) {
      if (!item.width || !item.height) {
        return item;
      }

      var aspect = item.width / item.height;
      var newWidth = Math.round(aspect * this.height);

      item.displayWidth = newWidth;
      item.displayHeight = this.height;

      return item;
    },

    /**
     * Sets the row's height, and adjusts all items currently in the row
     * to fit the new height.
     *
     * @param newHeight
     *   New height in pixels.
     */
    adjustRowHeight: function (newHeight) {
      this.height = newHeight;

      // Iterate through existing items and set the height while maintaining
      // the aspect ratio.
      this.usedWidth = 0;
      for (var i = 0; i < this.items.length; i++) {
        if (!this.items[i].width || !this.items[i].height) {
          continue;
        }

        var aspect = this.items[i].width / this.items[i].height;
        var newWidth = Math.round(aspect * this.height);

        this.items[i].displayWidth = newWidth;
        this.items[i].displayHeight = this.height;

        this.usedWidth = this.usedWidth + this.items[i].displayWidth;
      }
    },

    /**
     * Renders the row. Applies CSS to the items in the row.
     *
     * @param top
     *   Vertical position to apply to the items.
     */
    render: function (top) {
      if (this.items.length == 0) {
        // There isn't anything to render.
        return;
      }

      // Calculate how much space is available for row items when accounting
      // for padding.
      var targetWidth = this.width - (this.items.length - 1) * this.padding;

      // All items will be resized by a certain percentage to make them fit
      // the width calculated above.
      var adjustment;
      if (targetWidth < this.usedWidth) {
        adjustment = targetWidth / this.usedWidth;
      }
      else {
        // Content would need to be enlarged to fit. Leave as is.
        adjustment = 1;
      }
      this.height = Math.round(this.height * adjustment);

      // Keeps track of the X position where the next item
      // should be placed.
      var currentPos = 0;

      // Adjust widths so that the items fully fill in the full width.
      // Apply css to place items.
      for (var i = 0; i < this.items.length; i++) {

        // Adjust size to fit the width, if needed.
        if (adjustment != 1) {
          this.items[i].displayHeight = this.height;

          if (i < this.items.length - 1) {
            this.items[i].displayWidth = Math.round(this.items[i].displayWidth * adjustment);
          }
          else {
            // The last item should use up all the space that's left. This will
            // fix the discrepancy caused by rounding.
            this.items[i].displayWidth = this.width - currentPos;
          }
        }

        // Apply placement.
        var elem = this.items[i].element
        elem.attr('data-row-id', this.rowId);
        elem.css('position', 'absolute');
        elem.css('top', top + 'px');
        elem.css('left', currentPos + 'px');
        elem.find('img').css('width', this.items[i].displayWidth + 'px');
        elem.find('img').css('height', this.items[i].displayHeight + 'px');

        currentPos += this.items[i].displayWidth + this.padding;
      }

    }

  }); // $.extend(gridRow.prototype, {...})

  /**
   * Constructor for the row item object.
   *
   * @param element
   *   The jQuery object representing the item.
   */
  var gridItem = function (element) {
    this.element = element;
    this.width = 0;
    this.height = 0;
    this.displayWidth = 0;
    this.displayHeight = 0;
  };

  // Keeps track of the created containers.
  // Used to assign a unique id to each.
  var nextContainerId = 0;

  /**
   * Registers the jQuery UI widget.
   */
  $.widget('glekli.sortablePhotos', {
    options: {
      selector: '> *',
      sortable: true,
      padding: 2
    },

    /**
     *  Arranges the grid.
     */
    arrange: function () {
      this._trigger('beforeArrange', null, this.element);

      // Container is the object on which the widget is initialized.
      var container = this.element;
      var containerWidth = container.width();
      var containerId = this.containerId;
      var gridPadding = parseInt(this.options.padding);
      var items = container.find(this.options.selector);

      // Create a unique id for this grid container.
      container.attr('data-jq-sortable-photos-grid-id', containerId);

      // Create grid objects.
      var currentGrid = new grid(container, containerId, containerWidth, gridPadding);
      var row = currentGrid.createRow();

      // Find grid items and create rows.
      items.each(function (itemIndex) {
        // Create a unique id for this grid item.
        var itemId = containerId + '-' + itemIndex;
        var itemElement = $(this);
        itemElement.attr('data-grid-item-id', itemId);
        itemElement.addClass('jq-sortable-photos-item');

        var img = itemElement.find('img');

        // Remove css so that the actual size can be determined.
        img.css('height', '');
        img.css('width', '');
        img.css('max-width', 'none');

        row.createItem(itemElement, img.width(), img.height());

        // Check if adding this item has used up all the space.
        if (row.isFull()) {
          // This item is the last one that fits the container.
          // Start a new row.
          row = currentGrid.createRow();
        }

      }); // items.each()

      // Render.
      currentGrid.render();

    }, // arrange()

    /**
     * Returns a function that can be used as an event handler.
     * The function triggers arrange() and ensures that it's not triggered
     * too frequently.
     *
     * @returns {Function}
     *   Event handler.
     */
    _getTriggerHandler: function () {
      var timer;
      var self = this;

      if (!this._triggerHandler) {
        this._triggerHandler = function () {
          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(function () {
            self.arrange();
          }, 100);
        };
      }

      return this._triggerHandler;
    },

    /**
     * Called after an item is dropped.
     * (Used as callback for the 'drop' event of the droppable widget.)
     *
     * @param droppable
     *   Droppable widget.
     * @param ui
     *   Data object from the droppable event.
     */
    _onDrop: function(droppable, ui) {
      // Move the dragged item to the new position in the DOM
      // and rearrange the items.
      // Need to use .detach() to keep the event listeners added
      // by jQuery UI.
      var movedItem = $(ui.draggable).detach();
      movedItem.insertBefore(droppable);
      this.arrange();

      // Trigger event so that third parties have a chance to process the result.
      this._trigger('afterDrop', null, this.element);
    },

    /**
     * Constructor.
     */
    _create: function() {
      this.containerId = nextContainerId++;
      var triggerHandler = this._getTriggerHandler();
      var items = this.element.find(this.options.selector);
      var self = this;

      this.element[0].style.position = 'relative';

      // Arrange grid items.
      this.arrange();

      if (this.options.sortable) {
        items.draggable({
          scope: 'jq-sortable-photos-' + this.containerId,
          stack: '.jq-sortable-photos-item', // Maintains z-indexes.
          revert: 'invalid',
          opacity: 0.6,
          containment: 'parent'
        });

        items.droppable({
          scope: 'jq-sortable-photos-' + this.containerId,
          tolerance: 'pointer',
          drop: function(event, ui) {
            self._onDrop(this, ui);
          }
        });
      }

      // Attach event listeners to trigger grid rearrangement when necessary.
      this.element.find('img').bind('load', triggerHandler);
      $(window).bind('resize', triggerHandler);
    },

    /**
     * Destructor.
     *
     * For jQuery UI <1.9 compatibility, the .destroy() method needs
     * to be overridden. (Later versions use ._destroy() instead.)
     */
    destroy: function() {
      var triggerHandler = this._getTriggerHandler();

      // Invoke the parent implementation.
      $.Widget.prototype.destroy.apply(this, arguments);

      // Detach event listeners.
      this.element.find('img').unbind('load', triggerHandler);
      $(window).unbind('resize', triggerHandler);
    }

  }); // $.widget()

})(jQuery);

