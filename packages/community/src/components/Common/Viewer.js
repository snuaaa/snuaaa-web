import React from 'react';

import CKEditor from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import Strikethrough from '@ckeditor/ckeditor5-basic-styles/src/strikethrough';
import Underline from '@ckeditor/ckeditor5-basic-styles/src/underline';
import List from '@ckeditor/ckeditor5-list/src/list';
import TodoList from '@ckeditor/ckeditor5-list/src/todolist';

import Indent from '@ckeditor/ckeditor5-indent/src/indent';
import IndentBlock from '@ckeditor/ckeditor5-indent/src/indentblock';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote';

import Image from '@ckeditor/ckeditor5-image/src/image';
import ImageStyle from '@ckeditor/ckeditor5-image/src/imagestyle';
import ImageCaption from '@ckeditor/ckeditor5-image/src/imagecaption';
import ImageResize from '@ckeditor/ckeditor5-image/src/imageresize';
// import FileRepository from '@ckeditor/ckeditor5-upload/src/filerepository';

import Table from '@ckeditor/ckeditor5-table/src/table';



const editorConfiguration = {
  plugins: [
    Essentials, Heading, Paragraph,
    Bold, Italic, Strikethrough, Underline, List, TodoList,
    Indent, IndentBlock, BlockQuote,
    Image, ImageResize, ImageCaption, ImageStyle,
    Table],
};


function Viewer({ text }) {

  return (
    <div className="sa-ck sa-viewer">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfiguration}
        disabled={true}
        data={text}
      />
    </div>
  );
}

export default Viewer;
