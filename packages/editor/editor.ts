
import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { Bold, Strikethrough, Underline } from '@ckeditor/ckeditor5-basic-styles';
import { Link } from '@ckeditor/ckeditor5-link';
import { List, TodoList } from '@ckeditor/ckeditor5-list';

import { Indent } from '@ckeditor/ckeditor5-indent';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import { Image,ImageStyle, ImageCaption, ImageUpload, ImageResize, ImageToolbar } from '@ckeditor/ckeditor5-image';

import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';


export class Editor extends ClassicEditor {

  public static override builtinPlugins = [
    Essentials, Heading, Paragraph,
    Bold, Strikethrough, Underline,
    Link, TodoList, List,
    Indent, IndentBlock, BlockQuote,
    Image, ImageCaption, ImageToolbar, ImageUpload, ImageResize, ImageStyle,
    MediaEmbed, Table, TableToolbar
  ];

  public static override defaultConfig = {
    toolbar: {
      items: [
        'bold', '|',
        'bold',
        'strikethrough',
        'underline', '|',
        'link', 'bulletedList', 'todoList', 'blockQuote', '|',
        'indent', 'outdent', '|',
        'undo', 'redo', '|',
        'imageUpload', 'mediaembed', 'insertTable'
      ],
    },
    image: {
      toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative']
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }
  }
}