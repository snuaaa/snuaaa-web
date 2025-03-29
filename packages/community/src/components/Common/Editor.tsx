/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';

import { Editor as CustomEditor, Viewer as CustomViewer } from '@snuaaa/editor';
import UploadService from '~/services/UploadService';

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
        editor={readOnly ? CustomViewer : CustomEditor}
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
