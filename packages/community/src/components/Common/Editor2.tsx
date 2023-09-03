import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import * as service from '../../services/index';
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
// import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';
import { Table, TableToolbar } from '@ckeditor/ckeditor5-table';



const SERVER_URL = process.env.REACT_APP_SERVER_URL;

class MyUploadAdapter {

  private loader: any;

  constructor(loader: any) {
    // The file loader instance to use during the upload.
    this.loader = loader;
  }

  // Starts the upload process.
  upload() {
    // Update the loader's progress.
    return this.loader.file
      .then((uploadFile: any) => {
        return new Promise((resolve, reject) => {
          const data = new FormData();
          data.append('attachedImage', uploadFile);

          service.createAttachedImage(data)
            .then(response => {
              if (response.data.result === 'success') {
                resolve({
                  default: `${SERVER_URL}static/${response.data.imgPath}`
                });
              } else {
                reject(response.data.message);
              }
            }).catch(response => {
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
}

function Editor2({ text, setText, readOnly }: Props) {


  const editorConfiguration = {
    plugins: [
      Essentials, Heading, Paragraph,
      Bold, Strikethrough, Underline,
      Link, TodoList, List, 
      Indent, IndentBlock, BlockQuote,
      Image, ImageCaption, ImageToolbar, ImageUpload, ImageResize, ImageStyle,
      MediaEmbed, Table, TableToolbar],
    extraPlugins: [MyCustomUploadAdapterPlugin],
    toolbar: {
      items: [
        'bold', '|',
        'bold',
        // 'strikethrough',
        // 'underline', '|',
        // 'link',
        //  'bulletedList', 'todoList', 'blockQuote', '|',
        // 'indent', 'outdent', '|',
        // 'undo', 'redo', '|',
        // // 'imageUpload', 'mediaembed', 'insertTable'
      ],
    },
    image: {
      toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative']
    },
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    }

    // ...(!readOnly && {
    //   toolbar: [
    //     'paragraph', 'heading1', 'heading2', '|',
    //     // 'bold', 'Strikethrough', 'Underline', '|',
    //     // 'link', 'bulletedList', 'todoList', 'blockQuote', '|',
    //     // 'indent', 'outdent', '|',
    //     // 'undo', 'redo', '|',
    //     // 'imageUpload', 'mediaembed', 'insertTable'
    //   ],
    //   image: {
    //     toolbar: ['imageStyle:full', 'imageStyle:side', '|', 'imageTextAlternative']
    //   },
    //   table: {
    //     contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells']
    //   }
    // }),
  };

  // console.log(editorConfiguration);

  return (
    <div className={`sa-ck ${readOnly ? 'sa-viewer' : 'sa-editor'}`}>
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        data={text}
        disabled={readOnly}
        onReady={editor => {
          // You can store the "editor" and use when it is needed.
          console.log(Array.from( editor.ui.componentFactory.names() ));
          console.log('Editor is ready to use!', editor);
        }}
        onChange={(event, editor) => {
          // const data = editor.getData();
          console.log(event);
          setText(editor.getData());
          // console.log({ event, editor, data });
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
