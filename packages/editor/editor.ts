import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import {
  Bold,
  Strikethrough,
  Underline,
} from '@ckeditor/ckeditor5-basic-styles';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font'
import { Link } from '@ckeditor/ckeditor5-link';
import { List, TodoList } from '@ckeditor/ckeditor5-list';

import { Indent } from '@ckeditor/ckeditor5-indent';
import { IndentBlock } from '@ckeditor/ckeditor5-indent';
import { BlockQuote } from '@ckeditor/ckeditor5-block-quote';

import {
  Image,
  ImageStyle,
  ImageCaption,
  ImageUpload,
  ImageResize,
  ImageToolbar,
} from '@ckeditor/ckeditor5-image';

import { MediaEmbed } from '@ckeditor/ckeditor5-media-embed';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';

const defaultBuiltinPlugins = [
  Essentials,
  Heading,
  Paragraph,
  Bold,
  Strikethrough,
  Underline,
  FontColor,
  FontBackgroundColor,
  Link,
  TodoList,
  List,
  Indent,
  IndentBlock,
  BlockQuote,
  Image,
  ImageCaption,
  ImageToolbar,
  ImageUpload,
  ImageResize,
  ImageStyle,
  MediaEmbed,
  Table,
  TableToolbar,
];

const defaultConfig = {
  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'strikethrough',
      'underline',
      'fontColor',
      'fontBackgroundColor',
      '|',
      'link',
      'bulletedList',
      'todoList',
      'blockQuote',
      '|',
      'indent',
      'outdent',
      '|',
      'imageUpload',
      'mediaembed',
      'insertTable',
      '|',
      'undo',
      'redo',
    ],
  },
  image: {
    toolbar: [
      'imageStyle:alignBlockLeft',
      'imageStyle:block',
      'imageStyle:alignBlockRight',
      '|',
      'imageStyle:alignLeft',
      'imageStyle:alignRight',
      '|',
      'toggleImageCaption',
    ],
  },
  table: {
    contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells'],
  },
};

export class Editor extends ClassicEditor {
  public static override builtinPlugins = defaultBuiltinPlugins;

  public static override defaultConfig = defaultConfig;
}

export class Viewer extends ClassicEditor {
  public static override builtinPlugins = defaultBuiltinPlugins;

  public static override defaultConfig = {
    ...defaultConfig,
    toolbar: {
      items: [] as string[],
    },
  };
}
