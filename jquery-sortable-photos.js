/*
 * jQuery Sortable Photos
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
      // Use array index as id. Id is used in the calculation to determine
      // position so it needs to be sequential.
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
     * @param itemId
     *   The item's id. Added to the dom elements for identification purposes.
     * @param width
     *   The original width of the image contained in this grid item.
     * @param height
     *   The original height of the image contained in this grid item.
     */
    createItem: function (itemId, width, height) {
      var item = new gridItem(itemId);
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
        // @TODO: Remove css id reference.
        var elem = $('#jq-sortable-photos-' + this.items[i].itemId);
        elem.attr('data-row-id', this.rowId);
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
   * @param itemId
   *   The item's id.
   */
  var gridItem = function (itemId) {
    this.itemId = itemId;
    this.width = 0;
    this.height = 0;
    this.displayWidth = 0;
    this.displayHeight = 0;
  };

  // Keeps track of the created containers.
  // Used to assign a unique id to each.
  var containerId = 0;

  /**
   * Registers the jQuery UI widget.
   */
  $.widget('glekli.sortablePhotos', {
    options: {
      selector: '> *',
      padding: 2
    },

    /**
     *  Arranges the grid.
     */
    arrange: function () {

      // Container is the object on which the widget is initialized.
      var container = this.element;
      var containerWidth = container.width();

      // Create a unique id for this grid container.
      // @TODO: Is this necessary?
      container.attr('id', 'jq-sortable-photos-' + this.containerId);

      // Create grid objects.
      var gridPadding = parseInt(this.options.padding);
      var currentGrid = new grid(container, this.containerId, containerWidth, gridPadding);
      var row = currentGrid.createRow();
      var containerId = this.containerId;

      // Find grid items and create rows.
      container.find(this.options.selector).each(function (itemIndex) {

        // Create a unique id for this grid item.
        var itemId = containerId + '-' + itemIndex;
        $(this).attr('id', 'jq-sortable-photos-' + itemId);

        var img = $(this).find('img');

        // Remove css so that the actual size can be determined.
        $(this).find('img').css('height', '');
        $(this).find('img').css('width', '');

        row.createItem(itemId, img.width(), img.height());

        // Check if adding this item has used up all the space.
        if (row.isFull()) {
          // This item is the last one that fits the container.
          // Start a new row.
          row = currentGrid.createRow();
        }

      }); // container.find().each()

      // Render.
      currentGrid.render();

    }, // arrangeGrid()

    /**
     * Returns a function that can be used as an event handler.
     * The function triggers arrangeGrid() and ensures that it's not triggered
     * too frequently.
     *
     * @returns {Function}
     *   Event handler.
     */
    _getTriggerHandler: function () {
      var timer;
      var self = this;

      if (!this.triggerHandler) {
        this.triggerHandler = function () {
          if (timer) {
            clearTimeout(timer);
          }

          timer = setTimeout(function () {
            self.arrange();
          }, 100);
        };
      }

      return this.triggerHandler;
    },

    /**
     * Constructor.
     */
    _create: function() {
      this.containerId = containerId++;
      var triggerHandler = this._getTriggerHandler();

      // Arrange grid items.
      this.arrange();

      // Attach event listeners to trigger grid rearrangement when necessary.
      this.element.find('img').bind('load', triggerHandler);
      $(window).bind('resize', triggerHandler);
    },

    /**
     * Destructor.
     */
    destroy: function() {
      $.Widget.prototype.destroy.apply(this, arguments);
      var triggerHandler = this._getTriggerHandler();

      // Detach event listeners.
      this.element.find('img').unbind('load', triggerHandler);
      $(window).unbind('resize', triggerHandler);
    }

  }); // $.widget()

})(jQuery);

