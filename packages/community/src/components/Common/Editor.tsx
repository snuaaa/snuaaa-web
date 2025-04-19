/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { CKEditor } from '@ckeditor/ckeditor5-react';

import UploadService from '~/services/UploadService';

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';

import { Essentials } from '@ckeditor/ckeditor5-essentials';
import { Heading } from '@ckeditor/ckeditor5-heading';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import {
  Bold,
  Strikethrough,
  Underline,
} from '@ckeditor/ckeditor5-basic-styles';
import { FontColor, FontBackgroundColor } from '@ckeditor/ckeditor5-font';
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

class MyUploadAdapter {
  private loader: any;

  constructor(loader: any) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    // Update the loader's progress.
    return this.loader.file.then((file: File) => {
      return new Promise((resolve, reject) => {
        UploadService.uploadImage(file)
          .then((response) => {
            resolve({
              default: response.data.imgUrl,
            });
          })
          .catch(() => {
            reject('Upload failed');
          });
      });
    });
  }

  // Aborts the upload process.
  abort() {
    // Reject the promise returned from the upload() method.
    console.warn('upload abort');
    // server.abortUpload();
  }
}

function MyCustomUploadAdapterPlugin(editor: any) {
  editor.plugins.get('FileRepository').createUploadAdapter = (loader: any) => {
    // Configure the URL to the upload script in your back-end here!
    return new MyUploadAdapter(loader);
  };
}

type Props = {
  text: string;
  setText: (text: string) => void;
  readOnly: boolean;
};

function Editor2({ text, setText, readOnly }: Props) {
  const editorConfiguration = {
    extraPlugins: [MyCustomUploadAdapterPlugin],
  };

  return (
    <div className={`sa-ck ${readOnly ? 'sa-viewer' : 'sa-editor'}`}>
      <CKEditor
        editor={readOnly ? Viewer : Editor}
        config={editorConfiguration}
        data={text}
        disabled={readOnly}
        onReady={(editor) => {
          // You can store the "editor" and use when it is needed.
        }}
        onChange={(event, editor) => {
          // const data = editor.getData();
          setText(editor.getData());
        }}
        onBlur={(event, editor) => {
          // console.log('Blur.', editor);
        }}
        onFocus={(event, editor) => {
          // console.log('Focus.', editor);
        }}
      />
    </div>
  );
}

export default Editor2;
