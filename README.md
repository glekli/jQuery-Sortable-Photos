# jQuery Sortable Photos

jQuery Sortable Photos is a jQuery UI plugin that can display photos in a responsive, sortable grid.

The photo grid is arranged in such a way that the height of the images in each row is consistent, and the images are resized to fill in the full width. The grid can optionally be configured to allow drag-and-drop sorting.

Try the demo:
http://glekli.github.io/jQuery-Sortable-Photos/

![Demo Screenshot](http://glekli.github.io/jQuery-Sortable-Photos/img/demo.png "Demo Screenshot")

## Requirements

* jQuery 1.4+
* jQuery UI 1.8+ (ui.core, ui.widget, ui.draggable, ui.droppable)

## Installation

* [Download](https://github.com/glekli/jQuery-Sortable-Photos/releases) the latest release.
* Include the javascript file on pages where needed. Be sure to include it
after jQuery and jQuery UI.

```html
<script src=".../jquery-sortable-photos.js"></script>
```

## Usage

Render your images in HTML. The images need to be inside a container, as follows:

```html
<div class="my-container">
  <div class="my-item"><img src="image1.jpg"></div>
  <div class="my-item"><img src="image2.jpg"></div>
  ...
</div>
```

Initialize the plugin on the container:

```javascript
$('.my-container').sortablePhotos({
  selector: '> .my-item',
  sortable: true,
  padding: 2
});
```

## Options

### selector:

The CSS selector that identifies the individual image elements inside the container.

**Default:** '> *' (meaning all immediate children of the container)

### sortable:

If `true`, the images will be sortable using drag and drop. If you enable sorting,
you will need to also specify an `afterDrop` callback, and save or process the new
order in that callback as appropriate.

**Default:** true

### padding:

The amount of padding in between the images in pixels.

**Default:** 2

### afterDrop:

A callback function that gets called after the user has dropped an image to a new position.
You can use this callback to process the new order of images.

The function receives two arguments: `event` is a jQuery event object, and `element` is a jQuery object
containing the element on which the plugin has been initialized.

**Default:** undefined

**Example:**

```javascript
$('.my-container').sortablePhotos({
  selector: '> .my-item',
  sortable: true,
  afterDrop: function (event, element) {
    // Save new order.
  }
});
```

### beforeArrange:

A callback function that gets called before the images are arranged. You can use this to
modify the content before the plugin processes it if needed.

The function receives two arguments: `event` is a jQuery event object, and `element` is a jQuery object
containing the element on which the plugin has been initialized.

**Default:** undefined

**Example:**

```javascript
$('.my-container').sortablePhotos({
  selector: '> .my-item',
  sortable: true,
  beforeArrange: function (event, element) {
    // Modify content.
  }
});
```

## Notes

The arranging algorithm relies on the images' actual sizes. If these are not available when the plugin is first initialized, the grid will be constantly rearranged as images load. This may result in flickering. To prevent this, specify the `width` and `height` attributes on the `<img>` elements. In addition, applying `max-width: 100%` to the images may preclude the ability to determine exact image sizes and thus interfere with the grid arrangement.
