const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const jsdom = require("jsdom/lib/old-api");

let app = express();
const port = process.env.PORT;

app.use(bodyParser.json());
app.use(cors());

app.post('/blog', (req, res) => {

  let body = _.pick(req.body, ['html', 'changes']);

  if (body.changes === "" || body.changes == null) {
    res.send({blog: body.html});
    return;
  }

  function tweakIt(html, changes, callback) {
    jsdom.env({
      html: '<div id="editor-container"></div>',
      scripts: [
        'https://cdnjs.cloudflare.com/ajax/libs/webcomponentsjs/0.7.22/MutationObserver.js',
        'https://cdn.quilljs.com/1.0.4/quill.js'],
      onload: function (window) {
        let document = window.document;
        document.getSelection = function () {
          return {
            getRangeAt: function () {
            }
          };
        };
        let container = window.document.getElementById("editor-container");
        let quill = new window.Quill(container, {});

        quill.clipboard.dangerouslyPasteHTML(0, html);
        let quill_contents = quill.getContents();
        quill_contents = quill_contents.compose(changes);
        quill.setContents(quill_contents);

        callback(document.querySelector(".ql-editor").innerHTML);
      }
    });
  }

  console.log((body.changes));
  tweakIt(body.html, JSON.parse(body.changes), function (blog) {
    res.send({blog});
  });

});

app.listen(port, () => {

  console.log(`Started up at port ${port}`);
});

module.exports = {app};
